import React from 'react';
import { useUIStore } from '@/store/uiStore';
import type { CameraPreset } from '@/types';

const presets: { id: CameraPreset; label: string; icon: React.ReactNode }[] = [
  { id: 'front', label: '正面', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="4" width="16" height="16" rx="2"/></svg> },
  { id: 'side', label: '侧面(左)', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg> },
  { id: 'sideRight', label: '侧面(右)', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 12s-4-8-11-8-11 8-11 8 4 8 11 8 11-8 11-8z"/><circle cx="12" cy="12" r="3"/></svg> },
  { id: 'back', label: '背面', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg> },
  { id: 'top', label: '顶部', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 19V5M5 12l7-7 7 7"/></svg> },
  { id: 'bottom', label: '底部', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M19 12l-7 7-7-7"/></svg> },
  { id: 'free', label: '自由', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg> },
];

export const CameraPresets: React.FC = () => {
  const presetCamera = useUIStore((s) => s.presetCamera);
  const setPresetCamera = useUIStore((s) => s.setPresetCamera);

  return (
    <div className="camera-presets">
      {presets.map((preset) => (
        <button
          key={preset.id}
          onClick={() => setPresetCamera(preset.id)}
          className={`camera-preset ${presetCamera === preset.id ? 'active' : ''}`}
          title={preset.label}
        >
          {preset.icon}
          <span>{preset.label}</span>
        </button>
      ))}

      <style>{`
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
          border: none;
          background: none;
          border-radius: var(--sf-radius-md);
          cursor: pointer;
          color: var(--sf-text-secondary);
          transition: all var(--sf-duration-fast) var(--sf-easing-default);
          min-width: 52px;
          white-space: nowrap;
        }

        .camera-preset:hover {
          background-color: var(--sf-bg-secondary);
          color: var(--sf-text-primary);
        }

        .camera-preset.active {
          background-color: var(--sf-bg-dark);
          color: var(--sf-text-inverse);
        }

        .camera-preset span {
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
        }
      `}</style>
    </div>
  );
};
