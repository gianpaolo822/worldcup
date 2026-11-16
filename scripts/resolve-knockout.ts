/**
 * 小组赛结束后：计算出线球队，解析 32 强真实对阵并写入 data/knockout-teams.json、data/qualification.json
 */

import fs from 'node:fs';
import { PATHS } from './paths.js';
import {
  matrixKeyFromGroups,
  ROUND_OF_32_MATCH_SLOTS,
  RUNNER_UP_FALLBACK_FOR_WINNER_SLOTS,
  RUNNER_UP_PAIRINGS,
  THIRD_PLACE_MATRIX,
  WINNER_THIRD_SLOTS,
  type WinnerThirdSlot,
} from './third-place-matrix.js';
import type { Match, StandingRow, StandingsByGroup, Team } from './types.js';

const GROUPS = 'ABCDEFGHIJKL'.split('');
const THIRD_PLACE_QUALIFY_COUNT = 8;

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, 'utf8')) as T;
}

function compareThirdRows(a: StandingRow, b: StandingRow): number {
  return b.points - a.points || b.gd - a.gd || b.gf - a.gf || a.team.code.localeCompare(b.team.code);
}

function isGroupStageComplete(matches: Match[]): boolean {
  const groupMatches = matches.filter((m) => m.stage === '小组赛');
  return groupMatches.length > 0 && groupMatches.every((m) => m.status === 'finished');
}

function getTeamByGroupRank(
  standings: StandingsByGroup,
  group: string,
  rank: number,
): Team | undefined {
  return standings[group]?.find((r) => r.rank === rank)?.team;
}

function resolveRoundOf32Teams(
  standings: StandingsByGroup,
  qualifiedThirdGroups: string[],
): Record<string, { homeTeamId: string; awayTeamId: string }> {
  const key = matrixKeyFromGroups(qualifiedThirdGroups);
  const thirdAssignments = THIRD_PLACE_MATRIX[key];
  const runnerFallback = RUNNER_UP_FALLBACK_FOR_WINNER_SLOTS[key];
  const runnerPairs = RUNNER_UP_PAIRINGS[key];

  if (!thirdAssignments || !runnerFallback || !runnerPairs) {
    throw new Error(
      `[resolve-knockout] 未找到 Annex C 分配表：${key}（需补充 third-place-matrix.ts）`,
    );
  }

  const thirdByGroup = new Map<string, Team>();
  for (const group of qualifiedThirdGroups) {
    const team = getTeamByGroupRank(standings, group, 3);
    if (!team) throw new Error(`[resolve-knockout] 缺少 ${group} 组第三名数据`);
    thirdByGroup.set(group, team);
  }

  const winnerThirdAway = new Map<WinnerThirdSlot, Team>();
  for (const slot of WINNER_THIRD_SLOTS) {
    const thirdGroup = thirdAssignments[slot];
    const team = thirdByGroup.get(thirdGroup);
    if (!team) throw new Error(`[resolve-knockout] 第三名组 ${thirdGroup} 未晋级，与矩阵 ${key} 冲突`);
    winnerThirdAway.set(slot, team);
  }

  const result: Record<string, { homeTeamId: string; awayTeamId: string }> = {};

  for (const [matchId, slot] of Object.entries(ROUND_OF_32_MATCH_SLOTS)) {
    if (slot.kind === 'winner-third') {
      const home = getTeamByGroupRank(standings, slot.home.slice(1), 1);
      const away = winnerThirdAway.get(slot.home as WinnerThirdSlot);
      if (!home || !away) throw new Error(`[resolve-knockout] 无法解析 ${matchId}`);
      result[matchId] = { homeTeamId: home.id, awayTeamId: away.id };
      continue;
    }

    if (slot.kind === 'winner-runner-up') {
      const winnerGroup = slot.home.slice(1);
      const runnerGroup = runnerFallback[slot.home as '1C' | '1F' | '1H' | '1J'];
      if (!runnerGroup) throw new Error(`[resolve-knockout] 缺少 ${slot.home} 的第二名落位`);
      const home = getTeamByGroupRank(standings, winnerGroup, 1);
      const away = getTeamByGroupRank(standings, runnerGroup, 2);
      if (!home || !away) throw new Error(`[resolve-knockout] 无法解析 ${matchId}`);
      result[matchId] = { homeTeamId: home.id, awayTeamId: away.id };
      continue;
    }

    const pair = runnerPairs[slot.pairIndex ?? 0];
    const home = getTeamByGroupRank(standings, pair[0], 2);
    const away = getTeamByGroupRank(standings, pair[1], 2);
    if (!home || !away) throw new Error(`[resolve-knockout] 无法解析 ${matchId}`);
    result[matchId] = { homeTeamId: home.id, awayTeamId: away.id };
  }

  return result;
}

function buildQualificationFile(
  standings: StandingsByGroup,
  groupStageComplete: boolean,
): object {
  const thirdEvaluations = GROUPS.map((group) => {
    const row = standings[group]?.find((r) => r.rank === 3);
    if (!row) return null;
    return { group, row };
  }).filter((x): x is { group: string; row: StandingRow } => x != null);

  thirdEvaluations.sort((a, b) => compareThirdRows(a.row, b.row));
  const qualifiedThirdGroups = thirdEvaluations.slice(0, THIRD_PLACE_QUALIFY_COUNT).map((x) => x.group);
  const eliminatedThirdGroups = thirdEvaluations.slice(THIRD_PLACE_QUALIFY_COUNT).map((x) => x.group);

  const qualifiedTeams: Array<{
    teamId: string;
    group: string;
    path: 'group_winner' | 'group_runner_up' | 'best_third';
    rankAmongThirds?: number;
  }> = [];

  for (const group of GROUPS) {
    const rows = standings[group] ?? [];
    const first = rows.find((r) => r.rank === 1);
    const second = rows.find((r) => r.rank === 2);
    if (first) qualifiedTeams.push({ teamId: first.team.id, group, path: 'group_winner' });
    if (second) qualifiedTeams.push({ teamId: second.team.id, group, path: 'group_runner_up' });
  }

  thirdEvaluations.forEach((item, index) => {
    if (index >= THIRD_PLACE_QUALIFY_COUNT) return;
    qualifiedTeams.push({
      teamId: item.row.team.id,
      group: item.group,
      path: 'best_third',
      rankAmongThirds: index + 1,
    });
  });

  return {
    groupStageComplete,
    thirdPlaceQualifiedGroups: qualifiedThirdGroups,
    thirdPlaceEliminatedGroups: eliminatedThirdGroups,
    matrixKey: matrixKeyFromGroups(qualifiedThirdGroups),
    thirdPlaceRanking: thirdEvaluations.map((item, index) => ({
      rankAmongThirds: index + 1,
      group: item.group,
      teamId: item.row.team.id,
      teamName: item.row.team.name,
      points: item.row.points,
      gd: item.row.gd,
      gf: item.row.gf,
      qualified: index < THIRD_PLACE_QUALIFY_COUNT,
    })),
    qualifiedTeams,
    standingsByGroup: standings,
  };
}

function main(): void {
  const matches = readJson<Match[]>(PATHS.matches);
  const standings = readJson<StandingsByGroup>(PATHS.standings);
  const groupStageComplete = isGroupStageComplete(matches);

  const qualification = buildQualificationFile(standings, groupStageComplete);
  fs.writeFileSync(
    PATHS.qualification,
    `${JSON.stringify(qualification, null, 2)}\n`,
    'utf8',
  );

  if (!groupStageComplete) {
    console.log('[resolve-knockout] 小组赛未全部结束，仅更新 qualification.json');
    return;
  }

  const qualifiedThirdGroups = (qualification as { thirdPlaceQualifiedGroups: string[] })
    .thirdPlaceQualifiedGroups;
  const roundOf32 = resolveRoundOf32Teams(standings, qualifiedThirdGroups);

  fs.writeFileSync(
    PATHS.knockoutTeams,
    `${JSON.stringify({ roundOf32 }, null, 2)}\n`,
    'utf8',
  );

  console.log(
    `[resolve-knockout] matrix=${matrixKeyFromGroups(qualifiedThirdGroups)} r32_matches=${Object.keys(roundOf32).length}`,
  );
}

main();
