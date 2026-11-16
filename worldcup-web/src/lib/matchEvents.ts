import type { MatchEvent } from '@/lib/lineup';

export function eventSortKey(ev: MatchEvent): number {
  const phaseBase =
    ev.type === 'phase' && ev.note?.includes('点球大战')
      ? 3000
      : ev.phase === 'penalties'
        ? 2000 + (ev.penOrder ?? ev.minute)
        : ev.phase === 'extra_time' || (ev.minute > 90 && ev.minute <= 120 && ev.type !== 'phase')
          ? 1000 + ev.minute
          : ev.minute;
  return phaseBase;
}

export function formatEventMinute(ev: MatchEvent): string {
  if (ev.type === 'phase') {
    if (ev.note?.includes('点球大战')) return '点球大战';
    if (ev.note?.includes('加时')) return '加时赛';
    return '赛况';
  }
  if (ev.phase === 'penalties') {
    return ev.penOrder ? `点球 第${ev.penOrder}轮` : '点球大战';
  }
  if (ev.phase === 'extra_time' && ev.minute > 105) {
    return `加时 ${ev.minute - 90}'`;
  }
  if (ev.minute > 90 && ev.minute <= 120) {
    return `90+${ev.minute - 90}'`;
  }
  return `${ev.minute}'`;
}

export function isOwnGoal(ev: MatchEvent): boolean {
  return ev.type === 'goal' && !!ev.note?.includes('乌龙');
}

export function isPenaltyShootoutEvent(ev: MatchEvent): boolean {
  return ev.phase === 'penalties';
}

/** 比赛常规时间或补时内的点球（非点球大战） */
export function isInMatchPenaltyEvent(ev: MatchEvent): boolean {
  return ev.type.startsWith('pen_') && ev.phase !== 'penalties';
}

export function isRegularPenaltyGoal(ev: MatchEvent): boolean {
  return ev.type === 'goal' && !!ev.note?.includes('点球') && !isPenaltyShootoutEvent(ev);
}

export function sortMatchEvents(events: MatchEvent[]): MatchEvent[] {
  const typeOrder: Record<MatchEvent['type'], number> = {
    phase: 0,
    goal: 1,
    pen_scored: 1,
    pen_missed: 1,
    pen_saved: 1,
    assist: 2,
    yellow: 3,
    red: 4,
    sub_out: 5,
    sub_in: 6,
  };

  return [...events].sort((a, b) => {
    const keyDiff = eventSortKey(a) - eventSortKey(b);
    if (keyDiff !== 0) return keyDiff;
    return typeOrder[a.type] - typeOrder[b.type];
  });
}
