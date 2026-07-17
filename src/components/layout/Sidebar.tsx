import React, { useState } from 'react';
import { useCustomizationStore } from '@/store/customizationStore';
import { PartListPanel } from '@/components/panel/PartListPanel';
import { CustomizationPanel } from '@/components/panel/CustomizationPanel';
import { useHistoryStore } from '@/store/historyStore';

type TabType = 'parts' | 'customize';

export const Sidebar: React.FC = () => {
  const { selectedPartId, undo, redo } = useCustomizationStore();
  const { canUndo, canRedo } = useHistoryStore();
  const [activeTab, setActiveTab] = useState<TabType>('parts');

  // 当选择部件时自动切换到定制标签
  React.useEffect(() => {
    if (selectedPartId) {
      setActiveTab('customize');
    }
  }, [selectedPartId]);

  return (
    <div className="sidebar">
      {/* 侧边栏头部 */}
      <div className="sidebar-header">
        <div className="sidebar-tabs">
          <button
            className={`sidebar-tab ${activeTab === 'parts' ? 'active' : ''}`}
            onClick={() => setActiveTab('parts')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            部件
          </button>
          <button
            className={`sidebar-tab ${activeTab === 'customize' ? 'active' : ''}`}
            onClick={() => setActiveTab('customize')}
            disabled={!selectedPartId}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1m15.36-5.36l-4.24 4.24m-2.24-2.24L5.64 5.64m12.72 12.72l-4.24-4.24m-2.24 2.24l-4.24 4.24" />
            </svg>
            定制
          </button>
        </div>

        {/* 撤销/重做按钮 */}
        <div className="sidebar-actions">
          <button
            onClick={undo}
            disabled={!canUndo()}
            className="btn btn-ghost btn-icon btn-sm"
            title="撤销 (Ctrl+Z)"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
          </button>
          <button
            onClick={redo}
            disabled={!canRedo()}
            className="btn btn-ghost btn-icon btn-sm"
            title="重做 (Ctrl+Y)"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10H11a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6" />
            </svg>
          </button>
        </div>
      </div>

      {/* 侧边栏内容 */}
      <div className="sidebar-content">
        {activeTab === 'parts' ? (
          <PartListPanel />
        ) : (
          <CustomizationPanel />
        )}
      </div>

      <style>{`
        .sidebar {
          display: flex;
          flex-direction: column;
          height: 100%;
          overflow: hidden;
        }

        .sidebar-header {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--sf-space-2);
          border-bottom: 1px solid var(--sf-border-primary);
          background-color: var(--sf-bg-primary);
        }

        .sidebar-tabs {
          display: flex;
          gap: var(--sf-space-1);
        }

        .sidebar-tab {
          display: flex;
          align-items: center;
          gap: var(--sf-space-2);
          padding: var(--sf-space-2) var(--sf-space-3);
          border: none;
          background: none;
          border-radius: var(--sf-radius-md);
          font-size: var(--sf-text-sm);
          font-weight: var(--sf-font-medium);
          color: var(--sf-text-secondary);
          cursor: pointer;
          transition: all var(--sf-duration-fast) var(--sf-easing-default);
        }

        .sidebar-tab:hover:not(:disabled) {
          background-color: var(--sf-bg-secondary);
          color: var(--sf-text-primary);
        }

        .sidebar-tab.active {
          background-color: var(--sf-color-primary);
          color: var(--sf-text-inverse);
        }

        .sidebar-tab:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .sidebar-actions {
          display: flex;
          gap: var(--sf-space-1);
        }

        .sidebar-content {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
        }

        /* 移动端样式 */
        @media (max-width: 768px) {
          .sidebar-header {
            padding: var(--sf-space-3);
          }

          .sidebar-tab {
            padding: var(--sf-space-3) var(--sf-space-4);
          }
        }
      `}</style>
    </div>
  );
};
