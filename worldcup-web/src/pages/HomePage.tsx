import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  formatScheduleDate,
  formatMatchVenue,
  getMatchDateKey,
  matches,
  pickHeroMatch,
  sortMatchesByKickoff,
} from '@/lib/data';
import MatchCard from '@/components/MatchCard';
import OpeningCountdown from '@/components/OpeningCountdown';
import ScheduleFilterBar, { ALL_DATES, ALL_TEAMS } from '@/components/ScheduleFilterBar';
import { MapPin, Users, Calendar, Globe } from 'lucide-react';
import type { Match } from '@/types';

function heroStatusLabel(status: string): string {
  if (status === 'live') return '进行中';
  if (status === 'finished') return '已结束';
  return '未开始';
}

const stats = [
  { label: '参赛球队', value: '48', hint: '扩军后首届', icon: Users },
  { label: '比赛场次', value: '104', hint: '历史之最', icon: Calendar },
  { label: '举办国家', value: '美/加/墨', hint: '三国联办', icon: Globe },
  { label: '开幕时间', value: '06.12', hint: '2026 年', icon: Calendar },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [activeDateKey, setActiveDateKey] = useState(ALL_DATES);
  const [activeTeamId, setActiveTeamId] = useState(ALL_TEAMS);

  const heroMatch = pickHeroMatch();

  const filteredMatches = useMemo(() => {
    let list = sortMatchesByKickoff(matches);

    if (activeDateKey !== ALL_DATES) {
      list = list.filter((m) => getMatchDateKey(m) === activeDateKey);
    }

    if (activeTeamId !== ALL_TEAMS) {
      list = list.filter((m) => m.homeTeam.id === activeTeamId || m.awayTeam.id === activeTeamId);
    }

    return list;
  }, [activeDateKey, activeTeamId]);

  const matchesByDate = useMemo(() => {
    if (activeDateKey !== ALL_DATES) return null;

    const groups = new Map<string, Match[]>();
    for (const match of filteredMatches) {
      const key = getMatchDateKey(match);
      const bucket = groups.get(key) ?? [];
      bucket.push(match);
      groups.set(key, bucket);
    }
    return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [activeDateKey, filteredMatches]);

  if (!heroMatch) {
    return (
      <div className="pb-24 px-4 pt-8 text-center">
        <div className="sb-card p-6 max-w-sm mx-auto">
          <p className="text-sm text-[var(--text-muted)]">暂无赛程数据，请运行 npm run data:refresh</p>
        </div>
      </div>
    );
  }

  const isLive = heroMatch.status === 'live';
  const isFinished = heroMatch.status === 'finished';

  return (
    <div className="pb-24">
      <OpeningCountdown />

      <section className="px-4 pt-2 pb-2">
        <div className="sb-card-elevated p-5 shadow-sb-glow relative overflow-hidden cursor-pointer active:scale-[0.995] transition-transform" onClick={() => navigate(`/match/${heroMatch.id}`)}>
          <div
            className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-30 pointer-events-none"
            style={{ background: 'var(--accent-glow)' }}
          />

          <div className="relative">
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              {heroMatch.group && <span className="sb-badge-accent">{heroMatch.group} 组</span>}
              <span className="sb-badge">{heroMatch.time}</span>
              <span className="sb-badge">
                <MapPin size={10} />
                {formatMatchVenue(heroMatch)}
              </span>
              {isLive && <span className="sb-badge-live animate-pulse">LIVE</span>}
            </div>

            <p className="sb-label mb-3">焦点赛事</p>

            <div className="flex items-center justify-between py-2">
              <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
                <span className="text-4xl">{heroMatch.homeTeam.flag}</span>
                <span className="text-sm font-semibold text-[var(--text)] text-center truncate w-full">
                  {heroMatch.homeTeam.name}
                </span>
              </div>

              <div className="flex flex-col items-center px-4 flex-shrink-0">
                {isFinished && heroMatch.homeScore != null && heroMatch.awayScore != null ? (
                  <div className="flex items-center gap-2 tabular-nums">
                    <span className="text-3xl font-bold text-[var(--text)]">{heroMatch.homeScore}</span>
                    <span className="text-sm text-[var(--text-faint)]">:</span>
                    <span className="text-3xl font-bold text-[var(--text)]">{heroMatch.awayScore}</span>
                  </div>
                ) : (
                  <span className="text-lg font-semibold text-[var(--text-faint)]">VS</span>
                )}
                <span className="mt-2 sb-badge">{heroStatusLabel(heroMatch.status)}</span>
              </div>

              <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
                <span className="text-4xl">{heroMatch.awayTeam.flag}</span>
                <span className="text-sm font-semibold text-[var(--text)] text-center truncate w-full">
                  {heroMatch.awayTeam.name}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ScheduleFilterBar
        activeDateKey={activeDateKey}
        activeTeamId={activeTeamId}
        onDateChange={setActiveDateKey}
        onTeamChange={setActiveTeamId}
      />

      <section className="px-4 space-y-3">
        {filteredMatches.length === 0 && (
          <div className="sb-card p-8 text-center">
            <p className="text-sm text-[var(--text-muted)]">当前筛选条件下暂无比赛</p>
          </div>
        )}

        {matchesByDate
          ? matchesByDate.map(([dateKey, dayMatches]) => (
              <div key={dateKey} className="space-y-2">
                <h3 className="sb-section-title sticky top-[calc(6.75rem+env(safe-area-inset-top))] z-10 py-2 -mx-1 px-1 bg-[var(--bg)]/90 backdrop-blur-sm">
                  {formatScheduleDate(dateKey)}
                </h3>
                {dayMatches.map((match) => (
                  <MatchCard key={match.id} match={match} onClick={() => navigate(`/match/${match.id}`)} />
                ))}
              </div>
            ))
          : filteredMatches.map((match) => (
              <MatchCard key={match.id} match={match} onClick={() => navigate(`/match/${match.id}`)} />
            ))}
      </section>

      <section className="px-4 mt-8">
        <h2 className="sb-section-title mb-3">赛事概览</h2>
        <div className="grid grid-cols-2 gap-2">
          {stats.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="sb-card p-3.5">
                <div className="flex items-center gap-1.5 mb-2">
                  <Icon size={12} className="text-[var(--accent)]" strokeWidth={2} />
                  <p className="sb-label normal-case tracking-normal">{item.label}</p>
                </div>
                <p className="text-xl font-bold text-[var(--text)] tabular-nums">{item.value}</p>
                <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{item.hint}</p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
