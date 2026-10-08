import { lazy, Suspense, useMemo, useState } from 'react';
import type { Result } from '../domain/schema';
import {
  environmentalView,
  type EnvironmentalScope,
  type EnvironmentalPeriod,
} from '../domain/environment';
import { num } from '../ui/format';
const Chart = lazy(() => import('../ui/Chart'));
export default function Environment({ result: r }: { result: Result }) {
  const [scope, setScope] = useState<EnvironmentalScope>('fleet');
  const [period, setPeriod] = useState<EnvironmentalPeriod>('year');
  const view = environmentalView(r, scope, period);
  const scopeLabel = scope === 'fleet' ? `Flota de ${view.units} unidades` : 'Una unidad';
  const periodLabel =
    period === 'day'
      ? 'día operativo'
      : period === 'month'
        ? 'mes operativo'
        : 'año de doce meses equivalentes';
  const options = useMemo(() => {
    const base = {
      tooltip: { trigger: 'axis', appendTo: 'body', confine: true },
      grid: { left: 110, right: 35, top: 55, bottom: 55 },
      xAxis: {
        type: 'value',
        nameLocation: 'middle',
        nameGap: 32,
        splitNumber: 3,
        axisLabel: {
          hideOverlap: true,
          formatter: (value: number) =>
            Math.abs(value) >= 1000 ? `${num(value / 1000, 0)} mil` : num(value, 1),
        },
      },
      yAxis: { type: 'category', data: ['Combustión', 'Eléctrico'] },
    };
    return [
      {
        ...base,
        xAxis: { ...base.xAxis, name: 'kg CO₂ · sólo escape' },
        series: [
          {
            type: 'bar',
            data: [
              { value: view.tailpipeCO2Kg, itemStyle: { color: '#55585A' } },
              { value: 0, itemStyle: { color: '#9D2148' } },
            ],
            label: {
              show: true,
              position: 'insideLeft',
              color: '#FFFFFF',
              formatter: (p: { value: number }) => (p.value > 0 ? num(p.value, 1) : ''),
            },
          },
        ],
      },
      {
        ...base,
        xAxis: { ...base.xAxis, name: 'kg CO₂e · electricidad comprada' },
        yAxis: { ...base.yAxis, data: ['Recarga'] },
        legend: { top: 0, textStyle: { fontSize: 12 } },
        series: view.parts.map((p, i) => ({
          name: p.label,
          type: 'bar',
          stack: 'recarga',
          data: [p.co2eKg],
          itemStyle: { color: ['#9D2148', '#55585A', '#266CB4'][i] },
        })),
      },
    ];
  }, [r, scope, period]);
  return (
    <section className="panel environmental" id="ambiente">
      <div className="panel-title">
        <div>
          <span className="eyebrow">RESULTADOS Y ALCANCE HUMANO</span>
          <h2>Impacto ambiental del escenario</h2>
        </div>
      </div>
      <p>
        Sustituir las unidades evita su escape en el recorrido supuesto. La recarga tiene emisiones
        indirectas que se muestran por separado.
      </p>
      <div className="environment-controls">
        <div className="field">
          <label htmlFor="environment-scope">Ámbito ambiental</label>
          <select
            id="environment-scope"
            value={scope}
            onChange={(e) => setScope(e.target.value as EnvironmentalScope)}
          >
            <option value="unit">Unidad</option>
            <option value="fleet">Flota</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="environment-period">Período ambiental</label>
          <select
            id="environment-period"
            value={period}
            onChange={(e) => setPeriod(e.target.value as EnvironmentalPeriod)}
          >
            <option value="day">Día</option>
            <option value="month">Mes</option>
            <option value="year">Año</option>
          </select>
        </div>
        <p>
          {scopeLabel} · {periodLabel}.{' '}
          {period !== 'day' && `${r.scenario.operation.days} días operativos por mes.`}{' '}
          {period === 'year' && 'Año = doce meses equivalentes, sin proyectar degradación.'}
        </p>
      </div>
      <div className="environment-results" role="status">
        <article>
          <span>Combustible que se dejaría de consumir</span>
          <strong>{num(view.liters, 1)} L</strong>
          <small>
            {r.scenario.ice.fuel === 'diesel' ? 'Diésel' : 'Gasolina'} · manteniendo el recorrido
            supuesto
          </small>
        </article>
        <article>
          <span>CO₂ que se dejaría de emitir por el escape</span>
          <strong>{num(view.tailpipeCO2Kg, 1)} kg CO₂</strong>
          <small>Sólo escape de las unidades sustituidas</small>
        </article>
        <article>
          <span>CO₂e asociado a la electricidad para recargar</span>
          <strong>{num(view.electricityCO2eKg, 1)} kg CO₂e</strong>
          <small>{num(view.gridKwh, 1)} kWh comprados · emisiones indirectas</small>
        </article>
      </div>
      <div className="chart-grid environmental-charts">
        <div>
          <h3>Emisiones de CO₂ por el escape</h3>
          <p>
            {scopeLabel} · {periodLabel} · eléctrico: 0 kg CO₂ por escape
          </p>
          <Suspense fallback={<div className="chart" />}>
            <Chart
              option={options[0]!}
              label={`CO₂ sólo por escape: combustión ${num(view.tailpipeCO2Kg, 2)} kg y eléctrico cero. ${scopeLabel}, ${periodLabel}.`}
            />
          </Suspense>
        </div>
        <div>
          <h3>Emisiones indirectas de la recarga</h3>
          <p>
            {scopeLabel} · {periodLabel} · incluye pérdidas de carga
          </p>
          <Suspense fallback={<div className="chart" />}>
            <Chart
              option={options[1]!}
              label={`Electricidad comprada: ${num(view.electricityCO2eKg, 2)} kg CO₂e. ${view.parts.map((p) => `${p.label}: ${num(p.co2eKg, 2)} kg CO₂e`).join('; ')}.`}
            />
          </Suspense>
          <ul className="environment-parts">
            {view.parts.map((p) => (
              <li key={p.label}>
                {p.label}: <b>{num(p.co2eKg, 2)} kg CO₂e</b>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <p className="muted">
        Los factores tienen alcances diferentes: estas gráficas no representan una reducción neta.
        Son resultados del escenario, no del conjunto de CDMX.
      </p>
      <div className="environment-human">
        <article>
          <h3>Aire en el recorrido</h3>
          <p>
            Eliminar el escape evita emisiones locales de esas unidades; siguen existiendo
            partículas por desgaste de frenos y neumáticos.
          </p>
        </article>
        <article>
          <h3>Entorno hospitalario</h3>
          <p>
            Reducir fuentes de escape es relevante para quienes viajan, trabajan o esperan alrededor
            del servicio. No se cuantifican enfermedades evitadas ni exposición específica.
          </p>
        </article>
        <article>
          <h3>Más allá de la operación</h3>
          <p>
            Fabricación, batería y fin de vida también tienen impactos; no están incluidos en estos
            resultados.
          </p>
        </article>
      </div>
      <details>
        <summary>Supuestos y límites ambientales</summary>
        <p>
          Combustión: litros calculados × benchmark EPA de{' '}
          {r.scenario.ice.fuel === 'diesel' ? '10.180' : '8.887'} kg CO₂/galón estadounidense
          (3.785411784 L). Electricidad: kWh comprados × {num(r.scenario.energy.gridFactor, 6)} kg
          CO₂e/kWh del escenario; referencia inicial SEN 2024, no medición de 2026. Servicio,
          adicionales y pérdidas reciben el mismo factor.
        </p>
        <p>
          EPA y OMS aportan contexto científico; no factores de salud ni mediciones del ramal. Las
          fichas bibliográficas están en «Fuentes y supuestos». No se calculan NOx/PM, ciclo de
          vida, ahorro sanitario o reducción tarifaria.
        </p>
        <ul>
          {r.warnings.map((w) => (
            <li key={w}>{w}</li>
          ))}
        </ul>
      </details>
    </section>
  );
}
