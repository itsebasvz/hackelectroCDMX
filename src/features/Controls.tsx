import { BusFront, SlidersHorizontal } from 'lucide-react';
import type { Scenario } from '../domain/schema';
import Editor, { NumberField } from './Editor';
import { sections } from './fields';
import { preset } from '../data/defaults';
import { assumed } from '../data/catalog';
import { num } from '../ui/format';

export function focusParameter(path: string) {
  const id = path === 'ev.connector' ? 'ev-connector' : `field-${path.replaceAll('.', '-')}`;
  const field = document.getElementById(id);
  if (!field) return;
  let parent = field.parentElement;
  while (parent) {
    if (parent instanceof HTMLDetailsElement) parent.open = true;
    parent = parent.parentElement;
  }
  field.scrollIntoView({ block: 'center', behavior: 'smooth' });
  field.focus({ preventScroll: true });
}
export default function Controls({
  scenario: s,
  onChange,
  onRoutes,
}: {
  scenario: Scenario;
  onChange: (s: Scenario) => void;
  onRoutes: () => void;
}) {
  const field = (path: string, help?: string) => {
    const f = sections.flatMap((x) => x.fields).find((x) => x.path === path)!;
    return (
      <NumberField key={path} field={{ ...f, help: help ?? f.help }} s={s} onChange={onChange} />
    );
  };
  const choose = (group: 'ice' | 'ev' | 'charger', id: string) => {
    const next = structuredClone(s);
    if (group === 'charger')
      next.charger = structuredClone(s.catalog.chargers.find((c) => c.id === id)!);
    else next[group] = structuredClone(s.catalog.vehicles.find((v) => v.id === id)!);
    if (group === 'ice') {
      next.energy.fuelPrice = next.ice.fuel === 'diesel' ? 27 : 23.68;
      next.evidence['energy.fuelPrice'] = {
        ...assumed(),
        sourceId: next.ice.fuel === 'diesel' ? 'M24' : 'M23',
        level: 'D',
        nature: 'oficial',
        scope: 'México · nacional',
        date: next.ice.fuel === 'diesel' ? '2026-09-25' : '2026-08-27',
        limitation: 'Promedio nacional; no precio del ramal.',
      };
    }
    onChange(next);
  };
  return (
    <aside className="controls-panel" id="parametros" aria-label="Configura tu escenario">
      <div className="controls-title">
        <SlidersHorizontal size={19} />
        <h2>Configura tu escenario</h2>
      </div>
      <div className="controls-scroll">
        <div className="selected-route-card">
          <span className="small-label">RAMAL EN ESTUDIO</span>
          <strong>{s.route.name}</strong>
          <button className="secondary" onClick={onRoutes}>
            Cambiar ruta
          </button>
        </div>
        <section className="control-group">
          <h3>
            <BusFront size={16} /> Vehículos a comparar
          </h3>
          <div className="presets" aria-label="Ejemplos por clase">
            {(['van', 'minibus', 'urban'] as const).map((category, i) => (
              <button
                key={category}
                aria-pressed={s.ev.category === category}
                onClick={() => onChange(preset(s, category))}
              >
                {['Van · gasolina', 'Minibús · diésel', 'Urbano · diésel'][i]}
              </button>
            ))}
          </div>
          {(['ice', 'ev'] as const).map((group) => (
            <div className="field" key={group}>
              <label htmlFor={`${group}-choice`}>
                {group === 'ice' ? 'Referencia de combustión' : 'Referencia eléctrica'}
              </label>
              <select
                id={`${group}-choice`}
                value={s[group].id}
                onChange={(e) => choose(group, e.target.value)}
              >
                {s.catalog.vehicles
                  .filter((v) =>
                    group === 'ice' ? v.fuel !== 'electricidad' : v.fuel === 'electricidad',
                  )
                  .map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
              </select>
            </div>
          ))}
          {field('ice.consumption', 'Más km por litro significa menor gasto de combustible.')}
          {field(
            'ev.consumption',
            'Más kWh por km significa mayor gasto y menor autonomía. Incluye regeneración y auxiliares.',
          )}
        </section>
        <section className="control-group">
          <h3>Trabajo diario</h3>
          {field('route.cycleKm')}
          {field(
            'operation.cycles',
            'Vueltas completas de prueba; cada una recorre la longitud indicada.',
          )}
          {field('operation.fleet')}
          <div className="derived-note">
            <b>
              {Number.isFinite(s.route.cycleKm * s.operation.cycles)
                ? num(s.route.cycleKm * s.operation.cycles * (1 + s.operation.emptyRatio), 1)
                : '—'}{' '}
              km diarios por unidad
            </b>
            <small>
              Servicio + {num(s.operation.emptyRatio * 100)}% de recorrido adicional. Parámetros del
              escenario.
            </small>
          </div>
        </section>
        <section className="control-group">
          <h3>Recarga nocturna</h3>
          <div className="field">
            <label htmlFor="charger-choice">Cargador de prueba</label>
            <select
              id="charger-choice"
              value={s.charger.id}
              onChange={(e) => choose('charger', e.target.value)}
            >
              {s.catalog.chargers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          {field('chargerCount')}
          {field(
            'energy.chargeHours',
            'Horas para recuperar la energía de toda la flota antes del siguiente día.',
          )}
        </section>
        <Editor scenario={s} onChange={onChange} />
      </div>
    </aside>
  );
}
