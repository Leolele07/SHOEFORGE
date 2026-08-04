import React, { useMemo } from 'react';
import { useCustomizationStore } from '@/store/customizationStore';
import { PART_GROUP_NAMES, MATERIAL_NAMES } from '@/types';
import type { PartGroup } from '@/types';
import '@/styles/part-list.css';

export const PartListPanel: React.FC = () => {
  const { parts, partConfigs, selectedPartId, selectPart, togglePartVisibility } = useCustomizationStore();

  // 按分组组织部件（使用 useMemo 避免每次渲染重新计算）
  const groupedParts = useMemo(() => {
    return parts.reduce((acc, part) => {
      if (!acc[part.group]) {
        acc[part.group] = [];
      }
      acc[part.group].push(part);
      return acc;
    }, {} as Record<PartGroup, typeof parts>);
  }, [parts]);

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
                  const config = partConfigs.get(part.id);
                  if (!config) return null;

                  const isSelected = selectedPartId === part.id;

                  return (
                    <div
                      key={part.id}
                      className={`part-item ${isSelected ? 'selected' : ''}`}
                      onClick={() => selectPart(part.id)}
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
                          {MATERIAL_NAMES[config.materialType] ?? config.materialType}
                        </span>
                      </div>

                      {/* 可见性按钮 */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePartVisibility(part.id);
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
    </div>
  );
};
