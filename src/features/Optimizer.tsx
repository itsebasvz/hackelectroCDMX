import { Sparkles, ArrowRight, CheckCircle2, AlertCircle, X } from 'lucide-react';
import type { Scenario, SearchResult } from '../domain/schema';
import { num, mxn } from '../ui/format';
const reasons: Record<string, string> = {
  capacity: 'Capacidad insuficiente',
  battery: 'Energía y reserva insuficientes',
  charging: 'Recarga fuera de ventana',
  schedule: 'Servicio o jornada no cubiertos',
  frequency: 'Frecuencia insuficiente',
  connector: 'Conector incompatible',
  income: 'Presupuesto laboral menor al objetivo',
  monthly: 'Déficit mensual persistente',
  initial: 'Capital inicial insuficiente',
};
export default function Optimizer({
  search,
  searching,
  progress,
  onSearch,
  onCancel,
  onApply,
  disabled,
}: {
  search: SearchResult | null;
  searching: boolean;
  progress: { tested: number; total: number };
  onSearch: () => void;
  onCancel: () => void;
  onApply: (s: Scenario) => void;
  disabled: boolean;
}) {
  return (
    <section className="optimizer" id="condiciones">
      <div className="optimizer-intro">
        <div className="optimizer-icon">
          <Sparkles size={24} />
        </div>
        <div>
          <span className="eyebrow">COMPARAR OPCIONES DEL CATÁLOGO</span>
          <h2>Alternativas de electrificación</h2>
          <p>
            Evaluamos vehículos, cargadores y financiamiento para minimizar la aportación inicial.
            Conservamos servicio, flota, personal, tarifa e ingresos objetivo.
          </p>
        </div>
        <button className="primary" onClick={searching ? onCancel : onSearch} disabled={disabled}>
          {searching ? (
            <>
              <X size={17} />
              Cancelar búsqueda
            </>
          ) : (
            <>
              <Sparkles size={17} />
              Evaluar combinaciones
            </>
          )}
        </button>
      </div>
      {searching && (
        <div className="search-progress" role="status">
          <progress max={progress.total || 1} value={progress.tested} />
          Evaluadas {progress.tested} de {progress.total || '…'} combinaciones
        </div>
      )}
      {search && (
        <div className="search-results" aria-live="polite">
          {search.limitExceeded ? (
            <p>
              La selección supera 10,000 combinaciones. Reduce vehículos, cargadores,
              financiamientos o tamaño de flota antes de buscar.
            </p>
          ) : (
            <>
              <div className={`search-summary ${search.alternatives.length ? 'found' : 'empty'}`}>
                {search.alternatives.length ? (
                  <CheckCircle2 size={18} />
                ) : (
                  <AlertCircle size={18} />
                )}
                <span>
                  {search.tested} combinaciones evaluadas ·{' '}
                  {search.alternatives.length
                    ? 'mejores opciones condicionadas'
                    : 'ninguna cumple todas las restricciones'}
                </span>
              </div>
              <div className="alternatives">
                {search.alternatives.map((a, index) => (
                  <article
                    key={`${a.scenario.ev.id}-${a.scenario.charger.id}-${a.scenario.finance.id}-${a.scenario.chargerCount}`}
                    className="alternative"
                  >
                    <span className="option-number">OPCIÓN {index + 1}</span>
                    <h3>{a.scenario.ev.name}</h3>
                    <p>
                      {a.scenario.chargerCount} × {a.scenario.charger.name}
                      <br />
                      {a.scenario.finance.name}
                    </p>
                    <span className="small-label">
                      Aportación inicial mínima hipotética · flota
                    </span>
                    <strong className="support-value">{mxn(a.support)}</strong>
                    <dl>
                      <div>
                        <dt>Capital propio</dt>
                        <dd>{mxn(a.result.ev.ownRequired)}</dd>
                      </div>
                      <div>
                        <dt>Menor margen mensual</dt>
                        <dd>{mxn(a.result.ev.minMonthlyCash)}</dd>
                      </div>
                      <div>
                        <dt>Carga de flota</dt>
                        <dd>{num(a.result.charge.hours, 2)} h</dd>
                      </div>
                    </dl>
                    <button className="secondary" onClick={() => onApply(a.scenario)}>
                      Explorar esta combinación <ArrowRight size={16} />
                    </button>
                  </article>
                ))}
              </div>
              {!search.alternatives.length && (
                <div className="thresholds">
                  <p>
                    <strong>Umbrales orientativos del escenario actual</strong>
                  </p>
                  <p>
                    Consumo máximo entre cargas: {num(search.thresholds.maxBatteryConsumption, 3)}{' '}
                    kWh/km. Potencia media mínima de carga para la flota:{' '}
                    {num(search.thresholds.minimumAverageSiteKw, 1)} kW, antes de curva y turnos.
                    Brecha operativa mensual: {mxn(search.thresholds.monthlyOperatingGap)}.
                  </p>
                </div>
              )}
              {Object.keys(search.rejected).length > 0 && (
                <details>
                  <summary>Por qué se descartaron combinaciones</summary>
                  <ul>
                    {Object.entries(search.rejected).map(([id, count]) => (
                      <li key={id}>
                        {reasons[id] ?? id}: {count} incidencias
                      </li>
                    ))}
                  </ul>
                  <small>Una combinación puede incumplir varias condiciones.</small>
                </details>
              )}
              <p className="muted">
                La mejor opción pertenece al catálogo y supuestos evaluados. Patio, compatibilidad
                no documentada, autorización, entrega y financiamiento siguen pendientes. La
                aportación es hipotética; no asigna un subsidio existente.
              </p>
            </>
          )}
        </div>
      )}
    </section>
  );
}
