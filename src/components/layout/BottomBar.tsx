import React, { useState } from 'react';
import { useCustomizationStore } from '@/store/customizationStore';

type BottomTabType = 'parts' | 'color' | 'material' | 'actions';

export const BottomBar: React.FC = () => {
  const { selectedPartId, parts, partConfigs } = useCustomizationStore();
  const [activeTab, setActiveTab] = useState<BottomTabType | null>(null);
  const [showPanel, setShowPanel] = useState(false);

  const selectedPart = parts.find((p) => p.partId === selectedPartId);

  const handleTabClick = (tab: BottomTabType) => {
    if (activeTab === tab && showPanel) {
      setShowPanel(false);
      setActiveTab(null);
    } else {
      setActiveTab(tab);
      setShowPanel(true);
    }
  };

  const handleSave = () => {
    const { exportPreset } = useCustomizationStore.getState();
    const preset = exportPreset('我的设计');
    const json = JSON.stringify(preset, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shoe-design-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleScreenshot = () => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `shoe-screenshot-${Date.now()}.png`;
    a.click();
  };

  return (
    <div className="bottombar">
      {/* 展开的面板 */}
      {showPanel && (
        <div className="bottombar-panel">
          <div className="bottombar-panel-header">
            <span className="bottombar-panel-title">
              {activeTab === 'parts' && '选择部件'}
              {activeTab === 'color' && '选择颜色'}
              {activeTab === 'material' && '选择材质'}
              {activeTab === 'actions' && '操作'}
            </span>
            <button
              onClick={() => setShowPanel(false)}
              className="btn btn-ghost btn-icon btn-sm"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="bottombar-panel-content">
            {activeTab === 'parts' && (
              <div className="bottombar-parts-list">
                {parts.map((part) => {
                  const config = partConfigs.get(part.partId);
                  if (!config) return null;
                  return (
                    <button
                      key={part.partId}
                      onClick={() => {
                        useCustomizationStore.getState().selectPart(part.partId);
                        setActiveTab('color');
                      }}
                      className={`bottombar-part-item ${selectedPartId === part.partId ? 'active' : ''}`}
                    >
                      <div
                        className="bottombar-part-color"
                        style={{ backgroundColor: config.color }}
                      />
                      <span className="bottombar-part-name">{part.name}</span>
                    </button>
                  );
                })}
              </div>
            )}
            {activeTab === 'color' && selectedPart && (
              <div className="bottombar-colors">
                {/* 简化的颜色选择 */}
                <p className="text-sm text-secondary">选择颜色功能</p>
              </div>
            )}
            {activeTab === 'material' && selectedPart && (
              <div className="bottombar-materials">
                <p className="text-sm text-secondary">选择材质功能</p>
              </div>
            )}
            {activeTab === 'actions' && (
              <div className="bottombar-actions-grid">
                <button onClick={handleScreenshot} className="bottombar-action-item">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="M21 15l-5-5L5 21" />
                  </svg>
                  <span>截图</span>
                </button>
                <button onClick={handleSave} className="bottombar-action-item">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
                    <polyline points="17 21 17 13 7 13 7 21" />
                    <polyline points="7 3 7 8 15 8" />
                  </svg>
                  <span>保存</span>
                </button>
                <button
                  onClick={() => {
                    if (confirm('确定要重置所有定制吗？')) {
                      useCustomizationStore.getState().resetAll();
                    }
                  }}
                  className="bottombar-action-item"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="1 4 1 10 7 10" />
                    <path d="M3.51 15a9 9 0 102.13-9.36L1 10" />
                  </svg>
                  <span>重置</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 底部导航栏 */}
      <div className="bottombar-nav">
        <button
          className={`bottombar-tab ${activeTab === 'parts' ? 'active' : ''}`}
          onClick={() => handleTabClick('parts')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <span>部件</span>
        </button>
        <button
          className={`bottombar-tab ${activeTab === 'color' ? 'active' : ''}`}
          onClick={() => handleTabClick('color')}
          disabled={!selectedPartId}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="13.5" cy="6.5" r="2.5" />
            <circle cx="17.5" cy="10.5" r="2.5" />
            <circle cx="8.5" cy="7.5" r="2.5" />
            <circle cx="6.5" cy="12.5" r="2.5" />
            <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 011.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
          </svg>
          <span>颜色</span>
        </button>
        <button
          className={`bottombar-tab ${activeTab === 'material' ? 'active' : ''}`}
          onClick={() => handleTabClick('material')}
          disabled={!selectedPartId}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 3v18m-6-6l6 6 6-6" />
          </svg>
          <span>材质</span>
        </button>
        <button
          className={`bottombar-tab ${activeTab === 'actions' ? 'active' : ''}`}
          onClick={() => handleTabClick('actions')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="1" />
            <circle cx="19" cy="12" r="1" />
            <circle cx="5" cy="12" r="1" />
          </svg>
          <span>更多</span>
        </button>
      </div>

      <style>{`
        .bottombar {
          display: none;
        }

        @media (max-width: 768px) {
          .bottombar {
            display: flex;
            flex-direction: column;
            background-color: var(--sf-bg-primary);
            border-top: 1px solid var(--sf-border-primary);
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            z-index: var(--sf-z-sticky);
          }

          .bottombar-panel {
            background-color: var(--sf-bg-primary);
            border-top: 1px solid var(--sf-border-primary);
            max-height: 50vh;
            overflow-y: auto;
            animation: slideUp var(--sf-duration-normal) var(--sf-easing-out);
          }

          .bottombar-panel-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: var(--sf-space-3) var(--sf-space-4);
            border-bottom: 1px solid var(--sf-border-secondary);
          }

          .bottombar-panel-title {
            font-size: var(--sf-text-sm);
            font-weight: var(--sf-font-medium);
            color: var(--sf-text-primary);
          }

          .bottombar-panel-content {
            padding: var(--sf-space-4);
          }

          .bottombar-parts-list {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: var(--sf-space-2);
          }

          .bottombar-part-item {
            display: flex;
            align-items: center;
            gap: var(--sf-space-2);
            padding: var(--sf-space-3);
            border: 1px solid var(--sf-border-primary);
            border-radius: var(--sf-radius-md);
            background: none;
            cursor: pointer;
            transition: all var(--sf-duration-fast) var(--sf-easing-default);
          }

          .bottombar-part-item:hover {
            border-color: var(--sf-text-primary);
          }

          .bottombar-part-item.active {
            border-color: var(--sf-color-primary);
            background-color: var(--sf-bg-secondary);
          }

          .bottombar-part-color {
            width: 24px;
            height: 24px;
            border-radius: var(--sf-radius-sm);
            border: 1px solid var(--sf-border-primary);
          }

          .bottombar-part-name {
            font-size: var(--sf-text-sm);
            color: var(--sf-text-primary);
          }

          .bottombar-actions-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: var(--sf-space-3);
          }

          .bottombar-action-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: var(--sf-space-2);
            padding: var(--sf-space-3);
            border: none;
            background: none;
            border-radius: var(--sf-radius-md);
            cursor: pointer;
            color: var(--sf-text-primary);
            transition: background-color var(--sf-duration-fast) var(--sf-easing-default);
          }

          .bottombar-action-item:hover {
            background-color: var(--sf-bg-secondary);
          }

          .bottombar-action-item span {
            font-size: var(--sf-text-xs);
          }

          .bottombar-nav {
            display: flex;
            align-items: center;
            justify-content: space-around;
            height: var(--sf-bottombar-height);
            padding: 0 var(--sf-space-2);
          }

          .bottombar-tab {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 2px;
            padding: var(--sf-space-2);
            border: none;
            background: none;
            border-radius: var(--sf-radius-md);
            cursor: pointer;
            color: var(--sf-text-secondary);
            transition: color var(--sf-duration-fast) var(--sf-easing-default);
            min-width: 64px;
          }

          .bottombar-tab:hover:not(:disabled) {
            color: var(--sf-text-primary);
          }

          .bottombar-tab.active {
            color: var(--sf-color-primary);
          }

          .bottombar-tab:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          .bottombar-tab span {
            font-size: 10px;
            font-weight: var(--sf-font-medium);
          }

          @keyframes slideUp {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
          }
        }
      `}</style>
    </div>
  );
};
