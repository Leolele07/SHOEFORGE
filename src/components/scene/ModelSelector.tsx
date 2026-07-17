import React, { useRef } from 'react';
import { useModelStore } from '@/store/modelStore';
import { useCustomizationStore } from '@/store/customizationStore';

interface ModelInfo {
  name: string;
  url: string;
  thumbnail?: string;
}

// 预设模型列表
const PRESET_MODELS: ModelInfo[] = [
  {
    name: '默认运动鞋',
    url: '/models/shoe.glb',
  },
];

export const ModelSelector: React.FC = () => {
  const { modelUrl, setModelUrl, setModelMeta } = useModelStore();
  const { resetAll } = useCustomizationStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleModelSelect = (model: ModelInfo) => {
    if (model.url === modelUrl) return;
    
    // 重置定制状态
    resetAll();
    
    // 设置新模型
    setModelUrl(model.url);
    setModelMeta({
      fileName: model.name,
      meshCount: 0,
      customizableParts: [],
      boundingBox: {
        center: [0, 0, 0],
        size: [0, 0, 0],
      },
    });
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 验证文件类型
    if (!file.name.endsWith('.glb') && !file.name.endsWith('.gltf')) {
      alert('请选择 .glb 或 .gltf 格式的文件');
      return;
    }

    // 验证文件大小（限制 50MB）
    if (file.size > 50 * 1024 * 1024) {
      alert('文件过大，请选择小于 50MB 的模型');
      return;
    }

    // 重置定制状态
    resetAll();

    // 创建对象 URL
    const url = URL.createObjectURL(file);
    setModelUrl(url);
    setModelMeta({
      fileName: file.name,
      meshCount: 0,
      customizableParts: [],
      boundingBox: {
        center: [0, 0, 0],
        size: [0, 0, 0],
      },
    });

    // 重置input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="absolute top-4 left-4 z-10">
      <div className="bg-white rounded-lg shadow-lg p-3">
        <h3 className="text-sm font-semibold text-primary-text mb-2">选择模型</h3>
        
        {/* 预设模型列表 */}
        <div className="space-y-1 mb-2">
          {PRESET_MODELS.map((model) => (
            <button
              key={model.url}
              onClick={() => handleModelSelect(model)}
              className={`
                w-full text-left px-3 py-2 rounded-md text-sm transition-colors
                ${
                  modelUrl === model.url
                    ? 'bg-primary-accent text-white'
                    : 'hover:bg-primary-bg-secondary text-primary-text'
                }
              `}
            >
              {model.name}
            </button>
          ))}
        </div>

        {/* 上传按钮 */}
        <button
          onClick={handleFileUpload}
          className="w-full px-3 py-2 text-sm border border-dashed border-gray-300 rounded-md text-primary-text-secondary hover:border-primary-accent hover:text-primary-accent transition-colors"
        >
          + 上传自定义模型
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".glb,.gltf"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    </div>
  );
};
