import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GroupSelector from '@/components/GroupSelector';
import KnockoutMatchNode from '@/components/KnockoutMatchNode';
import {
  KNOCKOUT_ROUNDS,
  getKnockoutMatches,
  type KnockoutStage,
} from '@/lib/knockout';

function BracketConnector({ pairs }: { pairs: number }) {
  return (
    <div className="flex flex-col justify-around py-4 w-5 flex-shrink-0 self-stretch">
      {Array.from({ length: pairs }).map((_, i) => (
        <div key={i} className="flex items-center h-[calc(100%/var(--pairs))]" style={{ ['--pairs' as string]: pairs }}>
          <div className="w-full flex items-center">
            <div className="h-px flex-1" style={{ backgroundColor: 'var(--border-strong)' }} />
            <div
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: 'var(--accent)', opacity: 0.6 }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function KnockoutBracket() {
  const navigate = useNavigate();
  const [activeRound, setActiveRound] = useState<KnockoutStage>('1/16决赛');

  const roundMeta = KNOCKOUT_ROUNDS.find((r) => r.stage === activeRound)!;
  const currentMatches = useMemo(() => getKnockoutMatches(activeRound), [activeRound]);
  const nextMatches = useMemo(() => {
    if (activeRound === '半决赛') {
      return [...getKnockoutMatches('决赛'), ...getKnockoutMatches('季军战')];
    }
    if (roundMeta.nextStage) return getKnockoutMatches(roundMeta.nextStage);
    return [];
  }, [activeRound, roundMeta.nextStage]);

  const roundLabels = KNOCKOUT_ROUNDS.map((r) => r.label);
  const pairCount = Math.max(1, Math.ceil(currentMatches.length / 2));

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
        <div className="flex items-stretch gap-2 min-w-min pb-2">
          <div className="flex flex-col flex-shrink-0">
            <p className="sb-label mb-2 text-center">{roundMeta.label}</p>
            <div className="flex flex-col gap-3 justify-around flex-1 min-h-[200px]">
              {currentMatches.map((match) => (
                <div key={match.id} onClick={() => navigate(`/match/${match.id}`)} className="cursor-pointer">
                  <KnockoutMatchNode match={match} />
                </div>
              ))}
            </div>
          </div>

          {nextMatches.length > 0 && (
            <>
              <BracketConnector pairs={Math.min(pairCount, nextMatches.length)} />
              <div className="flex flex-col flex-shrink-0">
                <p className="sb-label mb-2 text-center">
                  {activeRound === '半决赛'
                    ? '决赛 / 季军赛'
                    : KNOCKOUT_ROUNDS.find((r) => r.stage === roundMeta.nextStage)?.label}
                </p>
                <div className="flex flex-col gap-3 justify-around flex-1 min-h-[200px]">
                  {nextMatches.map((match) => (
                    <div key={match.id} onClick={() => navigate(`/match/${match.id}`)} className="cursor-pointer">
                      <KnockoutMatchNode match={match} />
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

    </div>
  );
}
