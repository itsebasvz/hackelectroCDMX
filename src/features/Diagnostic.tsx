import { CheckCircle2, AlertCircle, ArrowRight, Users } from 'lucide-react';
import type { Result } from '../domain/schema';
import { focusParameter } from './Controls';
import { mxn, num } from '../ui/format';
const links: Record<string, string> = {
  capacity: 'operation.requiredCapacity',
  battery: 'ev.consumption',
  charging: 'energy.chargeHours',
  schedule: 'operation.cycleMinutes',
  frequency: 'operation.maxHeadwayMinutes',
  connector: 'ev.connector',
  income: 'economy.laborCost',
  initial: 'economy.ownCapital',
  monthly: 'finance.annualRate',
};
export default function Diagnostic({
  result: r,
  stale,
  onSearch,
}: {
  result: Result | null;
  stale: boolean;
  onSearch: () => void;
}) {
  if (!r)
    return (
      <aside className="diagnostic-panel" aria-label="Diagnóstico">
        <h2>Preparando tu evaluación…</h2>
      </aside>
    );
  const friendly: Record<string, string> = {
    initial: `Necesitas ${mxn(r.ev.ownRequired)} de capital propio; dispones de ${mxn(r.scenario.economy.ownCapital)}.`,
    monthly: `El menor margen es ${mxn(r.ev.minMonthlyCash)} al mes, después de trabajo, pagos, ingreso del concesionario y reserva.`,
    battery: `Se requieren ${num(r.dailyBatteryKwh, 2)} kWh y hay ${num(r.usableKwh, 2)} kWh disponibles respetando la reserva.`,
    charging: Number.isFinite(r.charge.hours)
      ? `La flota requiere ${num(r.charge.hours, 2)} h; hay ${num(r.scenario.energy.chargeHours)} h disponibles.`
      : 'No hay potencia disponible para recargar la flota. Revisa el sitio y sus otros usos.',
  };
  const failures = r.constraints.filter((c) => c.status === 'fail');
  const unknown =
    r.scenario.ev.connector === 'unknown' || r.scenario.charger.connector === 'unknown';
  const pending = r.constraints.filter((c) => c.status === 'pending');
  return (
    <aside className="diagnostic-panel" aria-label="Diagnóstico del escenario">
      <span className="eyebrow">LO QUE NOS DICE EL ESCENARIO</span>
      <h2>{failures.length ? 'Hay condiciones por resolver' : 'Los cálculos son favorables'}</h2>
      <p>
        Con estos parámetros,{' '}
        {failures.length
          ? `${failures.length} condiciones no se cumplen.`
          : 'se cumplen las condiciones calculadas.'}{' '}
        Quedan {pending.length + Number(unknown)} comprobaciones externas.
      </p>
      {stale && (
        <p className="stale-note">
          Resultado anterior. Corrige las entradas o espera el nuevo cálculo.
        </p>
      )}
      <ul className="diagnostic-checks">
        {r.constraints
          .filter((c) => c.status !== 'pending' && !(c.id === 'connector' && unknown))
          .map((c) => (
            <li key={c.id} className={c.status}>
              <div>
                {c.status === 'fail' ? <AlertCircle size={17} /> : <CheckCircle2 size={17} />}
                <strong>{c.label}</strong>
              </div>
              {c.status === 'fail' && (
                <>
                  <p>{friendly[c.id] ?? c.detail}</p>
                  <button
                    className="text-button"
                    onClick={() =>
                      focusParameter(
                        c.id === 'monthly' && r.scenario.finance.kind === 'lease'
                          ? 'finance.leasePerUnitMonth'
                          : links[c.id]!,
                      )
                    }
                  >
                    Revisar parámetro <ArrowRight size={14} />
                  </button>
                </>
              )}
            </li>
          ))}
      </ul>
      <div className="protected-note">
        <Users size={18} />
        <div>
          <b>
            {r.scenario.operation.operators * r.scenario.operation.fleet} personas presupuestadas
          </b>
          <p>
            Objetivo: {mxn(r.scenario.economy.incomeGoal)} al mes por operador. El flujo debe poder
            sostenerlo; no es un salario comprobado.
          </p>
        </div>
      </div>
      <button className="primary" onClick={onSearch} disabled={stale}>
        Explorar cómo mejorarlo <ArrowRight size={16} />
      </button>
      <details>
        <summary>Comprobaciones pendientes ({pending.length + Number(unknown)})</summary>
        <ul>
          {pending.map((c) => (
            <li key={c.id}>
              <b>{c.label}.</b> {c.detail}
            </li>
          ))}
          {unknown && (
            <li>
              <b>Compatibilidad de carga.</b> Conector y configuración por confirmar con el
              proveedor.
            </li>
          )}
        </ul>
      </details>
    </aside>
  );
}
