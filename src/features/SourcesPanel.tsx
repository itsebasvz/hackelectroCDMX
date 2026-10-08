import { ArrowUpRight } from 'lucide-react';
import type { Scenario } from '../domain/schema';
import environmentalSources from '../../docs/desarrollo/fuentes-ambientales.json';
export default function SourcesPanel({ scenario }: { scenario: Scenario }) {
  return (
    <section className="panel source-view">
      <h3>Evidencia y condiciones de uso</h3>
      <p>
        La fuente orienta el parámetro; los supuestos permiten explorar, sin sustituir la
        comprobación del ramal.
      </p>{' '}
      <div className="evidence-scale">
        <strong>A</strong> Ruta 1 oficial <strong>B</strong> Zona oficial <strong>C</strong> CDMX
        comparable <strong>D</strong> México <strong>E</strong> Externo <strong>F</strong> Supuesto
      </div>
      <p>
        La naturaleza se registra por separado. Un hecho comercial mexicano es D, no una medición de
        Ruta 1. Los parámetros modificados se identifican como F.
      </p>
      <h2>Datos y factores utilizados en los cálculos</h2>
      <p>
        Los factores ambientales M15 y S20 tienen alcances diferentes. Las ediciones usan los
        parámetros del escenario.
      </p>
      {scenario.catalog.sources.map((source) => (
        <article className="source" key={source.id}>
          <span className="source-id">{source.id}</span>
          <div>
            <h3>
              <a href={source.url} target="_blank" rel="noreferrer">
                {source.title}
                <ArrowUpRight size={14} />
              </a>
            </h3>
            <small>
              {source.date} · {source.scope}
            </small>
            <p>{source.limitation}</p>
            <small>{source.license}</small>
          </div>
        </article>
      ))}
      <h2>Contexto científico ambiental</h2>
      <p>Estas referencias explican el alcance humano; no añaden factores a los cálculos.</p>
      {environmentalSources.references
        .filter((source) => source.role === 'context')
        .map((source) => (
          <article className="source" key={source.id}>
            <span className="source-id">{source.id}</span>
            <div>
              <h3>
                <a href={source.url} target="_blank" rel="noreferrer">
                  {source.institution} · {source.title}
                  <ArrowUpRight size={14} />
                </a>
              </h3>
              <small>
                Publicación: {source.publication} · consulta: {source.consulted}
              </small>
              <p>{source.claim}</p>
              <small>
                {source.locator} · {source.scope}. {source.license}. {source.recovery}.
              </small>
            </div>
          </article>
        ))}
      <a
        href="https://github.com/itsebasvz/hackelectroCDMX/blob/main/docs/documento-maestro-ruta1.md"
        target="_blank"
        rel="noreferrer"
        className="secondary"
      >
        Abrir documento maestro <ArrowUpRight size={16} />
      </a>
      <footer>
        <strong>Equipo Aragonenes</strong>
        <p>
          Proyecto estudiantil independiente; sin aval institucional. Código MIT · documentación
          propia CC BY 4.0 · fuentes con sus derechos.
        </p>
        <a href="/third-party/licenses.json" target="_blank" rel="noreferrer">
          Licencias de dependencias
        </a>
      </footer>
    </section>
  );
}
