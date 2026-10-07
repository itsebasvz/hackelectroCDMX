import type { Result } from '../domain/schema';
import { ComparisonTable, CashTable } from './Dashboard';
import { sections } from './fields';
import { getValue, evidenceOf } from './values';
import { num } from '../ui/format';
export default function Report({ result: r }: { result: Result }) {
  return (
    <article className="print-report">
      <h1>HackElectroCDMX · evaluación por ramal</h1>
      <p>
        {r.scenario.name} · {r.scenario.route.name}
      </p>
      <p>
        Modelo {r.modelVersion} · catálogo {r.scenario.catalog.version} · horizonte 60 meses.
        Escenario condicionado; no certifica viabilidad real.
      </p>
      <h2>Comparación</h2>
      <p>
        Combustión: {r.scenario.ice.name}. Eléctrico: {r.scenario.ev.name}. Carga:{' '}
        {r.scenario.chargerCount} × {r.scenario.charger.name}. Financiamiento:{' '}
        {r.scenario.finance.name}.
      </p>
      <ComparisonTable r={r} />
      <h2>Restricciones</h2>
      <ul>
        {r.constraints.map((c) => (
          <li key={c.id}>
            <strong>
              {c.label} —{' '}
              {c.status === 'pass' ? 'Cumple' : c.status === 'fail' ? 'Incumple' : 'Pendiente'}:
            </strong>{' '}
            {c.detail}
          </li>
        ))}
      </ul>
      <h2>Entradas y procedencia</h2>
      {sections.map((section) => (
        <section key={section.id}>
          <h3>{section.title}</h3>
          <table>
            <thead>
              <tr>
                <th scope="col">Variable</th>
                <th scope="col">Valor</th>
                <th scope="col">Unidad</th>
                <th scope="col">Evidencia / fuente / fecha</th>
              </tr>
            </thead>
            <tbody>
              {section.fields.map((f) => {
                const ev = evidenceOf(r.scenario, f.path);
                return (
                  <tr key={f.path}>
                    <th scope="row">{f.label}</th>
                    <td>{num(Number(getValue(r.scenario, f.path)) * (f.percent ? 100 : 1), 6)}</td>
                    <td>{f.unit}</td>
                    <td>
                      {ev.level} · {ev.nature} · {ev.sourceId} · {ev.date}
                      <br />
                      {ev.limitation}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      ))}
      <p>
        Conectores: {r.scenario.ev.connector} / {r.scenario.charger.connector}. Infraestructura
        financiada: {r.scenario.finance.financeInfrastructure ? 'sí' : 'no'}. Renta incluye
        mantenimiento: {r.scenario.finance.maintenanceIncluded ? 'sí' : 'no'}.
      </p>
      <h2>Flujo de caja</h2>
      <CashTable f={r.ev} />
      <h2>Alcance ambiental</h2>
      <p>
        Escape: {num(r.emissions.iceCO2KgDay, 2)} kg CO₂/unidad/día. Electricidad:{' '}
        {num(r.emissions.evCO2eKgDay, 2)} kg CO₂e/unidad/día. Factores de alcances diferentes; sin
        reducción neta ni ciclo de vida.
      </p>
      <h2>Supuestos y límites</h2>
      <ul>
        {r.warnings.map((w) => (
          <li key={w}>{w}</li>
        ))}
      </ul>
      <h2>Referencias</h2>
      {r.scenario.catalog.sources.map((source) => (
        <p key={source.id}>
          {source.id} · {source.title} · {source.date} · {source.scope}
          <br />
          {source.url}
          <br />
          {source.license}. {source.limitation}
        </p>
      ))}
    </article>
  );
}
