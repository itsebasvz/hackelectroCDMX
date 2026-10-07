# Interfaz de evaluación por ramal

Rediseño aprobado el 6 de octubre de 2026. La pregunta guía sigue siendo: **¿bajo qué condiciones puede electrificarse sin perjudicar a pasajeros y trabajadores?** Los resultados describen escenarios editables; no validan una inversión real.

## Entender la primera pantalla

El encabezado identifica el Hackatón Electromovilidad CDMX 2026 y al Equipo Aragonenes, con el repositorio de GitHub. La frase «Electrificar el transporte sin poner en riesgo el trabajo» expresa el propósito. Se retiraron el rayo de marca, el hero de gran altura y el mensaje técnico sobre cuentas.

En escritorio, el espacio tiene tres paneles: configura tu escenario, explora el recorrido y diagnóstico. Usa márgenes de 24 px y todo el ancho disponible, excepción expresa al máximo de la guía de portales. Entre 900 y 1279 px el diagnóstico pasa debajo; por debajo de 900 px se apilan los paneles. Los controles largos tienen desplazamiento propio; las tablas conservan su desplazamiento horizontal.

«Cambiar ruta» abre el catálogo con búsqueda. Es un archivo histórico: cambiar geometría conserva los demás datos del escenario y lo comunica. Vehículos, rendimiento/consumo, longitud, vueltas, flota y recarga están abiertos desde el inicio. Servicio/personas, especificaciones, energía/carga y financiamiento tienen grupos avanzados. Las ediciones reciben «Supuesto editable», conservando referencia y escala A–F en el detalle.

El diagnóstico distingue condiciones calculadas de autorización, patio/conexión, oferta, accesibilidad y compatibilidad por confirmar. Sus enlaces abren el grupo pertinente y enfocan el campo. Un resultado calculado favorable sigue teniendo comprobaciones externas pendientes. Una entrada inválida mantiene el resultado anterior señalado como desactualizado y bloquea aplicación/exportación de un resultado vigente.

## Explorar el mapa

«Recorrido» diferencia los trazos originales; no les atribuye automáticamente sentido, terminal o parada. «Consumo estimado» representa el saldo energético según la vuelta seleccionada. El punto azul es una posición de exploración, nunca un vehículo real. Puede elegirse con el control de distancia o clic en el mapa.

Para una fracción `f` del ciclo y una vuelta `v`:

```text
km_acumulados = km_ciclo_editado × (v − 1 + f) × (1 + adicionales)
kWh_consumidos = km_acumulados × consumo_neto_BEV
SOC_estimado = SOC_inicial − kWh_consumidos / (batería_nominal × salud)
```

El consumo neto ya incluye auxiliares y regeneración. No se añade recuperación gratuita ni se atribuye variación a pendientes o tráfico. Los km adicionales se distribuyen proporcionalmente como abstracción de prueba; no se dibuja un recorrido al patio inexistente.

La posición cartográfica usa distancia Haversine acumulada únicamente dentro de cada LineString, sin sumar o dibujar saltos entre trazos. La longitud editada escala la distancia modelada; no deforma la geometría. Se muestran ambas longitudes cuando difieren. El punto de reserva se deriva del mismo presupuesto energético. Verde indica más de diez puntos porcentuales sobre el SOC mínimo; ámbar, cercanía a la reserva; guinda, reserva alcanzada/superada. No son estados de tráfico.

Si el SOC matemático resulta negativo, el indicador visual marca energía agotada y el requerimiento acumulado sigue visible. Eso describe un escenario que falla; no conducción física con batería negativa. El esquema SVG conserva el control de posición cuando falta WebGL. El cálculo permanece disponible si faltan teselas o cartografía.

El contexto hospitalario está activado inicialmente sólo para Ruta 1. Cinco referencias aproximadas de inmuebles se sirven localmente bajo ODbL. Los nombres/domicilios institucionales y límites aparecen en sus referencias. No acreditan caminata, accesos, cobertura, paradas o demanda. No entran en las ecuaciones ni en el escenario JSON. [Procedencia](recursos-hospitales/README.md).

## Leer energía, presupuesto y límites

**Energía diaria:** las barras comparan energía disponible sin invadir reserva y requerida para servicio/adicionales, en kWh por unidad. Margen o déficit, reserva apartada, energía comprada/pérdidas y horas de carga de la flota se muestran por separado. No se comparan litros con kWh en una misma escala energética.

**Presupuesto mensual:** dos barras de escala común desglosan operación, presupuesto laboral, ingreso objetivo del concesionario, pagos, reserva/reposición y margen libre. El recaudo se marca como referencia. El mes es seleccionable del 1 al 60. Un margen negativo aparece como déficit y los egresos pueden superar el recaudo: no se recorta para aparentar equilibrio.

La categoría de reserva/reposición del mes es el residuo contable:

```text
recaudo − operación − trabajo − concesionario − pago − margen_libre
```

Equivale a provisión mensual más reposición no cubierta con reservas. No es el saldo acumulado de reserva, ni se añade al TCO como un gasto duplicado. La gráfica reconcilia exactamente con los meses del motor. El KPI de brecha inicial es `max(0, propio_requerido − propio_disponible)`; no es el apoyo mínimo del optimizador, que también exige liquidez mensual.

**Sensibilidad:** variar sólo vueltas enteras desde 1 hasta `min(100, max(12, 2 × vueltas_actuales))`. Cada punto invoca el evaluador completo. Vehículos, tiempo por ciclo, flota, ascensos diarios, tarifa, condiciones financieras e ingresos objetivo permanecen constantes. Se presentan energía requerida/disponible y menor margen de los 60 meses frente a kilómetros diarios, en gráficas separadas, con el escenario actual y tabla de restricciones.

El límite energético continuo `kWh_disponibles / consumo_kWh_km` es distinto de los puntos que satisfacen todas las restricciones. Jornada, carga o dinero pueden fallar antes. No se proclama un umbral global de viabilidad ni se recomienda reducir servicio a partir de una sensibilidad. «Aplicar estas vueltas» es una decisión explícita del usuario y las nuevas vueltas quedan F. Más vueltas no inventan pasajeros ni ingreso.

## Interfaces y verificación

El worker tiene operaciones separadas de evaluación, sensibilidad y búsqueda. Evaluación/sensibilidad comparten identificación del escenario; cancelar sensibilidad no cancela la búsqueda y las respuestas antiguas se descartan. La sensibilidad cede ejecución cada cuatro puntos para atender cambios/cancelación. La interfaz transforma resultados para gráficas sin introducir fórmulas financieras alternativas.

El esquema/modelo de escenario v1/1.0.0 no cambia; guardar, importar JSON, exportar CSV e imprimir conservan sus contratos. Se añadieron pruebas de reconciliación durante reemplazo/cierre de crédito, umbral energético, trazos separados, equivalencia de sensibilidad con el evaluador y un recorrido completo de consumo/hospitales/aplicación de vueltas. La revisión incluye el objetivo de accesibilidad existente y escritorio/móvil; el resultado se registra en [verificación](verificacion.md).
