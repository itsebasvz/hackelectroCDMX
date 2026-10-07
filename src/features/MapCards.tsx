import { useEffect, useRef } from 'react';
import { Battery, ChevronDown, Hospital as HospitalIcon, Target, X } from 'lucide-react';
import type { Result } from '../domain/schema';
import { batteryLimit, consumptionAt } from '../domain/geometry';
import { num } from '../ui/format';
import type { Hospital } from './MapSymbols';

export function PointCard({
  result,
  cycle,
  cycles,
  fraction,
  stale,
  expanded,
  onToggle,
}: {
  result: Result | null;
  cycle: number;
  cycles: number;
  fraction: number;
  stale: boolean;
  expanded: boolean;
  onToggle: () => void;
}) {
  const point = result ? consumptionAt(result, cycle, fraction) : null;
  const soc = point ? Math.max(0, Math.min(100, point.soc * 100)) : 0;
  return (
    <section className="map-point-card map-card" aria-label="En este punto">
      <div className="map-card-heading">
        <b>En este punto</b>
        <span className="map-simulation">
          {stale ? 'Resultado anterior' : 'Escenario simulado'}
        </span>
      </div>
      <p>
        Vuelta {cycle} de {cycles} · <strong>{point ? num(point.km, 1) : '—'} km</strong> del día
      </p>
      <div className="map-point-energy">
        <Battery size={18} aria-hidden="true" />
        <strong>{point ? `${num(soc, 1)}%` : '—'}</strong>
        <span>batería restante</span>
      </div>
      <div
        className="map-battery-meter"
        role="meter"
        aria-label="Batería restante estimada"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={soc}
      >
        <span style={{ width: `${soc}%` }} />
        {result && <i style={{ left: `${result.scenario.energy.socMin * 100}%` }} />}
      </div>
      <div className="map-meter-labels">
        <span>0%</span>
        <span>Reserva {result ? num(result.scenario.energy.socMin * 100, 0) : '—'}%</span>
        <span>100%</span>
      </div>
      <p className="map-consumed">
        <strong>{point ? num(point.kwh, 2) : '—'} kWh</strong> consumidos en batería
        {point && point.soc < 0 ? ' · energía agotada' : ''}
      </p>
      <button
        className="map-vehicle-toggle"
        disabled={!result}
        onClick={onToggle}
        aria-expanded={expanded}
      >
        <span>Vehículo del escenario</span>
        <ChevronDown size={14} aria-hidden="true" />
      </button>
      {expanded && result && (
        <div className="map-vehicle-details">
          <b>{result.scenario.ev.name}</b>
          <p>
            {result.scenario.ev.capacity} plazas · {num(result.scenario.ev.consumption, 2)} kWh/km
            netos
          </p>
          <p>
            {num(result.scenario.ev.batteryKwh, 1)} kWh nominales · salud{' '}
            {num(result.scenario.energy.soh * 100, 0)}%
          </p>
        </div>
      )}
    </section>
  );
}

export function DayCard({
  result,
  stale,
  onLimit,
  canNavigate,
}: {
  canNavigate: boolean;
  result: Result | null;
  stale: boolean;
  onLimit: () => void;
}) {
  const limit = result ? batteryLimit(result) : null;
  const margin = result ? result.usableKwh - result.dailyBatteryKwh : 0;
  const passes = margin >= -1e-9;
  return (
    <section
      className={`map-day-card map-card ${result && !passes ? 'energy-deficit' : ''}`}
      aria-label="Batería para el día"
    >
      <div className="map-card-heading">
        <b>Batería para el día</b>
        <span>Evaluación energética</span>
      </div>
      {result ? (
        <>
          <strong className="map-day-verdict">
            {passes
              ? `Termina con ${num(Math.max(0, result.socEnd) * 100, 1)}% de batería`
              : `Faltan ${num(-margin, 2)} kWh`}
          </strong>
          <p>
            {passes
              ? `${num(Math.max(0, margin), 2)} kWh de margen antes de invadir la reserva.`
              : 'Para completar el servicio respetando la reserva.'}
          </p>
          {limit?.withinDay && (
            <button className="text-button" disabled={stale || !canNavigate} onClick={onLimit}>
              <Target size={14} aria-hidden="true" />
              {passes ? 'Reserva alcanzada al finalizar' : 'Ver límite de batería'}
            </button>
          )}
        </>
      ) : (
        <p>Calculando el escenario…</p>
      )}
      <small>Carga y financiamiento se evalúan en el diagnóstico.</small>
    </section>
  );
}

export function HospitalCard({
  hospital,
  onClose,
  onCenter,
  canCenter,
}: {
  hospital: Hospital;
  onClose: () => void;
  onCenter: () => void;
  canCenter: boolean;
}) {
  const card = useRef<HTMLElement>(null);
  useEffect(() => {
    card.current?.focus();
  }, [hospital.shortName]);
  return (
    <section
      ref={card}
      tabIndex={-1}
      className="hospital-callout map-card"
      aria-label={`Referencia hospitalaria: ${hospital.shortName}`}
    >
      <button
        className="hospital-close"
        aria-label="Cerrar referencia hospitalaria"
        onClick={onClose}
      >
        <X size={16} aria-hidden="true" />
      </button>
      <div className="map-hospital-heading">
        <HospitalIcon size={20} aria-hidden="true" />
        <b>{hospital.shortName}</b>
      </div>
      <p>
        <strong>{hospital.name}</strong>
      </p>
      <p>{hospital.address}</p>
      <small>{hospital.limitation}</small>
      <div className="map-hospital-actions">
        <button className="text-button" disabled={!canCenter} onClick={onCenter}>
          Centrar hospital
        </button>
        <a href={hospital.officialUrl} target="_blank" rel="noreferrer">
          Fuente institucional ↗
        </a>
      </div>
    </section>
  );
}
