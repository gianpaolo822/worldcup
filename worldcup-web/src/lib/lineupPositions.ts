import type { LineupSlot } from '@/lib/lineup';

/**
 * 4-2-3-1 槽位坐标（百分比）
 * 客队：y 6–44（后卫 / 后腰 / 前腰 / 前锋 四档拉开）
 * 主队：y 56–94，中线 44–56 留空
 */
export const FORMATION_4231_AWAY: Record<LineupSlot, { x: number; y: number }> = {
  GK: { x: 50, y: 6 },
  LB: { x: 11, y: 16 },
  LCB: { x: 32, y: 16 },
  RCB: { x: 68, y: 16 },
  RB: { x: 89, y: 16 },
  LDM: { x: 36, y: 26 },
  RDM: { x: 64, y: 26 },
  LW: { x: 11, y: 36 },
  CAM: { x: 50, y: 34 },
  RW: { x: 89, y: 36 },
  ST: { x: 50, y: 44 },
};

export const FORMATION_4231_HOME: Record<LineupSlot, { x: number; y: number }> = {
  ST: { x: 50, y: 56 },
  LW: { x: 11, y: 64 },
  CAM: { x: 50, y: 66 },
  RW: { x: 89, y: 64 },
  LDM: { x: 36, y: 74 },
  RDM: { x: 64, y: 74 },
  LB: { x: 11, y: 84 },
  LCB: { x: 32, y: 84 },
  RCB: { x: 68, y: 84 },
  RB: { x: 89, y: 84 },
  GK: { x: 50, y: 94 },
};

/** 4-1-2-3：四后卫 + 单后腰 + 双中场 + 三前锋 */
export const FORMATION_4123_HOME: Record<LineupSlot, { x: number; y: number }> = {
  GK: { x: 50, y: 94 },
  LB: { x: 11, y: 84 },
  LCB: { x: 32, y: 84 },
  RCB: { x: 68, y: 84 },
  RB: { x: 89, y: 84 },
  RDM: { x: 50, y: 74 },
  LDM: { x: 35, y: 66 },
  CAM: { x: 65, y: 66 },
  LW: { x: 18, y: 56 },
  ST: { x: 50, y: 54 },
  RW: { x: 82, y: 56 },
};

/** 4-1-4-1：单后腰 + 四中场 + 双前锋（第二前锋用 LDM 槽位） */
export const FORMATION_4141_HOME: Record<LineupSlot, { x: number; y: number }> = {
  GK: { x: 50, y: 94 },
  LB: { x: 11, y: 84 },
  LCB: { x: 32, y: 84 },
  RCB: { x: 68, y: 84 },
  RB: { x: 89, y: 84 },
  RDM: { x: 50, y: 74 },
  LW: { x: 11, y: 64 },
  CAM: { x: 50, y: 64 },
  RW: { x: 89, y: 64 },
  LDM: { x: 35, y: 58 },
  ST: { x: 65, y: 56 },
};

/** 4-1-4-1（客队） */
export const FORMATION_4141_AWAY: Record<LineupSlot, { x: number; y: number }> = {
  GK: { x: 50, y: 6 },
  LB: { x: 11, y: 16 },
  LCB: { x: 32, y: 16 },
  RCB: { x: 68, y: 16 },
  RB: { x: 89, y: 16 },
  RDM: { x: 50, y: 28 },
  LW: { x: 11, y: 36 },
  CAM: { x: 50, y: 36 },
  RW: { x: 89, y: 36 },
  LDM: { x: 35, y: 42 },
  ST: { x: 65, y: 44 },
};

/** 5-3-2：五后卫（第五卫用 LDM 槽位）+ 三中场 + 双前锋 */
export const FORMATION_532_AWAY: Record<LineupSlot, { x: number; y: number }> = {
  GK: { x: 50, y: 6 },
  LB: { x: 8, y: 16 },
  LCB: { x: 28, y: 16 },
  RCB: { x: 50, y: 16 },
  RB: { x: 72, y: 16 },
  LDM: { x: 92, y: 16 },
  RDM: { x: 25, y: 28 },
  CAM: { x: 50, y: 28 },
  LW: { x: 75, y: 28 },
  ST: { x: 35, y: 44 },
  RW: { x: 65, y: 44 },
};

/** 3-4-2-1：三中卫 + 四中场（边翼卫用 LW/RW）+ 双前腰 + 单前锋 */
export const FORMATION_3421_AWAY: Record<LineupSlot, { x: number; y: number }> = {
  GK: { x: 50, y: 6 },
  LB: { x: 22, y: 16 },
  LCB: { x: 50, y: 16 },
  RCB: { x: 78, y: 16 },
  RB: { x: 89, y: 28 },
  LW: { x: 11, y: 28 },
  LDM: { x: 36, y: 28 },
  RDM: { x: 64, y: 28 },
  CAM: { x: 38, y: 38 },
  RW: { x: 62, y: 38 },
  ST: { x: 50, y: 44 },
};

export const FORMATION_3421_HOME: Record<LineupSlot, { x: number; y: number }> = {
  ST: { x: 50, y: 56 },
  CAM: { x: 38, y: 62 },
  RW: { x: 62, y: 62 },
  LDM: { x: 36, y: 72 },
  RDM: { x: 64, y: 72 },
  LW: { x: 11, y: 72 },
  RB: { x: 89, y: 72 },
  LB: { x: 22, y: 84 },
  LCB: { x: 50, y: 84 },
  RCB: { x: 78, y: 84 },
  GK: { x: 50, y: 94 },
};

/** 4-4-2：四后卫 + 四中场 + 双前锋（第二前锋用 CAM 槽位） */
export const FORMATION_442_AWAY: Record<LineupSlot, { x: number; y: number }> = {
  GK: { x: 50, y: 6 },
  LB: { x: 11, y: 16 },
  LCB: { x: 32, y: 16 },
  RCB: { x: 68, y: 16 },
  RB: { x: 89, y: 16 },
  LW: { x: 11, y: 30 },
  LDM: { x: 36, y: 30 },
  RDM: { x: 64, y: 30 },
  RW: { x: 89, y: 30 },
  ST: { x: 35, y: 44 },
  CAM: { x: 65, y: 44 },
};

export const FORMATION_442_HOME: Record<LineupSlot, { x: number; y: number }> = {
  ST: { x: 35, y: 56 },
  CAM: { x: 65, y: 56 },
  LW: { x: 11, y: 70 },
  LDM: { x: 36, y: 70 },
  RDM: { x: 64, y: 70 },
  RW: { x: 89, y: 70 },
  LB: { x: 11, y: 84 },
  LCB: { x: 32, y: 84 },
  RCB: { x: 68, y: 84 },
  RB: { x: 89, y: 84 },
  GK: { x: 50, y: 94 },
};

/** 4-3-2-1：四后卫 + 三中场 + 双前腰 + 单前锋 */
export const FORMATION_4321_HOME: Record<LineupSlot, { x: number; y: number }> = {
  GK: { x: 50, y: 94 },
  LB: { x: 11, y: 84 },
  LCB: { x: 32, y: 84 },
  RCB: { x: 68, y: 84 },
  RB: { x: 89, y: 84 },
  LDM: { x: 25, y: 72 },
  RDM: { x: 50, y: 72 },
  CAM: { x: 75, y: 72 },
  LW: { x: 32, y: 58 },
  RW: { x: 68, y: 58 },
  ST: { x: 50, y: 52 },
};

/** 5-4-1：五后卫（第五卫用 LDM 槽位）+ 四中场 + 单前锋 */
export const FORMATION_541_AWAY: Record<LineupSlot, { x: number; y: number }> = {
  GK: { x: 50, y: 6 },
  LB: { x: 8, y: 16 },
  LCB: { x: 28, y: 16 },
  RCB: { x: 50, y: 16 },
  RB: { x: 72, y: 16 },
  LDM: { x: 92, y: 16 },
  LW: { x: 11, y: 28 },
  RDM: { x: 36, y: 28 },
  CAM: { x: 64, y: 28 },
  RW: { x: 89, y: 28 },
  ST: { x: 50, y: 44 },
};

export const FORMATION_541_HOME: Record<LineupSlot, { x: number; y: number }> = {
  ST: { x: 50, y: 56 },
  LW: { x: 11, y: 72 },
  RDM: { x: 36, y: 72 },
  CAM: { x: 64, y: 72 },
  RW: { x: 89, y: 72 },
  LDM: { x: 92, y: 84 },
  LB: { x: 8, y: 84 },
  LCB: { x: 28, y: 84 },
  RCB: { x: 50, y: 84 },
  RB: { x: 72, y: 84 },
  GK: { x: 50, y: 94 },
};

/** 4-3-3：四后卫 + 三中场 + 三前锋 */
export const FORMATION_433_AWAY: Record<LineupSlot, { x: number; y: number }> = {
  GK: { x: 50, y: 6 },
  LB: { x: 11, y: 16 },
  LCB: { x: 32, y: 16 },
  RCB: { x: 68, y: 16 },
  RB: { x: 89, y: 16 },
  LDM: { x: 28, y: 28 },
  RDM: { x: 50, y: 28 },
  CAM: { x: 72, y: 28 },
  LW: { x: 18, y: 40 },
  ST: { x: 50, y: 44 },
  RW: { x: 82, y: 40 },
};

export const FORMATION_433_HOME: Record<LineupSlot, { x: number; y: number }> = {
  GK: { x: 50, y: 94 },
  LB: { x: 11, y: 84 },
  LCB: { x: 32, y: 84 },
  RCB: { x: 68, y: 84 },
  RB: { x: 89, y: 84 },
  LDM: { x: 28, y: 72 },
  RDM: { x: 50, y: 72 },
  CAM: { x: 72, y: 72 },
  LW: { x: 18, y: 58 },
  ST: { x: 50, y: 54 },
  RW: { x: 82, y: 58 },
};

/** 3-4-3：三中卫 + 四中场（边翼卫用 LB/RB，中路 LDM/RDM）+ 三前锋；CAM 为可选前腰 */
export const FORMATION_343_AWAY: Record<LineupSlot, { x: number; y: number }> = {
  GK: { x: 50, y: 6 },
  LB: { x: 22, y: 16 },
  LCB: { x: 50, y: 16 },
  RCB: { x: 78, y: 16 },
  RB: { x: 89, y: 28 },
  LDM: { x: 36, y: 28 },
  RDM: { x: 64, y: 28 },
  CAM: { x: 50, y: 36 },
  LW: { x: 18, y: 42 },
  ST: { x: 50, y: 44 },
  RW: { x: 82, y: 42 },
};

export const FORMATION_343_HOME: Record<LineupSlot, { x: number; y: number }> = {
  ST: { x: 50, y: 56 },
  LW: { x: 18, y: 58 },
  RW: { x: 82, y: 58 },
  CAM: { x: 50, y: 64 },
  LDM: { x: 36, y: 72 },
  RDM: { x: 64, y: 72 },
  RB: { x: 89, y: 72 },
  LB: { x: 22, y: 84 },
  LCB: { x: 50, y: 84 },
  RCB: { x: 78, y: 84 },
  GK: { x: 50, y: 94 },
};

export function getSlotPositions(
  formation: string,
  side: 'home' | 'away',
): Record<LineupSlot, { x: number; y: number }> | null {
  if (formation === '4-2-3-1') {
    return side === 'away' ? FORMATION_4231_AWAY : FORMATION_4231_HOME;
  }
  if (formation === '3-4-2-1') {
    return side === 'away' ? FORMATION_3421_AWAY : FORMATION_3421_HOME;
  }
  if (formation === '3-4-3') {
    return side === 'away' ? FORMATION_343_AWAY : FORMATION_343_HOME;
  }
  if (formation === '4-1-2-3') {
    return side === 'home' ? FORMATION_4123_HOME : null;
  }
  if (formation === '4-1-4-1') {
    return side === 'away' ? FORMATION_4141_AWAY : FORMATION_4141_HOME;
  }
  if (formation === '5-3-2') {
    return side === 'away' ? FORMATION_532_AWAY : null;
  }
  if (formation === '5-4-1') {
    return side === 'away' ? FORMATION_541_AWAY : FORMATION_541_HOME;
  }
  if (formation === '4-4-2') {
    return side === 'away' ? FORMATION_442_AWAY : FORMATION_442_HOME;
  }
  if (formation === '4-3-2-1') {
    return side === 'home' ? FORMATION_4321_HOME : null;
  }
  if (formation === '4-3-3') {
    return side === 'home' ? FORMATION_433_HOME : FORMATION_433_AWAY;
  }
  return null;
}
