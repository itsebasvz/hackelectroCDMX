// @vitest-environment jsdom
import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { advancePlayback, usePlayback } from './usePlayback';

let frames: Map<number, FrameRequestCallback>;
let nextId: number;
const tick = (time: number) =>
  act(() => {
    const pending = [...frames.values()];
    frames.clear();
    pending.forEach((callback) => callback(time));
  });
beforeEach(() => {
  frames = new Map();
  nextId = 0;
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    frames.set(++nextId, callback);
    return nextId;
  });
  vi.stubGlobal('cancelAnimationFrame', (id: number) => frames.delete(id));
  vi.stubGlobal('matchMedia', () => ({ matches: false }));
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
it('avanza a ritmo visual y se detiene exactamente en la reserva o el fin', () => {
  expect(advancePlayback(0, 8000, 30000, 1, null, false)).toEqual({ progress: 4000, stop: '' });
  expect(advancePlayback(0, 8000, 30000, 4, 5200, false)).toEqual({
    progress: 5200,
    stop: 'reserve',
  });
  expect(advancePlayback(5200, 8000, 30000, 4, 5200, true)).toEqual({
    progress: 8000,
    stop: 'end',
  });
  expect(advancePlayback(0, 1000, 60000, 1, 1000, false)).toEqual({ progress: 1000, stop: 'end' });
});
it('la reserva exige continuar explícitamente y no repite el recorrido', () => {
  const onProgress = vi.fn();
  const { result } = renderHook(() =>
    usePlayback({
      progress: 0,
      max: 8000,
      limit: 3000,
      enabled: true,
      pauseKey: 'mapa',
      onProgress,
    }),
  );
  act(() => result.current.play());
  tick(0);
  tick(40000);
  expect(result.current.playing).toBe(false);
  expect(result.current.stop).toBe('reserve');
  expect(onProgress).toHaveBeenLastCalledWith(3000);
  act(() => result.current.continueAfterReserve());
  tick(40000);
  tick(100000);
  expect(result.current.stop).toBe('end');
  expect(result.current.playing).toBe(false);
  expect(onProgress).toHaveBeenLastCalledWith(8000);
});
it('cancela el fotograma al abrir un panel, invalidar entradas, pausar o desmontar', () => {
  const onProgress = vi.fn();
  const { result, rerender, unmount } = renderHook(
    ({ enabled, pauseKey }) =>
      usePlayback({ progress: 100, max: 1000, limit: null, enabled, pauseKey, onProgress }),
    { initialProps: { enabled: true, pauseKey: 'mapa' } },
  );
  act(() => result.current.play());
  tick(0);
  rerender({ enabled: true, pauseKey: 'economia' });
  tick(1000);
  expect(result.current.playing).toBe(false);
  expect(frames.size).toBe(0);
  act(() => result.current.play());
  rerender({ enabled: false, pauseKey: 'economia' });
  tick(2000);
  expect(result.current.playing).toBe(false);
  act(() => result.current.play());
  expect(result.current.playing).toBe(false);
  rerender({ enabled: true, pauseKey: 'mapa' });
  act(() => result.current.play());
  act(() => result.current.pause());
  expect(frames.size).toBe(0);
  act(() => result.current.play());
  unmount();
  expect(frames.size).toBe(0);
});
it('movimiento reducido avanza discretamente y ocultar la pestaña pausa', () => {
  vi.stubGlobal('matchMedia', () => ({ matches: true }));
  const onProgress = vi.fn();
  const { result } = renderHook(() =>
    usePlayback({
      progress: 0,
      max: 1000,
      limit: null,
      enabled: true,
      pauseKey: 'mapa',
      onProgress,
    }),
  );
  act(() => result.current.play());
  tick(0);
  tick(500);
  expect(onProgress).not.toHaveBeenCalled();
  tick(1000);
  expect(onProgress).toHaveBeenCalledTimes(1);
  vi.spyOn(document, 'hidden', 'get').mockReturnValue(true);
  act(() => document.dispatchEvent(new Event('visibilitychange')));
  expect(result.current.playing).toBe(false);
  vi.restoreAllMocks();
});
