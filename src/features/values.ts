import type { Scenario, Evidence } from '../domain/schema';
import { assumed } from '../data/catalog';
export const getValue = (object: unknown, path: string): unknown =>
  path.split('.').reduce<unknown>((obj, key) => (obj as Record<string, unknown>)?.[key], object);
export function withValue(s: Scenario, path: string, value: unknown): Scenario {
  const copy = structuredClone(s);
  const parts = path.split('.');
  const first = parts[0];
  if (first === 'ice' || first === 'ev' || first === 'charger' || first === 'finance') {
    if (first === 'ice') copy.ice = structuredClone(copy.ice);
    else if (first === 'ev') copy.ev = structuredClone(copy.ev);
    else if (first === 'charger') copy.charger = structuredClone(copy.charger);
    else copy.finance = structuredClone(copy.finance);
  }
  const key = parts.pop()!;
  const parent = parts.reduce<unknown>(
    (obj, k) => (obj as Record<string, unknown>)[k],
    copy,
  ) as Record<string, unknown>;
  parent[key] = value;
  if (['ice', 'ev', 'charger', 'finance'].includes(parts[0] ?? '')) {
    const group = copy[parts[0] as 'ice' | 'ev' | 'charger' | 'finance'];
    group.evidence[key] = assumed(
      'Modificado por la persona usuaria; necesita fuente o validación propia.',
    );
  } else copy.evidence[path] = assumed('Modificado por la persona usuaria; no medición del ramal.');
  return copy;
}
export function evidenceOf(s: Scenario, path: string): Evidence {
  const [group, key] = path.split('.');
  if (['ice', 'ev', 'charger', 'finance'].includes(group ?? ''))
    return s[group as 'ice' | 'ev' | 'charger' | 'finance'].evidence[key!] ?? assumed();
  return s.evidence[path] ?? assumed();
}
