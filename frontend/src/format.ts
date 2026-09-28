import type { Furnish, View } from './types';

export const FURNISH_LABELS: Record<Furnish, string> = {
  DESIGNER: 'DESIGNER — дизайнерская',
  BAD: 'BAD — плохая',
  LITTLE: 'LITTLE — минимальная',
};

export const VIEW_LABELS: Record<View, string> = {
  STREET: 'STREET — на улицу',
  YARD: 'YARD — во двор',
  PARK: 'PARK — на парк',
  NORMAL: 'NORMAL — обычный',
  GOOD: 'GOOD — хороший',
};

export function formatValue(value: string | number | null | undefined): string {
  return value === null || value === undefined || value === '' ? '—' : String(value);
}

export function formatBoolean(value: boolean | null | undefined): string {
  return value === null || value === undefined ? '—' : value ? 'Да' : 'Нет';
}

export function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('ru-RU');
}

export function formatNumber(value: number | null | undefined, fractionDigits = 2): string {
  if (value === null || value === undefined) {
    return '—';
  }
  return Number.isInteger(value) ? String(value) : value.toFixed(fractionDigits);
}
