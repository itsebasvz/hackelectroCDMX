import { describe, it, expect } from 'vitest';
import { defaultScenario } from '../data/defaults';
import { evaluateScenario } from './evaluate';
import { monthlyBudget } from './explore';
import {
  cashSummary,
  paymentCapacity,
  cashBridge,
  financialAnalysis,
  revenueStress,
  revenueStressScenario,
} from './financialAnalysis';
import type { Month } from './schema';
const cents = (v: number) => Math.round(v * 100);

describe('capacidad de pago y puente de caja', () => {
  it.each(['cash', 'credit36', 'credit84', 'lease'])(
    'reconcilia al centavo todos los meses: %s',
    (kind) => {
      const s = defaultScenario();
      s.finance = s.catalog.finances.find((f) =>
        kind.startsWith('credit')
          ? f.kind === 'credit' && f.months === Number(kind.slice(6))
          : f.kind === kind,
      )!;
      s.economy.batteryReplacementMonth = 24;
      s.economy.batteryReplacementCost = 500000;
      const r = evaluateScenario(s);
      for (const [index, a] of financialAnalysis(r).entries()) {
        const ice = r.ice.months[index]!,
          ev = r.ev.months[index]!;
        for (const [m, capacity] of [
          [ice, a.ice],
          [ev, a.ev],
        ] as const) {
          const b = monthlyBudget(m);
          expect(cents(b.revenue)).toBe(
            [b.operating, b.workers, b.owner, b.payment, b.reserve, b.margin].reduce(
              (sum, v) => sum + cents(v),
              0,
            ),
          );
          expect(cents(capacity.available) - cents(capacity.payment)).toBe(cents(m.freeCash));
        }
        expect(
          cents(a.bridge.start) +
            a.bridge.contributions.reduce((sum, c) => sum + cents(c.amount), 0),
        ).toBe(cents(ev.freeCash));
        expect(a.bridge.end).toBe(ev.freeCash);
        expect(a.bridge.contributions.map((c) => c.label)).toHaveLength(3);
      }
      if (kind === 'credit36') {
        expect(r.ev.months[36]!.payment).toBe(0);
        expect(r.ev.debtRemaining).toBe(0);
      }
      if (kind === 'credit84') expect(r.ev.debtRemaining).toBeGreaterThan(0);
      if (kind === 'cash') expect(r.ev.months.every((m) => m.payment === 0)).toBe(true);
      if (kind === 'lease') {
        expect(s.finance.maintenanceIncluded).toBe(true);
        expect(r.ev.debtRemaining).toBe(0);
        expect(r.ev.months[59]!.payment).toBe(s.finance.leasePerUnitMonth * s.operation.fleet);
      }
    },
  );
  it('distingue holgura positiva, caja cero, déficit previo al pago y recaudo cero', () => {
    const base = evaluateScenario(defaultScenario()).ev.months[0]!;
    expect(paymentCapacity({ ...base, freeCash: 20, revenue: 100 })).toMatchObject({
      available: base.payment + 20,
      revenueCushionPercent: 20,
    });
    expect(paymentCapacity({ ...base, freeCash: 0 }).revenueCushionPercent).toBeNull();
    const deficit = paymentCapacity({ ...base, payment: 100, freeCash: -200 });
    expect(deficit).toMatchObject({ available: -100, cash: -200, revenueCushionPercent: null });
    expect(paymentCapacity({ ...base, revenue: 0, freeCash: 20 }).revenueCushionPercent).toBeNull();
    const s = defaultScenario();
    s.operation.fare = 0;
    s.economy.laborCost = 1;
    const r = evaluateScenario(s);
    expect(r.constraints.find((c) => c.id === 'income')?.status).toBe('fail');
    expect(cashSummary(r.ev.months).deficitMonths).toBe(60);
  });
  it('elige primer empate y cuenta sólo meses negativos', () => {
    expect(
      cashSummary([
        { month: 1, freeCash: 0 },
        { month: 2, freeCash: -0.01 },
        { month: 3, freeCash: -0.01 },
      ]),
    ).toEqual({ minimum: -0.01, month: 2, deficitMonths: 2 });
    expect(
      cashSummary([
        { month: 1, freeCash: 0 },
        { month: 2, freeCash: 10 },
      ]),
    ).toEqual({ minimum: 0, month: 1, deficitMonths: 0 });
  });
  it('incluye partidas adicionales sólo cuando cambian', () => {
    const m = evaluateScenario(defaultScenario()).ice.months[0]!;
    const changed: Month = {
      ...m,
      revenue: m.revenue + 10,
      workerCost: m.workerCost + 20,
      ownerIncome: m.ownerIncome - 30,
      freeCash: m.freeCash + 20,
    };
    const b = cashBridge(m, changed);
    expect(b.contributions.slice(3).map((c) => c.amount)).toEqual([10, -20, 30]);
    expect(b.end).toBe(changed.freeCash);
  });
  it.each([1000, 500000])('separa provisión, cobertura y faltante de reposición %s', (cost) => {
    const s = defaultScenario();
    s.economy.batteryReplacementMonth = 24;
    s.economy.batteryReplacementCost = cost;
    const r = evaluateScenario(s),
      a = financialAnalysis(r)[23]!;
    const available =
      (s.economy.initialReserve + s.economy.monthlyReserve * 24) * s.operation.fleet;
    const replacement = cost * s.operation.fleet;
    expect(a.reserve).toEqual({
      provision: s.economy.monthlyReserve * s.operation.fleet,
      balance: Math.max(0, available - replacement),
      replacement,
      covered: Math.min(available, replacement),
      shortfall: Math.max(0, replacement - available),
    });
    if (cost > 1000) expect(cashSummary(r.ev.months).month).toBe(24);
    else
      expect(cashSummary(r.ev.months).minimum).toBe(
        evaluateScenario(defaultScenario()).ev.minMonthlyCash,
      );
    expect(financialAnalysis(r)[22]!.reserve.shortfall).toBe(0);
  });
});

describe('prueba temporal de recaudo', () => {
  it('los 31 puntos equivalen al evaluador y cambian sólo ascensos', async () => {
    const s = defaultScenario(),
      original = structuredClone(s);
    s.economy.batteryReplacementMonth = 24;
    s.economy.batteryReplacementCost = 500000;
    const points = (await revenueStress(s))!;
    expect(points.map((p) => p.dropPercent)).toEqual(Array.from({ length: 31 }, (_, i) => i));
    for (const p of points) {
      const input = revenueStressScenario(s, p.dropPercent);
      expect({
        ...input,
        operation: { ...input.operation, boardings: s.operation.boardings },
      }).toEqual(s);
      const r = evaluateScenario(input);
      for (const key of ['ice', 'ev'] as const)
        expect(p[key]).toEqual({
          summary: cashSummary(r[key].months),
          months: r[key].months.map(({ month, freeCash }) => ({ month, freeCash })),
        });
    }
    expect(s.operation).toEqual(original.operation);
    expect(points[0]!.ev.summary.minimum).toBe(evaluateScenario(s).ev.minMonthlyCash);
    expect(points[30]!.ev.months[23]!.freeCash).toBeLessThan(points[0]!.ev.months[23]!.freeCash);
    expect(() => revenueStressScenario(s, 31)).toThrow();
  });
  it('recaudo cero permanece cero y permite cancelar antes y entre lotes', async () => {
    const s = defaultScenario();
    s.operation.boardings = 0;
    const points = (await revenueStress(s))!;
    expect(points[0]!.ev).toEqual(points[30]!.ev);
    expect(await revenueStress(s, () => true)).toBeNull();
    let cancel = false;
    const pending = revenueStress(s, () => cancel);
    cancel = true;
    expect(await pending).toBeNull();
  });
});
