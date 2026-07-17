import type { PartId, PartConfig, DesignPreset } from '@/types';

const STORAGE_KEY = 'shoe-forge-state';

interface StoredState {
  partConfigs: [PartId, PartConfig][];
  lastSaved: string;
}

/**
 * 保存状态到localStorage
 */
export function saveStateToStorage(partConfigs: Map<PartId, PartConfig>): void {
  try {
    const state: StoredState = {
      partConfigs: Array.from(partConfigs.entries()),
      lastSaved: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save state to localStorage:', error);
  }
}

/**
 * 从localStorage加载状态
 */
export function loadStateFromStorage(): Map<PartId, PartConfig> | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const state: StoredState = JSON.parse(stored);
    return new Map(state.partConfigs);
  } catch (error) {
    console.error('Failed to load state from localStorage:', error);
    return null;
  }
}

/**
 * 清除localStorage中的状态
 */
export function clearStoredState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear stored state:', error);
  }
}

/**
 * 保存方案到localStorage
 */
export function savePresetToStorage(preset: DesignPreset): void {
  try {
    const presets = getStoredPresets();
    presets.push(preset);
    
    // 限制保存的方案数量
    if (presets.length > 10) {
      presets.shift();
    }
    
    localStorage.setItem('shoe-forge-presets', JSON.stringify(presets));
  } catch (error) {
    console.error('Failed to save preset to localStorage:', error);
  }
}

/**
 * 从localStorage获取所有保存的方案
 */
export function getStoredPresets(): DesignPreset[] {
  try {
    const stored = localStorage.getItem('shoe-forge-presets');
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (error) {
    console.error('Failed to get stored presets:', error);
    return [];
  }
}

/**
 * 从localStorage删除方案
 */
export function deleteStoredPreset(presetId: string): void {
  try {
    const presets = getStoredPresets();
    const filtered = presets.filter((p) => p.id !== presetId);
    localStorage.setItem('shoe-forge-presets', JSON.stringify(filtered));
  } catch (error) {
    console.error('Failed to delete stored preset:', error);
  }
}
