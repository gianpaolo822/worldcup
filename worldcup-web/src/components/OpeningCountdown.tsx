import { useEffect, useMemo, useState } from 'react';
import { getOpeningMatch } from '@/lib/data';

function formatOpeningLabel(time: string): string {
  const m = time.match(/^(\d{4})-(\d{2})-(\d{2})\s+(\d{1,2}):(\d{2})/);
  if (!m) return '距世界杯揭幕战开始';
  const month = Number(m[2]);
  const day = Number(m[3]);
  const hour = m[4];
  const minute = m[5];
  const clock = minute === '00' ? `${hour}:00` : `${hour}:${minute}`;
  return `距${month}月${day}日${clock}世界杯揭幕战开始`;
}

function useCountdown(targetMs: number | null) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (targetMs == null) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [targetMs]);

  return useMemo(() => {
    if (targetMs == null) return null;
    const diff = Math.max(0, targetMs - now);
    return {
      days: Math.floor(diff / 86_400_000),
      hours: Math.floor((diff % 86_400_000) / 3_600_000),
      minutes: Math.floor((diff % 3_600_000) / 60_000),
      seconds: Math.floor((diff % 60_000) / 1000),
      ended: diff <= 0,
    };
  }, [now, targetMs]);
}

function DigitBoxes({ value, minDigits = 2 }: { value: number; minDigits?: number }) {
  const digits = String(value).padStart(minDigits, '0').split('');
  return (
    <span className="inline-flex gap-0.5">
      {digits.map((digit, index) => (
        <span
          key={`${index}-${digit}`}
          className="inline-flex h-8 w-[1.375rem] items-center justify-center rounded-md bg-white text-base font-bold tabular-nums"
          style={{ color: '#0a5c52' }}
        >
          {digit}
        </span>
      ))}
    </span>
  );
}

function CountdownUnit({
  value,
  label,
  minDigits = 2,
}: {
  value: number;
  label: string;
  minDigits?: number;
}) {
  return (
    <span className="inline-flex items-center gap-1 flex-shrink-0">
      <DigitBoxes value={value} minDigits={minDigits} />
      <span className="text-xs text-white/95">{label}</span>
    </span>
  );
}

export default function OpeningCountdown() {
  const opening = getOpeningMatch();
  const kickoffMs = opening?.kickoffAt ? new Date(opening.kickoffAt).getTime() : NaN;
  const targetMs = Number.isFinite(kickoffMs) ? kickoffMs : null;
  const countdown = useCountdown(targetMs);

  if (!opening || !countdown || countdown.ended) return null;

  const dayDigits = countdown.days >= 100 ? 3 : 2;

  return (
    <section className="px-4 pt-4 pb-2">
      <div
        className="rounded-xl px-4 py-5 text-center overflow-hidden"
        style={{ background: 'linear-gradient(180deg, #3d5afe 0%, #3355ff 100%)' }}
      >
        <h2 className="text-[1.35rem] font-bold leading-tight tracking-tight">
          <span className="text-white">2026</span>
          <span className="text-[#d7ff4f]">美加墨</span>
          <span className="relative inline-block text-[#d7ff4f]">
            世界杯
            <span
              className="absolute left-0 right-0 -bottom-0.5 h-[3px] rounded-full"
              style={{ backgroundColor: '#d7ff4f' }}
            />
          </span>
        </h2>

        <p className="mt-3 text-sm text-white/90">{formatOpeningLabel(opening.time)}</p>

        <div className="mt-4 overflow-x-auto hide-scrollbar">
          <div className="inline-flex min-w-full items-center justify-center gap-1 whitespace-nowrap text-white">
            <span className="text-xs font-medium flex-shrink-0">倒计时：</span>
            <CountdownUnit value={countdown.days} label="天" minDigits={dayDigits} />
            <CountdownUnit value={countdown.hours} label="时" />
            <CountdownUnit value={countdown.minutes} label="分" />
            <CountdownUnit value={countdown.seconds} label="秒" />
          </div>
        </div>
      </div>
    </section>
  );
}
