import { useEffect, useRef, useState } from 'react';
import { Hospital as HospitalIcon, Flag, Maximize, SkipBack, SkipForward } from 'lucide-react';
import { PointCard, DayCard, HospitalCard } from './MapCards';
import { MapSymbol, VehicleIcon, type Hospital } from './MapSymbols';
import * as maplibregl from 'maplibre-gl';
import mapWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import type { FeatureCollection, LineString, Point } from 'geojson';
import type { Result } from '../domain/schema';
import {
  traceSegments,
  positionOnTrace,
  consumptionAt,
  nearestFraction,
  batteryLimit,
} from '../domain/geometry';
import { num } from '../ui/format';
import 'maplibre-gl/dist/maplibre-gl.css';
maplibregl.setWorkerUrl(mapWorkerUrl);
type Hospitals = FeatureCollection<Point, Hospital>;
const empty = { type: 'FeatureCollection' as const, features: [] };
function energyColor(soc: number, reserve: number) {
  return soc < reserve ? '#B51C42' : soc < reserve + 0.1 ? '#AC6D14' : '#027A35';
}
function fitRoute(
  m: maplibregl.Map,
  geometry: FeatureCollection<LineString>,
  hospitals: Hospitals | null,
  wide: boolean,
) {
  const coords = [
    ...geometry.features.flatMap((f) => f.geometry.coordinates),
    ...(hospitals?.features.map((f) => f.geometry.coordinates) ?? []),
  ];
  if (!coords.length) return;
  const bounds = new maplibregl.LngLatBounds();
  coords.forEach((p) => bounds.extend([p[0]!, p[1]!]));
  m.fitBounds(bounds, {
    padding: wide ? { top: 45, left: 270, right: 70, bottom: 170 } : 55,
    duration: 0,
    maxZoom: 14,
  });
}
function hospitalGroups(
  m: maplibregl.Map | null,
  data: Hospitals | null,
): { features: Hospitals['features']; coordinates: number[]; showLabel: boolean }[] {
  const groups: { features: Hospitals['features']; coordinates: number[] }[] = [];
  if (!m || !data) return [];
  for (const f of data.features) {
    const p = m.project([f.geometry.coordinates[0]!, f.geometry.coordinates[1]!]);
    const group = groups.find(
      (g) => m.project([g.coordinates[0]!, g.coordinates[1]!]).dist(p) < 52,
    );
    if (group) group.features.push(f);
    else groups.push({ features: [f], coordinates: f.geometry.coordinates });
  }
  const labels: { x: number; y: number; width: number }[] = [];
  return groups.map((g) => {
    const p = m.project([g.coordinates[0]!, g.coordinates[1]!]);
    const width = g.features[0]!.properties.shortName.length * 7 + 12;
    const label = { x: p.x - width / 2, y: p.y + 24, width };
    const showLabel =
      g.features.length === 1 &&
      m.getZoom() >= 14 &&
      !labels.some(
        (other) =>
          Math.abs(label.y - other.y) < 24 &&
          label.x < other.x + other.width &&
          other.x < label.x + label.width,
      );
    if (showLabel) labels.push(label);
    return { ...g, showLabel };
  });
}
function Outline({
  features,
  fraction,
  result,
  hospitals,
  onHospital,
  onVehicle,
  stale,
  cycle,
  mode,
  onLimit,
}: {
  cycle: number;
  mode: 'route' | 'energy';
  onLimit: () => void;
  result: Result | null;
  hospitals: Hospitals | null;
  onHospital: (hospital: Hospital) => void;
  onVehicle: () => void;
  stale: boolean;
  features: FeatureCollection<LineString> | null;
  fraction: number;
}) {
  const lines = features?.features.map((f) => f.geometry.coordinates) ?? [];
  const points = [
    ...lines.flat(),
    ...(hospitals?.features.map((f) => f.geometry.coordinates) ?? []),
  ];
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
  const limit = result ? batteryLimit(result) : null;
  const reserve =
    features && limit?.withinDay && limit.cycle === cycle
      ? positionOnTrace(features, limit.fraction)
      : null;
  const reservePoint = reserve ? project(reserve.coordinates) : null;
  return (
    <svg
      viewBox="0 0 600 380"
      role="group"
      aria-label="Trazos históricos del ramal, sin mapa base"
      className="map-outline"
    >
      {mode === 'route' &&
        lines.map((line, i) => (
          <polyline
            key={i}
            points={line.map((p) => project(p).join(',')).join(' ')}
            fill="none"
            stroke={i === 0 ? '#9D2148' : '#B28E5C'}
            strokeWidth="5"
            strokeLinecap="round"
          />
        ))}
      {mode === 'energy' &&
        result &&
        features &&
        traceSegments(features).map((segment, i, all) => {
          const point = consumptionAt(
            result,
            cycle,
            (segment.from + segment.to) / 2 / (all.at(-1)?.to || 1),
          );
          return (
            <polyline
              key={i}
              points={[project(segment.start), project(segment.end)]
                .map((p) => p.join(','))
                .join(' ')}
              fill="none"
              stroke={energyColor(point.soc, result.scenario.energy.socMin)}
              strokeWidth="5"
              strokeLinecap="round"
            />
          );
        })}
      {mode === 'energy' && reservePoint && (
        <foreignObject x={reservePoint[0]! - 22} y={reservePoint[1]! - 65} width="44" height="44">
          <button
            className="map-symbol reserve-outline-symbol"
            aria-label="Límite de batería antes de la reserva"
            disabled={stale}
            onClick={onLimit}
          >
            <Flag size={21} aria-hidden="true" />
          </button>
        </foreignObject>
      )}
      {hospitals?.features.map((f) => {
        const [x, y] = project(f.geometry.coordinates);
        return (
          <foreignObject
            key={f.properties.shortName}
            x={x! - 22}
            y={y! - 22}
            width="44"
            height="44"
          >
            <button
              className="map-symbol hospital-symbol"
              aria-label={`Hospital: ${f.properties.shortName}`}
              onClick={() => onHospital(f.properties)}
            >
              <HospitalIcon size={22} aria-hidden="true" />
            </button>
          </foreignObject>
        );
      })}
      {marker && result && (
        <foreignObject x={marker[0]! - 22} y={marker[1]! - 22} width="44" height="44">
          <button
            className="map-symbol vehicle-symbol"
            aria-label="Vehículo del escenario"
            disabled={stale}
            onClick={onVehicle}
          >
            <VehicleIcon category={result.scenario.ev.category} />
          </button>
        </foreignObject>
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
  const hospitalTrigger = useRef<HTMLElement | null>(null);
  const [mode, setMode] = useState<'route' | 'energy'>('route');
  const [context, setContext] = useState(routeId === 'M09-514');
  const [cycle, setCycle] = useState(1);
  const [fraction, setFraction] = useState(0);
  const [fallback, setFallback] = useState(false);
  const [painted, setPainted] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [showVehicle, setShowVehicle] = useState(false);
  const [zoom, setZoom] = useState(12);
  const [note, setNote] = useState('Cargando cartografía histórica…');
  const activeCycle = Math.min(cycle, result?.scenario.operation.cycles ?? 1);
  const view = useRef({
    routeId,
    result,
    mode,
    context,
    cycle: activeCycle,
    fraction,
    hospitals,
    stale,
  });
  view.current = { routeId, result, mode, context, cycle: activeCycle, fraction, hospitals, stale };
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
            const color = energyColor(point.soc, v.result!.scenario.energy.socMin);
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
    const wide = (container.current?.clientWidth ?? 0) >= 720;
    const hospitalContext = v.context && v.routeId === 'M09-514' ? v.hospitals : null;
    const fitKey = `${v.routeId}:${wide}:${hospitalContext?.features.length ?? 0}`;
    if (selected.features.length && fitted.current !== fitKey) {
      fitRoute(m, selected, hospitalContext, wide);
      fitted.current = fitKey;
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
    const observer = new ResizeObserver(() => {
      map.current?.resize();
      update();
    });
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
        for (const id of ['selected', 'energy']) m.addSource(id, { type: 'geojson', data: empty });
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
        setMapReady(true);
        setZoom(m.getZoom());
        setNote('SEMOVI · geometría histórica 2022 · consumo uniforme supuesto');
        update();
      });
      m.on('click', (e) => {
        if (!view.current.stale && view.current.result && geometryRef.current.features.length) {
          const f = nearestFraction(geometryRef.current, [e.lngLat.lng, e.lngLat.lat]);
          const p = positionOnTrace(geometryRef.current, f);
          if (p && m.project([p.coordinates[0]!, p.coordinates[1]!]).dist(e.point) <= 20)
            setFraction(f);
        }
      });
      m.on('zoomend', () => setZoom(m.getZoom()));
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
    setShowVehicle(false);
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
  const limit = result ? batteryLimit(result) : null;
  const position = geometry ? positionOnTrace(geometry, fraction) : null;
  const cartographic = geometry ? (traceSegments(geometry).at(-1)?.to ?? 0) : 0;
  const frameRoute = () => {
    const m = map.current;
    if (!m || !geometry?.features.length) return;
    fitRoute(
      m,
      geometry!,
      context && routeId === 'M09-514' ? hospitals : null,
      (container.current?.clientWidth ?? 0) >= 720,
    );
  };
  const jump = (nextCycle: number, nextFraction: number) => {
    if (!result || stale || !geometry?.features.length) return;
    setCycle(nextCycle);
    setFraction(nextFraction);
    const target = positionOnTrace(geometry, nextFraction);
    const m = map.current;
    if (target && m && !m.getBounds().contains([target.coordinates[0]!, target.coordinates[1]!]))
      m.panTo([target.coordinates[0]!, target.coordinates[1]!], { duration: 0 });
  };
  const jumpLimit = () => {
    if (!limit?.withinDay) return;
    setMode('energy');
    jump(limit.cycle, limit.fraction);
  };
  const centerHospital = () => {
    const f = hospitals?.features.find(
      (f) => f.properties.shortName === selectedHospital?.shortName,
    );
    if (f)
      map.current?.jumpTo({
        center: [f.geometry.coordinates[0]!, f.geometry.coordinates[1]!],
        zoom: 17,
      });
  };
  const reservePosition =
    limit?.withinDay && limit.cycle === activeCycle && geometry
      ? positionOnTrace(geometry, limit.fraction)
      : null;
  const openHospital = (hospital: Hospital) => {
    hospitalTrigger.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setSelectedHospital(hospital);
  };
  const closeHospital = () => {
    setSelectedHospital(null);
    if (hospitalTrigger.current?.isConnected) hospitalTrigger.current.focus();
  };
  const groups =
    mapReady && context && routeId === 'M09-514' ? hospitalGroups(map.current, hospitals) : [];
  const openGroup = (group: ReturnType<typeof hospitalGroups>[number]) => {
    if (group.features.length === 1) {
      openHospital(group.features[0]!.properties);
      return;
    }
    const bounds = new maplibregl.LngLatBounds();
    group.features.forEach((f) =>
      bounds.extend([f.geometry.coordinates[0]!, f.geometry.coordinates[1]!]),
    );
    map.current?.fitBounds(bounds, {
      padding:
        (container.current?.clientWidth ?? 0) >= 720
          ? { top: 45, left: 270, right: 70, bottom: 170 }
          : 45,
      maxZoom: 17,
      duration: 0,
    });
  };
  return (
    <div className="map-explorer">
      <div className="map-tools">
        <div className="map-modes" aria-label="Vista del mapa">
          <button aria-pressed={mode === 'route'} onClick={() => setMode('route')}>
            Recorrido
          </button>
          <button
            aria-pressed={mode === 'energy'}
            disabled={!result || stale}
            onClick={() => setMode('energy')}
          >
            Batería en el recorrido
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
      <div className="map-stage">
        <div className="map-shell">
          <div
            className="map-canvas"
            data-route-rendered={painted}
            ref={container}
            aria-label="Mapa de ramales históricos"
            hidden={fallback}
          />
          {fallback && (
            <Outline
              features={geometry}
              fraction={fraction}
              cycle={activeCycle}
              mode={mode}
              onLimit={jumpLimit}
              result={result}
              stale={stale}
              hospitals={context && routeId === 'M09-514' ? hospitals : null}
              onHospital={openHospital}
              onVehicle={() => setShowVehicle((v) => !v)}
            />
          )}
          {mapReady && !fallback && map.current && position && result && (
            <MapSymbol map={map.current} coordinates={position.coordinates}>
              <button
                className="map-symbol vehicle-symbol"
                aria-label="Vehículo del escenario"
                aria-expanded={showVehicle}
                disabled={stale}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowVehicle((v) => !v);
                }}
              >
                <VehicleIcon category={result.scenario.ev.category} />
              </button>
            </MapSymbol>
          )}
          {!fallback &&
            map.current &&
            groups.map((group) => (
              <MapSymbol
                key={group.features.map((f) => f.properties.shortName).join('-')}
                map={map.current!}
                coordinates={group.coordinates}
              >
                <button
                  className="map-symbol hospital-symbol"
                  title={
                    group.features.length > 1
                      ? `Ver ${group.features.length} hospitales cercanos`
                      : group.features[0]!.properties.name
                  }
                  aria-label={
                    group.features.length > 1
                      ? `Ver ${group.features.length} hospitales cercanos`
                      : `Hospital: ${group.features[0]!.properties.shortName}`
                  }
                  onClick={(e) => {
                    e.stopPropagation();
                    openGroup(group);
                  }}
                >
                  <HospitalIcon size={22} aria-hidden="true" />
                  {group.features.length > 1 && (
                    <span className="hospital-cluster-count" aria-hidden="true">
                      {group.features.length}
                    </span>
                  )}
                </button>
                {group.showLabel && zoom >= 14 && (
                  <span className="hospital-map-label">
                    {group.features[0]!.properties.shortName}
                  </span>
                )}
              </MapSymbol>
            ))}
          {mapReady && !fallback && map.current && mode === 'energy' && reservePosition && (
            <MapSymbol map={map.current} coordinates={reservePosition.coordinates}>
              <button
                className="map-symbol reserve-symbol"
                aria-label="Límite de batería antes de la reserva"
                disabled={stale}
                onClick={jumpLimit}
              >
                <Flag size={21} aria-hidden="true" />
              </button>
            </MapSymbol>
          )}
          <div className="map-caption">
            <span className="map-dot" />
            {note}
          </div>
          <button
            className="map-reframe"
            aria-label="Encuadrar ruta"
            title="Encuadrar ruta"
            disabled={!geometry?.features.length || fallback}
            onClick={frameRoute}
          >
            <Maximize size={19} aria-hidden="true" />
          </button>
        </div>
        <div className={`map-hud ${stale ? 'is-stale' : ''}`}>
          <PointCard
            result={result}
            cycle={activeCycle}
            fraction={fraction}
            stale={stale}
            expanded={showVehicle}
            onToggle={() => setShowVehicle((v) => !v)}
          />
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
              Vehículo del escenario
            </span>
            {context && routeId === 'M09-514' && (
              <span>
                <i style={{ background: '#8F4889' }} />
                Hospital
              </span>
            )}
          </div>
          <DayCard
            result={result}
            stale={stale}
            onLimit={jumpLimit}
            canNavigate={!!geometry?.features.length}
          />
          {selectedHospital && context && routeId === 'M09-514' && (
            <HospitalCard
              hospital={selectedHospital}
              onClose={closeHospital}
              onCenter={centerHospital}
              canCenter={mapReady && !fallback}
            />
          )}
        </div>
      </div>
      <div className="map-journey">
        <div className="map-navigation" aria-label="Navegación del día simulado">
          <button
            className="secondary"
            disabled={!result || stale || !geometry?.features.length}
            onClick={() => jump(1, 0)}
          >
            <SkipBack size={14} aria-hidden="true" />
            Inicio del día
          </button>
          <button
            className="secondary"
            disabled={!result || stale || !geometry?.features.length}
            onClick={() => jump(result!.scenario.operation.cycles, 1)}
          >
            Fin del día
            <SkipForward size={14} aria-hidden="true" />
          </button>
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
      </div>
      <p className="map-method">
        Distribución uniforme por distancia; incluye adicionales proporcionalmente, sin tráfico ni
        pendientes. {stale && 'Resultado anterior; espera el cálculo o corrige las entradas. '}
        {result &&
          Math.abs(cartographic - result.scenario.route.cycleKm) > 0.02 &&
          `Cartografía: ${num(cartographic, 2)} km; ciclo editado: ${num(result.scenario.route.cycleKm, 2)} km. `}
        El vehículo representa una posición explorada, no seguimiento real.
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
                <button className="text-button" onClick={() => openHospital(f.properties)}>
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
