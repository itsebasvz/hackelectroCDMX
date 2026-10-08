# Dashboard: resultados claros y decisiones explicables

Especificación aprobada e implementación de octubre de 2026. Cada bloque sigue conclusión, evidencia visual y detalle consultable. Identidad de DESIGN.md: guinda, gris, blanco y rosa tenue; paneles con alturas naturales.

## Composición y diagnóstico

La composición vigente está en [Dashboard sobre el mapa](redisenio-mapa.md): mapa persistente y cuatro accesos temáticos. Economía reúne métricas/comparación, presupuesto y búsqueda; Operación contiene energía, diagnóstico y pruebas técnicas. Ambiente tiene su propia vista. Los bloques conservan conclusión, evidencia y detalle consultable.

El diagnóstico sigue siendo único: muestra todas las condiciones calculadas y externas, trabajo presupuestado y enlaces al parámetro. «Revisar parámetro» abre el editor y enfoca el campo después del montaje. Guardado, exportación y fuentes se consultan desde utilidades visibles.

## Exploración con el mismo evaluador

El worker calcula tres series identificadas: vueltas por unidad/día, consumo en batería y precio por kWh comprado. Cada punto invoca evaluateScenario cambiando sólo esa entrada y conserva energía, recarga, mínimos de caja y restricciones completas. No hay fórmulas financieras paralelas en React. Vueltas no alteran recaudo.

Rangos elegidos por la herramienta, sin carácter empírico: vueltas enteras 1…min(100, max(12, 2×actual)); once valores entre 50% y 150% del consumo o precio actual. Precio cero explora 0…8 MXN/kWh. Se acotan al esquema, deduplican e incluyen el valor actual exacto. Las conclusiones se refieren sólo a puntos evaluados, sin interpolar umbrales globales.

La selección mediante deslizador no edita el escenario hasta «Aplicar al escenario». Editar invalida selección y resultados antiguos; aplicación deshabilitada durante actualización o invalidez. La banda distingue puntos que cumplen/incumplen; indicadores y motivos permiten leer el resultado sin curvas. Una restricción común a todos los puntos se declara explícitamente. Cambiar vueltas exige decidir el servicio, no se recomienda reducirlo automáticamente. Precio eléctrico mantiene cargos fijos y de potencia.

## Transformaciones ambientales

Unidad/flota y día/mes/año multiplican resultados diarios del motor. Mes usa días operativos; año equivale a doce meses, sin 365 días ni degradación proyectada. Se muestran litros sustituidos, CO₂ de escape de combustión (eléctrico cero) y CO₂e indirecto de recarga en gráficos separados. No se resta un alcance del otro ni se calcula un porcentaje neto.

Desglose eléctrico: energía de servicio = km de servicio × consumo; adicionales = energía de batería menos servicio; pérdidas = energía comprada menos energía de batería. Cada componente se multiplica por el mismo factor eléctrico y ámbito/período. La suma reconcilia con las emisiones eléctricas del evaluador.

EPA respalda ausencia de escape y persistencia de partículas de frenos/neumáticos; OMS respalda el vínculo general de contaminación del transporte y salud. La relevancia hospitalaria es una interpretación contextual, sin estimaciones de exposición o enfermedades evitadas. Fabricación, batería y fin de vida están excluidos. [Registro de referencias](fuentes-ambientales.json) separa factores de cálculo y contexto científico; no incorpora originales sin permiso verificado.

## Alternativas y archivos

«Evaluar combinaciones» conserva servicio, flota, personal, tarifa e ingresos objetivo, y busca menor aportación inicial entre combinaciones evaluadas. Conserva cancelación, progreso, tres opciones y descartes. Encontrar opciones y no encontrarlas tienen estados visuales distintos. La aportación mínima es hipotética, no subsidio disponible.

«Guardar y compartir la evaluación» separa copia local/importación y descargas. Informe prioritario para lectura y revisión; JSON para recalcular con catálogo y fuentes; CSV para examinar entradas/resultados. Restaurar ejemplo es terciario. JSON v1, ecuaciones, optimizador, factores y dependencias se conservan.

## Aceptación

Verificar equivalencia de puntos, cambio de una variable, recaudo constante, precio cero, límites, sin potencia y restricciones comunes; selección/aplicación y descarte de respuestas obsoletas. Comprobar conversiones ambientales y suma de componentes, estados compartidos e impresión, archivos reproducibles. Revisar 1920, 1440, 1024 y 390 px, teclado, contraste, tooltips y desbordamientos. Ejecutar check, test:e2e y format:check; registrar evidencia en el progreso local y guía de verificación.
