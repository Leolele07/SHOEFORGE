import React, { useState } from 'react';
import { useModelStore } from '@/store/modelStore';
import { TopBar } from './TopBar';
import { Sidebar } from './Sidebar';
import { BottomBar } from './BottomBar';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { modelUrl } = useModelStore();
  const [sidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="layout">
      {/* 顶栏 */}
      <TopBar onToggleSidebar={toggleMobileMenu} />

      {/* 主内容区域 */}
      <div className="layout-main">
        {/* 3D视图区域 */}
        <main className="layout-content">
          {children}
        </main>

        {/* 侧边栏 - 桌面端（右侧） */}
        {modelUrl && (
          <aside className={`layout-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
            <Sidebar />
          </aside>
        )}
      </div>

      {/* 底部栏 - 移动端 */}
      {modelUrl && (
        <BottomBar />
      )}

      {/* 移动端侧边栏覆盖层 */}
      {mobileMenuOpen && (
        <div className="layout-mobile-overlay" onClick={toggleMobileMenu}>
          <div className="layout-mobile-sidebar" onClick={(e) => e.stopPropagation()}>
            <Sidebar />
          </div>
        </div>
      )}

      <style>{`
        .layout {
          display: flex;
          flex-direction: column;
          height: 100vh;
          width: 100%;
          overflow: hidden;
          background-color: var(--sf-bg-secondary);
        }

        .layout-main {
          flex: 1;
          display: flex;
          overflow: hidden;
        }

        .layout-content {
          flex: 1;
          overflow: hidden;
          position: relative;
        }

        .layout-sidebar {
          flex-shrink: 0;
          width: 320px;
          background-color: var(--sf-bg-primary);
          border-left: 1px solid var(--sf-border-primary);
          transition: width var(--sf-duration-normal) var(--sf-easing-default),
                      transform var(--sf-duration-normal) var(--sf-easing-default);
          overflow: hidden;
        }

        .layout-sidebar.closed {
          width: 0;
          border-left: none;
        }

        .layout-mobile-overlay {
          display: none;
        }

        /* 平板端布局 */
        @media (max-width: 1024px) {
          .layout-sidebar {
            width: 280px;
          }
        }

        /* 移动端布局 */
        @media (max-width: 768px) {
          .layout-sidebar {
            display: none;
          }

          .layout-mobile-overlay {
            display: block;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: var(--sf-bg-overlay);
            z-index: var(--sf-z-overlay);
            animation: fadeIn var(--sf-duration-normal) var(--sf-easing-out);
          }

          .layout-mobile-sidebar {
            position: absolute;
            top: 0;
            right: 0;
            bottom: 0;
            width: 320px;
            max-width: 85vw;
            background-color: var(--sf-bg-primary);
            box-shadow: var(--sf-shadow-xl);
            animation: slideLeft var(--sf-duration-normal) var(--sf-easing-out);
          }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideLeft {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};
