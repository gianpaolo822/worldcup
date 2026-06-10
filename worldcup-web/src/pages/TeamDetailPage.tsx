import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import DetailTopNav from '@/components/DetailTopNav';
import MatchCard from '@/components/MatchCard';
import Footer from '@/components/Footer';
import {
  getCoachByTeamId,
  getMatchesByTeam,
  getPlayersByTeam,
  getStandingsByGroup,
  getTeamById,
  teams,
} from '@/lib/data';
import { groupPlayersByPosition, positionLabel } from '@/lib/playerUtils';
import { buildReturnTo, parseTeamTab, type TeamTab } from '@/lib/navigation';
import { UserRound } from 'lucide-react';

const TEAM_TABS: { id: TeamTab; label: string }[] = [
  { id: 'schedule', label: '赛程' },
  { id: 'squad', label: '阵容' },
  { id: 'overview', label: '概况' },
];

export default function TeamDetailPage() {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = parseTeamTab(searchParams.get('tab'));

  const setTab = (next: TeamTab) => {
    if (next === 'schedule') {
      setSearchParams({}, { replace: true });
    } else {
      setSearchParams({ tab: next }, { replace: true });
    }
  };

  const returnTo = buildReturnTo(location.pathname, location.search);

  const team = teamId ? getTeamById(teamId) : undefined;

  if (!team) {
    return (
      <>
        <DetailTopNav title="球队详情" onBack={() => navigate(-1)} />
        <div className="px-4 pt-[calc(3.5rem+env(safe-area-inset-top))] pb-24">
          <div className="sb-card p-8 text-center mt-4">
            <p className="text-sm text-[var(--text-muted)]">未找到该支球队</p>
          </div>
        </div>
      </>
    );
  }

  const coach = getCoachByTeamId(team.id);
  const teamMatches = getMatchesByTeam(team.id);
  const squad = getPlayersByTeam(team.id);
  const grouped = groupPlayersByPosition(squad);
  const standingRow = getStandingsByGroup(team.group).find((r) => r.team.id === team.id);
  const groupOpponents = teams.filter((t) => t.group === team.group && t.id !== team.id);
  const injured = squad.filter((p) => p.status === 'injured');

  return (
    <>
      <DetailTopNav title={team.name} subtitle={`${team.group} 组 · ${team.code}`} onBack={() => navigate(-1)} />

      <div className="px-4 pt-[calc(3.5rem+env(safe-area-inset-top))] pb-8">
        <section className="sb-card-elevated p-5 mt-4 mb-4 text-center">
          <span className="text-5xl block mb-3">{team.flag}</span>
          <h2 className="text-lg font-bold text-[var(--text)]">{team.name}</h2>
          <p className="text-xs text-[var(--text-muted)] mt-1">{team.nameEn}</p>
          {coach && (
            <p className="text-xs text-[var(--text-muted)] mt-3">
              主教练 · {coach.name}
              {coach.nationality ? `（${coach.nationality}）` : ''}
            </p>
          )}
        </section>

        {standingRow && (
          <section className="sb-card p-4 mb-4">
            <p className="sb-label mb-3">{team.group} 组积分</p>
            <div className="grid grid-cols-4 gap-2 text-center">
              {[
                { label: '赛', value: standingRow.played },
                { label: '胜', value: standingRow.won },
                { label: '净胜', value: standingRow.gd > 0 ? `+${standingRow.gd}` : standingRow.gd },
                { label: '积分', value: standingRow.points, accent: true },
              ].map((item) => (
                <div key={item.label}>
                  <p className="text-[10px] text-[var(--text-muted)] mb-1">{item.label}</p>
                  <p
                    className={`text-lg font-bold tabular-nums ${
                      item.accent ? 'text-[var(--accent)]' : 'text-[var(--text)]'
                    }`}
                  >
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="mb-4">
          <div
            className="grid grid-cols-3 gap-1 p-1 rounded-lg border"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            {TEAM_TABS.map((item) => {
              const active = tab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTab(item.id)}
                  className={`py-2 rounded-md text-xs font-semibold transition-all active:scale-[0.98] ${
                    active ? 'text-[#0a0a0a]' : 'text-[var(--text-muted)]'
                  }`}
                  style={active ? { backgroundColor: 'var(--accent)' } : undefined}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </section>

        {tab === 'schedule' && (
          <section className="space-y-2 mb-4">
            {teamMatches.length === 0 ? (
              <div className="sb-card p-6 text-center">
                <p className="text-sm text-[var(--text-muted)]">暂无赛程</p>
              </div>
            ) : (
              teamMatches.map((match) => (
                <MatchCard key={match.id} match={match} onClick={() => navigate(`/match/${match.id}`)} />
              ))
            )}
          </section>
        )}

        {tab === 'squad' && (
          <section className="space-y-4 mb-4">
            <p className="text-xs text-[var(--text-muted)]">共 {squad.length} 人 · 正式名单</p>
            {Object.entries(grouped).map(([pos, list]) => (
              <div key={pos}>
                <p className="sb-label mb-2">{positionLabel(pos)}</p>
                <div className="sb-card overflow-hidden divide-y" style={{ borderColor: 'var(--border)' }}>
                  {list.map((player) => (
                    <Link
                      key={player.id}
                      to={`/player/${player.id}`}
                      state={{ returnTo }}
                      className="flex items-center gap-3 px-3 py-2.5 active:bg-white/[0.03] transition-colors"
                    >
                      <span
                        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 border"
                        style={{
                          borderColor: 'var(--border)',
                          backgroundColor: 'var(--surface-elevated)',
                          color: 'var(--text-muted)',
                        }}
                      >
                        {player.number}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-[var(--text)] truncate">{player.name}</p>
                        <p className="text-[10px] text-[var(--text-muted)] truncate">
                          {player.club ?? '俱乐部待定'}
                        </p>
                      </div>
                      {player.status === 'injured' && (
                        <span className="text-[10px] text-[var(--danger)] flex-shrink-0">伤退</span>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </section>
        )}

        {tab === 'overview' && (
          <section className="space-y-4 mb-4">
            {coach && (
              <div className="sb-card p-4">
                <div className="flex items-start gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 border"
                    style={{ backgroundColor: 'var(--surface-elevated)', borderColor: 'var(--border)' }}
                  >
                    <UserRound size={18} className="text-[var(--accent)]" />
                  </div>
                  <div>
                    <p className="sb-label mb-1">主教练</p>
                    <p className="text-sm font-semibold text-[var(--text)]">{coach.name}</p>
                    <p className="text-xs text-[var(--text-muted)]">{coach.nameEn}</p>
                    {coach.birthDate && (
                      <p className="text-[10px] text-[var(--text-muted)] mt-1">生日 {coach.birthDate}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="sb-card p-4">
              <p className="sb-label mb-2">同组对手</p>
              <div className="flex flex-wrap gap-2">
                {groupOpponents.map((opponent) => (
                  <Link
                    key={opponent.id}
                    to={`/team/${opponent.id}`}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-xs font-medium text-[var(--text)] active:scale-[0.98]"
                    style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface-elevated)' }}
                  >
                    <span>{opponent.flag}</span>
                    {opponent.name}
                  </Link>
                ))}
              </div>
            </div>

            {injured.length > 0 && (
              <div className="sb-card p-4">
                <p className="sb-label mb-2">因伤退出</p>
                <div className="space-y-2">
                  {injured.map((player) => (
                    <Link
                      key={player.id}
                      to={`/player/${player.id}`}
                      state={{ returnTo }}
                      className="block text-sm text-[var(--text-muted)]"
                    >
                      <span className="text-[var(--text)] font-medium">{player.name}</span>
                      {player.injuryNote && (
                        <span className="block text-[10px] mt-0.5">{player.injuryNote}</span>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        <Footer />
      </div>
    </>
  );
}
