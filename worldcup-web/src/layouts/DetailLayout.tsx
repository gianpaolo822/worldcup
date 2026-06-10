import { Outlet } from 'react-router-dom';

export default function DetailLayout() {
  return (
    <div className="min-h-screen bg-[var(--bg)] relative">
      <div className="pointer-events-none fixed inset-0 sb-grid-bg opacity-60" />
      <Outlet />
    </div>
  );
}
