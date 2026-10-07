import type { FeatureCollection, LineString } from 'geojson';
import type { Result } from './schema';
export const distanceKm = (a: number[], b: number[]) => {
  const rad = Math.PI / 180;
  const x =
    Math.sin(((b[1]! - a[1]!) * rad) / 2) ** 2 +
    Math.cos(a[1]! * rad) * Math.cos(b[1]! * rad) * Math.sin(((b[0]! - a[0]!) * rad) / 2) ** 2;
  return 6371.0088 * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(Math.max(0, 1 - x)));
};
export function traceSegments(fc: FeatureCollection<LineString>) {
  let offset = 0;
  return fc.features.flatMap((f, trace) =>
    f.geometry.coordinates.slice(1).map((end, i) => {
      const start = f.geometry.coordinates[i]!;
      const length = distanceKm(start, end);
      const segment = { start, end, from: offset, to: offset + length, trace: trace + 1 };
      offset += length;
      return segment;
    }),
  );
}
export function positionOnTrace(fc: FeatureCollection<LineString>, fraction: number) {
  const segments = traceSegments(fc);
  const total = segments.at(-1)?.to ?? 0;
  const target = Math.max(0, Math.min(1, fraction)) * total;
  const segment = segments.find((s) => s.to >= target) ?? segments.at(-1);
  if (!segment) return null;
  const t = (target - segment.from) / (segment.to - segment.from || 1);
  return {
    coordinates: [
      segment.start[0]! + (segment.end[0]! - segment.start[0]!) * t,
      segment.start[1]! + (segment.end[1]! - segment.start[1]!) * t,
    ],
    trace: segment.trace,
    total,
  };
}
export function nearestFraction(fc: FeatureCollection<LineString>, point: number[]) {
  const segments = traceSegments(fc);
  let best = Infinity,
    offset = 0;
  for (const s of segments) {
    const cos = Math.cos((point[1]! * Math.PI) / 180);
    const dx = (s.end[0]! - s.start[0]!) * cos,
      dy = s.end[1]! - s.start[1]!;
    const t = Math.max(
      0,
      Math.min(
        1,
        ((point[0]! - s.start[0]!) * cos * dx + (point[1]! - s.start[1]!) * dy) /
          (dx * dx + dy * dy || 1),
      ),
    );
    const p = [s.start[0]! + (s.end[0]! - s.start[0]!) * t, s.start[1]! + dy * t];
    const d = distanceKm(p, point);
    if (d < best) {
      best = d;
      offset = s.from + (s.to - s.from) * t;
    }
  }
  return offset / (segments.at(-1)?.to || 1);
}
export function consumptionAt(r: Result, cycle: number, fraction: number) {
  const cycles = Math.max(1, Math.min(r.scenario.operation.cycles, cycle));
  const km =
    r.scenario.route.cycleKm *
    (cycles - 1 + Math.max(0, Math.min(1, fraction))) *
    (1 + r.scenario.operation.emptyRatio);
  const kwh = km * r.scenario.ev.consumption;
  const soc = r.scenario.energy.socMax - kwh / (r.scenario.ev.batteryKwh * r.scenario.energy.soh);
  return { km, kwh, soc };
}
