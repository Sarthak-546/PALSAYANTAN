import type { ReactNode } from 'react';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'destructive' | 'link';
  size?: 'small' | 'medium' | 'large';
  className?: string;
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

export const Button = ({
  variant = 'primary',
  size = 'medium',
  className = '',
  children,
  onClick,
  disabled = false,
}: ButtonProps) => {
  const baseClasses = 'disabled:opacity-50 disabled:pointer-events-none transition-all focus:outline-none focus:ring-2 focus:ring-offset-2';

  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-300',
    destructive: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    link: 'text-blue-600 hover:text-blue-800 underline',
  };

  const sizeClasses = {
    small: 'h-9 px-3 text-sm',
    medium: 'h-10 px-4 text-base',
    large: 'h-12 px-6 text-lg font-medium',
  };

  const classes = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${className}
  `;

  return (
    <button
      className={classes.trim()}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};