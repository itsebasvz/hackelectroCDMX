import { it, expect } from 'vitest';
import { defaultScenario } from '../data/defaults';
import { serializeScenario, parseScenario, scenarioHash, csvCell, resultsCsv } from './files';
import { evaluateScenario } from '../domain/evaluate';
import { RequestGate } from '../worker/protocol';
it('recupera entradas y hash, excluyendo fecha y resultados externos', async () => {
  const s = defaultScenario();
  const raw = await serializeScenario(s);
  const restored = await parseScenario(raw);
  expect(evaluateScenario(restored)).toEqual(evaluateScenario(s));
  expect(await scenarioHash(restored)).toBe(await scenarioHash(s));
  const corrupt = JSON.parse(raw);
  corrupt.scenario.operation.fleet = 8;
  await expect(parseScenario(JSON.stringify(corrupt))).rejects.toThrow('checksum');
});
it('rechaza versiones incompatibles, URL ejecutable y archivo enorme', async () => {
  const raw = JSON.parse(await serializeScenario(defaultScenario()));
  raw.version = '2';
  await expect(parseScenario(JSON.stringify(raw))).rejects.toThrow();
  raw.version = '1';
  raw.scenario.catalog.sources[0].url = 'javascript:alert(1)';
  await expect(parseScenario(JSON.stringify(raw))).rejects.toThrow();
  await expect(parseScenario(' '.repeat(5_000_001))).rejects.toThrow('5 MB');
});
it('CSV conserva flujo y evita fórmulas en cadenas importadas', () => {
  expect(csvCell('=IMPORTXML(1)')).toBe('"\'=IMPORTXML(1)"');
  expect(csvCell(-10)).toBe('"-10"');
  expect(resultsCsv(evaluateScenario(defaultScenario()))).toContain('"60"');
});
it('la respuesta obsoleta no reemplaza una solicitud nueva', () => {
  const gate = new RequestGate();
  const first = gate.next();
  expect(gate.accepts(first)).toBe(true);
  gate.next();
  expect(gate.accepts(first)).toBe(false);
  gate.invalidate();
  expect(gate.accepts(2)).toBe(false);
});
