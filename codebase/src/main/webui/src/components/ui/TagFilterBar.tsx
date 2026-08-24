import React from 'react';
import { useTranslation } from 'react-i18next';
import { Tag as TagIcon } from 'lucide-react';
import type { TagCount } from '../../api/songs';

export interface TagFilterBarProps {
  tags: TagCount[];
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
  totalCount?: number;
  className?: string;
}

export const TagFilterBar: React.FC<TagFilterBarProps> = ({
  tags,
  selectedTag,
  onSelectTag,
  totalCount,
  className = '',
}) => {
  const { t } = useTranslation();

  if (!tags || tags.length === 0) {
    return null;
  }

  return (
    <div
      className={`w-full flex items-center gap-2 overflow-x-auto no-scrollbar py-1 text-sm ${className}`}
      data-testid="tag-filter-bar"
    >
      <button
        type="button"
        onClick={() => onSelectTag(null)}
        className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-medium transition-all focus:outline-none min-h-[36px] ${
          selectedTag === null
            ? 'bg-[#8629cc] text-white shadow-sm'
            : 'bg-bg-card hover:bg-bg-elevated text-text-main border border-border-main'
        }`}
        data-testid="tag-chip-all"
      >
        <TagIcon className="w-3.5 h-3.5" />
        <span>{t('tags.all', 'Todas')}</span>
        {totalCount !== undefined && (
          <span
            className={`text-xs px-1.5 py-0.2 rounded-full font-bold ${
              selectedTag === null ? 'bg-white/20 text-white' : 'bg-[#8629cc]/10 text-[#8629cc]'
            }`}
          >
            {totalCount}
          </span>
        )}
      </button>

      {tags.map((tag) => {
        const isSelected = selectedTag === tag.name;
        return (
          <button
            key={tag.name}
            type="button"
            onClick={() => onSelectTag(isSelected ? null : tag.name)}
            className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-medium transition-all focus:outline-none min-h-[36px] ${
              isSelected
                ? 'bg-[#8629cc] text-white shadow-sm'
                : 'bg-bg-card hover:bg-bg-elevated text-text-main border border-border-main'
            }`}
            data-testid={`tag-filter-chip-${tag.name}`}
          >
            <span>{tag.name}</span>
            <span
              className={`text-xs px-1.5 py-0.2 rounded-full font-bold ${
                isSelected ? 'bg-white/20 text-white' : 'bg-[#8629cc]/10 text-[#8629cc]'
              }`}
            >
              {tag.count}
            </span>
          </button>
        );
      })}
    </div>
  );
};
