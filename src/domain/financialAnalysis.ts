import { evaluateScenario } from './evaluate';
import { monthlyBudget } from './explore';
import type { Month, Result, Scenario } from './schema';

const cents = (value: number) => Math.round(value * 100);
export interface CashSummary {
  minimum: number;
  month: number;
  deficitMonths: number;
}
export function cashSummary(months: Pick<Month, 'month' | 'freeCash'>[]): CashSummary {
  const worst = months.reduce((a, b) => (b.freeCash < a.freeCash ? b : a));
  return {
    minimum: worst.freeCash,
    month: worst.month,
    deficitMonths: months.filter((m) => m.freeCash < 0).length,
  };
}
export interface PaymentCapacity {
  available: number;
  payment: number;
  cash: number;
  revenueCushionPercent: number | null;
}
export function paymentCapacity(m: Month): PaymentCapacity {
  return {
    available: (cents(m.freeCash) + cents(m.payment)) / 100,
    payment: m.payment,
    cash: m.freeCash,
    revenueCushionPercent: m.freeCash > 0 && m.revenue > 0 ? (m.freeCash / m.revenue) * 100 : null,
  };
}
export interface CashBridge {
  start: number;
  end: number;
  contributions: { label: string; amount: number; before: number; after: number }[];
}
/** Diferencias en centavos: ahorro positivo libera caja; gasto adicional la absorbe. */
export function cashBridge(ice: Month, ev: Month): CashBridge {
  const a = monthlyBudget(ice),
    b = monthlyBudget(ev);
  const parts = [
    ['Diferencia de operación', cents(a.operating) - cents(b.operating), true],
    ['Diferencia de pagos del activo', cents(a.payment) - cents(b.payment), true],
    ['Diferencia de reserva/reposición', cents(a.reserve) - cents(b.reserve), true],
    ['Diferencia de recaudo', cents(b.revenue) - cents(a.revenue), false],
    ['Diferencia de personal', cents(a.workers) - cents(b.workers), false],
    ['Diferencia de ingreso del concesionario', cents(a.owner) - cents(b.owner), false],
  ] as const;
  let running = cents(ice.freeCash);
  const contributions = parts
    .filter(([, value, always]) => always || value !== 0)
    .map(([label, value]) => {
      const before = running;
      running += value;
      return { label, amount: value / 100, before: before / 100, after: running / 100 };
    });
  return { start: ice.freeCash, end: running / 100, contributions };
}
export interface MonthlyFinancialAnalysis {
  month: number;
  ice: PaymentCapacity;
  ev: PaymentCapacity;
  bridge: CashBridge;
  reserve: {
    provision: number;
    balance: number;
    replacement: number;
    covered: number;
    shortfall: number;
  };
}
export function financialAnalysis(r: Result): MonthlyFinancialAnalysis[] {
  const provision = cents(r.scenario.economy.monthlyReserve * r.scenario.operation.fleet) / 100;
  return r.ev.months.map((m, index) => {
    const obligation = monthlyBudget(m).reserve;
    const shortfall = (cents(obligation) - cents(provision)) / 100;
    return {
      month: m.month,
      ice: paymentCapacity(r.ice.months[index]!),
      ev: paymentCapacity(m),
      bridge: cashBridge(r.ice.months[index]!, m),
      reserve: {
        provision,
        balance: m.reserve,
        replacement: m.replacement,
        covered: (cents(m.replacement) - cents(shortfall)) / 100,
        shortfall,
      },
    };
  });
}
export interface RevenueStressPoint {
  dropPercent: number;
  ice: { months: { month: number; freeCash: number }[]; summary: CashSummary };
  ev: { months: { month: number; freeCash: number }[]; summary: CashSummary };
}
/** Prueba temporal: únicamente reduce ascensos, sin redondearlos a pasajeros enteros. */
export function revenueStressScenario(s: Scenario, dropPercent: number): Scenario {
  if (!Number.isInteger(dropPercent) || dropPercent < 0 || dropPercent > 30)
    throw new Error('Caída fuera del rango de prueba 0–30%.');
  return {
    ...s,
    operation: { ...s.operation, boardings: s.operation.boardings * (1 - dropPercent / 100) },
  };
}
export async function revenueStress(
  s: Scenario,
  cancelled: () => boolean = () => false,
): Promise<RevenueStressPoint[] | null> {
  const points: RevenueStressPoint[] = [];
  for (let dropPercent = 0; dropPercent <= 30; dropPercent++) {
    if (cancelled()) return null;
    const r = evaluateScenario(revenueStressScenario(s, dropPercent));
    const view = (months: Month[]) => ({
      months: months.map(({ month, freeCash }) => ({ month, freeCash })),
      summary: cashSummary(months),
    });
    points.push({ dropPercent, ice: view(r.ice.months), ev: view(r.ev.months) });
    if (dropPercent % 4 === 3) await new Promise<void>((resolve) => setTimeout(resolve, 0));
  }
  return cancelled() ? null : points;
}
