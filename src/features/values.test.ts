import { it, expect } from 'vitest';
import { defaultScenario, preset } from '../data/defaults';
import { withValue } from './values';
it('editar configuración no modifica catálogo aunque haya referencias compartidas', () => {
  const s = defaultScenario();
  s.ev = s.catalog.vehicles[1]!;
  const original = s.catalog.vehicles[1]!.price;
  const changed = withValue(s, 'ev.price', 100);
  expect(changed.ev.price).toBe(100);
  expect(changed.catalog.vehicles[1]!.price).toBe(original);
  expect(s.ev.price).toBe(original);
  expect(changed.ev.evidence.price?.level).toBe('F');
  const selected = preset(s, 'urban');
  const adjusted = withValue(selected, 'ev.consumption', 0.5);
  expect(adjusted.catalog.vehicles.find((v) => v.id === selected.ev.id)?.consumption).toBe(1.2);
});
