import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const base = new URL('../docs/desarrollo/recursos-hospitales/', import.meta.url);
const raw = await readFile(new URL('osm-hospitales-original.json', base));
const osm = JSON.parse(raw);
const selection = JSON.parse(await readFile(new URL('seleccion.json', base), 'utf8'));
const features = selection.map((item) => {
  const element = osm.elements.find((e) => e.type === 'way' && e.id === item.osmId);
  if (!element?.center) throw new Error(`No hay coordenadas originales para ${item.osmId}`);
  return {
    type: 'Feature',
    geometry: { type: 'Point', coordinates: [element.center.lon, element.center.lat] },
    properties: {
      ...item,
      osmUrl: `https://www.openstreetmap.org/way/${item.osmId}`,
      sourceId: 'CTX-OSM',
      coordinateNature: 'tercero; centro de bounding box OSM',
      date: osm.osm3s.timestamp_osm_base,
      consulted: '2026-10-06',
      license: 'ODbL-1.0',
    },
  };
});
const output = `${JSON.stringify({ type: 'FeatureCollection', features }, null, 2)}\n`;
await writeFile(new URL('../public/data/hospitals.geojson', import.meta.url), output);
const manifest = {
  name: 'Contexto hospitalario de Ruta 1',
  author: 'OpenStreetMap contributors; selección del equipo Aragonenes',
  sourceUrl: 'https://overpass-api.de/api/interpreter',
  queryFile: 'docs/desarrollo/recursos-hospitales/consulta-overpass.txt',
  originalFile: 'docs/desarrollo/recursos-hospitales/osm-hospitales-original.json',
  originalSha256: createHash('sha256').update(raw).digest('hex'),
  originalBytes: raw.length,
  derivedFile: 'public/data/hospitals.geojson',
  derivedSha256: createHash('sha256').update(output).digest('hex'),
  derivedBytes: Buffer.byteLength(output),
  coverage: 'Cinco referencias hospitalarias; Zona de Hospitales / Huipulco, Tlalpan',
  date: osm.osm3s.timestamp_osm_base,
  consulted: '2026-10-06',
  license: 'ODbL-1.0',
  licenseUrl: 'https://opendatacommons.org/licenses/odbl/1-0/',
  licenseStatus: 'OPEN_WITH_ATTRIBUTION',
  redistribution: true,
  modification: true,
  attributionRequired: true,
  shareAlike: true,
  method:
    'Centros de bounding box devueltos por Overpass para inmuebles seleccionados. No geocodificación ni medición de entradas. Nombres/domicilios contrastados con referencias institucionales de seleccion.json.',
  limitations:
    'Contexto aproximado, no cobertura efectiva, paradas, demanda ni beneficio sanitario. No interviene en el motor. La fecha OSM no comprueba vigencia del servicio.',
  municipalCatalog: {
    url: 'https://www.datos.cdmx.gob.mx/dataset/hospitales-y-centros-de-salud',
    license: 'CC BY 4.0',
    use: 'Consultado para cobertura: instalaciones del Gobierno CDMX; no usado como ubicación de estos institutos federales.',
  },
};
await writeFile(
  new URL('../public/data/hospitals-manifest.json', import.meta.url),
  `${JSON.stringify(manifest, null, 2)}\n`,
);
console.log(`${features.length} referencias hospitalarias; ${manifest.originalSha256}`);
