import { create } from 'zustand';
import type { PartId, PartConfig, MaterialType, PartInfo, DesignPreset } from '@/types';
import { useHistoryStore } from './historyStore';

interface CustomizationState {
  selectedPartId: PartId | null;
  partConfigs: Map<PartId, PartConfig>;
  parts: PartInfo[];
  
  selectPart: (partId: PartId | null) => void;
  updatePartColor: (partId: PartId, color: string) => void;
  updatePartMaterial: (partId: PartId, materialType: MaterialType) => void;
  updatePartAdvanced: (partId: PartId, roughness?: number, metalness?: number) => void;
  togglePartVisibility: (partId: PartId) => void;
  resetPart: (partId: PartId) => void;
  resetAll: () => void;
  setParts: (parts: PartInfo[]) => void;
  initPartConfigs: (parts: PartInfo[]) => void;
  exportPreset: (name: string) => DesignPreset;
  importPreset: (preset: DesignPreset) => void;
  undo: () => void;
  redo: () => void;
}

export const useCustomizationStore = create<CustomizationState>((set, get) => ({
  selectedPartId: null,
  partConfigs: new Map(),
  parts: [],

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
    
    const part = parts.find((p) => p.partId === partId);
    
    if (part) {
      const newConfigs = new Map(partConfigs);
      newConfigs.set(partId, {
        partId,
        color: part.defaultColor,
        materialType: part.defaultMaterial,
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
      newConfigs.set(part.partId, {
        partId: part.partId,
        color: part.defaultColor,
        materialType: part.defaultMaterial,
        visible: true,
      });
    });
    
    set({ partConfigs: newConfigs, selectedPartId: null });
  },

  setParts: (parts) => set({ parts }),

  initPartConfigs: (parts) => {
    const newConfigs = new Map<PartId, PartConfig>();
    
    parts.forEach((part) => {
      newConfigs.set(part.partId, {
        partId: part.partId,
        color: part.defaultColor,
        materialType: part.defaultMaterial,
        visible: true,
      });
    });
    
    set({ parts, partConfigs: newConfigs });
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
