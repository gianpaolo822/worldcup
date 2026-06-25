import { matches, formatMatchKickoffBeijing } from '@/lib/data';
import type { Match, Team } from '@/types';

export const KNOCKOUT_ROUNDS = [
  { stage: '1/16决赛', label: '1/16决赛', nextStage: '1/8决赛' },
  { stage: '1/8决赛', label: '1/8决赛', nextStage: '四分之一决赛' },
  { stage: '四分之一决赛', label: '1/4决赛', nextStage: '半决赛' },
  { stage: '半决赛', label: '半决赛', nextStage: '决赛' },
  { stage: '决赛', label: '决赛', nextStage: null },
  { stage: '季军战', label: '季军赛', nextStage: null },
] as const;

export type KnockoutStage = (typeof KNOCKOUT_ROUNDS)[number]['stage'];

const PLACEHOLDER = /^(\d[A-Z]|[WL]\d+|2[A-L]|3[A-Z0-9/]+)$/;

export function isPlaceholderTeam(team: Team): boolean {
  return team.flag === '🏳️' || PLACEHOLDER.test(team.name) || PLACEHOLDER.test(team.nameEn);
}

export function isGroupStageComplete(): boolean {
  const groupMatches = matches.filter((m) => m.stage === '小组赛');
  return groupMatches.length > 0 && groupMatches.every((m) => m.status === 'finished');
}

export function getKnockoutMatches(stage: string): Match[] {
  return matches
    .filter((m) => m.stage === stage)
    .sort((a, b) => (a.kickoffAt ?? a.time).localeCompare(b.kickoffAt ?? b.time));
}

export function formatKnockoutTime(match: Match): string {
  const time = formatMatchKickoffBeijing(match);
  const m = time.match(/^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}:\d{2})/);
  if (!m) return time;
  return `${m[2]}.${m[3]} ${m[4]}`;
}

export function matchStatusLabel(status: Match['status']): string {
  if (status === 'live') return '进行中';
  if (status === 'finished') return '已结束';
  return '未开赛';
}
