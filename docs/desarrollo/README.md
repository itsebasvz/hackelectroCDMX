# Guía del evaluador HackElectroCDMX

El prototipo implementa el Reto 2 como una evaluación exploratoria por ramal. El [documento maestro](../documento-maestro-ruta1.md) orienta la propuesta; la [metodología del motor](metodologia-motor.md) documenta lo que efectivamente calcula.

## Ejecución y calidad

Requiere Node 22.12 o posterior compatible (desarrollado con 22.23.2), npm y navegador moderno con Web Workers. No necesita servidor de API, cuentas, credenciales de mapas ni base de datos.

```bash
npm ci
npm run dev
```

Para una demostración local, preparar previamente dependencias y compilación:

```bash
npm run build
npm run preview -- --port 4173
```

Abrir `http://localhost:4173`. Cálculos, catálogos, tipografía, geometrías e informes están en la copia local. Las teselas detalladas de OpenStreetMap requieren internet. No se descargan masivamente ni se crea una caché offline de teselas. Si falta WebGL, se presenta un esquema de trazos. La primera visita a Vercel sin conexión no está garantizada: la alternativa offline es esta copia local.

Verificación:

```bash
npm run check
npx playwright install chromium
npm run test:e2e
npm run format:check
```

CI ejecuta tipos, pruebas, compilación y Playwright en Chromium. La revisión visual y la prueba automática de accesibilidad complementan el objetivo WCAG AA; no equivalen a certificación de accesibilidad universal.

## Recorrido de demostración

1. Abrir Ruta 1 y explicar que 20.340 km es una referencia cartográfica de 2022, no un ciclo actual medido.
2. Consultar costos y márgenes sin esperar animación. El ejemplo inicial no fuerza un resultado favorable: puede ahorrar operación y aun incumplir capital o flujo.
3. Editar capital, consumo, carga o financiamiento. Los cambios reciben nivel F; los campos inválidos conservan el resultado anterior con aviso de desactualización.
4. Buscar la aportación inicial mínima entre las combinaciones del catálogo, manteniendo servicio, tarifa, flota e ingresos objetivo.
5. Aplicar una alternativa y examinar su distribución de apoyo, deuda, reserva y pendientes.
6. Cambiar de ramal o probar minibús/autobús diésel. La geometría cambia; demanda y operación requieren parámetros propios. No atribuir resultados del ejemplo a otro servicio.
7. Guardar un escenario local y exportar JSON, CSV o informe PDF. El JSON conserva entradas y catálogo; se comprueba checksum y se recalcula al importar.

El nombre en el campo de guardado identifica copias en este navegador. Se conservan hasta 20; otra copia con el mismo nombre la reemplaza. Restaurar el ejemplo no elimina esas copias. No se envían parámetros operativos a un backend; las solicitudes de teselas y de páginas externas sí llegan a sus proveedores.

## Estructura e interfaces

- `src/domain/`: contratos Zod, operación, carga, financiamiento y optimizador. Funciones independientes de React/DOM.
- `src/data/`: catálogo y escenario de prueba. Las ediciones no sobrescriben el catálogo original.
- `src/features/`: editor, mapa, dashboard, persistencia, archivos e informe.
- `src/worker/`: protocolo con identificación de solicitudes, progreso, cancelación y descarte de respuestas antiguas.
- `src/ui/`: formato y gráficas; `src/styles.css` aplica DESIGN.md.
- `public/data/`: derivados geográficos abiertos, disponibles localmente.

`evaluateScenario(scenario)` valida y devuelve resultados completos, restricciones y trazabilidad. `findConditions(scenario, options)` enumera combinaciones compatibles, informa progreso y permite cancelación. Ambas usan el mismo evaluador. Las interfaces se versionan con `schemaVersion = 1`, `modelVersion = 1.0.0` y catálogo versión 1. No hay API HTTP pública en el MVP.

La búsqueda considera el catálogo incluido en cada escenario, con la configuración editada del vehículo/cargador/financiamiento seleccionado. Para incorporar referencias adicionales, usar los contratos de catálogo y generar un archivo mediante `serializeScenario`; no se aceptan JSON arbitrarios que eludan validación e integridad.

## Datos y licencias

La transformación `npm run data:routes` requiere 7-Zip, verifica el hash del RAR conservado y deriva 995 registros / 2102 trazos. El original no se modifica. [Procedencia geográfica](../investigacion/ruta1/recursos-abiertos/README.md) y `public/data/routes-manifest.json` conservan método, fecha, institución y límites.

El catálogo cita hechos comerciales de KINGO, Gree y Yutong, referencias PROFECO y factores SEMARNAT/EPA. No distribuye sus páginas o fichas completas sin permiso. Los vehículos diésel representativos y precios faltantes son F; no ofertas del mercado. La versión eléctrica KINGO es modelo 2027 consultado en 2026.

Código propio MIT, documentación propia CC BY 4.0. Los [textos originales de las dependencias](dependencias.json) se copian de sus paquetes, con checksums; no fueron redactados por el equipo. `npm run licenses` actualiza el registro después de cambiar dependencias. La compilación incluye esos avisos en `/third-party/licenses.json` y conserva las licencias OFL de las fuentes tipográficas.

GitHub y Vercel son alojamiento administrado. El código y las bibliotecas son abiertos; `dist/` puede publicarse en otro servidor estático. `dist/`, `.vercel/`, el plan local y el registro local de progreso no se incorporan a Git.

## Publicación

URL pública: **https://hackelectro-cdmx.vercel.app**. Publicada y comprobada en navegador: cálculo completo, trazo histórico, búsqueda y avisos jurídicos disponibles.

El proyecto Vercel se llama `hackelectro-cdmx`, bajo el equipo `hello-world-9171`. Node 22.x, `npm run build`, directorio `dist`, sin funciones de servidor. Para publicar una versión verificada mediante CLI:

```bash
vercel deploy --prod --yes --scope hello-world-9171
```

La cuenta Vercel autenticada permite publicar por CLI, pero rechazó el enlace automático del repositorio por falta de **Login Connection de GitHub**. Para habilitar despliegues al hacer push y previews de ramas, el titular debe conectar GitHub en su cuenta Vercel y vincular `itsebasvz/hackelectroCDMX` desde Project Settings → Git. No se afirma que esa integración esté activa. La compilación es portable e independiente de esta conexión.

`.vercelignore` excluye seguimiento local, credenciales y fuentes de terceros conservadas localmente. Vercel CLI generó configuración/credenciales locales ignoradas; no deben incorporarse a Git ni al sitio.
