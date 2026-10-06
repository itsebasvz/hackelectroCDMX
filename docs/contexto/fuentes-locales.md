# Fuentes conservadas localmente

Los cuatro PDF suministrados al equipo y sus reproducciones se conservan en la carpeta de trabajo, pero **no se incluyen en GitHub**: su licencia de redistribución no está verificada (UNKNOWN). El repositorio publica análisis propios, referencias, tablas e inventarios; MIT y CC BY 4.0 no relicencian las fuentes.

El [inventario original](../inventario.json) conserva los nombres Unicode exactos, hashes SHA-256, páginas y rutas locales. La [colección de fuentes de Ruta 1](../investigacion/ruta1/fuentes-ruta1.json) y el [registro de Latinoamérica](../investigacion/latinoamerica/fuentes-transicion-electrica-latinoamerica.json) conservan los localizadores y las condiciones de cada referencia. Un archivo marcado como conservado localmente no implica que esté publicado.

Las citas «PDF n» señalan la página del archivo, contando portada. Los enlaces a esta nota identifican la fuente local de esas citas, sin ofrecer una descarga inexistente en GitHub. Para consultar el contenido original es necesario obtenerlo de su titular o disponer de la copia local; no se ha identificado una URL pública verificada para todas las copias suministradas.

<a id="problematica-electro-hackaton"></a>
## Problemáticas del Electro Hackathon CDMX

- Institución: organización del Electro Hackathon CDMX; autor individual y fecha de publicación no identificados.
- Original local: `docs/originales/problemática electro hackatón.pdf`.
- Extracción local: `docs/fuentes/problematica-electro-hackaton.md`.
- Extensión: 10 páginas. El reto 2 se describe en PDF 4–5; formatos y metodología en PDF 7–8; reglas en PDF 9–10.
- Licencia: UNKNOWN; original y extracción no publicados. Referencias S00 y H00.

<a id="introduccion-electromovilidad"></a>
## Introducción Electromovilidad

- Institución: EMA, según el PDF suministrado; fecha de publicación no identificada, con cifras hasta 2026.
- Original local: `docs/originales/Introducción Electromovilidad.pdf`.
- Extracción local: `docs/fuentes/introduccion-electromovilidad.md`.
- Extensión: 60 páginas. La [guía propia](presentacion.md) identifica las páginas y discrepancias de las cifras.
- Licencia: UNKNOWN; original, extracción, transcripciones e imágenes no publicados.

<a id="pim-2019-2024"></a>
## Programa Integral de Movilidad 2019–2024

- Institución: Gobierno de la Ciudad de México / SEMOVI. Cobertura: 2019–2024.
- Original local: `docs/originales/PIM-2019-2024_.pdf`.
- Extracción local: `docs/fuentes/pim-2019-2024.md`.
- Extensión: 118 páginas. Desde la segunda página, la página impresa es una menos que la página del PDF.
- Licencia de la copia suministrada: UNKNOWN; original y reproducciones no publicados. Las metas se conservan como antecedentes, no como resultados acreditados.

<a id="reglamento-transporte-2003"></a>
## Reglamento de Transporte del Distrito Federal de 2003

- Institución: Gobierno del Distrito Federal. Publicación: 2003-12-30.
- Original local: `docs/originales/transporte.pdf`.
- Extracción local: `docs/fuentes/reglamento-transporte-2003.md`.
- Extensión: 33 páginas, 106 artículos. Antecedente abrogado según S30; no constituye por sí solo regulación vigente.
- Licencia de la copia suministrada: UNKNOWN; original y extracción no publicados.

<a id="materiales-derivados"></a>
## Transcripciones visuales e imágenes

`docs/transcripciones-visuales/` contiene revisiones manuales de los PDF y `docs/assets/` contiene imágenes extraídas o renderizadas. Se conservan localmente y están excluidas de Git junto con los originales y las extracciones completas.

El [script de extracción](../../scripts/extraer_documentos.py) es código propio bajo MIT y sí se publica. Sirve para regenerar los textos y el inventario **cuando se dispone de los cuatro PDF locales**; un clon de GitHub no incluye esos insumos ni las transcripciones visuales. Las revisiones manuales deben recuperarse o realizarse antes de considerar equivalentes las extracciones regeneradas.
