import { ReactNode } from 'react';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export const Logo = ({ size = 'medium', className = '' }: LogoProps) => {
  const sizeClasses = {
    small: 'h-6 w-6',
    medium: 'h-8 w-8',
    large: 'h-10 w-10',
  };

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      {/* Simple logo: a cross with a heart in the center */}
      <svg viewBox="0 0 24 24" className="w-full h-full" aria-label="AR Emergency First Aid Assistant">
        <path d="M12 2L15 8L21 8L16 11L18 16L12 13L6 16L8 11L3 8L9 8Z" fill="currentColor" />
      </svg>
    </div>
  );
};