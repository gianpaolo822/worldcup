import type { Player } from '@/types';
import { playerNameEn, playerNameZh } from '@/lib/playerUtils';

interface PlayerNameLinesProps {
  player: Player;
  primaryClassName?: string;
  secondaryClassName?: string;
}

export default function PlayerNameLines({
  player,
  primaryClassName = 'text-sm font-medium text-[var(--text)] truncate',
  secondaryClassName = 'text-[10px] text-[var(--text-muted)] truncate',
}: PlayerNameLinesProps) {
  return (
    <div className="min-w-0">
      <p className={primaryClassName}>{playerNameZh(player)}</p>
      <p className={secondaryClassName}>{playerNameEn(player)}</p>
    </div>
  );
}
