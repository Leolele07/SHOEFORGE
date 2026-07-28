import { create } from 'zustand';
import type { PartId, PartConfig, MaterialType, PartInfo, DesignPreset, TextureConfig } from '@/types';
import { useHistoryStore } from './historyStore';

interface CustomizationState {
  selectedPartId: PartId | null;
  partConfigs: Map<PartId, PartConfig>;
  parts: PartInfo[];
  originalPartConfigs: Map<PartId, PartConfig> | null;
  savedDesigns: Map<string, { name: string; configs: Map<PartId, PartConfig> }>;
  
  selectPart: (partId: PartId | null) => void;
  updatePartColor: (partId: PartId, color: string) => void;
  updatePartMaterial: (partId: PartId, materialType: MaterialType) => void;
  updatePartAdvanced: (partId: PartId, roughness?: number, metalness?: number) => void;
  updatePartTextures: (partId: PartId, textures: TextureConfig[]) => void;
  togglePartVisibility: (partId: PartId) => void;
  resetPart: (partId: PartId) => void;
  resetAll: () => void;
  resetAllToWhite: () => void;
  resetAllToOriginal: () => void;
  saveDesign: (name: string) => void;
  loadDesign: (name: string) => void;
  deleteDesign: (name: string) => void;
  getSavedDesigns: () => string[];
  setParts: (parts: PartInfo[]) => void;
  initPartConfigs: (parts: PartInfo[]) => void;
  exportPreset: (name: string) => DesignPreset;
  importPreset: (preset: DesignPreset) => void;
  undo: () => void;
  redo: () => void;
}

// 从localStorage加载已保存的设计
function loadSavedDesigns(): Map<string, { name: string; configs: Map<PartId, PartConfig> }> {
  try {
    const saved = localStorage.getItem('shoeForge_savedDesigns');
    if (saved) {
      const parsed = JSON.parse(saved);
      const designs = new Map();
      Object.entries(parsed).forEach(([key, value]: [string, any]) => {
        designs.set(key, {
          name: value.name,
          configs: new Map(value.configs),
        });
      });
      return designs;
    }
  } catch (e) {
    console.error('Failed to load saved designs:', e);
  }
  return new Map();
}

export const useCustomizationStore = create<CustomizationState>((set, get) => ({
  selectedPartId: null,
  partConfigs: new Map(),
  parts: [],
  originalPartConfigs: null,
  savedDesigns: loadSavedDesigns(),

  selectPart: (partId) => set({ selectedPartId: partId }),

  updatePartColor: (partId, color) => {
    const { partConfigs } = get();
    const { pushState } = useHistoryStore.getState();
    
    // 保存当前状态到历史
    pushState(new Map(partConfigs));
    
    const newConfigs = new Map(partConfigs);
    const existing = newConfigs.get(partId);
    
    if (existing) {
      newConfigs.set(partId, { ...existing, color });
      set({ partConfigs: newConfigs });
    }
  },

  updatePartMaterial: (partId, materialType) => {
    const { partConfigs } = get();
    const { pushState } = useHistoryStore.getState();
    
    // 保存当前状态到历史
    pushState(new Map(partConfigs));
    
    const newConfigs = new Map(partConfigs);
    const existing = newConfigs.get(partId);
    
    if (existing) {
      newConfigs.set(partId, { ...existing, materialType });
      set({ partConfigs: newConfigs });
    }
  },

  updatePartAdvanced: (partId, roughness, metalness) => {
    const { partConfigs } = get();
    const { pushState } = useHistoryStore.getState();
    
    // 保存当前状态到历史
    pushState(new Map(partConfigs));
    
    const newConfigs = new Map(partConfigs);
    const existing = newConfigs.get(partId);
    
    if (existing) {
      newConfigs.set(partId, {
        ...existing,
        ...(roughness !== undefined && { roughness }),
        ...(metalness !== undefined && { metalness }),
      });
      set({ partConfigs: newConfigs });
    }
  },

  updatePartTextures: (partId, textures) => {
    const { partConfigs } = get();
    const { pushState } = useHistoryStore.getState();
    
    // 保存当前状态到历史
    pushState(new Map(partConfigs));
    
    const newConfigs = new Map(partConfigs);
    const existing = newConfigs.get(partId);
    
    if (existing) {
      newConfigs.set(partId, { ...existing, textures });
      set({ partConfigs: newConfigs });
    }
  },

  togglePartVisibility: (partId) => {
    const { partConfigs } = get();
    const { pushState } = useHistoryStore.getState();
    
    // 保存当前状态到历史
    pushState(new Map(partConfigs));
    
    const newConfigs = new Map(partConfigs);
    const existing = newConfigs.get(partId);
    
    if (existing) {
      newConfigs.set(partId, { ...existing, visible: !existing.visible });
      set({ partConfigs: newConfigs });
    }
  },

  resetPart: (partId) => {
    const { partConfigs, parts } = get();
    const { pushState } = useHistoryStore.getState();
    
    // 保存当前状态到历史
    pushState(new Map(partConfigs));
    
    const part = parts.find((p) => p.id === partId);
    
    if (part) {
      const newConfigs = new Map(partConfigs);
      newConfigs.set(partId, {
        partId,
        color: part.defaultColor,
        materialType: 'mesh', // 默认材质类型
        visible: true,
      });
      set({ partConfigs: newConfigs });
    }
  },

  resetAll: () => {
    const { parts, partConfigs } = get();
    const { pushState } = useHistoryStore.getState();
    
    // 保存当前状态到历史
    pushState(new Map(partConfigs));
    
    const newConfigs = new Map<PartId, PartConfig>();
    
    parts.forEach((part) => {
      newConfigs.set(part.id, {
        partId: part.id,
        color: part.defaultColor,
        materialType: 'mesh', // 默认材质类型
        visible: true,
      });
    });
    
    set({ partConfigs: newConfigs, selectedPartId: null });
  },

  setParts: (parts) => set({ parts }),

  initPartConfigs: (parts) => {
    const newConfigs = new Map<PartId, PartConfig>();
    
    parts.forEach((part) => {
      newConfigs.set(part.id, {
        partId: part.id,
        color: part.defaultColor,
        materialType: 'mesh',
        visible: true,
        textures: [],
        originalColor: part.defaultColor,
        originalMaterialType: 'mesh',
      });
    });
    
    // 保存原始配置
    set({ 
      parts, 
      partConfigs: newConfigs, 
      originalPartConfigs: new Map(newConfigs),
      selectedPartId: null 
    });
  },

  resetAllToWhite: () => {
    const { parts, partConfigs } = get();
    const { pushState } = useHistoryStore.getState();
    
    // 保存当前状态到历史
    pushState(new Map(partConfigs));
    
    const newConfigs = new Map<PartId, PartConfig>();
    
    parts.forEach((part) => {
      newConfigs.set(part.id, {
        partId: part.id,
        color: '#FFFFFF',
        materialType: 'mesh',
        visible: true,
        textures: [],
      });
    });
    
    set({ partConfigs: newConfigs, selectedPartId: null });
  },

  resetAllToOriginal: () => {
    const { originalPartConfigs, partConfigs } = get();
    const { pushState } = useHistoryStore.getState();
    
    if (!originalPartConfigs) return;
    
    // 保存当前状态到历史
    pushState(new Map(partConfigs));
    
    // 恢复到原始配置
    set({ 
      partConfigs: new Map(originalPartConfigs), 
      selectedPartId: null 
    });
  },

  saveDesign: (name) => {
    const { partConfigs, savedDesigns } = get();
    
    // 保存当前设计
    const newSavedDesigns = new Map(savedDesigns);
    newSavedDesigns.set(name, {
      name,
      configs: new Map(partConfigs),
    });
    
    // 同时保存到localStorage
    const designsToSave: Record<string, any> = {};
    newSavedDesigns.forEach((value, key) => {
      designsToSave[key] = {
        name: value.name,
        configs: Array.from(value.configs.entries()),
      };
    });
    localStorage.setItem('shoeForge_savedDesigns', JSON.stringify(designsToSave));
    
    set({ savedDesigns: newSavedDesigns });
  },

  loadDesign: (name) => {
    const { savedDesigns, partConfigs } = get();
    const { pushState } = useHistoryStore.getState();
    
    const design = savedDesigns.get(name);
    if (!design) return;
    
    // 保存当前状态到历史
    pushState(new Map(partConfigs));
    
    // 加载设计
    set({ 
      partConfigs: new Map(design.configs), 
      selectedPartId: null 
    });
  },

  deleteDesign: (name) => {
    const { savedDesigns } = get();
    
    const newSavedDesigns = new Map(savedDesigns);
    newSavedDesigns.delete(name);
    
    // 更新localStorage
    const designsToSave: Record<string, any> = {};
    newSavedDesigns.forEach((value, key) => {
      designsToSave[key] = {
        name: value.name,
        configs: Array.from(value.configs.entries()),
      };
    });
    localStorage.setItem('shoeForge_savedDesigns', JSON.stringify(designsToSave));
    
    set({ savedDesigns: newSavedDesigns });
  },

  getSavedDesigns: () => {
    const { savedDesigns } = get();
    return Array.from(savedDesigns.keys());
  },

  exportPreset: (name) => {
    const { partConfigs } = get();
    
    return {
      id: Date.now().toString(),
      name,
      createdAt: new Date().toISOString(),
      modelFileName: 'mesh_textured_pbr.glb',
      parts: Array.from(partConfigs.values()),
    };
  },

  importPreset: (preset) => {
    const { partConfigs } = get();
    const { pushState } = useHistoryStore.getState();
    
    // 保存当前状态到历史
    pushState(new Map(partConfigs));
    
    const newConfigs = new Map<PartId, PartConfig>();
    
    preset.parts.forEach((part) => {
      newConfigs.set(part.partId, part);
    });
    
    set({ partConfigs: newConfigs });
  },

  undo: () => {
    const { undo } = useHistoryStore.getState();
    const previousState = undo();
    
    if (previousState) {
      set({ partConfigs: previousState });
    }
  },

  redo: () => {
    const { redo } = useHistoryStore.getState();
    const nextState = redo();
    
    if (nextState) {
      set({ partConfigs: nextState });
    }
  },
}));
