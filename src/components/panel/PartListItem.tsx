import React from 'react';
import type { PartInfo, PartConfig } from '@/types';
import { MATERIAL_NAMES } from '@/types';

interface PartListItemProps {
  part: PartInfo;
  config: PartConfig;
  isSelected: boolean;
  onSelect: () => void;
  onToggleVisibility: () => void;
}

export const PartListItem: React.FC<PartListItemProps> = ({
  part,
  config,
  isSelected,
  onSelect,
  onToggleVisibility,
}) => {
  return (
    <div
      className={`
        flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all
        ${
          isSelected
            ? 'bg-primary-accent text-white'
            : 'hover:bg-primary-bg-secondary text-primary-text'
        }
      `}
      onClick={onSelect}
    >
      {/* 颜色预览 */}
      <div
        className="w-8 h-8 rounded-md border-2 flex-shrink-0"
        style={{
          backgroundColor: config.color,
          borderColor: isSelected ? 'white' : '#E5E5E5',
        }}
      />

      {/* 部件信息 */}
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm truncate">{part.name}</div>
        <div
          className={`text-xs truncate ${
            isSelected ? 'text-white/70' : 'text-primary-text-secondary'
          }`}
        >
          {MATERIAL_NAMES[config.materialType]}
        </div>
      </div>

      {/* 可见性切换按钮 */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleVisibility();
        }}
        className={`
          p-1 rounded transition-colors
          ${
            isSelected
              ? 'hover:bg-white/20'
              : 'hover:bg-gray-200'
          }
        `}
        title={config.visible ? '隐藏部件' : '显示部件'}
      >
        {config.visible ? (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
          </svg>
        )}
      </button>
    </div>
  );
};
