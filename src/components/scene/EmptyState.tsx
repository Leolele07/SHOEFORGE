import React from 'react';

export const EmptyState: React.FC = () => {
  return (
    <div className="empty-state">
      <div className="empty-state-content">
        {/* 3D模型图标 */}
        <svg className="empty-state-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
          <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>

        <span className="empty-state-text">点击右上角"上传模型"开始定制</span>
      </div>

      <style>{`
        .empty-state {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--sf-space-4);
        }

        .empty-state-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--sf-space-4);
          padding: var(--sf-space-8);
          background-color: rgba(255, 255, 255, 0.6);
          backdrop-filter: blur(8px);
          border-radius: var(--sf-radius-xl);
        }

        .empty-state-icon {
          color: var(--sf-text-tertiary);
          opacity: 0.6;
        }

        .empty-state-text {
          font-size: var(--sf-text-sm);
          color: var(--sf-text-secondary);
        }
      `}</style>
    </div>
  );
};
