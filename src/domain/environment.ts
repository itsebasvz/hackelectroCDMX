import type { Result } from './schema';
import { energyBudget } from './explore';
export type EnvironmentalScope = 'unit' | 'fleet';
export type EnvironmentalPeriod = 'day' | 'month' | 'year';
/** Transformaciones de resultados diarios, sin cambiar factores ni simular degradación. */
export function environmentalView(
  r: Result,
  scope: EnvironmentalScope,
  period: EnvironmentalPeriod,
) {
  const units = scope === 'fleet' ? r.scenario.operation.fleet : 1;
  const days = period === 'day' ? 1 : r.scenario.operation.days * (period === 'year' ? 12 : 1);
  const scale = units * days;
  const energy = energyBudget(r);
  const factor = r.scenario.energy.gridFactor;
  const parts = [
    { label: 'Energía para servicio', kwh: energy.service },
    { label: 'Recorridos adicionales', kwh: energy.additional },
    { label: 'Pérdidas de carga', kwh: r.dailyGridKwh - r.dailyBatteryKwh },
  ].map((part) => ({ ...part, kwh: part.kwh * scale, co2eKg: part.kwh * factor * scale }));
  return {
    units,
    days,
    scale,
    parts,
    liters: r.dailyLiters * scale,
    tailpipeCO2Kg: r.emissions.iceCO2KgDay * scale,
    electricTailpipeCO2Kg: 0,
    electricityCO2eKg: r.emissions.evCO2eKgDay * scale,
    gridKwh: r.dailyGridKwh * scale,
  };
}
