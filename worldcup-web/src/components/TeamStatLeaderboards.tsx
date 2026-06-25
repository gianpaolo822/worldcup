import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  computeTeamTournamentStats,
  finishedTeamMatchesWithEvents,
  formatStatValue,
  statCategoryLabel,
  statValueColor,
  STAT_CATEGORIES,
  type StatCategory,
  type TournamentStatRow,
} from '@/lib/tournamentStats';
import { getPlayerById } from '@/lib/data';

function StatBoard({
  category,
  rows,
  returnTo,
}: {
  category: StatCategory;
  rows: TournamentStatRow[];
  returnTo: string;
}) {
  return (
    <div className="sb-card overflow-hidden">
      <div
        className="px-3 py-2 text-[10px] font-semibold text-[var(--text-muted)] border-b"
        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface-elevated)' }}
      >
        {statCategoryLabel(category)}榜
      </div>
      {rows.length === 0 ? (
        <p className="px-3 py-4 text-xs text-[var(--text-muted)] text-center">暂无{statCategoryLabel(category)}</p>
      ) : (
        <ul>
          {rows.map((row, index) => {
            const player = getPlayerById(row.playerId);
            return (
              <li
                key={`${row.playerId}-${category}`}
                className="border-b last:border-b-0"
                style={{ borderColor: 'var(--border)' }}
              >
                <Link
                  to={`/player/${row.playerId}`}
                  state={{ returnTo }}
                  className="grid grid-cols-[1.25rem_minmax(0,1fr)_2.25rem] items-center gap-x-2 px-3 py-2.5 active:bg-white/[0.03] transition-colors"
                >
                  <span className="text-center text-[11px] font-bold tabular-nums text-[var(--text-faint)]" aria-hidden>
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[var(--text)] truncate">
                      {player?.number != null && (
                        <span className="text-[var(--text-muted)] tabular-nums mr-1">{player.number}</span>
                      )}
                      {row.playerName}
                    </p>
                  </div>
                  <div className="whitespace-nowrap text-right leading-none">
                    {category === 'goals' && row.penaltyGoals && row.penaltyGoals > 0 ? (
                      <>
                        <span className="text-base font-bold tabular-nums" style={{ color: statValueColor(category) }}>
                          {row.value}
                        </span>
                        <span className="text-[10px] font-semibold tabular-nums text-[var(--text-muted)]">
                          （{row.penaltyGoals}）
                        </span>
                      </>
                    ) : (
                      <span
                        className="text-base font-bold tabular-nums"
                        style={{ color: statValueColor(category) }}
                      >
                        {formatStatValue(row, category)}
                      </span>
                    )}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default function TeamStatLeaderboards({
  teamId,
  returnTo,
}: {
  teamId: string;
  returnTo: string;
}) {
  const stats = useMemo(() => computeTeamTournamentStats(teamId), [teamId]);
  const matchCount = useMemo(() => finishedTeamMatchesWithEvents(teamId), [teamId]);

  return (
    <div>
      <p className="sb-label mb-2">队内数据榜</p>
      <p className="text-[11px] text-[var(--text-muted)] mb-3">
        基于本队已录入的 {matchCount} 场赛况
        <span className="block mt-0.5">乌龙不计入进球榜 · 括号内为点球进球</span>
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {STAT_CATEGORIES.map((category) => (
          <StatBoard key={category} category={category} rows={stats[category]} returnTo={returnTo} />
        ))}
      </div>
    </div>
  );
}
