# hackelectroCDMX — Electrifica tu flota

Espacio de trabajo del equipo para el **reto 2**: electrificar flotas de transporte y servicios de CDMX de manera económicamente viable, ambientalmente efectiva y socialmente justa, protegiendo el ingreso y las condiciones de trabajo de sus operadores.

La plataforma permite comparar combustión y electricidad por ramal, explorar carga y financiamiento y buscar la aportación inicial mínima manteniendo servicio e ingresos objetivo. Ruta 1 Universidad–San Fernando–Huipulco es el ejemplo documentado; la flota real y la decisión de inversión siguen por validar.

## Ejecutar la plataforma

Requiere Node 22.12+ compatible y npm.

```bash
npm ci
npm run dev
```

Para la demostración local: `npm run build` y `npm run preview -- --port 4173`. Abrir `http://localhost:4173`. El motor, los catálogos, fuentes tipográficas y geometrías funcionan localmente; el mapa base detallado requiere internet.

[Guía de uso, arquitectura, pruebas y despliegue](docs/desarrollo/README.md) · [Metodología del motor](docs/desarrollo/metodologia-motor.md) · [Diseño visual](DESIGN.md).

Verificar con `npm run check` y `npm run test:e2e` (Chromium: `npx playwright install chromium`).

## Empezar

- [Documento maestro de Ruta 1](docs/documento-maestro-ruta1.md): síntesis para orientar el producto futuro, con valor humano, evidencia, dos vías de inversión, adaptación jurídica a CDMX y condiciones para proteger servicio e ingreso. La investigación pública es suficiente para un prototipo exploratorio; la decisión de inversión real queda por validar.
- [Bases de decisión](docs/investigacion/ruta1/bases-decision-ruta1.csv): 55 entradas con fuentes, estados y condiciones de aceptación; [geometría oficial histórica y método reproducible](docs/investigacion/ruta1/recursos-abiertos/README.md).
- [Índice documental](docs/README.md): organización, guías generales, expedientes de investigación y cuatro fuentes PDF, con 221 páginas en total.
- [Síntesis de estudio](docs/contexto/sintesis.md): requisitos y antecedentes del reto.
- [Guía de la presentación completa](docs/contexto/presentacion.md): lectura del PDF original de EMA, con referencias por página.
- [Evaluación documental de Ruta 1](docs/investigacion/ruta1/evaluacion-viabilidad-ruta1.md): Universidad–San Fernando–Huipulco, evidencia favorable/contraria y criterios de viabilidad. Incluye 58 referencias, parámetros y matrices; la viabilidad del ramal sigue sin demostrarse. Baseline, demanda, carga e ingreso/financiamiento permanecen pendientes. La segunda revisión recuperó geometría histórica oficial y seis originales abiertos con hashes; los pendientes operativos y financieros siguen registrados.
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
├── scripts/                  Extracción, derivación geográfica y avisos de licencias
├── src/                      Motor, worker, interfaz y catálogo del escenario
├── public/data/              Geometrías y registro de procedencia
└── tests/                    Verificación de navegador
```

La aplicación React/TypeScript/Vite vive en `src/`, con motor puro en Web Worker, mapa MapLibre y gráficas ECharts. `public/data/` contiene geometrías abiertas derivadas; `tests/` contiene recorridos de navegador. No hay backend ni cuentas.

Los materiales publicables incluyen análisis propios, referencias, parámetros, inventarios, la herramienta de extracción y recursos geográficos con CC BY 4.0 explícita, atribución y hashes. Los recursos nuevos aún no se han enviado al remoto en esta tarea. Los cuatro PDF y sus reproducciones se conservan localmente y están excluidos de Git por licencia de redistribución no verificada; sus [rutas, páginas y condiciones](docs/contexto/fuentes-locales.md) siguen documentadas. Las capturas retiradas no son fuente activa ni parte de la publicación.

## Regenerar la documentación

```bash
python scripts/extraer_documentos.py
```

Requiere Python 3 y Poppler (`pdfinfo`, `pdftotext`), además de los cuatro PDF y las transcripciones visuales locales. Esos insumos no están incluidos en un clon de GitHub. Las guías y transcripciones visuales se revisan manualmente si cambia un PDF.

## Estado de Git

Git se inicializó el 2026-10-06 con la rama `main`, tras habilitar el usuario acceso completo. `origin` apunta a `https://github.com/itsebasvz/hackelectroCDMX.git`.

El repositorio remoto se creó mediante GitHub CLI el 2026-10-06: [itsebasvz/hackelectroCDMX](https://github.com/itsebasvz/hackelectroCDMX), con visibilidad pública. La publicación respeta las exclusiones de terceros descritas en la revisión de licencia.
