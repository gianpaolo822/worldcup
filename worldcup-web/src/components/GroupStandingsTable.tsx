import { getStandingsByGroup } from '@/lib/data';
import StandingsRow from '@/components/StandingsRow';

interface GroupStandingsTableProps {
  group: string;
}

export default function GroupStandingsTable({ group }: GroupStandingsTableProps) {
  const rows = getStandingsByGroup(group);

  return (
    <div className="sb-card overflow-hidden">
      <div
        className="grid items-center py-2.5 px-2 border-b bg-[var(--surface-elevated)]"
        style={{
          gridTemplateColumns: '28px 1fr 32px 32px 32px 32px 40px 44px',
          borderColor: 'var(--border)',
        }}
      >
        <span />
        <span className="sb-label normal-case">球队</span>
        <span className="sb-label normal-case text-center">赛</span>
        <span className="sb-label normal-case text-center">胜</span>
        <span className="sb-label normal-case text-center">平</span>
        <span className="sb-label normal-case text-center">负</span>
        <span className="sb-label normal-case text-center">净胜</span>
        <span className="sb-label normal-case text-center" style={{ color: 'var(--accent)' }}>
          积分
        </span>
      </div>
      <div>
        {rows.map((row, index) => (
          <StandingsRow key={row.team.id} row={row} isQualified={index < 2} index={index} />
        ))}
      </div>
    </div>
  );
}
