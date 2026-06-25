import type { Match } from '@/types';
import { formatKnockoutTime, isPlaceholderTeam, matchStatusLabel } from '@/lib/knockout';

interface KnockoutMatchNodeProps {
  match: Match;
}

function TeamLine({ team, score }: { team: Match['homeTeam']; score: number | null }) {
  const pending = isPlaceholderTeam(team);
  return (
    <div className="flex items-center gap-2 min-h-[28px]">
      {pending ? (
        <span
          className="w-5 h-5 rounded-full flex-shrink-0 border"
          style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface-elevated)' }}
        />
      ) : (
        <span className="text-base leading-none flex-shrink-0">{team.flag}</span>
      )}
      <span
        className={`text-xs truncate flex-1 ${pending ? 'text-[var(--text-faint)]' : 'text-[var(--text)]'}`}
      >
        {pending ? '待定' : team.name}
      </span>
      {score != null && (
        <span className="text-xs font-semibold tabular-nums text-[var(--text)]">{score}</span>
      )}
    </div>
  );
}

export default function KnockoutMatchNode({ match }: KnockoutMatchNodeProps) {
  const finished = match.status === 'finished';
  const live = match.status === 'live';

  return (
    <div
      className="rounded-lg border p-2.5 min-w-[148px] max-w-[168px]"
      style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b" style={{ borderColor: 'var(--border)' }}>
        <span className="text-[10px] text-[var(--text-muted)] tabular-nums">{formatKnockoutTime(match)}</span>
        <span
          className={`text-[10px] font-medium ${live ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'}`}
        >
          {matchStatusLabel(match.status)}
        </span>
      </div>
      <div className="space-y-1.5">
        <TeamLine team={match.homeTeam} score={finished ? match.homeScore : null} />
        <TeamLine team={match.awayTeam} score={finished ? match.awayScore : null} />
      </div>
    </div>
  );
}
