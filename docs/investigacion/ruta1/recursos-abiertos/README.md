# Recursos geográficos recuperados y derivación de Ruta 1

Consulta y descarga: **2026-10-06**. Fuente: Portal de Datos Abiertos CDMX, SEMOVI y Organismo Regulador de Transporte. Las fichas oficiales declaran `CC-BY-4.0-ESP`, correspondiente a [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Se permite redistribución y modificación con atribución, enlace a licencia e identificación de cambios. No implica aval institucional del análisis.

## Archivos y cobertura

| Archivo conservado | Procedencia y uso |
| --- | --- |
| [semovi-rutas-consulta-2026-10-06.rar](semovi-rutas-consulta-2026-10-06.rar) | M09: original RAR sin modificar; contiene `Concesionado_Ruta.kmz`, con fecha interna 2022-09-02, y 995 registros KML. |
| [semovi-rutas-diccionario.xlsx](semovi-rutas-diccionario.xlsx) | M09: diccionario original de los campos del conjunto. |
| [semovi-rutas-catalogo.json](semovi-rutas-catalogo.json) | M09: respuesta original de API con institución, licencia, recursos y fechas del catálogo. |
| [ort-corredores-consulta-2026-10-06.zip](ort-corredores-consulta-2026-10-06.zip) | M10: original ZIP sin modificar; rutas y paradas de otro universo. KMZ de rutas fechado 2024-05-08, con 331 registros. |
| [ort-corredores-diccionario.xlsx](ort-corredores-diccionario.xlsx) | M10: diccionario original del conjunto de corredores y servicios zonales. |
| [ort-corredores-catalogo.json](ort-corredores-catalogo.json) | M10: respuesta original de API con licencia y procedencia. |
| [ruta1-san-fernando-geometria-candidata.geojson](ruta1-san-fernando-geometria-candidata.geojson) | Derivación propia de M09: dos líneas seleccionadas, propiedades de origen y longitud calculada. CC BY 4.0, atribución SEMOVI CDMX; selección, exclusión de Z y cálculo indicados. |

Nombre original, URL directa, institución, fecha, tamaño, SHA-256 y permisos de cada archivo están en [M09 y M10 del registro](../fuentes-documento-maestro.json). Los seis originales se conservaron sin modificación. Una actualización deberá usar otro nombre fechado y conservar la versión anterior; no sobrescribirla.

Catálogos: [SEMOVI, transporte de ruta](https://datos.cdmx.gob.mx/dataset/ubicacion-de-rutas-del-transporte-publico-concesionado-de-ruta) y [ORT, corredores y servicios zonales](https://datos.cdmx.gob.mx/dataset/rutas-y-corredores-del-transporte-publico-concesionado). La API es `https://datos.cdmx.gob.mx/api/3/action/package_show?id=<slug del catálogo>`.

**Las fechas de publicación/migración de agosto de 2026 no actualizan automáticamente el contenido cartográfico.** Las fechas internas son indicios de antigüedad del archivo, no certificación de fecha de levantamiento. No se encontró en este recurso un corte operativo de octubre de 2026. ORT no sustituye el registro del ramal ni documenta por sí mismo Línea 14 de 2026.

## Transformación reproducible

Cadena: **M09 → RAR original → KMZ/doc.kml → selección exacta → coordenadas XY → longitud por trazo → GeoJSON candidato**. No interviene un servicio de mapas propietario ni un modelo de operación.

1. Verificar SHA-256 y tamaño contra M09 antes de extraer. Descomprimir el RAR en una carpeta temporal con `7z`; abrir el KMZ como ZIP y leer `doc.kml`. Mantener intacto el original.
2. Interpretar XML con espacio de nombres `http://www.opengis.net/kml/2.2`. Leer `ExtendedData/Data/value`. Seleccionar simultáneamente `RUTA == "1"` y `RAMAL == "METRO CU - SAN FERNANDO HUIPULCO"`. La selección da **un Placemark, id 514**, con detalle `001 METRO CU - SAN FERNANDO HUIPULCO CC OD`.
3. Conservar por separado sus dos `LineString`, en orden XML. Parsear cada tupla como longitud, latitud y Z. Hay **61 y 55 vértices**; Z es cero y se excluye del GeoJSON porque no acredita elevación. No simplificar las líneas ni unir extremos.
4. Para cada par consecutivo, convertir grados a radianes y calcular Haversine: `a = sin²(Δlat/2) + cos(lat1)·cos(lat2)·sin²(Δlon/2)`; `d = 2R·atan2(√a, √(1−a))`, con **R = 6,371,008.8 m** y `a` acotado a [0,1] por precisión numérica. Sumar cada línea de manera independiente.
5. Crear una Feature por línea, preservando los cuatro campos originales, ids XML, cantidad de vértices, resultado en metros, método, licencia, fechas y límites. No atribuir sentidos operativos verificados. Las coordenadas XY siguen en grados geográficos del KML, orden longitud/latitud.

| Resultado derivado | Valor sin redondeo de almacenamiento | Presentación aproximada |
| --- | ---: | ---: |
| Trazo 1 | 10,146.227164043823 m | 10.146 km |
| Trazo 2 | 10,193.7854529633 m | 10.194 km |
| Suma de trazos | 20,340.012617007122 m | 20.340 km |

La precisión almacenada permite reproducir el cálculo; no indica precisión métrica del levantamiento. Los extremos no coinciden exactamente y no se añadió distancia para cerrarlos. **Esta suma no es un ciclo operativo actual medido.** No incluye posibles variantes, kilómetros vacíos, patio, topografía, velocidad, tiempos, detenciones o vueltas diarias. No acredita flota ni demanda. La naturaleza es derivada de una fuente oficial histórica, nivel A, con esas limitaciones heredadas.

Para convertirla en un parámetro del ramal actual se necesitan derrotero vigente por sentido y contraste con operación reciente. Mientras tanto sólo puede usarse como geometría candidata y referencia de sensibilidad expresamente histórica. Los ceros de Z no permiten calcular pendientes o consumo por desnivel.

## Derechos de otros recursos

Los PDF comerciales y oficiales consultados temporalmente durante la investigación no se incorporaron aquí porque no se verificó permiso de redistribución del recurso completo. Esta carpeta no cambia los derechos de los cuatro PDF locales ni el alcance de `docs/inventario.json`. No guardar respuestas HTML de error como si fueran originales recuperados.
