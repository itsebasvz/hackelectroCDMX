// @vitest-environment jsdom
import { afterEach, beforeEach, it, expect, vi } from 'vitest';
import { act, cleanup, renderHook } from '@testing-library/react';
import { defaultScenario } from '../data/defaults';
import { evaluateScenario } from '../domain/evaluate';
import { revenueStress } from '../domain/financialAnalysis';
import type { Request, Response } from '../worker/protocol';
import { useEngine } from './useEngine';
class WorkerDouble {
  static instance: WorkerDouble;
  onmessage?: (event: { data: Response }) => void;
  onerror?: () => void;
  messages: Request[] = [];
  constructor() {
    WorkerDouble.instance = this;
  }
  postMessage(message: Request) {
    this.messages.push(message);
  }
  terminate() {}
  receive(data: Response) {
    act(() => this.onmessage?.({ data }));
  }
}
beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal('Worker', WorkerDouble);
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});
const latestEvaluation = () =>
  WorkerDouble.instance.messages.filter((m) => m.type === 'evaluate').at(-1)!;
const evaluate = (id: number, scenario = defaultScenario()) =>
  WorkerDouble.instance.receive({ type: 'evaluated', id, result: evaluateScenario(scenario) });

it('cancela la serie al editar y descarta respuestas y errores anteriores fuera de orden', async () => {
  const scenario = defaultScenario();
  const { result, rerender } = renderHook(({ s }) => useEngine(s), {
    initialProps: { s: scenario },
  });
  act(() => vi.advanceTimersByTime(300));
  const first = latestEvaluation().id;
  evaluate(first, scenario);
  expect(
    WorkerDouble.instance.messages.some((m) => m.type === 'revenue-stress' && m.id === first),
  ).toBe(true);
  const changed = { ...scenario, operation: { ...scenario.operation, boardings: 500 } };
  rerender({ s: changed });
  expect(result.current.status).toBe('calculating');
  expect(result.current.revenuePoints).toBeNull();
  expect(
    WorkerDouble.instance.messages.some((m) => m.type === 'cancel-revenue-stress' && m.id > first),
  ).toBe(true);
  WorkerDouble.instance.receive({ type: 'revenue-stress', id: first, points: [] });
  WorkerDouble.instance.receive({
    type: 'error',
    operation: 'revenue-stress',
    id: first,
    error: 'Obsoleto',
  });
  expect(result.current.revenuePoints).toBeNull();
  expect(result.current.revenueError).toBe('');
  act(() => vi.advanceTimersByTime(300));
  const second = latestEvaluation().id;
  evaluate(second, changed);
  vi.useRealTimers();
  const points = (await revenueStress(changed))!;
  WorkerDouble.instance.receive({ type: 'revenue-stress', id: second, points });
  WorkerDouble.instance.receive({ type: 'revenue-stress', id: first, points: [] });
  evaluate(first, scenario);
  expect(result.current.revenuePoints).toEqual(points);
  expect(result.current.result?.scenario.operation.boardings).toBe(500);
  expect(result.current.status).toBe('ready');
});

it('invalidez conserva el presupuesto anterior y retira exploración, con cancelación', () => {
  const scenario = defaultScenario();
  const { result, rerender } = renderHook(({ s }) => useEngine(s), {
    initialProps: { s: scenario },
  });
  act(() => vi.advanceTimersByTime(300));
  const id = latestEvaluation().id;
  evaluate(id, scenario);
  WorkerDouble.instance.receive({ type: 'revenue-stress', id, points: [] });
  rerender({ s: { ...scenario, operation: { ...scenario.operation, fare: -1 } } });
  expect(result.current.status).toBe('invalid');
  expect(result.current.result?.scenario).toEqual(scenario);
  expect(result.current.revenuePoints).toBeNull();
  WorkerDouble.instance.receive({ type: 'revenue-stress', id, points: [] });
  expect(result.current.revenuePoints).toBeNull();
});
