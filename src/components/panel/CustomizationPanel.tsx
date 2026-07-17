import React, { useState } from 'react';
import { useCustomizationStore } from '@/store/customizationStore';
import { ColorPicker } from './ColorPicker';
import { MaterialPicker } from './MaterialPicker';
import { MATERIAL_NAMES } from '@/types';

type TabType = 'color' | 'material';

export const CustomizationPanel: React.FC = () => {
  const { selectedPartId, partConfigs, parts, updatePartColor, updatePartMaterial, resetPart } = useCustomizationStore();
  const [activeTab, setActiveTab] = useState<TabType>('color');

  // 获取当前选中的部件
  const selectedPart = parts.find((p) => p.partId === selectedPartId);
  const selectedConfig = selectedPartId ? partConfigs.get(selectedPartId) : null;

  if (!selectedPart || !selectedConfig || !selectedPartId) {
    return (
      <div className="customize-panel">
        <div className="customize-empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
          <p>选择部件开始定制</p>
          <span>点击左侧部件列表或3D模型中的部件</span>
        </div>

        <style>{`
          .customize-panel {
            height: 100%;
            display: flex;
            flex-direction: column;
          }

          .customize-empty {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: var(--sf-space-8);
            text-align: center;
            color: var(--sf-text-tertiary);
          }

          .customize-empty svg {
            margin-bottom: var(--sf-space-4);
            opacity: 0.5;
          }

          .customize-empty p {
            font-size: var(--sf-text-base);
            font-weight: var(--sf-font-medium);
            color: var(--sf-text-primary);
            margin-bottom: var(--sf-space-2);
          }

          .customize-empty span {
            font-size: var(--sf-text-sm);
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="customize-panel">
      {/* 部件信息头部 */}
      <div className="customize-header">
        <div className="customize-part-info">
          <div
            className="customize-part-color"
            style={{ backgroundColor: selectedConfig.color }}
          />
          <div className="customize-part-details">
            <span className="customize-part-name">{selectedPart.name}</span>
            <span className="customize-part-material">
              {MATERIAL_NAMES[selectedConfig.materialType]}
            </span>
          </div>
        </div>
        <button
          onClick={() => resetPart(selectedPartId)}
          className="btn btn-ghost btn-sm"
        >
          重置
        </button>
      </div>

      {/* 标签切换 */}
      <div className="customize-tabs">
        <button
          className={`customize-tab ${activeTab === 'color' ? 'active' : ''}`}
          onClick={() => setActiveTab('color')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="13.5" cy="6.5" r="2.5" />
            <circle cx="17.5" cy="10.5" r="2.5" />
            <circle cx="8.5" cy="7.5" r="2.5" />
            <circle cx="6.5" cy="12.5" r="2.5" />
            <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 011.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
          </svg>
          颜色
        </button>
        <button
          className={`customize-tab ${activeTab === 'material' ? 'active' : ''}`}
          onClick={() => setActiveTab('material')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <line x1="7" y1="8" x2="17" y2="8" />
            <line x1="7" y1="12" x2="17" y2="12" />
            <line x1="7" y1="16" x2="17" y2="16" />
          </svg>
          材质
        </button>
      </div>

      {/* 内容区域 */}
      <div className="customize-content">
        {activeTab === 'color' ? (
          <ColorPicker
            currentColor={selectedConfig.color}
            onColorChange={(color) => updatePartColor(selectedPartId, color)}
            onReset={() => resetPart(selectedPartId)}
          />
        ) : (
          <MaterialPicker
            currentMaterial={selectedConfig.materialType}
            onMaterialChange={(type) => updatePartMaterial(selectedPartId, type)}
          />
        )}
      </div>

      <style>{`
        .customize-panel {
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .customize-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--sf-space-4);
          border-bottom: 1px solid var(--sf-border-primary);
        }

        .customize-part-info {
          display: flex;
          align-items: center;
          gap: var(--sf-space-3);
        }

        .customize-part-color {
          width: 40px;
          height: 40px;
          border-radius: var(--sf-radius-md);
          border: 1px solid var(--sf-border-primary);
          box-shadow: var(--sf-shadow-sm);
        }

        .customize-part-details {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .customize-part-name {
          font-size: var(--sf-text-base);
          font-weight: var(--sf-font-semibold);
          color: var(--sf-text-primary);
        }

        .customize-part-material {
          font-size: var(--sf-text-sm);
          color: var(--sf-text-secondary);
        }

        .customize-tabs {
          display: flex;
          border-bottom: 1px solid var(--sf-border-primary);
        }

        .customize-tab {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--sf-space-2);
          padding: var(--sf-space-3) var(--sf-space-4);
          border: none;
          background: none;
          font-size: var(--sf-text-sm);
          font-weight: var(--sf-font-medium);
          color: var(--sf-text-secondary);
          cursor: pointer;
          transition: all var(--sf-duration-fast) var(--sf-easing-default);
          position: relative;
        }

        .customize-tab:hover {
          color: var(--sf-text-primary);
          background-color: var(--sf-bg-secondary);
        }

        .customize-tab.active {
          color: var(--sf-text-primary);
        }

        .customize-tab.active::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 2px;
          background-color: var(--sf-color-primary);
        }

        .customize-content {
          flex: 1;
          overflow-y: auto;
          padding: var(--sf-space-4);
        }
      `}</style>
    </div>
  );
};
