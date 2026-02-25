'use client';

interface DatabaseIconProps {
  size?: number;
  className?: string;
  animated?: boolean;
}

export default function DatabaseIcon({ size = 48, className = '' }: DatabaseIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      {/* Cylinder body */}
      <ellipse cx="24" cy="12" rx="16" ry="6" className="fill-brand-500/20 stroke-brand-400" strokeWidth="1.5" />
      <path d="M8 12v24c0 3.314 7.163 6 16 6s16-2.686 16-6V12" className="stroke-brand-400" strokeWidth="1.5" fill="none" />
      <ellipse cx="24" cy="36" rx="16" ry="6" className="fill-brand-500/10 stroke-brand-400" strokeWidth="1.5" />
      {/* Middle ring */}
      <path d="M8 24c0 3.314 7.163 6 16 6s16-2.686 16-6" className="stroke-brand-400/50" strokeWidth="1" strokeDasharray="3 2" />
    </svg>
  );
}
