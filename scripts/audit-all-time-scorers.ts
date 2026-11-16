import lineups from '../data/match-lineups.json';
import matches from '../data/matches.json';
import players from '../data/players.json';
import topScorers from '../data/top-scorers.json';
import careerBaselines from '../data/player-wc-career-baseline.json';

function normalizeNameKey(name: string): string {
  return name
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

const finished = new Set(matches.filter((m) => m.status === 'finished').map((m) => m.id));
const goals2026 = new Map<string, number>();

for (const [matchId, raw] of Object.entries(lineups.lineups)) {
  if (!finished.has(matchId)) continue;
  for (const ev of raw.events ?? []) {
    if (ev.type === 'goal' && !ev.note?.includes('乌龙')) {
      goals2026.set(ev.playerId, (goals2026.get(ev.playerId) ?? 0) + 1);
    }
  }
}

const topByName = new Map(topScorers.map((s) => [normalizeNameKey(s.nameEn), s]));
const careerById = careerBaselines.players as Record<string, { goalsBefore2026: number }>;

const missingBaseline: Array<{
  id: string;
  nameEn: string;
  nameZh: string;
  goals2026: number;
}> = [];

const hasBaseline: Array<{
  id: string;
  nameEn: string;
  goalsBefore2026: number;
  goals2026: number;
  total: number;
  source: string;
}> = [];

for (const p of players) {
  const g26 = goals2026.get(p.id) ?? 0;
  if (g26 <= 0) continue;
  const baseline = topByName.get(normalizeNameKey(p.nameEn));
  const career = careerById[p.id];
  if (baseline) {
    hasBaseline.push({
      id: p.id,
      nameEn: p.nameEn,
      goalsBefore2026: baseline.goals,
      goals2026: g26,
      total: baseline.goals + g26,
      source: 'top-scorers.json',
    });
  } else if (career) {
    hasBaseline.push({
      id: p.id,
      nameEn: p.nameEn,
      goalsBefore2026: career.goalsBefore2026,
      goals2026: g26,
      total: career.goalsBefore2026 + g26,
      source: 'player-wc-career-baseline.json',
    });
  } else {
    missingBaseline.push({
      id: p.id,
      nameEn: p.nameEn,
      nameZh: p.nameZh ?? p.nameEn,
      goals2026: g26,
    });
  }
}

missingBaseline.sort((a, b) => b.goals2026 - a.goals2026);
hasBaseline.sort((a, b) => b.total - a.total);

console.log('=== 本届有进球但未录入历届基线 (top-scorers.json) ===');
for (const row of missingBaseline) {
  console.log(`${row.nameZh} (${row.nameEn}) ${row.id}: 仅统计本届 ${row.goals2026} 球`);
}

console.log('\n=== 已录入历届基线 + 本届 ===');
for (const row of hasBaseline.slice(0, 20)) {
  console.log(
    `${row.nameEn} [${row.source}]: 历届 ${row.goalsBefore2026} + 本届 ${row.goals2026} = ${row.total}`,
  );
}

console.log(`\nMissing baseline count: ${missingBaseline.length}`);
console.log(`With baseline count: ${hasBaseline.length}`);
