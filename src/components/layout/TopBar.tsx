import React, { useRef, useCallback, useState } from 'react';
import { useModelStore } from '@/store/modelStore';
import { useCustomizationStore } from '@/store/customizationStore';
import { showToast } from '@/components/Toast';

interface TopBarProps {
  onToggleSidebar?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onToggleSidebar }) => {
  const { modelMeta, loadModel } = useModelStore();
  const { resetAllToWhite, resetAllToOriginal, saveDesign, loadDesign, deleteDesign, getSavedDesigns } = useCustomizationStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showDesignMenu, setShowDesignMenu] = useState(false);
  const [designName, setDesignName] = useState('');

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

  const handleSaveDesign = useCallback(() => {
    if (!designName.trim()) {
      showToast('请输入设计名称', 'error');
      return;
    }
    saveDesign(designName.trim());
    setDesignName('');
    setShowDesignMenu(false);
    showToast('设计已保存', 'success');
  }, [designName, saveDesign]);

  const handleLoadDesign = useCallback((name: string) => {
    loadDesign(name);
    setShowDesignMenu(false);
  }, [loadDesign]);

  const handleDeleteDesign = useCallback((name: string) => {
    if (confirm(`确定要删除设计"${name}"吗？`)) {
      deleteDesign(name);
    }
  }, [deleteDesign]);

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
          {/* 设计管理按钮 */}
          {modelMeta && (
            <div className="topbar-design-container">
              <button
                onClick={() => setShowDesignMenu(!showDesignMenu)}
                className="topbar-action-btn"
                title="保存和加载设计"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                  <polyline points="17 21 17 13 7 13 7 21" />
                  <polyline points="7 3 7 8 15 8" />
                </svg>
                设计管理
              </button>

              {/* 设计管理菜单 */}
              {showDesignMenu && (
                <div className="topbar-design-menu">
                  {/* 保存设计 */}
                  <div className="design-save-section">
                    <input
                      type="text"
                      value={designName}
                      onChange={(e) => setDesignName(e.target.value)}
                      placeholder="输入设计名称"
                      className="design-name-input"
                    />
                    <button onClick={handleSaveDesign} className="design-save-btn">
                      保存
                    </button>
                  </div>

                  {/* 已保存的设计列表 */}
                  <div className="design-list">
                    <div className="design-list-title">已保存的设计</div>
                    {getSavedDesigns().length === 0 ? (
                      <div className="design-empty">暂无保存的设计</div>
                    ) : (
                      getSavedDesigns().map((name) => (
                        <div key={name} className="design-item">
                          <span className="design-item-name">{name}</span>
                          <div className="design-item-actions">
                            <button
                              onClick={() => handleLoadDesign(name)}
                              className="design-load-btn"
                              title="加载设计"
                            >
                              加载
                            </button>
                            <button
                              onClick={() => handleDeleteDesign(name)}
                              className="design-delete-btn"
                              title="删除设计"
                            >
                              删除
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 一键白膜按钮 */}
          {modelMeta && (
            <button
              onClick={resetAllToWhite}
              className="topbar-action-btn"
              title="清除所有材质和颜色，变为白色模型"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M8 12h8" />
                <path d="M12 8v8" />
              </svg>
              一键白膜
            </button>
          )}

          {/* 恢复原始按钮 */}
          {modelMeta && (
            <button
              onClick={resetAllToOriginal}
              className="topbar-action-btn"
              title="恢复到模型导入时的原始状态"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="1 4 1 10 7 10" />
                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
              </svg>
              恢复原始
            </button>
          )}

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

        .topbar-action-btn {
          display: flex;
          align-items: center;
          gap: var(--sf-space-2);
          padding: var(--sf-space-2) var(--sf-space-4);
          background-color: var(--sf-bg-primary);
          color: var(--sf-text-primary);
          border: 1px solid var(--sf-border-secondary);
          border-radius: var(--sf-radius-md);
          font-size: var(--sf-text-sm);
          font-weight: var(--sf-font-medium);
          cursor: pointer;
          transition: all var(--sf-duration-fast) var(--sf-easing-default);
          white-space: nowrap;
        }

        .topbar-action-btn:hover {
          background-color: var(--sf-bg-secondary);
        }

        .topbar-design-container {
          position: relative;
        }

        .topbar-design-menu {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: var(--sf-space-2);
          width: 300px;
          background-color: var(--sf-bg-primary);
          border: 1px solid var(--sf-border-primary);
          border-radius: var(--sf-radius-md);
          box-shadow: var(--sf-shadow-lg);
          z-index: var(--sf-z-dropdown);
          overflow: hidden;
        }

        .design-save-section {
          display: flex;
          gap: var(--sf-space-2);
          padding: var(--sf-space-3);
          border-bottom: 1px solid var(--sf-border-primary);
        }

        .design-name-input {
          flex: 1;
          padding: var(--sf-space-2) var(--sf-space-3);
          border: 1px solid var(--sf-border-primary);
          border-radius: var(--sf-radius-sm);
          font-size: var(--sf-text-sm);
          outline: none;
        }

        .design-name-input:focus {
          border-color: var(--sf-color-primary);
        }

        .design-save-btn {
          padding: var(--sf-space-2) var(--sf-space-3);
          background-color: var(--sf-color-primary);
          color: var(--sf-text-inverse);
          border: none;
          border-radius: var(--sf-radius-sm);
          font-size: var(--sf-text-sm);
          font-weight: var(--sf-font-medium);
          cursor: pointer;
        }

        .design-save-btn:hover {
          background-color: var(--sf-color-primary-hover);
        }

        .design-list {
          max-height: 300px;
          overflow-y: auto;
        }

        .design-list-title {
          padding: var(--sf-space-2) var(--sf-space-3);
          font-size: var(--sf-text-xs);
          font-weight: var(--sf-font-semibold);
          color: var(--sf-text-secondary);
          background-color: var(--sf-bg-secondary);
        }

        .design-empty {
          padding: var(--sf-space-4);
          text-align: center;
          font-size: var(--sf-text-sm);
          color: var(--sf-text-tertiary);
        }

        .design-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--sf-space-2) var(--sf-space-3);
          border-bottom: 1px solid var(--sf-border-primary);
        }

        .design-item:last-child {
          border-bottom: none;
        }

        .design-item-name {
          font-size: var(--sf-text-sm);
          color: var(--sf-text-primary);
        }

        .design-item-actions {
          display: flex;
          gap: var(--sf-space-1);
        }

        .design-load-btn {
          padding: var(--sf-space-1) var(--sf-space-2);
          background-color: var(--sf-bg-primary);
          color: var(--sf-color-primary);
          border: 1px solid var(--sf-color-primary);
          border-radius: var(--sf-radius-sm);
          font-size: var(--sf-text-xs);
          cursor: pointer;
        }

        .design-load-btn:hover {
          background-color: var(--sf-color-primary);
          color: var(--sf-text-inverse);
        }

        .design-delete-btn {
          padding: var(--sf-space-1) var(--sf-space-2);
          background-color: var(--sf-bg-primary);
          color: var(--sf-color-error);
          border: 1px solid var(--sf-color-error);
          border-radius: var(--sf-radius-sm);
          font-size: var(--sf-text-xs);
          cursor: pointer;
        }

        .design-delete-btn:hover {
          background-color: var(--sf-color-error);
          color: var(--sf-text-inverse);
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
