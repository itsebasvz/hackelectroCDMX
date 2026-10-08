# Verificación de la implementación

Fecha: 2026-10-06. Entorno local: Node 22.23.2, npm 12.0.2, Chromium de Playwright. Producción: Vercel, proyecto `hello-world-9171/hackelectro-cdmx`.

## Resultado

- `npm run check`: tipos, **30 pruebas unitarias** y compilación correctos.
- `npm run test:e2e`: **7 recorridos Chromium** correctos: edición/invalidez, búsqueda/aplicación, exportación/importación/guardado, cambio de ramal y autobús urbano, accesibilidad/móvil, uso offline con esquema sin WebGL e informe, trazo renderizado aun con geometría demorada, y exploración de consumo/contexto hospitalario/sensibilidad sin inventar recaudo.
- `npm run format:check`: formato correcto.
- Instalación limpia desde lockfile comprobada en directorio temporal ignorado, sin modificar dependencias originales del espacio de trabajo.
- `npm run data:routes`: 995 registros históricos y 2102 trazos; Ruta 1 20.340012617 km. Hash del RAR coincide con M09; original intacto.
- Registro de dependencias: 246 entradas SPDX, 175 textos originales conservados. Checksums de los textos comprobados; tipografías mantienen OFL. La compilación incluye avisos originales.
- Validación pública en https://hackelectro-cdmx.vercel.app: HTTP 200, cálculo completo, worker cartográfico local, trazo visible, búsqueda de 180 combinaciones y cero errores JavaScript en el recorrido realizado. Búsqueda medida en esa sesión: **198 ms**; no garantía para cualquier flota/equipo.
- Prueba de rendimiento unitaria: evaluación media inferior a 200 ms y búsqueda predeterminada inferior a cinco segundos.
- `/PLAN_LOCAL.md`, `/PROGRESO_LOCAL.md` y `/.env.local` devuelven HTTP 404 en producción. No se publicaron archivos locales de seguimiento ni credenciales.

La asignación de capital/apoyo se contrastó con una enumeración exhaustiva independiente en casos pequeños con centavos y comisiones. El apoyo mínimo encontrado se verifica contra el monto un centavo menor. La renta no baja artificialmente al recibir apoyo. Las reservas y el principal no se duplican en el TCO.

## Límites y seguimiento

La interfaz usa DESIGN.md y se revisó en escritorio (1366, 1440 y 1920 px) y móvil (390 px), con foco, diálogo, tablas desplazables y esquema territorial. Axe no encontró infracciones en los recorridos probados; esto no certifica todas las combinaciones o tecnologías de asistencia.

La compilación informa módulos de mapas y gráficas grandes. Se cargan por separado; la mejora futura puede reducir el tamaño del catálogo cartográfico y su representación sin perder procedencia. No se silenció el aviso como si fuera una optimización.

No se implementaron animación, despacho individual, tráfico, carga de oportunidad, ranking de toda la ciudad ni clasificación de tecnología sin fuentes. La geometría es histórica; los supuestos de demanda, ingresos, operación, patio y financiamiento permanecen visibles. No se demostró viabilidad real de Ruta 1.

Vercel CLI permite despliegues, pero el enlace automático GitHub–Vercel fue rechazado por falta de Login Connection GitHub en la cuenta Vercel. La guía documenta el paso del titular para activarlo. GitHub Actions verifica el repositorio; no se configura despliegue automático con credenciales personales.


## Rediseño de la evaluación

Controles esenciales abiertos y avanzados desplegables, mapa central, diagnóstico con enlaces que enfocan parámetros, presupuesto energético y barras de flujo mensual. Sensibilidad calcula puntos del evaluador original y no aumenta demanda/recaudo. Se añadieron cinco pruebas numéricas para estos derivados y un recorrido de navegador de consumo, hospitales y aplicación de vueltas. Las siete pruebas incluyen Axe, sin excluir el mapa. El redimensionamiento desde escritorio a móvil conserva ancho de página; se corrigió el mínimo intrínseco de las celdas de sensibilidad.

La consulta OSM original y las cinco referencias derivadas conservan hashes y ODbL; el icono GitHub conserva SVG y MIT de Octicons recuperados de una revisión fija. Ningún PDF histórico o inventario fue modificado. La apertura directa de cuatro referencias institucionales quedó limitada por red/TLS/403; sus domicilios proceden de resultados institucionales indexados y los límites se registran. No se afirma verificación de accesos ni servicio a cada hospital.


El rediseño quedó publicado en https://hackelectro-cdmx.vercel.app con HEAD de aplicación `ff3631a`. La revisión pública comprobó título nuevo, trazo renderizado, consumo por vuelta, búsqueda de 180 combinaciones, cero errores JavaScript y cero infracciones Axe. La geometría hospitalaria y MIT de Octicons devuelven HTTP 200; los archivos locales/credenciales continúan en 404. CI pasó: [ejecución 37568430236](https://github.com/itsebasvz/hackelectroCDMX/actions/runs/37568430236). Las cifras de tiempo corresponden sólo a esta sesión, sin garantizar rendimiento universal.

## Mapa contextual — 2026-10-07

- `npm run check`: tipos, 31 pruebas unitarias y compilación correctos. El límite energético se comprueba dentro del día, fuera del día y en fronteras exactas de vueltas, con el mismo consumo del evaluador.
- `npm run test:e2e`: ocho recorridos Chromium correctos. El nuevo recorrido verifica iconos por clase, inicio/final/límite, clic en espacio vacío, inspección y centrado hospitalario, ocultación de contexto, parámetros conservados e invalidez. Axe no encontró infracciones en los estados revisados, incluido el resultado anterior; se corrigió el contraste de ese aviso.
- `npm run format:check`: correcto. La compilación sigue informando el tamaño de módulos cartográficos y gráficas; no se ocultó el aviso.
- Revisión local en 1920×768, 1920×1080, 1440×900, 1366×768, 1100×800 y 390×844: sin desbordamiento horizontal, sin intersección de las tarjetas del punto y del día, cero errores JavaScript y paneles de la misma fila alineados. Se inspeccionó también el estado con hospital seleccionado y déficit energético.
- El recorrido sin WebGL incluye icono del vehículo, navegación al final del día e inspección hospitalaria antes de desconectar la red. La copia imprimible sigue disponible.
- Escenario JSON v1, evaluador económico y recursos geográficos/licencias permanecen compatibles. La vista describe un escenario energético y ubicaciones aproximadas, sin acreditar operación, acceso hospitalario, carga o inversión.

## Dashboard explicativo — 2026-10-07

- `npm run check`: tipos, 37 pruebas unitarias y compilación correctos. Equivalencia de cada punto de las tres series con `evaluateScenario`, restauración de la única entrada modificada, recaudo constante, límites, precio cero, cancelación entre lotes y escenarios sin potencia/capital/caja favorable.
- `npm run test:e2e`: 13 recorridos Chromium correctos. Se verifican selección sin aplicación automática, aplicación explícita, selección reiniciada tras ediciones rápidas, acción deshabilitada ante invalidez, precio cero, conversiones ambientales, conector desconocido pendiente, 15 filas económicas y 60 meses en impresión, guardado/importación y ausencia de alternativas con motivos.
- `npm run format:check` y `git diff --check`: correctos. Se mantiene el aviso de tamaño de módulos de mapas/gráficas.
- Dimensiones revisadas: 1920, 1440, 1024 y 390 px (alto 1000 px en el recorrido de composición). Sin desbordamiento horizontal; energía y comparación preceden al presupuesto en móvil. En escritorio amplio, mapa y diagnóstico alineados y lista navegable con teclado/desplazamiento propio. En tamaños menores, diagnóstico natural. Capturas locales de resultados, exploración y ambiente en `test-results/`, excluidas de Git.
- Revisión visual corrigió superposición de etiquetas ambientales en móvil mediante marcas compactas. La comparación principal admite saltos de línea para mostrar ambas tecnologías sin obligar al desplazamiento lateral; el detalle conserva desplazamiento. Tooltips de los nuevos gráficos se montan en `body` y se confinan; el presupuesto conserva su comportamiento previamente verificado.
- Axe: cero infracciones en los estados probados de página, diálogo y móvil; sin certificación universal. Se conservaron recorridos sin teselas/WebGL, impresión y mapa contextual.
- Unidad/flota y día/mes/año usan el evaluador diario y días operativos. La suma de componentes eléctricos reconcilia con emisiones y energía comprada, incluidos factor cero y eficiencia uno. Escape eléctrico cero; sin porcentajes netos.
- JSON v1, ecuaciones económicas, optimizador, factores y dependencias conservados. EPA/OMS consultadas como HTML para contexto; no se conservaron originales. El inventario de cuatro PDF y los recursos geográficos permanecen sin cambios. Cambios registrados en commits locales; esta fase no publica una nueva versión.
