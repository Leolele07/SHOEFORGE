import * as THREE from 'three';
import type { MaterialType, PBRParams, TextureConfig, TextureTransform } from '@/types';
import { MATERIAL_PRESETS } from '@/types';

// 纹理缓存
const textureCache = new Map<string, THREE.Texture>();

/**
 * 获取材质预设参数
 */
export function getMaterialPreset(materialType: MaterialType): PBRParams {
  return MATERIAL_PRESETS[materialType];
}

/**
 * 创建PBR材质
 */
export function createPBRMaterial(
  materialType: MaterialType,
  color: string = '#FFFFFF'
): THREE.MeshStandardMaterial {
  const preset = getMaterialPreset(materialType);
  
  const material = new THREE.MeshStandardMaterial({
    color: new THREE.Color(color),
    roughness: preset.roughness,
    metalness: preset.metalness,
  });
  
  return material;
}

/**
 * 更新材质属性
 */
export function updateMaterialProperties(
  material: THREE.MeshStandardMaterial,
  materialType: MaterialType,
  color?: string,
  roughness?: number,
  metalness?: number
): void {
  const preset = getMaterialPreset(materialType);
  
  // 设置颜色
  if (color) {
    material.color.set(color);
  }
  
  // 设置PBR属性（优先使用用户提供的值，否则使用预设值）
  material.roughness = roughness !== undefined ? roughness : preset.roughness;
  material.metalness = metalness !== undefined ? metalness : preset.metalness;
  
  // 处理透明材质
  if (materialType === 'transparent') {
    material.transparent = true;
    material.opacity = 0.5;
    material.depthWrite = false;
    material.side = THREE.DoubleSide;
  } else {
    material.transparent = false;
    material.opacity = 1;
    material.depthWrite = true;
    material.side = THREE.FrontSide;
  }
  
  // 标记材质需要更新
  material.needsUpdate = true;
}

/**
 * 应用贴图到材质
 */
export function applyTextureToMaterial(
  material: THREE.MeshStandardMaterial,
  textureConfig: TextureConfig
): void {
  const texture = loadTexture(textureConfig.url);
  
  // 应用贴图变换
  applyTextureTransform(texture, textureConfig.transform);
  
  // 根据贴图类型应用到不同通道
  switch (textureConfig.type) {
    case 'color':
      material.map = texture;
      break;
    case 'normal':
      material.normalMap = texture;
      material.normalScale = new THREE.Vector2(1, 1);
      break;
    case 'roughness':
      material.roughnessMap = texture;
      break;
    case 'metalness':
      material.metalnessMap = texture;
      break;
  }
  
  material.needsUpdate = true;
}

/**
 * 移除贴图
 */
export function removeTextureFromMaterial(
  material: THREE.MeshStandardMaterial,
  textureType: 'color' | 'normal' | 'roughness' | 'metalness'
): void {
  switch (textureType) {
    case 'color':
      material.map = null;
      break;
    case 'normal':
      material.normalMap = null;
      material.normalScale = new THREE.Vector2(1, 1);
      break;
    case 'roughness':
      material.roughnessMap = null;
      break;
    case 'metalness':
      material.metalnessMap = null;
      break;
  }
  
  material.needsUpdate = true;
}

/**
 * 加载纹理
 */
function loadTexture(url: string): THREE.Texture {
  // 检查缓存
  if (textureCache.has(url)) {
    return textureCache.get(url)!;
  }
  
  // 创建纹理加载器
  const loader = new THREE.TextureLoader();
  const texture = loader.load(url);
  
  // 设置默认包装模式
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  
  // 缓存纹理
  textureCache.set(url, texture);
  
  return texture;
}

/**
 * 应用贴图变换
 */
function applyTextureTransform(
  texture: THREE.Texture,
  transform: TextureTransform
): void {
  // 设置偏移
  texture.offset.set(transform.offsetX, transform.offsetY);
  
  // 设置缩放
  texture.repeat.set(transform.scaleX, transform.scaleY);
  
  // 设置旋转（弧度）
  texture.rotation = transform.rotation * (Math.PI / 180);
  
  // 设置旋转中心
  texture.center.set(0.5, 0.5);
  
  texture.needsUpdate = true;
}

/**
 * 清除纹理缓存
 */
export function clearTextureCache(): void {
  textureCache.forEach((texture) => {
    texture.dispose();
  });
  textureCache.clear();
}
