import React, { useState } from 'react';
import { useCustomizationStore } from '@/store/customizationStore';
import { PRESET_COLORS, MATERIAL_NAMES } from '@/types';
import type { MaterialType } from '@/types';
import '@/styles/bottom-bar.css';

type BottomTabType = 'parts' | 'color' | 'material' | 'actions';

/** 材质渐变预览映射 */
const MATERIAL_GRADIENTS: Record<string, string> = {
  leather: 'linear-gradient(135deg, #8B4513 0%, #A0522D 50%, #6B3410 100%)',
  mesh: 'linear-gradient(135deg, #E0E0E0 0%, #BDBDBD 50%, #9E9E9E 100%)',
  suede: 'linear-gradient(135deg, #D2B48C 0%, #C4A882 50%, #B89B7A 100%)',
  canvas: 'linear-gradient(135deg, #F5F5DC 0%, #EED9B6 50%, #D4C5A0 100%)',
  patent: 'linear-gradient(135deg, #1A1A1A 0%, #333333 50%, #0D0D0D 100%)',
  metallic: 'linear-gradient(135deg, #C0C0C0 0%, #A8A8A8 50%, #D4D4D4 100%)',
  plastic: 'linear-gradient(135deg, #2196F3 0%, #1976D2 50%, #0D47A1 100%)',
  rubber: 'linear-gradient(135deg, #333333 0%, #444444 50%, #222222 100%)',
  fabric: 'linear-gradient(135deg, #8D6E63 0%, #795548 50%, #6D4C41 100%)',
  carbon: 'linear-gradient(135deg, #212121 0%, #37474F 50%, #1B1B1B 100%)',
  transparent: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(200,200,200,0.3) 50%, rgba(255,255,255,0.1) 100%)',
};

const MATERIAL_TYPES = Object.keys(MATERIAL_NAMES) as MaterialType[];

export const BottomBar: React.FC = () => {
  const { selectedPartId, parts, partConfigs } = useCustomizationStore();
  const [activeTab, setActiveTab] = useState<BottomTabType | null>(null);
  const [showPanel, setShowPanel] = useState(false);

  const selectedPart = parts.find((p) => p.id === selectedPartId);
  const selectedConfig = selectedPartId ? partConfigs.get(selectedPartId) : undefined;

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
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleScreenshot = () => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `shoe-screenshot-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleColorSelect = (color: string) => {
    if (!selectedPartId) return;
    useCustomizationStore.getState().updatePartColor(selectedPartId, color);
  };

  const handleMaterialSelect = (materialType: MaterialType) => {
    if (!selectedPartId) return;
    useCustomizationStore.getState().updatePartMaterial(selectedPartId, materialType);
  };

  return (
    <div className="bottombar">
      {/* 展开的面板 */}
      {showPanel && (
        <div className="bottombar-panel">
          <div className="bottombar-panel-header">
            <span className="bottombar-panel-title">
              {activeTab === 'parts' && '选择部件'}
              {activeTab === 'color' && (selectedPart ? `${selectedPart.name} - 选择颜色` : '选择颜色')}
              {activeTab === 'material' && (selectedPart ? `${selectedPart.name} - 选择材质` : '选择材质')}
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
            {/* 部件列表 */}
            {activeTab === 'parts' && (
              <div className="bottombar-parts-list">
                {parts.map((part) => {
                  const config = partConfigs.get(part.id);
                  if (!config) return null;
                  return (
                    <button
                      key={part.id}
                      onClick={() => {
                        useCustomizationStore.getState().selectPart(part.id);
                        setActiveTab('color');
                      }}
                      className={`bottombar-part-item ${selectedPartId === part.id ? 'active' : ''}`}
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

            {/* 颜色选择 */}
            {activeTab === 'color' && selectedPart && selectedConfig && (
              <div className="bottombar-color-grid">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => handleColorSelect(color)}
                    className={`bottombar-color-swatch ${selectedConfig.color === color ? 'selected' : ''}`}
                    style={{ backgroundColor: color }}
                    title={color}
                  >
                    {selectedConfig.color === color && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* 材质选择 */}
            {activeTab === 'material' && selectedPart && selectedConfig && (
              <div className="bottombar-material-list">
                {MATERIAL_TYPES.map((type) => (
                  <button
                    key={type}
                    onClick={() => handleMaterialSelect(type)}
                    className={`bottombar-material-item ${selectedConfig.materialType === type ? 'active' : ''}`}
                  >
                    <div
                      className="bottombar-material-gradient"
                      style={{ background: MATERIAL_GRADIENTS[type] || '#ccc' }}
                    />
                    <span className="bottombar-material-name">{MATERIAL_NAMES[type]}</span>
                  </button>
                ))}
              </div>
            )}

            {/* 操作 */}
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
    </div>
  );
};
