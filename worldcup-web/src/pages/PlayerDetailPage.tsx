import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import DetailTopNav from '@/components/DetailTopNav';
import Footer from '@/components/Footer';
import {
  getHistoricalScorerById,
  getPlayerById,
  getTeamById,
} from '@/lib/data';
import { readReturnTo, teamPath } from '@/lib/navigation';
import { calcAge, playerClubZh, playerNameEn, playerNameZh, positionLabel } from '@/lib/playerUtils';
import PlayerAvatar from '@/components/PlayerAvatar';
import type { Player, TopScorer } from '@/types';
import { Goal, Trophy } from 'lucide-react';

function formatHeight(height?: number): string | undefined {
  if (!height) return undefined;
  return height < 3 ? `${Math.round(height * 100)} cm` : `${Math.round(height)} cm`;
}

function InfoRow({ label, value }: { label: string; value: string | number | null | undefined }) {
  if (value == null || value === '') return null;
  return (
    <div className="flex items-center justify-between py-2 border-b last:border-b-0" style={{ borderColor: 'var(--border)' }}>
      <span className="text-xs text-[var(--text-muted)]">{label}</span>
      <span className="text-sm font-medium text-[var(--text)] text-right">{value}</span>
    </div>
  );
}

function SquadPlayerDetail({ player }: { player: Player }) {
  const team = getTeamById(player.teamId);
  const age = calcAge(player.birthDate);

  return (
    <>
      <section className="sb-card-elevated p-5 mt-4 mb-4 text-center">
        <div className="mx-auto mb-3 w-fit">
          <PlayerAvatar playerId={player.id} number={player.number} size="lg" numberColor="#2563eb" />
        </div>
        <h2 className="text-lg font-bold text-[var(--text)]">{playerNameZh(player)}</h2>
        <p className="text-xs text-[var(--text-muted)] mt-1">{playerNameEn(player)}</p>
        <p className="text-[10px] text-[var(--text-muted)] mt-1">
          {positionLabel(player.position)} · {player.nat}
        </p>
        {team && (
          <p className="text-sm mt-3">
            {team.flag} {team.name}
          </p>
        )}
        {player.status === 'injured' && (
          <span className="inline-block mt-3 sb-badge text-[var(--danger)] border-[var(--danger)]">
            因伤退出
          </span>
        )}
      </section>

      <section className="sb-card p-4 mb-4">
        <p className="sb-label mb-2">基本信息</p>
        <InfoRow label="身高" value={formatHeight(player.height)} />
        <InfoRow label="体重" value={player.weight ? `${player.weight} kg` : undefined} />
        <InfoRow label="年龄" value={age != null ? `${age} 岁` : undefined} />
        <InfoRow label="出生日期" value={player.birthDate} />
        <InfoRow label="出生地" value={player.birthPlace} />
        <InfoRow label="俱乐部" value={playerClubZh(player) ?? '俱乐部待定'} />
      </section>

      {player.injuryNote && (
        <section className="sb-card p-4 mb-4 border-[var(--danger)]/30">
          <p className="sb-label mb-2">{player.status === 'injured' ? '退赛说明' : '伤病说明'}</p>
          <p className="text-sm text-[var(--text-muted)] leading-relaxed">{player.injuryNote}</p>
        </section>
      )}

      {team && (
        <section className="mb-4">
          <Link
            to={teamPath(team.id, 'squad')}
            className="sb-card p-4 flex items-center justify-between active:scale-[0.99] transition-transform"
          >
            <span className="text-sm font-medium text-[var(--text)]">查看所属球队</span>
            <span className="text-sm text-[var(--accent)]">{team.name} →</span>
          </Link>
        </section>
      )}

      <section className="sb-card p-4 mb-4">
        <p className="sb-label mb-2">2026 世界杯</p>
        {player.status === 'injured' ? (
          <>
            <p className="text-sm text-[var(--danger)] font-medium">已确认因伤退出本届世界杯</p>
            <p className="text-xs text-[var(--text-muted)] mt-2 leading-relaxed">
              该球员仍在 {team?.name ?? '球队'} 大名单登记中，但已无法参加后续比赛。
            </p>
          </>
        ) : (
          <>
            <p className="text-sm text-[var(--text-muted)]">已入选 {team?.name ?? '球队'} 正式名单</p>
            <p className="text-xs text-[var(--text-faint)] mt-2">本届进球、助攻等数据将在赛事开始后更新</p>
          </>
        )}
      </section>
    </>
  );
}

function HistoricalScorerDetail({ scorer }: { scorer: TopScorer }) {
  const age = calcAge(scorer.birthDate);

  return (
    <>
      <section className="sb-card-elevated p-5 mt-4 mb-4 text-center">
        <div
          className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center border-2"
          style={{
            borderColor: 'var(--accent)',
            backgroundColor: 'var(--accent-muted)',
          }}
        >
          <Trophy size={24} className="text-[var(--accent)]" />
        </div>
        <h2 className="text-lg font-bold text-[var(--text)]">{scorer.name}</h2>
        <p className="text-xs text-[var(--text-muted)] mt-1">{scorer.nameEn}</p>
        <p className="text-2xl font-bold text-[var(--accent)] mt-3 tabular-nums">{scorer.goals} 球</p>
        <p className="text-xs text-[var(--text-muted)]">世界杯历史总射手榜 第 {scorer.rank} 名</p>
      </section>

      <section className="sb-card p-4 mb-4">
        <p className="sb-label mb-2">基本信息</p>
        <InfoRow label="国家队" value={scorer.country} />
        <InfoRow label="参赛届次" value={scorer.tournaments} />
        <InfoRow label="位置" value={scorer.position ? positionLabel(scorer.position) : undefined} />
        <InfoRow label="身高" value={formatHeight(scorer.height)} />
        <InfoRow label="体重" value={scorer.weight ? `${scorer.weight} kg` : undefined} />
        <InfoRow label="年龄" value={age != null ? `${age} 岁` : undefined} />
        <InfoRow label="出生日期" value={scorer.birthDate} />
        <InfoRow label="出生地" value={scorer.birthPlace} />
        <InfoRow label="俱乐部" value={scorer.club} />
      </section>

      {scorer.bio ? (
        <section className="sb-card p-4 mb-4">
          <p className="sb-label mb-2">简介</p>
          <p className="text-sm text-[var(--text-muted)] leading-relaxed">{scorer.bio}</p>
        </section>
      ) : (
        <section className="sb-card p-4 mb-4">
          <div className="flex items-start gap-3">
            <Goal size={16} className="text-[var(--accent)] flex-shrink-0 mt-0.5" />
            <p className="text-sm text-[var(--text-muted)]">
              详细资料待补充。可在 <code className="text-[var(--text)]">data/top-scorers.json</code> 中扩展字段。
            </p>
          </div>
        </section>
      )}
    </>
  );
}

export default function PlayerDetailPage() {
  const { playerId } = useParams<{ playerId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = readReturnTo(location.state);

  const handleBack = () => {
    if (returnTo) navigate(returnTo, { replace: true });
    else navigate(-1);
  };

  const squadPlayer = playerId ? getPlayerById(playerId) : undefined;
  const historicalScorer = playerId?.startsWith('historical-')
    ? getHistoricalScorerById(playerId)
    : undefined;

  if (!squadPlayer && !historicalScorer) {
    return (
      <>
        <DetailTopNav title="球员详情" onBack={handleBack} />
        <div className="px-4 pt-[calc(3.5rem+env(safe-area-inset-top))] pb-24">
          <div className="sb-card p-8 text-center mt-4">
            <p className="text-sm text-[var(--text-muted)]">未找到该球员</p>
          </div>
        </div>
      </>
    );
  }

  const title = squadPlayer
    ? playerNameZh(squadPlayer)
    : historicalScorer?.name ?? '球员详情';
  const subtitle = squadPlayer
    ? `${positionLabel(squadPlayer.position)} · 2026 世界杯`
    : '历史射手 · 世界杯';

  return (
    <>
      <DetailTopNav title={title} subtitle={subtitle} onBack={handleBack} />

      <div className="px-4 pt-[calc(3.5rem+env(safe-area-inset-top))] pb-8">
        {squadPlayer && <SquadPlayerDetail player={squadPlayer} />}
        {historicalScorer && <HistoricalScorerDetail scorer={historicalScorer} />}
        <Footer />
      </div>
    </>
  );
}
