import { create } from 'zustand';
import type { CameraPreset, PanelType } from '@/types';

interface UIState {
  activePanel: PanelType;
  presetCamera: CameraPreset;
  isMobile: boolean;
  showUploadZone: boolean;
  
  setActivePanel: (panel: PanelType) => void;
  setPresetCamera: (preset: CameraPreset) => void;
  setIsMobile: (isMobile: boolean) => void;
  setShowUploadZone: (show: boolean) => void;
  togglePanel: (panel: PanelType) => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  activePanel: 'parts',
  presetCamera: 'free',
  isMobile: false,
  showUploadZone: true,

  setActivePanel: (panel) => set({ activePanel: panel }),
  
  setPresetCamera: (preset) => set({ presetCamera: preset }),
  
  setIsMobile: (isMobile) => set({ isMobile }),
  
  setShowUploadZone: (show) => set({ showUploadZone: show }),
  
  togglePanel: (panel) => {
    const { activePanel } = get();
    set({ activePanel: activePanel === panel ? null : panel });
  },
}));
