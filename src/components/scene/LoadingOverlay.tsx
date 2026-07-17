import React from 'react';

export const LoadingOverlay: React.FC = () => {
  return (
    <div className="loading-overlay">
      <div className="loading-content">
        {/* 加载动画 */}
        <div className="loading-spinner">
          <div className="loading-spinner-ring"></div>
          <div className="loading-spinner-ring"></div>
          <div className="loading-spinner-ring"></div>
        </div>
        
        <h3 className="loading-title">正在加载模型</h3>
        <p className="loading-subtitle">请稍候...</p>
      </div>

      <style>{`
        .loading-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: rgba(0, 0, 0, 0.3);
          backdrop-filter: blur(4px);
          z-index: 30;
        }

        .loading-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: var(--sf-space-8);
          background-color: var(--sf-bg-primary);
          border-radius: var(--sf-radius-xl);
          box-shadow: var(--sf-shadow-xl);
        }

        .loading-spinner {
          position: relative;
          width: 48px;
          height: 48px;
          margin-bottom: var(--sf-space-4);
        }

        .loading-spinner-ring {
          position: absolute;
          inset: 0;
          border: 3px solid transparent;
          border-top-color: var(--sf-color-primary);
          border-radius: 50%;
          animation: spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
        }

        .loading-spinner-ring:nth-child(1) {
          animation-delay: -0.45s;
        }

        .loading-spinner-ring:nth-child(2) {
          animation-delay: -0.3s;
          inset: 4px;
        }

        .loading-spinner-ring:nth-child(3) {
          animation-delay: -0.15s;
          inset: 8px;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        .loading-title {
          font-size: var(--sf-text-lg);
          font-weight: var(--sf-font-semibold);
          color: var(--sf-text-primary);
          margin-bottom: var(--sf-space-2);
        }

        .loading-subtitle {
          font-size: var(--sf-text-sm);
          color: var(--sf-text-secondary);
        }
      `}</style>
    </div>
  );
};
