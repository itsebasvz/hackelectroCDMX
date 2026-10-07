import { lazy, Suspense, useMemo } from 'react';
import {
  BatteryCharging,
  Coins,
  Users,
  ArrowUpRight,
  Clock3,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import type { Result, FinancialResult } from '../domain/schema';
import { mxn, num } from '../ui/format';
const Chart = lazy(() => import('../ui/Chart'));
const StatusIcon = ({ status }: { status: string }) =>
  status === 'pass' ? (
    <CheckCircle2 size={17} />
  ) : status === 'fail' ? (
    <AlertCircle size={17} />
  ) : (
    <HelpCircle size={17} />
  );
export function ComparisonTable({ r }: { r: Result }) {
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
    ['Menor margen mensual', mxn(r.ice.minMonthlyCash), mxn(r.ev.minMonthlyCash)],
    ['Deuda pendiente · mes 60', mxn(r.ice.debtRemaining), mxn(r.ev.debtRemaining)],
    ['Reserva restante · mes 60', mxn(r.ice.reserveEnd), mxn(r.ev.reserveEnd)],
    ['Valor residual supuesto', mxn(r.ice.residual), mxn(r.ev.residual)],
    [
      'Energía diaria · unidad',
      `${num(r.dailyLiters, 2)} L`,
      `${num(r.dailyGridKwh, 2)} kWh comprados`,
    ],
  ];
  return (
    <div
      className="table-scroll"
      tabIndex={0}
      role="region"
      aria-label="Comparación detallada desplazable"
    >
      <table className="comparison-table">
        <caption>Comparación de la flota · MXN constantes · horizonte de 60 meses</caption>
        <thead>
          <tr>
            <th scope="col">Indicador</th>
            <th scope="col">{r.scenario.ice.fuel === 'diesel' ? 'Diésel' : 'Gasolina'}</th>
            <th scope="col">Eléctrico</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([label, ice, ev]) => (
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
export default function Dashboard({ result: r }: { result: Result }) {
  const s = r.scenario;
  const failed = r.constraints.filter((c) => c.status === 'fail');
  const savings = r.ice.operatingMonth - r.ev.operatingMonth;
  const socOption = useMemo(
    () => ({
      color: ['#9D2148'],
      grid: { left: 42, right: 16, top: 20, bottom: 35 },
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        data: r.socTimeline.map((p) => `${num(p.hour)} h`),
        axisLabel: { fontSize: 11 },
      },
      yAxis: { type: 'value', min: 0, max: 100, axisLabel: { formatter: '{value}%' } },
      series: [
        {
          name: 'SOC',
          type: 'line',
          smooth: false,
          data: r.socTimeline.map((p) => Number((p.soc * 100).toFixed(2))),
          areaStyle: { color: '#F8E8ED' },
          markLine: {
            silent: true,
            symbol: 'none',
            label: { formatter: 'Reserva' },
            data: [{ yAxis: s.energy.socMin * 100 }],
            lineStyle: { color: '#AC6D14', type: 'dashed' },
          },
        },
      ],
    }),
    [r],
  );
  const cashOption = useMemo(
    () => ({
      color: ['#55585A', '#9D2148'],
      grid: { left: 65, right: 18, top: 30, bottom: 35 },
      tooltip: { trigger: 'axis' },
      legend: { data: ['Combustión', 'Eléctrico'], top: 0 },
      xAxis: { type: 'category', data: r.ev.months.map((m) => m.month), name: 'Mes' },
      yAxis: { type: 'value', axisLabel: { formatter: (v: number) => `${num(v / 1000, 0)} mil` } },
      series: [
        {
          name: 'Combustión',
          type: 'line',
          showSymbol: false,
          data: r.ice.months.map((m) => m.freeCash),
        },
        {
          name: 'Eléctrico',
          type: 'line',
          showSymbol: false,
          data: r.ev.months.map((m) => m.freeCash),
        },
      ],
    }),
    [r],
  );
  return (
    <div className="dashboard">
      <div className="dashboard-heading">
        <div>
          <span className="eyebrow">RESULTADOS DEL ESCENARIO</span>
          <h2>La transición, en números.</h2>
        </div>
        <span className={`pill ${r.passes ? 'positive' : 'warning'}`}>
          <StatusIcon status={r.passes ? 'pass' : 'fail'} />
          {r.passes ? 'Cumple condiciones simuladas' : `${failed.length} condiciones por resolver`}
        </span>
      </div>
      <div className="metrics">
        <article className="metric">
          <span>
            <Coins size={18} /> Operación mensual eléctrica
          </span>
          <strong>{mxn(r.ev.operatingMonth)}</strong>
          <small>
            {savings >= 0 ? 'Diferencia favorable' : 'Diferencia desfavorable'} de{' '}
            {mxn(Math.abs(savings))} frente a combustión; excluye deuda y trabajo.
          </small>
        </article>
        <article className="metric">
          <span>
            <BatteryCharging size={18} /> Energía diaria por unidad
          </span>
          <strong>
            {num(r.dailyGridKwh, 1)} <em>kWh</em>
          </strong>
          <small>{num(r.dailyBatteryKwh, 1)} kWh en batería · pérdidas incluidas en compra.</small>
        </article>
        <article className="metric">
          <span>
            <Users size={18} /> Ingreso objetivo del operador
          </span>
          <strong>
            {mxn(s.economy.incomeGoal)} <em>/mes</em>
          </strong>
          <small>
            Por operador · {s.operation.operators * s.operation.fleet} personas presupuestadas;
            condicionado al flujo.
          </small>
        </article>
        <article className="metric">
          <span>
            <ArrowUpRight size={18} /> Menor margen mensual
          </span>
          <strong className={r.ev.minMonthlyCash < 0 ? 'negative' : ''}>
            {mxn(r.ev.minMonthlyCash)}
          </strong>
          <small>Después de pagos, trabajo, ingreso del concesionario y reserva.</small>
        </article>
      </div>
      <div className="chart-grid">
        <section className="panel">
          <div className="panel-title">
            <h3>Batería durante el servicio</h3>
            <BatteryCharging size={19} />
          </div>
          <Suspense fallback={<div className="chart" />}>
            <Chart
              option={socOption}
              label={`SOC inicial ${num(s.energy.socMax * 100)}%, final ${num(r.socEnd * 100)}%, mínimo ${num(s.energy.socMin * 100)}%.`}
            />
          </Suspense>
          <div className="chart-summary">
            <span>
              <b>{num(r.dailyKm, 1)} km</b> diarios por unidad
            </span>
            <span>
              <b>{num(r.socEnd * 100)}%</b> SOC final
            </span>
            <span>
              <b>{num(r.charge.hours, 2)} h</b> carga de flota
            </span>
          </div>
          <small>
            Perfil agregado de prueba; los km adicionales se distribuyen proporcionalmente. Curva de
            carga hipotética.
          </small>
        </section>
        <section className="panel">
          <div className="panel-title">
            <h3>Margen después de proteger ingresos</h3>
            <Coins size={19} />
          </div>
          <Suspense fallback={<div className="chart" />}>
            <Chart
              option={cashOption}
              label={`Margen mensual mínimo: combustión ${mxn(r.ice.minMonthlyCash)}, eléctrico ${mxn(r.ev.minMonthlyCash)}. Consulte la tabla mensual.`}
            />
          </Suspense>
          <div className="chart-summary">
            <span>
              <b>60 meses</b> de horizonte
            </span>
            <span>
              <b>{mxn(r.ev.debtRemaining)}</b> deuda restante
            </span>
          </div>
          <small>
            Recaudo constante de prueba. Reserva separada del gasto; no equivale a ingreso salarial
            comprobado.
          </small>
        </section>
      </div>
      <section className="panel comparison">
        <div className="panel-title">
          <h3>El costo completo importa</h3>
          <span className="pill neutral">Unidad + flota de {s.operation.fleet}</span>
        </div>
        <ComparisonTable r={r} />
        <p className="muted">
          Costo económico incluye adquisición, operación, trabajo e intereses; no suma principal dos
          veces. El ingreso del concesionario es una condición de caja. El capital disponible se
          utiliza para reducir deuda respetando reserva y enganche mínimo.{' '}
          {s.finance.kind === 'lease'
            ? 'En proveedor, la referencia de combustión se adquiere de contado.'
            : 'El financiamiento elegido se aplica a ambas referencias.'}
        </p>
        <details>
          <summary>Ver los 60 meses de flujo eléctrico</summary>
          <CashTable f={r.ev} />
        </details>
      </section>
      <div className="chart-grid">
        <section className="panel">
          <div className="panel-title">
            <h3>¿Qué necesita comprobarse?</h3>
            <Clock3 size={19} />
          </div>
          <ul className="conditions">
            {r.constraints.map((c) => (
              <li key={c.id} className={c.status}>
                <StatusIcon status={c.status} />
                <div>
                  <strong>{c.label}</strong>
                  <p>{c.detail}</p>
                </div>
                <span>
                  {c.status === 'pass' ? 'Cumple' : c.status === 'fail' ? 'Resolver' : 'Pendiente'}
                </span>
              </li>
            ))}
          </ul>
        </section>
        <section className="panel environmental">
          <span className="eyebrow">ALCANCE AMBIENTAL</span>
          <h3>Menos escape, con límites claros.</h3>
          <div className="emission-row">
            <span>Combustión · escape</span>
            <strong>
              {num(r.emissions.iceCO2KgDay, 1)} <small>kg CO₂/día</small>
            </strong>
          </div>
          <div className="emission-row">
            <span>Electricidad · indirectas</span>
            <strong>
              {num(r.emissions.evCO2eKgDay, 1)} <small>kg CO₂e/día</small>
            </strong>
          </div>
          <p>
            Por unidad. Los factores tienen alcances diferentes: no se calcula una reducción neta ni
            ciclo de vida.
          </p>
          <p>
            El BEV no tiene emisiones de escape. Las mejoras sanitarias, el tiempo de viaje y una
            eventual reducción de tarifa requieren evidencia adicional.
          </p>
          <div className="human-note">
            <Users size={23} />
            <p>
              El objetivo es sostener viajes y trabajo. Ahorrar energía sólo ayuda si el acuerdo
              financiero permite conservar el ingreso y la calidad del servicio.
            </p>
          </div>
          <details>
            <summary>Supuestos y límites del cálculo</summary>
            <ul>
              {r.warnings.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          </details>
        </section>
      </div>
    </div>
  );
}
