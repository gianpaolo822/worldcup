/**
 * 合并 data/generated/matches.json + data/overrides.json → data/matches.json
 */

import fs from 'node:fs';
import { PATHS } from './paths.js';
import type { Match, MatchOverride, OverridesFile } from './types.js';

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, 'utf8')) as T;
}

function applyOverride(match: Match, override?: MatchOverride): Match {
  if (!override) return match;
  return {
    ...match,
    homeScore: override.homeScore !== undefined ? override.homeScore : match.homeScore,
    awayScore: override.awayScore !== undefined ? override.awayScore : match.awayScore,
    status: override.status ?? match.status,
  };
}

function main(): void {
  const baseMatches = readJson<Match[]>(PATHS.generatedMatches);
  const overrides = readJson<OverridesFile>(PATHS.overrides);

  const merged = baseMatches.map((m) => applyOverride(m, overrides.matches[m.id]));

  const unknownIds = Object.keys(overrides.matches).filter(
    (id) => !baseMatches.some((m) => m.id === id),
  );
  if (unknownIds.length > 0) {
    console.warn(
      `[data:merge] overrides 中存在未知 match id（将被忽略）: ${unknownIds.join(', ')}`,
    );
  }

  fs.writeFileSync(PATHS.matches, `${JSON.stringify(merged, null, 2)}\n`, 'utf8');
  console.log(`[data:merge] matches=${merged.length} overrides applied=${Object.keys(overrides.matches).length}`);
}

main();
