import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDown, ArrowDownLeft, Footprints } from 'lucide-react';
import type { MatchEvent, ResolvedMatchLineup, ResolvedStarter, ResolvedTeamLineup } from '@/lib/lineup';
import { getSlotPositions } from '@/lib/lineupPositions';
import type { LineupSlot } from '@/lib/lineup';
import type { Team, Player } from '@/types';
import { getPlayerById } from '@/lib/data';
import { playerNameWithNumber, playerNameZh } from '@/lib/playerUtils';
import PlayerAvatar from '@/components/PlayerAvatar';
import MatchStatsPanel from '@/components/MatchStatsPanel';

type PanelTab = 'lineup' | 'events' | 'stats';

interface MatchLineupPanelProps {
  homeTeam: Team;
  awayTeam: Team;
  lineup: ResolvedMatchLineup;
}

const SLOT_ORDER: LineupSlot[] = [
  'GK',
  'LB',
  'LCB',
  'RCB',
  'RB',
  'LDM',
  'RDM',
  'LW',
  'CAM',
  'RW',
  'ST',
];

const EVENT_LABELS: Record<MatchEvent['type'], string> = {
  goal: '进球',
  assist: '助攻',
  yellow: '黄牌',
  red: '红牌',
  sub_out: '换下',
  sub_in: '换上',
};

function formatEventMinute(minute: number): string {
  if (minute > 90) return `90+${minute - 90}'`;
  return `${minute}'`;
}

function eventTeamId(playerId: string, homeTeam: Team, awayTeam: Team): Team {
  if (playerId.startsWith(`${homeTeam.id}-`) || playerId === homeTeam.id) return homeTeam;
  return awayTeam;
}

function isOwnGoal(ev: MatchEvent): boolean {
  return ev.type === 'goal' && !!ev.note?.includes('乌龙');
}

function eventAccent(ev: MatchEvent): string {
  if (ev.type === 'goal') return isOwnGoal(ev) ? 'var(--own-goal)' : 'var(--accent)';
  if (ev.type === 'red') return 'var(--danger)';
  if (ev.type === 'yellow') return '#eab308';
  return 'var(--text-muted)';
}

function EventTimelineIcon({ ev }: { ev: MatchEvent }) {
  if (ev.type === 'goal') {
    return (
      <span
        className="text-sm leading-none"
        style={{ color: isOwnGoal(ev) ? 'var(--own-goal)' : 'var(--accent)' }}
      >
        ⚽
      </span>
    );
  }
  if (ev.type === 'red') {
    return <span className="w-2.5 h-3.5 rounded-[2px] bg-red-500 border border-red-700 block" />;
  }
  if (ev.type === 'yellow') {
    return <span className="w-2.5 h-3.5 rounded-[2px] bg-yellow-400 border border-yellow-600 block" />;
  }
  return <ArrowDownLeft size={14} className="text-[var(--text-muted)]" />;
}

function formatEventPlayer(player: Player | undefined, fallbackId: string): string {
  return player ? playerNameWithNumber(player) : fallbackId;
}

function describeEvent(ev: MatchEvent): string {
  const player = getPlayerById(ev.playerId);
  const related = ev.relatedPlayerId ? getPlayerById(ev.relatedPlayerId) : undefined;
  const name = formatEventPlayer(player, ev.playerId);

  if (ev.type === 'goal') {
    if (isOwnGoal(ev)) {
      return `${name} 乌龙球`;
    }
    const assist = related
      ? `（助攻：${formatEventPlayer(related, ev.relatedPlayerId!)}）`
      : '';
    return `${name} 进球${assist}`;
  }
  if (ev.type === 'red' || ev.type === 'yellow') {
    return `${name} ${EVENT_LABELS[ev.type]}`;
  }
  if (ev.type === 'sub_out' && related) {
    return `${name} ↓ ${formatEventPlayer(related, ev.relatedPlayerId!)} ↑`;
  }
  return `${name} ${EVENT_LABELS[ev.type]}`;
}

function EventsList({ events, homeTeam, awayTeam }: { events: MatchEvent[]; homeTeam: Team; awayTeam: Team }) {
  const sorted = useMemo(
    () =>
      [...events].sort((a, b) => {
        if (a.minute !== b.minute) return a.minute - b.minute;
        const order: Record<MatchEvent['type'], number> = {
          goal: 0,
          assist: 1,
          yellow: 2,
          red: 3,
          sub_out: 4,
          sub_in: 5,
        };
        return order[a.type] - order[b.type];
      }),
    [events],
  );

  if (sorted.length === 0) {
    return (
      <p className="text-sm text-[var(--text-muted)] text-center py-8">暂无比赛事件</p>
    );
  }

  return (
    <div className="relative py-2">
      <div
        className="absolute left-[1.125rem] top-3 bottom-3 w-px"
        style={{ backgroundColor: 'var(--border)' }}
      />
      <ul className="space-y-0">
        {sorted.map((ev, i) => {
          const team = eventTeamId(ev.playerId, homeTeam, awayTeam);
          const accent = eventAccent(ev);
          const isLast = i === sorted.length - 1;

          return (
            <li key={`${ev.minute}-${ev.type}-${ev.playerId}-${i}`} className={`relative pl-10 ${isLast ? '' : 'pb-5'}`}>
              <span
                className="absolute left-2 top-1.5 w-5 h-5 rounded-full flex items-center justify-center border-2 z-10"
                style={{
                  borderColor: accent,
                  backgroundColor: 'var(--surface)',
                }}
              >
                <EventTimelineIcon ev={ev} />
              </span>
              <div
                className="rounded-lg px-3 py-2.5 border"
                style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface-elevated)' }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold tabular-nums" style={{ color: accent }}>
                    {formatEventMinute(ev.minute)}
                  </span>
                  <span className="text-sm">{team.flag}</span>
                  <span className="text-[10px] text-[var(--text-muted)]">{team.name}</span>
                </div>
                <p className="text-sm text-[var(--text)] leading-snug">{describeEvent(ev)}</p>
                {ev.note ? (
                  <p className="text-[11px] text-[var(--text-muted)] mt-1 leading-relaxed">{ev.note}</p>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function getPlayerMatchEvents(playerId: string, events: MatchEvent[]): MatchEvent[] {
  return events.filter(
    (ev) =>
      ev.playerId === playerId ||
      (ev.type === 'sub_out' && ev.relatedPlayerId === playerId),
  );
}

function PlayerEvents({ events }: { events: MatchEvent[] }) {
  if (events.length === 0) return null;

  const goals = events.filter((e) => e.type === 'goal' && !isOwnGoal(e)).length;
  const ownGoals = events.filter((e) => isOwnGoal(e)).length;
  const assists = events.filter((e) => e.type === 'assist').length;
  const subOut = events.find((e) => e.type === 'sub_out');
  const hasYellow = events.some((e) => e.type === 'yellow');
  const hasRed = events.some((e) => e.type === 'red');

  return (
    <div className="absolute -top-1 -right-1 flex flex-col items-end gap-0.5 pointer-events-none z-[3]">
      {(goals > 0 || ownGoals > 0 || hasRed) && (
        <div className="relative shrink-0">
          {hasRed && (
            <span className="flex items-center justify-center min-w-[1.125rem] h-[1.125rem] bg-black/70 rounded px-0.5">
              <span className="w-2.5 h-3 rounded-[1px] bg-red-500 border border-red-700 block" />
            </span>
          )}
          {goals > 0 && (
            <span
              className={`flex items-center gap-0.5 text-[9px] bg-black/70 rounded px-1 py-0.5 ${
                hasRed ? 'absolute -top-1 -right-1' : ''
              }`}
            >
              <span style={{ color: 'var(--accent)' }}>⚽</span>
              {goals > 1 && <span className="text-white font-bold">{goals}</span>}
            </span>
          )}
          {ownGoals > 0 && (
            <span
              className={`flex items-center gap-0.5 text-[9px] bg-black/70 rounded px-1 py-0.5 ${
                hasRed || goals > 0 ? 'absolute -top-1 -right-1' : ''
              }`}
            >
              <span style={{ color: 'var(--own-goal)' }}>⚽</span>
              {ownGoals > 1 && <span className="text-white font-bold">{ownGoals}</span>}
            </span>
          )}
        </div>
      )}
      {assists > 0 && (
        <span className="flex items-center gap-0.5 text-[9px] bg-black/70 rounded px-1 py-0.5">
          <Footprints size={9} className="text-white" />
          {assists > 1 && <span className="text-white font-bold">{assists}</span>}
        </span>
      )}
      {hasYellow && (
        <span className="flex items-center justify-center min-w-[1.125rem] h-[1.125rem] bg-black/70 rounded px-0.5">
          <span className="w-2.5 h-3 rounded-[1px] bg-yellow-400 border border-yellow-600 block" />
        </span>
      )}
      {subOut && (
        <span className="flex items-center gap-0.5 text-[8px] text-red-400 font-semibold bg-black/70 rounded px-0.5">
          <ArrowDown size={10} />
          {formatEventMinute(subOut.minute)}
        </span>
      )}
    </div>
  );
}

function BenchEventBadges({ events, playerId }: { events: MatchEvent[]; playerId: string }) {
  if (events.length === 0) return null;

  const sorted = [...events].sort((a, b) => a.minute - b.minute);

  return (
    <span className="inline-flex items-center gap-1 flex-shrink-0 ml-1">
      {sorted.map((ev, i) => {
        if (ev.type === 'goal') {
          const ownGoal = isOwnGoal(ev);
          return (
            <span
              key={i}
              className="inline-flex items-center gap-0.5 text-[9px]"
              style={{ color: ownGoal ? 'var(--own-goal)' : 'var(--accent)' }}
              title={`${formatEventMinute(ev.minute)} ${ownGoal ? '乌龙球' : '进球'}`}
            >
              ⚽
              <span className="tabular-nums text-[var(--text-muted)]">{formatEventMinute(ev.minute)}</span>
            </span>
          );
        }
        if (ev.type === 'yellow') {
          return (
            <span
              key={i}
              className="w-2 h-2.5 rounded-[1px] bg-yellow-400 border border-yellow-600"
              title={`${formatEventMinute(ev.minute)} 黄牌`}
            />
          );
        }
        if (ev.type === 'red') {
          return (
            <span
              key={i}
              className="w-2 h-2.5 rounded-[1px] bg-red-500 border border-red-700"
              title={`${formatEventMinute(ev.minute)} 红牌`}
            />
          );
        }
        if (ev.type === 'sub_out' && ev.relatedPlayerId === playerId) {
          return (
            <span key={i} className="text-[9px] text-emerald-400 tabular-nums" title={`${formatEventMinute(ev.minute)} 换上`}>
              ↑{formatEventMinute(ev.minute)}
            </span>
          );
        }
        return null;
      })}
    </span>
  );
}

function BenchColumn({
  team,
  bench,
  events,
  align,
}: {
  team: Team;
  bench: { player: Player; note?: string }[];
  events: MatchEvent[];
  align: 'left' | 'right';
}) {
  const sorted = [...bench].sort((a, b) => a.player.number - b.player.number);

  return (
    <div className="min-w-0">
      <p
        className={`text-[10px] font-semibold text-[var(--text-muted)] mb-2 truncate ${
          align === 'right' ? 'text-right' : 'text-left'
        }`}
      >
        {team.flag} {team.name}
      </p>
      <ul className="space-y-1">
        {sorted.map((b) => {
          const playerEvents = getPlayerMatchEvents(b.player.id, events);
          return (
            <li
              key={b.player.id}
              className={`flex items-center gap-1 min-w-0 ${
                align === 'right' ? 'flex-row-reverse text-right' : 'text-left'
              }`}
            >
              <Link
                to={`/player/${b.player.id}`}
                className={`inline-flex items-center gap-1 min-w-0 text-[11px] hover:text-[var(--accent)] ${
                  align === 'right' ? 'flex-row-reverse' : ''
                }`}
              >
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold tabular-nums flex-shrink-0 border"
                  style={{
                    borderColor: 'var(--border)',
                    backgroundColor: 'var(--surface-elevated)',
                    color: 'var(--text-muted)',
                  }}
                >
                  {b.player.number}
                </span>
                <span className="text-[var(--text)] truncate">{playerNameZh(b.player)}</span>
              </Link>
              <BenchEventBadges events={playerEvents} playerId={b.player.id} />
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function PitchPlayer({
  entry,
  x,
  y,
  events,
  side,
}: {
  entry: ResolvedStarter;
  x: number;
  y: number;
  events: MatchEvent[];
  side: 'home' | 'away';
}) {
  const { player, captain } = entry;
  const playerEvents = events.filter((e) => e.playerId === player.id);
  const numberColor = side === 'home' ? '#2563eb' : '#dc2626';

  return (
    <Link
      to={`/player/${player.id}`}
      className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center min-w-0 max-w-[5.5rem] active:scale-95 transition-transform z-10"
      style={{ left: `${x}%`, top: `${y}%` }}
    >
      <div className="relative">
        <PlayerEvents events={playerEvents} />
        <PlayerAvatar
          playerId={player.id}
          number={player.number}
          captain={captain}
          numberColor={numberColor}
          size="md"
        />
      </div>
      <p className="mt-1.5 w-full min-w-0 text-[9px] font-medium text-white text-center leading-snug whitespace-nowrap truncate drop-shadow-md">
        {playerNameZh(player)}
      </p>
    </Link>
  );
}

function TeamHalf({
  teamLineup,
  side,
  events,
}: {
  teamLineup: ResolvedTeamLineup;
  side: 'home' | 'away';
  events: MatchEvent[];
}) {
  const positions = getSlotPositions(teamLineup.formation, side);
  if (!positions) return null;

  return (
    <>
      {SLOT_ORDER.map((slot) => {
        const entry = teamLineup.starters[slot];
        if (!entry) return null;
        const pos = positions[slot];
        return (
          <PitchPlayer key={`${side}-${slot}`} entry={entry} x={pos.x} y={pos.y} events={events} side={side} />
        );
      })}
    </>
  );
}

function PitchMarkings() {
  return (
    <>
      <div
        className="absolute inset-x-3 top-3 bottom-3 rounded-sm border pointer-events-none"
        style={{ borderColor: 'rgba(255,255,255,0.35)' }}
      />
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[28%] aspect-square rounded-full border pointer-events-none"
        style={{ borderColor: 'rgba(255,255,255,0.35)' }}
      />
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full pointer-events-none"
        style={{ backgroundColor: 'rgba(255,255,255,0.5)' }}
      />
      <div
        className="absolute inset-x-[18%] top-[5%] h-[12%] border border-t-0 pointer-events-none rounded-b-sm"
        style={{ borderColor: 'rgba(255,255,255,0.25)' }}
      />
      <div
        className="absolute inset-x-[18%] bottom-[5%] h-[12%] border border-b-0 pointer-events-none rounded-t-sm"
        style={{ borderColor: 'rgba(255,255,255,0.25)' }}
      />
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 w-full h-px pointer-events-none"
        style={{ backgroundColor: 'rgba(255,255,255,0.35)' }}
      />
    </>
  );
}

function SubstitutesBar({
  homeTeam,
  awayTeam,
  homeLineup,
  awayLineup,
  events,
}: {
  homeTeam: Team;
  awayTeam: Team;
  homeLineup: ResolvedTeamLineup;
  awayLineup: ResolvedTeamLineup;
  events: MatchEvent[];
}) {
  const hasBench = homeLineup.bench.length > 0 || awayLineup.bench.length > 0;
  if (!hasBench) return null;

  return (
    <div
      className="border-t px-3 py-3"
      style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}
    >
      <p className="text-xs font-semibold text-[var(--text-muted)] mb-3">替补名单</p>
      <div className="grid grid-cols-2 gap-4">
        <BenchColumn team={homeTeam} bench={homeLineup.bench} events={events} align="left" />
        <BenchColumn team={awayTeam} bench={awayLineup.bench} events={events} align="right" />
      </div>
    </div>
  );
}

export default function MatchLineupPanel({ homeTeam, awayTeam, lineup }: MatchLineupPanelProps) {
  const [tab, setTab] = useState<PanelTab>('lineup');

  const tabs: { id: PanelTab; label: string }[] = [
    { id: 'lineup', label: '阵容' },
    { id: 'events', label: '事件' },
    { id: 'stats', label: '技术统计' },
  ];

  return (
    <div className="rounded-xl overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
      <div
        className="flex border-b overflow-x-auto hide-scrollbar"
        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}
      >
        {tabs.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`flex-shrink-0 px-4 py-2.5 text-sm font-medium relative transition-colors ${
                active ? 'text-[var(--text)]' : 'text-[var(--text-muted)]'
              }`}
            >
              {t.label}
              {active && (
                <span
                  className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full"
                  style={{ backgroundColor: 'var(--accent)' }}
                />
              )}
            </button>
          );
        })}
      </div>

      {tab === 'lineup' ? (
        <>
          <div
            className="relative w-full min-h-[680px] h-[78vh] max-h-[860px] overflow-hidden"
            style={{
              background: 'linear-gradient(180deg, #3d8b5a 0%, #2f7a4f 45%, #2f7a4f 55%, #3d8b5a 100%)',
            }}
          >
            <PitchMarkings />

            <div
              className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-1 rounded-md z-20 pointer-events-none"
              style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
            >
              <span className="text-base">{awayTeam.flag}</span>
              <span className="text-xs font-semibold text-white">{awayTeam.name}</span>
              <span className="text-[10px] text-white/70">{lineup.away.formation}</span>
            </div>

            <div
              className="absolute bottom-2 right-2 flex items-center gap-1.5 px-2 py-1 rounded-md z-20 pointer-events-none"
              style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
            >
              <span className="text-base">{homeTeam.flag}</span>
              <span className="text-xs font-semibold text-white">{homeTeam.name}</span>
              <span className="text-[10px] text-white/70">{lineup.home.formation}</span>
            </div>

            <TeamHalf teamLineup={lineup.away} side="away" events={lineup.events} />
            <TeamHalf teamLineup={lineup.home} side="home" events={lineup.events} />
          </div>

          <SubstitutesBar
            homeTeam={homeTeam}
            awayTeam={awayTeam}
            homeLineup={lineup.home}
            awayLineup={lineup.away}
            events={lineup.events}
          />
        </>
      ) : tab === 'events' ? (
        <div className="px-3 py-2 min-h-[200px]" style={{ backgroundColor: 'var(--surface)' }}>
          <EventsList events={lineup.events} homeTeam={homeTeam} awayTeam={awayTeam} />
        </div>
      ) : (
        <div className="px-4 py-3 min-h-[200px]" style={{ backgroundColor: 'var(--surface)' }}>
          {lineup.stats ? (
            <MatchStatsPanel homeTeam={homeTeam} awayTeam={awayTeam} stats={lineup.stats} />
          ) : (
            <p className="text-sm text-[var(--text-muted)] text-center py-8">暂无技术统计数据</p>
          )}
        </div>
      )}
    </div>
  );
}
