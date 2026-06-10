interface GroupSelectorProps {
  groups: string[];
  activeGroup: string;
  onSelect: (group: string) => void;
}

export default function GroupSelector({ groups, activeGroup, onSelect }: GroupSelectorProps) {
  return (
    <div className="flex gap-1.5 overflow-x-auto hide-scrollbar py-0.5">
      {groups.map((group) => {
        const isActive = activeGroup === group;
        return (
          <button
            key={group}
            type="button"
            onClick={() => onSelect(group)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all duration-200 active:scale-[0.98] select-none border ${
              isActive
                ? 'text-[#0a0a0a] border-transparent'
                : 'text-[var(--text-muted)] border-[var(--border)] bg-[var(--surface)] hover:text-[var(--text)] hover:border-[var(--border-strong)]'
            }`}
            style={isActive ? { backgroundColor: 'var(--accent)' } : undefined}
          >
            {group}
          </button>
        );
      })}
    </div>
  );
}
