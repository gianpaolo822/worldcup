import { useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  computeTournamentStats,
  finishedMatchesWithEvents,
  statCategoryLabel,
  STAT_CATEGORIES,
  type StatCategory,
} from '@/lib/tournamentStats';
import { buildReturnTo } from '@/lib/navigation';

/** 与列表行 py-3 + 双行文字 + border 对齐，用于锁定列表最小高度 */
const STATS_ROW_HEIGHT = 61;
const STATS_HEADER_HEIGHT = 33;

export default function StatsPage() {
  const location = useLocation();
  const returnTo = buildReturnTo(location.pathname, location.search);
  const [activeTab, setActiveTab] = useState<StatCategory>('goals');

  const stats = useMemo(() => computeTournamentStats(), []);
  const rows = stats[activeTab];
  const matchCount = finishedMatchesWithEvents();

  const listMinHeight = useMemo(() => {
    const maxRows = Math.max(1, ...STAT_CATEGORIES.map((c) => stats[c].length));
    return STATS_HEADER_HEIGHT + maxRows * STATS_ROW_HEIGHT;
  }, [stats]);

  return (
    <div className="pb-24">
      <section className="px-4 pt-4 pb-3">
        <div
          className="flex h-10 gap-1 p-1 rounded-lg border items-stretch"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
          role="tablist"
          aria-label="数据榜分类"
        >
          {STAT_CATEGORIES.map((tab) => {
            const active = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 min-w-0 h-full flex items-center justify-center rounded-md text-xs font-medium whitespace-nowrap transition-colors duration-200 ${
                  active ? 'text-[#0a0a0a]' : 'text-[var(--text-muted)]'
                }`}
                style={active ? { backgroundColor: 'var(--accent)' } : undefined}
              >
                {statCategoryLabel(tab)}
              </button>
            );
          })}
        </div>
        <p className="text-[11px] text-[var(--text-muted)] mt-2 px-0.5 h-8 leading-4 overflow-hidden">
          基于已录入的 {matchCount} 场赛况
          <span className={activeTab === 'goals' ? '' : 'invisible'}> · 乌龙不计入进球榜</span>
        </p>
      </section>

      <section className="px-4 [overflow-anchor:none]">
        {rows.length === 0 ? (
          <div
            className="sb-card overflow-hidden flex items-center justify-center p-8 text-center"
            style={{ minHeight: listMinHeight }}
          >
            <p className="text-sm text-[var(--text-muted)]">暂无{statCategoryLabel(activeTab)}数据</p>
          </div>
        ) : (
          <div className="sb-card overflow-hidden" style={{ minHeight: listMinHeight }}>
            <div
              className="grid grid-cols-[1fr_2.75rem] gap-3 px-3 py-2 text-[10px] font-semibold text-[var(--text-muted)] border-b"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface-elevated)' }}
            >
              <span>球员 · 国家</span>
              <span className="text-right whitespace-nowrap">{statCategoryLabel(activeTab)}</span>
            </div>
            <ul>
              {rows.map((row, index) => (
                <li
                  key={`${row.playerId}-${activeTab}`}
                  className="border-b last:border-b-0"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <Link
                    to={`/player/${row.playerId}`}
                    state={{ returnTo }}
                    className="grid grid-cols-[1.5rem_minmax(0,1fr)_2.75rem] items-center gap-x-3 px-3 py-3 active:bg-white/[0.03] transition-colors"
                  >
                    <span
                      className="text-center text-xs font-bold tabular-nums text-[var(--text-faint)]"
                      aria-hidden
                    >
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[var(--text)] truncate">{row.playerName}</p>
                      <p className="text-[11px] text-[var(--text-muted)] truncate mt-0.5">
                        <span className="mr-1">{row.teamFlag}</span>
                        {row.teamName}
                      </p>
                    </div>
                    <div className="whitespace-nowrap text-right leading-none">
                      {activeTab === 'goals' && row.penaltyGoals && row.penaltyGoals > 0 ? (
                        <>
                          <span
                            className="text-lg font-bold tabular-nums"
                            style={{ color: 'var(--accent)' }}
                          >
                            {row.value}
                          </span>
                          <span className="text-[11px] font-semibold tabular-nums text-[var(--text-muted)]">
                            （{row.penaltyGoals}）
                          </span>
                        </>
                      ) : (
                        <span
                          className="text-lg font-bold tabular-nums"
                          style={{
                            color:
                              activeTab === 'yellow'
                                ? '#eab308'
                                : activeTab === 'red'
                                  ? 'var(--danger)'
                                  : 'var(--accent)',
                          }}
                        >
                          {row.value}
                        </span>
                      )}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </div>
  );
}
