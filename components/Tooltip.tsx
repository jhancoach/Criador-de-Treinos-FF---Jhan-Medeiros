import React, { useState } from 'react';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  className?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children, className = '', position = 'top' }) => {
  const [isVisible, setIsVisible] = useState(false);

  const getPositionClasses = () => {
    switch (position) {
      case 'top': return 'bottom-full mb-2 left-1/2 -translate-x-1/2';
      case 'bottom': return 'top-full mt-2 left-1/2 -translate-x-1/2';
      case 'left': return 'right-full mr-2 top-1/2 -translate-y-1/2';
      case 'right': return 'left-full ml-2 top-1/2 -translate-y-1/2';
      default: return 'bottom-full mb-2 left-1/2 -translate-x-1/2';
    }
  };

  const getArrowClasses = () => {
    switch (position) {
      case 'top': return 'top-full left-1/2 -translate-x-1/2 border-t-gray-700';
      case 'bottom': return 'bottom-full left-1/2 -translate-x-1/2 border-b-gray-700';
      case 'left': return 'left-full top-1/2 -translate-y-1/2 border-l-gray-700';
      case 'right': return 'right-full top-1/2 -translate-y-1/2 border-r-gray-700';
      default: return 'top-full left-1/2 -translate-x-1/2 border-t-gray-700';
    }
  };

  return (
    <div 
      className={`relative flex items-center justify-center ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className={`absolute ${getPositionClasses()} w-max max-w-[200px] px-3 py-1.5 bg-[#111] border border-gray-700 text-white text-[10px] font-medium uppercase tracking-wide rounded shadow-[0_4px_12px_rgba(0,0,0,0.5)] z-[100] animate-fade-in pointer-events-none text-center backdrop-blur-sm bg-opacity-95`}>
          {content}
          {/* Arrow */}
          <div className={`absolute border-4 border-transparent ${getArrowClasses()}`}></div>
        </div>
      )}
    </div>
  );
};