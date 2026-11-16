/** 阵容图槽位类型 */
export type LineupSlot =
  | 'GK'
  | 'RB'
  | 'RCB'
  | 'LCB'
  | 'LB'
  | 'CB'
  | 'RWB'
  | 'LWB'
  | 'RDM'
  | 'LDM'
  | 'RCM'
  | 'LCM'
  | 'CM'
  | 'CAM'
  | 'RW'
  | 'LW'
  | 'RM'
  | 'LM'
  | 'ST'
  | 'SS';

export const ALL_LINEUP_SLOTS: LineupSlot[] = [
  'GK',
  'LB',
  'LCB',
  'CB',
  'RCB',
  'RB',
  'LWB',
  'RWB',
  'LDM',
  'LCM',
  'CM',
  'RCM',
  'RDM',
  'LM',
  'LW',
  'CAM',
  'RW',
  'RM',
  'SS',
  'ST',
];

/** 归一化阵型字符串 */
export function normalizeFormation(formation: string): string {
  if (formation === '4-4-1-1') return '4-1-4-1';
  return formation;
}

/** 各阵型必填首发槽位（11 人） */
export const FORMATION_REQUIRED_SLOTS: Record<string, LineupSlot[]> = {
  '4-2-3-1': ['GK', 'LB', 'LCB', 'RCB', 'RB', 'LDM', 'RDM', 'LW', 'CAM', 'RW', 'ST'],
  '3-4-2-1': ['GK', 'LCB', 'CB', 'RCB', 'LW', 'LDM', 'RDM', 'RB', 'CAM', 'SS', 'ST'],
  '3-4-3': ['GK', 'LCB', 'CB', 'RCB', 'RB', 'LDM', 'RDM', 'LW', 'ST', 'RW'],
  '4-4-2': ['GK', 'LB', 'LCB', 'RCB', 'RB', 'LW', 'LDM', 'RDM', 'RW', 'ST', 'CAM'],
  '4-3-3': ['GK', 'LB', 'LCB', 'RCB', 'RB', 'LDM', 'RDM', 'CAM', 'LW', 'ST', 'RW'],
  '4-1-2-3': ['GK', 'LB', 'LCB', 'RCB', 'RB', 'RDM', 'LDM', 'CAM', 'LW', 'ST', 'RW'],
  '4-1-4-1': ['GK', 'LB', 'LCB', 'RCB', 'RB', 'RDM', 'LW', 'CAM', 'RW', 'LDM', 'ST'],
  '4-1-3-2': ['GK', 'LB', 'LCB', 'RCB', 'RB', 'RDM', 'LW', 'CAM', 'RW', 'ST', 'LDM'],
  '4-3-2-1': ['GK', 'LB', 'LCB', 'RCB', 'RB', 'LDM', 'RDM', 'CAM', 'LW', 'RW', 'ST'],
  '5-3-2': ['GK', 'LB', 'LCB', 'RCB', 'RB', 'LDM', 'RDM', 'CAM', 'LW', 'ST', 'RW'],
  '5-4-1': ['GK', 'LB', 'LCB', 'RCB', 'RB', 'LDM', 'LW', 'RDM', 'CAM', 'RW', 'ST'],
};

export const SUPPORTED_FORMATIONS = Object.keys(FORMATION_REQUIRED_SLOTS);

/** 3-4-3 部分场次使用 CAM，加入可选槽 */
export const FORMATION_OPTIONAL_SLOTS: Partial<Record<string, LineupSlot[]>> = {
  '3-4-3': ['CAM'],
};

/**
 * Legacy 等价槽位：录入时允许用别名列代替必填槽位（解析坐标仍走 resolveSlotPosition）
 * 键为必填槽位，值为可接受的替代槽位名
 */
export const FORMATION_SLOT_EQUIVALENTS: Partial<
  Record<string, Partial<Record<LineupSlot, LineupSlot[]>>>
> = {
  '3-4-2-1': {
    SS: ['SS', 'RW'],
    LCB: ['LCB', 'LB'],
    CB: ['CB'],
    RCB: ['RCB'],
    RB: ['RB', 'RWB'],
    LW: ['LW', 'LM', 'LWB'],
  },
  '3-4-3': {
    LCB: ['LCB', 'LB'],
    CB: ['CB'],
    RCB: ['RCB'],
    RB: ['RB', 'RWB'],
    LW: ['LW', 'LM', 'LWB'],
    RW: ['RW', 'RM'],
  },
  '4-4-2': {
    LW: ['LW', 'LM'],
    RW: ['RW', 'RM'],
    LDM: ['LDM', 'LCM'],
    RDM: ['RDM', 'RCM'],
    CAM: ['CAM', 'SS'],
  },
  '4-3-3': {
    LDM: ['LDM', 'LCM'],
    RDM: ['RDM', 'RCM', 'CM'],
    CAM: ['CAM', 'CM'],
  },
};

function expandAllowedSlots(formation: string): Set<LineupSlot> {
  const f = normalizeFormation(formation);
  const required = FORMATION_REQUIRED_SLOTS[f] ?? [];
  const optional = FORMATION_OPTIONAL_SLOTS[f] ?? [];
  const equivalents = FORMATION_SLOT_EQUIVALENTS[f] ?? {};
  const allowed = new Set<LineupSlot>([...required, ...optional]);

  for (const alts of Object.values(equivalents)) {
    for (const alt of alts ?? []) {
      allowed.add(alt);
    }
  }

  return allowed;
}

function satisfiesRequiredSlot(formation: string, required: LineupSlot, present: LineupSlot[]): boolean {
  const f = normalizeFormation(formation);
  const equivalents = FORMATION_SLOT_EQUIVALENTS[f]?.[required] ?? [required];
  return equivalents.some((alt) => present.includes(alt));
}

export function isSupportedFormation(formation: string): boolean {
  return SUPPORTED_FORMATIONS.includes(normalizeFormation(formation));
}

/** 校验槽位集合是否与阵型匹配（含 legacy 等价槽位） */
export function validateFormationSlots(
  formation: string,
  slots: string[],
): { ok: true } | { ok: false; errors: string[] } {
  const f = normalizeFormation(formation);
  const required = FORMATION_REQUIRED_SLOTS[f];
  if (!required) {
    return { ok: false, errors: [`未知阵型: ${formation}`] };
  }

  const rawPresent = slots as LineupSlot[];
  const allowed = expandAllowedSlots(f);
  const errors: string[] = [];

  if (rawPresent.length !== 11) {
    errors.push(`首发应为 11 人，当前 ${rawPresent.length} 人`);
  }

  for (const slot of rawPresent) {
    const canonical = resolveAlias(slot);
    if (!allowed.has(slot) && !allowed.has(canonical)) {
      errors.push(`槽位 ${slot} 不属于阵型 ${f}`);
    }
  }

  for (const slot of required) {
    if (!satisfiesRequiredSlot(f, slot, rawPresent)) {
      errors.push(`缺少必填槽位 ${slot}（可接受: ${(FORMATION_SLOT_EQUIVALENTS[f]?.[slot] ?? [slot]).join('|')}）`);
    }
  }

  return errors.length === 0 ? { ok: true } : { ok: false, errors };
}

/** 将别名解析为主槽位名 */
export function resolveAlias(slot: LineupSlot): LineupSlot {
  return SLOT_ALIASES[slot] ?? slot;
}

export const SLOT_ALIASES: Partial<Record<LineupSlot, LineupSlot>> = {
  RM: 'RW',
  LM: 'LW',
  RCM: 'RDM',
  LCM: 'LDM',
  CM: 'CAM',
  LWB: 'LB',
  RWB: 'RB',
};
