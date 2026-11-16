import type { LineupSlot } from './slots';
import type { FormationSideLayers, LayerYMap, SidePlacements, SlotPlacement } from './layers';
import { placementToCoord } from './layers';

export interface FormationConfig {
  layers: FormationSideLayers;
  away: SidePlacements;
  home: SidePlacements;
}

function p(layer: SlotPlacement['layer'], x: number, y?: number): SlotPlacement {
  return y != null ? { layer, x, y } : { layer, x };
}

const L4231: FormationSideLayers = {
  away: { gk: 6, def: 16, dm: 26, am: 33, fwd: 43 },
  home: { gk: 94, def: 84, dm: 76, am: 67, fwd: 57 },
};

const L3421: FormationSideLayers = {
  away: { gk: 6, def: 14, mid: 24, am: 34, fwd: 41 },
  home: { gk: 94, def: 86, mid: 76, am: 66, fwd: 59 },
};

const L343: FormationSideLayers = {
  away: { gk: 6, def: 14, mid: 24, am: 33, fwd: 41 },
  home: { gk: 94, def: 86, mid: 76, am: 67, fwd: 59 },
};

const L442: FormationSideLayers = {
  away: { gk: 6, def: 16, mid: 30, fwd: 44 },
  home: { gk: 94, def: 84, mid: 70, fwd: 56 },
};

const L433: FormationSideLayers = {
  away: { gk: 6, def: 16, mid: 28, fwd: 44 },
  home: { gk: 94, def: 84, mid: 72, fwd: 54 },
};

const L4123: FormationSideLayers = {
  away: { gk: 6, def: 16, dm: 26, mid: 36, fwd: 44 },
  home: { gk: 94, def: 84, dm: 76, mid: 68, fwd: 57 },
};

const L4141: FormationSideLayers = {
  away: { gk: 6, def: 16, dm: 28, mid: 36, fwd: 44 },
  home: { gk: 94, def: 84, dm: 74, mid: 64, fwd: 56 },
};

const L532: FormationSideLayers = {
  away: { gk: 6, def: 16, mid: 28, fwd: 44 },
  home: { gk: 94, def: 84, mid: 72, fwd: 56 },
};

const L541: FormationSideLayers = {
  away: { gk: 6, def: 16, mid: 28, fwd: 44 },
  home: { gk: 94, def: 84, mid: 72, fwd: 56 },
};

const L4321: FormationSideLayers = {
  away: {},
  home: { gk: 94, def: 84, mid: 72, am: 58, fwd: 52 },
};

const L4132: FormationSideLayers = {
  away: { gk: 6, def: 16, dm: 28, mid: 36, fwd: 44 },
  home: { gk: 94, def: 84, dm: 74, mid: 64, fwd: 56 },
};

/** 阵型 → 分层 y + 各槽位 (layer, x[, y]) */
export const FORMATION_CONFIGS: Record<string, FormationConfig> = {
  '4-2-3-1': {
    layers: L4231,
    away: {
      GK: p('gk', 50),
      LB: p('def', 11),
      LCB: p('def', 32),
      RCB: p('def', 68),
      RB: p('def', 89),
      LDM: p('dm', 36),
      RDM: p('dm', 64),
      LW: p('am', 11),
      CAM: p('am', 50),
      RW: p('am', 89),
      ST: p('fwd', 50),
    },
    home: {
      GK: p('gk', 50),
      ST: p('fwd', 50),
      LW: p('am', 11),
      CAM: p('am', 50),
      RW: p('am', 89),
      LDM: p('dm', 36),
      RDM: p('dm', 64),
      LB: p('def', 11),
      LCB: p('def', 32),
      RCB: p('def', 68),
      RB: p('def', 89),
    },
  },

  '3-4-2-1': {
    layers: L3421,
    away: {
      GK: p('gk', 50),
      LCB: p('def', 22),
      CB: p('def', 50),
      RCB: p('def', 78),
      LW: p('mid', 10),
      LDM: p('mid', 32),
      RDM: p('mid', 68),
      RB: p('mid', 92),
      CAM: p('am', 32),
      SS: p('am', 68),
      ST: p('fwd', 50),
    },
    home: {
      GK: p('gk', 50),
      ST: p('fwd', 50),
      CAM: p('am', 32),
      SS: p('am', 68),
      LW: p('mid', 10),
      LDM: p('mid', 32),
      RDM: p('mid', 68),
      RB: p('mid', 92),
      LCB: p('def', 22),
      CB: p('def', 50),
      RCB: p('def', 78),
    },
  },

  '3-4-3': {
    layers: L343,
    away: {
      GK: p('gk', 50),
      LCB: p('def', 22),
      CB: p('def', 50),
      RCB: p('def', 78),
      RB: p('mid', 92),
      LDM: p('mid', 32),
      RDM: p('mid', 68),
      CAM: p('am', 50),
      LW: p('fwd', 18, 36),
      ST: p('fwd', 50),
      RW: p('fwd', 82, 36),
    },
    home: {
      GK: p('gk', 50),
      ST: p('fwd', 50),
      LW: p('fwd', 18, 64),
      RW: p('fwd', 82, 64),
      CAM: p('am', 50),
      LDM: p('mid', 32),
      RDM: p('mid', 68),
      RB: p('mid', 92),
      LCB: p('def', 22),
      CB: p('def', 50),
      RCB: p('def', 78),
    },
  },

  '4-4-2': {
    layers: L442,
    away: {
      GK: p('gk', 50),
      LB: p('def', 11),
      LCB: p('def', 32),
      RCB: p('def', 68),
      RB: p('def', 89),
      LW: p('mid', 11),
      LDM: p('mid', 36),
      RDM: p('mid', 64),
      RW: p('mid', 89),
      ST: p('fwd', 35),
      CAM: p('fwd', 65),
    },
    home: {
      GK: p('gk', 50),
      ST: p('fwd', 35),
      CAM: p('fwd', 65),
      LW: p('mid', 11),
      LDM: p('mid', 36),
      RDM: p('mid', 64),
      RW: p('mid', 89),
      LB: p('def', 11),
      LCB: p('def', 32),
      RCB: p('def', 68),
      RB: p('def', 89),
    },
  },

  '4-3-3': {
    layers: L433,
    away: {
      GK: p('gk', 50),
      LB: p('def', 11),
      LCB: p('def', 32),
      RCB: p('def', 68),
      RB: p('def', 89),
      LDM: p('mid', 28),
      RDM: p('mid', 50),
      CAM: p('mid', 72),
      LW: p('fwd', 18, 40),
      ST: p('fwd', 50),
      RW: p('fwd', 82, 40),
    },
    home: {
      GK: p('gk', 50),
      LB: p('def', 11),
      LCB: p('def', 32),
      RCB: p('def', 68),
      RB: p('def', 89),
      LDM: p('mid', 28),
      RDM: p('mid', 50),
      CAM: p('mid', 72),
      LW: p('fwd', 18, 58),
      ST: p('fwd', 50),
      RW: p('fwd', 82, 58),
    },
  },

  '4-1-2-3': {
    layers: L4123,
    away: {
      GK: p('gk', 50),
      LB: p('def', 11),
      LCB: p('def', 32),
      RCB: p('def', 68),
      RB: p('def', 89),
      RDM: p('dm', 50),
      LDM: p('mid', 35),
      CAM: p('mid', 65),
      LW: p('fwd', 18),
      ST: p('fwd', 50),
      RW: p('fwd', 82),
    },
    home: {
      GK: p('gk', 50),
      LB: p('def', 11),
      LCB: p('def', 32),
      RCB: p('def', 68),
      RB: p('def', 89),
      RDM: p('dm', 50),
      LDM: p('mid', 30),
      CAM: p('mid', 70),
      LW: p('fwd', 16, 58),
      ST: p('fwd', 50),
      RW: p('fwd', 84, 58),
    },
  },

  '4-1-4-1': {
    layers: L4141,
    away: {
      GK: p('gk', 50),
      LB: p('def', 11),
      LCB: p('def', 32),
      RCB: p('def', 68),
      RB: p('def', 89),
      RDM: p('dm', 50),
      LW: p('mid', 11),
      CAM: p('mid', 50),
      RW: p('mid', 89),
      LDM: p('fwd', 35, 42),
      ST: p('fwd', 65, 44),
    },
    home: {
      GK: p('gk', 50),
      LB: p('def', 11),
      LCB: p('def', 32),
      RCB: p('def', 68),
      RB: p('def', 89),
      RDM: p('dm', 50),
      LW: p('mid', 11),
      CAM: p('mid', 50),
      RW: p('mid', 89),
      LDM: p('fwd', 35, 58),
      ST: p('fwd', 65, 56),
    },
  },

  '4-1-3-2': {
    layers: L4132,
    away: {
      GK: p('gk', 50),
      LB: p('def', 11),
      LCB: p('def', 32),
      RCB: p('def', 68),
      RB: p('def', 89),
      RDM: p('dm', 50),
      LW: p('mid', 18),
      CAM: p('mid', 50),
      RW: p('mid', 82),
      ST: p('fwd', 35),
      LDM: p('fwd', 65),
    },
    home: {
      GK: p('gk', 50),
      ST: p('fwd', 35),
      LDM: p('fwd', 65),
      LW: p('mid', 18),
      CAM: p('mid', 50),
      RW: p('mid', 82),
      RDM: p('dm', 50),
      LB: p('def', 11),
      LCB: p('def', 32),
      RCB: p('def', 68),
      RB: p('def', 89),
    },
  },

  '4-3-2-1': {
    layers: L4321,
    away: {},
    home: {
      GK: p('gk', 50),
      LB: p('def', 11),
      LCB: p('def', 32),
      RCB: p('def', 68),
      RB: p('def', 89),
      LDM: p('mid', 25),
      RDM: p('mid', 50),
      CAM: p('mid', 75),
      LW: p('am', 32),
      RW: p('am', 68),
      ST: p('fwd', 50),
    },
  },

  '5-3-2': {
    layers: L532,
    away: {
      GK: p('gk', 50),
      LB: p('def', 8),
      LCB: p('def', 28),
      RCB: p('def', 50),
      RB: p('def', 72),
      LDM: p('def', 92),
      RDM: p('mid', 25),
      CAM: p('mid', 50),
      LW: p('mid', 75),
      ST: p('fwd', 35),
      RW: p('fwd', 65),
    },
    home: {
      GK: p('gk', 50),
      ST: p('fwd', 35),
      RW: p('fwd', 65),
      LW: p('mid', 75),
      CAM: p('mid', 50),
      RDM: p('mid', 25),
      LDM: p('def', 92),
      RB: p('def', 72),
      RCB: p('def', 50),
      LCB: p('def', 28),
      LB: p('def', 8),
    },
  },

  '5-4-1': {
    layers: L541,
    away: {
      GK: p('gk', 50),
      LB: p('def', 8),
      LCB: p('def', 28),
      RCB: p('def', 50),
      RB: p('def', 72),
      LDM: p('def', 92),
      LW: p('mid', 11),
      RDM: p('mid', 36),
      CAM: p('mid', 64),
      RW: p('mid', 89),
      ST: p('fwd', 50),
    },
    home: {
      GK: p('gk', 50),
      ST: p('fwd', 50),
      LW: p('mid', 11),
      RDM: p('mid', 36),
      CAM: p('mid', 64),
      RW: p('mid', 89),
      LDM: p('def', 92),
      LB: p('def', 8),
      LCB: p('def', 28),
      RCB: p('def', 50),
      RB: p('def', 72),
    },
  },
};

export function getFormationConfig(formation: string): FormationConfig | null {
  return FORMATION_CONFIGS[formation] ?? null;
}

export function getLayerOverrides(config: FormationConfig, side: 'home' | 'away'): LayerYMap {
  return config.layers[side];
}

export function getSidePlacements(
  config: FormationConfig,
  side: 'home' | 'away',
): SidePlacements {
  return side === 'away' ? config.away : config.home;
}

/** 列出阵型表中某侧所有已定义槽位坐标（用于测试快照） */
export function listFormationCoords(
  formation: string,
  side: 'home' | 'away',
): Partial<Record<LineupSlot, { x: number; y: number }>> {
  const config = getFormationConfig(formation);
  if (!config) return {};
  const placements = getSidePlacements(config, side);
  const layerOverrides = getLayerOverrides(config, side);
  const result: Partial<Record<LineupSlot, { x: number; y: number }>> = {};
  for (const [slot, placement] of Object.entries(placements)) {
    if (!placement) continue;
    result[slot as LineupSlot] = placementToCoord(side, placement, layerOverrides);
  }
  return result;
}
