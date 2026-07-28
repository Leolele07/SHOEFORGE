import React, { useCallback } from 'react';
import { useUIStore } from '@/store/uiStore';
import type { CameraPreset } from '@/types';

const presets: { id: CameraPreset; label: string; icon: React.ReactNode; isRotate?: boolean }[] = [
  { id: 'rotateLeft', label: '转左', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M2.5 2v6h6M2.66 15.57a10 10 0 1 0 .57-8.38"/></svg>, isRotate: true },
  { id: 'rotateRight', label: '转右', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38"/></svg>, isRotate: true },
  { id: 'top', label: '顶部', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 19V5M5 12l7-7 7 7"/></svg> },
  { id: 'bottom', label: '底部', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M19 12l-7 7-7-7"/></svg> },
  { id: 'free', label: '自由', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg> },
];

export const CameraPresets: React.FC = () => {
  const setPresetCamera = useUIStore((s) => s.setPresetCamera);
  const triggerRotate = useUIStore((s) => s.triggerRotate);

  const handleClick = (preset: typeof presets[0]) => {
    if (preset.isRotate) {
      triggerRotate(preset.id as 'rotateLeft' | 'rotateRight');
    } else {
      setPresetCamera(preset.id);
    }
  };

  const handleScreenshot = useCallback(() => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `shoe-design-${Date.now()}.png`;
    a.click();
  }, []);

  return (
    <div className="camera-presets-container">
      <div className="camera-presets">
        {presets.map((preset) => (
          <button
            key={preset.id}
            onClick={() => handleClick(preset)}
            className="camera-preset"
            title={preset.label}
          >
            {preset.icon}
            <span>{preset.label}</span>
          </button>
        ))}
      </div>

      {/* 截图按钮 */}
      <button
        onClick={handleScreenshot}
        className="camera-screenshot-btn"
        title="保存当前视角为图片"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
          <circle cx="12" cy="13" r="4" />
        </svg>
        <span>截图</span>
      </button>

      <style>{`
        .camera-presets-container {
          display: flex;
          gap: var(--sf-space-2);
          align-items: center;
        }

        .camera-presets {
          display: flex;
          gap: var(--sf-space-1);
          padding: var(--sf-space-1);
          background-color: var(--sf-bg-primary);
          border-radius: var(--sf-radius-lg);
          box-shadow: var(--sf-shadow-lg);
          border: 1px solid var(--sf-border-primary);
        }

        .camera-preset {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
          padding: var(--sf-space-2) var(--sf-space-3);
          border: 2px solid transparent;
          background: none;
          border-radius: var(--sf-radius-md);
          cursor: pointer;
          color: var(--sf-text-secondary);
          transition: all var(--sf-duration-fast) var(--sf-easing-default);
          min-width: 52px;
          white-space: nowrap;
          user-select: none;
        }

        .camera-preset:hover {
          background-color: var(--sf-bg-secondary);
          color: var(--sf-text-primary);
        }

        .camera-preset:active {
          border-color: var(--sf-color-primary);
          background-color: var(--sf-bg-dark);
          color: var(--sf-text-inverse);
          transform: scale(0.95);
        }

        .camera-preset span {
          font-size: 10px;
          font-weight: var(--sf-font-medium);
        }

        .camera-screenshot-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 2px;
          padding: var(--sf-space-3) var(--sf-space-4);
          background-color: var(--sf-color-primary);
          color: var(--sf-text-inverse);
          border: none;
          border-radius: var(--sf-radius-lg);
          box-shadow: var(--sf-shadow-lg);
          cursor: pointer;
          transition: all var(--sf-duration-fast) var(--sf-easing-default);
          min-width: 60px;
          white-space: nowrap;
          user-select: none;
        }

        .camera-screenshot-btn:hover {
          background-color: var(--sf-color-primary-hover);
        }

        .camera-screenshot-btn:active {
          transform: scale(0.95);
        }

        .camera-screenshot-btn span {
          font-size: 10px;
          font-weight: var(--sf-font-medium);
        }

        @media (max-width: 768px) {
          .camera-preset {
            padding: var(--sf-space-2);
            min-width: 44px;
          }
          .camera-preset span {
            display: none;
          }
          .camera-screenshot-btn {
            padding: var(--sf-space-2);
            min-width: 44px;
          }
          .camera-screenshot-btn span {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};
