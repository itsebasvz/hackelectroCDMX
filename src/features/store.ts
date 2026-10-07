import { create } from 'zustand';
import { ScenarioSchema, type Scenario } from '../domain/schema';
import { defaultScenario } from '../data/defaults';
export const STORAGE_KEY = 'hackelectro:scenario:v1';
function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? ScenarioSchema.parse(JSON.parse(raw)) : defaultScenario();
  } catch {
    return defaultScenario();
  }
}
interface State {
  scenario: Scenario;
  storageError: string;
  setScenario: (s: Scenario) => void;
  reset: () => void;
}
export const useScenario = create<State>((set) => ({
  scenario: load(),
  storageError: '',
  setScenario: (scenario) => {
    let storageError = '';
    const valid = ScenarioSchema.safeParse(scenario);
    if (valid.success)
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(valid.data));
      } catch {
        storageError = 'No se pudo guardar en este navegador. Puedes exportar el escenario.';
      }
    set({ scenario, storageError });
  },
  reset: () => {
    const scenario = defaultScenario();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(scenario));
    } catch {
      /* Se conserva la copia en memoria. */
    }
    set({ scenario });
  },
}));
