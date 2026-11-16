import { topScorers, players, getPlayerById, getTeamById, playerWcCareerBaselines } from '@/lib/data';
import { historicalPlayerId, playerNameZh, slugifyName } from '@/lib/playerUtils';
import { computeTournamentStats, finishedMatchesWithEvents } from '@/lib/tournamentStats';
import type { TopScorer } from '@/types';

/** 去重音、用于历史射手与本届球员姓名匹配 */
export function normalizeNameKey(name: string): string {
  return name
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export interface AllTimeScorerRow {
  rank: number;
  name: string;
  nameEn: string;
  country: string;
  goals: number;
  goalsBefore2026: number;
  goals2026: number;
  tournaments: string;
  /** 本届参赛球员 id；可跳转至球员详情 */
  playerId?: string;
  /** 历史射手页 id（无本届球员时） */
  historicalId: string;
}

const activePlayerByNameKey = new Map(
  players.map((p) => [normalizeNameKey(p.nameEn), p.id] as const),
);

function appendTournament2026(tournaments: string): string {
  if (tournaments.includes('2026')) return tournaments;
  return `${tournaments}-2026`;
}

function resolveActivePlayerId(scorer: TopScorer): string | undefined {
  return activePlayerByNameKey.get(normalizeNameKey(scorer.nameEn));
}

function buildHistoricalRow(scorer: TopScorer, goals2026: number, playerId?: string): AllTimeScorerRow {
  return {
    rank: 0,
    name: scorer.name,
    nameEn: scorer.nameEn,
    country: scorer.country,
    goals: scorer.goals + goals2026,
    goalsBefore2026: scorer.goals,
    goals2026,
    tournaments: goals2026 > 0 ? appendTournament2026(scorer.tournaments) : scorer.tournaments,
    playerId,
    historicalId: historicalPlayerId(scorer),
  };
}

function buildNew2026Row(
  playerId: string,
  goals2026: number,
  goalsBefore2026 = 0,
  tournaments = '2026',
): AllTimeScorerRow | undefined {
  const player = getPlayerById(playerId);
  const team = player ? getTeamById(player.teamId) : undefined;
  if (!player || !team) return undefined;

  return {
    rank: 0,
    name: playerNameZh(player),
    nameEn: player.nameEn,
    country: team.code,
    goals: goalsBefore2026 + goals2026,
    goalsBefore2026,
    goals2026,
    tournaments: goals2026 > 0 ? appendTournament2026(tournaments) : tournaments,
    playerId,
    historicalId: `historical-${slugifyName(player.nameEn)}`,
  };
}

/** 世界杯历史总射手榜：历届基线 + 本届已录入赛事进球，动态重排 */
export function computeAllTimeScorers(limit = 20): AllTimeScorerRow[] {
  const goals2026Rows = computeTournamentStats().goals;
  const goals2026ByPlayerId = new Map(goals2026Rows.map((r) => [r.playerId, r.value]));
  const matchedPlayerIds = new Set<string>();

  const rows: AllTimeScorerRow[] = topScorers.map((scorer) => {
    const playerId = resolveActivePlayerId(scorer);
    const goals2026 = playerId ? (goals2026ByPlayerId.get(playerId) ?? 0) : 0;
    if (playerId && goals2026 > 0) matchedPlayerIds.add(playerId);
    return buildHistoricalRow(scorer, goals2026, playerId);
  });

  for (const row of goals2026Rows) {
    if (matchedPlayerIds.has(row.playerId)) continue;
    const baseline = playerWcCareerBaselines[row.playerId];
    const entry = buildNew2026Row(
      row.playerId,
      row.value,
      baseline?.goalsBefore2026 ?? 0,
      baseline?.tournaments,
    );
    if (entry) rows.push(entry);
  }

  rows.sort((a, b) => b.goals - a.goals || a.name.localeCompare(b.name, 'zh-CN'));

  return rows.slice(0, limit).map((row, index) => ({ ...row, rank: index + 1 }));
}

export function findAllTimeScorerByHistoricalId(id: string): AllTimeScorerRow | undefined {
  return computeAllTimeScorers(topScorers.length + players.length).find((r) => r.historicalId === id);
}

export function findAllTimeScorerByPlayerId(playerId: string): AllTimeScorerRow | undefined {
  return computeAllTimeScorers(topScorers.length + players.length).find((r) => r.playerId === playerId);
}

export function allTimeScorersMatchCount(): number {
  return finishedMatchesWithEvents();
}
