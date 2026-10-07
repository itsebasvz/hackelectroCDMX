import { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import mapWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
// MapLibre 6 distribuye un worker separado; Vite lo empaqueta para uso local.
maplibregl.setWorkerUrl(mapWorkerUrl);
import type { FeatureCollection, LineString } from 'geojson';
import 'maplibre-gl/dist/maplibre-gl.css';
interface Props {
  routeId: string;
}
function Outline({ features }: { features: FeatureCollection<LineString> | null }) {
  const lines = features?.features.map((f) => f.geometry.coordinates) ?? [];
  const points = lines.flat();
  if (!points.length)
    return (
      <div className="map-empty">
        La geometría se está cargando. Puedes continuar evaluando el escenario.
      </div>
    );
  const xs = points.map((p) => p[0]!);
  const ys = points.map((p) => p[1]!);
  const minX = Math.min(...xs),
    maxX = Math.max(...xs),
    minY = Math.min(...ys),
    maxY = Math.max(...ys);
  const project = (p: number[]) =>
    `${30 + ((p[0]! - minX) / (maxX - minX || 1)) * 540},${340 - ((p[1]! - minY) / (maxY - minY || 1)) * 310}`;
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
          points={line.map(project).join(' ')}
          fill="none"
          stroke={i === 0 ? '#9D2148' : '#B28E5C'}
          strokeWidth="5"
          strokeLinecap="round"
        />
      ))}
      <text x="30" y="370" fontSize="13" fill="#55585A">
        Geometría histórica · referencia sin mapa base
      </text>
    </svg>
  );
}
export default function RouteMap({ routeId }: Props) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const all = useRef<FeatureCollection<LineString> | null>(null);
  const active = useRef(routeId);
  active.current = routeId;
  const [fallback, setFallback] = useState(false);
  const [painted, setPainted] = useState(false);
  const [geometry, setGeometry] = useState<FeatureCollection<LineString> | null>(null);
  const [note, setNote] = useState('Cargando cartografía histórica…');
  const update = () => {
    const selected = {
      type: 'FeatureCollection' as const,
      features:
        all.current?.features.filter((f) => f.properties?.recordId === active.current) ?? [],
    };
    setGeometry(selected);
    const m = map.current;
    if (!m?.getSource('selected')) return;
    (m.getSource('selected') as maplibregl.GeoJSONSource | undefined)?.setData(selected);
    const coords = selected.features.flatMap((f) => f.geometry.coordinates);
    if (coords.length) {
      const bounds = new maplibregl.LngLatBounds();
      coords.forEach((p) => bounds.extend([p[0]!, p[1]!]));
      m.fitBounds(bounds, { padding: 50, duration: 0, maxZoom: 14 });
    }
  };
  useEffect(() => {
    let disposed = false;
    const controller = new AbortController();
    fetch('/data/routes.geojson', { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error('Geometría no disponible');
        return r.json();
      })
      .then((data: FeatureCollection<LineString>) => {
        if (disposed) return;
        all.current = data;
        update();
        const m = map.current;
        (m?.getSource('routes') as maplibregl.GeoJSONSource | undefined)?.setData(data);
      })
      .catch((e) => {
        if (e.name !== 'AbortError')
          setNote('No se pudo cargar la geometría; los cálculos siguen disponibles.');
      });
    try {
      if (!container.current) throw new Error('Sin contenedor');
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
        attributionControl: { compact: true },
        style: {
          version: 8,
          sources: {
            osm: {
              type: 'raster',
              tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
              tileSize: 256,
              attribution:
                '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> · SEMOVI <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>',
              maxzoom: 19,
            },
          },
          layers: [
            {
              id: 'base',
              type: 'raster',
              source: 'osm',
              paint: { 'raster-opacity': 0.9, 'raster-saturation': -0.85 },
            },
          ],
        },
      });
      map.current = m;
      m.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
      m.on('load', () => {
        if (disposed) return;
        m.addSource('routes', {
          type: 'geojson',
          data: all.current ?? { type: 'FeatureCollection', features: [] },
        });
        m.addLayer({
          id: 'all-routes',
          type: 'line',
          source: 'routes',
          paint: { 'line-color': '#777477', 'line-width': 1, 'line-opacity': 0.22 },
        });
        m.addSource('selected', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] },
        });
        m.addLayer({
          id: 'selected-casing',
          type: 'line',
          source: 'selected',
          paint: { 'line-color': '#ffffff', 'line-width': 8 },
        });
        m.addLayer({
          id: 'selected-route',
          type: 'line',
          source: 'selected',
          paint: { 'line-color': '#9D2148', 'line-width': 4 },
        });
        setNote('SEMOVI · archivo interno 2022 · tecnología desconocida');
        update();
      });
      m.on('error', () =>
        setNote(
          'Mapa base parcialmente disponible. Geometría y cálculos locales permanecen disponibles.',
        ),
      );
      m.on('render', () => {
        if (m.getLayer('selected-route')) {
          const visible = m.queryRenderedFeatures({ layers: ['selected-route'] });
          setPainted(visible.some((f) => f.properties.recordId === active.current));
        }
      });
    } catch {
      setFallback(true);
      setNote(
        'Vista local sin WebGL · SEMOVI <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>',
      );
    }
    return () => {
      disposed = true;
      controller.abort();
      map.current?.remove();
      map.current = null;
    };
  }, []);
  useEffect(() => {
    setPainted(false);
    update();
  }, [routeId]);
  return (
    <div className="map-shell">
      <div
        className="map-canvas"
        data-route-rendered={painted}
        ref={container}
        aria-label="Mapa de ramales históricos"
        hidden={fallback}
      />
      {fallback && <Outline features={geometry} />}
      <div className="map-caption">
        <span className="map-dot" />
        {note}
      </div>
    </div>
  );
}
