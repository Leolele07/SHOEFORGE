import { useEffect } from 'react';
import { useCustomizationStore } from '@/store/customizationStore';
import { saveStateToStorage, loadStateFromStorage } from '@/lib/storage';

/**
 * 自动保存和加载状态的hook
 */
export function useAutoSave() {
  const { partConfigs, importPreset } = useCustomizationStore();

  // 加载保存的状态
  useEffect(() => {
    const savedState = loadStateFromStorage();
    if (savedState && savedState.size > 0) {
      // 将保存的状态转换为preset格式并导入
      const preset = {
        id: 'auto-saved',
        name: '自动保存',
        createdAt: new Date().toISOString(),
        modelFileName: 'mesh_textured_pbr.glb',
        parts: Array.from(savedState.values()),
      };
      importPreset(preset);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 自动保存状态
  useEffect(() => {
    if (partConfigs.size > 0) {
      saveStateToStorage(partConfigs);
    }
  }, [partConfigs]);
}
