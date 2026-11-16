/**
 * 三后卫槽位统一为 LCB / CB / RCB
 *
 *   npx tsx scripts/migrate-three-back-slots.ts
 *   npx tsx scripts/migrate-three-back-slots.ts --dry-run
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import lineupsJson from '../data/match-lineups.json';
import { normalizeFormation, validateFormationSlots } from '../worldcup-web/src/lib/lineup/slots';

type StarterEntry = { playerId: string; captain?: boolean };
type Starters = Partial<Record<string, StarterEntry>>;

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const lineupsPath = path.join(root, 'data/match-lineups.json');
const dryRun = process.argv.includes('--dry-run');

const THREE_BACK = new Set(['3-4-2-1', '3-4-3']);

function cloneStarters(starters: Starters): Starters {
  return JSON.parse(JSON.stringify(starters)) as Starters;
}

/** LB/LCB/RCB 或缺 CB → LCB/CB/RCB */
function canonicalizeThreeBackDefense(starters: Starters, log: string[]): void {
  if (starters.LCB && starters.CB && starters.RCB && !starters.LB) return;

  if (starters.LB && starters.LCB && starters.RCB && !starters.CB) {
    starters.CB = starters.LCB;
    starters.LCB = starters.LB;
    delete starters.LB;
    log.push('  三中卫: LB→LCB, 原LCB→CB');
    return;
  }

  if (starters.LB && starters.CB && starters.RCB && !starters.LCB) {
    starters.LCB = starters.LB;
    delete starters.LB;
    log.push('  三中卫: LB→LCB');
    return;
  }

  if (starters.LB && starters.LCB && starters.CB && starters.RCB) {
    delete starters.LB;
    log.push('  三中卫: 移除多余 LB');
  }
}

const lineups = JSON.parse(JSON.stringify(lineupsJson)) as typeof lineupsJson;
let count = 0;
const logs: string[] = [];

for (const [matchId, raw] of Object.entries(lineups.lineups)) {
  for (const side of ['home', 'away'] as const) {
    const team = raw[side];
    const f = normalizeFormation(team.formation);
    if (!THREE_BACK.has(f)) continue;

    const starters = cloneStarters(team.starters);
    const log: string[] = [];
    canonicalizeThreeBackDefense(starters, log);

    if (log.length === 0) continue;

    count++;
    logs.push(`${matchId} ${side} ${f}:`);
    logs.push(...log);

    const check = validateFormationSlots(team.formation, Object.keys(starters));
    if (!check.ok) {
      logs.push(`  ⚠ ${check.errors.join('; ')}`);
    }

    team.starters = starters as typeof team.starters;
  }
}

console.log(`[migrate-three-back] ${dryRun ? 'DRY RUN — ' : ''}${count} team(s)`);
if (logs.length) console.log(logs.join('\n'));

if (!dryRun && count > 0) {
  fs.writeFileSync(lineupsPath, `${JSON.stringify(lineups, null, 2)}\n`, 'utf8');
  console.log(`[migrate-three-back] wrote ${lineupsPath}`);
} else if (!dryRun) {
  console.log('[migrate-three-back] nothing to write');
}
