import React from 'react';
import { BadgeType } from '@/types/database';
import { getBadgeInfo } from '@/lib/gamification';

interface BadgeProps {
  badgeType: BadgeType;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
}

export function Badge({ badgeType, size = 'md', showTooltip = true }: BadgeProps) {
  const info = getBadgeInfo(badgeType);

  const sizeClasses = {
    sm: 'w-8 h-8 text-lg',
    md: 'w-12 h-12 text-2xl',
    lg: 'w-16 h-16 text-4xl'
  };

  return (
    <div className="relative group inline-block">
      <div
        className={`${sizeClasses[size]} bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform`}
      >
        <span className="filter drop-shadow-sm">{info.emoji}</span>
      </div>

      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
          <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap">
            <div className="font-semibold">{info.name}</div>
            <div className="text-gray-300">{info.description}</div>
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
              <div className="border-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
