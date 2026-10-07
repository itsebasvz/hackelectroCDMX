import { ScenarioSchema, type Scenario, type SearchResult, type Alternative } from './schema';
import { evaluateScenario } from './evaluate';
import { financial } from './finance';
export class SearchCancelled extends Error {
  constructor() {
    super('Búsqueda cancelada');
  }
}
export async function findConditions(
  input: Scenario,
  options: { cancelled?: () => boolean; progress?: (tested: number, total: number) => void } = {},
): Promise<SearchResult> {
  const s = ScenarioSchema.parse(input);
  const vehicles = s.catalog.vehicles
    .filter((v) => v.fuel === 'electricidad')
    .map((v) => (v.id === s.ev.id ? s.ev : v));
  const chargers = s.catalog.chargers.map((c) => (c.id === s.charger.id ? s.charger : c));
  const finances = s.catalog.finances.map((f) => (f.id === s.finance.id ? s.finance : f));
  const total = vehicles.length * chargers.length * finances.length * s.operation.fleet;
  const current = evaluateScenario(s);
  const thresholds = {
    maxBatteryConsumption: current.usableKwh / current.dailyKm,
    minimumAverageSiteKw: (current.dailyGridKwh * s.operation.fleet) / s.energy.chargeHours,
    monthlyOperatingGap: Math.max(
      0,
      current.ev.operatingMonth +
        current.ev.protectedMonth +
        s.economy.monthlyReserve * s.operation.fleet -
        current.ev.months[0]!.revenue,
    ),
  };
  const result: SearchResult = {
    alternatives: [],
    tested: 0,
    rejected: {},
    limitExceeded: total > 10000,
    thresholds,
  };
  if (result.limitExceeded) return result;
  const winners: Alternative[] = [];
  const reject = (id: string) => {
    result.rejected[id] = (result.rejected[id] ?? 0) + 1;
  };
  for (const ev of vehicles)
    for (const charger of chargers)
      for (const finance of finances)
        for (let chargerCount = 1; chargerCount <= s.operation.fleet; chargerCount++) {
          if (options.cancelled?.()) throw new SearchCancelled();
          const candidate: Scenario = {
            ...s,
            ev,
            charger,
            finance,
            chargerCount,
            economy: { ...s.economy, support: 0 },
          };
          const baseline = evaluateScenario(candidate);
          result.tested++;
          const failures = baseline.constraints.filter(
            (c) => c.status === 'fail' && !['initial', 'monthly'].includes(c.id),
          );
          if (failures.length) {
            for (const c of failures) reject(c.id);
          } else {
            const max = Math.ceil(
              (baseline.ev.capex + s.economy.initialReserve * s.operation.fleet) * 100,
            );
            const at = (cents: number) =>
              financial(
                { ...candidate, economy: { ...candidate.economy, support: cents / 100 } },
                ev,
                baseline.ev.operatingMonth,
                true,
              );
            const valid = (cents: number) => {
              const f = at(cents);
              return f.ownRequired <= s.economy.ownCapital && f.minMonthlyCash >= 0;
            };
            if (!valid(max)) reject('monthly');
            else {
              let lo = 0,
                hi = max;
              while (lo < hi) {
                const mid = Math.floor((lo + hi) / 2);
                if (valid(mid)) hi = mid;
                else lo = mid + 1;
              }
              const funded = { ...candidate, economy: { ...candidate.economy, support: lo / 100 } };
              const evaluation = evaluateScenario(funded);
              if (evaluation.passes)
                winners.push({ scenario: funded, result: evaluation, support: lo / 100 });
              else reject('monthly');
            }
          }
          if (result.tested % 10 === 0) {
            options.progress?.(result.tested, total);
            await new Promise<void>((resolve) => setTimeout(resolve, 0));
          }
        }
  winners.sort(
    (a, b) =>
      a.support - b.support ||
      a.result.ev.economicCost - b.result.ev.economicCost ||
      a.result.ev.ownRequired - b.result.ev.ownRequired ||
      `${a.scenario.ev.id}-${a.scenario.charger.id}-${a.scenario.finance.id}-${a.scenario.chargerCount}`.localeCompare(
        `${b.scenario.ev.id}-${b.scenario.charger.id}-${b.scenario.finance.id}-${b.scenario.chargerCount}`,
      ),
  );
  result.alternatives = winners.slice(0, 3);
  options.progress?.(result.tested, total);
  return result;
}
