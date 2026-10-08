import { lazy, Suspense, useMemo, useState } from 'react';
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
import {
  energyBudget,
  groupBudgetPhases,
  monthlyBudget,
  type BudgetPhase,
  type SensitivitySeries,
  type SensitivityVariable,
} from '../domain/explore';
import Sensitivity from './Sensitivity';
import Environment from './Environment';
const Chart = lazy(() => import('../ui/Chart'));

function describeBudgetPhase(phase: BudgetPhase, r: Result) {
  const replacement = r.ev.months.find(
    (m) => m.month >= phase.startMonth && m.month <= phase.endMonth && m.replacement > 0,
  );
  if (replacement) return 'Reposición programada';

  const currentIce = r.ice.months[phase.startMonth - 1]!;
  const currentEv = r.ev.months[phase.startMonth - 1]!;
  const previousIce = r.ice.months[phase.startMonth - 2];
  const previousEv = r.ev.months[phase.startMonth - 2];
  if (
    (previousIce?.payment && currentIce.payment === 0) ||
    (previousEv?.payment && currentEv.payment === 0)
  )
    return 'Después de la última cuota';
  if (currentIce.payment > 0 || currentEv.payment > 0)
    return r.scenario.finance.kind === 'lease' ? 'Renta mensual activa' : 'Cuota mensual activa';
  return 'Sin pagos mensuales';
}

function debtAxisLabel(value: number) {
  if (Math.abs(value) >= 1_000_000) return `$${num(value / 1_000_000, 1)} M`;
  if (Math.abs(value) >= 1_000) return `$${num(value / 1_000, 0)} mil`;
  return mxn(value);
}

function financeEvents(r: Result) {
  const events: { month: number; label: string; kind: 'payoff' | 'replacement' }[] = [];
  const horizon = Math.min(r.ice.months.length, r.ev.months.length);
  if (r.scenario.finance.kind === 'credit') {
    for (const [name, finance] of [
      ['de combustión', r.ice],
      ['del vehículo eléctrico', r.ev],
    ] as const) {
      if (finance.principal <= 0) continue;
      const lastPaid = [...finance.months].reverse().find((m) => m.payment > 0);
      if (lastPaid?.balance === 0)
        events.push({
          month: lastPaid.month,
          label: `Crédito ${name} liquidado${lastPaid.month === horizon ? ' al cierre del horizonte' : ''}`,
          kind: 'payoff',
        });
    }
  }
  const replacement = r.ev.months.find((m) => m.replacement > 0);
  if (replacement && replacement.month <= horizon)
    events.push({
      month: replacement.month,
      label: 'Reposición de batería',
      kind: 'replacement',
    });
  return events;
}

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
  const visibleRows = concise ? [rows[0]!, rows[1]!, rows[5]!, rows[10]!] : rows;
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
  stale,
  onExplore,
}: {
  result: Result;
  points: SensitivitySeries[] | null;
  sensitivityError: string;
  stale: boolean;
  onExplore: (variable: SensitivityVariable, value: number) => void;
}) {
  const s = r.scenario;
  const [month, setMonth] = useState(1);
  const horizon = Math.min(r.ice.months.length, r.ev.months.length);
  const selectedIceMonth = r.ice.months[month - 1]!;
  const selectedEvMonth = r.ev.months[month - 1]!;
  const budgetPhases = useMemo(() => groupBudgetPhases(r.ice.months, r.ev.months), [r]);
  const events = useMemo(() => financeEvents(r), [r]);
  const hasDebt = r.ice.principal > 0 || r.ev.principal > 0;
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
      ['workers', 'Personal', '#266CB4'],
      ['owner', 'Ingreso concesionario', '#B28E5C'],
      ['payment', 'Financiamiento', '#9D2148'],
      ['reserve', 'Reserva y reposición', '#8F4889'],
      ['margin', 'Resultado de caja', '#027A35'],
    ] as const;
    return {
      grid: { left: 90, right: 45, top: 64, bottom: 46 },
      tooltip: {
        trigger: 'axis',
        appendTo: 'body',
        confine: true,
        valueFormatter: (v: unknown) => mxn(Number(v)),
      },
      legend: { top: 0, data: parts.map((p) => p[1]), textStyle: { fontSize: 11 } },
      xAxis: {
        type: 'value',
        axisLabel: { formatter: (v: number) => num(v / 1000, 0) },
        name: 'Miles de MXN',
        nameLocation: 'middle',
        nameGap: 30,
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
  const debtOption = useMemo(() => {
    const labels = ['Inicio', ...Array.from({ length: horizon }, (_, index) => `Mes ${index + 1}`)];
    const eventMonths = [...new Set(events.map((event) => event.month))];
    return {
      color: ['#55585A', '#9D2148'],
      grid: { left: 60, right: 16, top: 28, bottom: 25 },
      tooltip: {
        trigger: 'axis',
        appendTo: 'body',
        confine: true,
        valueFormatter: (value: unknown) => mxn(Number(value)),
      },
      legend: { top: 0, data: ['Combustión', 'Eléctrico'], textStyle: { fontSize: 10 } },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: labels,
        axisLabel: {
          interval: 11,
          formatter: (value: string) => (value === 'Inicio' ? value : `M${value.slice(4)}`),
          fontSize: 9,
        },
      },
      yAxis: {
        type: 'value',
        min: 0,
        axisLabel: { formatter: (value: number) => debtAxisLabel(value), fontSize: 9 },
        splitNumber: 3,
      },
      series: [
        {
          name: 'Combustión',
          type: 'line',
          showSymbol: false,
          lineStyle: { width: 2 },
          data: [r.ice.principal, ...r.ice.months.slice(0, horizon).map((m) => m.balance)],
          ...(eventMonths.length
            ? {
                markLine: {
                  silent: true,
                  symbol: 'none',
                  label: { show: false },
                  lineStyle: { type: 'dashed', opacity: 0.75 },
                  data: eventMonths.map((eventMonth) => ({
                    xAxis: `Mes ${eventMonth}`,
                    lineStyle: {
                      color: events.some(
                        (event) => event.month === eventMonth && event.kind === 'replacement',
                      )
                        ? '#8F4889'
                        : '#B28E5C',
                    },
                  })),
                },
              }
            : {}),
        },
        {
          name: 'Eléctrico',
          type: 'line',
          showSymbol: false,
          lineStyle: { width: 2 },
          data: [r.ev.principal, ...r.ev.months.slice(0, horizon).map((m) => m.balance)],
        },
      ],
    };
  }, [r, horizon, events]);
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
        <section className="panel finance-chart-panel">
          <div className="panel-title finance-panel-title">
            <div>
              <h3>Distribución mensual del recaudo</h3>
              <p className="finance-panel-subtitle">Montos de la flota · escenario editable</p>
            </div>
            <Coins size={19} />
          </div>
          <div className="budget-timeline">
            <div className="budget-timeline-heading">
              <div>
                <span className="eyebrow">ETAPAS DEL HORIZONTE · {horizon} MESES</span>
                <p>Selecciona una etapa. Los meses con presupuestos equivalentes se agrupan.</p>
              </div>
              <span className="revenue-label">
                Recaudo mensual del escenario <b>{mxn(selectedEvMonth.revenue)}</b>
              </span>
            </div>
            <div className="budget-phases" role="group" aria-label="Etapas del presupuesto mensual">
              {budgetPhases.map((phase, index) => {
                const active = month >= phase.startMonth && month <= phase.endMonth;
                const range =
                  phase.startMonth === phase.endMonth
                    ? `Mes ${phase.startMonth}`
                    : `Meses ${phase.startMonth}–${phase.endMonth}`;
                const description = describeBudgetPhase(phase, r);
                const iceMargin = r.ice.months[phase.startMonth - 1]!.freeCash;
                const margin = r.ev.months[phase.startMonth - 1]!.freeCash;
                return (
                  <button
                    key={`${phase.startMonth}-${phase.endMonth}`}
                    className={`budget-phase${active ? ' selected' : ''}`}
                    type="button"
                    aria-pressed={active}
                    aria-label={`${range}: ${description}. Resultado de caja, combustión ${mxn(iceMargin)} por mes, eléctrico ${mxn(margin)} por mes.`}
                    onClick={() => setMonth(phase.startMonth)}
                  >
                    <span className="budget-phase-index">
                      Etapa {index + 1}
                      {active ? ' · Seleccionada' : ''}
                    </span>
                    <strong>{range}</strong>
                    <span>{description}</span>
                    <small className="budget-phase-results">
                      <span>
                        Combustión{' '}
                        <b className={iceMargin < 0 ? 'negative' : ''}>{mxn(iceMargin)}/mes</b>
                      </span>
                      <span>
                        Eléctrico <b className={margin < 0 ? 'negative' : ''}>{mxn(margin)}/mes</b>
                      </span>
                    </small>
                  </button>
                );
              })}
            </div>
            <details className="exact-month">
              <summary>
                <span>Consultar un mes específico</span>
                <b>
                  Mes {month} de {horizon}
                </b>
              </summary>
              <div className="exact-month-control">
                <label htmlFor="budget-month">Mes del presupuesto</label>
                <input
                  id="budget-month"
                  type="range"
                  min="1"
                  max={horizon}
                  step="1"
                  value={month}
                  onChange={(event) => setMonth(Number(event.target.value))}
                  aria-valuetext={`Mes ${month} de ${horizon}`}
                />
                <output htmlFor="budget-month">Mes {month}</output>
              </div>
            </details>
          </div>
          <Suspense fallback={<div className="chart" />}>
            <Chart
              option={cashOption}
              label={`Presupuesto del mes ${month}. Recaudo de flota ${mxn(selectedEvMonth.revenue)}. Margen de combustión ${mxn(selectedIceMonth.freeCash)}, eléctrico ${mxn(selectedEvMonth.freeCash)}. Consulte la tabla mensual para componentes.`}
            />
          </Suspense>
          <section className="debt-evolution" aria-labelledby="debt-evolution-title">
            <div className="debt-evolution-heading">
              <div>
                <h4 id="debt-evolution-title">
                  {hasDebt ? 'Evolución de la deuda' : 'Sin saldo de deuda financiada'}
                </h4>
                <p>
                  {hasDebt
                    ? 'Saldo pendiente después de cada pago. El mes 0 muestra el principal inicial.'
                    : 'Saldo financiado en el escenario · MXN'}
                </p>
              </div>
              <span>
                Mes seleccionado · {month} de {horizon}
              </span>
            </div>
            {hasDebt ? (
              <Suspense fallback={<div className="debt-chart-placeholder" />}>
                <div className="debt-curve">
                  <Chart
                    option={debtOption}
                    label={`Curva de deuda durante ${horizon} meses. Mes ${month}: saldo de combustión ${mxn(selectedIceMonth.balance)} y saldo eléctrico ${mxn(selectedEvMonth.balance)}.`}
                  />
                </div>
              </Suspense>
            ) : (
              <p className="debt-empty">
                No se genera saldo financiado en este escenario. Los pagos de renta, si existen,
                aparecen en el presupuesto mensual.
              </p>
            )}
            <div
              className="debt-balances"
              role="status"
              aria-label={`Saldos de deuda al mes ${month}`}
            >
              <div className="debt-balance">
                <i className="debt-dot combustion" />
                <span>Combustión</span>
                <b>{mxn(selectedIceMonth.balance)}</b>
              </div>
              <div className="debt-balance">
                <i className="debt-dot electric" />
                <span>Eléctrico</span>
                <b>{mxn(selectedEvMonth.balance)}</b>
              </div>
            </div>
            {events.length > 0 && (
              <div className="finance-events-section">
                <h5>Hitos del escenario</h5>
                <ul className="finance-events" aria-label="Hitos financieros del escenario">
                  {events.map((event) => (
                    <li
                      className={`finance-event ${event.kind}`}
                      key={`${event.kind}-${event.month}-${event.label}`}
                    >
                      <span>{event.label}</span>
                      <b>Mes {event.month}</b>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
          <div className="chart-explanation">
            <p>
              En este escenario, operar la flota eléctrica cuesta{' '}
              <b>
                {mxn(Math.abs(savings))}/mes {savings >= 0 ? 'menos' : 'más'}
              </b>{' '}
              que la flota de combustión. No incluye financiamiento ni costos de personal.
            </p>
            <p>
              En el mes {month}, al descontar operación, personal, ingreso objetivo del
              concesionario, pagos y reserva del recaudo supuesto, el resultado de caja eléctrico es{' '}
              <b className={selectedEvMonth.freeCash < 0 ? 'negative' : ''}>
                {mxn(selectedEvMonth.freeCash)}
              </b>
              .
            </p>
          </div>
          <small>
            La línea discontinua marca el recaudo supuesto del escenario. «Reserva y reposición»
            reúne la provisión mensual y la reposición no cubierta; no equivale al saldo acumulado
            de la reserva. Un resultado de caja negativo es déficit, no ingreso disponible.
          </small>
        </section>
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
