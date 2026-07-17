import React from 'react';
import type { MaterialType } from '@/types';
import { MATERIAL_PRESETS, MATERIAL_NAMES, MATERIAL_DESCRIPTIONS } from '@/types';

interface MaterialPickerProps {
  currentMaterial: MaterialType;
  onMaterialChange: (type: MaterialType) => void;
}

const materialTypes: MaterialType[] = ['leather', 'mesh', 'suede', 'canvas', 'patent', 'metallic'];

export const MaterialPicker: React.FC<MaterialPickerProps> = ({
  currentMaterial,
  onMaterialChange,
}) => {
  return (
    <div className="material-picker">
      <h4 className="material-section-title">材质类型</h4>

      {/* 材质列表 */}
      <div className="material-list">
        {materialTypes.map((type) => {
          const isSelected = currentMaterial === type;

          return (
            <button
              key={type}
              onClick={() => onMaterialChange(type)}
              className={`material-item ${isSelected ? 'selected' : ''}`}
            >
              {/* 材质预览球 */}
              <div
                className="material-preview"
                style={{ background: getMaterialGradient(type) }}
              />

              {/* 材质信息 */}
              <div className="material-info">
                <span className="material-name">{MATERIAL_NAMES[type]}</span>
                <span className="material-desc">{MATERIAL_DESCRIPTIONS[type]}</span>
              </div>

              {/* 选中指示 */}
              {isSelected && (
                <div className="material-check">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* 材质参数预览 */}
      <div className="material-params">
        <h4 className="material-section-title">材质参数</h4>
        <div className="material-params-list">
          <div className="material-param">
            <span className="material-param-label">粗糙度</span>
            <div className="material-param-bar">
              <div
                className="material-param-fill"
                style={{ width: `${MATERIAL_PRESETS[currentMaterial].roughness * 100}%` }}
              />
            </div>
            <span className="material-param-value">
              {MATERIAL_PRESETS[currentMaterial].roughness.toFixed(2)}
            </span>
          </div>
          <div className="material-param">
            <span className="material-param-label">金属度</span>
            <div className="material-param-bar">
              <div
                className="material-param-fill"
                style={{ width: `${MATERIAL_PRESETS[currentMaterial].metalness * 100}%` }}
              />
            </div>
            <span className="material-param-value">
              {MATERIAL_PRESETS[currentMaterial].metalness.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      <style>{`
        .material-picker {
          display: flex;
          flex-direction: column;
          gap: var(--sf-space-6);
        }

        .material-section-title {
          font-size: var(--sf-text-sm);
          font-weight: var(--sf-font-semibold);
          color: var(--sf-text-secondary);
        }

        .material-list {
          display: flex;
          flex-direction: column;
          gap: var(--sf-space-2);
        }

        .material-item {
          display: flex;
          align-items: center;
          gap: var(--sf-space-3);
          padding: var(--sf-space-3);
          border: 1px solid var(--sf-border-primary);
          border-radius: var(--sf-radius-lg);
          background: none;
          cursor: pointer;
          transition: all var(--sf-duration-fast) var(--sf-easing-default);
          text-align: left;
        }

        .material-item:hover {
          border-color: var(--sf-text-primary);
          background-color: var(--sf-bg-secondary);
        }

        .material-item.selected {
          border-color: var(--sf-color-primary);
          background-color: var(--sf-bg-dark);
        }

        .material-preview {
          width: 40px;
          height: 40px;
          border-radius: var(--sf-radius-full);
          flex-shrink: 0;
          box-shadow: inset -2px -2px 4px rgba(0,0,0,0.2), inset 2px 2px 4px rgba(255,255,255,0.3);
        }

        .material-info {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .material-name {
          font-size: var(--sf-text-sm);
          font-weight: var(--sf-font-medium);
          color: var(--sf-text-primary);
        }

        .material-item.selected .material-name {
          color: var(--sf-text-inverse);
        }

        .material-desc {
          font-size: var(--sf-text-xs);
          color: var(--sf-text-secondary);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .material-item.selected .material-desc {
          color: rgba(255, 255, 255, 0.7);
        }

        .material-check {
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: var(--sf-color-primary);
          border-radius: var(--sf-radius-full);
          flex-shrink: 0;
        }

        .material-check svg {
          color: var(--sf-text-inverse);
        }

        .material-params {
          display: flex;
          flex-direction: column;
          gap: var(--sf-space-3);
          padding: var(--sf-space-4);
          background-color: var(--sf-bg-secondary);
          border-radius: var(--sf-radius-lg);
        }

        .material-params-list {
          display: flex;
          flex-direction: column;
          gap: var(--sf-space-3);
        }

        .material-param {
          display: flex;
          align-items: center;
          gap: var(--sf-space-3);
        }

        .material-param-label {
          font-size: var(--sf-text-xs);
          color: var(--sf-text-secondary);
          width: 48px;
          flex-shrink: 0;
        }

        .material-param-bar {
          flex: 1;
          height: 6px;
          background-color: var(--sf-bg-tertiary);
          border-radius: var(--sf-radius-full);
          overflow: hidden;
        }

        .material-param-fill {
          height: 100%;
          background-color: var(--sf-color-primary);
          border-radius: var(--sf-radius-full);
          transition: width var(--sf-duration-normal) var(--sf-easing-default);
        }

        .material-param-value {
          font-size: var(--sf-text-xs);
          font-family: var(--sf-font-mono);
          color: var(--sf-text-primary);
          width: 32px;
          text-align: right;
          flex-shrink: 0;
        }
      `}</style>
    </div>
  );
};

// 生成材质预览渐变
function getMaterialGradient(type: MaterialType): string {
  switch (type) {
    case 'leather':
      return 'linear-gradient(135deg, #8B4513 0%, #A0522D 50%, #6B3410 100%)';
    case 'mesh':
      return 'linear-gradient(135deg, #E0E0E0 0%, #BDBDBD 50%, #9E9E9E 100%)';
    case 'suede':
      return 'linear-gradient(135deg, #DEB887 0%, #D2A679 50%, #C49565 100%)';
    case 'canvas':
      return 'linear-gradient(135deg, #F5F5DC 0%, #E8E8C8 50%, #DBDBB4 100%)';
    case 'patent':
      return 'linear-gradient(135deg, #1A1A1A 0%, #333333 30%, #000000 70%, #1A1A1A 100%)';
    case 'metallic':
      return 'linear-gradient(135deg, #C0C0C0 0%, #E8E8E8 30%, #A0A0A0 70%, #D0D0D0 100%)';
    default:
      return 'linear-gradient(135deg, #808080 0%, #A0A0A0 100%)';
  }
}
