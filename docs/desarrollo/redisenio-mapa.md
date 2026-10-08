# Dashboard sobre el mapa

## Inventario de la mudanza

| Herramienta anterior | Destino | Conservación |
|---|---|---|
| Controls y Editor | Configurar | Catálogo de ramales, presets, vehículos, esenciales, cuatro grupos avanzados, evidencia y conectores |
| Mapa, PointCard, DayCard | Inicio | Trazos, posición, batería, consumo, día/vuelta, inicio/fin, hospitales, leyenda y encuadre |
| Comparación y métricas | Economía / Costos | Cuatro indicadores, quince filas completas, flujo de 60 meses y perspectiva de contado/crédito/renta |
| FinancePanel | Economía / Caja | Mínimo/mes, etapas, reparto, capacidad, puente, caída de recaudo, deuda, intereses, hitos y reservas |
| Environment | Ambiente | Ámbito/período, combustible, escape, electricidad, desglose y límites |
| Presupuesto energético | Operación / Energía | Disponible/requerida, servicio/adicionales/reserva, recarga y ventana nocturna |
| Diagnostic | Operación / Condiciones | Calculadas y externas, trabajo presupuestado, enlace al parámetro y búsqueda |
| Sensitivity | Operación / Pruebas; Economía / Pruebas | Vueltas/consumo; precio eléctrico. Todos los indicadores y aplicación explícita |
| Optimizer | Economía / Alternativas | Búsqueda, progreso, cancelación, tres opciones, motivos y aplicación |
| Copias y descargas | Archivos | Nombre, hasta 20 copias, JSON v1, CSV, informe/PDF y restauración |
| Fuentes, metodología y avisos | Fuentes | Escala A–F, factores, limitaciones, derechos, equipo y licencias |

Los componentes conservan sus cálculos y contratos. La composición sustituye la página larga; no duplica el evaluador ni agrega un backend.

## Navegación y estado

La URL usa `#/mapa`, `#/configurar`, `#/economia/caja`, `/costos`, `/pruebas`, `/alternativas`, `#/ambiente`, `#/operacion/energia`, `/condiciones`, `/pruebas`, `#/archivos` y `#/fuentes`. Los sufijos abreviados pertenecen al mismo prefijo temático. Una ruta desconocida vuelve al mapa; los fragmentos antiguos se traducen. `#/configurar?campo=finance.months` abre y enfoca un campo existente.

Abrir una sección no remonta el mapa ni el motor. Las vistas visitadas quedan ocultas con sus selecciones/desplazamiento conservados. Las gráficas se inicializan con dimensiones visibles y se redimensionan al mostrar/ampliar; sus tooltips se retiran al ocultar. Las selecciones financieras reinician al editar/invalidez conforme a la especificación original. Los diálogos del catálogo siguen usando Radix.

En escritorio el panel lateral permite alternar foco con el mapa. Ampliar o usar pantalla estrecha vuelve inerte el resto del espacio y contiene el foco; Escape/cierre vuelven al mapa y al acceso original. El contenido desplazable se puede enfocar. La vista ampliada conserva la misma instancia de sus componentes.

## Reproducción

Una escala completa tarda 60 segundos a ritmo 1×; 2× y 4× sólo cambian el ritmo visual. Día/vuelta mantienen consumo acumulado y las posiciones del mismo evaluador. No se modelan velocidad, tráfico, pendientes, despachos ni demanda variable. La animación mueve el marcador y lecturas; no vuelve a evaluar ni reconstruye las capas geográficas por fotograma.

La reproducción empieza pausada, se detiene al final y en el límite de reserva anterior al final. Continuar exige una decisión explícita y permite inspeccionar el déficit. El progreso manual sigue disponible. Abrir vistas/diálogos/opciones, editar, cambiar de escala o navegar manualmente pausa; ocultar la pestaña también. Movimiento reducido usa pasos de un segundo. Faltando geometría o resultado vigente se deshabilita reproducción, sin bloquear edición/cálculos. Sin WebGL se conserva el esquema de trazos y su exploración.

## Entrega y límites

`feat/redisenio-mapa` es la rama de trabajo. Plan y progreso nuevos son locales e ignorados; sus predecesores se retiraron por instrucción del usuario. No se agregaron dependencias, servicios, fuentes, recursos territoriales ni ecuaciones. Se actualizaron DESIGN.md y la guía de interfaz. Las comprobaciones y dimensiones revisadas se registran en [verificación](verificacion.md).

La herramienta sigue siendo exploratoria: ni reproducción ni resultados favorables acreditan operación real, financiamiento, autorización o salario protegido. Archivos/exportaciones conservan JSON v1 y el informe completo. La prueba temporal de recaudo continúa separada de las entradas persistidas.
