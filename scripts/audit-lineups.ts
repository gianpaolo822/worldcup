/**
 * 审计已结束比赛的阵容球场坐标
 */
import lineupsJson from '../data/match-lineups.json';
import matchesJson from '../data/matches.json';
import { resolveSlotPosition } from '../worldcup-web/src/lib/lineup/resolve';
import {
  isWingAliasPair,
  MIN_SLOT_DISTANCE,
  slotDistance,
} from '../worldcup-web/src/lib/lineup/legacy';
import type { LineupSlot } from '../worldcup-web/src/lib/lineup/slots';

const lineups = lineupsJson.lineups;
const matches = matchesJson as Array<{
  id: string;
  status: string;
  homeTeam: { name: string };
  awayTeam: { name: string };
}>;

let issueCount = 0;

for (const m of matches.filter((x) => x.status === 'finished')) {
  const raw = lineups[m.id];
  if (!raw) continue;

  for (const side of ['home', 'away'] as const) {
    const team = raw[side];
    const coords = new Map<string, string[]>();
    const positions: { slot: string; pos: { x: number; y: number } }[] = [];

    for (const [slot, entry] of Object.entries(team.starters) as [LineupSlot, { playerId: string }][]) {
      const allSlots = Object.keys(team.starters) as LineupSlot[];
      const pos = resolveSlotPosition(team.formation, side, slot, { starterSlots: allSlots });
      if (!pos) {
        console.error(`${m.id} ${side} ${team.formation}: hidden ${slot} (${entry.playerId})`);
        issueCount++;
        continue;
      }
      positions.push({ slot, pos });
      const key = `${pos.x.toFixed(1)},${pos.y.toFixed(1)}`;
      const arr = coords.get(key) ?? [];
      arr.push(slot);
      coords.set(key, arr);
    }

    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        const d = slotDistance(positions[i].pos, positions[j].pos);
        if (d < MIN_SLOT_DISTANCE && !isWingAliasPair(positions[i].slot, positions[j].slot)) {
          console.error(
            `${m.id} ${side} ${team.formation}: too close ${positions[i].slot}↔${positions[j].slot} d=${d.toFixed(1)}`,
          );
          issueCount++;
        }
      }
    }

    for (const [key, slots] of coords) {
      if (slots.length > 1) {
        console.error(`${m.id} ${side} ${team.formation}: overlap ${key} [${slots.join(', ')}]`);
        issueCount++;
      }
    }
  }
}

if (issueCount > 0) {
  console.error(`\n[lineup audit] ${issueCount} issue(s) found`);
  process.exit(1);
}

console.log('[lineup audit] all finished match lineups OK');
