import { useMemo } from 'react';
import { getStandingsByGroup } from '@/lib/data';
import { getQualificationByTeamId } from '@/lib/qualification';
import { STANDINGS_GRID_COLUMNS, STANDINGS_STAT_HEADERS } from '@/lib/standingsTable';
import StandingsRow from '@/components/StandingsRow';

interface GroupStandingsTableProps {
  group: string;
  highlightTeamIds?: string[];
  /** 紧凑行高（赛事详情等） */
  dense?: boolean;
}

function StandingsTableHeader() {
  return (
    <div
      className="grid items-center py-2 px-2 border-b bg-[var(--surface-elevated)] min-w-[22rem]"
      style={{
        gridTemplateColumns: STANDINGS_GRID_COLUMNS,
        borderColor: 'var(--border)',
      }}
    >
      <span />
      <span className="sb-label normal-case">球队</span>
      {STANDINGS_STAT_HEADERS.map((col) => (
        <span
          key={col.key}
          className="sb-label normal-case text-center whitespace-nowrap text-[9px] sm:text-[10px]"
          style={col.accent ? { color: 'var(--accent)' } : undefined}
        >
          {col.label}
        </span>
      ))}
    </div>
  );
}

export default function GroupStandingsTable({
  group,
  highlightTeamIds = [],
  dense = false,
}: GroupStandingsTableProps) {
  const rows = getStandingsByGroup(group);
  const qualificationMap = useMemo(() => getQualificationByTeamId(), []);

  if (rows.length === 0) return null;

  return (
    <div className="sb-card overflow-hidden">
      <div className="overflow-x-auto">
        <div className="min-w-[22rem]">
          <StandingsTableHeader />
          <div>
            {rows.map((row, index) => (
              <StandingsRow
                key={row.team.id}
                row={row}
                qualification={qualificationMap.get(row.team.id) ?? { status: 'none' }}
                index={index}
                dense={dense}
                highlightTeamIds={highlightTeamIds}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
