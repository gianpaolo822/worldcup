import { Link } from 'react-router-dom';
import type { StandingRow as StandingRowType } from '@/types';

interface StandingsRowProps {
  row: StandingRowType;
  isQualified: boolean;
  index: number;
  compact?: boolean;
  highlightTeamIds?: string[];
}

export default function StandingsRow({
  row,
  isQualified,
  index,
  compact = false,
  highlightTeamIds = [],
}: StandingsRowProps) {
  const highlighted = highlightTeamIds.includes(row.team.id);
  const columns = compact
    ? '28px 1fr 32px 44px'
    : '28px 1fr 32px 32px 32px 32px 40px 44px';

  return (
    <div
      className={`grid items-center py-2.5 px-2 border-b last:border-b-0 ${
        isQualified ? 'bg-[var(--accent-muted)]' : index % 2 === 1 ? 'bg-white/[0.02]' : ''
      } ${highlighted ? 'ring-1 ring-inset ring-[var(--accent)]/30' : ''}`}
      style={{
        gridTemplateColumns: columns,
        borderColor: 'var(--border)',
      }}
    >
      <div className="flex items-center gap-1">
        {isQualified && (
          <div className="w-0.5 h-4 rounded-full" style={{ backgroundColor: 'var(--accent)' }} />
        )}
        <span
          className={`text-xs font-medium tabular-nums ${
            isQualified ? 'text-[var(--text)]' : 'text-[var(--text-muted)]'
          }`}
        >
          {row.rank}
        </span>
      </div>

      <Link to={`/team/${row.team.id}`} className="flex items-center gap-2 min-w-0 active:opacity-80">
        <span className="text-base">{row.team.flag}</span>
        <span className="text-sm font-medium text-[var(--text)] truncate">
          {compact ? row.team.name : row.team.code}
        </span>
      </Link>

      <span className="text-xs text-[var(--text-muted)] text-center tabular-nums">{row.played}</span>

      {!compact && (
        <>
          <span className="text-xs text-[var(--text-muted)] text-center tabular-nums">{row.won}</span>
          <span className="text-xs text-[var(--text-muted)] text-center tabular-nums">{row.drawn}</span>
          <span className="text-xs text-[var(--text-muted)] text-center tabular-nums">{row.lost}</span>
          <span
            className={`text-xs font-medium text-center tabular-nums ${
              row.gd > 0 ? 'text-[var(--accent)]' : row.gd < 0 ? 'text-[var(--danger)]' : 'text-[var(--text-muted)]'
            }`}
          >
            {row.gd > 0 ? `+${row.gd}` : row.gd}
          </span>
        </>
      )}

      <span
        className={`text-sm font-semibold text-center tabular-nums ${
          isQualified ? 'text-[var(--accent)]' : 'text-[var(--text)]'
        }`}
      >
        {row.points}
      </span>
    </div>
  );
}
