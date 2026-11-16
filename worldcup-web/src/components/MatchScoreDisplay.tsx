import type { Match } from '@/types';
import type { MatchDisplay } from '@/lib/matchDisplay';
import {
  formatMatchScoreSecondary,
  getMatchWinnerId,
  isKnockoutMatch,
} from '@/lib/matchDisplay';

interface MatchScoreDisplayProps {
  match: Match;
  display: MatchDisplay;
  size?: 'sm' | 'md' | 'lg';
  showWinnerHint?: boolean;
}

const sizeClass = {
  sm: { score: 'text-xl', sep: 'text-xs', sub: 'text-[9px]' },
  md: { score: 'text-xl', sep: 'text-xs', sub: 'text-[10px]' },
  lg: { score: 'text-3xl', sep: 'text-sm', sub: 'text-xs' },
} as const;

export default function MatchScoreDisplay({
  match,
  display,
  size = 'md',
  showWinnerHint = false,
}: MatchScoreDisplayProps) {
  const cls = sizeClass[size];
  const secondary = formatMatchScoreSecondary(match);
  const winnerId = showWinnerHint ? getMatchWinnerId(match) : null;

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-1.5 tabular-nums">
        <span
          className={`${cls.score} font-semibold ${
            winnerId === match.homeTeam.id ? 'text-[var(--accent)]' : 'text-[var(--text)]'
          }`}
        >
          {display.homeScore}
        </span>
        <span className={`${cls.sep} text-[var(--text-faint)]`}>:</span>
        <span
          className={`${cls.score} font-semibold ${
            winnerId === match.awayTeam.id ? 'text-[var(--accent)]' : 'text-[var(--text)]'
          }`}
        >
          {display.awayScore}
        </span>
      </div>
      {secondary ? (
        <span className={`${cls.sub} text-[var(--text-muted)] mt-1 font-medium tabular-nums`}>
          {secondary}
        </span>
      ) : null}
    </div>
  );
}

export function MatchTeamName({
  match,
  team,
  side,
}: {
  match: Match;
  team: Match['homeTeam'];
  side: 'home' | 'away';
}) {
  const winnerId = getMatchWinnerId(match);
  const isWinner = match.status === 'finished' && isKnockoutMatch(match) && winnerId === team.id;

  return (
    <div className={`flex items-center gap-1.5 min-w-0 ${side === 'away' ? 'justify-end' : ''}`}>
      <span
        className={`text-sm font-medium truncate ${
          isWinner ? 'text-[var(--accent)]' : 'text-[var(--text)]'
        } ${side === 'away' ? 'text-right' : ''}`}
      >
        {team.name}
      </span>
      {isWinner ? (
        <span className="sb-badge-accent text-[9px] px-1.5 py-0 flex-shrink-0">晋级</span>
      ) : null}
    </div>
  );
}
