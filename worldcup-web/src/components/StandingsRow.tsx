import { Link } from 'react-router-dom';
import type { QualificationInfo } from '@/lib/qualification';
import { isQualificationHighlight } from '@/lib/qualification';
import { STANDINGS_GRID_COLUMNS } from '@/lib/standingsTable';
import type { StandingRow as StandingRowType } from '@/types';

interface StandingsRowProps {
  row: StandingRowType;
  qualification: QualificationInfo;
  index: number;
  dense?: boolean;
  highlightTeamIds?: string[];
}

function rowBackground(status: QualificationInfo['status'], index: number): string {
  if (status === 'direct' || status === 'third_qualified') return 'bg-[var(--accent-muted)]';
  if (status === 'third_pending') return 'bg-amber-500/[0.08]';
  return index % 2 === 1 ? 'bg-white/[0.02]' : '';
}

function formatGd(gd: number): string {
  return gd > 0 ? `+${gd}` : String(gd);
}

export default function StandingsRow({
  row,
  qualification,
  index,
  dense = false,
  highlightTeamIds = [],
}: StandingsRowProps) {
  const highlighted = highlightTeamIds.includes(row.team.id);
  const showMarker = isQualificationHighlight(qualification.status);
  const pointsAccent =
    qualification.status === 'direct' || qualification.status === 'third_qualified';

  return (
    <div
      className={`grid items-center px-2 border-b last:border-b-0 min-w-[22rem] ${
        dense ? 'py-2' : 'py-2.5'
      } ${rowBackground(qualification.status, index)} ${
        highlighted ? 'ring-1 ring-inset ring-[var(--accent)]/30' : ''
      }`}
      style={{
        gridTemplateColumns: STANDINGS_GRID_COLUMNS,
        borderColor: 'var(--border)',
      }}
    >
      <div className="flex items-center gap-1">
        {showMarker && (
          <div
            className="w-0.5 h-4 rounded-full"
            style={{
              backgroundColor:
                qualification.status === 'third_pending' ? '#fbbf24' : 'var(--accent)',
            }}
          />
        )}
        <span
          className={`text-xs font-medium tabular-nums ${
            showMarker ? 'text-[var(--text)]' : 'text-[var(--text-muted)]'
          }`}
        >
          {row.rank}
        </span>
      </div>

      <Link to={`/team/${row.team.id}`} className="flex items-center gap-1.5 min-w-0 active:opacity-80">
        <span className="text-base flex-shrink-0">{row.team.flag}</span>
        <span className="text-sm font-medium text-[var(--text)] truncate">{row.team.name}</span>
      </Link>

      <span className="text-xs text-[var(--text-muted)] text-center tabular-nums">{row.played}</span>
      <span className="text-xs text-[var(--text-muted)] text-center tabular-nums">{row.won}</span>
      <span className="text-xs text-[var(--text-muted)] text-center tabular-nums">{row.drawn}</span>
      <span className="text-xs text-[var(--text-muted)] text-center tabular-nums">{row.lost}</span>
      <span className="text-xs text-[var(--text-muted)] text-center tabular-nums">{row.gf}</span>
      <span className="text-xs text-[var(--text-muted)] text-center tabular-nums">{row.ga}</span>
      <span
        className={`text-xs font-medium text-center tabular-nums ${
          row.gd > 0 ? 'text-[var(--accent)]' : row.gd < 0 ? 'text-[var(--danger)]' : 'text-[var(--text-muted)]'
        }`}
      >
        {formatGd(row.gd)}
      </span>
      <span
        className={`text-sm font-semibold text-center tabular-nums ${
          pointsAccent ? 'text-[var(--accent)]' : 'text-[var(--text)]'
        }`}
      >
        {row.points}
      </span>
    </div>
  );
}
