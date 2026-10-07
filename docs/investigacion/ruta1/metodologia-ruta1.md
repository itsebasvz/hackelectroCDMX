# Método, trazabilidad y suficiencia de la investigación

> **Actualización de alcance, 2026-10-06:** este documento conserva el cierre de la primera evaluación. El [maestro actualizado](../../documento-maestro-ruta1.md), [registro M01–M28](fuentes-documento-maestro.json) y [bases de decisión](bases-decision-ruta1.csv) incorporan geometría oficial histórica recuperada, aviso eléctrico verificado, evidencia comercial/laboral y condiciones G01–G08. La tercera revisión agrega referencias públicas y permite cerrar la investigación del hackatón: escenarios territoriales con [14 parámetros F de prueba](parametros-exploratorios-hackaton.csv). La operación actual, demanda, patio e ingreso siguen pendientes para calibración e inversión, sin bloquear el prototipo. Los estados de recuperación anteriores no describen las nuevas descargas abiertas M09/M10.

Fecha: 2026-10-06. Alcance: investigación documental del ramal Ruta 1 Metro Universidad–San Fernando–Huipulco para una transición justa. No se implementó simulación, arquitectura ni aplicación.

## Evidencia y antigüedad

La escala del plan original se aplica a **cada variable**, no automáticamente a cada documento: A = oficial específica de Ruta 1; B = oficial del corredor/zona; C = comparable CDMX; D = comparable México; E = benchmark externo; F = supuesto/modelado. Un catálogo externo no validado sobre el ramal se identifica como proxy F, con su texto respaldado pero su operación sin acreditar. Un estudio medido de Metrobús puede ser C sin representar este ramal. Un fabricante mexicano aporta parámetros comerciales D y no medición A. Las tablas anteriores marcaban los faltantes F, con estado `faltante` y valor `NO VERIFICADO`: nunca cero. La nueva tabla de decisión deja valor y nivel vacíos para `NO_VERIFICADO`, distinguiendo falta de evidencia de un supuesto numérico F. Sólo al introducir un supuesto explícito se asignará F; no cambia las filas históricas.

La naturaleza se registra aparte: oficial, observado, comercial, proxy, supuesto o derivado. `nivel_anterior` conserva la clasificación provisional de la primera entrega para auditar la corrección; no se usa en comparaciones. Un derivado conserva fórmula, IDs de entradas y sus niveles; si depende de hipótesis, F. No hubo mediciones del equipo.

Operación/flota/demanda deben buscarse en 2026; datos 2024–2025 requieren límite explícito y revisión de cambios por Línea 14. Los GIS históricos permiten reconstrucción candidata, no continuidad actual. Cotizaciones, tarifas, combustible, crédito y programas se fijan a fecha de consulta y vigencia. Legislación se contrasta con reformas y transitorios; PIM y Reglamento de 2003 son antecedentes. El índice de buscador y una fecha de rastreo no acreditan fecha de medición o de publicación.

## Organización y metadatos

Se aprovecha la estructura documental: `docs/originales/` conserva los cuatro PDF previos y `docs/fuentes/` sus extracciones. `docs/investigacion/ruta1/` reúne evaluación, notas iniciales, parámetros, matrices, registros de fuentes, fichas de recuperación, método, búsquedas y el borrador de solicitud. `docs/investigacion/latinoamerica/` contiene el análisis histórico complementario; `docs/contexto/` agrupa las guías generales. El [índice documental](../../README.md) permite navegar entre expedientes. No se crearon directorios vacíos ni estructura de desarrollo. Los nuevos originales sólo se incorporan cuando su permiso y descarga se verifican. La segunda revisión conserva los abiertos M09/M10 en `recursos-abiertos/`, con registro propio; no amplía el inventario de los cuatro PDF.

`fuentes-ruta1.json` registra nombre original/local real/propuesto, descripción, autor/institución, URL canónica/directa, localizador, publicación, consulta, formato, tamaño aproximado o desconocido, cobertura temporal/geográfica, variables, licencia/URL, permisos de redistribución/modificación/atribución, restricciones, estado de verificación, recuperación y checksum. `null` significa desconocido o aún inexistente, según el campo; no equivale a permiso.

La procedencia futura se documentará por identificadores:

`fuente Sxx → archivo original + SHA-256 + fecha → selección/transformación versionada → variable ID + unidades + entradas → comparación futura`.

En la primera revisión la cadena terminaba en fichas/variables documentales. La segunda añade originales y una transformación geográfica reproducible M09, sin construir un modelo de operación. Un original no descargado no se sustituye por un hash del resumen. Al descargar: preservar bytes, no sobrescribir originales, distinguir versiones por fecha/hash y registrar entrada/salida de cada transformación. Deduplicar por checksum sin fusionar coberturas distintas. El inventario antiguo sigue describiendo únicamente sus cuatro PDF.

## Licencias y recuperación

Antes de incorporar un recurso, verificar autorización en la ficha oficial y en sus términos, confirmar que cubre el recurso exacto y guardar referencia/localizador de esos términos. Estados admitidos: VERIFIED_OPEN, OPEN_WITH_ATTRIBUTION, PUBLIC_DOMAIN, RESTRICTED, UNKNOWN y DO_NOT_REDISTRIBUTE. CC BY 4.0 permite redistribuir y adaptar con atribución, enlace e indicación de cambios; se registra OPEN_WITH_ATTRIBUTION. Los términos de INEGI se revisan junto con metadatos del producto seleccionado.

Una publicación gubernamental, fabricante o estudio públicamente accesible sin términos claros permanece UNKNOWN. Se cita y conserva una paráfrasis propia; no se copia automáticamente el original. LFDA art. 14 VIII excluye de protección el texto normativo oficial, pero no todas las anotaciones, ilustraciones o compilaciones: por prudencia los archivos completos sin licencia identificada siguen UNKNOWN. [Texto legal, S50](https://www.diputados.gob.mx/LeyesBiblio/pdf/LFDA.pdf), PDF 5.

Separar licencia de acceso. `LEIDO_WEB` no significa `DESCARGADO`; `INDICE_SOLAMENTE` no significa lectura integral; `NO_LEGIBLE` no autoriza transcribir una tabla; `LOCAL_PREEXISTENTE` no significa licencia abierta. En la primera revisión los nuevos binarios no pudieron conservarse; M09/M10 documentan su recuperación posterior con permiso explícito. El registro mantiene la cola de recuperación y no inventa fechas, tamaños, nombres o hashes.

## Obtención de datos faltantes y validación

Con fuentes públicas: localizar padrón/derroteros y estudios por ramal; después cotejar geometrías/fechas; finalmente pedir datos existentes mediante el borrador SEMOVI. No esperar su respuesta para documentar los límites del hackatón. Si SEMOVI no tiene información, registrar inexistencia declarada y autoridad orientada, diferenciándolas de una búsqueda sin hallazgo. STE puede poseer convenios, afluencia e infraestructura de Línea 14; ORT, CETRAM y autorizaciones; CFE y titular del inmueble, suministro/capacidad. No hay solicitudes enviadas ni acceso de estos terceros autorizado para consultar información privada.

Una posterior observación breve deberá registrar día, franja, sentido, ubicación y método, con ocupación por bandas, intervalos y rótulo. Para distancia, ambos sentidos y recorridos vacíos; para utilización, bitácora por unidad. No convertir una entrevista en media del ramal ni extrapolar veinte minutos a pasajeros diarios. Una entrevista debe ser consentida, sin nombres o datos médicos innecesarios.

Antes de llenar parámetros, verificar equivalencia de plazas autorizadas, capacidad por hora, accesibilidad, tamaño, masa cargada y permisos. Confirmar batería nominal/utilizable, ventana SOC, consumo en batería/red, auxiliares y pérdidas. Para carga, derecho de uso del patio, suministro, potencia simultánea, conexión/cargador, costo, contrato y horas disponibles. Una instalación de trolebús no acredita estos puntos.

Para TCO, definir moneda/año, tratamiento de IVA, horizonte 1/5/10 años/vida útil, descuento e inflación. Elegir una contabilidad económica o de flujo consistente; desglosar principal e intereses para evitar doble conteo. Registrar subsidio sólo con elegibilidad/monto/fecha confirmados y no sumar el mismo beneficio a chatarrización y financiamiento. Separar mantenimiento preventivo/correctivo, neumáticos, seguros y tiempo fuera de servicio sin duplicar piezas incluidas en contrato.

Para transición justa, elaborar flujos separados del conductor, propietario y financiador a jornada y servicio comparables: recaudo, cuota, salarios/ingreso restante, energía, mantenimiento, deuda, riesgo y contingencias. Menor gasto de energía no acredita menor cuota ni ingreso protegido. No fijar una «cuota justa» sin baseline y acuerdo verificable.

Para emisiones, delimitar escape, energía/suministro y ciclo de vida; factores del mismo alcance y año pertinente. Registrar si el combustible reporta CO₂ o CO₂e; no restar EPA CO₂ de combustión a un resultado eléctrico de otro alcance para anunciar reducción total. NOx/PM necesitan clase/motor/tecnología y factores específicos. RAMA describe concentraciones ambientales, no atribución causal a la ruta.

## Dependencias y riesgos

Orden para resolver: **identidad/continuidad → flota/capacidad y demanda → utilización/geometría → candidato comparable → consumo y patio → costos/financiamiento por actor → ambiente y decisión**. La revisión de planes y regulación puede descartar inversión antes de cotizar. Los datos abiertos geográficos, tarifas y precedentes se localizaron en paralelo; no se usaron para saltar dependencias.

Riesgos registrados: confundir Ruta 1 con Pumabús u otro ramal; datos GIS antiguos con portal actualizado; horarios de línea con jornada de unidad; afluencia de estación con demanda propia; programa anunciado con apoyo otorgado; garantía general con garantía de batería; consumo NEDC con operación cargada; cobro de energía sin demanda/conexión; reorganización sin acuerdo laboral; disponibilidad de catálogo sin homologación/stock; índices parciales o inaccesibles; licencias no identificadas. La matriz de búsquedas documenta resultados y huecos; falta de hallazgo no prueba inexistencia.

## Definition of Done

Para el hackatón, la revisión pública ya permite una demostración exploratoria contextualizada en Ruta 1: recorrido histórico, parámetros de su ámbito, supuestos F explícitos, equivalencia declarada y pruebas coherentes. Aforos propios, contratos y patio no son dependencias de ese cierre. Los mínimos siguientes rigen resultados calibrados o inversión real, no el inicio del prototipo.

Hay tres cierres distintos. **La revisión pública de escritorio** queda documentada al cubrir A–N, registrar fuentes/acceso, resultados contrarios y faltantes, y emitir dictamen con límites. **La base de evidencia para comparar el ramal** y **la conservación de originales** no quedan completas por ese solo cierre.

| Requisito mínimo antes de una comparación específica | Evidencia aceptable | Estado 2026-10-06 |
| --- | --- | --- |
| Identidad y continuidad | Derrotero/registro fechado y cambios por Línea 14 delimitados. | Parcial: catálogo y antecedentes; continuidad no confirmada. |
| Baseline representativo | Clase, plazas, combustible, año/condición y utilización por unidad sustentados o acotados con evidencia específica. | Pendiente. |
| Demanda del servicio | Al menos evidencia específica parcial de ocupación/frecuencia con fecha/método; sin atribución agregada indebida. | Pendiente. |
| EV equivalente | Capacidad, accesibilidad y geometría compatibles; prestaciones y límites de consumo/carga trazables. | Dos candidatos; equivalencia pendiente. |
| Energía, costos y emisiones | Parámetros pertinentes con fuente/fecha, unidades y rangos defendibles; fronteras armonizadas. | Parcial; tarifas/consumos/costos aplicables pendientes. |
| Carga | Hipótesis localizada con titular/ventana y condiciones explícitas. Para afirmar viabilidad, factibilidad y costo comprobados. | Sin patio identificado. |
| Ingreso y financiamiento | Baseline por actor y escenario de deuda/riesgo trazable. Para afirmar viabilidad, condiciones aplicables y protección del ingreso comprobadas. | Pendiente. |
| Adversarial y trazabilidad | Evidencia favorable/contraria/faltante; cadena de fuentes/licencias y transformaciones. | Documentado; recuperación parcial posterior M09/M10; demás originales abiertos pendientes. |

Si faltan baseline o demanda propia, se permite un **escenario exploratorio territorial**, identificando geometría histórica y parámetros representativos/F. No se afirma que reproduce la operación actual. Para una comparación calibrada se requieren entradas específicas. Con baseline, demanda y equivalencia suficientes, pero carga/ingreso/crédito pendientes, se permite un **escenario condicionado**, sin afirmar viabilidad. Para afirmar «viable», demostrar servicio mantenido, carga suficiente, costos completos asequibles, cumplimiento aplicable e ingreso/jornada protegidos bajo contingencias documentadas. Para priorizar el ramal frente a otros hace falta además comparación homogénea; no se ha hecho.

La recuperación se cierra por fuente cuando el original permitido está conservado con fecha/SHA-256, o cuando se documenta que sólo corresponde cita por restricciones de uso. Un fallo de descarga de un recurso abierto mantiene esa tarea pendiente. Las fichas propias no satisfacen conservación del original.
