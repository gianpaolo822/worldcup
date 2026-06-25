import type { MatchStats, MatchTeamStats } from '@/lib/lineup';
import type { Team } from '@/types';

interface MatchStatsPanelProps {
  homeTeam: Team;
  awayTeam: Team;
  stats: MatchStats;
}

type StatKey = keyof MatchTeamStats;

interface StatRowDef {
  key: StatKey;
  label: string;
  format: (value: number) => string;
  /** 控球率、传球成功率等已是百分比，按数值本身展示条形比例 */
  ratioFromValues?: boolean;
}

const STAT_ROWS: StatRowDef[] = [
  { key: 'possession', label: '控球率', format: (v) => `${v}%`, ratioFromValues: true },
  { key: 'attacks', label: '进攻', format: (v) => String(v) },
  { key: 'dangerousAttacks', label: '危险进攻', format: (v) => String(v) },
  { key: 'shots', label: '射门数', format: (v) => String(v) },
  { key: 'shotsOnTarget', label: '射正', format: (v) => String(v) },
  { key: 'shotsOffTarget', label: '射偏', format: (v) => String(v) },
  { key: 'passAccuracy', label: '传球成功率', format: (v) => `${v}%`, ratioFromValues: true },
  { key: 'corners', label: '角球', format: (v) => String(v) },
  { key: 'freeKicks', label: '任意球', format: (v) => String(v) },
  { key: 'offsides', label: '越位', format: (v) => String(v) },
  { key: 'fouls', label: '犯规', format: (v) => String(v) },
  { key: 'yellowCards', label: '黄牌', format: (v) => String(v) },
  { key: 'redCards', label: '红牌', format: (v) => String(v) },
];

function barWidths(home: number, away: number, ratioFromValues: boolean): { home: number; away: number } {
  if (ratioFromValues) {
    const total = home + away;
    if (total <= 0) return { home: 0, away: 0 };
    return { home: (home / total) * 100, away: (away / total) * 100 };
  }
  const max = Math.max(home, away, 1);
  return { home: (home / max) * 100, away: (away / max) * 100 };
}

function StatRow({
  label,
  home,
  away,
  format,
  ratioFromValues = false,
}: {
  label: string;
  home: number;
  away: number;
  format: (value: number) => string;
  ratioFromValues?: boolean;
}) {
  const { home: homeWidth, away: awayWidth } = barWidths(home, away, ratioFromValues);

  return (
    <div className="py-3 border-b last:border-b-0" style={{ borderColor: 'var(--border)' }}>
      <div className="flex items-center justify-between mb-2.5 px-1">
        <span className="text-base font-semibold tabular-nums text-[var(--text)] w-14 text-left">
          {format(home)}
        </span>
        <span className="text-xs text-[var(--text-muted)]">{label}</span>
        <span className="text-base font-semibold tabular-nums text-[var(--text)] w-14 text-right">
          {format(away)}
        </span>
      </div>
      <div className="flex items-center gap-0.5 h-1">
        <div className="flex-1 flex justify-end h-full rounded-sm overflow-hidden bg-black/[0.06]">
          <div
            className="h-full rounded-sm transition-all"
            style={{ width: `${homeWidth}%`, backgroundColor: '#ef4444', minWidth: home > 0 ? 4 : 0 }}
          />
        </div>
        <div className="flex-1 flex justify-start h-full rounded-sm overflow-hidden bg-black/[0.06]">
          <div
            className="h-full rounded-sm transition-all"
            style={{ width: `${awayWidth}%`, backgroundColor: '#3b82f6', minWidth: away > 0 ? 4 : 0 }}
          />
        </div>
      </div>
    </div>
  );
}

export default function MatchStatsPanel({ homeTeam, awayTeam, stats }: MatchStatsPanelProps) {
  const rows = STAT_ROWS.filter(
    (row) => stats.home[row.key] != null || stats.away[row.key] != null,
  );

  if (rows.length === 0) {
    return (
      <p className="text-sm text-[var(--text-muted)] text-center py-8">暂无技术统计数据</p>
    );
  }

  return (
    <div>
      <p className="text-sm font-semibold text-[var(--text)] mb-4">技术统计</p>
      <div
        className="flex items-center justify-between mb-1 px-1"
      >
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-lg">{homeTeam.flag}</span>
          <span className="text-sm font-medium text-[var(--text)] truncate">{homeTeam.name}</span>
        </div>
        <span className="text-xs text-[var(--text-faint)] px-2 flex-shrink-0">VS</span>
        <div className="flex items-center gap-1.5 min-w-0 flex-row-reverse">
          <span className="text-lg">{awayTeam.flag}</span>
          <span className="text-sm font-medium text-[var(--text)] truncate">{awayTeam.name}</span>
        </div>
      </div>

      <div className="mt-2">
        {rows.map((row) => {
          const home = stats.home[row.key] ?? 0;
          const away = stats.away[row.key] ?? 0;
          return (
            <StatRow
              key={row.key}
              label={row.label}
              home={home}
              away={away}
              format={row.format}
              ratioFromValues={row.ratioFromValues}
            />
          );
        })}
      </div>
    </div>
  );
}
