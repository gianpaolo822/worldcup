/**
 * 从 openfootball/worldcup.json 拉取 2026 数据，写入 data/generated/。
 * 若网络失败或上游格式未就绪，回退到内置种子数据（便于本地开发与 Phase 1 验收）。
 *
 * TODO Phase 1：对接 openfootball 真实 JSON 结构后替换 parseOpenFootball()。
 * 数据源：https://github.com/openfootball/worldcup.json
 */

import fs from 'node:fs';
import path from 'node:path';
import { GENERATED_DIR, PATHS } from './paths.js';
import type { Match, SyncMeta, Team } from './types.js';

const OPENFOOTBALL_RAW =
  'https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026%20--%20World%20Cup/worldcup.json';

/** MVP 种子：openfootball 未就绪或拉取失败时使用 */
function seedData(): { teams: Team[]; matches: Match[] } {
  const teams: Team[] = [
    { id: 'arg', name: '阿根廷', nameEn: 'Argentina', code: 'ARG', group: 'A', flag: '🇦🇷', color: 'from-sky-400 to-sky-600' },
    { id: 'fra', name: '法国', nameEn: 'France', code: 'FRA', group: 'A', flag: '🇫🇷', color: 'from-blue-700 to-blue-900' },
    { id: 'usa', name: '美国', nameEn: 'USA', code: 'USA', group: 'A', flag: '🇺🇸', color: 'from-red-600 to-blue-700' },
    { id: 'cmr', name: '喀麦隆', nameEn: 'Cameroon', code: 'CMR', group: 'A', flag: '🇨🇲', color: 'from-green-500 to-red-500' },
    { id: 'esp', name: '西班牙', nameEn: 'Spain', code: 'ESP', group: 'B', flag: '🇪🇸', color: 'from-red-600 to-yellow-500' },
    { id: 'ger', name: '德国', nameEn: 'Germany', code: 'GER', group: 'B', flag: '🇩🇪', color: 'from-black to-red-600' },
    { id: 'mar', name: '摩洛哥', nameEn: 'Morocco', code: 'MAR', group: 'B', flag: '🇲🇦', color: 'from-red-600 to-green-600' },
    { id: 'kor', name: '韩国', nameEn: 'South Korea', code: 'KOR', group: 'B', flag: '🇰🇷', color: 'from-white to-red-600' },
  ];

  const byId = Object.fromEntries(teams.map((t) => [t.id, t]));

  const matches: Match[] = [
    {
      id: 'wc2026-a-1',
      homeTeam: byId.arg,
      awayTeam: byId.fra,
      homeScore: null,
      awayScore: null,
      status: 'upcoming',
      time: '2026-06-12 20:00',
      kickoffAt: '2026-06-12T12:00:00.000Z',
      venue: '大都会人寿体育场',
      venueShort: 'NY',
      matchday: 1,
      group: 'A',
      stage: '小组赛',
    },
    {
      id: 'wc2026-a-2',
      homeTeam: byId.usa,
      awayTeam: byId.cmr,
      homeScore: null,
      awayScore: null,
      status: 'upcoming',
      time: '2026-06-12 23:00',
      kickoffAt: '2026-06-12T15:00:00.000Z',
      venue: 'SoFi体育场',
      venueShort: 'LA',
      matchday: 1,
      group: 'A',
      stage: '小组赛',
    },
    {
      id: 'wc2026-b-1',
      homeTeam: byId.esp,
      awayTeam: byId.ger,
      homeScore: null,
      awayScore: null,
      status: 'upcoming',
      time: '2026-06-13 20:00',
      kickoffAt: '2026-06-13T12:00:00.000Z',
      venue: 'AT&T体育场',
      venueShort: 'DAL',
      matchday: 1,
      group: 'B',
      stage: '小组赛',
    },
    {
      id: 'wc2026-b-2',
      homeTeam: byId.mar,
      awayTeam: byId.kor,
      homeScore: null,
      awayScore: null,
      status: 'upcoming',
      time: '2026-06-13 23:00',
      kickoffAt: '2026-06-13T15:00:00.000Z',
      venue: '硬石体育场',
      venueShort: 'MIA',
      matchday: 1,
      group: 'B',
      stage: '小组赛',
    },
  ];

  return { teams, matches };
}

async function fetchOpenFootball(): Promise<unknown | null> {
  try {
    const res = await fetch(OPENFOOTBALL_RAW);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

function parseOpenFootball(_raw: unknown): { teams: Team[]; matches: Match[] } | null {
  // TODO: 按 openfootball 实际结构解析；当前返回 null 走种子
  return null;
}

function writeJson(filePath: string, data: unknown): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

async function main(): Promise<void> {
  const raw = await fetchOpenFootball();
  const parsed = raw ? parseOpenFootball(raw) : null;
  const { teams, matches } = parsed ?? seedData();

  const meta: SyncMeta = {
    syncedAt: new Date().toISOString(),
    source: parsed ? OPENFOOTBALL_RAW : 'seed',
    note: parsed ? undefined : 'openfootball 未解析或拉取失败，使用内置种子',
  };

  writeJson(PATHS.generatedTeams, teams);
  writeJson(PATHS.generatedMatches, matches);
  writeJson(PATHS.syncMeta, meta);

  // 球队列表同步到 data/teams.json（与 generated 一致，merge 不改动球队）
  writeJson(PATHS.teams, teams);

  console.log(`[data:sync] teams=${teams.length} matches=${matches.length} source=${meta.source}`);
  if (meta.note) console.log(`[data:sync] ${meta.note}`);
}

main().catch((err) => {
  console.error('[data:sync] failed:', err);
  process.exit(1);
});
