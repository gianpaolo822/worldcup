import type { Match, MatchStatus } from '@/types';

export interface MatchDisplay {
  status: MatchStatus;
  homeScore: number | null;
  awayScore: number | null;
}

/** 开球时刻（毫秒）。优先 kickoffAt，否则按 time 字段北京时间解析。 */
export function getMatchKickoffMs(match: Match): number | null {
  if (match.kickoffAt) {
    const ms = new Date(match.kickoffAt).getTime();
    return Number.isFinite(ms) ? ms : null;
  }

  const t = match.time?.trim();
  if (!t) return null;
  const m = t.match(/^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2})/);
  if (!m) return null;

  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  const hour = Number(m[4]);
  const minute = Number(m[5]);
  return Date.UTC(year, month - 1, day, hour - 8, minute);
}

/**
 * 展示用状态：数据仍为 upcoming 但已过开球时间 → 视为 live，比分 0:0。
 * 已 finished 或 overrides 写入 live 时以数据为准。
 */
export function resolveMatchDisplay(match: Match, nowMs = Date.now()): MatchDisplay {
  if (match.status === 'finished') {
    return {
      status: 'finished',
      homeScore: match.homeScore,
      awayScore: match.awayScore,
    };
  }

  if (match.status === 'live') {
    return {
      status: 'live',
      homeScore: match.homeScore ?? 0,
      awayScore: match.awayScore ?? 0,
    };
  }

  const kickoffMs = getMatchKickoffMs(match);
  if (kickoffMs != null && nowMs >= kickoffMs) {
    return { status: 'live', homeScore: 0, awayScore: 0 };
  }

  return { status: 'upcoming', homeScore: null, awayScore: null };
}

export function matchStatusLabelShort(status: MatchStatus): string {
  if (status === 'live') return 'LIVE';
  if (status === 'finished') return '已结束';
  return '未开始';
}

export function matchStatusLabel(status: MatchStatus): string {
  if (status === 'live') return '进行中';
  if (status === 'finished') return '已结束';
  return '未开始';
}
