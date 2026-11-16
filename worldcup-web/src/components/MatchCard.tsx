import type { Match } from '@/types';
import { formatMatchKickoffBeijing, formatMatchVenue } from '@/lib/data';
import { matchStatusLabelShort, resolveMatchDisplay } from '@/lib/matchDisplay';
import MatchScoreDisplay, { MatchTeamName } from '@/components/MatchScoreDisplay';
import { useNow } from '@/hooks/useNow';

interface MatchCardProps {
  match: Match;
  onClick?: () => void;
}

export default function MatchCard({ match, onClick }: MatchCardProps) {
  const now = useNow();
  const display = resolveMatchDisplay(match, now);
  const isLive = display.status === 'live';
  const isFinished = display.status === 'finished';
  const showScore = isLive || isFinished;

  return (
    <div
      onClick={onClick}
      className="sb-card p-4 active:scale-[0.99] transition-transform duration-200 select-none cursor-pointer hover:border-[var(--border-strong)]"
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <span className="text-xs text-[var(--text-muted)] font-medium flex-shrink-0">
          {formatMatchKickoffBeijing(match)}
        </span>
        <span className="text-xs text-[var(--text-muted)] font-medium text-right truncate min-w-0">
          {formatMatchVenue(match)}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <span className="text-2xl flex-shrink-0">{match.homeTeam.flag}</span>
          <MatchTeamName match={match} team={match.homeTeam} side="home" />
        </div>

        <div className="flex flex-col items-center px-3 flex-shrink-0">
          {showScore ? (
            <MatchScoreDisplay match={match} display={display} size="md" showWinnerHint />
          ) : (
            <span className="text-sm font-medium text-[var(--text-faint)]">VS</span>
          )}
          <span
            className={`mt-1.5 px-2 py-0.5 rounded-md text-[10px] font-semibold ${
              isLive ? 'sb-badge-live animate-pulse' : 'sb-badge'
            }`}
          >
            {matchStatusLabelShort(display.status)}
          </span>
        </div>

        <div className="flex items-center gap-2.5 flex-1 justify-end min-w-0">
          <MatchTeamName match={match} team={match.awayTeam} side="away" />
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
