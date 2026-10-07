# Contexto hospitalario de Ruta 1

Cinco referencias para explicar la relevancia de la Zona de Hospitales, sin transformarlas en paradas, aforos o demanda. Ninguna cambia el motor de operación, energía o finanzas.

## Original y licencia

- Original: [osm-hospitales-original.json](osm-hospitales-original.json), 3543 bytes, SHA-256 `b6489d91cc4dd07c75b21505e9848679c0d481a4aa3cf5b85c578991aaf18174`.
- Autor: OpenStreetMap contributors; recuperación por Overpass API.
- Consulta exacta: [consulta-overpass.txt](consulta-overpass.txt). No se descargó una base completa ni teselas.
- Licencia: [ODbL 1.0](https://opendatacommons.org/licenses/odbl/1-0/), con atribución y obligaciones de compartir la base derivada bajo la misma licencia. [Aviso OSM](https://www.openstreetmap.org/copyright). La CC BY de documentación propia y MIT de código no relicencian esta capa ni su original.
- Consulta local: 2026-10-06, America/Mexico_City. Marca de la base: `2026-10-07T03:28:51Z` (UTC); no se interpreta como fecha de comprobación de operación o inspección hospitalaria.

Los centros vienen del bounding box de inmuebles OSM: aproximación cartográfica, sin medir entrada. INCan tiene más de un inmueble; se conservó sólo la referencia seleccionada. Gea es uno de varios edificios etiquetados «GEA»; no se afirma exactitud de acceso.

## Selección y recuperación institucional

[seleccion.json](seleccion.json) registra nombres, domicilios, objetos OSM, referencias institucionales, fecha y límites. INCMNSZ permitió recuperar texto de la página institucional. Los demás domicilios se corroboraron con resultados indexados de páginas institucionales y antecedentes del expediente; los intentos directos sufrieron timeout, restricciones TLS, red o 403. Esas incidencias están registradas y no equivalen a inspección ni vigencia garantizada. No se redistribuyó HTML ni PDF sin licencia.

El [catálogo oficial sanitario CDMX](https://www.datos.cdmx.gob.mx/dataset/hospitales-y-centros-de-salud), con CC BY 4.0, describe instalaciones del Gobierno CDMX; se consultó su cobertura y no se utilizó para atribuir coordenadas a estos institutos federales. La ubicación cartográfica de los cinco puntos procede exclusivamente de OSM.

La consulta original también contiene otros edificios GEA. Se mantiene intacta; la selección excluye jardines y no suma los edificios como hospitales independientes. INR, INER, INCMNSZ e INCan usan objetos `217015185`, `217108471`, `217109092` y `217109099`; la referencia Gea usa `669622778`.

## Reproducción y publicación

```bash
node scripts/preparar-hospitales.mjs
```

Lee el original y la selección sin red y genera `public/data/hospitals.geojson` y `hospitals-manifest.json`, con hashes, tamaños, licencia y método. La capa derivada se redistribuye bajo ODbL 1.0. No sobrescribe originales ni amplía el inventario de los cuatro PDF.

La aplicación muestra atribución y referencias de cada inmueble. El contexto se inicia sólo con Ruta 1. No infiere distancia de caminata, entrada atendida, exposición, pasajeros o beneficio sanitario. Los objetos restantes de la consulta no aparecen en la capa seleccionada.
