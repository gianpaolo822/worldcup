/** 球场纵向分层（决定 y 坐标） */
export type Layer = 'gk' | 'def' | 'dm' | 'mid' | 'am' | 'fwd';

export const LAYER_ORDER: Layer[] = ['gk', 'def', 'dm', 'mid', 'am', 'fwd'];

/** 客队默认层 y（无阵型覆盖时使用） */
export const DEFAULT_LAYER_Y_AWAY: Record<Layer, number> = {
  gk: 6,
  def: 16,
  dm: 26,
  mid: 28,
  am: 34,
  fwd: 44,
};

/** 主队默认层 y */
export const DEFAULT_LAYER_Y_HOME: Record<Layer, number> = {
  gk: 94,
  def: 84,
  dm: 76,
  mid: 72,
  am: 66,
  fwd: 56,
};

export type LayerYMap = Partial<Record<Layer, number>>;

export interface FormationSideLayers {
  away: LayerYMap;
  home: LayerYMap;
}

/** 单槽位：层 + 横坐标；y 可选覆盖层默认值 */
export interface SlotPlacement {
  layer: Layer;
  x: number;
  y?: number;
}

export type SidePlacements = Partial<Record<string, SlotPlacement>>;

export function resolveY(
  side: 'home' | 'away',
  layer: Layer,
  layerOverrides: LayerYMap | undefined,
  yOverride?: number,
): number {
  if (yOverride != null) return yOverride;
  const defaults = side === 'away' ? DEFAULT_LAYER_Y_AWAY : DEFAULT_LAYER_Y_HOME;
  return layerOverrides?.[layer] ?? defaults[layer];
}

export function placementToCoord(
  side: 'home' | 'away',
  placement: SlotPlacement,
  layerOverrides: LayerYMap | undefined,
): { x: number; y: number } {
  return {
    x: placement.x,
    y: resolveY(side, placement.layer, layerOverrides, placement.y),
  };
}
