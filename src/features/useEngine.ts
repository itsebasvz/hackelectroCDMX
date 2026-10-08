import { useEffect, useRef, useState } from 'react';
import { ScenarioSchema, type Scenario, type Result, type SearchResult } from '../domain/schema';
import { sections } from './fields';
import { RequestGate, type Response, type Request } from '../worker/protocol';
import type { SensitivitySeries } from '../domain/explore';
import type { RevenueStressPoint } from '../domain/financialAnalysis';
export function useEngine(scenario: Scenario) {
  const worker = useRef<Worker | null>(null);
  const evaluationGate = useRef(new RequestGate());
  const searchGate = useRef(new RequestGate());
  const [result, setResult] = useState<Result | null>(null);
  const [search, setSearch] = useState<SearchResult | null>(null);
  const [revenuePoints, setRevenuePoints] = useState<RevenueStressPoint[] | null>(null);
  const [revenueError, setRevenueError] = useState('');
  const [points, setPoints] = useState<SensitivitySeries[] | null>(null);
  const [sensitivityError, setSensitivityError] = useState('');
  const [status, setStatus] = useState('calculating');
  const [error, setError] = useState('');
  const [searching, setSearching] = useState(false);
  const [progress, setProgress] = useState({ tested: 0, total: 0 });
  const send = (message: Request) => worker.current?.postMessage(message);
  useEffect(() => {
    const w = new Worker(new URL('../worker/engine.worker.ts', import.meta.url), {
      type: 'module',
    });
    worker.current = w;
    w.onmessage = (e: MessageEvent<Response>) => {
      const m = e.data;
      if (m.type === 'evaluated' && evaluationGate.current.accepts(m.id)) {
        setResult(m.result);
        setStatus('ready');
        send({ type: 'revenue-stress', id: m.id, scenario: m.result.scenario });
        send({ type: 'sensitivity', id: m.id, scenario: m.result.scenario });
      }
      if (m.type === 'revenue-stress' && evaluationGate.current.accepts(m.id))
        setRevenuePoints(m.points);
      if (m.type === 'sensitivity' && evaluationGate.current.accepts(m.id)) setPoints(m.points);
      if (m.type === 'searched' && searchGate.current.accepts(m.id)) {
        setSearch(m.result);
        setSearching(false);
      }
      if (m.type === 'progress' && searchGate.current.accepts(m.id))
        setProgress({ tested: m.tested, total: m.total });
      if (m.type === 'error') {
        if (m.operation === 'revenue-stress' && evaluationGate.current.accepts(m.id))
          setRevenueError(m.error);
        if (m.operation === 'sensitivity' && evaluationGate.current.accepts(m.id))
          setSensitivityError(m.error);
        if (m.operation === 'evaluate' && evaluationGate.current.accepts(m.id)) {
          setStatus('error');
          setError(m.error);
        }
        if (m.operation === 'search' && searchGate.current.accepts(m.id)) {
          setSearching(false);
          setError(m.error);
        }
      }
    };
    w.onerror = () => {
      setStatus('error');
      setSearching(false);
      setError('El motor no pudo iniciarse. Recarga la aplicación o usa la copia local.');
    };
    return () => {
      w.terminate();
      worker.current = null;
    };
  }, []);
  useEffect(() => {
    const id = evaluationGate.current.next();
    const searchId = searchGate.current.next();
    send({ type: 'cancel', id: searchId });
    send({ type: 'cancel-sensitivity', id });
    send({ type: 'cancel-revenue-stress', id });
    setRevenuePoints(null);
    setRevenueError('');
    setPoints(null);
    setSensitivityError('');
    setSearching(false);
    setSearch(null);
    setError('');
    const parsed = ScenarioSchema.safeParse(scenario);
    if (!parsed.success) {
      setStatus('invalid');
      setError(
        parsed.error.issues
          .map(
            (i) =>
              `${sections.flatMap((section) => section.fields).find((field) => field.path === i.path.join('.'))?.label ?? 'Configuración'}: ${i.code === 'custom' ? i.message : 'introduce un valor válido dentro del rango permitido.'}`,
          )
          .join(' · '),
      );
      return;
    }
    setStatus('calculating');
    const timer = setTimeout(() => send({ type: 'evaluate', id, scenario: parsed.data }), 300);
    return () => clearTimeout(timer);
  }, [scenario]);
  const startSearch = () => {
    const parsed = ScenarioSchema.safeParse(scenario);
    if (!parsed.success) return;
    const id = searchGate.current.next();
    setSearch(null);
    setSearching(true);
    setProgress({ tested: 0, total: 0 });
    send({ type: 'search', id, scenario: parsed.data });
  };
  const cancel = () => {
    const id = searchGate.current.next();
    send({ type: 'cancel', id });
    setSearching(false);
  };
  return {
    result,
    search,
    status,
    error,
    searching,
    progress,
    startSearch,
    cancel,
    points,
    sensitivityError,
    revenuePoints,
    revenueError,
  };
}
