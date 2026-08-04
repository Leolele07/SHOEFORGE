import { create } from 'zustand';
import type { PartId, PartConfig } from '@/types';

interface HistoryState {
  past: Map<PartId, PartConfig>[];
  future: Map<PartId, PartConfig>[];

  pushState: (state: Map<PartId, PartConfig>) => void;
  /** 执行撤销，返回应当恢复到的上一个状态；调用方需先将自己的当前状态传入 */
  undo: (currentState: Map<PartId, PartConfig>) => Map<PartId, PartConfig> | null;
  /** 执行重做，返回应当恢复到的下一个状态；调用方需先将自己的当前状态传入 */
  redo: (currentState: Map<PartId, PartConfig>) => Map<PartId, PartConfig> | null;
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
  
  undo: (currentState) => {
    const { past, future } = get();
    if (past.length === 0) return null;

    const newPast = [...past];
    const previousState = newPast.pop()!;

    set({
      past: newPast,
      future: [new Map(currentState), ...future],
    });

    return previousState;
  },

  redo: (currentState) => {
    const { past, future } = get();
    if (future.length === 0) return null;

    const newFuture = [...future];
    const nextState = newFuture.shift()!;

    set({
      past: [...past, new Map(currentState)],
      future: newFuture,
    });

    return nextState;
  },
  
  canUndo: () => get().past.length > 0,
  canRedo: () => get().future.length > 0,
  
  clear: () => set({ past: [], future: [] }),
}));
