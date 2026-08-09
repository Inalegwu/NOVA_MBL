import * as String from 'effect/String';
import { cache } from 'react';
import { PixelRatio, Platform } from 'react-native';
import { ANDROID_SCALE_LIMIT, SCALE } from './constants';

export const normalize = (size: number) =>
  Platform.OS === 'ios'
    ? Math.round(PixelRatio.roundToNearestPixel(size * SCALE))
    : Math.round(PixelRatio.roundToNearestPixel(size * SCALE)) -
      ANDROID_SCALE_LIMIT;

export const capitalize = (word: string) => String.capitalize(word);

export const naturalCompare = cache((a: string, b: string): number => {
  const chunk = (s: string) => s.match(/\d+|\D+/g) ?? [];
  const ca = chunk(a);
  const cb = chunk(b);
  for (let i = 0; i < Math.max(ca.length, cb.length); i++) {
    const x = ca[i] ?? '';
    const y = cb[i] ?? '';
    const nx = Number(x);
    const ny = Number(y);
    if (!Number.isNaN(nx) && !Number.isNaN(ny)) {
      if (nx !== ny) return nx - ny;
    } else if (x !== y) {
      return x < y ? -1 : 1;
    }
  }
  return 0;
});

// naive filename -> series/title parse, e.g.
// "something_machine_015_undertow_pt2.cbz" -> { series: "Something Machine", title: "015 — Undertow Pt2" }
export function parseFilename(filename: string): {
  series: string;
  title: string;
} {
  const base = filename.replace(/\.(cbz|cbr|zip)$/i, '');
  const match = base.match(/^(.*?)[_\-\s]+(\d{2,4})(?:[_\-\s]+(.*))?$/);

  const titleCase = (s: string) =>
    s
      .replace(/[_-]+/g, ' ')
      .trim()
      .replace(/\w\S*/g, (w) => w[0]?.toUpperCase() + w.slice(1).toLowerCase());

  if (!match) return { series: titleCase(base), title: base };

  const [, rawSeries, num, rest] = match;
  const series = titleCase(rawSeries ?? '');
  const title = rest ? `${num} — ${titleCase(rest)}` : num;
  return { series, title: title ?? '' };
}

export const SUPPORTED_EXT = /\.(cbz|cbr|zip)$/i;

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 MB';
  const mb = bytes / (1024 * 1024);
  return mb >= 1024 ? `${(mb / 1024).toFixed(1)} GB` : `${Math.round(mb)} MB`;
}

export function statusTagStyle(status: ItemStatus) {
  if (status === 'extracting')
    return { color: '#ff4d1c', borderColor: '#ff4d1c' };
  if (status === 'done') return { color: '#3fae6b', borderColor: '#3fae6b' };
  if (status === 'error') return { color: '#e04a4a', borderColor: '#e04a4a' };
  return {};
}

export function statusLabel(status: ItemStatus): string {
  switch (status) {
    case 'queued':
      return 'Queued';
    case 'extracting':
      return 'Extracting';
    case 'done':
      return 'Done';
    case 'error':
      return 'Error';
  }
}
