import React from 'react';
import { BpCategory } from '../../types/vital';
import { getBpCategoryInfo } from '../../utils/bpCategories';

interface BpCategoryBadgeProps {
  category?: BpCategory;
  showDescription?: boolean;
}

export const BpCategoryBadge: React.FC<BpCategoryBadgeProps> = ({ category, showDescription = false }) => {
  const info = getBpCategoryInfo(category);
  if (!info) return null;

  return (
    <div className="inline-flex flex-col items-start">
      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${info.badgeBg} ${info.badgeText}`}>
        <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-80" />
        {info.label}
      </span>
      {showDescription && (
        <span className="text-[10px] text-slate-400 mt-0.5 pl-0.5">
          {info.description}
        </span>
      )}
    </div>
  );
};
