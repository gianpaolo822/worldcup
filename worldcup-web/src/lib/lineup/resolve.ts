import type { LineupSlot } from './slots';
import { normalizeFormation } from './slots';
import {
  getFormationConfig,
  getLayerOverrides,
  getSidePlacements,
} from './formationConfigs';
import { placementToCoord } from './layers';
import {
  EXTENDED_FALLBACK_AWAY,
  flipPosition,
  isWingAliasPair,
  MIN_SLOT_DISTANCE,
  THREE_BACK_FORMATIONS,
  slotDistance,
} from './legacy';
import { resolveAlias, SLOT_ALIASES } from './slots';

type FormationMap = Partial<Record<LineupSlot, { x: number; y: number }>>;

const FORMATION_COORD_ALIASES: Partial<Record<string, Partial<Record<LineupSlot, LineupSlot>>>> = {
  /** 旧数据用 RW 表示右前腰（应为 SS）；若同时有 SS 且无 RB，则 RW 视为右翼卫 */
  '3-4-2-1': { RW: 'SS' },
};

export interface ResolveSlotContext {
  /** 同队全部首发槽位，用于 legacy 坐标歧义（如 3421 的 RW） */
  starterSlots?: LineupSlot[];
}

function resolveCoordAlias(
  formation: string,
  slot: LineupSlot,
  context?: ResolveSlotContext,
): LineupSlot {
  const f = normalizeFormation(formation);
  const alias = FORMATION_COORD_ALIASES[f]?.[slot];
  if (!alias) return slot;

  if (f === '3-4-2-1' && slot === 'RW' && alias === 'SS') {
    const present = new Set(context?.starterSlots ?? []);
    if (present.has('SS') && !present.has('RB')) return 'RB';
  }

  return alias;
}

function lookupPlacement(
  formation: string,
  side: 'home' | 'away',
  slot: LineupSlot,
  context?: ResolveSlotContext,
): { x: number; y: number } | null {
  const f = normalizeFormation(formation);
  let lookupSlot = resolveCoordAlias(f, slot, context);

  /** 三后卫：中卫统一 LCB/CB/RCB；Legacy LB 视为左中卫 */
  if (THREE_BACK_FORMATIONS.has(f)) {
    if (lookupSlot === 'LB') lookupSlot = 'LCB';
    if (lookupSlot === 'LWB') lookupSlot = 'LW';
    if (lookupSlot === 'RWB') lookupSlot = 'RB';
  }

  const config = getFormationConfig(f);
  if (!config) return null;

  const placements = getSidePlacements(config, side);
  const layerOverrides = getLayerOverrides(config, side);
  const placement = placements[lookupSlot];
  if (!placement) return null;

  return placementToCoord(side, placement, layerOverrides);
}

/** 获取阵型全部槽位坐标表（兼容旧 API） */
export function getSlotPositions(formation: string, side: 'home' | 'away'): FormationMap | null {
  const f = normalizeFormation(formation);
  const config = getFormationConfig(f);
  if (!config) return null;

  const placements = getSidePlacements(config, side);
  const layerOverrides = getLayerOverrides(config, side);
  const map: FormationMap = {};

  for (const [slot, placement] of Object.entries(placements)) {
    if (!placement) continue;
    map[slot as LineupSlot] = placementToCoord(side, placement, layerOverrides);
  }

  return Object.keys(map).length > 0 ? map : null;
}

/** 解析单个槽位在球场上的坐标（含别名与扩展槽位回退） */
export function resolveSlotPosition(
  formation: string,
  side: 'home' | 'away',
  slot: LineupSlot,
  context?: ResolveSlotContext,
): { x: number; y: number } | null {
  const f = normalizeFormation(formation);
  const canonical = resolveAlias(slot);

  const direct =
    lookupPlacement(f, side, canonical, context) ?? lookupPlacement(f, side, slot, context);
  if (direct) return direct;

  if (slot === 'CB') {
    const cb = lookupPlacement(f, side, 'CB', context);
    if (cb) return cb;
    if (THREE_BACK_FORMATIONS.has(f)) {
      const extended = EXTENDED_FALLBACK_AWAY.CB;
      if (extended) {
        return side === 'away' ? extended : flipPosition(extended);
      }
    }
    return lookupPlacement(f, side, 'RCB', context);
  }

  const alias = SLOT_ALIASES[slot];
  if (alias) {
    const viaAlias = lookupPlacement(f, side, alias, context);
    if (viaAlias) return viaAlias;
  }

  const extended = EXTENDED_FALLBACK_AWAY[slot];
  if (extended) {
    return side === 'away' ? extended : flipPosition(extended);
  }

  if (alias) {
    const aliasExtended = EXTENDED_FALLBACK_AWAY[alias];
    if (aliasExtended) {
      return side === 'away' ? aliasExtended : flipPosition(aliasExtended);
    }
  }

  return null;
}

/** 开发环境：检测同层槽位间距过近（返回警告信息） */
export function detectSlotCollisions(
  formation: string,
  side: 'home' | 'away',
  slots: LineupSlot[],
): string[] {
  const warnings: string[] = [];
  const positions: { slot: LineupSlot; pos: { x: number; y: number } }[] = [];

  for (const slot of slots) {
    const pos = resolveSlotPosition(formation, side, slot);
    if (!pos) {
      warnings.push(`槽位 ${slot} 无法解析坐标`);
      continue;
    }
    positions.push({ slot, pos });
  }

  for (let i = 0; i < positions.length; i++) {
    for (let j = i + 1; j < positions.length; j++) {
      const a = positions[i];
      const b = positions[j];
      const d = slotDistance(a.pos, b.pos);
      if (d < MIN_SLOT_DISTANCE && !isWingAliasPair(a.slot, b.slot)) {
        warnings.push(`${a.slot}↔${b.slot} 间距 ${d.toFixed(1)} < ${MIN_SLOT_DISTANCE}`);
      }
    }
  }

  return warnings;
}
