import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface ThemeToggleProps {
  className?: string;
  variant?: 'default' | 'glass';
}

export const ThemeToggle = ({ className = '', variant = 'default' }: ThemeToggleProps) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  const baseStyles = variant === 'glass'
    ? 'bg-slate-950/80 backdrop-blur-md border border-white/10 text-white hover:bg-slate-900/90'
    : isDark
      ? 'bg-slate-800 text-amber-300 hover:bg-slate-700'
      : 'bg-slate-100 text-slate-700 hover:bg-slate-200';

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`flex items-center justify-center p-2 rounded-full transition-colors ${baseStyles} ${className}`}
    >
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  );
};

export default ThemeToggle;
