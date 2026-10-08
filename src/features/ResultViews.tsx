import { lazy, Suspense, useMemo } from 'react';
import { BatteryCharging, Coins, Users, ArrowUpRight } from 'lucide-react';
import type { Result } from '../domain/schema';
import { energyBudget } from '../domain/explore';
import { mxn, num } from '../ui/format';
import { ComparisonTable, CashTable } from './ResultTables';
const Chart = lazy(() => import('../ui/Chart'));

export function EnergyPanel({ result: r }: { result: Result }) {
  const s = r.scenario;
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
          <b>{Number.isFinite(r.charge.hours) ? `${num(r.charge.hours, 2)} h` : 'Sin potencia'}</b>{' '}
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
        Por unidad. Reserva apartada: {num(energy.reserve, 2)} kWh. Compras {num(r.dailyGridKwh, 2)}{' '}
        kWh para recuperar {num(r.dailyBatteryKwh, 2)} kWh en batería; la diferencia son pérdidas.
      </small>
    </section>
  );
}

export function CostPanel({ result: r }: { result: Result }) {
  const s = r.scenario;
  return (
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
        Costo económico incluye adquisición, operación, trabajo e intereses; no suma principal dos
        veces. El ingreso del concesionario es una condición de caja. El capital disponible se
        utiliza para reducir deuda respetando reserva y enganche mínimo.{' '}
        {s.finance.kind === 'lease'
          ? 'En proveedor, la referencia de combustión se adquiere de contado.'
          : 'El financiamiento elegido se aplica a ambas referencias.'}
      </p>
      <details>
        <summary>Consultar el flujo de caja</summary>
        <CashTable f={r.ev} />
      </details>
    </section>
  );
}

export function ResultMetrics({ result: r }: { result: Result }) {
  const s = r.scenario;
  const savings = r.ice.operatingMonth - r.ev.operatingMonth;
  return (
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
          Propio requerido: {mxn(r.ev.ownRequired)}. Disponible: {mxn(s.economy.ownCapital)}. No es
          el apoyo mínimo del optimizador.
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
  );
}
