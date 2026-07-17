import React, { useState } from 'react';
import { PRESET_COLORS } from '@/types';

interface ColorPickerProps {
  currentColor: string;
  onColorChange: (color: string) => void;
  onReset?: () => void;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  currentColor,
  onColorChange,
  onReset,
}) => {
  const [customColor, setCustomColor] = useState(currentColor);
  const [showCustom, setShowCustom] = useState(false);

  const handlePresetClick = (color: string) => {
    setCustomColor(color);
    onColorChange(color);
  };

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    setCustomColor(color);
    onColorChange(color);
  };

  const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomColor(value);
    
    // 验证是否为有效的hex颜色
    if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
      onColorChange(value);
    }
  };

  return (
    <div className="color-picker">
      {/* 当前颜色预览 */}
      <div className="color-current">
        <div
          className="color-current-swatch"
          style={{ backgroundColor: currentColor }}
        />
        <div className="color-current-info">
          <span className="color-current-label">当前颜色</span>
          <span className="color-current-value">{currentColor.toUpperCase()}</span>
        </div>
        {onReset && (
          <button onClick={onReset} className="btn btn-ghost btn-sm">
            重置
          </button>
        )}
      </div>

      {/* 预设颜色网格 */}
      <div className="color-presets">
        <h4 className="color-section-title">预设颜色</h4>
        <div className="color-presets-grid">
          {PRESET_COLORS.map((color) => (
            <button
              key={color}
              onClick={() => handlePresetClick(color)}
              className={`color-swatch ${currentColor === color ? 'selected' : ''}`}
              style={{ backgroundColor: color }}
              title={color}
            >
              {currentColor === color && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 自定义颜色 */}
      <div className="color-custom">
        <button
          onClick={() => setShowCustom(!showCustom)}
          className="color-custom-toggle"
        >
          <span>{showCustom ? '收起自定义颜色' : '展开自定义颜色'}</span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{ transform: showCustom ? 'rotate(180deg)' : 'rotate(0deg)' }}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {showCustom && (
          <div className="color-custom-content">
            {/* 原生颜色选择器 */}
            <div className="color-picker-native">
              <label className="color-picker-label">颜色选择器</label>
              <input
                type="color"
                value={customColor}
                onChange={handleCustomColorChange}
                className="color-picker-input"
              />
            </div>

            {/* Hex输入 */}
            <div className="color-picker-hex">
              <label className="color-picker-label">Hex 值</label>
              <div className="color-picker-hex-row">
                <input
                  type="text"
                  value={customColor}
                  onChange={handleHexInputChange}
                  placeholder="#000000"
                  className="input input-md"
                />
                <button
                  onClick={() => onColorChange(customColor)}
                  className="btn btn-primary btn-md"
                >
                  应用
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .color-picker {
          display: flex;
          flex-direction: column;
          gap: var(--sf-space-6);
        }

        .color-current {
          display: flex;
          align-items: center;
          gap: var(--sf-space-3);
          padding: var(--sf-space-3);
          background-color: var(--sf-bg-secondary);
          border-radius: var(--sf-radius-lg);
        }

        .color-current-swatch {
          width: 48px;
          height: 48px;
          border-radius: var(--sf-radius-md);
          border: 1px solid var(--sf-border-primary);
          box-shadow: var(--sf-shadow-sm);
        }

        .color-current-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .color-current-label {
          font-size: var(--sf-text-xs);
          color: var(--sf-text-secondary);
        }

        .color-current-value {
          font-size: var(--sf-text-sm);
          font-weight: var(--sf-font-medium);
          font-family: var(--sf-font-mono);
          color: var(--sf-text-primary);
        }

        .color-presets {
          display: flex;
          flex-direction: column;
          gap: var(--sf-space-3);
        }

        .color-section-title {
          font-size: var(--sf-text-sm);
          font-weight: var(--sf-font-semibold);
          color: var(--sf-text-secondary);
        }

        .color-presets-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: var(--sf-space-2);
        }

        .color-swatch {
          width: 100%;
          aspect-ratio: 1;
          border-radius: var(--sf-radius-md);
          border: 2px solid var(--sf-border-primary);
          cursor: pointer;
          transition: all var(--sf-duration-fast) var(--sf-easing-default);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
        }

        .color-swatch:hover {
          transform: scale(1.1);
          border-color: var(--sf-text-primary);
          box-shadow: var(--sf-shadow-md);
        }

        .color-swatch.selected {
          border-color: var(--sf-color-primary);
          box-shadow: 0 0 0 2px var(--sf-color-primary);
        }

        .color-swatch svg {
          color: white;
          filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.5));
        }

        .color-custom {
          display: flex;
          flex-direction: column;
          gap: var(--sf-space-3);
        }

        .color-custom-toggle {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--sf-space-3);
          border: none;
          background: none;
          cursor: pointer;
          color: var(--sf-text-primary);
          font-size: var(--sf-text-sm);
          font-weight: var(--sf-font-medium);
          transition: color var(--sf-duration-fast) var(--sf-easing-default);
        }

        .color-custom-toggle:hover {
          color: var(--sf-text-secondary);
        }

        .color-custom-toggle svg {
          transition: transform var(--sf-duration-normal) var(--sf-easing-default);
        }

        .color-custom-content {
          display: flex;
          flex-direction: column;
          gap: var(--sf-space-4);
          padding: var(--sf-space-3);
          background-color: var(--sf-bg-secondary);
          border-radius: var(--sf-radius-lg);
          animation: slideUp var(--sf-duration-normal) var(--sf-easing-out);
        }

        .color-picker-native {
          display: flex;
          flex-direction: column;
          gap: var(--sf-space-2);
        }

        .color-picker-label {
          font-size: var(--sf-text-xs);
          font-weight: var(--sf-font-medium);
          color: var(--sf-text-secondary);
        }

        .color-picker-input {
          width: 100%;
          height: 40px;
          border: 1px solid var(--sf-border-primary);
          border-radius: var(--sf-radius-md);
          cursor: pointer;
          padding: 2px;
        }

        .color-picker-hex {
          display: flex;
          flex-direction: column;
          gap: var(--sf-space-2);
        }

        .color-picker-hex-row {
          display: flex;
          gap: var(--sf-space-2);
        }

        .color-picker-hex-row .input {
          flex: 1;
          font-family: var(--sf-font-mono);
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};
