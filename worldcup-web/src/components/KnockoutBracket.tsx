import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GroupSelector from '@/components/GroupSelector';
import KnockoutMatchNode from '@/components/KnockoutMatchNode';
import {
  KNOCKOUT_ROUNDS,
  getDefaultKnockoutStage,
  getKnockoutDisplayRows,
  getKnockoutRoundMeta,
  isKnockoutStageCompleteBySchedule,
  type KnockoutStage,
} from '@/lib/knockout';
import { getMatchWinnerId } from '@/lib/matchDisplay';
import type { Match } from '@/types';

function feederAdvancesToSlot(feeder: Match, next: Match, slot: 'home' | 'away'): boolean {
  const winnerId = getMatchWinnerId(feeder);
  if (!winnerId) return false;
  const team = slot === 'home' ? next.homeTeam : next.awayTeam;
  return team.id === winnerId;
}

function BracketForkConnector({
  feeders,
  nextMatch,
}: {
  feeders: Match[];
  nextMatch: Match;
}) {
  const top = feeders[0];
  const bottom = feeders[1];
  const topActive = top ? feederAdvancesToSlot(top, nextMatch, 'home') : false;
  const bottomActive = bottom ? feederAdvancesToSlot(bottom, nextMatch, 'away') : false;
  const accent = 'var(--accent)';
  const muted = 'var(--border-strong)';

  return (
    <div className="flex items-stretch w-8 flex-shrink-0 self-stretch py-2">
      <svg
        viewBox="0 0 32 100"
        className="h-full w-full min-h-[120px]"
        preserveAspectRatio="none"
        aria-hidden
      >
        {top ? (
          <path
            d="M0 18 H14 V50 H28"
            fill="none"
            stroke={topActive ? accent : muted}
            strokeWidth={topActive ? 2.2 : 1.2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : null}
        {bottom ? (
          <path
            d="M0 82 H14 V50 H28"
            fill="none"
            stroke={bottomActive ? accent : muted}
            strokeWidth={bottomActive ? 2.2 : 1.2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : null}
        {(topActive || bottomActive) && (
          <circle cx="28" cy="50" r="2.5" fill={accent} />
        )}
      </svg>
    </div>
  );
}

export default function KnockoutBracket() {
  const navigate = useNavigate();
  const [activeRound, setActiveRound] = useState<KnockoutStage>(() => getDefaultKnockoutStage());

  useEffect(() => {
    const syncRound = () => {
      setActiveRound((current) => {
        if (!isKnockoutStageCompleteBySchedule(current)) return current;
        return getDefaultKnockoutStage();
      });
    };

    syncRound();
    const timerId = window.setInterval(syncRound, 60_000);
    return () => window.clearInterval(timerId);
  }, []);

  const roundMeta = getKnockoutRoundMeta(activeRound);
  const displayRows = useMemo(() => getKnockoutDisplayRows(activeRound), [activeRound]);
  const hasNextRound = roundMeta.nextStage != null || activeRound === '半决赛';
  const roundLabels = KNOCKOUT_ROUNDS.map((r) => r.label);

  const nextColumnTitle =
    activeRound === '半决赛'
      ? '决赛 / 季军赛'
      : roundMeta.nextStage
        ? getKnockoutRoundMeta(roundMeta.nextStage as KnockoutStage).label
        : roundMeta.label;

  return (
    <div className="px-4 pb-4">
      <section className="mb-3">
        <p className="sb-label mb-2">淘汰赛阶段</p>
        <GroupSelector
          groups={roundLabels}
          activeGroup={roundMeta.label}
          onSelect={(label) => {
            const round = KNOCKOUT_ROUNDS.find((r) => r.label === label);
            if (round) setActiveRound(round.stage);
          }}
        />
      </section>

      <div className="overflow-x-auto hide-scrollbar -mx-4 px-4">
        {!hasNextRound ? (
          <div className="flex flex-col gap-3 min-w-min pb-2">
            <p className="sb-label mb-1 text-center">{roundMeta.label}</p>
            {displayRows.map(({ next }) => (
              <div
                key={next.id}
                onClick={() => navigate(`/match/${next.id}`)}
                className="cursor-pointer flex justify-center"
              >
                <KnockoutMatchNode match={next} />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-4 min-w-min pb-2">
            <div className="flex gap-2">
              <p className="sb-label flex-1 text-center">{roundMeta.label}</p>
              <div className="w-8 flex-shrink-0" />
              <p className="sb-label flex-1 text-center min-w-[148px]">{nextColumnTitle}</p>
            </div>

            {displayRows.map((row) => (
              <div key={row.next.id} className="flex items-stretch gap-2">
                <div className="flex flex-col gap-2 justify-center flex-shrink-0">
                  {row.feeders.map((feeder) => (
                    <div
                      key={feeder.id}
                      onClick={() => navigate(`/match/${feeder.id}`)}
                      className="cursor-pointer"
                    >
                      <KnockoutMatchNode
                        match={feeder}
                        advancementTarget={row.next}
                      />
                    </div>
                  ))}
                </div>

                <BracketForkConnector feeders={row.feeders} nextMatch={row.next} />

                <div className="flex flex-col gap-2 justify-center flex-shrink-0">
                  <div
                    onClick={() => navigate(`/match/${row.next.id}`)}
                    className="cursor-pointer"
                  >
                    <KnockoutMatchNode match={row.next} />
                  </div>
                  {row.nextSecondary ? (
                    <div
                      onClick={() => navigate(`/match/${row.nextSecondary!.id}`)}
                      className="cursor-pointer"
                    >
                      <KnockoutMatchNode match={row.nextSecondary} />
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
