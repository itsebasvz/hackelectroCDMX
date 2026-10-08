import type { Constraint, Result } from '../domain/schema';
import { mxn, num } from '../ui/format';

export const conditionStates = {
  pass: 'Cumple el cálculo',
  fail: 'Por resolver',
  pending: 'Por confirmar',
};
export const conditionParameters: Record<string, string> = {
  capacity: 'operation.requiredCapacity',
  battery: 'ev.consumption',
  charging: 'energy.chargeHours',
  schedule: 'operation.cycleMinutes',
  frequency: 'operation.maxHeadwayMinutes',
  connector: 'ev.connector',
  income: 'economy.laborCost',
  initial: 'economy.ownCapital',
  monthly: 'finance.annualRate',
};
/** Misma presentación en diagnóstico e informe; desconocido nunca acredita compatibilidad. */
export function presentedConditions(r: Result): Constraint[] {
  const s = r.scenario;
  const details: Record<string, string> = {
    initial: `Necesitas ${mxn(r.ev.ownRequired)} de capital propio; dispones de ${mxn(s.economy.ownCapital)}. Confirmar capital y aportación disponibles.`,
    monthly: `El mínimo de caja es ${mxn(r.ev.minMonthlyCash)}/mes, después de trabajo, pagos, ingreso del concesionario y reserva. Confirmar recaudo, costos y oferta.`,
    battery: `Se requieren ${num(r.dailyBatteryKwh, 2)} kWh y hay ${num(r.usableKwh, 2)} kWh disponibles respetando la reserva. Confirmar consumo y batería de la configuración.`,
    charging: `${Number.isFinite(r.charge.hours) ? `La flota requiere ${num(r.charge.hours, 2)} h` : 'No hay potencia para recargar la flota'}; hay ${num(s.energy.chargeHours)} h disponibles. Confirmar potencia, curva y turnos en el sitio.`,
    schedule: `${num(r.workHours, 2)} h/unidad frente a ${num(s.operation.serviceHours)} h de servicio; ${num(r.workHours / s.operation.operators, 2)} h/operador frente a ${num(s.operation.maxShiftHours)} h máximas. Confirmar recorrido, maniobras y turnos.`,
    capacity: `Mínimo ${s.operation.requiredCapacity}; combustión ${s.ice.capacity} y eléctrico ${s.ev.capacity} plazas efectivas de prueba. Confirmar configuración autorizada y accesibilidad.`,
    frequency: `${num(r.headway, 1)} min teóricos frente a ${num(s.operation.maxHeadwayMinutes, 1)} min máximos. Confirmar despacho y frecuencia del servicio.`,
    income: `${mxn(s.economy.laborCost)} presupuestados frente a ${mxn(s.economy.incomeGoal)} objetivo por persona/mes. Confirmar salario neto y prestaciones.`,
    connector: `${s.ev.connector} / ${s.charger.connector}. Confirmar configuración y potencia admitida con proveedor.`,
  };
  return r.constraints.map((c) => ({
    ...c,
    status:
      c.id === 'connector' && (s.ev.connector === 'unknown' || s.charger.connector === 'unknown')
        ? 'pending'
        : c.status,
    detail: details[c.id] ?? c.detail,
  }));
}
