import { lazy, Suspense, useMemo, useState } from 'react';
import type { Result } from '../domain/schema';
import {
  type SensitivitySeries,
  type SensitivityVariable,
  sensitivityVariables,
} from '../domain/explore';
import { num, mxn } from '../ui/format';
const Chart = lazy(() => import('../ui/Chart'));
export default function Sensitivity({
  result: r,
  points: series,
  error,
  disabled,
  onApply,
}: {
  result: Result;
  points: SensitivitySeries[] | null;
  error: string;
  disabled: boolean;
  onApply: (variable: SensitivityVariable, value: number) => void;
}) {
  const [variable, setVariable] = useState<SensitivityVariable>('cycles');
  const [selection, setSelection] = useState<{
    result: Result;
    variable: SensitivityVariable;
    index: number;
  } | null>(null);
  const data = series?.find((s) => s.variable === variable);
  const points = data?.points;
  const config = sensitivityVariables[variable];
  const index =
    selection?.result === r && selection.variable === variable && !disabled
      ? selection.index
      : (points?.findIndex((p) => p.value === data?.current) ?? 0);
  const current = points?.[index];
  const failures = current?.constraints.filter((c) => c.status === 'fail') ?? [];
  const fixedFailures =
    points?.[0]?.constraints.filter(
      (c) => c.status === 'fail' && points.every((p) => p.failures.includes(c.id)),
    ) ?? [];
  const feasible = points?.filter((p) => !p.failures.length) ?? [];
  const options = useMemo(() => {
    if (!points) return null;
    const base = {
      tooltip: { trigger: 'axis', appendTo: 'body', confine: true },
      legend: { top: 0, textStyle: { fontSize: 12 } },
      grid: { left: 65, right: 30, top: 65, bottom: 60 },
      xAxis: {
        type: 'category',
        data: points.map((p) => num(p.value, variable === 'cycles' ? 0 : 4)),
        name: config.unit,
        nameLocation: 'middle',
        nameGap: 35,
      },
    };
    return [
      {
        ...base,
        yAxis: { type: 'value', name: 'kWh/unidad/día' },
        series: [
          {
            name: 'Energía requerida',
            type: 'line',
            data: points.map((p) => p.batteryKwh),
            itemStyle: { color: '#9D2148' },
          },
          {
            name: 'Disponible',
            type: 'line',
            data: points.map((p) => p.usableKwh),
            itemStyle: { color: '#55585A' },
            lineStyle: { type: 'dashed' },
          },
        ],
      },
      {
        ...base,
        yAxis: { type: 'value', name: 'Horas de flota' },
        series: [
          {
            name: 'Recarga',
            type: 'line',
            data: points.map((p) => (Number.isFinite(p.chargeHours) ? p.chargeHours : null)),
            itemStyle: { color: '#9D2148' },
          },
          {
            name: 'Ventana',
            type: 'line',
            data: points.map((p) => p.chargeWindow),
            itemStyle: { color: '#55585A' },
          },
        ],
      },
      {
        ...base,
        yAxis: {
          type: 'value',
          name: 'MXN/mes',
          axisLabel: { formatter: (v: number) => `${num(v / 1000)} mil` },
        },
        series: [
          {
            name: 'Combustión',
            type: 'line',
            data: points.map((p) => p.iceMargin),
            itemStyle: { color: '#55585A' },
          },
          {
            name: 'Eléctrico',
            type: 'line',
            data: points.map((p) => p.evMargin),
            itemStyle: { color: '#9D2148' },
            markLine: { symbol: 'none', label: { formatter: 'Cero' }, data: [{ yAxis: 0 }] },
          },
        ],
      },
    ];
  }, [points, config, variable]);
  const cashOption = useMemo(
    () =>
      current
        ? {
            grid: { left: 105, right: 45, top: 30, bottom: 55 },
            tooltip: {
              trigger: 'axis',
              appendTo: 'body',
              confine: true,
              valueFormatter: (v: number) => mxn(v),
            },
            xAxis: {
              type: 'value',
              name: 'MXN/mes · flota',
              nameLocation: 'middle',
              nameGap: 35,
              min: (v: { min: number }) => Math.min(v.min, 0),
              max: (v: { max: number }) => Math.max(v.max, 0),
              axisLabel: { formatter: (v: number) => `${num(v / 1000)} mil` },
            },
            yAxis: { type: 'category', data: ['Combustión', 'Eléctrico'] },
            series: [
              {
                type: 'bar',
                data: [
                  { value: current.iceMargin, itemStyle: { color: '#55585A' } },
                  { value: current.evMargin, itemStyle: { color: '#9D2148' } },
                ],
                markLine: {
                  symbol: 'none',
                  label: { formatter: 'Cero' },
                  lineStyle: { color: '#55585A', width: 2 },
                  data: [{ xAxis: 0 }],
                },
              },
            ],
          }
        : null,
    [current],
  );
  return (
    <section className="panel sensitivity-panel" id="sensibilidad" aria-busy={!series && !error}>
      <div className="panel-title">
        <h2>Explora las condiciones del escenario</h2>
        <span className="pill neutral">Mismo recaudo · misma flota</span>
      </div>
      <p>
        Cambia una variable y observa cómo afecta la energía, la recarga y el presupuesto. Los demás
        parámetros permanecen constantes.
      </p>
      <div className="exploration-controls">
        <div className="field">
          <label htmlFor="exploration-variable">Variable a explorar</label>
          <select
            id="exploration-variable"
            value={variable}
            onChange={(e) => setVariable(e.target.value as SensitivityVariable)}
          >
            {Object.entries(sensitivityVariables).map(([key, item]) => (
              <option key={key} value={key}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
        <p>
          {variable === 'cycles'
            ? 'Cantidad por unidad. El recaudo no cambia; modificar el servicio requiere tu decisión.'
            : variable === 'consumption'
              ? 'Consumo neto en batería, incluidos auxiliares y regeneración.'
              : 'Precio por kWh comprado; cargos de potencia y fijos permanecen constantes.'}
        </p>
      </div>
      {error ? (
        <p role="alert">No se pudo calcular esta exploración: {error}</p>
      ) : !current || !points || !data ? (
        <p role="status">Calculando los puntos con el mismo motor…</p>
      ) : (
        <>
          <div className="exploration-values">
            <span>
              Valor actual:{' '}
              <b>
                {num(data.current, 4)} {config.unit}
              </b>
            </span>
            <span>
              Valor explorado:{' '}
              <b>
                {num(current.value, 4)} {config.unit}
              </b>
            </span>
          </div>
          <label htmlFor="exploration-value">Valor explorado · {config.label}</label>
          <input
            id="exploration-value"
            type="range"
            min="0"
            max={points.length - 1}
            step="1"
            value={index}
            disabled={disabled}
            onChange={(e) => setSelection({ result: r, variable, index: Number(e.target.value) })}
            aria-valuetext={`${num(current.value, 4)} ${config.unit}`}
          />
          <div
            className="exploration-band"
            role="img"
            aria-label={`Valores probados: ${feasible.length} de ${points.length} cumplen los cálculos. Punto seleccionado ${num(current.value, 4)}: ${failures.length ? 'por resolver' : 'cumple el cálculo'}.`}
          >
            {points.map((p, i) => (
              <span
                key={p.value}
                className={`${p.failures.length ? 'fail' : 'pass'}${i === index ? ' selected' : ''}`}
                title={`${num(p.value, 4)}: ${p.failures.length ? 'Por resolver' : 'Cumple el cálculo'}`}
              />
            ))}
          </div>
          <p className="band-legend">
            <span>■ Cumple el cálculo</span>
            <span>▧ Por resolver</span>
          </p>
          <p className="muted">
            Rango elegido por la herramienta: {num(points[0]!.value, 4)}–
            {num(points.at(-1)!.value, 4)} {config.unit}. Son {points.length} valores evaluados, no
            un intervalo empírico de incertidumbre.
          </p>
          <div className="sensitivity-insight" role="status">
            <strong>
              {num(current.value, 4)} {config.unit}:{' '}
              {failures.length
                ? `${failures.length} condiciones por resolver.`
                : 'cumple las condiciones calculadas; comprobaciones externas pendientes.'}
            </strong>
            <p>
              {feasible.length
                ? `${feasible.length} valores probados cumplen los cálculos.`
                : 'Ningún valor probado cumple todas las condiciones calculadas.'}
            </p>
            {fixedFailures.length > 0 && (
              <p>
                Condiciones que impiden cumplir en todos los valores probados:{' '}
                {fixedFailures.map((c) => c.label).join(' · ')}. Un límite de batería no es un
                límite global de viabilidad.
              </p>
            )}
          </div>
          <div className="exploration-readings">
            <article>
              <h3>Energía por unidad y día</h3>
              <strong>
                {num(current.batteryKwh, 2)} / {num(current.usableKwh, 2)} kWh
              </strong>
              <p>Requerida / disponible, respetando reserva.</p>
              <progress
                aria-label="Energía requerida frente a disponible"
                max={current.usableKwh}
                value={Math.min(current.batteryKwh, current.usableKwh)}
              />
              <p>
                {current.batteryKwh > current.usableKwh
                  ? `Faltan ${num(current.batteryKwh - current.usableKwh, 2)} kWh.`
                  : `Margen: ${num(current.usableKwh - current.batteryKwh, 2)} kWh.`}
              </p>
            </article>
            <article>
              <h3>Recarga de la flota</h3>
              <strong>
                {Number.isFinite(current.chargeHours)
                  ? `${num(current.chargeHours, 2)} h`
                  : 'Sin potencia'}{' '}
                / {num(current.chargeWindow)} h
              </strong>
              <p>Requeridas / ventana nocturna.</p>
              <progress
                aria-label="Recarga frente a ventana nocturna"
                max={current.chargeWindow}
                value={Math.min(current.chargeHours, current.chargeWindow)}
              />
              <p>
                {current.chargeHours <= current.chargeWindow
                  ? 'La recarga cabe en la ventana.'
                  : 'La recarga no cabe en la ventana.'}
              </p>
            </article>
          </div>
          <h3>Resultado de caja mensual más bajo</h3>
          <p>
            Combustión <b>{mxn(current.iceMargin)}</b> · eléctrico <b>{mxn(current.evMargin)}</b>.
            Después de trabajo, pagos, ingreso objetivo y reserva.
          </p>
          {cashOption && (
            <Suspense fallback={<div className="chart" />}>
              <div className="exploration-cash">
                <Chart
                  option={cashOption}
                  label={`Mínimo de caja mensual de flota: combustión ${mxn(current.iceMargin)}, eléctrico ${mxn(current.evMargin)}. Cero indica ausencia de déficit.`}
                />
              </div>
            </Suspense>
          )}
          {failures.length > 0 && (
            <div className="exploration-failures">
              <h3>Condiciones que impiden cumplir este punto</h3>
              <ul>
                {failures.map((c) => (
                  <li key={c.id}>
                    <b>{c.label}.</b> {c.detail}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <details>
            <summary>Consultar curvas y valores calculados</summary>
            <div className="exploration-curves">
              {options?.map((option, i) => (
                <Suspense key={i} fallback={<div className="chart" />}>
                  <Chart
                    option={option}
                    label={`Curva ${['energía', 'recarga', 'caja'][i]} según ${config.label}. Valores en tabla.`}
                  />
                </Suspense>
              ))}
            </div>
            <div
              className="table-scroll"
              tabIndex={0}
              role="region"
              aria-label="Tabla de exploración desplazable"
            >
              <table>
                <caption>
                  Valores del mismo evaluador · mínimos de caja en 60 meses · sin pronóstico de
                  demanda
                </caption>
                <thead>
                  <tr>
                    <th>
                      {config.label} · {config.unit}
                    </th>
                    <th>km/día</th>
                    <th>kWh batería</th>
                    <th>kWh disponibles</th>
                    <th>kWh comprados</th>
                    <th>Recarga / ventana h</th>
                    <th>Caja combustión</th>
                    <th>Caja eléctrico</th>
                    <th>Condiciones incumplidas</th>
                  </tr>
                </thead>
                <tbody>
                  {points.map((p) => (
                    <tr key={p.value}>
                      <th scope="row">{num(p.value, 4)}</th>
                      <td>{num(p.km, 2)}</td>
                      <td>{num(p.batteryKwh, 2)}</td>
                      <td>{num(p.usableKwh, 2)}</td>
                      <td>{num(p.gridKwh, 2)}</td>
                      <td>
                        {Number.isFinite(p.chargeHours) ? num(p.chargeHours, 2) : 'Sin potencia'} /{' '}
                        {num(p.chargeWindow)}
                      </td>
                      <td>{mxn(p.iceMargin)}</td>
                      <td>{mxn(p.evMargin)}</td>
                      <td>
                        {p.constraints
                          .filter((c) => c.status === 'fail')
                          .map((c) => c.label)
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
      <button
        className="secondary"
        disabled={disabled || !current || !data || current.value === data.current}
        onClick={() => {
          if (current) onApply(variable, current.value);
        }}
      >
        Aplicar al escenario
      </button>
    </section>
  );
}
