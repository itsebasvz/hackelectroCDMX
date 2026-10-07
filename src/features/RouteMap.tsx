import { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import mapWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import type { FeatureCollection, LineString, Point } from 'geojson';
import type { Result } from '../domain/schema';
import { traceSegments, positionOnTrace, consumptionAt, nearestFraction } from '../domain/geometry';
import { num } from '../ui/format';
import 'maplibre-gl/dist/maplibre-gl.css';
maplibregl.setWorkerUrl(mapWorkerUrl);
interface Hospital {
  name: string;
  shortName: string;
  address: string;
  officialUrl: string;
  osmUrl: string;
  limitation: string;
}
type Hospitals = FeatureCollection<Point, Hospital>;
const empty = { type: 'FeatureCollection' as const, features: [] };
function Outline({
  features,
  fraction,
}: {
  features: FeatureCollection<LineString> | null;
  fraction: number;
}) {
  const lines = features?.features.map((f) => f.geometry.coordinates) ?? [];
  const points = lines.flat();
  if (!points.length)
    return (
      <div className="map-empty">
        La geometría se está cargando. Puedes continuar evaluando el escenario.
      </div>
    );
  const xs = points.map((p) => p[0]!),
    ys = points.map((p) => p[1]!);
  const minX = Math.min(...xs),
    maxX = Math.max(...xs),
    minY = Math.min(...ys),
    maxY = Math.max(...ys);
  const project = (p: number[]) => [
    30 + ((p[0]! - minX) / (maxX - minX || 1)) * 540,
    340 - ((p[1]! - minY) / (maxY - minY || 1)) * 310,
  ];
  const position = features ? positionOnTrace(features, fraction) : null;
  const marker = position ? project(position.coordinates) : null;
  return (
    <svg
      viewBox="0 0 600 380"
      role="img"
      aria-label="Trazos históricos del ramal, sin mapa base"
      className="map-outline"
    >
      {lines.map((line, i) => (
        <polyline
          key={i}
          points={line.map((p) => project(p).join(',')).join(' ')}
          fill="none"
          stroke={i === 0 ? '#9D2148' : '#B28E5C'}
          strokeWidth="5"
          strokeLinecap="round"
        />
      ))}
      {marker && (
        <circle cx={marker[0]} cy={marker[1]} r="9" fill="#266CB4" stroke="#fff" strokeWidth="3" />
      )}
      <text x="30" y="370" fontSize="13" fill="#55585A">
        Geometría histórica · referencia sin mapa base
      </text>
    </svg>
  );
}
export default function RouteMap({
  routeId,
  result,
  stale,
}: {
  routeId: string;
  result: Result | null;
  stale: boolean;
}) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const all = useRef<FeatureCollection<LineString> | null>(null);
  const geometryRef = useRef<FeatureCollection<LineString>>(empty);
  const [geometry, setGeometry] = useState<FeatureCollection<LineString> | null>(null);
  const [hospitals, setHospitals] = useState<Hospitals | null>(null);
  const [hospitalError, setHospitalError] = useState('');
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [mode, setMode] = useState<'route' | 'energy'>('route');
  const [context, setContext] = useState(routeId === 'M09-514');
  const [cycle, setCycle] = useState(1);
  const [fraction, setFraction] = useState(0);
  const [fallback, setFallback] = useState(false);
  const [painted, setPainted] = useState(false);
  const [note, setNote] = useState('Cargando cartografía histórica…');
  const activeCycle = Math.min(cycle, result?.scenario.operation.cycles ?? 1);
  const view = useRef({ routeId, result, mode, context, cycle: activeCycle, fraction, hospitals });
  view.current = { routeId, result, mode, context, cycle: activeCycle, fraction, hospitals };
  const fitted = useRef('');
  const update = () => {
    const v = view.current;
    const selected: FeatureCollection<LineString> = {
      type: 'FeatureCollection',
      features: all.current?.features.filter((f) => f.properties?.recordId === v.routeId) ?? [],
    };
    geometryRef.current = selected;
    setGeometry(selected);
    const m = map.current;
    if (!m?.getSource('selected')) return;
    (m.getSource('selected') as maplibregl.GeoJSONSource).setData(selected);
    const segments = traceSegments(selected),
      total = segments.at(-1)?.to ?? 0;
    const energy: FeatureCollection<LineString> = {
      type: 'FeatureCollection',
      features: v.result
        ? segments.map((segment) => {
            const point = consumptionAt(
              v.result!,
              v.cycle,
              (segment.from + segment.to) / 2 / (total || 1),
            );
            const color =
              point.soc < v.result!.scenario.energy.socMin
                ? '#B51C42'
                : point.soc < v.result!.scenario.energy.socMin + 0.1
                  ? '#AC6D14'
                  : '#027A35';
            return {
              type: 'Feature',
              properties: { recordId: v.routeId, color },
              geometry: { type: 'LineString', coordinates: [segment.start, segment.end] },
            };
          })
        : [],
    };
    (m.getSource('energy') as maplibregl.GeoJSONSource).setData(energy);
    m.setLayoutProperty(
      'energy-route',
      'visibility',
      v.mode === 'energy' && v.result ? 'visible' : 'none',
    );
    m.setPaintProperty('selected-route', 'line-color', [
      'case',
      ['>', ['get', 'trace'], 1],
      '#B28E5C',
      '#9D2148',
    ]);
    const traced = {
      ...selected,
      features: selected.features.map((f, i) => ({
        ...f,
        properties: { ...f.properties, trace: i + 1 },
      })),
    };
    (m.getSource('selected') as maplibregl.GeoJSONSource).setData(traced);
    const position = positionOnTrace(selected, v.fraction);
    (m.getSource('preview') as maplibregl.GeoJSONSource).setData(
      position
        ? {
            type: 'Feature',
            properties: {},
            geometry: { type: 'Point', coordinates: position.coordinates },
          }
        : empty,
    );
    const reserveFraction = v.result
      ? v.result.usableKwh /
          v.result.scenario.ev.consumption /
          (v.result.scenario.route.cycleKm * (1 + v.result.scenario.operation.emptyRatio)) -
        (v.cycle - 1)
      : -1;
    const reserve =
      reserveFraction >= 0 && reserveFraction <= 1
        ? positionOnTrace(selected, reserveFraction)
        : null;
    (m.getSource('reserve') as maplibregl.GeoJSONSource).setData(
      reserve
        ? {
            type: 'Feature',
            properties: {},
            geometry: { type: 'Point', coordinates: reserve.coordinates },
          }
        : empty,
    );
    m.setLayoutProperty('reserve-point', 'visibility', v.mode === 'energy' ? 'visible' : 'none');
    (m.getSource('hospitals') as maplibregl.GeoJSONSource).setData(v.hospitals ?? empty);
    m.setLayoutProperty(
      'hospital-points',
      'visibility',
      v.context && v.routeId === 'M09-514' ? 'visible' : 'none',
    );
    const coords = selected.features.flatMap((f) => f.geometry.coordinates);
    if (coords.length && fitted.current !== v.routeId) {
      const bounds = new maplibregl.LngLatBounds();
      coords.forEach((p) => bounds.extend([p[0]!, p[1]!]));
      m.fitBounds(bounds, { padding: 65, duration: 0, maxZoom: 14 });
      fitted.current = v.routeId;
    }
  };
  useEffect(() => {
    const controller = new AbortController();
    let disposed = false;
    fetch('/data/routes.geojson', { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw Error('Geometría no disponible');
        return r.json();
      })
      .then((data: FeatureCollection<LineString>) => {
        if (disposed) return;
        all.current = data;
        update();
        (map.current?.getSource('routes') as maplibregl.GeoJSONSource | undefined)?.setData(data);
      })
      .catch((e) => {
        if (e.name !== 'AbortError')
          setNote('No se pudo cargar la geometría; los cálculos siguen disponibles.');
      });
    const observer = new ResizeObserver(() => map.current?.resize());
    try {
      if (!container.current) throw Error('Sin contenedor');
      const m = new maplibregl.Map({
        container: container.current,
        center: [-99.17, 19.3],
        zoom: 12,
        cooperativeGestures: true,
        locale: {
          'Map.Title': 'Mapa de ramales históricos',
          'NavigationControl.ZoomIn': 'Acercar mapa',
          'NavigationControl.ZoomOut': 'Alejar mapa',
          'CooperativeGesturesHandler.WindowsHelpText': 'Usa Ctrl y la rueda para acercar el mapa',
          'CooperativeGesturesHandler.MacHelpText': 'Usa ⌘ y la rueda para acercar el mapa',
          'CooperativeGesturesHandler.MobileHelpText': 'Usa dos dedos para mover el mapa',
          'AttributionControl.ToggleAttribution': 'Mostrar atribuciones',
        },
        attributionControl: { compact: false },
        style: {
          version: 8,
          sources: {
            osm: {
              type: 'raster',
              tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
              tileSize: 256,
              maxzoom: 19,
              attribution:
                '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> · SEMOVI <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>',
            },
          },
          layers: [
            {
              id: 'base',
              type: 'raster',
              source: 'osm',
              paint: { 'raster-opacity': 0.85, 'raster-saturation': -0.85 },
            },
          ],
        },
      });
      map.current = m;
      observer.observe(container.current);
      m.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
      m.on('load', () => {
        if (disposed) return;
        m.addSource('routes', { type: 'geojson', data: all.current ?? empty });
        m.addLayer({
          id: 'all-routes',
          type: 'line',
          source: 'routes',
          paint: { 'line-color': '#777477', 'line-width': 1, 'line-opacity': 0.13 },
        });
        for (const id of ['selected', 'energy', 'preview', 'reserve', 'hospitals'])
          m.addSource(id, { type: 'geojson', data: empty });
        m.addLayer({
          id: 'selected-casing',
          type: 'line',
          source: 'selected',
          paint: { 'line-color': '#fff', 'line-width': 9 },
        });
        m.addLayer({
          id: 'selected-route',
          type: 'line',
          source: 'selected',
          paint: { 'line-color': '#9D2148', 'line-width': 4 },
        });
        m.addLayer({
          id: 'energy-route',
          type: 'line',
          source: 'energy',
          paint: { 'line-color': ['get', 'color'], 'line-width': 5 },
        });
        m.addLayer({
          id: 'hospital-points',
          type: 'circle',
          source: 'hospitals',
          paint: {
            'circle-radius': 8,
            'circle-color': '#8F4889',
            'circle-stroke-color': '#fff',
            'circle-stroke-width': 3,
          },
        });
        m.addLayer({
          id: 'reserve-point',
          type: 'circle',
          source: 'reserve',
          paint: {
            'circle-radius': 10,
            'circle-color': '#B51C42',
            'circle-stroke-color': '#fff',
            'circle-stroke-width': 3,
          },
        });
        m.addLayer({
          id: 'preview-point',
          type: 'circle',
          source: 'preview',
          paint: {
            'circle-radius': 7,
            'circle-color': '#266CB4',
            'circle-stroke-color': '#fff',
            'circle-stroke-width': 3,
          },
        });
        setNote('SEMOVI · geometría histórica 2022 · consumo uniforme supuesto');
        update();
      });
      m.on('click', (e) => {
        if (m.getLayer('hospital-points')) {
          const hit = m.queryRenderedFeatures(e.point, { layers: ['hospital-points'] })[0];
          if (hit) {
            setSelectedHospital(hit.properties as unknown as Hospital);
            return;
          }
        }
        if (geometryRef.current.features.length)
          setFraction(nearestFraction(geometryRef.current, [e.lngLat.lng, e.lngLat.lat]));
      });
      m.on('error', () =>
        setNote(
          'Mapa base parcialmente disponible. Geometría y cálculos locales permanecen disponibles.',
        ),
      );
      m.on('render', () => {
        if (m.getLayer('selected-route'))
          setPainted(
            m
              .queryRenderedFeatures({ layers: ['selected-route'] })
              .some((f) => f.properties.recordId === view.current.routeId),
          );
      });
    } catch {
      setFallback(true);
      setNote('Vista local sin WebGL · geometría SEMOVI CC BY 4.0');
    }
    return () => {
      disposed = true;
      controller.abort();
      observer.disconnect();
      map.current?.remove();
      map.current = null;
      fitted.current = '';
    };
  }, []);
  useEffect(() => {
    setPainted(false);
    setFraction(0);
    setCycle(1);
    setContext(routeId === 'M09-514');
    setSelectedHospital(null);
    update();
  }, [routeId]);
  useEffect(() => {
    update();
  }, [result, mode, context, activeCycle, fraction, hospitals]);
  useEffect(() => {
    if (routeId !== 'M09-514' || hospitals) return;
    const controller = new AbortController();
    fetch('/data/hospitals.geojson', { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw Error('No disponible');
        return r.json();
      })
      .then((data: Hospitals) => {
        setHospitals(data);
        setHospitalError('');
      })
      .catch((e) => {
        if (e.name !== 'AbortError')
          setHospitalError('Contexto hospitalario no disponible. La evaluación sigue funcionando.');
      });
    return () => controller.abort();
  }, [routeId, hospitals]);
  const p = result ? consumptionAt(result, activeCycle, fraction) : null;
  const position = geometry ? positionOnTrace(geometry, fraction) : null;
  const cartographic = geometry ? (traceSegments(geometry).at(-1)?.to ?? 0) : 0;
  return (
    <div className="map-explorer">
      <div className="map-tools">
        <div className="map-modes" aria-label="Vista del mapa">
          <button aria-pressed={mode === 'route'} onClick={() => setMode('route')}>
            Recorrido
          </button>
          <button
            aria-pressed={mode === 'energy'}
            disabled={!result}
            onClick={() => setMode('energy')}
          >
            Consumo estimado
          </button>
        </div>
        {routeId === 'M09-514' && (
          <label className="check-field">
            <input
              type="checkbox"
              checked={context}
              onChange={(e) => setContext(e.target.checked)}
            />
            Contexto hospitalario
          </label>
        )}
      </div>
      <div className="map-shell">
        <div
          className="map-canvas"
          data-route-rendered={painted}
          ref={container}
          aria-label="Mapa de ramales históricos"
          hidden={fallback}
        />
        {fallback && <Outline features={geometry} fraction={fraction} />}
        <div className="map-caption">
          <span className="map-dot" />
          {note}
        </div>
        {selectedHospital && context && routeId === 'M09-514' && (
          <div className="hospital-callout">
            <button
              aria-label="Cerrar referencia hospitalaria"
              onClick={() => setSelectedHospital(null)}
            >
              ×
            </button>
            <b>{selectedHospital.shortName}</b>
            <p>{selectedHospital.address}</p>
            <small>{selectedHospital.limitation}</small>
            <a href={selectedHospital.officialUrl} target="_blank" rel="noreferrer">
              Referencia institucional ↗
            </a>
          </div>
        )}
      </div>
      <div className="map-legend">
        {mode === 'route' ? (
          <>
            <span>
              <i style={{ background: '#9D2148' }} />
              Trazo 1
            </span>
            {(geometry?.features.length ?? 0) > 1 && (
              <span>
                <i style={{ background: '#B28E5C' }} />
                Trazo 2 y siguientes
              </span>
            )}
          </>
        ) : (
          <>
            <span>
              <i style={{ background: '#027A35' }} />
              Sobre la reserva + 10 puntos
            </span>
            <span>
              <i style={{ background: '#AC6D14' }} />
              Cerca de la reserva
            </span>
            <span>
              <i style={{ background: '#B51C42' }} />
              Reserva alcanzada
            </span>
          </>
        )}
        <span>
          <i style={{ background: '#266CB4' }} />
          Punto explorado
        </span>
        {context && routeId === 'M09-514' && (
          <span>
            <i style={{ background: '#8F4889' }} />
            Hospital
          </span>
        )}
      </div>
      <div className="map-scrub">
        <div className="field">
          <label htmlFor="map-cycle">Vuelta del día</label>
          <select
            id="map-cycle"
            value={activeCycle}
            disabled={!result || stale}
            onChange={(e) => setCycle(Number(e.target.value))}
          >
            {Array.from({ length: result?.scenario.operation.cycles ?? 1 }, (_, i) => (
              <option key={i} value={i + 1}>
                {i + 1} de {result?.scenario.operation.cycles ?? 1}
              </option>
            ))}
          </select>
        </div>
        <div className="distance-slider">
          <label htmlFor="map-distance">
            Explora el recorrido · trazo {position?.trace ?? '—'}
          </label>
          <input
            type="range"
            id="map-distance"
            min="0"
            max="1000"
            step="1"
            value={Math.round(fraction * 1000)}
            disabled={!geometry?.features.length || !result || stale}
            onChange={(e) => setFraction(Number(e.target.value) / 1000)}
            aria-valuetext={`${num(fraction * (result?.scenario.route.cycleKm ?? cartographic), 2)} kilómetros dentro del ciclo`}
          />
        </div>
      </div>
      <div className="map-readout">
        <span>
          <b>{p ? num(p.km, 1) : '—'} km</b>acumulados del día
        </span>
        <span>
          <b>{p ? num(p.kwh, 2) : '—'} kWh</b>consumo estimado
        </span>
        <span>
          <b className={p && result && p.soc < result.scenario.energy.socMin ? 'negative' : ''}>
            {p ? `${num(Math.max(0, p.soc) * 100, 1)}%` : '—'}
          </b>
          {p && p.soc < 0 ? 'Energía agotada en el modelo' : 'batería restante estimada'}
        </span>
      </div>
      <p className="map-method">
        Distribución uniforme por distancia; incluye adicionales proporcionalmente, sin tráfico ni
        pendientes. {stale && 'Resultado anterior; espera el cálculo o corrige las entradas. '}
        {result &&
          Math.abs(cartographic - result.scenario.route.cycleKm) > 0.02 &&
          `Cartografía: ${num(cartographic, 2)} km; ciclo editado: ${num(result.scenario.route.cycleKm, 2)} km. `}
        El punto explorado no representa un vehículo real.
      </p>
      {routeId === 'M09-514' && context && (
        <details className="hospital-references">
          <summary>Zona de Hospitales: referencias y límites</summary>
          <p>
            Ubicaciones aproximadas de inmuebles; no paradas, cobertura comprobada ni demanda.
            Coordenadas © OpenStreetMap contributors,{' '}
            <a
              href="https://opendatacommons.org/licenses/odbl/1-0/"
              target="_blank"
              rel="noreferrer"
            >
              ODbL 1.0
            </a>
            .
          </p>
          {hospitalError && <p role="status">{hospitalError}</p>}
          <ul>
            {hospitals?.features.map((f) => (
              <li key={f.properties.shortName}>
                <button className="text-button" onClick={() => setSelectedHospital(f.properties)}>
                  {f.properties.shortName}
                </button>
                <span>{f.properties.address}</span>
                <a href={f.properties.officialUrl} target="_blank" rel="noreferrer">
                  Fuente institucional ↗
                </a>
              </li>
            ))}
          </ul>
          <a href="/data/hospitals-manifest.json" target="_blank" rel="noreferrer">
            Procedencia y licencia de la capa
          </a>
        </details>
      )}
    </div>
  );
}
