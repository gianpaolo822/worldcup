import { createPortal } from 'react-dom';
import { CalendarDays, History, Trophy } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const APP_TABS = [
  { id: 'home', label: '赛程', icon: CalendarDays, path: '/' },
  { id: 'standings', label: '积分榜', icon: Trophy, path: '/standings' },
  { id: 'history', label: '历史', icon: History, path: '/history' },
] as const;

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const nav = (
    <nav
      className="fixed bottom-0 left-0 right-0 z-[9999] border-t-2 shadow-[0_-12px_40px_rgba(0,0,0,0.55)]"
      style={{
        backgroundColor: 'rgba(10, 10, 10, 0.98)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderColor: 'var(--accent)',
        paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))',
      }}
      aria-label="主导航"
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-around px-2 pt-2 pb-1">
        {APP_TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`relative flex min-h-[58px] flex-1 flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 transition-all duration-200 active:scale-[0.97] select-none ${
                isActive ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'
              }`}
              style={isActive ? { backgroundColor: 'var(--accent-muted)' } : undefined}
            >
              <Icon size={24} strokeWidth={isActive ? 2.5 : 1.75} />
              <span className={`text-xs font-semibold ${isActive ? 'text-[var(--text)]' : ''}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );

  return createPortal(nav, document.body);
}
