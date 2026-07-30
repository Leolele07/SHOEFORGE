import React, { useRef, useState } from 'react';
import type { TextureConfig, TextureTransform } from '@/types';
import { showToast } from '@/components/Toast';

interface TextureUploaderProps {
  onTextureAdd: (texture: TextureConfig) => void;
}

export const TextureUploader: React.FC<TextureUploaderProps> = ({ onTextureAdd }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [textureType, setTextureType] = useState<TextureConfig['type']>('color');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 检查文件类型
    if (!file.type.startsWith('image/')) {
      showToast('请选择图片文件', 'error');
      return;
    }

    // 读取文件为base64
    const reader = new FileReader();
    reader.onload = (event) => {
      const url = event.target?.result as string;
      
      // 创建默认变换
      const defaultTransform: TextureTransform = {
        offsetX: 0,
        offsetY: 0,
        scaleX: 1,
        scaleY: 1,
        rotation: 0,
      };

      // 创建贴图配置
      const textureConfig: TextureConfig = {
        url,
        type: textureType,
        transform: defaultTransform,
      };

      onTextureAdd(textureConfig);
    };
    reader.readAsDataURL(file);

    // 清除input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="texture-uploader">
      <h4 className="texture-section-title">添加贴图</h4>
      
      {/* 贴图类型选择 */}
      <div className="texture-type-selector">
        <label className="texture-type-label">贴图类型：</label>
        <div className="texture-type-buttons">
          <button
            className={`texture-type-btn ${textureType === 'color' ? 'active' : ''}`}
            onClick={() => setTextureType('color')}
          >
            颜色
          </button>
          <button
            className={`texture-type-btn ${textureType === 'normal' ? 'active' : ''}`}
            onClick={() => setTextureType('normal')}
          >
            法线
          </button>
          <button
            className={`texture-type-btn ${textureType === 'roughness' ? 'active' : ''}`}
            onClick={() => setTextureType('roughness')}
          >
            粗糙度
          </button>
          <button
            className={`texture-type-btn ${textureType === 'metalness' ? 'active' : ''}`}
            onClick={() => setTextureType('metalness')}
          >
            金属度
          </button>
        </div>
      </div>

      {/* 上传按钮 */}
      <button
        className="texture-upload-btn"
        onClick={() => fileInputRef.current?.click()}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        选择贴图文件
      </button>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      <style>{`
        .texture-uploader {
          display: flex;
          flex-direction: column;
          gap: var(--sf-space-4);
        }

        .texture-section-title {
          font-size: var(--sf-text-sm);
          font-weight: var(--sf-font-semibold);
          color: var(--sf-text-secondary);
          margin: 0;
        }

        .texture-type-selector {
          display: flex;
          flex-direction: column;
          gap: var(--sf-space-2);
        }

        .texture-type-label {
          font-size: var(--sf-text-xs);
          color: var(--sf-text-secondary);
        }

        .texture-type-buttons {
          display: flex;
          gap: var(--sf-space-1);
          flex-wrap: wrap;
        }

        .texture-type-btn {
          flex: 1;
          min-width: 60px;
          padding: var(--sf-space-1) var(--sf-space-2);
          border: 1px solid var(--sf-border-primary);
          border-radius: var(--sf-radius-sm);
          background: var(--sf-bg-primary);
          color: var(--sf-text-primary);
          font-size: var(--sf-text-xs);
          cursor: pointer;
          transition: all var(--sf-duration-fast) var(--sf-easing-default);
        }

        .texture-type-btn:hover {
          background: var(--sf-bg-secondary);
        }

        .texture-type-btn.active {
          background: var(--sf-color-primary);
          color: var(--sf-bg-primary);
          border-color: var(--sf-color-primary);
        }

        .texture-upload-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--sf-space-2);
          padding: var(--sf-space-3);
          border: 2px dashed var(--sf-border-primary);
          border-radius: var(--sf-radius-md);
          background: var(--sf-bg-primary);
          color: var(--sf-text-primary);
          font-size: var(--sf-text-sm);
          cursor: pointer;
          transition: all var(--sf-duration-fast) var(--sf-easing-default);
        }

        .texture-upload-btn:hover {
          background: var(--sf-bg-secondary);
          border-color: var(--sf-color-primary);
        }
      `}</style>
    </div>
  );
};
