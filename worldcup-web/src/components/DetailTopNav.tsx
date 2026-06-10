import { ChevronLeft } from 'lucide-react';

interface DetailTopNavProps {
  title: string;
  subtitle?: string;
  onBack: () => void;
}

export default function DetailTopNav({ title, subtitle, onBack }: DetailTopNavProps) {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-[9998] border-b"
      style={{
        backgroundColor: 'rgba(10, 10, 10, 0.96)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderColor: 'var(--border)',
        paddingTop: 'env(safe-area-inset-top)',
      }}
    >
      <div className="flex h-14 items-center gap-2 px-2">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center justify-center w-10 h-10 rounded-lg text-[var(--text)] active:scale-[0.97] transition-transform"
          aria-label="返回"
        >
          <ChevronLeft size={22} strokeWidth={2} />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="text-sm font-semibold text-[var(--text)] leading-tight truncate">{title}</h1>
          {subtitle && (
            <p className="text-[10px] text-[var(--text-muted)] truncate">{subtitle}</p>
          )}
        </div>
        <span className="sb-badge-accent flex-shrink-0 mr-1">非官方</span>
      </div>
    </header>
  );
}
