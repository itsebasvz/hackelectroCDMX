import { describe, it, expect } from 'vitest';
import { defaultScenario } from '../data/defaults';
import { evaluateScenario } from './evaluate';
import {
  sensitivity,
  explorationScenario,
  explorationRange,
  monthlyBudget,
  energyBudget,
  groupBudgetPhases,
} from './explore';
import {
  batteryLimit,
  consumptionAt,
  positionOnTrace,
  traceSegments,
  nearestFraction,
} from './geometry';
import type { FeatureCollection, LineString } from 'geojson';
import type { Month } from './schema';

const sampleMonth = (month: number, changes: Partial<Month> = {}): Month => ({
  month,
  revenue: 1000,
  operating: 200,
  workerCost: 100,
  ownerIncome: 100,
  payment: 200,
  interest: 20,
  principal: 180,
  balance: 2000 - month * 180,
  reserve: 100,
  freeCash: 300,
  replacement: 0,
  ...changes,
});

describe('exploración explicable', () => {
  it('reconcilia presupuesto mensual, incluida reposición y cierre de crédito', () => {
    const s = defaultScenario();
    s.economy.batteryReplacementMonth = 36;
    s.economy.batteryReplacementCost = 200000;
    s.finance = s.catalog.finances.find((f) => f.kind === 'credit' && f.months === 36)!;
    const r = evaluateScenario(s);
    for (const f of [r.ice, r.ev])
      for (const m of f.months) {
        const b = monthlyBudget(m);
        expect(b.operating + b.workers + b.owner + b.payment + b.reserve + b.margin).toBeCloseTo(
          b.revenue,
          2,
        );
        expect(b.reserve).toBeGreaterThanOrEqual(0);
      }
  });
  it('separa energía de servicio, adicionales, reserva y déficit', () => {
    const r = evaluateScenario(defaultScenario());
    const b = energyBudget(r);
    expect(b.service + b.additional).toBeCloseTo(r.dailyBatteryKwh);
    expect(b.margin + r.dailyBatteryKwh).toBeCloseTo(r.usableKwh);
    expect(consumptionAt(r, r.scenario.operation.cycles, 1).kwh).toBeCloseTo(r.dailyBatteryKwh);
  });
  it('agrupa flujos iguales pese a la amortización y separa reposición y fin de cuota', () => {
    const ice = Array.from({ length: 5 }, (_, index) =>
      sampleMonth(index + 1, {
        interest: 30 - index * 3,
        principal: 170 + index * 3,
        balance: 2000 - index * 170,
        ...(index === 1 ? { payment: 200.4, freeCash: 299.6 } : {}),
      }),
    );
    const ev = ice.map((m) => ({ ...m }));
    ev[2] = sampleMonth(3, { replacement: 120 });
    ice[4] = sampleMonth(5, { payment: 0, freeCash: 500 });
    ev[4] = sampleMonth(5, { payment: 0, freeCash: 500 });

    expect(groupBudgetPhases(ice, ev)).toEqual([
      { startMonth: 1, endMonth: 2 },
      { startMonth: 3, endMonth: 3 },
      { startMonth: 4, endMonth: 4 },
      { startMonth: 5, endMonth: 5 },
    ]);
  });
  it('sensibilidad usa el evaluador, conserva recaudo y alcanza umbrales', async () => {
    const s = defaultScenario();
    const points = (await sensitivity(s))!.find((series) => series.variable === 'cycles')!.points;
    expect(points).toHaveLength(16);
    const base = points.find((p) => p.value === s.operation.cycles)!;
    const r = evaluateScenario(s);
    expect(base.evMargin).toBe(r.ev.minMonthlyCash);
    expect(base.batteryKwh).toBe(r.dailyBatteryKwh);
    expect(points.at(-1)!.failures).toContain('battery');
    expect(await sensitivity(s, () => true)).toBeNull();
  });
  it('tres series equivalentes al evaluador cambian una sola entrada y conservan recaudo', async () => {
    const s = defaultScenario();
    const baseline = evaluateScenario(s);
    const series = (await sensitivity(s))!;
    expect(series.map((x) => x.variable)).toEqual(['cycles', 'consumption', 'electricityPrice']);
    for (const data of series) {
      expect(data.points.some((p) => p.value === data.current)).toBe(true);
      expect(new Set(data.points.map((p) => p.value)).size).toBe(data.points.length);
      for (const point of data.points) {
        const input = explorationScenario(s, data.variable, point.value);
        const restored = explorationScenario(input, data.variable, data.current);
        expect(restored).toEqual(s);
        const r = evaluateScenario(input);
        expect(point).toMatchObject({
          km: r.dailyKm,
          batteryKwh: r.dailyBatteryKwh,
          usableKwh: r.usableKwh,
          gridKwh: r.dailyGridKwh,
          chargeHours: r.charge.hours,
          iceMargin: r.ice.minMonthlyCash,
          evMargin: r.ev.minMonthlyCash,
          constraints: r.constraints,
        });
        expect(r.ev.months.map((m) => m.revenue)).toEqual(baseline.ev.months.map((m) => m.revenue));
        if (data.variable === 'electricityPrice') {
          expect(r.charge).toEqual(baseline.charge);
          expect(input.energy.demandPrice).toBe(s.energy.demandPrice);
          expect(input.energy.fixedElectricity).toBe(s.energy.fixedElectricity);
        }
      }
    }
  });
  it('respeta límites y precio cero, y conserva consumo actual exacto', async () => {
    const s = defaultScenario();
    s.energy.electricityPrice = 0;
    expect(explorationRange(s, 'electricityPrice')).toHaveLength(11);
    expect(explorationRange(s, 'electricityPrice').at(-1)).toBe(8);
    for (const consumption of [0.01, 0.123456789, 100]) {
      s.ev.consumption = consumption;
      const range = explorationRange(s, 'consumption');
      expect(range).toContain(consumption);
      expect(Math.min(...range)).toBeGreaterThanOrEqual(0.01);
      expect(Math.max(...range)).toBeLessThanOrEqual(100);
    }
    s.operation.cycles = 100;
    expect(explorationRange(s, 'cycles')).toHaveLength(100);
    s.energy.electricityPrice = 1000;
    expect(Math.max(...explorationRange(s, 'electricityPrice'))).toBe(1000);
  });
  it('sin potencia y capital, ningún punto favorable; cancelación entre lotes', async () => {
    const s = defaultScenario();
    s.energy.siteKw = 0;
    s.economy.ownCapital = 0;
    s.operation.fare = 0;
    const series = (await sensitivity(s))!;
    for (const data of series)
      for (const p of data.points) {
        expect(p.chargeHours).toBe(Infinity);
        expect(p.failures).toEqual(expect.arrayContaining(['charging', 'initial', 'monthly']));
        expect(p.evMargin).toBeLessThan(0);
      }
    let checks = 0;
    expect(await sensitivity(s, () => ++checks > 5)).toBeNull();
  });
  it('no cuenta ni dibuja saltos entre trazos; posición y selección son reversibles', () => {
    const fc: FeatureCollection<LineString> = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: [
              [0, 0],
              [0, 1],
            ],
          },
        },
        {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: [
              [10, 10],
              [10, 11],
            ],
          },
        },
      ],
    };
    expect(traceSegments(fc)).toHaveLength(2);
    expect(positionOnTrace(fc, 0.75)!.trace).toBe(2);
    const p = positionOnTrace(fc, 0.75)!;
    expect(nearestFraction(fc, p.coordinates)).toBeCloseTo(0.75, 5);
  });
  it('asigna el límite al final de una vuelta y distingue límites fuera del día', () => {
    const s = defaultScenario();
    const base = evaluateScenario(s);
    s.ev.consumption = base.usableKwh / ((base.dailyKm / s.operation.cycles) * 2);
    const r = evaluateScenario(s);
    expect(batteryLimit(r)).toMatchObject({ cycle: 2, fraction: 1, withinDay: true });
    expect(consumptionAt(r, 2, 1).soc).toBeCloseTo(s.energy.socMin);
    s.operation.cycles = 1;
    expect(batteryLimit(evaluateScenario(s)).withinDay).toBe(false);
    s.operation.cycles = 2;
    expect(batteryLimit(evaluateScenario(s))).toMatchObject({
      cycle: 2,
      fraction: 1,
      withinDay: true,
    });
  });
  it('ubica el umbral de reserva y escala el ciclo editado sin energía gratuita', () => {
    const s = defaultScenario();
    s.route.cycleKm = 25;
    s.operation.cycles = 16;
    const r = evaluateScenario(s);
    const limit = batteryLimit(r);
    expect(limit.withinDay).toBe(true);
    const p = consumptionAt(r, limit.cycle, limit.fraction);
    expect(p.soc).toBeCloseTo(s.energy.socMin, 9);
    expect(p.kwh).toBeCloseTo(r.usableKwh, 9);
    expect(consumptionAt(r, 16, 1).km).toBe(r.dailyKm);
    expect(consumptionAt(r, 16, 1).soc).toBeLessThan(s.energy.socMin);
  });
});
