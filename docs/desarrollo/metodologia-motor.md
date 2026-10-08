# Metodología del motor exploratorio 1.0.0

Fecha: 2026-10-06. Alcance: unidad representativa, flota homogénea, día repetible y flujo mensual durante 60 meses. No valida inversión real, operación vigente, homologación, autorización, ingresos privados ni oferta financiera.

## Entradas y procedencia

El escenario integra ramal, operación, energía, economía, vehículo de combustión, BEV, cargador, financiamiento y una instantánea del catálogo/fuentes. Cada parámetro mantiene valor/unidad y metadatos de naturaleza, nivel A–F, fecha, ámbito y limitación. Los derivados heredan la incertidumbre de sus entradas; un resultado con consumos F continúa siendo exploratorio aunque use una longitud oficial histórica.

`src/data/defaults.ts` y `src/data/catalog.ts` son las entradas efectivamente implementadas. Los ejemplos adicionales de mantenimiento, seguro, renta, instalación e ingreso son valores F diseñados para completar una demostración, no intervalos empíricos. Las referencias oficiales nacionales de combustible no son precios pagados en Ruta 1. Las plazas efectivas supuestas no acreditan accesibilidad ni autorización de transporte.

## Distancia y servicio

```text
km_servicio_día = km_ciclo × ciclos
km_totales_día = km_servicio_día × (1 + fracción_adicional)
intervalo_teórico = minutos_ciclo / unidades
horas_unidad = ciclos × minutos_ciclo / 60
             + km_adicionales / velocidad_adicional
             + maniobras_pagadas
```

Exigir capacidad mínima de ambas referencias, intervalo máximo objetivo, horas disponibles y horas por operador dentro de la jornada de prueba. La división de horas entre operadores es una condición agregada: no construye turnos ni acredita descansos, prestaciones o salario neto. El costo laboral presupuestado debe ser al menos el ingreso objetivo declarado; su alcance real queda por comprobar.

Ascensos diarios y tarifa determinan un recaudo constante. No hay elasticidad, aforo, estacionalidad ni aumento automático de pasajeros al elegir un vehículo mayor. Los ascensos pueden exceder plazas por viaje por renovación de pasajeros a lo largo del recorrido; no representan ocupación simultánea.

## Energía y carga

```text
L_día = km_totales_día / rendimiento_km_L
kWh_batería_día = km_totales_día × consumo_neto_kWh_km
kWh_medidor_día = kWh_batería_día / eficiencia
capacidad_disponible = batería_nominal × SOH × (SOC_max − SOC_min)
SOC_final = SOC_max − kWh_batería_día / (batería_nominal × SOH)
```

Consumo neto incluye auxiliares y regeneración. No se resta regeneración nuevamente. SOH es un escenario de capacidad remanente, no una predicción de degradación anual. La ventana SOC ya contiene la reserva y no se descuenta otra reserva adicional.

Potencia por vehículo: mínimo entre potencia admitida, cargador y potencia libre del sitio dividida entre vehículos activos. Cargadores de un solo puerto. Se asignan unidades homogéneas por lotes; el último lote puede aprovechar más potencia por vehículo. La curva hipotética usa potencia completa hasta el umbral de SOC editable (80% inicial) y su fracción editable después (50% inicial). Las pérdidas ocurren entre medidor y batería.

Exigir que toda la flota recupere la energía consumida dentro de la ventana nocturna. El perfil diurno inicia en SOC máximo sólo cuando esta recuperación es posible. Un escenario que incumple carga no puede recomendarse, aunque su primer día parezca suficiente. No se modela carga de oportunidad ni disponibilidad estocástica de cargadores.

El cargo de potencia usa el máximo promedio de intervalos de 15 minutos del perfil de carga atribuido a la flota. Los otros usos limitan potencia disponible; sus costos ajenos a la flota no se agregan a esta factura exploratoria. Sólo se tabulan hasta 24 horas de carga; una carga que excede el día se rechaza por operación. Esto no reproduce la contratación o facturación oficial CFE.

## Inversión y asignación del apoyo

Inversión: vehículos completos más cargadores no incluidos en adquisición, obra base e instalación por cargador. Un kit incluido no se compra nuevamente. En proveedor de vehículos, éstos no son propiedad del operador: se registra renta y obra a cargo del operador, sin residual de vehículos.

Reserva inicial = entrada por unidad × flota. No es gasto económico ni un pago adicional de principal. El apoyo es una aportación única genérica; su utilización para inversión/reserva es una hipótesis de diseño, no elegibilidad de un programa público.

El enganche es un **mínimo** del crédito. Se permite destinar más capital propio para bajar deuda, conservando la reserva inicial. La comisión se paga al inicio sobre el principal. El algoritmo trabaja en centavos:

1. Separar inversión financiable y costos no financiables/reserva según la opción de financiamiento.
2. Distribuir la aportación entre ambas partidas de manera que el enganche mínimo y comisión quepan en el presupuesto inicial.
3. Con esa distribución, elegir el principal mínimo que cabe en el capital disponible. Si no cabe ni el enganche mínimo, registrar incumplimiento inicial.
4. Aplicar aportaciones completas hasta inversión + reserva; informar cualquier exceso como no aplicado.

Esta asignación evita inflar artificialmente el apoyo por imponer que toda la reserva se subsidie antes de reducir deuda. No supone que un banco acepte esas condiciones: las ofertas del catálogo son hipotéticas y requieren validación contractual.

## Flujo mensual y costo económico

Cuota de crédito con tasa nominal mensual `r = tasa_anual / 12`:

```text
pago = principal × r / (1 − (1+r)^(-plazo))
```

Para tasa cero: principal/plazo. La implementación usa `log1p`/`expm1` para estabilidad con tasas pequeñas. Interés, principal, comisiones y caja se redondean a centavos. El último pago corrige sólo el saldo de redondeo; no perdona deuda intermedia.

```text
operación = energía + mantenimiento + seguro + administración + patio
          + cargos eléctricos atribuibles (EV)
trabajo = costo_laboral × operadores_por_unidad × flota
ingreso_propietario = objetivo_por_unidad × flota
margen_libre = recaudo − operación − trabajo − ingreso_propietario
            − pagos − aporte_reserva − reemplazo_no_cubierto_por_reserva
```

La reserva acumulada puede cubrir un reemplazo de batería programado; su costo económico se registra una vez cuando ocurre. Sin reemplazo programado no se afirma que la batería dure indefinidamente. El objetivo de ingreso del concesionario es una condición de caja, separado de remuneración laboral y del TCO.

```text
costo_económico_5_años = inversión + comisiones + operación + trabajo
                       + intereses + rentas + reemplazos − residual
```

No sumar amortización del principal al precio de adquisición. La aportación reduce caja propia requerida y puede reducir intereses; no borra el costo de los activos. Reservas retenidas no son gastos. En proveedor, costo económico es desde el punto de vista del operador, no TCO de toda la cadena de activos.

Reportar deuda al mes 60 cuando el crédito no ha terminado, así como reserva restante, residual supuesto y capital propio utilizado. No hay descuento a valor presente, inflación, impuestos desglosados ni externalidades. Precios comerciales citados incluyen IVA cuando lo dice la fuente; valores F se interpretan como montos totales de escenario, sin recuperación fiscal simulada.

## Búsqueda de aportación mínima

Enumerar BEV, cargador, cantidad de cargadores 1…flota y financiamiento. Sustituir por la configuración editada las referencias seleccionadas del catálogo. Mantener operación, demanda, tarifa, personal e ingresos objetivo. Rechazar primero incompatibilidades conocidas y restricciones físicas/laborales. Conectores desconocidos son una hipótesis pendiente visible, no una compatibilidad comprobada.

Para cada candidato buscar por bisección en centavos la aportación inicial mínima cuyo desembolso cabe en el capital propio y cuyo menor margen mensual es no negativo. El límite superior es inversión + reserva. Si el margen sigue siendo negativo sin deuda, descartar: la aportación no resuelve el déficit recurrente. En renta, aportar al inicio no reduce automáticamente su cuota.

Orden: aportación mínima, costo económico a cinco años, capital propio y clave estable del candidato. Mostrar tres opciones, incidencias de descarte y umbrales orientativos. Si el producto cartesiano supera 10,000, no ejecutar ni truncar. No es un óptimo universal ni certificación de viabilidad; es la mejor combinación del catálogo y condiciones evaluados.

## Emisiones y alcance humano

Combustión: litros × factor EPA (8.887 gasolina / 10.180 diésel kg CO₂ por galón estadounidense, convertido con 3.785411784 L/galón). Es benchmark externo de escape, no inventario mexicano de CO₂e.

Electricidad: kWh comprados × 0.444 kg CO₂e/kWh, factor SEN 2024 referido por aviso SEMARNAT de 2026. No es una medición de 2026 ni ciclo de vida. Mostrar ambas magnitudes por separado, sin porcentaje neto de reducción por alcances incompatibles.

El BEV carece de escape; no se calculan NOx/PM, beneficios sanitarios causales, ahorro de tiempo o baja de tarifa. Conservar servicio, ingreso y trabajo son condiciones explícitas del modelo, no efectos garantizados por la electrificación.

## Reproducción y validación

JSON exportado: escenario normalizado, catálogo, fuentes, versiones, fecha y checksum SHA-256. La fecha se excluye del checksum; las claves se ordenan de forma determinista. La importación valida tamaño (5 MB), versión, tipos, números finitos, consistencia y checksum; recalcula los resultados en lugar de confiar en resultados externos. El checksum identifica integridad, no autenticidad o calidad de una fuente aportada por usuarios.

CSV e informe conservan entradas, unidades, evidencia, resultados, restricciones y referencias. Se protegen cadenas CSV contra fórmulas. Una edición inválida no reemplaza el último resultado válido ni se guarda como escenario válido.

Las pruebas cubren casos analíticos, energía y carga, saldo financiero, asignación comparada con enumeración exhaustiva independiente, apoyo mínimo al centavo, déficit recurrente, exportación, respuestas obsoletas, accesibilidad, móvil y fallos de mapa. Los resultados con fuentes incompletas permanecen condicionados.

## Exploración explicativa de la interfaz

El rediseño no modifica las ecuaciones del modelo 1.0.0. [Interfaz de evaluación](interfaz-evaluacion.md) documenta las transformaciones para presupuesto mensual, energía, consumo acumulado por distancia y sensibilidad. El [dashboard explicativo](redisenio-dashboard.md) amplía las series a consumo y precio eléctrico y documenta las conversiones ambientales. La sensibilidad invoca el evaluador completo y conserva recaudo y condiciones financieras; el mapa distribuye consumo de manera uniforme y no conecta artificialmente trazos. Las referencias hospitalarias son contexto ajeno al cálculo. La brecha de capital inicial no sustituye la aportación mínima encontrada por el optimizador.
