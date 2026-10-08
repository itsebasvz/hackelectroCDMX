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
  BookOpen,
  X,
  SlidersHorizontal,
  BusFront,
  Leaf,
  Coins,
  Activity,
  FolderOpen,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import type { RouteRecord, Scenario } from './domain/schema';
import { ScenarioSchema } from './domain/schema';
import { useScenario } from './features/store';
import { useEngine } from './features/useEngine';
import Controls, { focusParameter } from './features/Controls';
import Diagnostic from './features/Diagnostic';
import { withValue } from './features/values';
import { CostPanel, EnergyPanel, ResultMetrics } from './features/ResultViews';
import FinancePanel from './features/FinancePanel';
import Environment from './features/Environment';
import Sensitivity from './features/Sensitivity';
import WorkspacePanel, { useCompactWorkspace } from './features/WorkspacePanel';
import { useWorkspaceRoute, navigate, type WorkspacePath } from './features/navigation';
import { presentedConditions } from './features/conditions';
import Optimizer from './features/Optimizer';
import Report from './features/Report';
import { download, serializeScenario, parseScenario, resultsCsv } from './features/files';
import { num } from './ui/format';
import { sensitivityVariables } from './domain/explore';
import './workspace.css';
import environmentalSources from '../docs/desarrollo/fuentes-ambientales.json';
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
  const route = useWorkspaceRoute();
  const compact = useCompactWorkspace();
  const [expanded, setExpanded] = useState(false);
  const [visited, setVisited] = useState<Set<WorkspacePath>>(() => new Set([route.path]));
  useEffect(() => {
    setVisited((previous) =>
      previous.has(route.path) ? previous : new Set([...previous, route.path]),
    );
    setExpanded(false);
  }, [route.path]);
  useEffect(() => {
    if (route.path === '/configurar' && route.field) focusParameter(route.field);
  }, [route.path, route.field, visited]);
  const onParameter = (path: string) => navigate('/configurar', path);
  const [routes, setRoutes] = useState<RouteRecord[]>([]);
  const [query, setQuery] = useState('');
  const [routesError, setRoutesError] = useState('');
  const [routeDialog, setRouteDialog] = useState(false);
  const [notice, setNotice] = useState('');
  const [saved, setSaved] = useState<Scenario[]>(readSaved);
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
  const modal = route.path !== '/mapa' && (expanded || compact);
  const failures = engine.result
    ? presentedConditions(engine.result).filter((c) => c.status === 'fail').length
    : 0;
  const onExplore = (variable: keyof typeof sensitivityVariables, value: number) => {
    const path = sensitivityVariables[variable].path;
    setScenario(withValue(scenario, path, value));
    onParameter(path);
  };
  const views: Partial<Record<WorkspacePath, React.ReactNode>> = {
    '/configurar': (
      <Controls scenario={scenario} onChange={setScenario} onRoutes={() => setRouteDialog(true)} />
    ),
    '/economia/caja': engine.result && (
      <FinancePanel
        result={engine.result}
        stale={!valid}
        points={engine.revenuePoints}
        error={engine.revenueError}
      />
    ),
    '/economia/costos': engine.result && (
      <>
        <ResultMetrics result={engine.result} />
        <CostPanel result={engine.result} />
      </>
    ),
    '/economia/pruebas': engine.result && (
      <Sensitivity
        id="pruebas-economia"
        variables={['electricityPrice']}
        result={engine.result}
        points={engine.points}
        error={engine.sensitivityError}
        disabled={!valid}
        onApply={onExplore}
      />
    ),
    '/economia/alternativas': (
      <Optimizer
        search={engine.search}
        searching={engine.searching}
        progress={engine.progress}
        onSearch={engine.startSearch}
        onCancel={engine.cancel}
        onApply={apply}
        disabled={!valid}
      />
    ),
    '/ambiente': engine.result && <Environment result={engine.result} />,
    '/operacion/energia': engine.result && <EnergyPanel result={engine.result} />,
    '/operacion/condiciones': (
      <Diagnostic
        result={engine.result}
        stale={!valid}
        onSearch={() => navigate('/economia/alternativas')}
        onParameter={onParameter}
      />
    ),
    '/operacion/pruebas': engine.result && (
      <Sensitivity
        id="pruebas-operacion"
        variables={['cycles', 'consumption']}
        result={engine.result}
        points={engine.points}
        error={engine.sensitivityError}
        disabled={!valid}
        onApply={onExplore}
      />
    ),
    '/archivos': (
      <section className="panel scenario-tools">
        <div className="section-heading">
          <span className="eyebrow">COPIAS Y ARCHIVOS REPRODUCIBLES</span>
          <h2>Guardar y compartir la evaluación</h2>
          <p>
            Guardar conserva una copia local. Exportar incluye parámetros, catálogo, fuentes y
            versiones para recalcular el escenario.
          </p>
        </div>
        <div className="sharing-groups">
          <section className="sharing-local" aria-labelledby="sharing-local-title">
            <h3 id="sharing-local-title">Copias en este navegador</h3>
            <p>Guarda o abre una copia local. Importa un JSON para recalcular sus parámetros.</p>
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
            <button className="secondary" onClick={() => file.current?.click()}>
              <Upload size={16} />
              Importar escenario JSON
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
          </section>
          <section className="sharing-downloads" aria-labelledby="sharing-downloads-title">
            <h3 id="sharing-downloads-title">Archivos para compartir</h3>
            <div className="download-choice">
              <button className="primary" disabled={!valid} onClick={() => window.print()}>
                <Printer size={16} />
                Descargar informe / PDF
              </button>
              <p>
                Versión imprimible con diagnóstico, detalle económico, flujo, entradas y fuentes.
                Guarda como PDF desde el diálogo de impresión.
              </p>
            </div>
            <div className="download-choice">
              <button
                className="secondary"
                disabled={!valid}
                onClick={() =>
                  void guarded(async () =>
                    download(
                      await serializeScenario({
                        ...scenario,
                        name: name.trim() || scenario.name,
                      }),
                      'hackelectro-escenario.json',
                      'application/json',
                    ),
                  )
                }
              >
                <Download size={16} />
                Descargar escenario JSON
              </button>
              <p>Parámetros, catálogo y fuentes para reproducir y recalcular la evaluación.</p>
            </div>
            <div className="download-choice">
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
                Descargar resultados CSV
              </button>
              <p>Entradas y resultados tabulares para revisar en una hoja de cálculo.</p>
            </div>
          </section>
        </div>
        <div className="restore-action">
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
    ),
    '/fuentes': (
      <section className="panel source-view">
        <h3>Evidencia y condiciones de uso</h3>
        <p>
          La fuente orienta el parámetro; los supuestos permiten explorar, sin sustituir la
          comprobación del ramal.
        </p>{' '}
        <div className="evidence-scale">
          <strong>A</strong> Ruta 1 oficial <strong>B</strong> Zona oficial <strong>C</strong> CDMX
          comparable <strong>D</strong> México <strong>E</strong> Externo <strong>F</strong>{' '}
          Supuesto
        </div>
        <p>
          La naturaleza se registra por separado. Un hecho comercial mexicano es D, no una medición
          de Ruta 1. Los parámetros modificados se identifican como F.
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
    ),
  };
  const tabs =
    route.area === 'economia'
      ? [
          ['/economia/caja', 'Caja'],
          ['/economia/costos', 'Costos'],
          ['/economia/pruebas', 'Pruebas'],
          ['/economia/alternativas', 'Alternativas'],
        ]
      : route.area === 'operacion'
        ? [
            ['/operacion/energia', 'Energía'],
            ['/operacion/condiciones', 'Condiciones'],
            ['/operacion/pruebas', 'Pruebas'],
          ]
        : [];
  return (
    <>
      <div className="simulation-app">
        <div className="workspace-surround" inert={modal || undefined}>
          <a
            className="skip-link"
            href={route.path === '/mapa' ? '#map-distance' : '#workspace-panel-title'}
          >
            Saltar al contenido
          </a>
          <header className="simulation-header">
            <a className="simulation-brand" href="#/mapa" aria-label="HackElectro CDMX, inicio">
              <BusFront size={22} />
              <span>
                HackElectro <small>CDMX · RETO 2</small>
              </span>
            </a>
            <div className="scenario-context">
              <h1 title={scenario.name}>{scenario.name}</h1>
              <button
                className="route-switch"
                onClick={() => setRouteDialog(true)}
                title={scenario.route.name}
              >
                <MapPin size={14} />
                <span>{scenario.route.name}</span>
                <ChevronRight size={14} />
              </button>
            </div>
            <div className="simulation-badge">
              <span className="status-dot" />
              <b>Simulación</b>
              <small>Resultados al editar</small>
            </div>
            <a
              className="team-link"
              href="https://github.com/itsebasvz/hackelectroCDMX"
              target="_blank"
              rel="noreferrer"
              aria-label="Equipo Aragonenes en GitHub"
            >
              <span className="github-mark" /> <span>Aragonenes</span>
            </a>
          </header>
          <nav className="workspace-navigation" aria-label="Áreas del escenario">
            {[
              {
                path: '/configurar',
                area: 'configurar',
                label: 'Configurar',
                icon: SlidersHorizontal,
              },
              { path: '/economia/caja', area: 'economia', label: 'Economía', icon: Coins },
              { path: '/ambiente', area: 'ambiente', label: 'Ambiente', icon: Leaf },
              { path: '/operacion/energia', area: 'operacion', label: 'Operación', icon: Activity },
            ].map(({ path, area, label, icon: Icon }) => (
              <a
                key={path}
                href={`#${path}`}
                data-area={area}
                aria-current={route.area === area ? 'page' : undefined}
                aria-expanded={route.area === area}
                aria-controls="workspace-panel-title"
              >
                <Icon size={20} />
                <span>{label}</span>
                <ChevronRight className="nav-chevron" size={14} />
              </a>
            ))}
            <div className="workspace-utilities">
              <a href="#/archivos" aria-current={route.area === 'archivos' ? 'page' : undefined}>
                <FolderOpen size={18} /> Archivos
              </a>
              <a href="#/fuentes" aria-current={route.area === 'fuentes' ? 'page' : undefined}>
                <BookOpen size={18} /> Fuentes
              </a>
            </div>
          </nav>
          <main id="contenido" className="simulation-map" aria-label="Simulador por ramal">
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
                panelSide={
                  route.path === '/mapa' ? null : route.area === 'configurar' ? 'left' : 'right'
                }
                pauseKey={`${route.path}:${routeDialog}`}
              />
            </Suspense>
          </main>
          <a
            className={`scenario-health ${failures ? 'has-issues' : ''}`}
            href="#/operacion/condiciones"
          >
            <span>
              {failures ? <AlertCircle size={17} /> : <CheckCircle2 size={17} />} Estado del
              escenario
            </span>
            <b>
              {engine.result
                ? failures
                  ? `${failures} condiciones por resolver`
                  : 'Cálculos favorables · pendientes externos'
                : 'Preparando evaluación…'}
            </b>
            <ChevronRight size={16} />
          </a>
        </div>
        <div className="workspace-status" role="status" inert={modal || undefined}>
          {engine.status === 'calculating'
            ? 'Calculando los cambios…'
            : engine.status === 'invalid'
              ? 'Corrige las entradas. Se conserva el último resultado válido, ahora desactualizado.'
              : engine.status === 'error'
                ? 'No se pudo completar el cálculo.'
                : 'Escenario actualizado · los resultados cambian al editar los parámetros.'}
        </div>
        <WorkspacePanel
          path={route.path}
          expanded={expanded}
          onExpand={() => setExpanded((v) => !v)}
          modal={modal}
        >
          {tabs.length > 0 && (
            <nav className="workspace-tabs" aria-label={`Vistas de ${route.title}`}>
              {tabs.map(([path, label]) => (
                <a
                  key={path}
                  href={`#${path}`}
                  aria-current={route.path === path ? 'page' : undefined}
                >
                  {label}
                </a>
              ))}
            </nav>
          )}
          {!valid && engine.result && (
            <p className="panel-stale" role="status">
              Resultado anterior. Corrige las entradas o espera el nuevo cálculo.
            </p>
          )}
          {[...visited]
            .filter((path) => path !== '/mapa')
            .map((path) => (
              <div
                key={path}
                className="workspace-view"
                hidden={route.path !== path}
                aria-busy={engine.status === 'calculating' && path !== '/configurar'}
              >
                {views[path] || <p role="status">Preparando los resultados del escenario…</p>}
              </div>
            ))}
        </WorkspacePanel>
        {engine.error && (
          <div className="workspace-alert" role="alert">
            {engine.error}
          </div>
        )}
        {notice && (
          <div className="workspace-notice" role="status">
            <span>{notice}</span>
            <button className="icon-action" aria-label="Cerrar aviso" onClick={() => setNotice('')}>
              <X size={17} />
            </button>
          </div>
        )}
      </div>
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
      {engine.result && <Report result={engine.result} />}
    </>
  );
}
