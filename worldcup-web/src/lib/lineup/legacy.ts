import type { LineupSlot } from './slots';

export { resolveAlias } from './slots';

/** 三后卫阵型：CB 槽回退到 RCB 或扩展坐标 */
export const THREE_BACK_FORMATIONS = new Set(['3-4-2-1', '3-4-3']);

/**
 * 无阵型表命中时的扩展回退（客队坐标；主队 y 翻转）
 * 仅用于 CB、CM、SS 等少数扩展槽位
 */
export const EXTENDED_FALLBACK_AWAY: Partial<Record<LineupSlot, { x: number; y: number }>> = {
  CB: { x: 50, y: 16 },
  CM: { x: 50, y: 28 },
  LCM: { x: 36, y: 28 },
  RCM: { x: 64, y: 28 },
  LM: { x: 11, y: 30 },
  RM: { x: 89, y: 30 },
  SS: { x: 62, y: 42 },
  LWB: { x: 8, y: 22 },
  RWB: { x: 92, y: 22 },
};

export function flipPosition(pos: { x: number; y: number }): { x: number; y: number } {
  return { x: pos.x, y: 100 - pos.y };
}

/** wing 槽位重叠检测白名单（语义上可共线） */
export const WING_ALIAS_PAIRS = new Set([
  'LB|LW',
  'LW|LB',
  'RB|RW',
  'RW|RB',
  'LWB|LW',
  'LW|LWB',
  'RWB|RW',
  'RW|RWB',
]);

export function isWingAliasPair(a: string, b: string): boolean {
  return WING_ALIAS_PAIRS.has(`${a}|${b}`);
}

export const MIN_SLOT_DISTANCE = 7;

export function slotDistance(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}
