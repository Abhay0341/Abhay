import React from 'react';

interface MegnotLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  textColor?: 'dark' | 'light' | 'auto';
  subtitle?: string;
}

export const MegnotLogo: React.FC<MegnotLogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
  textColor = 'auto',
  subtitle = 'Technical Help & Support Portal'
}) => {
  // Dimensions for icon
  const iconDimensions = {
    sm: { width: 34, height: 22 },
    md: { width: 44, height: 28 },
    lg: { width: 62, height: 40 },
    xl: { width: 90, height: 58 }
  }[size];

  const textSizes = {
    sm: { title: 'text-sm', sub: 'text-[10px]' },
    md: { title: 'text-base sm:text-lg', sub: 'text-[11px] sm:text-xs' },
    lg: { title: 'text-lg sm:text-xl', sub: 'text-xs sm:text-sm' },
    xl: { title: 'text-2xl sm:text-3xl', sub: 'text-sm sm:text-base' }
  }[size];

  const textClass = textColor === 'light' 
    ? 'text-white' 
    : textColor === 'dark' 
      ? 'text-slate-900' 
      : 'text-slate-900 dark:text-white';

  const subTextClass = textColor === 'light' 
    ? 'text-slate-300' 
    : textColor === 'dark' 
      ? 'text-slate-500' 
      : 'text-slate-500';

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Official Magnot / Megnot Dual-Chevron Mountain Peak Emblem */}
      <div className="relative shrink-0 flex items-center justify-center">
        <svg
          width={iconDimensions.width}
          height={iconDimensions.height}
          viewBox="0 0 140 90"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-xs"
        >
          {/* Blue Chevron (Left Mountain Peak) */}
          <path
            d="M52 10L6 58H28L52 32L76 58H98L52 10Z"
            fill="#0D529C"
          />
          
          {/* Green Chevron (Right Overlapping Mountain Peak) */}
          <path
            d="M88 10L42 58H64L88 32L112 58H134L88 10Z"
            fill="#7CB342"
          />
        </svg>
      </div>

      {showText && (
        <div className="leading-tight">
          <div className="flex items-baseline gap-1.5">
            <span className={`font-extrabold tracking-tight font-display ${textSizes.title} ${textClass}`}>
              Megnot
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 border border-blue-200/80 px-1.5 py-0.2 rounded">
              Helpdesk
            </span>
          </div>
          {subtitle && (
            <p className={`font-medium ${textSizes.sub} ${subTextClass} line-clamp-1`}>
              {subtitle}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

// Compact standalone emblem badge
export const MegnotEmblem: React.FC<{ size?: number; className?: string }> = ({ size = 36, className = '' }) => {
  return (
    <div 
      className={`inline-flex items-center justify-center p-1.5 rounded-xl bg-white border border-slate-200 shadow-xs ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 140 90"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <path d="M52 10L6 58H28L52 32L76 58H98L52 10Z" fill="#0D529C" />
        <path d="M88 10L42 58H64L88 32L112 58H134L88 10Z" fill="#7CB342" />
      </svg>
    </div>
  );
};
