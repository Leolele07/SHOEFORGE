import { useEffect } from 'react';
import { useCustomizationStore } from '@/store/customizationStore';

export function useKeyboardShortcuts() {
  const { undo, redo } = useCustomizationStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 检查是否按下了Ctrl/Cmd键
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;

      if (isCtrlOrCmd) {
        // Ctrl+Z: 撤销
        if (e.key === 'z' && !e.shiftKey) {
          e.preventDefault();
          undo();
        }
        
        // Ctrl+Y 或 Ctrl+Shift+Z: 重做
        if (e.key === 'y' || (e.key === 'z' && e.shiftKey)) {
          e.preventDefault();
          redo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);
}
