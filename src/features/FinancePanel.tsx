import { lazy, Suspense, useMemo, useState, useEffect } from 'react';
import { Coins } from 'lucide-react';
import type { Result } from '../domain/schema';
import { mxn, num } from '../ui/format';
import { groupBudgetPhases, monthlyBudget, type BudgetPhase } from '../domain/explore';
import {
  cashSummary,
  financialAnalysis,
  type RevenueStressPoint,
  type PaymentCapacity,
} from '../domain/financialAnalysis';
const Chart = lazy(() => import('../ui/Chart'));
const amount = (v: number) =>
  new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(v);
const signed = (v: number) => `${v > 0 ? '+' : ''}${amount(v)}`;
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

export default function FinancePanel({
  result: r,
  stale,
  points,
  error,
}: {
  result: Result;
  stale: boolean;
  points: RevenueStressPoint[] | null;
  error: string;
}) {
  const s = r.scenario;
  const summary = useMemo(() => cashSummary(r.ev.months), [r]);
  const [month, setMonth] = useState(summary.month);
  const [drop, setDrop] = useState(10);
  useEffect(() => {
    setMonth(summary.month);
    setDrop(10);
  }, [r, stale, summary.month]);
  const horizon = Math.min(r.ice.months.length, r.ev.months.length);
  const selectedIceMonth = r.ice.months[month - 1]!;
  const selectedEvMonth = r.ev.months[month - 1]!;
  const analysis = useMemo(() => financialAnalysis(r), [r]);
  const current = analysis[month - 1]!;
  const stress = points?.find((p) => p.dropPercent === drop);
  const budgetPhases = useMemo(() => groupBudgetPhases(r.ice.months, r.ev.months), [r]);
  const events = useMemo(() => financeEvents(r), [r]);
  const hasDebt = r.ice.principal > 0 || r.ev.principal > 0;
  const cashOption = useMemo(() => {
    const budgets = [
      monthlyBudget(r.ice.months[month - 1]!),
      monthlyBudget(r.ev.months[month - 1]!),
    ];
    const parts = [
      ['operating', 'Operación', '#55585A'],
      ['workers', 'Personal presupuestado', '#777175'],
      ['owner', 'Ingreso concesionario presupuestado', '#ABA1A6'],
      ['payment', 'Financiamiento', '#9D2148'],
      ['reserve', 'Reserva y reposición', '#B66A81'],
      ['margin', 'Resultado de caja', '#69404E'],
    ] as const;
    return {
      grid: { left: 90, right: 45, top: 64, bottom: 46 },
      tooltip: {
        trigger: 'axis',
        appendTo: 'body',
        confine: true,
        formatter: (params: unknown) => {
          const rows = params as { seriesName: string; value: number; axisValueLabel: string }[];
          return `<div class="finance-tooltip"><b>${rows[0]?.axisValueLabel ?? ''}</b>${rows.map((row) => `<div><span>${row.seriesName}</span><b>${amount(row.value)}</b></div>`).join('')}</div>`;
        },
        valueFormatter: (v: unknown) => amount(Number(v)),
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
        valueFormatter: (value: unknown) => amount(Number(value)),
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
                        ? '#B66A81'
                        : '#777175',
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
    <section
      className="panel finance-chart-panel"
      aria-labelledby="finance-title"
      aria-busy={stale}
    >
      <div className="panel-title finance-panel-title">
        <div>
          <h3 id="finance-title">¿El recaudo sostiene los pagos y el ingreso presupuestado?</h3>
          <p className="finance-panel-subtitle">Montos de la flota · escenario editable</p>
        </div>
        <Coins size={19} />
      </div>
      {stale && (
        <p className="notice" role="status">
          Resultado anterior: el escenario está en actualización o contiene entradas inválidas.
          Exploración deshabilitada.
        </p>
      )}
      <div className="finance-conclusion">
        <span className="eyebrow">PRESUPUESTO ELÉCTRICO · {horizon} MESES</span>
        <strong className={summary.minimum < 0 ? 'negative' : ''}>
          {amount(summary.minimum)} <span>mínimo de caja · mes {summary.month}</span>
        </strong>
        <p>
          {summary.deficitMonths} de {horizon} meses con déficit.{' '}
          {summary.minimum < 0
            ? 'El recaudo supuesto no sostiene todas las partidas presupuestadas.'
            : 'El recaudo supuesto cubre las partidas presupuestadas en el horizonte.'}
        </p>
        <p>
          Personal e ingreso del concesionario son montos presupuestados.{' '}
          {s.economy.laborCost < s.economy.incomeGoal
            ? 'El presupuesto laboral es inferior al ingreso objetivo declarado; una caja suficiente no corrige esa condición. '
            : ''}
          Esta suficiencia simulada no acredita protección salarial ni viabilidad integral.
        </p>
      </div>
      <h4 className="finance-section-heading">Distribución mensual del recaudo</h4>
      <div className="budget-timeline">
        <div className="budget-timeline-heading">
          <div>
            <span className="eyebrow">ETAPAS DEL HORIZONTE · {horizon} MESES</span>
            <p>
              Se abre en el primer mes con menor caja eléctrica. Puedes consultar otra etapa o mes.
            </p>
          </div>
          <span className="revenue-label">
            Recaudo mensual del escenario <b>{amount(selectedEvMonth.revenue)}</b>
          </span>
        </div>
        {budgetPhases.length === 1 ? (
          <p className="budget-single-phase">
            Meses 1–{horizon} · {describeBudgetPhase(budgetPhases[0]!, r)} · una etapa de
            presupuesto
          </p>
        ) : (
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
                  disabled={stale}
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
        )}
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
              disabled={stale}
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
      <div
        className="finance-distribution-values"
        aria-label={`Distribución del mes ${month} en pesos`}
      >
        <div className="finance-value-row">
          <span>Partida · MXN</span>
          <b>Combustión</b>
          <b>Eléctrico</b>
        </div>
        {(
          [
            ['operating', 'Operación'],
            ['workers', 'Personal presupuestado'],
            ['owner', 'Ingreso concesionario presupuestado'],
            ['payment', 'Pago del activo'],
            ['reserve', 'Reserva y reposición'],
            ['margin', 'Resultado de caja'],
          ] as const
        ).map(([key, label]) => (
          <div className="finance-value-row" key={key}>
            <span>{label}</span>
            <b>{amount(monthlyBudget(selectedIceMonth)[key])}</b>
            <b>{amount(monthlyBudget(selectedEvMonth)[key])}</b>
          </div>
        ))}
      </div>
      <p className="chart-explanation">
        La línea discontinua marca el recaudo supuesto. Reserva y reposición reúne provisión mensual
        y reposición no cubierta, sin equivaler al saldo acumulado. El excedente de caja no tiene
        reparto asignado; una caja negativa es déficit.
      </p>
      <section className="finance-section" aria-labelledby="capacity-title">
        <h4 id="capacity-title">Capacidad de pago del activo · mes {month}</h4>
        <p>
          Recursos antes de pagar el activo, después de operación, personal, ingreso del
          concesionario y obligaciones de reserva/reposición.
        </p>
        <div className="capacity-legend">
          <span>Barra: recursos disponibles</span>
          <span>│ Marcador: pago previsto</span>
        </div>
        <CapacityBars ice={current.ice} ev={current.ev} />
      </section>
      <section className="finance-section" aria-labelledby="bridge-title">
        <h4 id="bridge-title">¿Qué absorbe el ahorro operativo?</h4>
        <p>
          Puente de caja del mes {month}. Una contribución positiva libera caja; una negativa la
          reduce.
        </p>
        <CashBridgeView bridge={current.bridge} />
      </section>
      <section
        className="finance-section revenue-stress"
        aria-labelledby="revenue-stress-title"
        aria-busy={!points && !error && !stale}
      >
        <h4 id="revenue-stress-title">Prueba temporal de menor recaudo</h4>
        <p>
          Rango elegido por la herramienta: 0–30%, pasos de un punto. Reduce sólo los ascensos
          supuestos; tarifa, servicio, flota, costos, financiamiento e ingresos objetivo permanecen
          constantes.
        </p>
        <label htmlFor="revenue-drop">
          Caída del recaudo supuesto <b>{drop}%</b>
        </label>
        <input
          id="revenue-drop"
          type="range"
          min="0"
          max="30"
          step="1"
          value={drop}
          disabled={stale || !points}
          aria-valuetext={`${drop}% menos recaudo supuesto`}
          onChange={(e) => setDrop(Number(e.target.value))}
        />
        {error ? (
          <p role="alert">{error}</p>
        ) : !stress ? (
          <p role="status">
            {stale
              ? 'Prueba deshabilitada hasta actualizar el escenario.'
              : 'Calculando las 31 pruebas con el evaluador…'}
          </p>
        ) : (
          <div className="stress-results" aria-live="polite">
            {(['ice', 'ev'] as const).map((key) => (
              <article key={key}>
                <h5>
                  {key === 'ice' ? 'Combustión' : 'Eléctrico'} · caída {drop}%
                </h5>
                <p>
                  Caja mes {month}{' '}
                  <strong className={stress[key].months[month - 1]!.freeCash < 0 ? 'negative' : ''}>
                    {amount(stress[key].months[month - 1]!.freeCash)}
                  </strong>
                </p>
                <p>
                  Mínimo del horizonte{' '}
                  <b>
                    {amount(stress[key].summary.minimum)} · mes {stress[key].summary.month}
                  </b>
                </p>
                <p>
                  Meses con déficit{' '}
                  <b>
                    {stress[key].summary.deficitMonths} / {horizon}
                  </b>
                </p>
              </article>
            ))}
          </div>
        )}
        <small>
          Prueba separada del presupuesto original. No se aplica al escenario ni modifica guardado,
          JSON, CSV o informe. No estima probabilidades ni un umbral global de viabilidad.
        </small>
      </section>
      <details className="finance-detail">
        <summary>Consultar deuda, intereses, comisiones y reservas</summary>
        <section className="debt-evolution" aria-labelledby="debt-evolution-title">
          <div className="debt-evolution-heading">
            <div>
              <h4 id="debt-evolution-title">
                {hasDebt ? 'Evolución de la deuda' : 'Sin saldo de deuda financiada'}
              </h4>
              <p>
                {hasDebt
                  ? 'Amortización suponiendo todos los pagos previstos, incluso con déficit de caja. Su descenso no demuestra capacidad de pago. El mes 0 muestra el principal inicial.'
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
                  label={`Curva de deuda durante ${horizon} meses. Mes ${month}: saldo de combustión ${amount(selectedIceMonth.balance)} y saldo eléctrico ${amount(selectedEvMonth.balance)}.`}
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
              <b>{amount(selectedIceMonth.balance)}</b>
            </div>
            <div className="debt-balance">
              <i className="debt-dot electric" />
              <span>Eléctrico</span>
              <b>{amount(selectedEvMonth.balance)}</b>
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
        <div className="finance-detail-values">
          <p>
            <b>Principal inicial:</b> combustión {amount(r.ice.principal)}; eléctrico{' '}
            {amount(r.ev.principal)}.
          </p>
          <p>
            <b>Principal amortizado en el mes {month}:</b> combustión{' '}
            {amount(selectedIceMonth.principal)}; eléctrico {amount(selectedEvMonth.principal)}.
          </p>
          <p>
            <b>Intereses acumulados · 60 meses:</b> combustión {amount(r.ice.interestTotal)};
            eléctrico {amount(r.ev.interestTotal)}.
          </p>
          <p>
            <b>Intereses del mes {month}:</b> combustión {amount(selectedIceMonth.interest)};
            eléctrico {amount(selectedEvMonth.interest)}.
          </p>
          <p>
            <b>Comisiones iniciales:</b> combustión {amount(r.ice.financingFee)}; eléctrico{' '}
            {amount(r.ev.financingFee)}.
          </p>
          {(r.ice.debtRemaining > 0 || r.ev.debtRemaining > 0) && (
            <p className="notice">
              <b>Deuda pendiente al mes 60:</b> combustión {amount(r.ice.debtRemaining)}; eléctrico{' '}
              {amount(r.ev.debtRemaining)}. El compromiso continúa después del horizonte.
            </p>
          )}
          <p>
            <b>Provisión mensual de reserva:</b> {amount(current.reserve.provision)} por tecnología.{' '}
            <b>Saldo después del mes {month}:</b> combustión {amount(selectedIceMonth.reserve)};
            eléctrico {amount(current.reserve.balance)}.
          </p>
          {analysis
            .filter((a) => a.reserve.replacement > 0)
            .map((a) => (
              <p key={a.month}>
                <b>Reposición eléctrica programada · mes {a.month}:</b>{' '}
                {amount(a.reserve.replacement)}. Cubierta con reserva: {amount(a.reserve.covered)}.
                Faltante descontado de caja: {amount(a.reserve.shortfall)}.
              </p>
            ))}
          <p>
            Las reservas no financian déficits recurrentes.{' '}
            {events.some((e) => e.kind === 'replacement')
              ? 'La cobertura indicada corresponde sólo a la reposición programada.'
              : 'No hay reposición programada en el horizonte.'}{' '}
            No se modela cobertura de averías.
          </p>
        </div>
      </details>
    </section>
  );
}

function CapacityBars({ ice, ev }: { ice: PaymentCapacity; ev: PaymentCapacity }) {
  const low = Math.min(0, ice.available, ev.available);
  const high = Math.max(1, ice.available, ev.available, ice.payment, ev.payment);
  const position = (value: number) => ((value - low) / (high - low)) * 100;
  return (
    <div className="capacity-bars">
      {(
        [
          ['Combustión', ice],
          ['Eléctrico', ev],
        ] as const
      ).map(([name, c]) => (
        <article className="capacity-row" key={name}>
          <div className="capacity-heading">
            <h5>{name}</h5>
            <span>
              Disponibles <b>{amount(c.available)}</b> · Pago previsto <b>{amount(c.payment)}</b>
            </span>
          </div>
          <div
            className="capacity-track"
            title={`${name}: disponibles ${amount(c.available)}; pago previsto ${amount(c.payment)}; caja ${amount(c.cash)}`}
            role="img"
            aria-label={`${name}: recursos disponibles ${amount(c.available)}, pago previsto ${amount(c.payment)}, ${c.cash < 0 ? 'brecha' : 'holgura'} ${amount(Math.abs(c.cash))}.`}
          >
            <i className="finance-zero" style={{ left: `${position(0)}%` }} />
            <div
              className={`capacity-bar ${name === 'Eléctrico' ? 'electric' : ''} ${c.available < 0 ? 'deficit' : ''}`}
              style={{
                left: `${position(Math.min(0, c.available))}%`,
                width: `${Math.abs(position(c.available) - position(0))}%`,
              }}
            />
            <i className="capacity-marker" style={{ left: `${position(c.payment)}%` }} />
          </div>
          <p className={c.cash < 0 ? 'negative' : ''}>
            {c.cash < 0 ? 'Brecha' : 'Holgura'} <b>{amount(Math.abs(c.cash))}</b>
            {c.revenueCushionPercent !== null && (
              <>
                {' '}
                · equivalente al <b>{num(c.revenueCushionPercent, 2)}%</b> del recaudo
              </>
            )}
          </p>
          {c.available < 0 && (
            <p className="negative">
              Déficit previo al pago del activo: una cuota cero tampoco resolvería este presupuesto.
            </p>
          )}
        </article>
      ))}
      <p className="chart-explanation">
        Holgura = disponibles − pago previsto = resultado de caja. El porcentaje positivo sólo
        expresa su equivalencia en recaudo; no es una probabilidad ni un margen bancario
        recomendado.
      </p>
    </div>
  );
}

function CashBridgeView({
  bridge,
}: {
  bridge: ReturnType<typeof financialAnalysis>[number]['bridge'];
}) {
  const values = [
    0,
    bridge.start,
    bridge.end,
    ...bridge.contributions.flatMap((c) => [c.before, c.after]),
  ];
  const low = Math.min(...values),
    high = Math.max(1, ...values);
  const position = (value: number) => ((value - low) / (high - low)) * 100;
  const rows = [
    {
      label: 'Caja de combustión',
      amount: bridge.start,
      before: 0,
      after: bridge.start,
      total: true,
    },
    ...bridge.contributions.map((c) => ({ ...c, total: false })),
    { label: 'Caja eléctrica', amount: bridge.end, before: 0, after: bridge.end, total: true },
  ];
  return (
    <div className="cash-bridge" aria-label="Puente reconciliado de caja">
      {rows.map((row) => (
        <div className={`bridge-row ${row.total ? 'total' : ''}`} key={row.label}>
          <div>
            <span>{row.label}</span>
            <b>{row.total ? amount(row.amount) : signed(row.amount)}</b>
          </div>
          <div className="bridge-track" aria-hidden="true">
            <i className="finance-zero" style={{ left: `${position(0)}%` }} />
            <span
              className={`bridge-bar ${row.amount < 0 ? 'decrease' : ''}`}
              style={{
                left: `${position(Math.min(row.before, row.after))}%`,
                width: `${Math.abs(position(row.after) - position(row.before))}%`,
              }}
            />
            <i className="bridge-end" style={{ left: `${position(row.after)}%` }} />
          </div>
          {!row.total && <small>Caja acumulada: {amount(row.after)}</small>}
        </div>
      ))}
    </div>
  );
}
