import { useEffect, useId, type ReactNode } from 'react';
import { X } from 'lucide-react';

interface FilterSheetProps {
  open: boolean;
  title: string;
  onClose: () => void;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  children: ReactNode;
}

export default function FilterSheet({
  open,
  title,
  onClose,
  searchPlaceholder,
  searchValue,
  onSearchChange,
  children,
}: FilterSheetProps) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex flex-col justify-end" role="presentation">
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
        aria-label="关闭筛选"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative mx-auto w-full max-w-lg rounded-t-2xl border shadow-2xl flex flex-col max-h-[min(78vh,640px)]"
        style={{
          backgroundColor: 'var(--surface-elevated)',
          borderColor: 'var(--border-strong)',
        }}
      >
        <div
          className="flex items-center justify-between px-4 py-3 border-b flex-shrink-0"
          style={{ borderColor: 'var(--border)' }}
        >
          <h2 id={titleId} className="text-sm font-semibold text-[var(--text)]">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 -mr-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-white/5 active:scale-95 transition-all"
            aria-label="关闭"
          >
            <X size={18} />
          </button>
        </div>

        {onSearchChange != null && (
          <div className="px-4 py-3 flex-shrink-0 border-b" style={{ borderColor: 'var(--border)' }}>
            <input
              type="search"
              value={searchValue ?? ''}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder ?? '搜索'}
              className="w-full rounded-lg border px-3 py-2.5 text-sm text-[var(--text)] placeholder:text-[var(--text-faint)] outline-none focus:border-[var(--accent)] transition-colors"
              style={{
                backgroundColor: 'var(--surface)',
                borderColor: 'var(--border)',
              }}
            />
          </div>
        )}

        <div className="overflow-y-auto overscroll-contain px-2 py-2 hide-scrollbar flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}

interface FilterSheetOptionProps {
  selected: boolean;
  onSelect: () => void;
  children: ReactNode;
  subtitle?: string;
}

export function FilterSheetOption({ selected, onSelect, children, subtitle }: FilterSheetOptionProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-colors active:scale-[0.99] ${
        selected ? 'bg-[var(--accent-muted)]' : 'hover:bg-white/[0.04]'
      }`}
    >
      <div
        className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
          selected ? 'border-[var(--accent)]' : 'border-[var(--text-faint)]'
        }`}
      >
        {selected && <span className="w-2 h-2 rounded-full bg-[var(--accent)]" />}
      </div>
      <div className="min-w-0 flex-1">
        <div className={`text-sm truncate ${selected ? 'font-semibold text-[var(--text)]' : 'text-[var(--text)]'}`}>
          {children}
        </div>
        {subtitle && <p className="text-[11px] text-[var(--text-muted)] mt-0.5 truncate">{subtitle}</p>}
      </div>
    </button>
  );
}
