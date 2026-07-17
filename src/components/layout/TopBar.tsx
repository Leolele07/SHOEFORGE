import React, { useRef, useCallback } from 'react';
import { useModelStore } from '@/store/modelStore';

interface TopBarProps {
  onToggleSidebar?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onToggleSidebar }) => {
  const { modelMeta, loadModel } = useModelStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      loadModel(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [loadModel]);

  return (
    <header className="topbar">
      <div className="topbar-inner">
        {/* 左侧：Logo */}
        <div className="topbar-left">
          <div className="topbar-logo">
            <div className="topbar-logo-icon">SF</div>
            <span className="topbar-logo-text">ShoeForge</span>
          </div>
        </div>

        {/* 中间：产品信息 */}
        <div className="topbar-center">
          {modelMeta && (
            <div className="topbar-product-info">
              <span className="topbar-product-name">
                {modelMeta.fileName.replace('.glb', '').replace('.gltf', '')}
              </span>
              <span className="topbar-product-badge">专属定制</span>
            </div>
          )}
        </div>

        {/* 右侧：操作按钮 */}
        <div className="topbar-right">
          {/* 上传模型按钮 */}
          <button
            onClick={handleUploadClick}
            className="topbar-upload-btn"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            上传模型
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".glb,.gltf"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* 移动端菜单按钮 */}
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="btn btn-ghost btn-icon btn-sm topbar-menu-btn"
              title="切换侧边栏"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 12h18M3 6h18M3 18h18" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <style>{`
        .topbar {
          height: var(--sf-topbar-height);
          background-color: var(--sf-bg-primary);
          border-bottom: 1px solid var(--sf-border-primary);
          position: sticky;
          top: 0;
          z-index: var(--sf-z-sticky);
        }

        .topbar-inner {
          height: 100%;
          max-width: 1920px;
          margin: 0 auto;
          padding: 0 var(--sf-space-4);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--sf-space-4);
        }

        .topbar-left,
        .topbar-right {
          flex: 0 0 auto;
          display: flex;
          align-items: center;
          gap: var(--sf-space-2);
        }

        .topbar-center {
          flex: 1;
          display: flex;
          justify-content: center;
        }

        .topbar-logo {
          display: flex;
          align-items: center;
          gap: var(--sf-space-2);
        }

        .topbar-logo-icon {
          width: 32px;
          height: 32px;
          background-color: var(--sf-color-primary);
          color: var(--sf-text-inverse);
          border-radius: var(--sf-radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: var(--sf-text-sm);
          font-weight: var(--sf-font-bold);
        }

        .topbar-logo-text {
          font-size: var(--sf-text-lg);
          font-weight: var(--sf-font-semibold);
          color: var(--sf-text-primary);
        }

        .topbar-product-info {
          display: flex;
          align-items: center;
          gap: var(--sf-space-2);
        }

        .topbar-product-name {
          font-size: var(--sf-text-sm);
          color: var(--sf-text-secondary);
        }

        .topbar-product-badge {
          font-size: var(--sf-text-xs);
          color: var(--sf-text-inverse);
          background-color: var(--sf-color-primary);
          padding: 2px 8px;
          border-radius: var(--sf-radius-full);
        }

        .topbar-upload-btn {
          display: flex;
          align-items: center;
          gap: var(--sf-space-2);
          padding: var(--sf-space-2) var(--sf-space-4);
          background-color: var(--sf-color-primary);
          color: var(--sf-text-inverse);
          border: none;
          border-radius: var(--sf-radius-md);
          font-size: var(--sf-text-sm);
          font-weight: var(--sf-font-medium);
          cursor: pointer;
          transition: background-color var(--sf-duration-fast) var(--sf-easing-default);
          white-space: nowrap;
        }

        .topbar-upload-btn:hover {
          background-color: var(--sf-color-primary-hover);
        }

        .topbar-menu-btn {
          display: none;
        }

        .hidden {
          display: none;
        }

        @media (max-width: 768px) {
          .topbar-menu-btn {
            display: flex;
          }
          
          .topbar-center {
            display: none;
          }

          .topbar-upload-btn {
            padding: var(--sf-space-2) var(--sf-space-3);
            font-size: var(--sf-text-xs);
          }
        }

        @media (min-width: 768px) {
          .topbar-inner {
            padding: 0 var(--sf-space-6);
          }
        }

        @media (min-width: 1024px) {
          .topbar-inner {
            padding: 0 var(--sf-space-8);
          }
        }
      `}</style>
    </header>
  );
};
