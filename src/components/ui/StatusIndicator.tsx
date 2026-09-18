interface StatusIndicatorProps {
  status: 'ready' | 'offline' | 'error';
  label: string;
  className?: string;
}

export const StatusIndicator = ({ status, label, className = '' }: StatusIndicatorProps) => {
  const statusClasses = {
    ready: 'bg-green-500',
    offline: 'bg-gray-500',
    error: 'bg-red-500',
  };

  return (
    <div className={`${statusClasses[status]} w-3 h-3 rounded-full ${className}`} aria-label={label} />
  );
};