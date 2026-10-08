import { useEffect, useRef, useState } from 'react';

type Stop = '' | 'reserve' | 'end';
/** Progreso visual: el tiempo no representa velocidad, despacho o duración de servicio. */
export function advancePlayback(
  progress: number,
  max: number,
  elapsedMs: number,
  speed: number,
  limit: number | null,
  accepted: boolean,
) {
  const next = Math.min(max, progress + ((Math.max(0, elapsedMs) * max) / 60_000) * speed);
  if (!accepted && limit !== null && limit < max - 1e-9 && progress <= limit && next >= limit)
    return { progress: limit, stop: 'reserve' as Stop };
  return { progress: next, stop: (next >= max ? 'end' : '') as Stop };
}
export function usePlayback({
  progress,
  max,
  limit,
  enabled,
  pauseKey,
  onProgress,
}: {
  progress: number;
  max: number;
  limit: number | null;
  enabled: boolean;
  pauseKey: string;
  onProgress: (value: number) => void;
}) {
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [stop, setStop] = useState<Stop>('');
  const accepted = useRef(false);
  const current = useRef({ progress, max, limit, enabled, pauseKey, onProgress });
  current.current = { progress, max, limit, enabled, pauseKey, onProgress };
  const pause = () => {
    setPlaying(false);
    setStop('');
  };
  const manual = () => {
    pause();
    accepted.current = false;
  };
  const reset = () => {
    manual();
    onProgress(0);
  };
  const play = () => {
    if (!enabled || progress >= max) return;
    if (limit !== null && limit < max - 1e-9 && progress >= limit && !accepted.current) {
      setStop('reserve');
      return;
    }
    setStop('');
    setPlaying(true);
  };
  const continueAfterReserve = () => {
    accepted.current = true;
    setStop('');
    if (enabled && progress < max) setPlaying(true);
  };
  useEffect(() => {
    setPlaying(false);
    setStop('');
    accepted.current = false;
  }, [enabled, pauseKey]);
  useEffect(() => {
    const hidden = () => {
      if (document.hidden) setPlaying(false);
    };
    document.addEventListener('visibilitychange', hidden);
    return () => document.removeEventListener('visibilitychange', hidden);
  }, []);
  useEffect(() => {
    if (!playing) return;
    let frame = 0;
    let last: number | null = null;
    let visual = current.current.progress;
    const key = current.current.pauseKey;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const tick = (time: number) => {
      const value = current.current;
      if (!value.enabled || value.pauseKey !== key || document.hidden) {
        setPlaying(false);
        return;
      }
      if (last === null) last = time;
      const elapsed = time - last;
      if (!reduced.matches || elapsed >= 1000) {
        last = time;
        const next = advancePlayback(
          visual,
          value.max,
          elapsed,
          speed,
          value.limit,
          accepted.current,
        );
        visual = next.progress;
        value.onProgress(visual);
        if (next.stop) {
          setStop(next.stop);
          setPlaying(false);
          return;
        }
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing, speed]);
  return { playing, speed, setSpeed, stop, pause, manual, reset, play, continueAfterReserve };
}
