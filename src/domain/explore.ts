import { evaluateScenario } from './evaluate';
import type { Scenario, Result, Month } from './schema';

export interface SensitivityPoint {
  cycles: number;
  km: number;
  batteryKwh: number;
  usableKwh: number;
  iceMargin: number;
  evMargin: number;
  failures: string[];
}
/** Cada punto es un escenario completo; el recaudo no crece con las vueltas. */
export async function sensitivity(s: Scenario, cancelled: () => boolean = () => false) {
  const points: SensitivityPoint[] = [];
  const max = Math.min(100, Math.max(12, 2 * s.operation.cycles));
  for (let cycles = 1; cycles <= max; cycles++) {
    if (cancelled()) return null;
    const r = evaluateScenario({ ...s, operation: { ...s.operation, cycles } });
    points.push({
      cycles,
      km: r.dailyKm,
      batteryKwh: r.dailyBatteryKwh,
      usableKwh: r.usableKwh,
      iceMargin: r.ice.minMonthlyCash,
      evMargin: r.ev.minMonthlyCash,
      failures: r.constraints.filter((c) => c.status === 'fail').map((c) => c.id),
    });
    if (cycles % 4 === 0) await new Promise<void>((resolve) => setTimeout(resolve, 0));
  }
  return cancelled() ? null : points;
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
