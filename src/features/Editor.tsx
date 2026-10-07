import { useState } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import type { Scenario } from '../domain/schema';
import { getValue, withValue, evidenceOf } from './values';
import { assumed } from '../data/catalog';
import { sections, type Field } from './fields';
function NumberField({
  field,
  s,
  onChange,
}: {
  field: Field;
  s: Scenario;
  onChange: (s: Scenario) => void;
}) {
  const raw = getValue(s, field.path) as number;
  const evidence = evidenceOf(s, field.path);
  const id = `field-${field.path.replaceAll('.', '-')}`;
  return (
    <div className="field">
      <label htmlFor={id}>
        <span>{field.label}</span>
        <span
          className={`evidence-tag ${evidence.level === 'F' ? 'assumption' : ''}`}
          title={`${evidence.nature} · ${evidence.sourceId} · ${evidence.date} · ${evidence.limitation}`}
        >
          {evidence.level === 'F' ? 'F · prueba' : `${evidence.level} · ${evidence.nature}`}
        </span>
      </label>
      <div className="number-wrap">
        <input
          id={id}
          type="number"
          value={Number.isFinite(raw) ? Number((raw * (field.percent ? 100 : 1)).toFixed(6)) : ''}
          step={field.step ?? 1}
          min="0"
          onChange={(e) =>
            onChange(
              withValue(
                s,
                field.path,
                e.target.value === '' ? NaN : Number(e.target.value) / (field.percent ? 100 : 1),
              ),
            )
          }
          aria-describedby={field.help ? `${id}-help` : undefined}
        />
        <span>{field.unit}</span>
      </div>
      {field.help && <small id={`${id}-help`}>{field.help}</small>}
    </div>
  );
}
export default function Editor({
  scenario: s,
  onChange,
}: {
  scenario: Scenario;
  onChange: (s: Scenario) => void;
}) {
  const [tab, setTab] = useState('service');
  const choose = (group: 'ice' | 'ev' | 'charger' | 'finance', id: string) => {
    const next = structuredClone(s);
    if (group === 'ice' || group === 'ev') {
      const v = next.catalog.vehicles.find((v) => v.id === id);
      if (v) {
        next[group] = structuredClone(v);
        if (group === 'ice') {
          next.energy.fuelPrice = v.fuel === 'diesel' ? 27 : 23.68;
          next.evidence['energy.fuelPrice'] = {
            ...assumed(),
            nature: 'oficial',
            level: 'D',
            sourceId: v.fuel === 'diesel' ? 'M24' : 'M23',
            scope: 'México · nacional',
            date: v.fuel === 'diesel' ? '2026-09-25' : '2026-08-27',
            limitation: 'Promedio nacional; no precio del ramal.',
          };
        }
      }
    } else if (group === 'charger')
      next.charger = structuredClone(next.catalog.chargers.find((c) => c.id === id)!);
    else next.finance = structuredClone(next.catalog.finances.find((f) => f.id === id)!);
    onChange(next);
  };
  const connector = (group: 'ev' | 'charger') => (
    <div className="field">
      <label htmlFor={`${group}-connector`}>
        Conector {group === 'ev' ? 'del vehículo' : 'del cargador'}
      </label>
      <select
        id={`${group}-connector`}
        value={s[group].connector}
        onChange={(e) => onChange(withValue(s, `${group}.connector`, e.target.value))}
      >
        <option value="unknown">No comprobado · compatibilidad supuesta</option>
        <option value="AC2">AC tipo 2</option>
        <option value="CCS2">CCS2</option>
        <option value="GBT">GB/T</option>
      </select>
    </div>
  );
  return (
    <Tabs.Root value={tab} onValueChange={setTab} className="editor">
      <Tabs.List className="editor-tabs" aria-label="Grupos de condiciones">
        {sections.map((section, i) => (
          <Tabs.Trigger value={section.id} key={section.id}>
            <span>{String(i + 1).padStart(2, '0')}</span>
            {section.title}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
      {sections.map((section) => (
        <Tabs.Content value={section.id} key={section.id} className="editor-content">
          <div className="section-heading">
            <h3>{section.title}</h3>
            <p>{section.description}</p>
          </div>
          <div className="fields-grid">
            {section.id === 'vehicles' && (
              <>
                <div className="field wide">
                  <label htmlFor="ice-choice">Referencia de combustión</label>
                  <select
                    id="ice-choice"
                    value={s.ice.id}
                    onChange={(e) => choose('ice', e.target.value)}
                  >
                    {s.catalog.vehicles
                      .filter((v) => v.fuel !== 'electricidad')
                      .map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.name}
                        </option>
                      ))}
                  </select>
                </div>
                <div className="field wide">
                  <label htmlFor="ev-choice">Referencia eléctrica</label>
                  <select
                    id="ev-choice"
                    value={s.ev.id}
                    onChange={(e) => choose('ev', e.target.value)}
                  >
                    {s.catalog.vehicles
                      .filter((v) => v.fuel === 'electricidad')
                      .map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.name}
                        </option>
                      ))}
                  </select>
                </div>
                {connector('ev')}
              </>
            )}
            {section.id === 'energy' && (
              <>
                <div className="field wide">
                  <label htmlFor="charger-choice">Cargador de prueba</label>
                  <select
                    id="charger-choice"
                    value={s.charger.id}
                    onChange={(e) => choose('charger', e.target.value)}
                  >
                    {s.catalog.chargers.map((c) => (
                      <option value={c.id} key={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                {connector('charger')}
              </>
            )}
            {section.id === 'finance' && (
              <>
                <div className="field wide">
                  <label htmlFor="finance-choice">Mecanismo de adquisición</label>
                  <select
                    id="finance-choice"
                    value={s.finance.id}
                    onChange={(e) => choose('finance', e.target.value)}
                  >
                    {s.catalog.finances.map((f) => (
                      <option value={f.id} key={f.id}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                </div>
                <label className="check-field">
                  <input
                    type="checkbox"
                    checked={s.finance.financeInfrastructure}
                    onChange={(e) =>
                      onChange(withValue(s, 'finance.financeInfrastructure', e.target.checked))
                    }
                  />
                  Crédito incluye infraestructura (hipótesis)
                </label>
                <label className="check-field">
                  <input
                    type="checkbox"
                    checked={s.finance.maintenanceIncluded}
                    onChange={(e) =>
                      onChange(withValue(s, 'finance.maintenanceIncluded', e.target.checked))
                    }
                  />
                  Renta incluye mantenimiento
                </label>
              </>
            )}
            {section.fields.map((field) => (
              <NumberField key={field.path} field={field} s={s} onChange={onChange} />
            ))}
          </div>
        </Tabs.Content>
      ))}
    </Tabs.Root>
  );
}
