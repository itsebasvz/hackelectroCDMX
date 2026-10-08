import { CheckCircle2, AlertCircle } from 'lucide-react';
import type { Result } from '../domain/schema';
import type { SensitivitySeries, SensitivityVariable } from '../domain/explore';
import type { RevenueStressPoint } from '../domain/financialAnalysis';
import { EnergyPanel, CostPanel, ResultMetrics } from './ResultViews';
import Sensitivity from './Sensitivity';
import FinancePanel from './FinancePanel';
import Environment from './Environment';
export default function Dashboard({
  result: r,
  points,
  sensitivityError,
  revenuePoints,
  revenueError,
  stale,
  onExplore,
}: {
  result: Result;
  points: SensitivitySeries[] | null;
  sensitivityError: string;
  revenuePoints: RevenueStressPoint[] | null;
  revenueError: string;
  stale: boolean;
  onExplore: (variable: SensitivityVariable, value: number) => void;
}) {
  const failed = r.constraints.filter((c) => c.status === 'fail');
  return (
    <div className="dashboard">
      <div className="dashboard-heading">
        <div>
          <span className="eyebrow">RESULTADOS DEL ESCENARIO</span>
          <h2>¿Qué cambia al electrificar?</h2>
        </div>
        <span className={`pill ${r.passes ? 'positive' : 'warning'}`}>
          {r.passes ? <CheckCircle2 size={17} /> : <AlertCircle size={17} />}
          {r.passes
            ? 'Cumple cálculos · verificaciones pendientes'
            : `${failed.length} ${failed.length === 1 ? 'condición' : 'condiciones'} por resolver`}
        </span>
      </div>
      <ResultMetrics result={r} />
      <div className="results-columns">
        <div className="results-left">
          <EnergyPanel result={r} />
          <CostPanel result={r} />
        </div>
        <FinancePanel result={r} stale={stale} points={revenuePoints} error={revenueError} />
      </div>
      <Sensitivity
        result={r}
        points={points}
        error={sensitivityError}
        disabled={stale}
        onApply={onExplore}
      />
      <Environment result={r} />
    </div>
  );
}
