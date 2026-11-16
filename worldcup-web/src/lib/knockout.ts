import generatedMatchesJson from '@data/generated/matches.json';
import { formatMatchKickoffBeijing, matches as rawMatches } from '@/lib/data';
import { getMatchKickoffMs } from '@/lib/matchDisplay';
import type { Match, Team } from '@/types';
import {
  buildFeederMap,
  getKnockoutBracketRows,
  isBracketPlaceholderTeam,
} from '@shared/knockout-bracket';

export const KNOCKOUT_ROUNDS = [
  { stage: '1/16决赛', label: '1/16决赛', nextStage: '1/8决赛' },
  { stage: '1/8决赛', label: '1/8决赛', nextStage: '四分之一决赛' },
  { stage: '四分之一决赛', label: '1/4决赛', nextStage: '半决赛' },
  { stage: '半决赛', label: '半决赛', nextStage: '决赛' },
  { stage: '决赛', label: '决赛', nextStage: null },
  { stage: '季军战', label: '季军赛', nextStage: null },
] as const;

export type KnockoutStage = (typeof KNOCKOUT_ROUNDS)[number]['stage'];

/** 淘汰赛单场预计结束缓冲（开球 + 150 分钟，覆盖加时与点球，不依赖 status） */
export const KNOCKOUT_SCHEDULED_END_BUFFER_MS = 150 * 60 * 1000;

const FEEDER_MAP = buildFeederMap(generatedMatchesJson as Match[]);

export function isPlaceholderTeam(team: Team): boolean {
  return isBracketPlaceholderTeam(team);
}

export function isGroupStageComplete(): boolean {
  const groupMatches = rawMatches.filter((m) => m.stage === '小组赛');
  return groupMatches.length > 0 && groupMatches.every((m) => m.status === 'finished');
}

function sortKnockout(list: Match[]): Match[] {
  return [...list].sort((a, b) => (a.kickoffAt ?? a.time).localeCompare(b.kickoffAt ?? b.time));
}

export function getKnockoutMatches(stage: string): Match[] {
  return sortKnockout(rawMatches.filter((m) => m.stage === stage));
}

/** 按开球时间推算单场已结束（不依赖 overrides 中的 status） */
export function isMatchEndedBySchedule(match: Match, nowMs = Date.now()): boolean {
  const kickoffMs = getMatchKickoffMs(match);
  if (kickoffMs == null) return false;
  return nowMs >= kickoffMs + KNOCKOUT_SCHEDULED_END_BUFFER_MS;
}

/** 某淘汰赛阶段全部场次是否已按赛程结束 */
export function isKnockoutStageCompleteBySchedule(stage: KnockoutStage, nowMs = Date.now()): boolean {
  const stageMatches = getKnockoutMatches(stage);
  if (stageMatches.length === 0) return false;
  return stageMatches.every((m) => isMatchEndedBySchedule(m, nowMs));
}

/** 淘汰赛 Tab 默认定位：首个尚未按赛程全部结束的阶段 */
export function getDefaultKnockoutStage(nowMs = Date.now()): KnockoutStage {
  for (const { stage } of KNOCKOUT_ROUNDS) {
    if (!isKnockoutStageCompleteBySchedule(stage, nowMs)) {
      return stage;
    }
  }
  return KNOCKOUT_ROUNDS[KNOCKOUT_ROUNDS.length - 1].stage;
}

export function getKnockoutRoundMeta(stage: KnockoutStage) {
  return KNOCKOUT_ROUNDS.find((r) => r.stage === stage)!;
}

export type KnockoutDisplayRow = {
  feeders: Match[];
  next: Match;
  nextSecondary?: Match;
};

export function getKnockoutDisplayRows(stage: KnockoutStage): KnockoutDisplayRow[] {
  const roundMeta = getKnockoutRoundMeta(stage);
  const currentMatches = getKnockoutMatches(stage);

  if (stage === '半决赛') {
    const toFinal = getKnockoutBracketRows(
      currentMatches,
      getKnockoutMatches('决赛'),
      FEEDER_MAP,
    );
    const toThird = getKnockoutBracketRows(
      currentMatches,
      getKnockoutMatches('季军战'),
      FEEDER_MAP,
    );
    return toFinal.map((row, i) => ({
      feeders: row.feeders as Match[],
      next: row.next as Match,
      nextSecondary: toThird[i]?.next as Match | undefined,
    }));
  }

  if (!roundMeta.nextStage) {
    return currentMatches.map((match) => ({ feeders: [match], next: match }));
  }

  return getKnockoutBracketRows(
    currentMatches,
    getKnockoutMatches(roundMeta.nextStage),
    FEEDER_MAP,
  ) as KnockoutDisplayRow[];
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
