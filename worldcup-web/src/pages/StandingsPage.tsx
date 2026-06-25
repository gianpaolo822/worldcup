import { useEffect, useRef, useState } from 'react';
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

/** 顶部导航 + 定位小组 sticky 栏的大致高度（scroll-mt 回退值） */
const ANCHOR_SCROLL_MARGIN =
  'scroll-mt-[calc(6.75rem+7.5rem+env(safe-area-inset-top))]';

export default function StandingsPage() {
  const stickyNavRef = useRef<HTMLElement>(null);
  const [phaseTab, setPhaseTab] = useState<PhaseTab>(() =>
    isGroupStageComplete() ? 'knockout' : 'group',
  );
  const [anchorGroup, setAnchorGroup] = useState(groups[0] ?? 'A');

  const getGroupScrollOffset = () => {
    const topNav = document.querySelector('header');
    const topNavHeight = topNav?.getBoundingClientRect().height ?? 0;
    const stickyHeight = stickyNavRef.current?.getBoundingClientRect().height ?? 0;
    return topNavHeight + stickyHeight + 12;
  };

  useEffect(() => {
    if (phaseTab !== 'group') return;

    const applyScrollMargin = () => {
      const offset = getGroupScrollOffset();
      for (const group of groups) {
        const el = document.getElementById(`standings-group-${group}`);
        if (el) el.style.scrollMarginTop = `${offset}px`;
      }
    };

    applyScrollMargin();
    window.addEventListener('resize', applyScrollMargin);
    return () => window.removeEventListener('resize', applyScrollMargin);
  }, [phaseTab]);

  const scrollToGroup = (groupLabel: string) => {
    const code = groupLabel.replace(' 组', '').replace('组', '');
    setAnchorGroup(code);
    const target = document.getElementById(`standings-group-${code}`);
    if (!target) return;

    const offset = getGroupScrollOffset();
    target.style.scrollMarginTop = `${offset}px`;
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
            ref={stickyNavRef}
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
            <div className="flex flex-col gap-1.5 mt-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: 'var(--accent)' }} />
                <span className="text-[10px] text-[var(--text-muted)]">绿色：小组前 2 名确定出线</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-sm bg-amber-400" />
                <span className="text-[10px] text-[var(--text-muted)]">
                  黄色：小组第 3 名待定（12 组第三中取成绩最好 8 支；小组赛结束后确定）
                </span>
              </div>
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
