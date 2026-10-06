# hackelectroCDMX — Electrifica tu flota

Espacio de trabajo del equipo para el **reto 2**: electrificar flotas de transporte y servicios de CDMX de manera económicamente viable, ambientalmente efectiva y socialmente justa, protegiendo el ingreso y las condiciones de trabajo de sus operadores.

La elección del reto está confirmada. Ruta 1 Universidad–San Fernando–Huipulco es el caso prioritario de investigación; la flota definitiva, solución, tecnología y formato de prototipo siguen pendientes.

## Empezar

- [Índice documental](docs/README.md): organización, guías generales, expedientes de investigación y cuatro fuentes PDF, con 221 páginas en total.
- [Síntesis de estudio](docs/contexto/sintesis.md): requisitos y antecedentes del reto.
- [Guía de la presentación completa](docs/contexto/presentacion.md): lectura del PDF original de EMA, con referencias por página.
- [Evaluación documental de Ruta 1](docs/investigacion/ruta1/evaluacion-viabilidad-ruta1.md): Universidad–San Fernando–Huipulco, evidencia favorable/contraria y criterios de viabilidad. Incluye 58 referencias, parámetros y matrices; la viabilidad del ramal sigue sin demostrarse. Baseline, demanda, carga e ingreso/financiamiento permanecen pendientes. Los originales externos no pudieron descargarse; su recuperación está registrada.
- [Transición eléctrica en CDMX y América Latina](docs/investigacion/latinoamerica/analisis-transicion-electrica-latinoamerica.md): historia de cinco países, mecanismos de inversión y organización y propuesta condicionada de piloto por ramal con protección del ingreso. Registro complementario de fuentes y licencias.

Cada investigación tiene un índice propio: [Ruta 1](docs/investigacion/ruta1/README.md) y [Latinoamérica](docs/investigacion/latinoamerica/README.md).

## Licencia y colaboración

La [revisión de licencia](docs/contexto/licencia-proyecto.md) no encontró una licencia obligatoria en el documento disponible del hackatón. El usuario confirmó [MIT para código propio](LICENSE) y [CC BY 4.0 para documentación propia](docs/LICENSE.md). Las fuentes de terceros conservan sus condiciones y quedan fuera de estas licencias.

Los textos se recuperaron de fuentes oficiales: MIT mediante GitHub y el [texto completo de CC BY 4.0](docs/CC-BY-4.0.txt) mediante Creative Commons. Se registraron [procedencia y hashes](docs/contexto/procedencia-licencias.json).

Los commits usarán Conventional Commits con descripciones y cuerpos en español, según [AGENTS.md](AGENTS.md). El nombre acordado del repositorio remoto es `hackelectroCDMX`.

## Estructura

```text
hackelectro/
├── AGENTS.md                 Contexto para retomar el trabajo
├── README.md
├── LICENSE                   MIT para código propio
├── .gitignore
├── .gitattributes
├── docs/                     PDF originales, transcripciones y notas de estudio
└── scripts/                  Extracción documental que se utiliza actualmente
```

La estructura contiene únicamente documentación y su utilidad de extracción. La solución y la tecnología siguen pendientes; las carpetas de desarrollo se crearán cuando exista trabajo concreto que las necesite.

La publicación incluye análisis propios, referencias, parámetros, inventarios y la herramienta de extracción. Los cuatro PDF y sus reproducciones se conservan localmente y están excluidos de Git por licencia de redistribución no verificada; sus [rutas, páginas y condiciones](docs/contexto/fuentes-locales.md) siguen documentadas. Las capturas retiradas no son fuente activa ni parte de la publicación.

## Regenerar la documentación

```bash
python scripts/extraer_documentos.py
```

Requiere Python 3 y Poppler (`pdfinfo`, `pdftotext`), además de los cuatro PDF y las transcripciones visuales locales. Esos insumos no están incluidos en un clon de GitHub. Las guías y transcripciones visuales se revisan manualmente si cambia un PDF.

## Estado de Git

Git se inicializó el 2026-10-06 con la rama `main`, tras habilitar el usuario acceso completo. `origin` apunta a `https://github.com/itsebasvz/hackelectroCDMX.git`.

El repositorio remoto se creó mediante GitHub CLI el 2026-10-06: [itsebasvz/hackelectroCDMX](https://github.com/itsebasvz/hackelectroCDMX), con visibilidad pública. La publicación respeta las exclusiones de terceros descritas en la revisión de licencia.
