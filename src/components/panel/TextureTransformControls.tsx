import React from 'react';
import type { TextureConfig, TextureTransform } from '@/types';

interface TextureTransformControlsProps {
  texture: TextureConfig;
  onUpdate: (transform: TextureTransform) => void;
  onRemove: () => void;
}

export const TextureTransformControls: React.FC<TextureTransformControlsProps> = ({
  texture,
  onUpdate,
  onRemove,
}) => {
  const handleTransformChange = (key: keyof TextureTransform, value: number) => {
    onUpdate({
      ...texture.transform,
      [key]: value,
    });
  };

  return (
    <div className="texture-transform-controls">
      {/* 贴图预览 */}
      <div className="texture-preview-row">
        <div className="texture-preview">
          <img src={texture.url} alt="贴图预览" />
        </div>
        <div className="texture-info">
          <span className="texture-type-badge">{texture.type}</span>
          <button className="texture-remove-btn" onClick={onRemove}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* 变换控制 */}
      <div className="transform-controls">
        {/* X偏移 */}
        <div className="transform-row">
          <label className="transform-label">X偏移</label>
          <input
            type="range"
            min="-1"
            max="1"
            step="0.01"
            value={texture.transform.offsetX}
            onChange={(e) => handleTransformChange('offsetX', parseFloat(e.target.value))}
            className="transform-slider"
          />
          <span className="transform-value">{texture.transform.offsetX.toFixed(2)}</span>
        </div>

        {/* Y偏移 */}
        <div className="transform-row">
          <label className="transform-label">Y偏移</label>
          <input
            type="range"
            min="-1"
            max="1"
            step="0.01"
            value={texture.transform.offsetY}
            onChange={(e) => handleTransformChange('offsetY', parseFloat(e.target.value))}
            className="transform-slider"
          />
          <span className="transform-value">{texture.transform.offsetY.toFixed(2)}</span>
        </div>

        {/* X缩放 */}
        <div className="transform-row">
          <label className="transform-label">X缩放</label>
          <input
            type="range"
            min="0.1"
            max="10"
            step="0.1"
            value={texture.transform.scaleX}
            onChange={(e) => handleTransformChange('scaleX', parseFloat(e.target.value))}
            className="transform-slider"
          />
          <span className="transform-value">{texture.transform.scaleX.toFixed(1)}</span>
        </div>

        {/* Y缩放 */}
        <div className="transform-row">
          <label className="transform-label">Y缩放</label>
          <input
            type="range"
            min="0.1"
            max="10"
            step="0.1"
            value={texture.transform.scaleY}
            onChange={(e) => handleTransformChange('scaleY', parseFloat(e.target.value))}
            className="transform-slider"
          />
          <span className="transform-value">{texture.transform.scaleY.toFixed(1)}</span>
        </div>

        {/* 旋转 */}
        <div className="transform-row">
          <label className="transform-label">旋转</label>
          <input
            type="range"
            min="0"
            max="360"
            step="1"
            value={texture.transform.rotation}
            onChange={(e) => handleTransformChange('rotation', parseFloat(e.target.value))}
            className="transform-slider"
          />
          <span className="transform-value">{texture.transform.rotation.toFixed(0)}°</span>
        </div>
      </div>

      <style>{`
        .texture-transform-controls {
          display: flex;
          flex-direction: column;
          gap: var(--sf-space-3);
          padding: var(--sf-space-3);
          border: 1px solid var(--sf-border-primary);
          border-radius: var(--sf-radius-md);
          background: var(--sf-bg-secondary);
        }

        .texture-preview-row {
          display: flex;
          align-items: center;
          gap: var(--sf-space-3);
        }

        .texture-preview {
          width: 48px;
          height: 48px;
          border-radius: var(--sf-radius-sm);
          overflow: hidden;
          border: 1px solid var(--sf-border-primary);
        }

        .texture-preview img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .texture-info {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .texture-type-badge {
          padding: var(--sf-space-1) var(--sf-space-2);
          background: var(--sf-color-primary);
          color: var(--sf-bg-primary);
          border-radius: var(--sf-radius-sm);
          font-size: var(--sf-text-xs);
          font-weight: var(--sf-font-medium);
        }

        .texture-remove-btn {
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          background: transparent;
          color: var(--sf-text-tertiary);
          cursor: pointer;
          border-radius: var(--sf-radius-sm);
          transition: all var(--sf-duration-fast) var(--sf-easing-default);
        }

        .texture-remove-btn:hover {
          background: var(--sf-bg-tertiary);
          color: var(--sf-color-error);
        }

        .transform-controls {
          display: flex;
          flex-direction: column;
          gap: var(--sf-space-2);
        }

        .transform-row {
          display: flex;
          align-items: center;
          gap: var(--sf-space-2);
        }

        .transform-label {
          width: 48px;
          font-size: var(--sf-text-xs);
          color: var(--sf-text-secondary);
          flex-shrink: 0;
        }

        .transform-slider {
          flex: 1;
          height: 4px;
          -webkit-appearance: none;
          appearance: none;
          background: var(--sf-bg-tertiary);
          border-radius: var(--sf-radius-full);
          outline: none;
        }

        .transform-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 12px;
          height: 12px;
          background: var(--sf-color-primary);
          border-radius: 50%;
          cursor: pointer;
        }

        .transform-value {
          width: 40px;
          font-size: var(--sf-text-xs);
          font-family: var(--sf-font-mono);
          color: var(--sf-text-primary);
          text-align: right;
          flex-shrink: 0;
        }
      `}</style>
    </div>
  );
};
