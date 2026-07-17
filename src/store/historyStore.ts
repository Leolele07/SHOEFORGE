import { create } from 'zustand';
import type { PartId, PartConfig } from '@/types';

interface HistoryState {
  past: Map<PartId, PartConfig>[];
  future: Map<PartId, PartConfig>[];
  
  pushState: (state: Map<PartId, PartConfig>) => void;
  undo: () => Map<PartId, PartConfig> | null;
  redo: () => Map<PartId, PartConfig> | null;
  canUndo: () => boolean;
  canRedo: () => boolean;
  clear: () => void;
}

const MAX_HISTORY = 50;

export const useHistoryStore = create<HistoryState>((set, get) => ({
  past: [],
  future: [],
  
  pushState: (state) => {
    const { past } = get();
    const newPast = [...past, new Map(state)];
    
    // 限制历史记录数量
    if (newPast.length > MAX_HISTORY) {
      newPast.shift();
    }
    
    set({ past: newPast, future: [] });
  },
  
  undo: () => {
    const { past, future } = get();
    if (past.length === 0) return null;
    
    const newPast = [...past];
    const previousState = newPast.pop()!;
    const currentState = previousState; // 当前状态应该是从customizationStore获取
    
    set({
      past: newPast,
      future: [new Map(currentState), ...future],
    });
    
    return previousState;
  },
  
  redo: () => {
    const { past, future } = get();
    if (future.length === 0) return null;
    
    const newFuture = [...future];
    const nextState = newFuture.shift()!;
    
    set({
      past: [...past, new Map(nextState)],
      future: newFuture,
    });
    
    return nextState;
  },
  
  canUndo: () => get().past.length > 0,
  canRedo: () => get().future.length > 0,
  
  clear: () => set({ past: [], future: [] }),
}));
