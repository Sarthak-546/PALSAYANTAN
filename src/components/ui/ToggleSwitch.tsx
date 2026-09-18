import { useState } from 'react';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}

export const ToggleSwitch = ({ checked, onChange, className = '' }: ToggleSwitchProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.checked);
  };

  return (
    <label className={`relative inline-flex h-6 w-11 items-center ${className}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={handleChange}
        className="sr-only peer"
      />
      <div className="w-11 h-6 bg-gray-200 rounded-full peer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 transition-dark peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-disabled:after:border-gray-400 peer-checked:bg-blue-600"></div>
    </label>
  );
};