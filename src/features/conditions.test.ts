import { expect, it } from 'vitest';
import { defaultScenario } from '../data/defaults';
import { evaluateScenario } from '../domain/evaluate';
import { presentedConditions } from './conditions';
it('desconocido queda pendiente en diagnóstico e informe, con todas las condiciones y detalles', () => {
  const s = defaultScenario();
  s.ev.connector = 'unknown';
  const r = evaluateScenario(s);
  const conditions = presentedConditions(r);
  expect(conditions).toHaveLength(r.constraints.length);
  expect(conditions.find((c) => c.id === 'connector')?.status).toBe('pending');
  expect(
    conditions.filter((c) => ['authorization', 'site', 'access', 'finance'].includes(c.id)),
  ).toHaveLength(4);
  expect(conditions.every((c) => c.detail.length > 20)).toBe(true);
  s.ev.connector = 'CCS2';
  s.charger.connector = 'GBT';
  expect(presentedConditions(evaluateScenario(s)).find((c) => c.id === 'connector')?.status).toBe(
    'fail',
  );
});
