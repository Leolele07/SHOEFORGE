import { create } from 'zustand';
import type { ModelMetadata, ModelLoadError } from '@/types';

interface ModelState {
  modelUrl: string | null;
  modelMeta: ModelMetadata | null;
  isLoading: boolean;
  loadError: ModelLoadError | null;
  
  loadModel: (file: File) => Promise<void>;
  loadModelFromUrl: (url: string, fileName: string) => void;
  setModelUrl: (url: string | null) => void;
  setModelMeta: (meta: ModelMetadata | null) => void;
  setLoading: (loading: boolean) => void;
  setLoadError: (error: ModelLoadError | null) => void;
  reset: () => void;
}

export const useModelStore = create<ModelState>((set, get) => ({
  modelUrl: null,
  modelMeta: null,
  isLoading: false,
  loadError: null,

  loadModel: async (file: File) => {
    const { setLoading, setLoadError, setModelUrl, setModelMeta } = get();
    
    setLoading(true);
    setLoadError(null);

    try {
      // 验证文件类型
      if (!file.name.endsWith('.glb') && !file.name.endsWith('.gltf')) {
        throw {
          type: 'UNSUPPORTED_FORMAT',
          message: '不支持的文件格式，请上传 .glb 或 .gltf 文件',
          retryable: true,
        } as ModelLoadError;
      }

      // 验证文件大小（限制 50MB）
      if (file.size > 50 * 1024 * 1024) {
        throw {
          type: 'TOO_LARGE',
          message: '文件过大，请上传小于 50MB 的模型',
          retryable: true,
        } as ModelLoadError;
      }

      // 创建对象 URL
      const url = URL.createObjectURL(file);
      setModelUrl(url);

      // 注意：实际的模型解析将在 scene 组件中通过 useGLTF 完成
      // 这里先设置基本的元数据
      setModelMeta({
        fileName: file.name,
        meshCount: 0,
        customizableParts: [],
        boundingBox: {
          center: [0, 0, 0],
          size: [0, 0, 0],
        },
      });
    } catch (error) {
      const loadError = error as ModelLoadError;
      setLoadError(loadError);
    } finally {
      setLoading(false);
    }
  },

  loadModelFromUrl: (url: string, fileName: string) => {
    set({ 
      modelUrl: url,
      modelMeta: {
        fileName,
        meshCount: 0,
        customizableParts: [],
        boundingBox: {
          center: [0, 0, 0],
          size: [0, 0, 0],
        },
      },
    });
  },

  setModelUrl: (url) => set({ modelUrl: url }),
  setModelMeta: (meta) => set({ modelMeta: meta }),
  setLoading: (loading) => set({ isLoading: loading }),
  setLoadError: (error) => set({ loadError: error }),
  
  reset: () => {
    const { modelUrl } = get();
    if (modelUrl) {
      URL.revokeObjectURL(modelUrl);
    }
    set({
      modelUrl: null,
      modelMeta: null,
      isLoading: false,
      loadError: null,
    });
  },
}));
