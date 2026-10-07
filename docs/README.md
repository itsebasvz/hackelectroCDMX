# Índice documental — Reto 2: Electrifica tu flota

Actualizado el **6 de octubre de 2026**. Originales locales: **4 PDF, 221 páginas**; investigación de Ruta 1 con **58 referencias registradas**, incluidas esas cuatro fuentes. La presentación completa de EMA sustituyó las extracciones y referencias de las capturas anteriores. El equipo ya confirmó la elección del reto 2.

**Material publicable:** análisis propios, referencias, matrices, parámetros, inventario y licencias; también recursos geográficos con CC BY 4.0 explícita, atribución y procedencia. Los PDF, extracciones completas, transcripciones e imágenes permanecen sólo en la copia local y están excluidos de Git. Los enlaces de sus citas identifican la [fuente local y sus páginas](contexto/fuentes-locales.md); no ofrecen descargas de materiales sin permiso verificado.

**Lectura principal para orientar el siguiente paso:** [Documento maestro de Ruta 1](documento-maestro-ruta1.md). La investigación pública queda suficiente para orientar un prototipo exploratorio con supuestos declarados. Integra evidencia, valor humano y mecanismos de transición; compara compra financiada y proveedor de vehículos con condiciones jurídicas, carga, servicio y protección económica. No acredita viabilidad ni adopta una flota. Sus 28 referencias complementarias y el seguimiento de consultas están en el [registro M](investigacion/ruta1/fuentes-documento-maestro.json). El cierre público para el hackatón añade [55 bases de decisión](investigacion/ruta1/bases-decision-ruta1.csv), condiciones G01–G08, [14 parámetros F de prueba](investigacion/ruta1/parametros-exploratorios-hackaton.csv) y [seis originales geográficos abiertos con una derivación](investigacion/ruta1/recursos-abiertos/README.md), atribución y hashes.

## Organización

| Ubicación | Contenido | Punto de entrada |
| --- | --- | --- |
| `contexto/` | Síntesis del reto, guía de capacitación y revisión de licencia | [Síntesis](contexto/sintesis.md) y [licencias](contexto/licencia-proyecto.md) |
| `investigacion/ruta1/` | Evaluación, notas iniciales, parámetros, matrices, fuentes, fichas, método, búsquedas y transparencia | [Índice de Ruta 1](investigacion/ruta1/README.md) |
| `investigacion/latinoamerica/` | Análisis histórico y registro de sus referencias | [Índice de casos latinoamericanos](investigacion/latinoamerica/README.md) |
| `investigacion/ruta1/recursos-abiertos/` | Geografías oficiales, diccionarios, metadatos y derivación con CC BY 4.0 | [Procedencia y método](investigacion/ruta1/recursos-abiertos/README.md) |
| `originales/` | Cuatro PDF originales, sin modificaciones | [Inventario y hashes](inventario.json) |
| `fuentes/` | Cuatro extracciones paginadas de los PDF locales | [Tabla de PDF y extracciones](#pdf-locales) |
| `transcripciones-visuales/` (sólo local) | Revisiones manuales por documento y página | [Referencia local](contexto/fuentes-locales.md#materiales-derivados) |
| `assets/` (sólo local) | Imágenes recuperadas de los PDF | [Referencia local](contexto/fuentes-locales.md#materiales-derivados) |

Los expedientes de investigación agrupan sus análisis y evidencias. `fuentes/` contiene las extracciones de los PDF, mientras que los registros JSON y las fichas de referencias externas están dentro de cada expediente. `inventario.json` sigue describiendo únicamente los cuatro PDF originales. Los nombres de archivo y los identificadores S/H se conservaron; se actualizaron enlaces y rutas de procedencia al reorganizar.

## Ruta de lectura

Para discutir el producto futuro, comenzar por el [documento maestro](documento-maestro-ruta1.md) y usar la lista siguiente para auditar sus antecedentes.

1. [Síntesis de estudio](contexto/sintesis.md): requisitos del evento y antecedentes.
2. [Problemáticas del hackatón](contexto/fuentes-locales.md#problematica-electro-hackaton), especialmente [PDF 4](contexto/fuentes-locales.md#problematica-electro-hackaton) y [PDF 5](contexto/fuentes-locales.md#problematica-electro-hackaton), donde se define el reto 2.
3. [Guía de la presentación completa](contexto/presentacion.md): tecnologías, mercado, carga, costos, emisiones, encuestas y baterías.
4. [Presentación completa en Markdown](contexto/fuentes-locales.md#introduccion-electromovilidad): 60 páginas, con índice y recuperaciones visuales del PDF.
5. [PIM 2019–2024](contexto/fuentes-locales.md#pim-2019-2024), especialmente [electromovilidad, PDF 54](contexto/fuentes-locales.md#pim-2019-2024) y [taxis, PDF 56](contexto/fuentes-locales.md#pim-2019-2024).
6. [Reglamento de transporte de 2003](contexto/fuentes-locales.md#reglamento-transporte-2003): 106 artículos con índice; antecedente normativo histórico.
7. [Expediente de Ruta 1](investigacion/ruta1/README.md): evaluación actual, evidencia y condiciones pendientes.
8. [Casos de CDMX y América Latina](investigacion/latinoamerica/README.md): mecanismos de transición y propuesta condicionada para el ramal.
9. [Licencias del proyecto](contexto/licencia-proyecto.md): revisión de reglas del hackatón y decisión confirmada, MIT para código propio y CC BY 4.0 para documentación propia. [Aviso y exclusiones](LICENSE.md).

## Inventario de fuentes activas

### Evaluación documental de Ruta 1

La [evaluación ampliada de viabilidad](investigacion/ruta1/evaluacion-viabilidad-ruta1.md) estudia **Metro Universidad/CU–San Fernando–Huipulco**, con consulta pública del 6 de octubre de 2026 y cobertura de las categorías A–N del plan. El ramal merece validación, pero no se demostró viabilidad: faltan baseline, utilización, demanda propia, equivalencia, patio/carga e ingreso/financiamiento aplicables. La [nota inicial](investigacion/ruta1/investigacion-ruta1.md) conserva un ejemplo genérico que no representa el ramal.

- [Tabla de 106 parámetros (CSV)](investigacion/ruta1/parametros-ruta1.csv): datos, faltantes, supuestos y cálculos con ámbito y límites de uso.
- [Registro de 58 fuentes (JSON)](investigacion/ruta1/fuentes-ruta1.json): metadatos, consulta, permisos, acceso y cola de recuperación de originales.
- [Fichas de recuperación](investigacion/ruta1/recuperacion-ruta1.md): paráfrasis propias con referencias y localizadores; no originales descargados.
- [Matriz de 63 variables](investigacion/ruta1/matriz-investigacion-ruta1.csv) y [matriz de fuentes prioritarias](investigacion/ruta1/matriz-fuentes-ruta1.csv): obtención, dependencias y faltantes.
- [Registro temático de búsquedas](investigacion/ruta1/registro-busquedas-ruta1.csv): bloques consultados y resultados; resumen, no historial literal del buscador.
- [Método y Definition of Done](investigacion/ruta1/metodologia-ruta1.md): escala A–F del plan, licencias, trazabilidad y criterios para avanzar.
- [Verificación del expediente](investigacion/ruta1/verificacion-investigacion-ruta1.md): consistencia de registros, integridad de originales y fallo documentado de recuperación del GTFS.
- [Borrador único de transparencia a SEMOVI](investigacion/ruta1/solicitud-transparencia-ruta1.md): preparado, sin enviar.

El registro externo es independiente del inventario de extracción. Se corrigió la escala provisional para aplicar A–F del plan completo; `nivel_anterior` conserva la clasificación inicial para auditoría. La flota definitiva y la solución siguen pendientes. Se preservaron los cuatro PDF locales; en la primera revisión **ningún nuevo original externo se conservó**, por límites de acceso y/o licencia desconocida. Ese era el estado de la primera entrega S. En la segunda revisión M09/M10 se recuperaron seis originales abiertos y la geometría histórica de este ramal; los demás recursos pendientes no se consideran recuperados por tener una ficha.

### Transición eléctrica en CDMX y América Latina

El [análisis histórico y propuesta para un ramal](investigacion/latinoamerica/analisis-transicion-electrica-latinoamerica.md) compara CDMX, Santiago, Bogotá, Uruguay, São Paulo y Guayaquil: propiedad, financiamiento, apoyos, carga, participación y barreras. Incluye una vía de piloto con protección del ingreso, dos alternativas de propiedad y condiciones para ampliar o detener. Es una propuesta documental; no demuestra viabilidad de Ruta 1 ni compromete financiamiento.

Su [registro complementario de 26 referencias](investigacion/latinoamerica/fuentes-transicion-electrica-latinoamerica.json) identifica consulta, localizadores, acceso parcial, licencias y antecedentes reutilizados. Se verificaron CC BY 3.0 IGO para el informe BID 2025 y las restricciones NC/ND del estudio chileno 2021. En el expediente H no se conservaron nuevos originales externos; la descarga inicial del informe abierto falló por resolución DNS. El reintento de la segunda revisión devolvió 403 (incidencia I05 del registro M). Las referencias H y S son registros independientes, con reutilizaciones explícitas, y no deben sumarse como fuentes únicas sin deduplicación.

### PDF locales

| PDF original | Páginas | Markdown |
| --- | ---: | --- |
| [Problemática electro hackatón](contexto/fuentes-locales.md#problematica-electro-hackaton) | 10 | [Problemáticas](contexto/fuentes-locales.md#problematica-electro-hackaton) |
| [Introducción Electromovilidad](contexto/fuentes-locales.md#introduccion-electromovilidad) | 60 | [Presentación completa](contexto/fuentes-locales.md#introduccion-electromovilidad) |
| [PIM-2019-2024_.pdf](contexto/fuentes-locales.md#pim-2019-2024) | 118 | [PIM](contexto/fuentes-locales.md#pim-2019-2024) |
| [transporte.pdf](contexto/fuentes-locales.md#reglamento-transporte-2003) | 33 | [Reglamento](contexto/fuentes-locales.md#reglamento-transporte-2003) |

El [inventario JSON](inventario.json) registra rutas, hashes SHA-256, páginas y reconstrucciones visuales de los cuatro PDF. Los originales se reubicaron sin cambiar sus contenidos.

## Consulta por tema

| Tema | Presentación completa (página PDF) | Otras fuentes |
| --- | --- | --- |
| Requisitos del reto 2 y protección del ingreso | Antecedente técnico | Problemáticas 4–5 |
| Mercado y opciones de vehículos | 7–9, 13–20 | PIM 54 y 56 |
| Costo energético | [18](contexto/fuentes-locales.md#introduccion-electromovilidad) | Reglamento, artículos 93 y 96–99 |
| Emisiones operativas y ciclo de vida | [22–24](contexto/fuentes-locales.md#introduccion-electromovilidad), 33 | PIM 24, 54 y 60 |
| MHEV/HEV/PHEV/REEV/BEV/FCEV | [28–36](contexto/fuentes-locales.md#introduccion-electromovilidad) | Tecnología según operación de la flota |
| Encuesta y carga doméstica | [39–46](contexto/fuentes-locales.md#introduccion-electromovilidad) | No extrapolar automáticamente a operadores profesionales |
| Infraestructura y conectores | [10](contexto/fuentes-locales.md#introduccion-electromovilidad), [48–52](contexto/fuentes-locales.md#introduccion-electromovilidad) | PIM 54 |
| Baterías y mantenimiento | [25](contexto/fuentes-locales.md#introduccion-electromovilidad), [58–59](contexto/fuentes-locales.md#introduccion-electromovilidad) | Costos/garantías específicos pendientes |
| NOM-163 y derecho a la carga | [26](contexto/fuentes-locales.md#introduccion-electromovilidad), [54](contexto/fuentes-locales.md#introduccion-electromovilidad) | No determinan por sí solos obligaciones actuales en CDMX |
| Operación, permisos y equipamiento | — | Reglamento, artículos 17–38 y 69–82 |
| Datos abiertos y GTFS | — | PIM 65 |
| Indicadores y responsables | — | PIM 80–88 y 109–112 |

## Método y límites

Se extrajo texto con `pdftotext -layout`. Cada una de las 221 páginas tiene un ancla estable, una entrada de índice y un enlace al original. El formato preserva tablas y erratas mediante bloques de texto.

La presentación completa se revisó visualmente por sus 60 páginas. Sus páginas gráficas tienen notas de lectura; las tablas de mercado, infraestructura, impacto y comparación internacional se recuperaron directamente del PDF. En la página 9, la tabla visible difiere de la capa textual automática, por lo que se utiliza la reconstrucción visual. El índice del documento identifica las páginas con transcripción manual.

Los mapas, fotografías y gráficos siguen disponibles en el PDF; las notas no reproducen cada etiqueta pequeña ni deducen valores exactos de alturas de barras. Las [imágenes renderizadas guardadas](contexto/fuentes-locales.md#materiales-derivados) provienen del PDF completo. Los diagramas del PIM 98–99 y su contraportada 118 conservan su revisión visual previa, independiente de la presentación.

Las extracciones y la guía de capacitación no actualizan la información con internet ni verifican externamente estadísticas o vigencia normativa. La investigación de Ruta 1 sí consulta fuentes externas, registradas por separado; no convierte las cifras de los PDF locales en datos actualizados del ramal. La guía distingue cifras de la fuente de observaciones y cálculos propios.

### Verificación de la reorganización

El 6 de octubre de 2026 se reubicaron 15 documentos y se añadieron índices para ambos expedientes. Se comprobaron enlaces locales y anclas, lectura de JSON/CSV, correspondencia de referencias y rutas de procedencia. Se conservaron las 58 y 26 referencias, las 106 filas de parámetros, las 63 de la matriz de datos y las 14 de cada registro de fuentes prioritarias y búsquedas.

Los 41 archivos de originales, extracciones e imágenes/revisiones visuales conservan sus hashes, al igual que `inventario.json`. Para el documento propio S21 se actualizaron ruta, tamaño y hash tras ajustar sus enlaces, registrando el hash anterior. El script de extracción mantiene sus entradas y salidas y no se modificó. Esta reorganización no cambia las conclusiones ni los pendientes de investigación.

## Actualizar y buscar

Desde la raíz:

```bash
python scripts/extraer_documentos.py
rg -n 'Electrifica|ingreso|condiciones laborales' docs/fuentes/problematica-electro-hackaton.md
rg -n 'Batería|Hábitos de Carga|Niveles de Carga' docs/fuentes/introduccion-electromovilidad.md
rg -n 'GTFS|catenaria|electromovilidad' docs/fuentes/pim-2019-2024.md
```

Requiere Python 3 y Poppler (`pdfinfo`, `pdftotext`). El script regenera las cuatro extracciones y el inventario, sin acceder a la red. Si cambia un PDF, revisar también las transcripciones visuales, guías y referencias, aunque mantenga el mismo número de páginas.
