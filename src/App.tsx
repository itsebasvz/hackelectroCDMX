import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import {
  ArrowUpRight,
  Download,
  Upload,
  Printer,
  Save,
  RotateCcw,
  Search,
  MapPin,
  ArrowRight,
  BookOpen,
  Info,
  X,
  SlidersHorizontal,
  BusFront,
} from 'lucide-react';
import type { RouteRecord, Scenario } from './domain/schema';
import { ScenarioSchema } from './domain/schema';
import { useScenario } from './features/store';
import { useEngine } from './features/useEngine';
import Controls, { focusParameter } from './features/Controls';
import Diagnostic from './features/Diagnostic';
import { withValue } from './features/values';
import Dashboard from './features/Dashboard';
import Optimizer from './features/Optimizer';
import Report from './features/Report';
import { download, serializeScenario, parseScenario, resultsCsv } from './features/files';
import { num } from './ui/format';
import { sensitivityVariables } from './domain/explore';
const RouteMap = lazy(() => import('./features/RouteMap'));
const SAVED_KEY = 'hackelectro:saved:v1';
const normalize = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
function readSaved(): Scenario[] {
  try {
    const data: unknown = JSON.parse(localStorage.getItem(SAVED_KEY) ?? '[]');
    return Array.isArray(data)
      ? data.slice(0, 20).flatMap((x) => {
          const r = ScenarioSchema.safeParse(x);
          return r.success ? [r.data] : [];
        })
      : [];
  } catch {
    return [];
  }
}
export default function App() {
  const { scenario, setScenario, reset, storageError } = useScenario();
  const engine = useEngine(scenario);
  const [routes, setRoutes] = useState<RouteRecord[]>([]);
  const [query, setQuery] = useState('');
  const [routesError, setRoutesError] = useState('');
  const [routeDialog, setRouteDialog] = useState(false);
  const [notice, setNotice] = useState('');
  const [saved, setSaved] = useState<Scenario[]>(readSaved);
  const [sourceDialog, setSourceDialog] = useState(false);
  const [name, setName] = useState(scenario.name);
  const file = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const controller = new AbortController();
    fetch('/data/routes.json', { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error('No se pudo cargar el catálogo de ramales.');
        return r.json();
      })
      .then(setRoutes)
      .catch((e) => {
        if (e.name !== 'AbortError') setRoutesError(e.message);
      });
    return () => controller.abort();
  }, []);
  useEffect(() => {
    setName(scenario.name);
  }, [scenario.name]);
  const filtered = routes
    .filter((r) => normalize(`${r.route} ${r.name}`).includes(normalize(query)))
    .sort(
      (a, b) =>
        Number(b.id === scenario.route.id) - Number(a.id === scenario.route.id) ||
        a.route.localeCompare(b.route, 'es', { numeric: true }) ||
        a.name.localeCompare(b.name, 'es'),
    );
  const valid = engine.status === 'ready' && engine.result !== null;
  const guarded = async (action: () => Promise<void> | void) => {
    try {
      await action();
    } catch (e) {
      setNotice(e instanceof Error ? e.message : 'No se pudo completar la acción.');
    }
  };
  const save = () => {
    const parsed = ScenarioSchema.safeParse({ ...scenario, name: name.trim() || scenario.name });
    if (!parsed.success) {
      setNotice('Corrige las condiciones antes de guardar.');
      return;
    }
    const next = [parsed.data, ...saved.filter((s) => s.name !== parsed.data.name)].slice(0, 20);
    try {
      localStorage.setItem(SAVED_KEY, JSON.stringify(next));
      setSaved(next);
      setScenario(parsed.data);
      setNotice('Escenario guardado en este navegador.');
    } catch {
      setNotice('Almacenamiento lleno o deshabilitado. Exporta el JSON para conservarlo.');
    }
  };
  const selectRoute = (r: RouteRecord) => {
    setScenario({
      ...structuredClone(scenario),
      route: {
        id: r.id,
        name: r.name,
        cycleKm: r.cycleKm,
        sourceId: r.sourceId,
        internalDate: r.internalDate,
      },
      evidence: {
        ...scenario.evidence,
        'route.cycleKm': {
          sourceId: 'M09',
          nature: 'derivado',
          level: 'A',
          date: r.internalDate,
          scope: 'Geometría histórica del ramal',
          limitation: 'Suma de trazos cartográficos; no ciclo actual medido.',
        },
      },
    });
    setNotice(
      'Cambió la geometría. Operación, demanda y economía conservan los supuestos del escenario; revísalos para este ramal.',
    );
  };
  const apply = (s: Scenario) => {
    setScenario(s);
    setNotice(
      'Combinación aplicada. Los acuerdos de carga, financiamiento y autorización siguen pendientes.',
    );
  };
  return (
    <>
      <a className="skip-link" href="#contenido">
        Saltar al contenido
      </a>
      <header className="header">
        <div className="header-inner">
          <a
            href="#contenido"
            className="brand"
            aria-label="Hackatón Electromovilidad CDMX 2026, inicio"
          >
            Hackatón Electromovilidad <span>CDMX 2026</span>
          </a>
          <span className="header-mission">
            Electrificar el transporte sin poner en riesgo el trabajo
          </span>
          <a
            className="header-link"
            href="https://github.com/itsebasvz/hackelectroCDMX"
            target="_blank"
            rel="noreferrer"
          >
            Equipo Aragonenes <span className="github-mark" aria-hidden="true" />
          </a>
        </div>
      </header>
      <nav className="nav" aria-label="Secciones de evaluación">
        <div className="container nav-inner">
          <a href="#ramal">
            <MapPin size={16} />
            Simulador
          </a>
          <a href="#resultados">
            <BusFront size={16} />
            Comparación
          </a>
          <a href="#sensibilidad">
            <SlidersHorizontal size={16} />
            Explorar límites
          </a>
          <a href="#condiciones">
            <ArrowRight size={16} />
            Buscar alternativas
          </a>
          <button onClick={() => setSourceDialog(true)}>
            <BookOpen size={16} />
            Fuentes y supuestos
          </button>
        </div>
      </nav>
      <main id="contenido" className="container">
        <section className="workspace-intro">
          <div>
            <span className="eyebrow">RETO 2 · EVALUACIÓN POR RAMAL</span>
            <h1>El futuro de una ruta empieza con una buena decisión.</h1>
            <p>
              Compara vehículos, ajusta su operación y descubre condiciones para mantener el
              servicio y el ingreso.
            </p>
          </div>
          <button className="text-button" onClick={() => setSourceDialog(true)}>
            <Info size={16} />
            Exploración con datos públicos
          </button>
        </section>
        <section id="ramal" className="evaluation-workspace" aria-label="Simulador por ramal">
          <Controls
            scenario={scenario}
            onChange={setScenario}
            onRoutes={() => setRouteDialog(true)}
          />
          <div className="route-map-area">
            <div className="map-topline">
              <div>
                <span className="small-label">EXPLORA EL RECORRIDO</span>
                <h2>{scenario.route.name}</h2>
              </div>
              <span className="pill historical">
                Geometría {scenario.route.internalDate.slice(0, 4)}
              </span>
            </div>
            <Suspense
              fallback={<div className="map-shell map-empty">Cargando vista territorial…</div>}
            >
              <RouteMap
                routeId={scenario.route.id}
                cycles={scenario.operation.cycles}
                onCycles={(cycles) => setScenario(withValue(scenario, 'operation.cycles', cycles))}
                result={
                  engine.result?.scenario.route.id === scenario.route.id ? engine.result : null
                }
                stale={!valid}
              />
            </Suspense>
            <div className="map-bottomline">
              <span>
                <b>{num(scenario.route.cycleKm, 3)} km</b> por ciclo de prueba
              </span>
              <span>
                <b>{scenario.operation.fleet} unidades</b> del escenario
              </span>
              <span>
                <b>Datos sustituibles</b> no seguimiento real
              </span>
            </div>
          </div>
          <Diagnostic
            result={engine.result}
            stale={!valid}
            onSearch={() =>
              document.getElementById('condiciones')?.scrollIntoView({ behavior: 'smooth' })
            }
          />
        </section>
        <div className="calculation-state" role="status">
          {engine.status === 'calculating'
            ? 'Calculando los cambios…'
            : engine.status === 'invalid'
              ? 'Corrige las entradas. Se conserva el último resultado válido, ahora desactualizado.'
              : engine.status === 'error'
                ? 'No se pudo completar el cálculo.'
                : 'Escenario actualizado · los resultados cambian al editar los parámetros.'}
        </div>
        {engine.error && (
          <div className="error-banner" role="alert">
            {engine.error}
          </div>
        )}
        {notice && (
          <p className="scenario-notice" role="status">
            {notice}
          </p>
        )}
        <section id="resultados" aria-busy={engine.status === 'calculating'}>
          {engine.result ? (
            <Dashboard
              result={engine.result}
              points={engine.points}
              sensitivityError={engine.sensitivityError}
              stale={!valid}
              onExplore={(variable, value) => {
                const path = sensitivityVariables[variable].path;
                setScenario(withValue(scenario, path, value));
                focusParameter(path);
              }}
            />
          ) : (
            <div className="panel loading-panel">
              <h2>Preparando la comparación</h2>
              <p>Estamos calculando el consumo y los costos de tu escenario.</p>
            </div>
          )}
        </section>
        <Optimizer
          search={engine.search}
          searching={engine.searching}
          progress={engine.progress}
          onSearch={engine.startSearch}
          onCancel={engine.cancel}
          onApply={apply}
          disabled={!valid}
        />
        <section className="panel scenario-tools">
          <div className="section-heading">
            <span className="eyebrow">CONSERVA Y COMPARTE TU EVALUACIÓN</span>
            <h2>Datos sustituibles. Resultados reproducibles.</h2>
            <p>
              Guardar conserva una copia local. Exportar incluye parámetros, catálogo, fuentes y
              versiones para recalcular el escenario.
            </p>
          </div>
          <div className="save-row">
            <div className="field">
              <label htmlFor="scenario-name">Nombre del escenario</label>
              <input
                id="scenario-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={200}
              />
            </div>
            <button className="secondary" onClick={save} disabled={!valid}>
              <Save size={16} />
              Guardar escenario
            </button>
            {saved.length > 0 && (
              <div className="field">
                <label htmlFor="saved-choice">Abrir un escenario guardado</label>
                <select
                  id="saved-choice"
                  value=""
                  onChange={(e) => {
                    const item = saved[Number(e.target.value)];
                    if (item) setScenario(structuredClone(item));
                  }}
                >
                  <option value="" disabled>
                    Seleccionar copia local…
                  </option>
                  {saved.map((item, i) => (
                    <option key={`${item.name}-${i}`} value={i}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <div className="tool-actions">
            <button
              className="secondary"
              disabled={!valid}
              onClick={() =>
                void guarded(async () =>
                  download(
                    await serializeScenario({ ...scenario, name: name.trim() || scenario.name }),
                    'hackelectro-escenario.json',
                    'application/json',
                  ),
                )
              }
            >
              <Download size={16} />
              Exportar JSON
            </button>
            <button className="secondary" onClick={() => file.current?.click()}>
              <Upload size={16} />
              Importar JSON
            </button>
            <input
              ref={file}
              type="file"
              accept=".json,application/json"
              hidden
              onChange={(e) => {
                const selected = e.target.files?.[0];
                if (selected)
                  void guarded(async () => {
                    if (selected.size > 5_000_000) throw new Error('El archivo supera 5 MB.');
                    setScenario(await parseScenario(await selected.text()));
                    setNotice('Escenario importado y enviado al motor para recalcular.');
                  });
                e.target.value = '';
              }}
            />
            <button
              className="secondary"
              disabled={!valid}
              onClick={() => {
                if (engine.result)
                  download(
                    resultsCsv(engine.result),
                    'hackelectro-resultados.csv',
                    'text/csv;charset=utf-8',
                  );
              }}
            >
              <Download size={16} />
              Exportar CSV
            </button>
            <button className="secondary" disabled={!valid} onClick={() => window.print()}>
              <Printer size={16} />
              Informe / PDF
            </button>
            <button
              className="text-button"
              onClick={() => {
                reset();
                setNotice('Se restauró el ejemplo inicial; tus escenarios guardados permanecen.');
              }}
            >
              <RotateCcw size={15} />
              Restaurar ejemplo
            </button>
          </div>
          {storageError && (
            <p className="notice" role="status">
              {storageError}
            </p>
          )}
        </section>
        <footer>
          <div className="footer-brand">
            <strong>Equipo Aragonenes</strong>
          </div>
          <p>
            Una herramienta exploratoria para una transición justa. Código MIT · documentación
            propia CC BY 4.0 · fuentes con sus derechos.
          </p>
          <button className="text-button" onClick={() => setSourceDialog(true)}>
            <BookOpen size={15} />
            Fuentes y metodología
          </button>
          <small>
            <a href="/third-party/licenses.json" target="_blank" rel="noreferrer">
              Licencias de dependencias
            </a>{' '}
            · Proyecto estudiantil independiente. Identidad visual inspirada en los portales de
            CDMX; sin aval institucional.
          </small>
        </footer>
      </main>
      <Dialog.Root open={routeDialog} onOpenChange={setRouteDialog}>
        <Dialog.Portal>
          <Dialog.Overlay className="dialog-overlay" />
          <Dialog.Content className="dialog route-dialog">
            <Dialog.Title>Elige un ramal para explorar</Dialog.Title>
            <Dialog.Description>
              995 registros históricos. Cambiar la geometría conserva los parámetros de prueba; no
              los convierte en datos reales de la nueva ruta.
            </Dialog.Description>
            <Dialog.Close className="dialog-close" aria-label="Cerrar catálogo">
              <X size={21} />
            </Dialog.Close>
            <label htmlFor="route-search">Buscar ruta o destino</label>
            <div className="search-box">
              <Search size={17} />
              <input
                id="route-search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Universidad, Huipulco…"
              />
            </div>
            <div className="route-list" aria-label="Ramales del catálogo">
              {routesError && <p role="alert">{routesError}</p>}
              {filtered.slice(0, 40).map((r) => (
                <button
                  key={r.id}
                  className={r.id === scenario.route.id ? 'route-option selected' : 'route-option'}
                  onClick={() => {
                    selectRoute(r);
                    setRouteDialog(false);
                  }}
                  aria-pressed={r.id === scenario.route.id}
                >
                  <span className="route-number">{r.route || '—'}</span>
                  <span>
                    <strong>{r.name}</strong>
                    <small>{num(r.cycleKm, 1)} km cartográficos · tecnología sin verificar</small>
                  </span>
                </button>
              ))}
              {routes.length > 0 && filtered.length === 0 && (
                <p>No hay coincidencias. Prueba otro destino o número.</p>
              )}
            </div>
            <small>
              {filtered.length} coincidencias · se muestran hasta 40 · archivo histórico
            </small>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      <Dialog.Root open={sourceDialog} onOpenChange={setSourceDialog}>
        <Dialog.Portal>
          <Dialog.Overlay className="dialog-overlay" />
          <Dialog.Content className="dialog">
            <Dialog.Title>Evidencia y condiciones de uso</Dialog.Title>
            <Dialog.Description>
              La fuente orienta el parámetro; los supuestos permiten explorar, sin sustituir la
              comprobación del ramal.
            </Dialog.Description>
            <Dialog.Close className="dialog-close" aria-label="Cerrar fuentes">
              <X size={21} />
            </Dialog.Close>
            <div className="evidence-scale">
              <strong>A</strong> Ruta 1 oficial <strong>B</strong> Zona oficial <strong>C</strong>{' '}
              CDMX comparable <strong>D</strong> México <strong>E</strong> Externo{' '}
              <strong>F</strong> Supuesto
            </div>
            <p>
              La naturaleza se registra por separado. Un hecho comercial mexicano es D, no una
              medición de Ruta 1. Los parámetros modificados se identifican como F.
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
            <a
              href="https://github.com/itsebasvz/hackelectroCDMX/blob/main/docs/documento-maestro-ruta1.md"
              target="_blank"
              rel="noreferrer"
              className="secondary"
            >
              Abrir documento maestro <ArrowUpRight size={16} />
            </a>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      {engine.result && <Report result={engine.result} />}
    </>
  );
}
