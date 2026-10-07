import { lazy, Suspense, useMemo, useState } from 'react';
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
import { energyBudget, monthlyBudget, type SensitivityPoint } from '../domain/explore';
import Sensitivity from './Sensitivity';
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
export default function Dashboard({
  result: r,
  points,
  sensitivityError,
  stale,
  onCycles,
}: {
  result: Result;
  points: SensitivityPoint[] | null;
  sensitivityError: string;
  stale: boolean;
  onCycles: (cycles: number) => void;
}) {
  const s = r.scenario;
  const [month, setMonth] = useState(1);
  const failed = r.constraints.filter((c) => c.status === 'fail');
  const savings = r.ice.operatingMonth - r.ev.operatingMonth;
  const energy = energyBudget(r);
  const socOption = useMemo(
    () => ({
      color: ['#9D2148', '#266CB4', '#B28E5C'],
      grid: { left: 96, right: 35, top: 64, bottom: 32 },
      tooltip: { trigger: 'axis', valueFormatter: (v: unknown) => `${num(Number(v), 2)} kWh` },
      legend: { top: 0, data: ['Disponible', 'Servicio', 'Adicionales'] },
      xAxis: { type: 'value', name: 'kWh', nameLocation: 'end' },
      yAxis: { type: 'category', data: ['Requerida', 'Disponible'] },
      series: [
        {
          name: 'Disponible',
          type: 'bar',
          stack: 'budget',
          data: [0, energy.available],
          barMaxWidth: 45,
          markLine: {
            symbol: 'none',
            label: { formatter: 'Límite con reserva' },
            data: [{ xAxis: energy.available }],
            lineStyle: { color: '#9D2148', type: 'dashed' },
          },
        },
        {
          name: 'Servicio',
          type: 'bar',
          stack: 'budget',
          data: [energy.service, 0],
          barMaxWidth: 45,
        },
        {
          name: 'Adicionales',
          type: 'bar',
          stack: 'budget',
          data: [energy.additional, 0],
          barMaxWidth: 45,
        },
      ],
    }),
    [r],
  );
  const cashOption = useMemo(() => {
    const budgets = [
      monthlyBudget(r.ice.months[month - 1]!),
      monthlyBudget(r.ev.months[month - 1]!),
    ];
    const parts = [
      ['operating', 'Operación', '#55585A'],
      ['workers', 'Trabajo', '#266CB4'],
      ['owner', 'Concesionario', '#B28E5C'],
      ['payment', 'Financiamiento', '#9D2148'],
      ['reserve', 'Reserva y reposición', '#8F4889'],
      ['margin', 'Margen libre', '#027A35'],
    ] as const;
    return {
      grid: { left: 90, right: 45, top: 92, bottom: 35 },
      tooltip: { trigger: 'axis', valueFormatter: (v: unknown) => mxn(Number(v)) },
      legend: { top: 0, data: parts.map((p) => p[1]), textStyle: { fontSize: 11 } },
      xAxis: {
        type: 'value',
        axisLabel: { formatter: (v: number) => `${num(v / 1000, 0)} mil` },
        name: 'MXN',
      },
      yAxis: {
        type: 'category',
        data: [s.ice.fuel === 'diesel' ? 'Diésel' : 'Gasolina', 'Eléctrico'],
        inverse: true,
      },
      series: parts.map(([key, name, color], i) => ({
        name,
        type: 'bar',
        stack: 'cash',
        barMaxWidth: 48,
        itemStyle: { color },
        data: budgets.map((b) => ({
          value: b[key],
          itemStyle: { color: key === 'margin' && b.margin < 0 ? '#B51C42' : color },
        })),
        ...(i === 0
          ? {
              markLine: {
                symbol: 'none',
                label: { show: false },
                data: [{ xAxis: budgets[0]!.revenue }],
                lineStyle: { color: '#3d3c40', type: 'dashed' },
              },
            }
          : {}),
      })),
    };
  }, [r, month]);
  return (
    <div className="dashboard">
      <div className="dashboard-heading">
        <div>
          <span className="eyebrow">RESULTADOS DEL ESCENARIO</span>
          <h2>¿Qué cambia al electrificar?</h2>
        </div>
        <span className={`pill ${r.passes ? 'positive' : 'warning'}`}>
          <StatusIcon status={r.passes ? 'pass' : 'fail'} />
          {r.passes
            ? 'Cumple cálculos · verificaciones pendientes'
            : `${failed.length} ${failed.length === 1 ? 'condición' : 'condiciones'} por resolver`}
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
            <Users size={18} /> Brecha de capital inicial
          </span>
          <strong>{mxn(Math.max(0, r.ev.ownRequired - s.economy.ownCapital))}</strong>
          <small>
            Propio requerido: {mxn(r.ev.ownRequired)}. Disponible: {mxn(s.economy.ownCapital)}. No
            es el apoyo mínimo del optimizador.
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
            <h3>¿Alcanza la energía para el día?</h3>
            <BatteryCharging size={19} />
          </div>
          <Suspense fallback={<div className="chart" />}>
            <Chart
              option={socOption}
              label={`Disponible ${num(energy.available, 2)} kWh, requerida ${num(r.dailyBatteryKwh, 2)} kWh; margen ${num(energy.margin, 2)} kWh.`}
            />
          </Suspense>
          <div className="chart-summary">
            <span>
              <b>{num(r.dailyKm, 1)} km</b> diarios por unidad
            </span>
            <span>
              <b className={energy.margin < 0 ? 'negative' : ''}>{num(energy.margin, 2)} kWh</b>{' '}
              {energy.margin < 0 ? 'déficit energético' : 'margen sin usar reserva'}
            </span>
            <span>
              <b>
                {Number.isFinite(r.charge.hours) ? `${num(r.charge.hours, 2)} h` : 'Sin potencia'}
              </b>{' '}
              para recargar la flota
            </span>
          </div>
          <div className="charge-comparison">
            <span>Recarga nocturna de la flota</span>
            <b className={r.charge.hours > s.energy.chargeHours ? 'negative' : ''}>
              {Number.isFinite(r.charge.hours) ? `${num(r.charge.hours, 2)} h` : 'Sin potencia'} /{' '}
              {num(s.energy.chargeHours)} h disponibles
            </b>
          </div>
          <small>
            Por unidad. Reserva apartada: {num(energy.reserve, 2)} kWh. Compras{' '}
            {num(r.dailyGridKwh, 2)} kWh para recuperar {num(r.dailyBatteryKwh, 2)} kWh en batería;
            la diferencia son pérdidas.
          </small>
        </section>
        <section className="panel finance-chart-panel">
          <div className="panel-title">
            <h3>¿A dónde va el ingreso mensual?</h3>
            <Coins size={19} />
          </div>
          <div className="month-choice">
            <span className="revenue-label">
              Recaudo de flota: <b>{mxn(r.ev.months[month - 1]!.revenue)}</b>
            </span>
            <label htmlFor="budget-month">Mes del presupuesto</label>
            <select
              id="budget-month"
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
            >
              {Array.from({ length: 60 }, (_, i) => (
                <option key={i} value={i + 1}>
                  Mes {i + 1}
                </option>
              ))}
            </select>
          </div>
          <Suspense fallback={<div className="chart" />}>
            <Chart
              option={cashOption}
              label={`Presupuesto del mes ${month}. Recaudo de flota ${mxn(r.ev.months[month - 1]!.revenue)}. Margen de combustión ${mxn(r.ice.months[month - 1]!.freeCash)}, eléctrico ${mxn(r.ev.months[month - 1]!.freeCash)}. Consulte la tabla mensual para componentes.`}
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
          <p className="chart-explanation">
            {savings >= 0 ? 'El eléctrico reduce' : 'El eléctrico aumenta'} el gasto operativo en{' '}
            <b>{mxn(Math.abs(savings))}/mes</b>. En el mes {month}, después de pagos e ingresos
            objetivo quedan{' '}
            <b className={r.ev.months[month - 1]!.freeCash < 0 ? 'negative' : ''}>
              {mxn(r.ev.months[month - 1]!.freeCash)}
            </b>
            .
          </p>
          <small>
            La línea discontinua marca el recaudo de la flota. Reserva y reposición es la aportación
            del mes más reemplazos no cubiertos; no el saldo acumulado. Un margen negativo es
            déficit, no ingreso disponible.
          </small>
        </section>
      </div>
      <Sensitivity
        result={r}
        points={points}
        error={sensitivityError}
        disabled={stale}
        onApply={onCycles}
      />
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
