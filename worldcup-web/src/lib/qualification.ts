import { groups, getStandingsByGroup } from '@/lib/data';
import { isGroupStageComplete } from '@/lib/knockout';
import type { StandingRow } from '@/types';

/** 48 队扩军：12 组前 2 + 成绩最好的 8 个小组第三 → 32 强 */
export const THIRD_PLACE_QUALIFY_COUNT = 8;

export type QualificationStatus =
  | 'direct'
  | 'third_pending'
  | 'third_qualified'
  | 'third_eliminated'
  | 'none';

export interface ThirdPlaceEvaluation {
  group: string;
  row: StandingRow;
  /** 在 12 个小组第三中的成绩排名（1 = 最好） */
  rankAmongThirds: number;
  /** 按当前成绩是否排进前 8 个小组第三 */
  projectedQualify: boolean;
}

export interface QualificationInfo {
  status: QualificationStatus;
  /** 仅小组第三：在 12 个第三中的成绩排名 */
  thirdRankAmong12?: number;
  /** 仅待定阶段：是否按当前成绩暂列晋级区 */
  projectedQualify?: boolean;
}

/** 跨组比较小组第三（积分 → 净胜球 → 进球；公平竞赛 / FIFA 排名暂无数据） */
export function compareStandingRows(a: StandingRow, b: StandingRow): number {
  return b.points - a.points || b.gd - a.gd || b.gf - a.gf || a.team.code.localeCompare(b.team.code);
}

export function getThirdPlaceRow(group: string): StandingRow | undefined {
  return getStandingsByGroup(group).find((row) => row.rank === 3);
}

export function evaluateThirdPlaces(): ThirdPlaceEvaluation[] {
  const thirds: ThirdPlaceEvaluation[] = [];

  for (const group of groups) {
    const row = getThirdPlaceRow(group);
    if (!row) continue;
    thirds.push({
      group,
      row,
      rankAmongThirds: 0,
      projectedQualify: false,
    });
  }

  thirds.sort((a, b) => compareStandingRows(a.row, b.row));
  thirds.forEach((item, index) => {
    item.rankAmongThirds = index + 1;
    item.projectedQualify = index < THIRD_PLACE_QUALIFY_COUNT;
  });

  return thirds;
}

export function getQualificationByTeamId(): Map<string, QualificationInfo> {
  const map = new Map<string, QualificationInfo>();
  const groupStageComplete = isGroupStageComplete();
  const thirdEvaluations = evaluateThirdPlaces();
  const thirdByTeamId = new Map(thirdEvaluations.map((item) => [item.row.team.id, item]));

  for (const group of groups) {
    const rows = getStandingsByGroup(group);
    for (const row of rows) {
      if (row.rank <= 2) {
        map.set(row.team.id, { status: 'direct' });
        continue;
      }

      if (row.rank === 3) {
        const evaluation = thirdByTeamId.get(row.team.id);
        if (!evaluation) {
          map.set(row.team.id, { status: 'third_pending' });
          continue;
        }

        if (!groupStageComplete) {
          map.set(row.team.id, {
            status: 'third_pending',
            thirdRankAmong12: evaluation.rankAmongThirds,
            projectedQualify: evaluation.projectedQualify,
          });
          continue;
        }

        if (evaluation.projectedQualify) {
          map.set(row.team.id, {
            status: 'third_qualified',
            thirdRankAmong12: evaluation.rankAmongThirds,
          });
        } else {
          map.set(row.team.id, {
            status: 'third_eliminated',
            thirdRankAmong12: evaluation.rankAmongThirds,
          });
        }
        continue;
      }

      map.set(row.team.id, { status: 'none' });
    }
  }

  return map;
}

export function getQualificationInfo(teamId: string): QualificationInfo {
  return getQualificationByTeamId().get(teamId) ?? { status: 'none' };
}

export function qualificationLabel(info: QualificationInfo): string | undefined {
  switch (info.status) {
    case 'direct':
      return '确定出线';
    case 'third_pending':
      return '待定';
    case 'third_qualified':
      return '已出线';
    case 'third_eliminated':
      return '未出线';
    default:
      return undefined;
  }
}

export function qualificationHint(info: QualificationInfo): string | undefined {
  if (info.thirdRankAmong12 == null) return undefined;
  const rankText = `12 组第三暂列第 ${info.thirdRankAmong12}`;
  if (info.status === 'third_pending') {
    return info.projectedQualify
      ? `${rankText} · 暂入晋级区`
      : `${rankText} · 暂未进前 8`;
  }
  if (info.status === 'third_qualified') {
    return `${rankText} · 晋级 32 强`;
  }
  if (info.status === 'third_eliminated') {
    return `${rankText} · 未进前 8`;
  }
  return undefined;
}

export function isQualificationHighlight(status: QualificationStatus): boolean {
  return status === 'direct' || status === 'third_qualified' || status === 'third_pending';
}
