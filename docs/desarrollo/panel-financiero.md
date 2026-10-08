# Capacidad de pago, destino del ahorro y resistencia del presupuesto

Implementación local: 2026-10-07. Fundamento: [documento maestro, sección 7](../documento-maestro-ruta1.md#7-la-prueba-económica-quién-paga-y-quién-conserva-el-ahorro). El panel responde «¿El recaudo sostiene los pagos y el ingreso presupuestado?» usando flujos del evaluador, sin acreditar viabilidad real ni protección salarial. [Metodología e indicadores](metodologia-motor.md#análisis-de-capacidad-de-pago-y-prueba-de-recaudo).

## Lectura y selección

1. **Conclusión:** mínimo de caja eléctrica de los 60 meses, primer mes en caso de empate y número de meses negativos. Se abre ese mes; una corrección de centavos en la última cuota puede hacerlo el más exigente. La condición laboral se mantiene independiente y se explica si el presupuesto es inferior al objetivo.
2. **Distribución:** barras apiladas de ambas tecnologías, referencia discontinua del recaudo y valores visibles a centavos. Personal e ingreso del concesionario son presupuestos. Caja positiva es excedente sin reparto asignado; caja negativa es déficit. Etapas agrupan distribuciones visibles a pesos enteros y separan reposición; se puede consultar un mes exacto. Con una única etapa se usa un rótulo compacto.
3. **Capacidad de pago:** cada barra muestra recursos después de todos los conceptos distintos del activo, con marcador de crédito/renta previstos. Disponibles menos pago coincide con caja. Si disponibles son negativos, una cuota cero tampoco resolvería el presupuesto. Holgura positiva puede expresarse como porcentaje equivalente del recaudo; se omite con caja no positiva o recaudo cero. No es probabilidad, margen bancario recomendado ni umbral global de viabilidad.
4. **Destino del ahorro:** puente desde caja de combustión hasta caja eléctrica. Ahorro de operación positivo libera caja; pagos adicionales o reposición no cubierta pueden absorberlo. Las tres contribuciones habituales son operación, pago del activo y reserva/reposición; recaudo, personal o ingreso del concesionario se agregan sólo si difieren. Cada paso muestra signo, importe y caja acumulada, con escala compartida y resultado reconciliado al centavo.
5. **Prueba temporal:** caída elegida entre 0 y 30%, paso de un punto, selección inicial 10%. El rango es una elección de la herramienta. Se reducen sólo los ascensos supuestos y se ejecuta el evaluador para cada punto, sin redondear ascensos promedio a enteros. Se conservan tarifa, servicio, flota, costos, financiamiento e ingresos objetivo. Se muestran ambas cajas del mes seleccionado, mínimos del horizonte y meses deficitarios. No existe acción para aplicar esta prueba; guardado, JSON v1, CSV e informe conservan el presupuesto original.
6. **Detalle:** curva de deuda, saldos, intereses del mes/acumulados, comisiones iniciales, hitos, provisión y saldos de reserva. La curva supone amortización con todos los pagos previstos, incluso con déficit de caja, por lo que no demuestra capacidad de pago. Deuda pendiente al mes 60 destaca compromisos posteriores. La renta mantiene pago periódico sin generar saldo de deuda del operador.

## Ejemplo de interpretación

Si la caja de combustión es −$10,000 y la operación eléctrica ahorra $20,000, pero los pagos eléctricos aumentan $15,000 y la reserva/reposición cuesta $2,000 adicionales, la caja eléctrica es −$7,000. Existe ahorro operativo y persiste una brecha. Una curva de amortización descendente no cambia esa falta de recursos.

La reserva se presenta como provisión mensual y saldo acumulado después del mes. Cobertura y faltante se calculan sólo para reposiciones programadas; su faltante ya forma parte de la caja del evaluador. No se utiliza reserva para financiar déficits recurrentes ni se afirma cobertura de averías no modeladas.

## Actualización y presentación

El worker calcula 31 puntos en lotes y atiende cancelación. Identificadores impiden que respuestas o errores anteriores reemplacen el nuevo escenario. Edición o invalidez reinician selección de período/prueba, deshabilitan sus controles e identifican el resultado anterior. Si falla la serie, se muestra el error y se mantiene el presupuesto original.

Se usan guinda, gris, blanco y rosa tenue, divisores y alturas naturales. El orden anterior se conserva en móvil. Importes y explicaciones son visibles; tooltips de distribución/deuda complementan esos datos y se montan fuera del contenedor para evitar recortes. Selectores, detalles y etapas funcionan por teclado.

La interfaz reside en `src/features/FinancePanel.tsx`, las transformaciones en `src/domain/financialAnalysis.ts` y la serie/cancelación en `src/worker/`. No se añaden dependencias, servicios, datos externos ni cambios al escenario versionado. Evidencia de pruebas y revisión visual en [verificación](verificacion.md).
