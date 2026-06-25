import { formatScheduleDate, scheduleDates } from '@/lib/data';

export type ScheduleDateRange = {
  start: string;
  end: string;
};

const BEIJING_TZ = 'Asia/Shanghai';

/** 北京时间 YYYY-MM-DD */
export function getBeijingDateKey(date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: BEIJING_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

export function compareDateKeys(a: string, b: string): number {
  return a.localeCompare(b);
}

export function normalizeDateRange(start: string, end: string): ScheduleDateRange {
  return compareDateKeys(start, end) <= 0 ? { start, end } : { start: end, end: start };
}

export function isDateKeyInRange(dateKey: string, range: ScheduleDateRange): boolean {
  return dateKey >= range.start && dateKey <= range.end;
}

export function getDefaultScheduleDateRange(): ScheduleDateRange {
  const today = getBeijingDateKey();
  return { start: today, end: today };
}

export function getFullScheduleDateRange(): ScheduleDateRange {
  const first = scheduleDates[0];
  const last = scheduleDates[scheduleDates.length - 1];
  return { start: first, end: last };
}

export function formatScheduleDateRange(range: ScheduleDateRange): string {
  if (range.start === range.end) return formatScheduleDate(range.start);
  return `${formatScheduleDate(range.start)} – ${formatScheduleDate(range.end)}`;
}

export function parseDateKey(dateKey: string): { year: number; month: number; day: number } {
  const [year, month, day] = dateKey.split('-').map(Number);
  return { year, month, day };
}

export function toDateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function addMonths(year: number, month: number, delta: number): { year: number; month: number } {
  const date = new Date(year, month - 1 + delta, 1);
  return { year: date.getFullYear(), month: date.getMonth() + 1 };
}

export function getMonthGrid(year: number, month: number): Array<{ dateKey: string; inMonth: boolean }> {
  const firstDay = new Date(year, month - 1, 1);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month, 0).getDate();
  const cells: Array<{ dateKey: string; inMonth: boolean }> = [];

  for (let i = 0; i < startOffset; i += 1) {
    const date = new Date(year, month - 1, -startOffset + i + 1);
    cells.push({
      dateKey: toDateKey(date.getFullYear(), date.getMonth() + 1, date.getDate()),
      inMonth: false,
    });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({ dateKey: toDateKey(year, month, day), inMonth: true });
  }

  while (cells.length % 7 !== 0) {
    const last = parseDateKey(cells[cells.length - 1].dateKey);
    const date = new Date(last.year, last.month - 1, last.day + 1);
    cells.push({
      dateKey: toDateKey(date.getFullYear(), date.getMonth() + 1, date.getDate()),
      inMonth: false,
    });
  }

  return cells;
}

export const scheduleDateSet = new Set(scheduleDates);

export const scheduleMonthBounds = (() => {
  const first = parseDateKey(scheduleDates[0]);
  const last = parseDateKey(scheduleDates[scheduleDates.length - 1]);
  return { minYear: first.year, minMonth: first.month, maxYear: last.year, maxMonth: last.month };
})();
