import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { topScorers, worldCupHistory } from '@/lib/data';
import { historicalPlayerId } from '@/lib/playerUtils';
import { buildReturnTo } from '@/lib/navigation';
import { Trophy, Medal, Goal, ChevronDown, ChevronUp } from 'lucide-react';

type TabType = 'champions' | 'scorers';

export default function HistoryPage() {
  const location = useLocation();
  const returnTo = buildReturnTo(location.pathname, location.search);
  const [activeTab, setActiveTab] = useState<TabType>('champions');
  const [expandedYear, setExpandedYear] = useState<number | null>(
    worldCupHistory[0]?.year ?? null,
  );

  const tabs = [
    { id: 'champions' as TabType, label: '历届冠军', icon: Trophy },
    { id: 'scorers' as TabType, label: '射手榜', icon: Goal },
  ];

  return (
    <div className="pb-24">
      <section className="px-4 pt-4 pb-3">
        <div
          className="flex gap-1 p-1 rounded-lg border"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-md text-xs font-medium transition-all duration-200 active:scale-[0.98] ${
                  isActive ? 'text-[#0a0a0a]' : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                }`}
                style={isActive ? { backgroundColor: 'var(--accent)' } : undefined}
              >
                <Icon size={15} strokeWidth={isActive ? 2.25 : 1.75} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </section>

      {activeTab === 'champions' && (
        <section className="px-4 space-y-2">
          {worldCupHistory.map((wc) => {
            const isExpanded = expandedYear === wc.year;
            return (
              <div key={wc.year} className="sb-card overflow-hidden">
                <button
                  type="button"
                  onClick={() => setExpandedYear(isExpanded ? null : wc.year)}
                  className="w-full flex items-center justify-between p-4 text-left active:opacity-80 transition-opacity hover:bg-white/[0.02]"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-9 h-9 rounded-md flex items-center justify-center flex-shrink-0 border"
                      style={{
                        background: 'var(--accent-muted)',
                        borderColor: 'rgba(62, 207, 142, 0.2)',
                      }}
                    >
                      <Trophy size={16} className="text-[var(--accent)]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[var(--text)]">{wc.year} 世界杯</p>
                      <p className="text-[11px] text-[var(--text-muted)] truncate">{wc.host}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right">
                      <p className="text-sm font-semibold text-[var(--accent)]">{wc.champion}</p>
                      <p className="text-[10px] text-[var(--text-muted)]">冠军</p>
                    </div>
                    {isExpanded ? (
                      <ChevronUp size={16} className="text-[var(--text-muted)]" />
                    ) : (
                      <ChevronDown size={16} className="text-[var(--text-muted)]" />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div
                    className="px-4 pb-4 border-t pt-3 space-y-1"
                    style={{ borderColor: 'var(--border)' }}
                  >
                    {[
                      { label: '决赛比分', value: wc.score },
                      { label: '亚军', value: wc.runnerUp },
                      { label: '金靴奖', value: wc.goldenBoot, accent: true },
                      { label: '金球奖', value: wc.goldenBall },
                      { label: '金手套奖', value: wc.goldenGlove },
                    ].map((row) => (
                      <div
                        key={row.label}
                        className="flex items-center justify-between py-1.5 px-2 rounded-md even:bg-white/[0.02]"
                      >
                        <span className="text-xs text-[var(--text-muted)]">{row.label}</span>
                        <span
                          className={`text-sm font-medium ${
                            row.accent ? 'text-[var(--accent)]' : 'text-[var(--text)]'
                          }`}
                        >
                          {row.value}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </section>
      )}

      {activeTab === 'scorers' && (
        <section className="px-4">
          <div className="sb-card overflow-hidden">
            <div
              className="grid items-center py-2.5 px-2 border-b bg-[var(--surface-elevated)]"
              style={{
                gridTemplateColumns: '36px 1fr 60px 60px',
                borderColor: 'var(--border)',
              }}
            >
              <span className="sb-label normal-case">排名</span>
              <span className="sb-label normal-case">球员</span>
              <span className="sb-label normal-case text-center">国家队</span>
              <span className="sb-label normal-case text-center" style={{ color: 'var(--accent)' }}>
                进球
              </span>
            </div>

            {topScorers.map((scorer, index) => (
              <Link
                key={scorer.rank}
                to={`/player/${historicalPlayerId(scorer)}`}
                state={{ returnTo }}
                className={`grid items-center py-3 px-2 border-b last:border-b-0 active:bg-white/[0.03] transition-colors ${
                  index % 2 === 1 ? 'bg-white/[0.02]' : ''
                }`}
                style={{
                  gridTemplateColumns: '36px 1fr 60px 60px',
                  borderColor: 'var(--border)',
                }}
              >
                <div className="flex items-center">
                  {scorer.rank <= 3 ? (
                    <div
                      className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold border ${
                        scorer.rank === 1
                          ? 'text-[#0a0a0a] border-transparent'
                          : 'text-[var(--text-muted)] border-[var(--border)]'
                      }`}
                      style={
                        scorer.rank === 1
                          ? { backgroundColor: 'var(--accent)' }
                          : { backgroundColor: 'var(--surface-elevated)' }
                      }
                    >
                      {scorer.rank}
                    </div>
                  ) : (
                    <span className="text-xs text-[var(--text-muted)] font-medium pl-1.5 tabular-nums">
                      {scorer.rank}
                    </span>
                  )}
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-medium text-[var(--text)] truncate">{scorer.name}</p>
                  <p className="text-[10px] text-[var(--text-muted)]">{scorer.tournaments}</p>
                </div>

                <span className="text-xs text-[var(--text-muted)] text-center">{scorer.country}</span>
                <span className="text-sm font-semibold text-[var(--accent)] text-center tabular-nums">
                  {scorer.goals}
                </span>
              </Link>
            ))}
          </div>

          <div className="sb-card p-4 mt-4">
            <div className="flex items-start gap-3">
              <div
                className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 border"
                style={{
                  background: 'var(--accent-muted)',
                  borderColor: 'rgba(62, 207, 142, 0.2)',
                }}
              >
                <Medal size={16} className="text-[var(--accent)]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--text)] mb-1">你知道吗？</p>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  方丹在 1958 年瑞典世界杯打入 13 球，创造了单届世界杯进球纪录，至今无人能破。
                </p>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
