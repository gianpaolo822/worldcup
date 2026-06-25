/**
 * 按 data/fifa-members.json（FIFA 官方名称）更新球队与赛程嵌入队名
 */

import fs from 'node:fs';
import path from 'node:path';
import { parseFifaMembersMarkdown, writeFifaMembersJson, type FifaMember } from './import-fifa-members.js';
import { DATA_DIR, PATHS } from './paths.js';
import type { Match, Team } from './types.js';

/** 项目内中文简称（英文名仍用 FIFA 官方表） */
const NAME_ZH_SHORT: Record<string, string> = {
  CZE: '捷克',
  BIH: '波黑',
  COD: '民主刚果',
};

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, 'utf8')) as T;
}

function writeJson(filePath: string, data: unknown): void {
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

function ensureFifaMembersJson(): FifaMember[] {
  const jsonPath = path.join(DATA_DIR, 'fifa-members.json');
  const mdPath = path.join(DATA_DIR, 'official', 'fifa-members.md');

  if (!fs.existsSync(jsonPath) || fs.statSync(mdPath).mtimeMs > fs.statSync(jsonPath).mtimeMs) {
    const markdown = fs.readFileSync(mdPath, 'utf8');
    writeFifaMembersJson(parseFifaMembersMarkdown(markdown));
  }

  return readJson<{ members: FifaMember[] }>(jsonPath).members;
}

function applyFifaToTeam(team: Team, fifa: FifaMember): Team {
  const name = NAME_ZH_SHORT[fifa.code] ?? fifa.nameZh;
  return {
    ...team,
    name,
    nameEn: fifa.nameEn,
    code: fifa.code,
  };
}

function applyFifaToMatchTeam(team: Team, byCode: Map<string, FifaMember>): Team {
  const fifa = byCode.get(team.code);
  return fifa ? applyFifaToTeam(team, fifa) : team;
}

export function applyFifaNames(): { changes: string[]; missing: string[] } {
  const byCode = new Map(ensureFifaMembersJson().map((m) => [m.code, m]));
  const teams = readJson<Team[]>(PATHS.teams);
  const changes: string[] = [];
  const missing: string[] = [];

  const updatedTeams = teams.map((team) => {
    const fifa = byCode.get(team.code);
    if (!fifa) {
      missing.push(`${team.id} (${team.code})`);
      return team;
    }
    const displayName = NAME_ZH_SHORT[fifa.code] ?? fifa.nameZh;
    if (team.name !== displayName || team.nameEn !== fifa.nameEn || team.code !== fifa.code) {
      changes.push(
        `${team.code} ${team.id}: 「${team.name} / ${team.nameEn}」→「${displayName} / ${fifa.nameEn}」`,
      );
    }
    return applyFifaToTeam(team, fifa);
  });

  writeJson(PATHS.teams, updatedTeams);
  writeJson(PATHS.generatedTeams, updatedTeams);

  const matches = readJson<Match[]>(PATHS.generatedMatches);
  const updatedMatches = matches.map((match) => ({
    ...match,
    homeTeam: applyFifaToMatchTeam(match.homeTeam, byCode),
    awayTeam: applyFifaToMatchTeam(match.awayTeam, byCode),
  }));
  writeJson(PATHS.generatedMatches, updatedMatches);

  return { changes, missing };
}

function main(): void {
  const { changes, missing } = applyFifaNames();

  if (missing.length > 0) {
    console.warn(`[data:fifa] 未在 FIFA 表中找到 code: ${missing.join(', ')}`);
  }

  if (changes.length === 0) {
    console.log('[data:fifa] 48 支球队名称已与 FIFA 官方表一致，无需变更');
  } else {
    console.log(`[data:fifa] 已更新 ${changes.length} 支球队:`);
    for (const line of changes) {
      console.log(`  · ${line}`);
    }
  }
}

main();
