import { lazy, Suspense, useMemo, useState } from 'react';
import type { Result } from '../domain/schema';
import type { SensitivityPoint } from '../domain/explore';
import { num, mxn } from '../ui/format';
const Chart = lazy(() => import('../ui/Chart'));
export default function Sensitivity({
  result: r,
  points,
  error,
  disabled,
  onApply,
}: {
  result: Result;
  points: SensitivityPoint[] | null;
  error: string;
  disabled: boolean;
  onApply: (cycles: number) => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const cycle =
    selected && points?.some((p) => p.cycles === selected) ? selected : r.scenario.operation.cycles;
  const current = points?.find((p) => p.cycles === cycle);
  const options = useMemo(() => {
    if (!points) return null;
    const baseline = num(r.dailyKm, 1);
    const markLine = {
      symbol: 'none',
      lineStyle: { color: '#B28E5C', type: 'dashed' },
      label: { formatter: 'Actual' },
      data: [{ xAxis: baseline }],
    };
    const base = {
      grid: { left: 68, right: 25, top: 48, bottom: 45 },
      tooltip: { trigger: 'axis' },
      legend: { top: 0, textStyle: { fontSize: 11 } },
      xAxis: {
        type: 'category',
        data: points.map((p) => num(p.km, 1)),
        name: 'km/día',
        nameLocation: 'middle',
        nameGap: 28,
      },
    };
    return [
      {
        ...base,
        yAxis: { type: 'value', name: 'kWh/día' },
        series: [
          {
            name: 'Energía requerida',
            type: 'line',
            itemStyle: { color: '#9D2148' },
            data: points.map((p) => p.batteryKwh),
            markLine,
          },
          {
            name: 'Disponible con reserva',
            type: 'line',
            showSymbol: false,
            lineStyle: { type: 'dashed' },
            itemStyle: { color: '#027A35' },
            data: points.map((p) => p.usableKwh),
          },
        ],
      },
      {
        ...base,
        yAxis: {
          type: 'value',
          axisLabel: { formatter: (v: number) => `${num(v / 1000, 0)} mil` },
          name: 'MXN/mes',
        },
        series: [
          {
            name: r.scenario.ice.fuel === 'diesel' ? 'Diésel' : 'Gasolina',
            type: 'line',
            itemStyle: { color: '#55585A' },
            data: points.map((p) => p.iceMargin),
            markLine,
          },
          {
            name: 'Eléctrico',
            type: 'line',
            itemStyle: { color: '#9D2148' },
            data: points.map((p) => p.evMargin),
            markLine: {
              symbol: 'none',
              label: { formatter: 'Sin déficit' },
              data: [{ yAxis: 0 }],
              lineStyle: { color: '#027A35', type: 'dashed' },
            },
          },
        ],
      },
    ];
  }, [r, points]);
  const feasible = points?.filter((p) => p.failures.length === 0) ?? [];
  return (
    <section className="panel sensitivity-panel" id="sensibilidad" aria-busy={!points && !error}>
      <div className="panel-title">
        <div>
          <span className="eyebrow">PRUEBA LOS LÍMITES</span>
          <h2>¿Qué pasa si hacemos más vueltas?</h2>
        </div>
        <span className="pill neutral">Mismo recaudo · misma flota</span>
      </div>
      <p className="muted">
        Sólo variamos las vueltas diarias por unidad. Ascensos, tarifa, vehículos, financiamiento e
        ingresos objetivo se mantienen: más vueltas no significa automáticamente más pasajeros.
      </p>
      {error ? (
        <p role="alert">No se pudo calcular esta exploración: {error}</p>
      ) : !options ? (
        <p role="status">Calculando los puntos con el mismo motor…</p>
      ) : (
        <>
          <div className="chart-grid">
            <div>
              <h3>Energía frente al recorrido diario</h3>
              <Suspense fallback={<div className="chart" />}>
                <Chart
                  option={options[0]!}
                  label="Energía requerida frente a energía disponible al variar las vueltas. Valores completos en la tabla de sensibilidad."
                />
              </Suspense>
            </div>
            <div>
              <h3>Margen mensual frente al recorrido diario</h3>
              <Suspense fallback={<div className="chart" />}>
                <Chart
                  option={options[1]!}
                  label="Margen mensual mínimo de combustión y eléctrico al variar las vueltas. Valores completos en la tabla de sensibilidad."
                />
              </Suspense>
            </div>
          </div>
          <div className="sensitivity-insight">
            <strong>
              {feasible.length
                ? `Se cumplen los cálculos en ${feasible.length} puntos del rango explorado.`
                : 'Ningún punto cumple todas las condiciones calculadas.'}
            </strong>
            <p>
              El límite energético sin usar la reserva es{' '}
              {num(r.usableKwh / r.scenario.ev.consumption, 1)} km/día por unidad. Carga, jornada y
              financiamiento pueden restringirlo antes.
            </p>
          </div>
          <div className="sensitivity-action">
            <div className="field">
              <label htmlFor="sensitivity-cycle">Explorar vueltas diarias</label>
              <select
                id="sensitivity-cycle"
                value={cycle}
                onChange={(e) => setSelected(Number(e.target.value))}
              >
                {points!.map((p) => (
                  <option key={p.cycles} value={p.cycles}>
                    {p.cycles} vueltas · {num(p.km, 1)} km/día
                  </option>
                ))}
              </select>
            </div>
            <div>
              {current && (
                <>
                  <b>{mxn(current.evMargin)} de menor margen mensual</b>
                  <p>
                    {current.failures.length
                      ? current.failures
                          .map((id) => r.constraints.find((c) => c.id === id)?.label ?? id)
                          .join(' · ')
                      : 'Cumple cálculos; comprobaciones externas pendientes.'}
                  </p>
                </>
              )}
            </div>
            <button
              className="secondary"
              disabled={disabled || cycle === r.scenario.operation.cycles}
              onClick={() => onApply(cycle)}
            >
              Aplicar estas vueltas
            </button>
          </div>
          <details>
            <summary>Ver todos los puntos y sus restricciones</summary>
            <div
              className="table-scroll"
              tabIndex={0}
              role="region"
              aria-label="Tabla de sensibilidad desplazable"
            >
              <table>
                <caption>
                  Puntos del mismo evaluador. Cada margen es el mínimo de sus 60 meses; no un
                  pronóstico de demanda.
                </caption>
                <thead>
                  <tr>
                    <th>Vueltas</th>
                    <th>km/día</th>
                    <th>kWh requeridos</th>
                    <th>Margen combustión</th>
                    <th>Margen eléctrico</th>
                    <th>Condiciones incumplidas</th>
                  </tr>
                </thead>
                <tbody>
                  {points!.map((p) => (
                    <tr key={p.cycles}>
                      <th scope="row">{p.cycles}</th>
                      <td>{num(p.km, 1)}</td>
                      <td>{num(p.batteryKwh, 2)}</td>
                      <td>{mxn(p.iceMargin)}</td>
                      <td>{mxn(p.evMargin)}</td>
                      <td>
                        {p.failures
                          .map((id) => r.constraints.find((c) => c.id === id)?.label ?? id)
                          .join(', ') || 'Ninguna calculada'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </>
      )}
    </section>
  );
}
