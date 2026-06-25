import { useMemo, useState } from 'react';
import { CalendarDays, ChevronDown, Users } from 'lucide-react';
import FilterSheet, { FilterSheetOption } from '@/components/FilterSheet';
import ScheduleDateRangePicker, { isFullScheduleRange } from '@/components/ScheduleDateRangePicker';
import { scheduleTeams } from '@/lib/data';
import { formatScheduleDateRange, type ScheduleDateRange } from '@/lib/scheduleDate';

export const ALL_TEAMS = '__all_teams__';

interface ScheduleFilterBarProps {
  dateRange: ScheduleDateRange;
  activeTeamId: string;
  onDateRangeChange: (range: ScheduleDateRange) => void;
  onTeamChange: (teamId: string) => void;
}

export default function ScheduleFilterBar({
  dateRange,
  activeTeamId,
  onDateRangeChange,
  onTeamChange,
}: ScheduleFilterBarProps) {
  const [dateOpen, setDateOpen] = useState(false);
  const [teamOpen, setTeamOpen] = useState(false);
  const [teamQuery, setTeamQuery] = useState('');

  const dateLabel = isFullScheduleRange(dateRange)
    ? '全部赛程'
    : formatScheduleDateRange(dateRange);

  const activeTeam = scheduleTeams.find((t) => t.id === activeTeamId);
  const teamLabel =
    activeTeamId === ALL_TEAMS
      ? '全部球队'
      : activeTeam
        ? `${activeTeam.flag} ${activeTeam.name}`
        : '全部球队';

  const filteredTeams = useMemo(() => {
    const q = teamQuery.trim().toLowerCase();
    if (!q) return scheduleTeams;
    return scheduleTeams.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.nameEn.toLowerCase().includes(q) ||
        t.code.toLowerCase().includes(q),
    );
  }, [teamQuery]);

  const closeTeam = () => {
    setTeamOpen(false);
    setTeamQuery('');
  };

  return (
    <>
      <section className="px-4 mb-4">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setDateOpen(true)}
            className="sb-card flex items-center gap-2 px-3 py-3 text-left active:scale-[0.99] transition-transform"
          >
            <CalendarDays size={16} className="text-[var(--accent)] flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="sb-label normal-case mb-0.5">日期</p>
              <p className="text-xs font-semibold text-[var(--text)] truncate">{dateLabel}</p>
            </div>
            <ChevronDown size={14} className="text-[var(--text-muted)] flex-shrink-0" />
          </button>

          <button
            type="button"
            onClick={() => setTeamOpen(true)}
            className="sb-card flex items-center gap-2 px-3 py-3 text-left active:scale-[0.99] transition-transform"
          >
            <Users size={16} className="text-[var(--accent)] flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="sb-label normal-case mb-0.5">国家</p>
              <p className="text-xs font-semibold text-[var(--text)] truncate">{teamLabel}</p>
            </div>
            <ChevronDown size={14} className="text-[var(--text-muted)] flex-shrink-0" />
          </button>
        </div>
      </section>

      <ScheduleDateRangePicker
        open={dateOpen}
        value={dateRange}
        onClose={() => setDateOpen(false)}
        onChange={onDateRangeChange}
      />

      <FilterSheet
        open={teamOpen}
        title="选择国家 / 球队"
        onClose={closeTeam}
        searchPlaceholder="搜索球队中英文名或代码"
        searchValue={teamQuery}
        onSearchChange={setTeamQuery}
      >
        <FilterSheetOption
          selected={activeTeamId === ALL_TEAMS}
          onSelect={() => {
            onTeamChange(ALL_TEAMS);
            closeTeam();
          }}
        >
          全部球队
        </FilterSheetOption>
        {filteredTeams.length === 0 && (
          <p className="px-3 py-6 text-center text-sm text-[var(--text-muted)]">没有匹配的球队</p>
        )}
        {filteredTeams.map((team) => (
          <FilterSheetOption
            key={team.id}
            selected={activeTeamId === team.id}
            subtitle={`${team.nameEn} · ${team.group} 组 · ${team.code}`}
            onSelect={() => {
              onTeamChange(team.id);
              closeTeam();
            }}
          >
            <span className="inline-flex items-center gap-2">
              <span>{team.flag}</span>
              <span>{team.name}</span>
            </span>
          </FilterSheetOption>
        ))}
      </FilterSheet>
    </>
  );
}
