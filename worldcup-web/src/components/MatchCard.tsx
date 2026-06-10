import type { Match } from '@/types';
import { formatMatchVenue } from '@/lib/data';

interface MatchCardProps {
  match: Match;
  onClick?: () => void;
}

function statusLabel(status: Match['status']): string {
  if (status === 'live') return 'LIVE';
  if (status === 'finished') return '已结束';
  return '未开始';
}

export default function MatchCard({ match, onClick }: MatchCardProps) {
  const isLive = match.status === 'live';
  const isFinished = match.status === 'finished';

  return (
    <div
      onClick={onClick}
      className="sb-card p-4 active:scale-[0.99] transition-transform duration-200 select-none cursor-pointer hover:border-[var(--border-strong)]"
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <span className="text-xs text-[var(--text-muted)] font-medium flex-shrink-0">{match.time}</span>
        <span className="text-xs text-[var(--text-muted)] font-medium text-right truncate min-w-0">
          {formatMatchVenue(match)}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <span className="text-2xl flex-shrink-0">{match.homeTeam.flag}</span>
          <span className="text-sm font-medium text-[var(--text)] truncate">
            {match.homeTeam.name}
          </span>
        </div>

        <div className="flex flex-col items-center px-3 flex-shrink-0">
          {isFinished ? (
            <div className="flex items-center gap-1.5 tabular-nums">
              <span className="text-xl font-semibold text-[var(--text)]">{match.homeScore}</span>
              <span className="text-xs text-[var(--text-faint)]">:</span>
              <span className="text-xl font-semibold text-[var(--text)]">{match.awayScore}</span>
            </div>
          ) : (
            <span className="text-sm font-medium text-[var(--text-faint)]">VS</span>
          )}
          <span
            className={`mt-1.5 px-2 py-0.5 rounded-md text-[10px] font-semibold ${
              isLive ? 'sb-badge-live animate-pulse' : 'sb-badge'
            }`}
          >
            {statusLabel(match.status)}
          </span>
        </div>

        <div className="flex items-center gap-2.5 flex-1 justify-end min-w-0">
          <span className="text-sm font-medium text-[var(--text)] truncate text-right">
            {match.awayTeam.name}
          </span>
          <span className="text-2xl flex-shrink-0">{match.awayTeam.flag}</span>
        </div>
      </div>

      {(match.group || match.stage) && (
        <div className="flex items-center gap-1.5 mt-3 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
          {match.group && <span className="sb-badge">{match.group} 组</span>}
          {match.stage && <span className="sb-badge">{match.stage}</span>}
        </div>
      )}
    </div>
  );
}
