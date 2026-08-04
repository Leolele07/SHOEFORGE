import { useEffect, useRef, useCallback } from 'react';
import { useCustomizationStore } from '@/store/customizationStore';
import { saveStateToStorage, loadStateFromStorage } from '@/lib/storage';

/** 防抖延迟（毫秒） */
const DEBOUNCE_MS = 500;

/**
 * 自动保存和加载状态的hook
 * - 加载：仅在挂载时从 localStorage 恢复一次
 * - 保存：partConfigs 变化后延迟 500ms 写入，避免高频拖拽时频繁序列化
 */
export function useAutoSave() {
  const { partConfigs, importPreset } = useCustomizationStore();
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstRun = useRef(true);

  // 加载保存的状态（仅挂载时执行一次）
  useEffect(() => {
    const savedState = loadStateFromStorage();
    if (savedState && savedState.size > 0) {
      const preset = {
        id: 'auto-saved',
        name: '自动保存',
        createdAt: new Date().toISOString(),
        modelFileName: 'mesh_textured_pbr.glb',
        parts: Array.from(savedState.values()),
      };
      importPreset(preset);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 防抖保存
  const debouncedSave = useCallback((configs: typeof partConfigs) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      if (configs.size > 0) {
        saveStateToStorage(configs);
      }
    }, DEBOUNCE_MS);
  }, []);

  // 自动保存状态（带防抖）
  useEffect(() => {
    // 跳过首次渲染（因为刚从 localStorage 加载的，没必要再写回去）
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    debouncedSave(partConfigs);
  }, [partConfigs, debouncedSave]);

  // 卸载时清理定时器并立即保存
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      // 卸载前确保最终状态被保存
      if (partConfigs.size > 0) {
        saveStateToStorage(partConfigs);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
