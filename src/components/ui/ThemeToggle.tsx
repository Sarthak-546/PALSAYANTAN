import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { flushSync } from 'react-dom';

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

  const handleToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Fallback if browser doesn't support View Transitions
    if (!document.startViewTransition) {
      toggleTheme();
      return;
    }

    // Calculate the exact center of the screen
    const x = window.innerWidth / 2;
    const y = window.innerHeight / 2;
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const transition = document.startViewTransition(() => {
      flushSync(() => {
        toggleTheme();
      });
    });

    transition.ready.then(() => {
      const clipPath = [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${endRadius}px at ${x}px ${y}px)`,
      ];

      document.documentElement.animate(
        {
          clipPath: [...clipPath],
        },
        {
          duration: 500,
          easing: 'ease-in-out',
          pseudoElement: '::view-transition-new(root)',
        }
      );
    });
  };

  return (
    <button
      onClick={handleToggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`flex items-center justify-center p-2 rounded-full transition-colors ${baseStyles} ${className}`}
    >
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  );
};

export default ThemeToggle;
