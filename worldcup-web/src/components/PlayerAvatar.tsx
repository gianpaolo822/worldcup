import { useState } from 'react';
import { getPlayerPhotoPath } from '@/lib/playerUtils';

interface PlayerAvatarProps {
  playerId: string;
  number?: number;
  size?: 'sm' | 'md' | 'lg';
  captain?: boolean;
  numberColor?: string;
  className?: string;
}

const SIZE_CLASS = {
  sm: 'w-9 h-9',
  md: 'w-10 h-10 text-[9px]',
  lg: 'w-16 h-16 text-sm',
} as const;

function PlaceholderIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 22c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  );
}

export default function PlayerAvatar({
  playerId,
  number,
  size = 'md',
  captain,
  numberColor = '#2563eb',
  className = '',
}: PlayerAvatarProps) {
  const [failed, setFailed] = useState(false);
  const photoPath = getPlayerPhotoPath(playerId);
  const showPhoto = photoPath && !failed;
  const sizeClass = SIZE_CLASS[size];

  return (
    <div className={`relative flex-shrink-0 ${className}`}>
      <div
        className={`${sizeClass} rounded-full border-2 overflow-hidden flex items-center justify-center`}
        style={{
          borderColor: captain ? 'var(--accent)' : 'rgba(255,255,255,0.35)',
          background: showPhoto
            ? undefined
            : 'linear-gradient(180deg, #4a5568 0%, #2d3748 100%)',
        }}
      >
        {showPhoto ? (
          <img
            src={photoPath}
            alt=""
            className="w-full h-full object-cover object-top"
            loading="lazy"
            onError={() => setFailed(true)}
          />
        ) : (
          <PlaceholderIcon className={`${size === 'lg' ? 'w-8 h-8' : size === 'sm' ? 'w-4 h-4' : 'w-6 h-6'} text-white/25`} />
        )}
      </div>
      {number != null && (
        <span
          className="absolute -bottom-0.5 -left-0.5 min-w-[1.125rem] h-[1.125rem] px-0.5 rounded-full flex items-center justify-center text-[9px] font-bold text-white tabular-nums"
          style={{ backgroundColor: numberColor }}
        >
          {number}
        </span>
      )}
      {captain && (
        <span
          className="absolute -top-0.5 -left-0.5 w-3.5 h-3.5 rounded-full text-[8px] font-bold flex items-center justify-center text-[#0a0a0a] z-[2]"
          style={{ backgroundColor: 'var(--accent)' }}
        >
          C
        </span>
      )}
    </div>
  );
}
