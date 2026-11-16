import { ALL_TEAMS } from '@/components/ScheduleFilterBar';
import { scheduleTeams } from '@/lib/data';
import {
  getDefaultScheduleDateRange,
  getFullScheduleDateRange,
  normalizeDateRange,
  scheduleDateSet,
  type ScheduleDateRange,
} from '@/lib/scheduleDate';
import { isFullScheduleRange } from '@/components/ScheduleDateRangePicker';

function isValidDateKey(key: string): boolean {
  return scheduleDateSet.has(key);
}

function isValidTeamId(teamId: string): boolean {
  return teamId === ALL_TEAMS || scheduleTeams.some((t) => t.id === teamId);
}

export function parseScheduleFilters(search: string): {
  dateRange: ScheduleDateRange;
  teamId: string;
} {
  const params = new URLSearchParams(search);

  let dateRange = getDefaultScheduleDateRange();
  if (params.get('range') === 'all') {
    dateRange = getFullScheduleDateRange();
  } else {
    const from = params.get('from');
    const to = params.get('to');
    if (from && to && isValidDateKey(from) && isValidDateKey(to)) {
      dateRange = normalizeDateRange(from, to);
    }
  }

  const teamParam = params.get('team');
  const teamId =
    teamParam && isValidTeamId(teamParam) && teamParam !== ALL_TEAMS ? teamParam : ALL_TEAMS;

  return { dateRange, teamId };
}

/** 将当前筛选写入 URL 查询参数（默认值省略） */
export function buildScheduleFilterParams(
  dateRange: ScheduleDateRange,
  teamId: string,
): URLSearchParams {
  const params = new URLSearchParams();
  const defaultRange = getDefaultScheduleDateRange();

  if (isFullScheduleRange(dateRange)) {
    params.set('range', 'all');
  } else if (dateRange.start !== defaultRange.start || dateRange.end !== defaultRange.end) {
    params.set('from', dateRange.start);
    params.set('to', dateRange.end);
  }

  if (teamId !== ALL_TEAMS && isValidTeamId(teamId)) {
    params.set('team', teamId);
  }

  return params;
}

export function buildScheduleFilterSearch(dateRange: ScheduleDateRange, teamId: string): string {
  const qs = buildScheduleFilterParams(dateRange, teamId).toString();
  return qs ? `?${qs}` : '';
}

export function hasActiveScheduleFilters(dateRange: ScheduleDateRange, teamId: string): boolean {
  return buildScheduleFilterSearch(dateRange, teamId) !== '';
}
