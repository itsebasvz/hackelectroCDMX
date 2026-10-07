import type { Scenario } from '../domain/schema';
import { getValue, withValue, evidenceOf } from './values';
import { sections, type Field } from './fields';
export const essentialPaths = [
  'route.cycleKm',
  'operation.cycles',
  'operation.fleet',
  'ice.consumption',
  'ev.consumption',
  'chargerCount',
  'energy.chargeHours',
];
export function NumberField({
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
          {evidence.level === 'F' ? 'Supuesto editable' : `${evidence.level} · ${evidence.nature}`}
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
  const chooseFinance = (id: string) => {
    const next = structuredClone(s);
    next.finance = structuredClone(next.catalog.finances.find((f) => f.id === id)!);
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
    <div className="editor advanced-editor">
      <h3>Parámetros avanzados</h3>
      {sections.map((section) => (
        <details id={`advanced-${section.id}`} key={section.id} className="advanced-group">
          <summary>{section.title}</summary>
          <div className="editor-content">
            <div className="section-heading">
              <h3>{section.title}</h3>
              <p>{section.description}</p>
            </div>
            <div className="fields-grid">
              {section.id === 'energy' && (
                <>
                  {connector('ev')}
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
                      onChange={(e) => chooseFinance(e.target.value)}
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
              {section.fields
                .filter((field) => !essentialPaths.includes(field.path))
                .map((field) => (
                  <NumberField key={field.path} field={field} s={s} onChange={onChange} />
                ))}
            </div>
          </div>
        </details>
      ))}
    </div>
  );
}
