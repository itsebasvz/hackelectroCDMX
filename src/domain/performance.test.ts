import { it, expect } from 'vitest';
import { defaultScenario } from '../data/defaults';
import { evaluateScenario } from './evaluate';
import { findConditions } from './optimize';
it('mantiene los tiempos de referencia del caso predeterminado', async () => {
  const s = defaultScenario();
  const t = performance.now();
  for (let i = 0; i < 20; i++) evaluateScenario(s);
  const average = (performance.now() - t) / 20;
  const start = performance.now();
  await findConditions(s);
  const search = performance.now() - start;
  console.info(`Evaluación media: ${average.toFixed(2)} ms; búsqueda: ${search.toFixed(2)} ms`);
  expect(average).toBeLessThan(200);
  expect(search).toBeLessThan(5000);
});
