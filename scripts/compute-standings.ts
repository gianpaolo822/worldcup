/**
 * 根据 data/matches.json 中 status=finished 的场次计算 data/standings.json
 * 排序：积分降序 → 净胜球降序 → 进球降序
 */

import fs from 'node:fs';
import { PATHS } from './paths.js';
import type { Match, StandingRow, StandingsByGroup, Team } from './types.js';

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, 'utf8')) as T;
}

function emptyRow(team: Team): StandingRow {
  return {
    rank: 0,
    team,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    gf: 0,
    ga: 0,
    gd: 0,
    points: 0,
  };
}

function addResult(row: StandingRow, gf: number, ga: number): void {
  row.played += 1;
  row.gf += gf;
  row.ga += ga;
  row.gd = row.gf - row.ga;
  if (gf > ga) {
    row.won += 1;
    row.points += 3;
  } else if (gf === ga) {
    row.drawn += 1;
    row.points += 1;
  } else {
    row.lost += 1;
  }
}

function computeStandings(matches: Match[], teams: Team[]): StandingsByGroup {
  const groups = [...new Set(teams.map((t) => t.group))].sort();
  const standings: StandingsByGroup = {};

  for (const group of groups) {
    const groupTeams = teams.filter((t) => t.group === group);
    const rows = new Map(groupTeams.map((t) => [t.id, emptyRow(t)]));

    const finished = matches.filter(
      (m) => m.group === group && m.status === 'finished' && m.homeScore != null && m.awayScore != null,
    );

    for (const m of finished) {
      const home = rows.get(m.homeTeam.id);
      const away = rows.get(m.awayTeam.id);
      if (!home || !away) continue;
      addResult(home, m.homeScore!, m.awayScore!);
      addResult(away, m.awayScore!, m.homeScore!);
    }

    const sorted = [...rows.values()].sort(
      (a, b) => b.points - a.points || b.gd - a.gd || b.gf - a.gf,
    );
    sorted.forEach((r, i) => {
      r.rank = i + 1;
    });
    standings[group] = sorted;
  }

  return standings;
}

function main(): void {
  const matches = readJson<Match[]>(PATHS.matches);
  const teams = readJson<Team[]>(PATHS.teams);
  const standings = computeStandings(matches, teams);

  fs.writeFileSync(PATHS.standings, `${JSON.stringify(standings, null, 2)}\n`, 'utf8');

  const groupCount = Object.keys(standings).length;
  const finishedCount = matches.filter((m) => m.status === 'finished').length;
  console.log(`[data:standings] groups=${groupCount} finished_matches=${finishedCount}`);
}

main();
