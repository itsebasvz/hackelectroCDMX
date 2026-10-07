import { z } from 'zod';
import { sections } from './fields';
import { getValue, evidenceOf } from './values';
import { ScenarioSchema, type Scenario, type Result } from '../domain/schema';
const Envelope = z.object({
  format: z.literal('hackelectro-scenario'),
  version: z.literal('1'),
  generatedAt: z.string(),
  checksum: z.string().regex(/^[a-f0-9]{64}$/),
  scenario: ScenarioSchema,
});
export function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (value !== null && typeof value === 'object')
    return `{${Object.entries(value)
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
      .map(([k, v]) => `${JSON.stringify(k)}:${canonical(v)}`)
      .join(',')}}`;
  return JSON.stringify(value);
}
export async function scenarioHash(scenario: Scenario) {
  const raw = new TextEncoder().encode(canonical(ScenarioSchema.parse(scenario)));
  const digest = await crypto.subtle.digest('SHA-256', raw);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
export async function serializeScenario(scenario: Scenario) {
  const normalized = ScenarioSchema.parse(scenario);
  return JSON.stringify(
    {
      format: 'hackelectro-scenario',
      version: '1',
      generatedAt: new Date().toISOString(),
      checksum: await scenarioHash(normalized),
      scenario: normalized,
    },
    null,
    2,
  );
}
export async function parseScenario(text: string) {
  if (new TextEncoder().encode(text).byteLength > 5_000_000)
    throw new Error('El archivo supera el límite de 5 MB.');
  const envelope = Envelope.parse(JSON.parse(text));
  if ((await scenarioHash(envelope.scenario)) !== envelope.checksum)
    throw new Error('El checksum no coincide. El archivo fue modificado o está incompleto.');
  return envelope.scenario;
}
export function download(text: string, filename: string, type: string) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function csvCell(value: string | number) {
  const text = String(value);
  const safe = /^[=+\-@\t\r]/.test(text) && typeof value === 'string' ? `'${text}` : text;
  return `"${safe.replaceAll('"', '""')}"`;
}
export function resultsCsv(r: Result) {
  const rows: (string | number)[][] = [
    ['escenario', r.scenario.name],
    ['ramal', r.scenario.route.name],
    ['modelo', r.modelVersion],
    ['naturaleza', 'ESCENARIO CONDICIONADO'],
    ['km_unidad_dia', r.dailyKm],
    ['variable', 'unidad', 'combustion', 'electrico'],
    ['costo_economico_5_anios', 'MXN', r.ice.economicCost, r.ev.economicCost],
    ['costo_por_km', 'MXN/km', r.ice.costPerKm, r.ev.costPerKm],
    ['energia_unidad_dia', 'L / kWh medidor', r.dailyLiters, r.dailyGridKwh],
    ['desembolso_inicial_propio', 'MXN', r.ice.ownRequired, r.ev.ownRequired],
    ['deuda_mes_60', 'MXN', r.ice.debtRemaining, r.ev.debtRemaining],
    [
      'CO2_escape_vs_CO2e_electricidad',
      'kg/dia/unidad; limites incompatibles',
      r.emissions.iceCO2KgDay,
      r.emissions.evCO2eKgDay,
    ],
    [],
    [
      'mes',
      'recaudo_MXN',
      'operacion_EV_MXN',
      'trabajo_MXN',
      'ingreso_propietario_MXN',
      'pago_MXN',
      'interes_MXN',
      'principal_MXN',
      'deuda_MXN',
      'reserva_MXN',
      'margen_MXN',
    ],
  ];
  for (const m of r.ev.months)
    rows.push([
      m.month,
      m.revenue,
      m.operating,
      m.workerCost,
      m.ownerIncome,
      m.payment,
      m.interest,
      m.principal,
      m.balance,
      m.reserve,
      m.freeCash,
    ]);
  rows.push([], ['entrada', 'valor', 'unidad', 'nivel', 'naturaleza', 'fuente', 'fecha', 'limite']);
  for (const section of sections)
    for (const field of section.fields) {
      const evidence = evidenceOf(r.scenario, field.path);
      rows.push([
        field.path,
        Number(getValue(r.scenario, field.path)) * (field.percent ? 100 : 1),
        field.unit,
        evidence.level,
        evidence.nature,
        evidence.sourceId,
        evidence.date,
        evidence.limitation,
      ]);
    }
  rows.push([], ['condicion', 'estado', 'detalle']);
  for (const c of r.constraints) rows.push([c.label, c.status, c.detail]);
  rows.push([], ['fuente', 'titulo', 'URL', 'fecha', 'limite']);
  for (const source of r.scenario.catalog.sources)
    rows.push([source.id, source.title, source.url, source.date, source.limitation]);
  rows.push([], ['supuestos_y_limites']);
  r.warnings.forEach((w) => rows.push([w]));
  return '\uFEFF' + rows.map((row) => row.map(csvCell).join(',')).join('\r\n');
}
