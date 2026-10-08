import { lazy, Suspense, useMemo } from 'react';
import {
  BatteryCharging,
  Coins,
  Users,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import type { Result, FinancialResult } from '../domain/schema';
import { mxn, num } from '../ui/format';
import { energyBudget, type SensitivitySeries, type SensitivityVariable } from '../domain/explore';
import Sensitivity from './Sensitivity';
import FinancePanel from './FinancePanel';
import type { RevenueStressPoint } from '../domain/financialAnalysis';
import Environment from './Environment';
const Chart = lazy(() => import('../ui/Chart'));

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
export default function Dashboard({
  result: r,
  points,
  sensitivityError,
  revenuePoints,
  revenueError,
  stale,
  onExplore,
}: {
  result: Result;
  points: SensitivitySeries[] | null;
  sensitivityError: string;
  revenuePoints: RevenueStressPoint[] | null;
  revenueError: string;
  stale: boolean;
  onExplore: (variable: SensitivityVariable, value: number) => void;
}) {
  const s = r.scenario;
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
  return (
    <div className="dashboard">
      <div className="dashboard-heading">
        <div>
          <span className="eyebrow">RESULTADOS DEL ESCENARIO</span>
          <h2>¿Qué cambia al electrificar?</h2>
        </div>
        <span className={`pill ${r.passes ? 'positive' : 'warning'}`}>
          {r.passes ? <CheckCircle2 size={17} /> : <AlertCircle size={17} />}
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
      <div className="results-columns">
        <div className="results-left">
          <section className="panel">
            <div className="panel-title">
              <h3>Energía para completar el servicio</h3>
              <BatteryCharging size={19} />
            </div>
            <p className="result-conclusion">
              {energy.margin >= -1e-9
                ? 'La energía disponible alcanza'
                : `Faltan ${num(-energy.margin, 2)} kWh para completar el día`}
            </p>
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
            <p className="result-conclusion">
              {r.charge.hours <= s.energy.chargeHours + 1e-9
                ? 'La recarga cabe en la ventana nocturna.'
                : 'La recarga no cabe en la ventana nocturna.'}{' '}
              Batería suficiente y recuperación nocturna son condiciones separadas.
            </p>
            <div className="charge-comparison">
              <span>Recarga nocturna de la flota</span>
              <b className={r.charge.hours > s.energy.chargeHours ? 'negative' : ''}>
                {Number.isFinite(r.charge.hours) ? `${num(r.charge.hours, 2)} h` : 'Sin potencia'} /{' '}
                {num(s.energy.chargeHours)} h disponibles
              </b>
            </div>
            <small>
              Por unidad. Reserva apartada: {num(energy.reserve, 2)} kWh. Compras{' '}
              {num(r.dailyGridKwh, 2)} kWh para recuperar {num(r.dailyBatteryKwh, 2)} kWh en
              batería; la diferencia son pérdidas.
            </small>
          </section>
          <section className="panel comparison">
            <div className="panel-title">
              <h3>Comparación económica</h3>
              <span className="pill neutral">Unidad + flota de {s.operation.fleet}</span>
            </div>
            <p className="result-conclusion">
              El eléctrico tiene{' '}
              {r.ev.economicCost === r.ice.economicCost
                ? 'el mismo costo económico'
                : `${r.ev.economicCost < r.ice.economicCost ? 'menor' : 'mayor'} costo económico por ${mxn(Math.abs(r.ev.economicCost - r.ice.economicCost))}`}{' '}
              durante cinco años.{' '}
              {s.finance.kind === 'lease'
                ? 'Perspectiva del operador: renta eléctrica frente a compra de combustión.'
                : 'Perspectiva de adquisición y operación de la flota.'}
            </p>
            <ComparisonTable r={r} concise />
            <details>
              <summary>Consultar el desglose económico</summary>
              <ComparisonTable r={r} />
            </details>
            <p className="muted">
              Costo económico incluye adquisición, operación, trabajo e intereses; no suma principal
              dos veces. El ingreso del concesionario es una condición de caja. El capital
              disponible se utiliza para reducir deuda respetando reserva y enganche mínimo.{' '}
              {s.finance.kind === 'lease'
                ? 'En proveedor, la referencia de combustión se adquiere de contado.'
                : 'El financiamiento elegido se aplica a ambas referencias.'}
            </p>
            <details>
              <summary>Consultar el flujo de caja</summary>
              <CashTable f={r.ev} />
            </details>
          </section>
        </div>
        <FinancePanel result={r} stale={stale} points={revenuePoints} error={revenueError} />
      </div>
      <Sensitivity
        result={r}
        points={points}
        error={sensitivityError}
        disabled={stale}
        onApply={onExplore}
      />
      <Environment result={r} />
    </div>
  );
}
