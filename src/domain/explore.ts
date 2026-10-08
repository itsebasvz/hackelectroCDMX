import { evaluateScenario } from './evaluate';
import type { Scenario, Result, Month } from './schema';

export type SensitivityVariable = 'cycles' | 'consumption' | 'electricityPrice';
export const sensitivityVariables = {
  cycles: { label: 'Vueltas diarias', unit: 'vueltas/unidad/día', path: 'operation.cycles' },
  consumption: { label: 'Consumo eléctrico', unit: 'kWh/km en batería', path: 'ev.consumption' },
  electricityPrice: {
    label: 'Precio de electricidad',
    unit: 'MXN/kWh comprado',
    path: 'energy.electricityPrice',
  },
} as const;
export interface SensitivityPoint {
  value: number;
  km: number;
  batteryKwh: number;
  usableKwh: number;
  gridKwh: number;
  chargeHours: number;
  chargeWindow: number;
  iceMargin: number;
  evMargin: number;
  constraints: Result['constraints'];
  failures: string[];
}
export interface SensitivitySeries {
  variable: SensitivityVariable;
  current: number;
  points: SensitivityPoint[];
}
export function exploredValue(s: Scenario, variable: SensitivityVariable) {
  return variable === 'cycles'
    ? s.operation.cycles
    : variable === 'consumption'
      ? s.ev.consumption
      : s.energy.electricityPrice;
}
/** Cambia exactamente una entrada; no modifica ingresos ni cargos fijos o de potencia. */
export function explorationScenario(
  s: Scenario,
  variable: SensitivityVariable,
  value: number,
): Scenario {
  if (variable === 'cycles') return { ...s, operation: { ...s.operation, cycles: value } };
  if (variable === 'consumption') return { ...s, ev: { ...s.ev, consumption: value } };
  return { ...s, energy: { ...s.energy, electricityPrice: value } };
}
export function explorationRange(s: Scenario, variable: SensitivityVariable): number[] {
  const current = exploredValue(s, variable);
  if (variable === 'cycles')
    return Array.from({ length: Math.min(100, Math.max(12, 2 * current)) }, (_, i) => i + 1);
  const min = variable === 'consumption' ? 0.01 : 0;
  const max = variable === 'consumption' ? 100 : 1000;
  const low = Math.max(min, current * 0.5);
  const high = Math.min(max, variable === 'electricityPrice' && current === 0 ? 8 : current * 1.5);
  const values = Array.from({ length: 11 }, (_, i) => low + ((high - low) * i) / 10);
  // El punto central es exactamente la entrada, sin un duplicado por redondeo binario.
  if (low === current * 0.5 && high === current * 1.5) values[5] = current;
  return [...new Set([...values, current])].sort((a, b) => a - b);
}
/** Todos los puntos usan el evaluador. Cede el worker para recibir cancelaciones. */
export async function sensitivity(
  s: Scenario,
  cancelled: () => boolean = () => false,
): Promise<SensitivitySeries[] | null> {
  const series: SensitivitySeries[] = [];
  let count = 0;
  for (const variable of Object.keys(sensitivityVariables) as SensitivityVariable[]) {
    const points: SensitivityPoint[] = [];
    for (const value of explorationRange(s, variable)) {
      if (cancelled()) return null;
      const r = evaluateScenario(explorationScenario(s, variable, value));
      points.push({
        value,
        km: r.dailyKm,
        batteryKwh: r.dailyBatteryKwh,
        usableKwh: r.usableKwh,
        gridKwh: r.dailyGridKwh,
        chargeHours: r.charge.hours,
        chargeWindow: s.energy.chargeHours,
        iceMargin: r.ice.minMonthlyCash,
        evMargin: r.ev.minMonthlyCash,
        constraints: r.constraints,
        failures: r.constraints.filter((c) => c.status === 'fail').map((c) => c.id),
      });
      if (++count % 4 === 0) await new Promise<void>((resolve) => setTimeout(resolve, 0));
    }
    series.push({ variable, current: exploredValue(s, variable), points });
  }
  return cancelled() ? null : series;
}
export function energyBudget(r: Result) {
  return {
    service: r.serviceKm * r.scenario.ev.consumption,
    additional: (r.dailyKm - r.serviceKm) * r.scenario.ev.consumption,
    available: r.usableKwh,
    margin: r.usableKwh - r.dailyBatteryKwh,
    reserve: r.scenario.ev.batteryKwh * r.scenario.energy.soh * r.scenario.energy.socMin,
  };
}
/** Residuo contable: provisión + reposición no cubierta, nunca saldo acumulado. */
export function monthlyBudget(m: Month) {
  return {
    operating: m.operating,
    workers: m.workerCost,
    owner: m.ownerIncome,
    payment: m.payment,
    reserve:
      Math.round(
        (m.revenue - m.operating - m.workerCost - m.ownerIncome - m.payment - m.freeCash) * 100,
      ) / 100,
    margin: m.freeCash,
    revenue: m.revenue,
  };
}

export interface BudgetPhase {
  startMonth: number;
  endMonth: number;
}

/** Agrupa meses consecutivos con el mismo flujo visible a pesos enteros y separa reposiciones. */
export function groupBudgetPhases(iceMonths: Month[], evMonths: Month[]): BudgetPhase[] {
  const count = Math.min(iceMonths.length, evMonths.length);
  if (count === 0) return [];

  const signature = (month: Month) => {
    const budget = monthlyBudget(month);
    const amounts = [
      budget.revenue,
      budget.operating,
      budget.workers,
      budget.owner,
      budget.payment,
      budget.reserve,
      budget.margin,
    ].map((amount) => Math.round(amount));
    return [...amounts, Number(month.replacement > 0)];
  };
  const iceSignatures = iceMonths.slice(0, count).map(signature);
  const evSignatures = evMonths.slice(0, count).map(signature);
  const sameFlow = (indexA: number, indexB: number) =>
    iceSignatures[indexA]!.every((value, index) => value === iceSignatures[indexB]![index]) &&
    evSignatures[indexA]!.every((value, index) => value === evSignatures[indexB]![index]);

  const phases: BudgetPhase[] = [];
  let start = 0;
  for (let index = 1; index <= count; index++) {
    if (index < count && sameFlow(index - 1, index)) continue;
    phases.push({
      startMonth: iceMonths[start]!.month,
      endMonth: iceMonths[index - 1]!.month,
    });
    start = index;
  }
  return phases;
}
