/**
 * 合并 data/generated/matches.json + data/overrides.json → data/matches.json
 */

import fs from 'node:fs';
import { PATHS } from './paths.js';
import { resolveKnockoutBracket } from '../shared/knockout-bracket.js';
import type { KnockoutTeamsFile, Match, MatchOverride, OverridesFile, Team } from './types.js';

type OfficialKickoffEntry = {
  seq: number;
  beijingTime: string;
  kickoffAt: string;
};

type OfficialKickoffTimesFile = {
  matches: OfficialKickoffEntry[];
};

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, 'utf8')) as T;
}

function applyTeamOverride(
  match: Match,
  teamIds: { homeTeamId?: string; awayTeamId?: string } | undefined,
  teamsById: Map<string, Team>,
): Match {
  if (!teamIds) return match;
  const homeTeam = teamIds.homeTeamId ? teamsById.get(teamIds.homeTeamId) : undefined;
  const awayTeam = teamIds.awayTeamId ? teamsById.get(teamIds.awayTeamId) : undefined;
  if (!homeTeam || !awayTeam) return match;
  return { ...match, homeTeam, awayTeam };
}

function applyOverride(
  match: Match,
  override: MatchOverride | undefined,
  teamsById: Map<string, Team>,
): Match {
  let next = match;
  if (override) {
    next = {
      ...next,
      homeScore: override.homeScore !== undefined ? override.homeScore : next.homeScore,
      awayScore: override.awayScore !== undefined ? override.awayScore : next.awayScore,
      homePenScore:
        override.homePenScore !== undefined ? override.homePenScore : next.homePenScore,
      awayPenScore:
        override.awayPenScore !== undefined ? override.awayPenScore : next.awayPenScore,
      wentToExtraTime: override.wentToExtraTime ?? next.wentToExtraTime,
      winnerTeamId:
        override.winnerTeamId !== undefined ? override.winnerTeamId : next.winnerTeamId,
      status: override.status ?? next.status,
    };
    next = applyTeamOverride(
      next,
      { homeTeamId: override.homeTeamId, awayTeamId: override.awayTeamId },
      teamsById,
    );
  }
  return next;
}

function readKnockoutTeams(): KnockoutTeamsFile | null {
  if (!fs.existsSync(PATHS.knockoutTeams)) return null;
  return readJson<KnockoutTeamsFile>(PATHS.knockoutTeams);
}

function matchSeqFromId(id: string): number | null {
  const m = /^wc2026-m(\d+)$/.exec(id);
  if (!m) return null;
  return Number.parseInt(m[1], 10);
}

function readOfficialKickoffsBySeq(): Map<number, OfficialKickoffEntry> {
  if (!fs.existsSync(PATHS.officialKickoffTimes)) return new Map();
  const file = readJson<OfficialKickoffTimesFile>(PATHS.officialKickoffTimes);
  return new Map(file.matches.map((entry) => [entry.seq, entry]));
}

function applyOfficialKickoff(match: Match, officialBySeq: Map<number, OfficialKickoffEntry>): Match {
  const seq = matchSeqFromId(match.id);
  if (seq == null) return match;
  const official = officialBySeq.get(seq);
  if (!official) return match;
  return {
    ...match,
    time: official.beijingTime,
    kickoffAt: official.kickoffAt,
  };
}

function main(): void {
  const baseMatches = readJson<Match[]>(PATHS.generatedMatches);
  const overrides = readJson<OverridesFile>(PATHS.overrides);
  const teams = readJson<Team[]>(PATHS.teams);
  const teamsById = new Map(teams.map((t) => [t.id, t]));
  const knockoutTeams = readKnockoutTeams();
  const officialBySeq = readOfficialKickoffsBySeq();

  const merged = baseMatches.map((m) => {
    const scoreOverride = overrides.matches[m.id];
    const teamOverride = knockoutTeams?.roundOf32[m.id];
    const combined: MatchOverride | undefined =
      scoreOverride || teamOverride
        ? {
            ...scoreOverride,
            homeTeamId: teamOverride?.homeTeamId,
            awayTeamId: teamOverride?.awayTeamId,
          }
        : undefined;
    return applyOfficialKickoff(applyOverride(m, combined, teamsById), officialBySeq);
  });

  const resolved = resolveKnockoutBracket(merged, teamsById);

  const unknownIds = Object.keys(overrides.matches).filter(
    (id) => !baseMatches.some((m) => m.id === id),
  );
  if (unknownIds.length > 0) {
    console.warn(
      `[data:merge] overrides 中存在未知 match id（将被忽略）: ${unknownIds.join(', ')}`,
    );
  }

  fs.writeFileSync(PATHS.matches, `${JSON.stringify(resolved, null, 2)}\n`, 'utf8');
  console.log(`[data:merge] matches=${resolved.length} overrides applied=${Object.keys(overrides.matches).length}`);
}

main();
