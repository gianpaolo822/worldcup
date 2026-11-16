/**
 * 将 FIFA 官方淘汰赛对阵树（W/L 占位）写回 data/generated/matches.json，
 * 并按 official-kickoff-times.json 校正 m089+ 的球场城市。
 */

import fs from 'node:fs';
import path from 'node:path';
import {
  applyKnockoutBracketSlots,
  KNOCKOUT_BRACKET_SLOTS,
} from '../shared/knockout-bracket.js';
import { DATA_DIR, PATHS } from './paths.js';
import type { Match } from './types.js';

type OfficialKickoffEntry = {
  seq: number;
  cityZh: string;
  beijingTime: string;
  kickoffAt: string;
};

type OfficialKickoffTimesFile = {
  matches: OfficialKickoffEntry[];
};

type Venue = {
  name: string;
  city: string;
};

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, 'utf8')) as T;
}

function matchSeq(id: string): number | null {
  const m = /^wc2026-m(\d+)$/.exec(id);
  return m ? Number.parseInt(m[1], 10) : null;
}

function buildVenueByCity(venues: Venue[]): Map<string, Venue> {
  const map = new Map<string, Venue>();
  for (const venue of venues) {
    if (!map.has(venue.city)) map.set(venue.city, venue);
  }
  const houston = map.get('休斯敦');
  if (houston) map.set('休斯顿', houston);
  return map;
}

function cityShort(city: string): string {
  const table: Record<string, string> = {
    温哥华: 'VAN',
    多伦多: 'TOR',
    墨西哥城: 'MEX',
    萨波潘: 'GDL',
    蒙特雷: 'MTY',
    达拉斯: 'ARL',
    阿灵顿: 'ARL',
    '纽约/新泽西': 'NY',
    堪萨斯城: 'KC',
    亚特兰大: 'ATL',
    休斯敦: 'HOU',
    休斯顿: 'HOU',
    圣克拉拉: 'SJ',
    洛杉矶: 'LA',
    西雅图: 'SEA',
    费城: 'PHI',
    波士顿: 'BOS',
    福克斯堡: 'BOS',
    迈阿密: 'MIA',
  };
  return table[city] ?? city.slice(0, 3).toUpperCase();
}

function main(): void {
  const matches = readJson<Match[]>(PATHS.generatedMatches);
  const venues = readJson<Venue[]>(path.join(DATA_DIR, 'venues.json'));
  const official = readJson<OfficialKickoffTimesFile>(PATHS.officialKickoffTimes);
  const officialBySeq = new Map(official.matches.map((m) => [m.seq, m]));
  const venueByCity = buildVenueByCity(venues);

  let venueCount = 0;

  const withSlots = applyKnockoutBracketSlots(matches).map((match) => {
    const seq = matchSeq(match.id);
    if (seq == null || seq < 89) return match as Match;

    const kickoff = officialBySeq.get(seq);
    if (!kickoff) return match as Match;

    const venue = venueByCity.get(kickoff.cityZh);
    if (!venue) return match as Match;

    venueCount++;
    return {
      ...(match as Match),
      time: kickoff.beijingTime,
      kickoffAt: kickoff.kickoffAt,
      venue: venue.name,
      venueCity: kickoff.cityZh,
      venueShort: cityShort(kickoff.cityZh),
    };
  });

  fs.writeFileSync(PATHS.generatedMatches, `${JSON.stringify(withSlots, null, 2)}\n`, 'utf8');
  console.log(
    `[sync-knockout-bracket] bracketSlots=${Object.keys(KNOCKOUT_BRACKET_SLOTS).length} venueUpdates=${venueCount}`,
  );
}

main();
