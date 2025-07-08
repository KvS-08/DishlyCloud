import React from 'react';

interface AvatarProps {
  src?: string | null;
  alt: string;
  fallback: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Avatar: React.FC<AvatarProps> = ({ 
  src, 
  alt, 
  fallback, 
  size = 'md' 
}) => {
  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
  };

  const initials = fallback
    .split(' ')
    .map(name => name[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);

  return (
    <div className={`relative rounded-full overflow-hidden bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200 ${sizeClasses[size]}`}>
      {src ? (
        <img 
          src={src} 
          alt={alt} 
          className="h-full w-full object-cover" 
        />
      ) : (
        <div className="h-full w-full flex items-center justify-center font-medium">
          {initials}
        </div>
      )}
    </div>
  );
};