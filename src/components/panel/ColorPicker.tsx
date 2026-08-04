import React, { useState, useRef, useCallback } from 'react';
import { PRESET_COLORS } from '@/types';
import '@/styles/color-picker.css';

interface ColorPickerProps {
  currentColor: string;
  originalColor?: string;  // 原始颜色
  onColorChange: (color: string) => void;
  onReset?: () => void;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  currentColor,
  originalColor,
  onColorChange,
  onReset,
}) => {
  const [customColor, setCustomColor] = useState(currentColor);
  const [showCustom, setShowCustom] = useState(false);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 防抖函数
  const debounceColorChange = useCallback((color: string) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      onColorChange(color);
    }, 150);
  }, [onColorChange]);

  const handlePresetClick = (color: string) => {
    setCustomColor(color);
    onColorChange(color);
  };

  const handleOriginalColorClick = () => {
    if (originalColor) {
      setCustomColor(originalColor);
      onColorChange(originalColor);
    }
  };

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    setCustomColor(color);
    debounceColorChange(color);
  };

  const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomColor(value);
    
    // 验证是否为有效的hex颜色
    if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
      debounceColorChange(value);
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

      {/* 原色按钮 */}
      {originalColor && (
        <div className="color-original">
          <h4 className="color-section-title">原色</h4>
          <button
            onClick={handleOriginalColorClick}
            className={`color-original-btn ${currentColor === originalColor ? 'selected' : ''}`}
            style={{ backgroundColor: originalColor }}
            title={`原色: ${originalColor}`}
          >
            <span className="color-original-label">原色</span>
            {currentColor === originalColor && (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </button>
        </div>
      )}

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
    </div>
  );
};
