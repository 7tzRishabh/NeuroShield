import React from 'react';

interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

export default function Slider({ value, onChange, min = 1, max = 100 }: SliderProps) {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="relative w-full h-6 flex items-center group">
      {/* Background track */}
      <div className="absolute w-full h-2 bg-surface-glass border border-border rounded-full overflow-hidden">
        {/* Fill track */}
        <div
          className="h-full bg-gradient-to-r from-accent to-accent-purple transition-all duration-150 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      {/* Thumb (visual) */}
      <div
        className="absolute w-4 h-4 bg-white rounded-full shadow-[0_0_10px_rgba(0,242,255,0.5)] pointer-events-none transition-all duration-150 ease-out group-hover:scale-125 group-hover:shadow-[0_0_15px_rgba(0,242,255,0.8)]"
        style={{ left: `calc(${percentage}% - 8px)` }}
      />
      
      {/* Invisible native input for interaction */}
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="absolute w-full h-full opacity-0 cursor-pointer"
        aria-label="Slider value"
      />
    </div>
  );
}
