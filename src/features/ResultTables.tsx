import type { Result, FinancialResult } from '../domain/schema';
import { mxn, num } from '../ui/format';
export function ComparisonTable({ r, concise = false }: { r: Result; concise?: boolean }) {
  const rows: [string, string, string][] = [
    ['Costo económico · 5 años', mxn(r.ice.economicCost), mxn(r.ev.economicCost)],
    [
      'Costo económico por km',
      `${mxnPrecise(r.ice.costPerKm)}/km`,
      `${mxnPrecise(r.ev.costPerKm)}/km`,
    ],
    ['Operación mensual · flota', mxn(r.ice.operatingMonth), mxn(r.ev.operatingMonth)],
    [
      'Presupuesto laboral mensual',
      mxn(r.ice.months[0]!.workerCost),
      mxn(r.ev.months[0]!.workerCost),
    ],
    [
      'Ingreso objetivo concesionario',
      mxn(r.ice.months[0]!.ownerIncome),
      mxn(r.ev.months[0]!.ownerIncome),
    ],
    ['Capital propio inicial requerido', mxn(r.ice.ownRequired), mxn(r.ev.ownRequired)],
    ['Aportación aplicada a obra / reserva', mxn(r.ice.supportFixed), mxn(r.ev.supportFixed)],
    ['Aportación aplicada a adquisición', mxn(r.ice.supportCapital), mxn(r.ev.supportCapital)],
    ['Principal financiado inicial', mxn(r.ice.principal), mxn(r.ev.principal)],
    ['Pago mensual inicial', mxn(r.ice.payment), mxn(r.ev.payment)],
    ['Resultado de caja mensual más bajo', mxn(r.ice.minMonthlyCash), mxn(r.ev.minMonthlyCash)],
    ['Deuda pendiente · mes 60', mxn(r.ice.debtRemaining), mxn(r.ev.debtRemaining)],
    ['Reserva restante · mes 60', mxn(r.ice.reserveEnd), mxn(r.ev.reserveEnd)],
    ['Valor residual supuesto', mxn(r.ice.residual), mxn(r.ev.residual)],
    [
      'Energía diaria · unidad',
      `${num(r.dailyLiters, 2)} L`,
      `${num(r.dailyGridKwh, 2)} kWh comprados`,
    ],
  ];
  const visibleRows = concise ? [rows[0]!, rows[1]!, rows[5]!, rows[10]!] : rows;
  return (
    <div
      className="table-scroll"
      tabIndex={0}
      role="region"
      aria-label="Comparación detallada desplazable"
    >
      <table className={`comparison-table${concise ? ' comparison-summary' : ''}`}>
        <caption>Comparación de la flota · MXN constantes · horizonte de 60 meses</caption>
        <thead>
          <tr>
            <th scope="col">Indicador</th>
            <th scope="col">
              Combustión · {r.scenario.ice.fuel === 'diesel' ? 'diésel' : 'gasolina'}
            </th>
            <th scope="col">Eléctrico</th>
          </tr>
        </thead>
        <tbody>
          {visibleRows.map(([label, ice, ev]) => (
            <tr key={label}>
              <th scope="row">{label}</th>
              <td>{ice}</td>
              <td>{ev}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
const mxnPrecise = (v: number) =>
  new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(v);
export function CashTable({ f }: { f: FinancialResult }) {
  return (
    <div className="table-scroll" tabIndex={0} role="region" aria-label="Flujo mensual desplazable">
      <table>
        <caption>Flujo mensual eléctrico · flota · MXN</caption>
        <thead>
          <tr>
            <th scope="col">Mes</th>
            <th scope="col">Recaudo</th>
            <th scope="col">Operación</th>
            <th scope="col">Trabajo</th>
            <th scope="col">Concesionario</th>
            <th scope="col">Pago</th>
            <th scope="col">Deuda</th>
            <th scope="col">Reserva</th>
            <th scope="col">Margen libre</th>
          </tr>
        </thead>
        <tbody>
          {f.months.map((m) => (
            <tr key={m.month}>
              <th scope="row">{m.month}</th>
              <td>{mxn(m.revenue)}</td>
              <td>{mxn(m.operating)}</td>
              <td>{mxn(m.workerCost)}</td>
              <td>{mxn(m.ownerIncome)}</td>
              <td>{mxn(m.payment)}</td>
              <td>{mxn(m.balance)}</td>
              <td>{mxn(m.reserve)}</td>
              <td className={m.freeCash < 0 ? 'negative' : ''}>{mxn(m.freeCash)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
