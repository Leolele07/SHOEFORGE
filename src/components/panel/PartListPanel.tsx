import React from 'react';
import { useCustomizationStore } from '@/store/customizationStore';
import { PART_GROUP_NAMES } from '@/types';
import type { PartGroup } from '@/types';

export const PartListPanel: React.FC = () => {
  const { parts, partConfigs, selectedPartId, selectPart, togglePartVisibility } = useCustomizationStore();

  // 按分组组织部件
  const groupedParts = parts.reduce((acc, part) => {
    if (!acc[part.group]) {
      acc[part.group] = [];
    }
    acc[part.group].push(part);
    return acc;
  }, {} as Record<PartGroup, typeof parts>);

  // 分组顺序
  const groupOrder: PartGroup[] = ['upper', 'midsole', 'outsole', 'tongue', 'lace', 'heel', 'swoosh', 'lining', 'other'];

  return (
    <div className="part-list-panel">
      {/* 部件列表 */}
      <div className="part-list-content">
        {groupOrder.map((group) => {
          const partsInGroup = groupedParts[group];
          if (!partsInGroup || partsInGroup.length === 0) return null;

          return (
            <div key={group} className="part-group">
              {/* 分组标题 */}
              <div className="part-group-header">
                <span className="part-group-title">{PART_GROUP_NAMES[group]}</span>
                <span className="part-group-count">{partsInGroup.length}</span>
              </div>

              {/* 部件列表 */}
              <div className="part-group-items">
                {partsInGroup.map((part) => {
                  const config = partConfigs.get(part.partId);
                  if (!config) return null;

                  const isSelected = selectedPartId === part.partId;

                  return (
                    <div
                      key={part.partId}
                      className={`part-item ${isSelected ? 'selected' : ''}`}
                      onClick={() => selectPart(part.partId)}
                    >
                      {/* 颜色指示器 */}
                      <div
                        className="part-item-color"
                        style={{ backgroundColor: config.color }}
                      />

                      {/* 部件信息 */}
                      <div className="part-item-info">
                        <span className="part-item-name">{part.name}</span>
                        <span className="part-item-material">
                          {config.materialType === 'leather' && '皮革'}
                          {config.materialType === 'mesh' && '网面'}
                          {config.materialType === 'suede' && '麂皮'}
                          {config.materialType === 'canvas' && '帆布'}
                          {config.materialType === 'patent' && '光面'}
                          {config.materialType === 'metallic' && '金属'}
                        </span>
                      </div>

                      {/* 可见性按钮 */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePartVisibility(part.partId);
                        }}
                        className={`part-item-visibility ${!config.visible ? 'hidden' : ''}`}
                        title={config.visible ? '隐藏部件' : '显示部件'}
                      >
                        {config.visible ? (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        ) : (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                            <line x1="1" y1="1" x2="23" y2="23" />
                          </svg>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* 空状态 */}
        {parts.length === 0 && (
          <div className="part-list-empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
            <p>加载模型后显示可定制部件</p>
          </div>
        )}
      </div>

      <style>{`
        .part-list-panel {
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .part-list-content {
          flex: 1;
          overflow-y: auto;
          padding: var(--sf-space-2);
        }

        .part-group {
          margin-bottom: var(--sf-space-4);
        }

        .part-group-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--sf-space-2) var(--sf-space-3);
          margin-bottom: var(--sf-space-1);
        }

        .part-group-title {
          font-size: var(--sf-text-xs);
          font-weight: var(--sf-font-semibold);
          color: var(--sf-text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .part-group-count {
          font-size: var(--sf-text-xs);
          color: var(--sf-text-tertiary);
          background-color: var(--sf-bg-tertiary);
          padding: 0 var(--sf-space-2);
          border-radius: var(--sf-radius-full);
          min-width: 20px;
          text-align: center;
        }

        .part-group-items {
          display: flex;
          flex-direction: column;
          gap: var(--sf-space-1);
        }

        .part-item {
          display: flex;
          align-items: center;
          gap: var(--sf-space-3);
          padding: var(--sf-space-3);
          border-radius: var(--sf-radius-md);
          cursor: pointer;
          transition: all var(--sf-duration-fast) var(--sf-easing-default);
          border: 1px solid transparent;
        }

        .part-item:hover {
          background-color: var(--sf-bg-secondary);
        }

        .part-item.selected {
          background-color: var(--sf-bg-dark);
          color: var(--sf-text-inverse);
          border-color: var(--sf-bg-dark);
        }

        .part-item-color {
          width: 32px;
          height: 32px;
          border-radius: var(--sf-radius-sm);
          border: 1px solid var(--sf-border-primary);
          flex-shrink: 0;
        }

        .part-item.selected .part-item-color {
          border-color: rgba(255, 255, 255, 0.3);
        }

        .part-item-info {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .part-item-name {
          font-size: var(--sf-text-sm);
          font-weight: var(--sf-font-medium);
          color: var(--sf-text-primary);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .part-item.selected .part-item-name {
          color: var(--sf-text-inverse);
        }

        .part-item-material {
          font-size: var(--sf-text-xs);
          color: var(--sf-text-secondary);
        }

        .part-item.selected .part-item-material {
          color: rgba(255, 255, 255, 0.7);
        }

        .part-item-visibility {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          background: none;
          border-radius: var(--sf-radius-sm);
          cursor: pointer;
          color: var(--sf-text-secondary);
          transition: all var(--sf-duration-fast) var(--sf-easing-default);
          flex-shrink: 0;
        }

        .part-item-visibility:hover {
          background-color: var(--sf-bg-tertiary);
          color: var(--sf-text-primary);
        }

        .part-item-visibility.hidden {
          opacity: 0.5;
        }

        .part-item.selected .part-item-visibility {
          color: rgba(255, 255, 255, 0.7);
        }

        .part-item.selected .part-item-visibility:hover {
          background-color: rgba(255, 255, 255, 0.1);
          color: var(--sf-text-inverse);
        }

        .part-list-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: var(--sf-space-8);
          color: var(--sf-text-tertiary);
          text-align: center;
        }

        .part-list-empty svg {
          margin-bottom: var(--sf-space-4);
          opacity: 0.5;
        }

        .part-list-empty p {
          font-size: var(--sf-text-sm);
        }
      `}</style>
    </div>
  );
};
