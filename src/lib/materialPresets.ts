import * as THREE from 'three';
import type { MaterialType, PBRParams, TextureConfig, TextureTransform } from '@/types';
import { MATERIAL_PRESETS } from '@/types';

/**
 * PBR材质工具库
 *
 * 本模块提供Three.js PBR材质的创建、更新和贴图管理功能。
 *
 * PBR参数说明：
 * - roughness（粗糙度）：0-1，控制表面粗糙程度
 *   - 0：完全光滑（如镜面）
 *   - 1：完全粗糙（如磨砂表面）
 * - metalness（金属度）：0-1，控制金属感
 *   - 0：非金属（如塑料、木材）
 *   - 1：纯金属（如钢铁、铝）
 * - normalMap（法线贴图）：模拟表面凹凸细节，不改变几何形状
 * - roughnessMap（粗糙度贴图）：控制不同区域的粗糙度
 * - metalnessMap（金属度贴图）：控制不同区域的金属感
 */

/** 模块级单例 TextureLoader，避免每次调用都 new */
const textureLoader = new THREE.TextureLoader();

/**
 * 获取材质预设参数
 * @param materialType - 材质类型（如皮革、网面、金属等）
 * @returns PBR参数预设值
 */
export function getMaterialPreset(materialType: MaterialType): PBRParams {
  return MATERIAL_PRESETS[materialType];
}

/**
 * 创建PBR材质
 * @param materialType - 材质类型
 * @param color - 初始颜色（默认白色）
 * @returns 新创建的MeshStandardMaterial实例
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
 *
 * @param material - 要更新的材质
 * @param materialType - 材质类型
 * @param color - 颜色（可选）
 * @param roughness - 粗糙度（可选，优先使用用户值）
 * @param metalness - 金属度（可选，优先使用用户值）
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
    // 仅在当前是 DoubleSide（可能是之前设的透明材质）时恢复为 FrontSide
    // 不覆盖用户手动设置的其他 side 值
    if (material.side === THREE.DoubleSide) {
      material.side = THREE.FrontSide;
    }
  }

  // 标记材质需要更新
  material.needsUpdate = true;
}

/**
 * 应用贴图到材质
 * 使用单例 TextureLoader 加载，并通过回调处理加载完成和错误
 */
export function applyTextureToMaterial(
  material: THREE.MeshStandardMaterial,
  textureConfig: TextureConfig
): void {
  const texture = textureLoader.load(
    textureConfig.url,
    // onLoad: 贴图加载完成后标记更新
    (loadedTexture) => {
      loadedTexture.wrapS = THREE.RepeatWrapping;
      loadedTexture.wrapT = THREE.RepeatWrapping;
      applyTextureTransform(loadedTexture, textureConfig.transform);
      material.needsUpdate = true;
    },
    // onProgress: 暂不处理
    undefined,
    // onError: 加载失败时记录日志
    (error) => {
      console.error('贴图加载失败:', textureConfig.url, error);
    }
  );

  // 设置默认包装模式（在加载完成前先设置，避免黑块闪烁）
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;

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
 * 移除贴图并释放 GPU 资源
 */
export function removeTextureFromMaterial(
  material: THREE.MeshStandardMaterial,
  textureType: 'color' | 'normal' | 'roughness' | 'metalness'
): void {
  // 先释放旧贴图的 GPU 资源
  const disposeMap = (map: THREE.Texture | null) => {
    if (map) map.dispose();
  };

  switch (textureType) {
    case 'color':
      disposeMap(material.map);
      material.map = null;
      break;
    case 'normal':
      disposeMap(material.normalMap);
      material.normalMap = null;
      material.normalScale = new THREE.Vector2(1, 1);
      break;
    case 'roughness':
      disposeMap(material.roughnessMap);
      material.roughnessMap = null;
      break;
    case 'metalness':
      disposeMap(material.metalnessMap);
      material.metalnessMap = null;
      break;
  }

  material.needsUpdate = true;
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
 * 释放材质上的所有贴图资源
 * 在部件被移除或模型被卸载时调用
 */
export function disposeMaterialTextures(material: THREE.MeshStandardMaterial): void {
  if (material.map) { material.map.dispose(); material.map = null; }
  if (material.normalMap) { material.normalMap.dispose(); material.normalMap = null; }
  if (material.roughnessMap) { material.roughnessMap.dispose(); material.roughnessMap = null; }
  if (material.metalnessMap) { material.metalnessMap.dispose(); material.metalnessMap = null; }
  material.needsUpdate = true;
}
