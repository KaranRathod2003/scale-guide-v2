'use client';

interface SliderInputProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export default function SliderInput({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  onChange,
  disabled = false,
}: SliderInputProps) {
  const percent = ((value - min) / (max - min)) * 100;

  return (
    <div className={`space-y-1.5 ${disabled ? 'opacity-50' : ''}`}>
      <div className="flex items-center justify-between text-xs">
        <span className="text-zinc-300">{label}</span>
        <span className="font-mono text-[11px] font-medium text-white">
          {value}{unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={disabled}
        className="sim-slider w-full"
        style={{
          background: `linear-gradient(to right, rgb(99 102 241 / 0.6) 0%, rgb(99 102 241 / 0.6) ${percent}%, rgb(82 82 91 / 0.4) ${percent}%, rgb(82 82 91 / 0.4) 100%)`,
        }}
      />
      <div className="flex justify-between text-[9px] text-zinc-500">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );
}
