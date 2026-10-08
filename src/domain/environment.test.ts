import { expect, it } from 'vitest';
import { defaultScenario } from '../data/defaults';
import { evaluateScenario } from './evaluate';
import { environmentalView } from './environment';
it('convierte unidad/flota y día/mes/año, con componentes reconciliados y escape eléctrico cero', () => {
  for (const efficiency of [1, 0.9, 0.5])
    for (const gridFactor of [0, 0.444, 0.8]) {
      const s = defaultScenario();
      s.operation.fleet = 5;
      s.operation.days = 22;
      s.energy.efficiency = efficiency;
      s.energy.gridFactor = gridFactor;
      const r = evaluateScenario(s);
      for (const scope of ['unit', 'fleet'] as const)
        for (const period of ['day', 'month', 'year'] as const) {
          const expectedScale =
            (scope === 'fleet' ? 5 : 1) * (period === 'day' ? 1 : period === 'month' ? 22 : 264);
          const view = environmentalView(r, scope, period);
          expect(view.liters).toBeCloseTo(r.dailyLiters * expectedScale);
          expect(view.tailpipeCO2Kg).toBeCloseTo(r.emissions.iceCO2KgDay * expectedScale);
          expect(view.electricTailpipeCO2Kg).toBe(0);
          expect(view.parts.reduce((a, p) => a + p.co2eKg, 0)).toBeCloseTo(view.electricityCO2eKg);
          expect(view.parts.reduce((a, p) => a + p.kwh, 0)).toBeCloseTo(view.gridKwh);
          if (efficiency === 1) expect(view.parts[2]!.kwh).toBe(0);
        }
    }
});
