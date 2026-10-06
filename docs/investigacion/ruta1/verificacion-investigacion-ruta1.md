# Verificación del expediente documental

Ejecutada el **2026-10-06** sobre los archivos locales de esta entrega. No valida operación, consumo, demanda ni viabilidad real del ramal.

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
