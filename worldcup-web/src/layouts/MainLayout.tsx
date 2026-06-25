import Footer from '@/components/Footer';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import TopNav from '@/components/TopNav';
import BottomNav, { APP_TABS } from '@/components/BottomNav';

const pageTitles: Record<string, string> = {
  home: '赛程',
  standings: '积分榜',
  stats: '数据榜',
  history: '历史数据',
};

function tabFromPath(pathname: string): string {
  if (pathname.startsWith('/standings')) return 'standings';
  if (pathname.startsWith('/stats')) return 'stats';
  if (pathname.startsWith('/history')) return 'history';
  return 'home';
}

export default function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const activeTab = tabFromPath(location.pathname);

  return (
    <div className="relative isolate min-h-screen bg-[var(--bg)]">
      <div className="pointer-events-none fixed inset-0 sb-grid-bg opacity-60" />
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[var(--accent-glow)] rounded-full blur-[120px] opacity-40" />

      <TopNav
        title={pageTitles[activeTab] ?? '赛程'}
        activeTab={activeTab}
        onTabChange={(tab) => {
          const target = APP_TABS.find((t) => t.id === tab);
          if (target) navigate(target.path);
        }}
      />

      <main className="relative pt-[calc(6.75rem+env(safe-area-inset-top))] pb-[calc(5.25rem+env(safe-area-inset-bottom))]">
        <Outlet />
        <Footer />
      </main>

      <BottomNav
        activeTab={activeTab}
        onTabChange={(tab) => {
          const target = APP_TABS.find((t) => t.id === tab);
          if (target) navigate(target.path);
        }}
      />
    </div>
  );
}
