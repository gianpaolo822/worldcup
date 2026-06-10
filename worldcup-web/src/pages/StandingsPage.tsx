import { useState } from 'react';
import { groups } from '@/lib/data';
import { isGroupStageComplete } from '@/lib/knockout';
import GroupSelector from '@/components/GroupSelector';
import GroupStandingsTable from '@/components/GroupStandingsTable';
import KnockoutBracket from '@/components/KnockoutBracket';

type PhaseTab = 'group' | 'knockout';

const PHASE_TABS: { id: PhaseTab; label: string }[] = [
  { id: 'group', label: '小组赛' },
  { id: 'knockout', label: '淘汰赛' },
];

const ANCHOR_SCROLL_MARGIN = 'scroll-mt-[calc(7.5rem+env(safe-area-inset-top))]';

export default function StandingsPage() {
  const [phaseTab, setPhaseTab] = useState<PhaseTab>(() =>
    isGroupStageComplete() ? 'knockout' : 'group',
  );
  const [anchorGroup, setAnchorGroup] = useState(groups[0] ?? 'A');

  const scrollToGroup = (groupLabel: string) => {
    const code = groupLabel.replace(' 组', '').replace('组', '');
    setAnchorGroup(code);
    document.getElementById(`standings-group-${code}`)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  return (
    <div className="pb-24">
      <section className="px-4 pt-4 pb-3">
        <div
          className="grid grid-cols-2 gap-1 p-1 rounded-lg border"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          {PHASE_TABS.map((tab) => {
            const active = phaseTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setPhaseTab(tab.id)}
                className={`py-2.5 rounded-md text-sm font-semibold transition-all active:scale-[0.98] ${
                  active ? 'text-[#0a0a0a]' : 'text-[var(--text-muted)]'
                }`}
                style={active ? { backgroundColor: 'var(--accent)' } : undefined}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </section>

      {phaseTab === 'group' && (
        <>
          <section
            className="sticky z-20 px-4 pb-3 pt-1 -mx-0 backdrop-blur-md"
            style={{
              top: 'calc(6.75rem + env(safe-area-inset-top))',
              backgroundColor: 'rgba(10, 10, 10, 0.88)',
            }}
          >
            <p className="sb-label mb-2">定位小组</p>
            <GroupSelector
              groups={groups.map((g) => `${g} 组`)}
              activeGroup={`${anchorGroup} 组`}
              onSelect={scrollToGroup}
            />
            <div className="flex items-center gap-2 mt-3">
              <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: 'var(--accent)' }} />
              <span className="text-[10px] text-[var(--text-muted)]">绿色高亮为晋级区（前 2 名）</span>
            </div>
          </section>

          <div className="px-4 space-y-6">
            {groups.map((group) => (
              <section
                key={group}
                id={`standings-group-${group}`}
                className={ANCHOR_SCROLL_MARGIN}
              >
                <h3 className="sb-section-title mb-2">{group} 组</h3>
                <GroupStandingsTable group={group} />
              </section>
            ))}
          </div>
        </>
      )}

      {phaseTab === 'knockout' && <KnockoutBracket />}
    </div>
  );
}
