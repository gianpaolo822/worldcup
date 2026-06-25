import { Link, useNavigate, useParams } from 'react-router-dom';
import DetailTopNav from '@/components/DetailTopNav';
import MatchCard from '@/components/MatchCard';
import GroupStandingsTable from '@/components/GroupStandingsTable';
import Footer from '@/components/Footer';
import MatchLineupPanel from '@/components/MatchLineupPanel';
import {
  formatMatchKickoffBeijing,
  getGroupMatches,
  getMatchById,
  getVenueByName,
} from '@/lib/data';
import { getLineupTeams, getMatchLineup } from '@/lib/lineup';
import { matchStatusLabel, resolveMatchDisplay } from '@/lib/matchDisplay';
import { useNow } from '@/hooks/useNow';
import { MapPin, Users } from 'lucide-react';

function TeamLink({ teamId, name, flag }: { teamId: string; name: string; flag: string }) {
  return (
    <Link
      to={`/team/${teamId}`}
      className="flex items-center gap-2 px-3 py-2.5 rounded-lg border active:scale-[0.98] transition-transform min-w-0 flex-1"
      style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      <span className="text-xl flex-shrink-0">{flag}</span>
      <span className="text-sm font-medium text-[var(--text)] truncate">{name}</span>
    </Link>
  );
}

export default function MatchDetailPage() {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();
  const now = useNow();
  const match = matchId ? getMatchById(matchId) : undefined;

  if (!match) {
    return (
      <>
        <DetailTopNav title="赛事详情" onBack={() => navigate(-1)} />
        <div className="px-4 pt-[calc(3.5rem+env(safe-area-inset-top))] pb-24">
          <div className="sb-card p-8 text-center mt-4">
            <p className="text-sm text-[var(--text-muted)]">未找到该场比赛</p>
          </div>
        </div>
      </>
    );
  }

  const venue = getVenueByName(match.venue);
  const display = resolveMatchDisplay(match, now);
  const isFinished = display.status === 'finished';
  const isLive = display.status === 'live';
  const showScore = isLive || isFinished;
  const groupMatches = match.group ? getGroupMatches(match.group, match.id) : [];
  const matchLineup = getMatchLineup(match.id);
  const lineupTeams = getLineupTeams(match.id);

  const subtitle = [match.group && `${match.group} 组`, match.stage].filter(Boolean).join(' · ');

  return (
    <>
      <DetailTopNav title="赛事详情" subtitle={subtitle} onBack={() => navigate(-1)} />

      <div className="px-4 pt-[calc(3.5rem+env(safe-area-inset-top))] pb-8">
        <section className="sb-card-elevated p-5 mt-4 mb-4">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              {match.group && <span className="sb-badge-accent">{match.group} 组</span>}
              {match.stage && <span className="sb-badge">{match.stage}</span>}
              {match.matchday > 0 && match.stage === '小组赛' && (
                <span className="sb-badge">第 {match.matchday} 轮</span>
              )}
            </div>
            <span className={`text-xs font-semibold ${isLive ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'}`}>
              {matchStatusLabel(display.status)}
            </span>
          </div>

          <div className="flex items-center justify-between py-2">
            <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
              <span className="text-4xl">{match.homeTeam.flag}</span>
              <span className="text-sm font-semibold text-[var(--text)] text-center truncate w-full">
                {match.homeTeam.name}
              </span>
            </div>
            <div className="flex flex-col items-center px-4 flex-shrink-0">
              {showScore ? (
                <div className="flex items-center gap-2 tabular-nums">
                  <span className="text-3xl font-bold text-[var(--text)]">{display.homeScore}</span>
                  <span className="text-sm text-[var(--text-faint)]">:</span>
                  <span className="text-3xl font-bold text-[var(--text)]">{display.awayScore}</span>
                </div>
              ) : (
                <span className="text-lg font-semibold text-[var(--text-faint)]">VS</span>
              )}
            </div>
            <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
              <span className="text-4xl">{match.awayTeam.flag}</span>
              <span className="text-sm font-semibold text-[var(--text)] text-center truncate w-full">
                {match.awayTeam.name}
              </span>
            </div>
          </div>
        </section>

        <section className="sb-card p-4 mb-4 space-y-3">
          <div className="flex items-start gap-3">
            <MapPin size={16} className="text-[var(--accent)] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-[var(--text)]">
                {formatMatchKickoffBeijing(match)}（北京时间）
              </p>
              <p className="text-xs text-[var(--text-muted)] mt-1">{match.venue}</p>
              {venue && (
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  {venue.city} · {venue.country}
                  {venue.capacity ? ` · 容量 ${venue.capacity.toLocaleString()} 人` : ''}
                </p>
              )}
              {venue?.note && <p className="text-[10px] text-[var(--accent)] mt-1">{venue.note}</p>}
            </div>
          </div>
        </section>

        <section className="mb-4">
          <p className="sb-label mb-2">参赛球队</p>
          <div className="flex gap-2">
            <TeamLink teamId={match.homeTeam.id} name={match.homeTeam.name} flag={match.homeTeam.flag} />
            <TeamLink teamId={match.awayTeam.id} name={match.awayTeam.name} flag={match.awayTeam.flag} />
          </div>
        </section>

        <section className="mb-4">
          <p className="sb-label mb-2">阵容与事件</p>
          {matchLineup && lineupTeams ? (
            <MatchLineupPanel
              homeTeam={lineupTeams.home}
              awayTeam={lineupTeams.away}
              lineup={matchLineup}
            />
          ) : (
            <div className="sb-card p-4">
              <p className="text-sm text-[var(--text-muted)]">
                {display.status === 'upcoming'
                  ? '比赛尚未开始，阵容与进球事件将在赛前或赛后更新。'
                  : '详细阵容与事件数据将在后续版本补充。'}
              </p>
            </div>
          )}
        </section>

        {match.group && (
          <section className="mb-4">
            <p className="sb-label mb-2">{match.group} 组形势</p>
            <GroupStandingsTable
              group={match.group}
              highlightTeamIds={[match.homeTeam.id, match.awayTeam.id]}
              dense
            />
          </section>
        )}

        {groupMatches.length > 0 && (
          <section className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Users size={14} className="text-[var(--accent)]" />
              <p className="sb-label normal-case mb-0">同组其他场次</p>
            </div>
            <div className="space-y-2">
              {groupMatches.map((m) => (
                <MatchCard key={m.id} match={m} onClick={() => navigate(`/match/${m.id}`)} />
              ))}
            </div>
          </section>
        )}

        <Footer />
      </div>
    </>
  );
}
