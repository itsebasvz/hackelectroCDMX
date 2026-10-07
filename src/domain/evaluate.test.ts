import { describe, it, expect } from 'vitest';
import { defaultScenario, preset } from '../data/defaults';
import { evaluateScenario } from './evaluate';
import { monthlyPayment } from './finance';
import { findConditions, SearchCancelled } from './optimize';
import { ScenarioSchema } from './schema';
describe('energía y servicio', () => {
  it('separa batería, medidor y reserva sin regeneración doble', () => {
    const s = defaultScenario();
    s.ev.consumption = 90 / (s.route.cycleKm * s.operation.cycles * 1.05);
    const r = evaluateScenario(s);
    expect(r.dailyBatteryKwh).toBeCloseTo(90);
    expect(r.dailyGridKwh).toBeCloseTo(100);
    expect(r.usableKwh).toBeCloseTo(70.479 * 0.9 * (0.9 - 0.15));
    expect(r.constraints.find((c) => c.id === 'battery')?.status).toBe('fail');
  });
  it('recupera el SOC diariamente y detecta carga insuficiente', () => {
    const s = defaultScenario();
    const r = evaluateScenario(s);
    expect(r.charge.gridKwhFleet).toBeCloseTo(r.dailyGridKwh * 3);
    expect(r.charge.hours).toBeLessThan(8);
    s.chargerCount = 1;
    expect(evaluateScenario(s).constraints.find((c) => c.id === 'charging')?.status).toBe('fail');
  });
  it('limita la potencia y no simula carga sin conexión', () => {
    const s = defaultScenario();
    s.energy.siteKw = 5;
    expect(evaluateScenario(s).charge.hours).toBe(Infinity);
    s.energy.siteKw = 12;
    expect(evaluateScenario(s).charge.peakKw).toBeLessThanOrEqual(7);
  });
  it('conector incompatible y capacidad insuficiente impiden cumplir', () => {
    const s = defaultScenario();
    s.ev.connector = 'CCS2';
    s.charger.connector = 'AC2';
    s.ev.capacity = 14;
    const r = evaluateScenario(s);
    expect(r.constraints.filter((c) => c.status === 'fail').map((c) => c.id)).toEqual(
      expect.arrayContaining(['connector', 'capacity']),
    );
  });
  it('el autobús estándar mantiene la demanda y personal', () => {
    const s = defaultScenario();
    const large = preset(s, 'urban');
    expect(large.operation.boardings).toBe(s.operation.boardings);
    expect(large.operation.operators).toBe(s.operation.operators);
    expect(large.ev.capacity).toBe(84);
  });
  it('rechaza NaN, datos negativos, SOC invertido y ventanas imposibles', () => {
    for (const edit of [
      (s: ReturnType<typeof defaultScenario>) => (s.energy.soh = NaN),
      (s: ReturnType<typeof defaultScenario>) => (s.economy.laborCost = -1),
      (s: ReturnType<typeof defaultScenario>) => (s.energy.socMin = 0.95),
      (s: ReturnType<typeof defaultScenario>) => (s.energy.chargeHours = 12),
    ]) {
      const s = defaultScenario();
      edit(s);
      expect(ScenarioSchema.safeParse(s).success).toBe(false);
    }
  });
});
describe('finanzas y protección del ingreso', () => {
  it('amortiza un crédito sin interés', () => expect(monthlyPayment(120000, 0, 60)).toBe(2000));
  it('no suma el principal dos veces al costo económico', () => {
    const s = defaultScenario();
    s.finance.annualRate = 0;
    const r = evaluateScenario(s);
    expect(r.ev.economicCost).toBeCloseTo(
      r.ev.capex + (r.ev.operatingMonth + r.ev.months[0]!.workerCost) * 60,
    );
    expect(r.ev.debtRemaining).toBeLessThan(0.1);
    expect(r.ev.reserveEnd).toBe(60000 * 3 + 1000 * 3 * 60);
  });
  it('informa deuda pendiente fuera del horizonte', () => {
    const s = defaultScenario();
    s.finance = s.catalog.finances.find((f) => f.id === 'credit84')!;
    expect(evaluateScenario(s).ev.debtRemaining).toBeGreaterThan(0);
  });
  it('no duplica mantenimiento incluido ni usa apoyo para reducir renta', () => {
    const s = defaultScenario();
    s.finance = s.catalog.finances.find((f) => f.id === 'lease')!;
    const a = evaluateScenario(s);
    s.ev.maintenancePerKm = 20;
    s.economy.support = 1_000_000;
    const b = evaluateScenario(s);
    expect(a.ev.operatingMonth).toBe(b.ev.operatingMonth);
    expect(a.ev.payment).toBe(b.ev.payment);
    expect(b.ev.residual).toBe(0);
  });
  it('conserva costo económico aunque la aportación cambie flujo', () => {
    const s = defaultScenario();
    s.finance = s.catalog.finances[0]!;
    const a = evaluateScenario(s);
    s.economy.support = 100000;
    const b = evaluateScenario(s);
    expect(a.ev.economicCost).toBe(b.ev.economicCost);
    expect(a.ev.upfront - b.ev.upfront).toBe(100000);
  });
  it('reserva cubre un reemplazo y éste se registra como costo una vez', () => {
    const s = defaultScenario();
    const a = evaluateScenario(s);
    s.economy.batteryReplacementMonth = 12;
    s.economy.batteryReplacementCost = 20000;
    const b = evaluateScenario(s);
    expect(b.ev.economicCost - a.ev.economicCost).toBe(60000);
    expect(a.ev.reserveEnd - b.ev.reserveEnd).toBe(60000);
  });
});
describe('búsqueda explicable', () => {
  it('encuentra apoyo mínimo al centavo sin cambiar servicio', async () => {
    const s = defaultScenario();
    s.economy.ownCapital = 0;
    s.catalog.vehicles = [s.ice, s.ev];
    s.catalog.chargers = [s.charger];
    s.catalog.finances = [s.finance];
    const r = await findConditions(s);
    expect(r.alternatives.length).toBeGreaterThan(0);
    const a = r.alternatives[0]!;
    expect(a.result.passes).toBe(true);
    expect(a.scenario.operation).toEqual(s.operation);
    const less = structuredClone(a.scenario);
    less.economy.support = a.support - 0.01;
    expect(evaluateScenario(less).passes).toBe(false);
  });
  it('no rescata déficit recurrente con aportación inicial', async () => {
    const s = defaultScenario();
    s.operation.boardings = 0;
    const r = await findConditions(s);
    expect(r.alternatives).toHaveLength(0);
    expect(r.rejected.monthly).toBeGreaterThan(0);
  });
  it('es determinista y cancela sin devolver recomendaciones parciales', async () => {
    const s = defaultScenario();
    const a = await findConditions(s);
    const b = await findConditions(s);
    expect(a.alternatives.map((x) => [x.support, x.scenario.ev.id, x.scenario.finance.id])).toEqual(
      b.alternatives.map((x) => [x.support, x.scenario.ev.id, x.scenario.finance.id]),
    );
    await expect(findConditions(s, { cancelled: () => true })).rejects.toBeInstanceOf(
      SearchCancelled,
    );
  });
  it('no trunca combinaciones cuando supera el límite', async () => {
    const s = defaultScenario();
    s.operation.fleet = 100;
    s.catalog.finances = Array.from({ length: 50 }, (_, i) => ({ ...s.finance, id: `f${i}` }));
    const r = await findConditions(s);
    expect(r.limitExceeded).toBe(true);
    expect(r.tested).toBe(0);
  });
});

// Casos independientes de asignación: evita imponer un orden que infle el apoyo.
import { allocateCapital } from './finance';
it('distribuye aportación y capital respetando enganche y comisiones', () => {
  const a = allocateCapital(1000, 100, 100, 300, 0.2, 0);
  expect(a).toMatchObject({ supportFixed: 0, supportCapital: 100, principal: 700, upfront: 300 });
  const b = allocateCapital(1000, 100, 100, 200, 0.2, 0);
  expect(b).toMatchObject({ supportFixed: 100, supportCapital: 0, principal: 800, upfront: 200 });
  const c = allocateCapital(1000, 100, 0, 1000, 0.2, 0.1);
  expect(c.principal).toBe(111.11);
  expect(c.upfront).toBeLessThanOrEqual(1000);
  const d = allocateCapital(1000, 100, 0, 2000, 0.2, 0);
  expect(d.principal).toBe(0);
  expect(d.upfront).toBe(1100);
});
it('asignación coincide con enumeración exhaustiva independiente en centavos', () => {
  for (const E of [100, 140])
    for (const F of [20, 35])
      for (const S of [0, 20, 50, 180])
        for (const B of [0, 50, 200])
          for (const down of [0.2, 0.5])
            for (const fee of [0, 0.1]) {
              let best = Infinity;
              for (let fixedSupport = 0; fixedSupport <= Math.min(S, F); fixedSupport++) {
                const eligible = Math.max(0, E - Math.max(0, S - fixedSupport));
                for (let loan = 0; loan <= Math.floor(eligible * (1 - down)); loan++) {
                  const cash = F - fixedSupport + eligible - loan + Math.round(loan * fee);
                  if (cash <= B) best = Math.min(best, loan);
                }
              }
              const actual = allocateCapital(E / 100, F / 100, S / 100, B / 100, down, fee);
              if (Number.isFinite(best)) {
                expect(actual.principal).toBe(best / 100);
                expect(actual.upfront).toBeLessThanOrEqual(B / 100);
              } else expect(actual.upfront).toBeGreaterThan(B / 100);
            }
});
it('tasas diminutas siguen siendo finitas y apoyo de contado se aplica completo', () => {
  expect(monthlyPayment(120000, 1e-20, 60)).toBe(2000);
  expect(allocateCapital(0, 1000, 900, 500, 1, 0)).toMatchObject({
    upfront: 100,
    supportFixed: 900,
    unappliedSupport: 0,
  });
});
