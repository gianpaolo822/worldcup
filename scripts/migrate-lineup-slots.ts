/**
 * Phase 2：将 match-lineups.json 中的 legacy 槽位键迁移为标准槽位名
 *
 * 用法：
 *   npx tsx scripts/migrate-lineup-slots.ts          # 执行写入
 *   npx tsx scripts/migrate-lineup-slots.ts --dry-run # 仅预览
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import lineupsJson from '../data/match-lineups.json';
import { normalizeFormation, validateFormationSlots } from '../worldcup-web/src/lib/lineup/slots';
import type { LineupSlot } from '../worldcup-web/src/lib/lineup/slots';

type StarterEntry = { playerId: string; captain?: boolean };
type Starters = Partial<Record<string, StarterEntry>>;

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const lineupsPath = path.join(root, 'data/match-lineups.json');
const dryRun = process.argv.includes('--dry-run');

function cloneStarters(starters: Starters): Starters {
  return JSON.parse(JSON.stringify(starters)) as Starters;
}

function renameSlot(starters: Starters, from: string, to: string, log: string[]): boolean {
  if (!starters[from]) return false;
  if (starters[to]) {
    log.push(`  skip ${from}→${to}（${to} 已占用）`);
    return false;
  }
  starters[to] = starters[from];
  delete starters[from];
  log.push(`  ${from} → ${to}`);
  return true;
}

/** 三中卫：LCB+CB+RCB 标准键（3-4-2-1 / 3-4-3） */
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
  }
}

function fixFourCenterBackKeys(
  starters: Starters,
  formation: string,
  log: string[],
): void {
  if (!starters.LB || !starters.LCB || !starters.CB || !starters.RCB) return;
  const cb = starters.CB;
  const displaced = starters.LCB;

  starters.LCB = cb.captain || !displaced.captain ? cb : displaced;
  delete starters.CB;

  const displacedId =
    starters.LCB.playerId === cb.playerId ? displaced.playerId : cb.playerId;

  if (starters.LCB.playerId === cb.playerId) {
    log.push(
      `  四中卫键: CB→LCB（${cb.playerId}${cb.captain ? ', 队长' : ''}），原 LCB（${displaced.playerId}）`,
    );
  } else {
    log.push(`  四中卫键: 保留 LCB（${displaced.playerId}），移除 CB（${cb.playerId}）`);
  }

  const f = normalizeFormation(formation);
  if (f === '3-4-3' && !starters.CAM && displacedId) {
    starters.CAM = displaced.playerId === displacedId ? displaced : cb;
    log.push(`  原 LCB 球员 ${starters.CAM.playerId} → CAM`);
  } else if (displacedId !== starters.LCB.playerId) {
    log.push(`  ⚠ 原 LCB 球员 ${displacedId} 未分配新槽位（请核对）`);
  }
}

function migrateStarters(formation: string, startersIn: Starters): { starters: Starters; log: string[] } {
  const f = normalizeFormation(formation);
  const starters = cloneStarters(startersIn);
  const log: string[] = [];

  switch (f) {
    case '3-4-2-1':
      if (starters.RW && starters.RB && !starters.SS) {
        renameSlot(starters, 'RW', 'SS', log);
      } else if (starters.RW && starters.SS && !starters.RB) {
        renameSlot(starters, 'RW', 'RB', log);
      }
      if (starters.LWB && !starters.LW) renameSlot(starters, 'LWB', 'LW', log);
      else if (starters.LWB && !starters.LB) renameSlot(starters, 'LWB', 'LB', log);
      if (starters.RWB && !starters.RB) renameSlot(starters, 'RWB', 'RB', log);
      if (starters.LM && !starters.LW) renameSlot(starters, 'LM', 'LW', log);
      canonicalizeThreeBackDefense(starters, log);
      break;

    case '3-4-3':
      if (starters.LWB && !starters.LW) renameSlot(starters, 'LWB', 'LW', log);
      if (starters.RWB && !starters.RB) renameSlot(starters, 'RWB', 'RB', log);
      canonicalizeThreeBackDefense(starters, log);
      fixFourCenterBackKeys(starters, f, log);
      if (starters.CB && !starters.LCB && starters.LB) {
        renameSlot(starters, 'CB', 'LCB', log);
      }
      break;

    case '4-4-2':
      if (starters.LM && !starters.LW) renameSlot(starters, 'LM', 'LW', log);
      if (starters.RM && !starters.RW) renameSlot(starters, 'RM', 'RW', log);
      if (starters.LCM && !starters.LDM) renameSlot(starters, 'LCM', 'LDM', log);
      if (starters.RCM && !starters.RDM) renameSlot(starters, 'RCM', 'RDM', log);
      if (starters.SS && !starters.CAM) renameSlot(starters, 'SS', 'CAM', log);
      break;

    case '4-3-3':
      if (starters.LCM && !starters.LDM) renameSlot(starters, 'LCM', 'LDM', log);
      if (starters.RCM && !starters.RDM) renameSlot(starters, 'RCM', 'RDM', log);
      if (starters.CM && !starters.CAM) renameSlot(starters, 'CM', 'CAM', log);
      else if (starters.CM && !starters.RDM) renameSlot(starters, 'CM', 'RDM', log);
      break;

    default:
      break;
  }

  return { starters, log };
}

const lineups = JSON.parse(JSON.stringify(lineupsJson)) as typeof lineupsJson;
let migratedTeams = 0;
const allLogs: string[] = [];

for (const [matchId, raw] of Object.entries(lineups.lineups)) {
  for (const side of ['home', 'away'] as const) {
    const team = raw[side];
    const before = Object.keys(team.starters).sort().join(',');
    const { starters, log } = migrateStarters(team.formation, team.starters);
    const after = Object.keys(starters).sort().join(',');

    if (log.length > 0) {
      migratedTeams++;
      allLogs.push(`${matchId} ${side} ${team.formation}:`);
      allLogs.push(...log);
      const check = validateFormationSlots(team.formation, Object.keys(starters));
      if (!check.ok) {
        allLogs.push(`  ⚠ 校验: ${check.errors.join('; ')}`);
      }
    }

    team.starters = starters as typeof team.starters;

    if (before !== after && log.length === 0) {
      allLogs.push(`${matchId} ${side}: keys changed without log? ${before} → ${after}`);
    }
  }
}

console.log(`[migrate-lineup-slots] ${dryRun ? 'DRY RUN — ' : ''}${migratedTeams} team(s) migrated`);

if (allLogs.length > 0) {
  console.log(allLogs.join('\n'));
}

if (!dryRun) {
  fs.writeFileSync(lineupsPath, `${JSON.stringify(lineups, null, 2)}\n`, 'utf8');
  console.log(`[migrate-lineup-slots] wrote ${lineupsPath}`);
} else {
  console.log('[migrate-lineup-slots] no files written (dry run)');
}
