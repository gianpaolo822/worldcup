import { APP_TABS } from '@/components/BottomNav';

interface TopNavProps {
  title: string;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const subtitles: Record<string, string> = {
  home: '2026 美加墨世界杯',
  standings: '小组排名 · 晋级区',
  history: '历届冠军 · 射手榜',
};

export default function TopNav({ title, activeTab, onTabChange }: TopNavProps) {
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
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 border"
            style={{
              background: 'var(--accent-muted)',
              borderColor: 'rgba(62, 207, 142, 0.2)',
            }}
          >
            <span className="text-sm">⚽</span>
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-semibold text-[var(--text)] leading-tight truncate">{title}</h1>
            <p className="text-[10px] text-[var(--text-muted)] truncate">
              {subtitles[activeTab] ?? '观赛指南'}
            </p>
          </div>
        </div>

        <span className="sb-badge-accent flex-shrink-0">非官方</span>
      </div>

      <div
        className="grid grid-cols-3 gap-1 px-3 pb-2 border-t"
        style={{ borderColor: 'var(--border)' }}
        role="tablist"
        aria-label="页面切换"
      >
        {APP_TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-all active:scale-[0.98] ${
                isActive ? 'text-[#0a0a0a]' : 'text-[var(--text-muted)]'
              }`}
              style={isActive ? { backgroundColor: 'var(--accent)' } : undefined}
            >
              <Icon size={14} strokeWidth={isActive ? 2.5 : 1.75} />
              {tab.label}
            </button>
          );
        })}
      </div>
    </header>
  );
}
