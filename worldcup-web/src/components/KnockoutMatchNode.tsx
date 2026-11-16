import type { Match } from '@/types';
import { formatKnockoutTime, isPlaceholderTeam, matchStatusLabel } from '@/lib/knockout';
import { formatMatchScoreSecondary, getMatchWinnerId } from '@/lib/matchDisplay';

interface KnockoutMatchNodeProps {
  match: Match;
  /** 晋级目标场次：已完赛且晋级到该场时高亮「晋级」 */
  advancementTarget?: Match;
}

function TeamLine({
  match,
  team,
  score,
  emphasized,
}: {
  match: Match;
  team: Match['homeTeam'];
  score: number | null;
  emphasized?: boolean;
}) {
  const pending = isPlaceholderTeam(team);
  const winnerId = getMatchWinnerId(match);
  const isWinner = !pending && match.status === 'finished' && winnerId === team.id;

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
        className={`text-xs truncate flex-1 ${
          pending
            ? 'text-[var(--text-faint)]'
            : isWinner || emphasized
              ? 'text-[var(--accent)] font-semibold'
              : 'text-[var(--text)]'
        }`}
      >
        {pending ? '待定' : team.name}
      </span>
      {isWinner ? (
        <span className="text-[9px] text-[var(--accent)] font-semibold flex-shrink-0">晋级</span>
      ) : null}
      {score != null && (
        <span className="text-xs font-semibold tabular-nums text-[var(--text)]">{score}</span>
      )}
    </div>
  );
}

function slotEmphasized(
  match: Match,
  team: Match['homeTeam'],
  advancementTarget: Match | undefined,
): boolean {
  if (!advancementTarget || match.status !== 'finished') return false;
  const winnerId = getMatchWinnerId(match);
  if (!winnerId || winnerId !== team.id) return false;
  return (
    advancementTarget.homeTeam.id === winnerId || advancementTarget.awayTeam.id === winnerId
  );
}

export default function KnockoutMatchNode({ match, advancementTarget }: KnockoutMatchNodeProps) {
  const finished = match.status === 'finished';
  const live = match.status === 'live';
  const secondary = finished ? formatMatchScoreSecondary(match) : null;

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
      {finished && match.homeScore != null && match.awayScore != null ? (
        <div className="flex items-center justify-center gap-1 mb-2 tabular-nums">
          <span className="text-sm font-bold text-[var(--text)]">{match.homeScore}</span>
          <span className="text-[10px] text-[var(--text-faint)]">:</span>
          <span className="text-sm font-bold text-[var(--text)]">{match.awayScore}</span>
        </div>
      ) : null}
      {secondary ? (
        <p className="text-[9px] text-center text-[var(--text-muted)] mb-2 font-medium tabular-nums">
          {secondary}
        </p>
      ) : null}
      <div className="space-y-1.5">
        <TeamLine
          match={match}
          team={match.homeTeam}
          score={null}
          emphasized={slotEmphasized(match, match.homeTeam, advancementTarget)}
        />
        <TeamLine
          match={match}
          team={match.awayTeam}
          score={null}
          emphasized={slotEmphasized(match, match.awayTeam, advancementTarget)}
        />
      </div>
    </div>
  );
}
