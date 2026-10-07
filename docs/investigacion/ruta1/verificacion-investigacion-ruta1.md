# Verificación del expediente documental

Ejecutada el **2026-10-06** sobre los archivos locales de esta entrega. No valida operación, consumo, demanda ni viabilidad real del ramal.

## Tercera revisión: cierre público para el hackatón

El usuario aclaró que el alcance es un prototipo exploratorio útil para estudiantes y profesionales, sin depender de aforos privados, contratos o inspecciones. Se ajustó el maestro y el método para distinguir suficiencia documental del hackatón, calibración del servicio e inversión real.

- Se recuperaron seis referencias adicionales M23–M28: precios nacionales de combustible fechados, actividad institucional INCan, contexto ICCT y conexiones de nodos. Se leyeron fuentes primarias por terminal con HTTP 200 cuando la herramienta web devolvió errores de acceso; no se archivaron los originales sin licencia verificada.
- Se verificaron 28 IDs M únicos y reutilizaciones resolubles con los 58 S y 26 H. No se sumaron los registros como fuentes únicas ni se reescribieron estados históricos.
- Se comprobaron 55 filas únicas de bases de decisión: 23 referencias de distinto ámbito y 32 faltantes, con valor y nivel vacíos. Las referencias nacionales de precios no completan el precio efectivo del ramal; consultas hospitalarias no completan demanda.
- Los 14 parámetros exploratorios tienen naturaleza `supuesto`, nivel F, fundamento y dependencias. Los intervalos elegidos no son mediciones ni rangos estadísticos. El caso sin apoyo usa cero como supuesto de política declarado, sin reemplazar el campo de apoyo real pendiente.
- Se actualizaron las fechas de M27 distinguiendo informe de enero de 2023 de publicación HTML el 2023-02-01, comprobada en `datePublished`; no se infirió el día a partir del sufijo de URL.
- Se comprobaron enlaces locales, citas y lectura de JSON/CSV. Los hashes y tamaños de los seis originales abiertos/GeoJSON y los cuatro PDF preexistentes siguen coincidiendo. `git diff --check` pasó.
- Se revisó transferencia: el consumo de articulado y la reducción LCA de autobuses 12–15 m sólo son contexto; quedan fuera de los cálculos de van/minibús. La primera comparación comercial propone gasolina/EV equivalentes, sin tratar precio gasolina como precio diésel.

No se implementaron simulación, dashboard o arquitectura. La base queda suficiente para planear el prototipo condicional; las comprobaciones G01–G08 siguen reservadas a una evaluación real o marcadas como condiciones simuladas. No hubo solicitudes enviadas, contactos externos, commit ni push en esta tarea.

## Segunda revisión: bases de decisión y maestro

Verificación adicional del **2026-10-06**, posterior a la primera entrega descrita abajo:

- Se comprobaron 22 IDs M únicos y sus reutilizaciones contra los registros S (58) y H (26), sin alterar sus estados históricos. Las citas M/S/H del maestro y las referencias de las 49 bases de decisión resuelven a registros existentes.
- Las 49 filas de `bases-decision-ruta1.csv` tienen IDs únicos. Sus 32 faltantes conservan valor y nivel vacíos, estado `NO_VERIFICADO`; no se introdujeron ceros ni rangos inventados. Las otras 17 entradas conservan ámbito histórico, comercial, normativo general o derivado, sin convertirlas en observación actual del ramal.
- Los seis originales geográficos/diccionarios/catálogos abiertos coinciden en SHA-256 y tamaño con M09/M10. El permiso CC BY 4.0 se documenta en las respuestas oficiales conservadas. El GeoJSON derivado también coincide con su registro de tamaño y hash.
- Se extrajo nuevamente el RAR original en una carpeta temporal y se leyó su KML: una coincidencia exacta del ramal, Placemark 514, dos líneas de 61 y 55 vértices. Se contrastaron todas las coordenadas y se recalculó Haversine por línea: 10,146.227164 m y 10,193.785453 m, suma 20,340.012617 m. No se añadieron conexiones, vueltas o kilómetros diarios.
- Los cuatro PDF preexistentes conservan los hashes de `inventario.json`, que no se amplió ni regeneró. No se incorporaron originales comerciales o de licencia desconocida.
- Se comprobaron enlaces locales de maestro, índices, método, evaluación, recursos y borrador, así como lectura JSON/CSV y ausencia de espacios finales. `git diff --check` pasó. No se garantiza disponibilidad permanente de enlaces externos.
- Revisión de alcance: G01–G08 son criterios propuestos; G01/G08 parciales y G02–G07 pendientes. M15 es factor histórico SEN 2024 indicado para reporte COA 2026, M19 es precedente de otras rutas con plazo concluido y M18 es mínimo general bruto. Ninguno acredita ahorro, salario real, subsidio elegible o carga del ramal.

No se construyeron aplicación o simulación, ni se enviaron solicitudes, mensajes, cotizaciones o cambios al remoto. El borrador SEMOVI añade la relación entre geometría histórica y derrotero vigente; permanece sin enviar.

## Verificación de la primera entrega

- Registro: 58 fuentes con IDs únicos, metadatos de procedencia, acceso, derechos y recuperación. Incluye cuatro PDF preexistentes, un documento propio y 53 referencias externas cuyo original no fue conservado.
- Parámetros: 106 filas con referencias resolubles, unidades, naturaleza, ámbito y niveles A–F. Los faltantes permanecen `NO VERIFICADO`, sin valores cero. Los resultados con entradas supuestas conservan F; la conversión de unidades del benchmark EPA conserva E.
- Matriz de datos: 63 filas; matrices de fuentes/búsquedas: 14 categorías A–N. Se comprobó que todos los IDs de fuente apuntan al registro.
- Se comprobaron los enlaces locales de los documentos revisados y las fichas. No se validó disponibilidad permanente de las URLs externas.
- Los hashes SHA-256 de los cuatro PDF originales coinciden con el [inventario](../../inventario.json); no se regeneraron ni sobrescribieron sus extracciones.
- No se incorporaron originales nuevos, archivos de aplicación o modelos. El borrador SEMOVI permanece sin enviar.

## Recuperación pendiente comprobada

Se intentó recuperar a un archivo temporal el ZIP oficial GTFS localizado (S24), con `curl`, siguiendo redirecciones y con límite de tiempo. La herramienta terminó con código **6**, sin descargar el archivo: `Could not resolve host: datos.cdmx.gob.mx`. El texto identifica un fallo de resolución de nombre del entorno; no demuestra que el recurso no exista. La consulta web institucional localizó el enlace y su licencia, pero no permitió conservar sus bytes originales en el repositorio.

La cola de recuperación diferencia siete referencias de productos/catálogos con condiciones de reutilización verificadas (S22, S23, S24, S35, S37, S38 y S55) de fuentes cuyo archivo completo mantiene licencia UNKNOWN. Para las primeras quedan pendientes selección de recurso/versionado, descarga, metadatos del archivo y checksum; para las segundas se conservan cita y paráfrasis hasta verificar permiso. Las fichas propias no se contabilizan como descarga.

## Cómo repetir las comprobaciones

Leer JSON y CSV con parsers que respeten UTF-8 y comillas; comprobar unicidad de IDs y resolución de referencias; verificar que cada original conservado existe y coincide con SHA-256; que los no conservados tienen ruta local/hash/fecha de descarga nulos; y que las licencias verificadas cuentan con referencia de términos. Resolver enlaces locales decodificando sus rutas Unicode. Revisar también fronteras/unidades/fechas y cada fórmula contra las entradas, evitando que un cálculo mejore artificialmente el nivel de evidencia.

El resultado es **consistencia documental**, con limitaciones expresas de acceso y evidencia. No satisface los requisitos pendientes del [Definition of Done](metodologia-ruta1.md#definition-of-done).
