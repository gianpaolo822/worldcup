/**
 * 校验 match-lineups.json：阵型、槽位、坐标、间距
 */
import lineupsJson from '../data/match-lineups.json';
import {
  isSupportedFormation,
  normalizeFormation,
  validateFormationSlots,
} from '../worldcup-web/src/lib/lineup/slots';
import { resolveSlotPosition } from '../worldcup-web/src/lib/lineup/resolve';
import {
  isWingAliasPair,
  MIN_SLOT_DISTANCE,
  slotDistance,
} from '../worldcup-web/src/lib/lineup/legacy';
import type { LineupSlot } from '../worldcup-web/src/lib/lineup/slots';

const lineups = lineupsJson.lineups;

let errorCount = 0;

function err(msg: string) {
  console.error(msg);
  errorCount++;
}

for (const [matchId, raw] of Object.entries(lineups)) {
  for (const side of ['home', 'away'] as const) {
    const team = raw[side];
    const formation = team.formation;

    if (!isSupportedFormation(formation)) {
      err(`${matchId} ${side}: 不支持阵型 ${formation}`);
      continue;
    }

    const slots = Object.keys(team.starters);
    const slotCheck = validateFormationSlots(formation, slots);
    if (!slotCheck.ok) {
      for (const e of slotCheck.errors) {
        err(`${matchId} ${side} ${normalizeFormation(formation)}: ${e}`);
      }
    }

    const positions: { slot: string; pos: { x: number; y: number } }[] = [];
    const coordKeys = new Map<string, string[]>();

    for (const [slot, entry] of Object.entries(team.starters) as [LineupSlot, { playerId: string }][]) {
      if (!entry?.playerId) {
        err(`${matchId} ${side}: 槽位 ${slot} 缺少 playerId`);
        continue;
      }
      const allSlots = Object.keys(team.starters) as LineupSlot[];
      const pos = resolveSlotPosition(formation, side, slot, { starterSlots: allSlots });
      if (!pos) {
        err(`${matchId} ${side} ${formation}: 无法解析坐标 ${slot}`);
        continue;
      }
      positions.push({ slot, pos });
      const key = `${pos.x.toFixed(1)},${pos.y.toFixed(1)}`;
      const arr = coordKeys.get(key) ?? [];
      arr.push(slot);
      coordKeys.set(key, arr);
    }

    for (const [key, sl] of coordKeys) {
      if (sl.length > 1) {
        err(`${matchId} ${side} ${formation}: 坐标重叠 ${key} [${sl.join(', ')}]`);
      }
    }

    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        const d = slotDistance(positions[i].pos, positions[j].pos);
        if (d < MIN_SLOT_DISTANCE && !isWingAliasPair(positions[i].slot, positions[j].slot)) {
          err(
            `${matchId} ${side} ${formation}: 间距过近 ${positions[i].slot}↔${positions[j].slot} d=${d.toFixed(1)}`,
          );
        }
      }
    }
  }
}

if (errorCount > 0) {
  console.error(`\n[lineup:validate] ${errorCount} error(s)`);
  process.exit(1);
}

console.log(`[lineup:validate] ${Object.keys(lineups).length} matches OK`);
