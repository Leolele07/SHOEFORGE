import { create } from 'zustand';
import type { CameraPreset, PanelType } from '@/types';

interface UIState {
  activePanel: PanelType;
  presetCamera: CameraPreset;
  rotateCount: number;
  isMobile: boolean;
  showUploadZone: boolean;
  
  setActivePanel: (panel: PanelType) => void;
  setPresetCamera: (preset: CameraPreset) => void;
  triggerRotate: (direction: 'rotateLeft' | 'rotateRight') => void;
  setIsMobile: (isMobile: boolean) => void;
  setShowUploadZone: (show: boolean) => void;
  togglePanel: (panel: PanelType) => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  activePanel: 'parts',
  presetCamera: 'free',
  rotateCount: 0,
  isMobile: false,
  showUploadZone: true,

  setActivePanel: (panel) => set({ activePanel: panel }),
  
  setPresetCamera: (preset) => set({ presetCamera: preset }),
  
  triggerRotate: (direction) => {
    const { rotateCount } = get();
    set({ 
      presetCamera: direction,
      rotateCount: rotateCount + 1
    });
  },
  
  setIsMobile: (isMobile) => set({ isMobile }),
  
  setShowUploadZone: (show) => set({ showUploadZone: show }),
  
  togglePanel: (panel) => {
    const { activePanel } = get();
    set({ activePanel: activePanel === panel ? null : panel });
  },
}));
