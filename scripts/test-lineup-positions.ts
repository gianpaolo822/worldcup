/**
 * 坐标回归：验证各阵型配置表可完整解析，并与 getSlotPositions 一致
 */
import { SUPPORTED_FORMATIONS } from '../worldcup-web/src/lib/lineup/slots';
import { getSlotPositions, resolveSlotPosition } from '../worldcup-web/src/lib/lineup/resolve';
import { FORMATION_REQUIRED_SLOTS, FORMATION_OPTIONAL_SLOTS } from '../worldcup-web/src/lib/lineup/slots';
import type { LineupSlot } from '../worldcup-web/src/lib/lineup/slots';

let failures = 0;

for (const formation of SUPPORTED_FORMATIONS) {
  for (const side of ['home', 'away'] as const) {
    const map = getSlotPositions(formation, side);
    if (!map || Object.keys(map).length === 0) {
      if (formation === '4-3-2-1' && side === 'away') continue;
      console.error(`FAIL ${formation} ${side}: 无坐标表`);
      failures++;
      continue;
    }

    const required = FORMATION_REQUIRED_SLOTS[formation] ?? [];
    const optional = FORMATION_OPTIONAL_SLOTS[formation] ?? [];
    const allSlots = [...required, ...optional];

    for (const slot of allSlots) {
      const fromResolve = resolveSlotPosition(formation, side, slot);
      const fromMap = map[slot as LineupSlot];
      if (!fromResolve) {
        console.error(`FAIL ${formation} ${side} ${slot}: resolve 返回 null`);
        failures++;
        continue;
      }
      if (fromMap && (fromMap.x !== fromResolve.x || fromMap.y !== fromResolve.y)) {
        console.error(
          `FAIL ${formation} ${side} ${slot}: map(${fromMap.x},${fromMap.y}) != resolve(${fromResolve.x},${fromResolve.y})`,
        );
        failures++;
      }
    }
  }
}

if (failures > 0) {
  console.error(`\n[lineup:test] ${failures} failure(s)`);
  process.exit(1);
}

console.log(`[lineup:test] ${SUPPORTED_FORMATIONS.length} formations × 2 sides OK`);
