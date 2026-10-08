# Interfaz de evaluación por ramal

Actualización 2026-10-07: el [dashboard sobre el mapa](redisenio-mapa.md) define la composición vigente. El [dashboard explicativo](redisenio-dashboard.md) documenta la lectura de resultados y el [panel financiero](panel-financiero.md) conserva sus indicadores y límites.

La pregunta guía sigue siendo: **¿bajo qué condiciones puede electrificarse sin perjudicar a pasajeros y trabajadores?** Los resultados describen escenarios editables; no validan una inversión real.

## Entender la primera pantalla

El mapa ocupa la ventana de trabajo. La barra superior identifica escenario, ramal, carácter simulado y Equipo Aragonenes. Se abre con reproducción pausada y sin paneles. Los resultados se calculan automáticamente al editar; reproducir sólo explora su posición y consumo.

Cuatro accesos flotantes: **Configurar**, **Economía**, **Ambiente** y **Operación**. Configurar abre a la izquierda; las consultas, a la derecha. Un solo panel principal permanece abierto, con desplazamiento propio y opción de ampliar/restaurar sin perder selecciones. En menos de 1024 px el panel usa el ancho disponible y contiene el foco. Las tablas tienen desplazamiento horizontal propio. Cada vista tiene URL por fragmento, con enlaces directos y navegación Atrás/Adelante.

Economía agrupa Caja, Costos, Pruebas (precio eléctrico) y Alternativas. Operación agrupa Energía, Condiciones y Pruebas (vueltas/consumo). Ambiente conserva ámbito/período. Archivos contiene copias, importación, JSON, CSV, informe/PDF y restauración; Fuentes reúne evidencia, contexto, derechos y metodología.

«Cambiar ruta», en Configurar, abre el catálogo con búsqueda; el nombre del ramal también lo abre desde el mapa. El archivo es histórico: cambiar geometría conserva los demás datos y lo comunica. El editor mantiene todos los esenciales y cuatro grupos avanzados. Las ediciones reciben «Supuesto editable», conservando referencia y escala A–F.

El estado compacto lleva a Operación / Condiciones. El diagnóstico distingue cálculos de autorización, patio/conexión, oferta, accesibilidad y compatibilidad por confirmar. «Revisar parámetro» abre Configurar, despliega el grupo pertinente y enfoca el campo. Una entrada inválida conserva resultados anteriores identificados y bloquea reproducción/aplicación/exportación de resultados vigentes; el editor sigue disponible.

## Explorar el mapa

«Recorrido» diferencia los trazos originales; no les atribuye automáticamente sentido, terminal o parada. «Batería en el recorrido» representa el saldo energético según la vuelta seleccionada. El icono de van, minibús o autobús identifica la clase del vehículo del escenario y una posición de exploración, nunca seguimiento real. Puede elegirse con el control de distancia o clic a menos de 20 px del recorrido; un clic en espacio vacío no lo mueve. No se rota el icono ni se atribuye sentido de circulación.

Para una fracción `f` del ciclo y una vuelta `v`:

```text
km_acumulados = km_ciclo_editado × (v − 1 + f) × (1 + adicionales)
kWh_consumidos = km_acumulados × consumo_neto_BEV
SOC_estimado = SOC_inicial − kWh_consumidos / (batería_nominal × salud)
```

El consumo neto ya incluye auxiliares y regeneración. No se añade recuperación gratuita ni se atribuye variación a pendientes o tráfico. Los km adicionales se distribuyen proporcionalmente como abstracción de prueba; no se dibuja un recorrido al patio inexistente.

La posición cartográfica usa distancia Haversine acumulada únicamente dentro de cada LineString, sin sumar o dibujar saltos entre trazos. La longitud editada escala la distancia modelada; no deforma la geometría. Se muestran ambas longitudes cuando difieren. El punto de reserva se deriva del mismo presupuesto energético. Verde indica más de diez puntos porcentuales sobre el SOC mínimo; ámbar, cercanía a la reserva; guinda, reserva alcanzada/superada. No son estados de tráfico.

Si el SOC matemático resulta negativo, el indicador visual marca energía agotada y el requerimiento acumulado sigue visible. Eso describe un escenario que falla; no conducción física con batería negativa. El esquema SVG conserva el control de posición cuando falta WebGL. El cálculo permanece disponible si faltan teselas o cartografía.

Las tarjetas «En este punto» y «Batería para el día» muestran kilómetros, consumo de batería, SOC/reserva y margen o déficit energético de la unidad. La energía del día no certifica recuperación nocturna ni inversión: carga y financiamiento permanecen en el diagnóstico. Seleccionar el vehículo abre modelo, plazas, consumo neto, batería nominal y salud del escenario. Cuando las entradas son inválidas se conserva el resultado anterior, identificado, y se bloquea la navegación energética.

La barra ofrece dos escalas: **«Todo el día»** recorre de forma continua todas las vueltas simuladas y marca cada frontera con un divisor; **«Una vuelta»** enfoca la vuelta elegida y divide el recorrido según los trazos cartográficos. Las etiquetas `V1`, `V2`… identifican vueltas. En la vista de una vuelta, `T1`, `T2`… identifica cada LineString y los divisores respetan su proporción de distancia cartográfica; no significan paradas, terminales, sentido ni conexiones entre extremos. El encabezado de la barra indica siempre la vuelta activa y, en la vista de una vuelta, el trazo donde está el cursor. Las marcas del día son uniformes por número de vueltas; las de trazos, proporcionales a la geometría.

El campo **«Vueltas / unidad / día»** edita el parámetro de operación del escenario (de 1 a 100), no sólo las marcas del control: el motor recalcula energía, distancia, servicio y costos y la escala diaria se redibuja con ese total. Si cambia el número de vueltas y la vuelta seleccionada queda fuera del día nuevo, la selección se ajusta a la última vuelta disponible.

«Opciones del recorrido» reúne inicio/final, vueltas por día, escala y selector de vuelta. La barra de progreso tiene una fila propia. Seleccionar vuelta conserva la fracción actual; cambiar de escala conserva vuelta, posición y consumo. Inicio/final llevan al primer/último punto del día sin cambiar economía. «Ver límite de batería» y «Ir a la reserva» comparten `batteryLimit`; una frontera pertenece al final de la vuelta anterior y un límite posterior al día no se ofrece como destino. «Encuadrar ruta» considera el espacio ocupado por paneles; abrir una vista no cambia la cámara.

Reproducir/Pausar y Reiniciar exploran la escala seleccionada a ritmo visual 1×, 2× o 4×. A 1× se recorren todas sus posiciones en 60 segundos; no representa duración o velocidad reales. Se detiene al final y pausa al alcanzar la reserva antes del final. Continuar exploración requiere acción explícita y conserva la indicación de energía insuficiente. Navegar manualmente, editar, abrir vistas/diálogos u ocultar la pestaña pausa. El movimiento reducido usa avances discretos de un segundo. El motor no se ejecuta por fotograma ni el progreso modifica archivos/escenario.

Las tarjetas del punto y del día flotan sobre el mapa. En pantallas pequeñas se reduce su composición; la evaluación completa permanece en Operación y el límite sigue en las opciones. La leyenda se retira cuando compite con un panel. Las referencias y el método territorial están en «Acerca del mapa». Atribuciones y controles geográficos mantienen espacio reservado. El esquema sin WebGL conserva símbolos, consumo e inspección, sin ofrecer centrado geográfico.

El contexto hospitalario está activado inicialmente sólo para Ruta 1. Cinco referencias aproximadas de inmuebles se sirven localmente bajo ODbL. Los nombres/domicilios institucionales y límites aparecen en sus referencias y en la ficha seleccionada. Iconos cercanos se agrupan por proximidad en pantalla (52 px); su número cuenta inmuebles del archivo, no pasajeros ni hospitales atendidos. Seleccionar el grupo acerca el mapa; los nombres cortos aparecen a partir del zoom 14 sólo cuando no se superponen entre sí. «Centrar hospital» es una acción explícita y abre una vista de zoom 17; abrir la ficha desde la lista no mueve la cámara. No acreditan caminata, accesos, cobertura, paradas o demanda. No entran en las ecuaciones ni en el escenario JSON. [Procedencia](recursos-hospitales/README.md).

## Leer energía, presupuesto y límites

**Energía diaria:** las barras comparan energía disponible sin invadir reserva y requerida para servicio/adicionales, en kWh por unidad. Margen o déficit, reserva apartada, energía comprada/pérdidas y horas de carga de la flota se muestran por separado. No se comparan litros con kWh en una misma escala energética.

**Panel financiero:** abre con «¿El recaudo sostiene los pagos y el ingreso presupuestado?» y el mínimo de caja eléctrica de los 60 meses, su primer mes y el conteo de meses deficitarios. Arranca en ese mes exacto aunque la última cuota difiera por centavos. Conserva las barras apiladas y la referencia del recaudo; el desglose visible tiene importes a centavos. Personal e ingreso del concesionario son montos presupuestados y el excedente de caja no tiene reparto asignado.

La línea de tiempo agrupa meses consecutivos con la misma distribución visible a pesos enteros y separa reposiciones; seleccionar una etapa abre su primer mes. Una única etapa se presenta como rótulo compacto. «Consultar un mes específico» permite recorrer 1–60 con teclado/deslizador. El déficit permanece visible, sin recortar los egresos para aparentar equilibrio.

Le siguen barras de capacidad disponible con marcador del pago previsto, holgura/brecha y equivalencia del excedente positivo en recaudo. El puente conecta caja de combustión con caja eléctrica mediante diferencias firmadas de operación, pagos y reserva/reposición. La prueba temporal de caída de recaudo 0–30% usa el evaluador y abre en 10%; cambia únicamente ascensos y muestra ambas cajas del mes, mínimos y meses deficitarios. No modifica guardado ni exportaciones. Véanse indicadores, ejemplos y límites en la [guía del panel](panel-financiero.md).

La curva de deuda, saldos del mes, intereses, comisiones, deuda pendiente al mes 60, hitos y reservas están en detalle consultable. La curva supone todos los pagos previstos incluso cuando hay déficit: no acredita solvencia. Una renta conserva cuota aunque no genere deuda del operador. Provisión y saldo de reserva se distinguen; cobertura/faltante sólo aparecen para reposiciones programadas, sin atribuir cobertura de averías. Al editar o invalidar se reinician período y prueba, se deshabilitan sus controles y se identifica el presupuesto anterior.

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
