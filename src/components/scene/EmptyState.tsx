import React from 'react';

export const EmptyState: React.FC = () => {
  return (
    <div className="empty-state">
      <div className="empty-state-content">
        {/* 3D模型图标 */}
        <div className="empty-state-icon-wrapper">
          <svg className="empty-state-icon" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
            <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
            <line x1="12" y1="22.08" x2="12" y2="12" />
          </svg>
          <div className="empty-state-glow"></div>
        </div>

        {/* 标题 */}
        <h2 className="empty-state-title">开始您的鞋款定制</h2>

        {/* 描述 */}
        <p className="empty-state-desc">
          上传3D模型文件，即可开始个性化定制
        </p>

        {/* 提示 */}
        <div className="empty-state-hint">
          <span className="highlight-text">点击右上角"上传模型"</span>
          <span>开始定制</span>
        </div>

        {/* 支持格式 */}
        <div className="empty-state-formats">
          <span className="format-badge">GLB</span>
          <span className="format-badge">GLTF</span>
          <span className="format-size">最大 50MB</span>
        </div>
      </div>

      <style>{`
        .empty-state {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--sf-space-4);
          background: linear-gradient(135deg, rgba(245, 245, 245, 0.8) 0%, rgba(255, 255, 255, 0.9) 100%);
        }

        .empty-state-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--sf-space-6);
          padding: var(--sf-space-12) var(--sf-space-16);
          background-color: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(12px);
          border-radius: var(--sf-radius-2xl);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.6);
          max-width: 480px;
          animation: fadeInUp 0.6s ease-out;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .empty-state-icon-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .empty-state-icon {
          color: var(--sf-color-primary);
          opacity: 0.8;
          animation: float 3s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }

        .empty-state-glow {
          position: absolute;
          width: 120px;
          height: 120px;
          background: radial-gradient(circle, rgba(0, 0, 0, 0.05) 0%, transparent 70%);
          border-radius: 50%;
          bottom: -20px;
          animation: pulse 3s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.5;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.8;
          }
        }

        .empty-state-title {
          font-size: var(--sf-text-2xl);
          font-weight: var(--sf-font-bold);
          color: var(--sf-text-primary);
          margin: 0;
          letter-spacing: -0.02em;
        }

        .empty-state-desc {
          font-size: var(--sf-text-base);
          color: var(--sf-text-secondary);
          margin: 0;
          text-align: center;
          line-height: 1.6;
        }

        .empty-state-hint {
          display: flex;
          align-items: center;
          gap: var(--sf-space-2);
          font-size: var(--sf-text-sm);
          color: var(--sf-text-tertiary);
        }

        .highlight-text {
          color: var(--sf-color-primary);
          font-weight: var(--sf-font-semibold);
          animation: blink 1.5s ease-in-out infinite;
        }

        @keyframes blink {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.4;
          }
        }

        .empty-state-formats {
          display: flex;
          align-items: center;
          gap: var(--sf-space-2);
          margin-top: var(--sf-space-2);
        }

        .format-badge {
          display: inline-flex;
          align-items: center;
          padding: var(--sf-space-1) var(--sf-space-3);
          background-color: var(--sf-bg-secondary);
          color: var(--sf-text-secondary);
          font-size: var(--sf-text-xs);
          font-weight: var(--sf-font-medium);
          border-radius: var(--sf-radius-full);
          letter-spacing: 0.05em;
        }

        .format-size {
          font-size: var(--sf-text-xs);
          color: var(--sf-text-tertiary);
          margin-left: var(--sf-space-1);
        }

        @media (max-width: 768px) {
          .empty-state-content {
            padding: var(--sf-space-8) var(--sf-space-6);
          }

          .empty-state-icon {
            width: 60px;
            height: 60px;
          }

          .empty-state-title {
            font-size: var(--sf-text-xl);
          }
        }
      `}</style>
    </div>
  );
};
