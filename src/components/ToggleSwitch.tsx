import React from 'react';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  color?: 'accent' | 'purple';
}

export default function ToggleSwitch({ checked, onChange, color = 'accent' }: ToggleSwitchProps) {
  const bgClass = checked
    ? (color === 'purple' ? 'bg-gradient-to-r from-accent-purple to-purple-500 border-transparent' : 'bg-gradient-to-r from-accent to-blue-500 border-transparent')
    : 'bg-surface border border-border';

  const ringClass = color === 'purple' ? 'focus-visible:ring-accent-purple' : 'focus-visible:ring-accent';

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`w-12 h-6 rounded-full relative transition-all duration-300 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-bg ${ringClass} ${bgClass} hover:shadow-[0_0_10px_rgba(255,255,255,0.1)]`}
    >
      <span
        className={`block w-4 h-4 rounded-full bg-white absolute top-[3px] transition-transform duration-300 ease-in-out shadow-sm ${
          checked ? 'translate-x-[26px]' : 'translate-x-[3px]'
        }`}
      />
    </button>
  );
}
