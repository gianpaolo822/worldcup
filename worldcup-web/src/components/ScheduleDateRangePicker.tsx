import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import FilterSheet from '@/components/FilterSheet';
import {
  addMonths,
  formatScheduleDateRange,
  getBeijingDateKey,
  getFullScheduleDateRange,
  getMonthGrid,
  normalizeDateRange,
  parseDateKey,
  scheduleDateSet,
  scheduleMonthBounds,
  type ScheduleDateRange,
} from '@/lib/scheduleDate';

interface ScheduleDateRangePickerProps {
  open: boolean;
  value: ScheduleDateRange;
  onClose: () => void;
  onChange: (range: ScheduleDateRange) => void;
}

const WEEKDAYS = ['一', '二', '三', '四', '五', '六', '日'];

function monthLabel(year: number, month: number): string {
  return `${year}年${month}月`;
}

function canGoPrev(year: number, month: number): boolean {
  const { minYear, minMonth } = scheduleMonthBounds;
  return year > minYear || (year === minYear && month > minMonth);
}

function canGoNext(year: number, month: number): boolean {
  const { maxYear, maxMonth } = scheduleMonthBounds;
  return year < maxYear || (year === maxYear && month < maxMonth);
}

export default function ScheduleDateRangePicker({
  open,
  value,
  onClose,
  onChange,
}: ScheduleDateRangePickerProps) {
  const initialMonth = parseDateKey(value.start);
  const [viewYear, setViewYear] = useState(initialMonth.year);
  const [viewMonth, setViewMonth] = useState(initialMonth.month);
  const [draftRange, setDraftRange] = useState<ScheduleDateRange>(value);
  const [anchorKey, setAnchorKey] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const month = parseDateKey(value.start);
    setViewYear(month.year);
    setViewMonth(month.month);
    setDraftRange(value);
    setAnchorKey(null);
  }, [open, value]);

  const monthCells = useMemo(() => getMonthGrid(viewYear, viewMonth), [viewYear, viewMonth]);

  const handleDayClick = (dateKey: string) => {
    if (!anchorKey) {
      setAnchorKey(dateKey);
      setDraftRange({ start: dateKey, end: dateKey });
      return;
    }

    const next = normalizeDateRange(anchorKey, dateKey);
    setDraftRange(next);
    setAnchorKey(null);
  };

  const applyRange = (range: ScheduleDateRange) => {
    onChange(range);
    onClose();
  };

  const isInDraftRange = (dateKey: string) =>
    dateKey >= draftRange.start && dateKey <= draftRange.end;

  const isRangeEdge = (dateKey: string) =>
    dateKey === draftRange.start || dateKey === draftRange.end;

  return (
    <FilterSheet open={open} title="选择日期区间" onClose={onClose}>
      <div className="px-2 pb-2 space-y-3">
        <div className="flex flex-wrap gap-2 px-1">
          <button
            type="button"
            onClick={() => {
              const today = getBeijingDateKey();
              setDraftRange({ start: today, end: today });
              setAnchorKey(null);
              const month = parseDateKey(today);
              setViewYear(month.year);
              setViewMonth(month.month);
            }}
            className="sb-badge active:scale-95 transition-transform"
          >
            今天
          </button>
          <button
            type="button"
            onClick={() => {
              const full = getFullScheduleDateRange();
              setDraftRange(full);
              setAnchorKey(null);
              const month = parseDateKey(full.start);
              setViewYear(month.year);
              setViewMonth(month.month);
            }}
            className="sb-badge active:scale-95 transition-transform"
          >
            全部赛程
          </button>
        </div>

        <div
          className="rounded-xl border p-3"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              disabled={!canGoPrev(viewYear, viewMonth)}
              onClick={() => {
                const next = addMonths(viewYear, viewMonth, -1);
                setViewYear(next.year);
                setViewMonth(next.month);
              }}
              className="p-2 rounded-lg text-[var(--text-muted)] disabled:opacity-30 hover:bg-white/5 active:scale-95 transition-all"
              aria-label="上一月"
            >
              <ChevronLeft size={18} />
            </button>
            <p className="text-sm font-semibold text-[var(--text)]">{monthLabel(viewYear, viewMonth)}</p>
            <button
              type="button"
              disabled={!canGoNext(viewYear, viewMonth)}
              onClick={() => {
                const next = addMonths(viewYear, viewMonth, 1);
                setViewYear(next.year);
                setViewMonth(next.month);
              }}
              className="p-2 rounded-lg text-[var(--text-muted)] disabled:opacity-30 hover:bg-white/5 active:scale-95 transition-all"
              aria-label="下一月"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-1">
            {WEEKDAYS.map((day) => (
              <div key={day} className="text-center text-[10px] text-[var(--text-faint)] py-1">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {monthCells.map(({ dateKey, inMonth }) => {
              const hasMatches = scheduleDateSet.has(dateKey);
              const selected = isInDraftRange(dateKey);
              const edge = isRangeEdge(dateKey);
              const today = getBeijingDateKey();
              const isToday = dateKey === today;
              const { day } = parseDateKey(dateKey);

              return (
                <button
                  key={dateKey}
                  type="button"
                  disabled={!inMonth}
                  onClick={() => inMonth && handleDayClick(dateKey)}
                  className={`relative aspect-square rounded-lg text-xs font-medium transition-colors active:scale-95 ${
                    !inMonth
                      ? 'opacity-0 pointer-events-none'
                      : selected
                        ? edge
                          ? 'bg-[var(--accent)] text-black'
                          : 'bg-[var(--accent-muted)] text-[var(--text)]'
                        : isToday
                          ? 'border border-[var(--accent)] text-[var(--text)] hover:bg-white/[0.04]'
                          : 'text-[var(--text)] hover:bg-white/[0.04]'
                  }`}
                >
                  {inMonth ? day : ''}
                  {inMonth && hasMatches && !selected && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[var(--accent)]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <p className="px-1 text-[11px] text-[var(--text-muted)] leading-relaxed">
          {anchorKey
            ? '请选择结束日期，完成区间选择'
            : '点击选择起始日期，再点击选择结束日期；单击两次同一天即为单日筛选'}
        </p>

        <div
          className="mx-1 rounded-lg border px-3 py-2.5 flex items-center justify-between gap-3"
          style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}
        >
          <div className="min-w-0">
            <p className="sb-label normal-case mb-0.5">已选区间</p>
            <p className="text-xs font-semibold text-[var(--text)] truncate">
              {formatScheduleDateRange(draftRange)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => applyRange(draftRange)}
            className="flex-shrink-0 px-4 py-2 rounded-lg text-xs font-semibold bg-[var(--accent)] text-black active:scale-95 transition-transform"
          >
            确定
          </button>
        </div>
      </div>
    </FilterSheet>
  );
}

export function isFullScheduleRange(range: ScheduleDateRange): boolean {
  const full = getFullScheduleDateRange();
  return range.start === full.start && range.end === full.end;
}
