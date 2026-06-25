import { Navigate, Route, Routes } from 'react-router-dom';
import ScrollToTop from '@/components/ScrollToTop';
import MainLayout from '@/layouts/MainLayout';
import DetailLayout from '@/layouts/DetailLayout';
import HomePage from '@/pages/HomePage';
import StandingsPage from '@/pages/StandingsPage';
import StatsPage from '@/pages/StatsPage';
import HistoryPage from '@/pages/HistoryPage';
import MatchDetailPage from '@/pages/MatchDetailPage';
import TeamDetailPage from '@/pages/TeamDetailPage';
import PlayerDetailPage from '@/pages/PlayerDetailPage';

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/standings" element={<StandingsPage />} />
        <Route path="/stats" element={<StatsPage />} />
        <Route path="/history" element={<HistoryPage />} />
      </Route>

      <Route element={<DetailLayout />}>
        <Route path="/match/:matchId" element={<MatchDetailPage />} />
        <Route path="/team/:teamId" element={<TeamDetailPage />} />
        <Route path="/player/:playerId" element={<PlayerDetailPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
