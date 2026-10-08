import { useRef } from 'react';
import { Download, Upload, Printer, Save, RotateCcw } from 'lucide-react';
import type { Scenario, Result } from '../domain/schema';
import { download, serializeScenario, parseScenario, resultsCsv } from './files';
export default function FilesPanel({
  scenario,
  result,
  name,
  onName,
  saved,
  onSave,
  onChange,
  onReset,
  onNotice,
  storageError,
  valid,
}: {
  scenario: Scenario;
  result: Result | null;
  name: string;
  onName: (name: string) => void;
  saved: Scenario[];
  onSave: () => void;
  onChange: (scenario: Scenario) => void;
  onReset: () => void;
  onNotice: (message: string) => void;
  storageError: string;
  valid: boolean;
}) {
  const file = useRef<HTMLInputElement>(null);
  const guarded = async (action: () => Promise<void> | void) => {
    try {
      await action();
    } catch (error) {
      onNotice(error instanceof Error ? error.message : 'No se pudo completar la acción.');
    }
  };
  return (
    <section className="panel scenario-tools">
      <div className="section-heading">
        <span className="eyebrow">COPIAS Y ARCHIVOS REPRODUCIBLES</span>
        <h2>Guardar y compartir la evaluación</h2>
        <p>
          Guardar conserva una copia local. Exportar incluye parámetros, catálogo, fuentes y
          versiones para recalcular el escenario.
        </p>
      </div>
      <div className="sharing-groups">
        <section className="sharing-local" aria-labelledby="sharing-local-title">
          <h3 id="sharing-local-title">Copias en este navegador</h3>
          <p>Guarda o abre una copia local. Importa un JSON para recalcular sus parámetros.</p>
          <div className="save-row">
            <div className="field">
              <label htmlFor="scenario-name">Nombre del escenario</label>
              <input
                id="scenario-name"
                value={name}
                onChange={(e) => onName(e.target.value)}
                maxLength={200}
              />
            </div>
            <button className="secondary" onClick={onSave} disabled={!valid}>
              <Save size={16} />
              Guardar escenario
            </button>
            {saved.length > 0 && (
              <div className="field">
                <label htmlFor="saved-choice">Abrir un escenario guardado</label>
                <select
                  id="saved-choice"
                  value=""
                  onChange={(e) => {
                    const item = saved[Number(e.target.value)];
                    if (item) onChange(structuredClone(item));
                  }}
                >
                  <option value="" disabled>
                    Seleccionar copia local…
                  </option>
                  {saved.map((item, i) => (
                    <option key={`${item.name}-${i}`} value={i}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <button className="secondary" onClick={() => file.current?.click()}>
            <Upload size={16} />
            Importar escenario JSON
          </button>
          <input
            ref={file}
            type="file"
            accept=".json,application/json"
            hidden
            onChange={(e) => {
              const selected = e.target.files?.[0];
              if (selected)
                void guarded(async () => {
                  if (selected.size > 5_000_000) throw new Error('El archivo supera 5 MB.');
                  onChange(await parseScenario(await selected.text()));
                  onNotice('Escenario importado y enviado al motor para recalcular.');
                });
              e.target.value = '';
            }}
          />
        </section>
        <section className="sharing-downloads" aria-labelledby="sharing-downloads-title">
          <h3 id="sharing-downloads-title">Archivos para compartir</h3>
          <div className="download-choice">
            <button className="primary" disabled={!valid} onClick={() => window.print()}>
              <Printer size={16} />
              Descargar informe / PDF
            </button>
            <p>
              Versión imprimible con diagnóstico, detalle económico, flujo, entradas y fuentes.
              Guarda como PDF desde el diálogo de impresión.
            </p>
          </div>
          <div className="download-choice">
            <button
              className="secondary"
              disabled={!valid}
              onClick={() =>
                void guarded(async () =>
                  download(
                    await serializeScenario({
                      ...scenario,
                      name: name.trim() || scenario.name,
                    }),
                    'hackelectro-escenario.json',
                    'application/json',
                  ),
                )
              }
            >
              <Download size={16} />
              Descargar escenario JSON
            </button>
            <p>Parámetros, catálogo y fuentes para reproducir y recalcular la evaluación.</p>
          </div>
          <div className="download-choice">
            <button
              className="secondary"
              disabled={!valid}
              onClick={() => {
                if (result)
                  download(
                    resultsCsv(result),
                    'hackelectro-resultados.csv',
                    'text/csv;charset=utf-8',
                  );
              }}
            >
              <Download size={16} />
              Descargar resultados CSV
            </button>
            <p>Entradas y resultados tabulares para revisar en una hoja de cálculo.</p>
          </div>
        </section>
      </div>
      <div className="restore-action">
        <button
          className="text-button"
          onClick={() => {
            onReset();
            onNotice('Se restauró el ejemplo inicial; tus escenarios guardados permanecen.');
          }}
        >
          <RotateCcw size={15} />
          Restaurar ejemplo
        </button>
      </div>
      {storageError && (
        <p className="notice" role="status">
          {storageError}
        </p>
      )}
    </section>
  );
}
