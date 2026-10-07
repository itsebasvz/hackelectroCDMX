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
