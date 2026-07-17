import * as THREE from 'three';
import type { MaterialType, PBRParams } from '@/types';
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
 * 创建PBR材质（带程序化纹理）
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

  // 应用程序化纹理
  applyProceduralTextures(material, materialType);
  
  return material;
}

/**
 * 更新材质属性
 */
export function updateMaterialProperties(
  material: THREE.MeshStandardMaterial,
  materialType: MaterialType,
  color?: string
): void {
  const preset = getMaterialPreset(materialType);
  
  if (color) {
    material.color.set(color);
  }
  
  material.roughness = preset.roughness;
  material.metalness = preset.metalness;
  
  // 应用程序化纹理
  applyProceduralTextures(material, materialType);
  
  // 标记材质需要更新
  material.needsUpdate = true;
}

/**
 * 应用程序化纹理
 */
function applyProceduralTextures(
  material: THREE.MeshStandardMaterial,
  materialType: MaterialType
): void {
  // 生成法线贴图
  const normalMap = generateNormalMap(materialType);
  if (normalMap) {
    material.normalMap = normalMap;
    material.normalScale = new THREE.Vector2(
      MATERIAL_PRESETS[materialType].normalScale,
      MATERIAL_PRESETS[materialType].normalScale
    );
  }

  // 生成粗糙度贴图
  const roughnessMap = generateRoughnessMap(materialType);
  if (roughnessMap) {
    material.roughnessMap = roughnessMap;
  }
}

/**
 * 生成程序化法线贴图
 */
function generateNormalMap(materialType: MaterialType): THREE.Texture | null {
  const cacheKey = `normal_${materialType}`;
  if (textureCache.has(cacheKey)) {
    return textureCache.get(cacheKey)!;
  }

  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // 填充基础法线颜色（指向上的法线）
  ctx.fillStyle = '#8080FF';
  ctx.fillRect(0, 0, size, size);

  // 根据材质类型添加纹理细节
  switch (materialType) {
    case 'leather':
      drawLeatherNormal(ctx, size);
      break;
    case 'mesh':
      drawMeshNormal(ctx, size);
      break;
    case 'suede':
      drawSuedeNormal(ctx, size);
      break;
    case 'canvas':
      drawCanvasNormal(ctx, size);
      break;
    case 'patent':
      drawPatentNormal(ctx, size);
      break;
    case 'metallic':
      drawMetallicNormal(ctx, size);
      break;
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  
  textureCache.set(cacheKey, texture);
  return texture;
}

/**
 * 生成程序化粗糙度贴图
 */
function generateRoughnessMap(materialType: MaterialType): THREE.Texture | null {
  const cacheKey = `roughness_${materialType}`;
  if (textureCache.has(cacheKey)) {
    return textureCache.get(cacheKey)!;
  }

  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const preset = MATERIAL_PRESETS[materialType];
  const baseRoughness = Math.floor(preset.roughness * 255);

  // 填充基础粗糙度
  ctx.fillStyle = `rgb(${baseRoughness}, ${baseRoughness}, ${baseRoughness})`;
  ctx.fillRect(0, 0, size, size);

  // 根据材质类型添加粗糙度变化
  switch (materialType) {
    case 'leather':
      drawLeatherRoughness(ctx, size, baseRoughness);
      break;
    case 'mesh':
      drawMeshRoughness(ctx, size, baseRoughness);
      break;
    case 'suede':
      drawSuedeRoughness(ctx, size, baseRoughness);
      break;
    case 'canvas':
      drawCanvasRoughness(ctx, size, baseRoughness);
      break;
    case 'patent':
      drawPatentRoughness(ctx, size, baseRoughness);
      break;
    case 'metallic':
      drawMetallicRoughness(ctx, size, baseRoughness);
      break;
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  
  textureCache.set(cacheKey, texture);
  return texture;
}

// ── 皮革纹理 ──
function drawLeatherNormal(ctx: CanvasRenderingContext2D, size: number): void {
  for (let i = 0; i < 500; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = Math.random() * 4 + 1;
    const angle = Math.random() * Math.PI * 2;
    const nx = Math.cos(angle) * 0.3 + 0.5;
    const ny = Math.sin(angle) * 0.3 + 0.5;
    ctx.fillStyle = `rgb(${Math.floor(nx * 255)}, ${Math.floor(ny * 255)}, 200)`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawLeatherRoughness(ctx: CanvasRenderingContext2D, size: number, base: number): void {
  for (let i = 0; i < 300; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = Math.random() * 6 + 2;
    const variation = Math.random() * 30 - 15;
    const value = Math.max(0, Math.min(255, base + variation));
    ctx.fillStyle = `rgb(${value}, ${value}, ${value})`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ── 网面纹理 ──
function drawMeshNormal(ctx: CanvasRenderingContext2D, size: number): void {
  const gridSize = 20;
  for (let x = 0; x < size; x += gridSize) {
    for (let y = 0; y < size; y += gridSize) {
      const isHole = Math.random() > 0.3;
      if (isHole) {
        ctx.fillStyle = '#8080FF';
        ctx.fillRect(x + 2, y + 2, gridSize - 4, gridSize - 4);
      }
    }
  }
}

function drawMeshRoughness(ctx: CanvasRenderingContext2D, size: number, base: number): void {
  const gridSize = 20;
  for (let x = 0; x < size; x += gridSize) {
    for (let y = 0; y < size; y += gridSize) {
      const isHole = Math.random() > 0.3;
      if (isHole) {
        const value = Math.min(255, base + 40);
        ctx.fillStyle = `rgb(${value}, ${value}, ${value})`;
        ctx.fillRect(x + 2, y + 2, gridSize - 4, gridSize - 4);
      }
    }
  }
}

// ── 麂皮纹理 ──
function drawSuedeNormal(ctx: CanvasRenderingContext2D, size: number): void {
  for (let i = 0; i < 1000; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const nx = Math.random() * 0.2 + 0.4;
    const ny = Math.random() * 0.2 + 0.4;
    ctx.fillStyle = `rgb(${Math.floor(nx * 255)}, ${Math.floor(ny * 255)}, 220)`;
    ctx.fillRect(x, y, 1, 1);
  }
}

function drawSuedeRoughness(ctx: CanvasRenderingContext2D, size: number, base: number): void {
  for (let i = 0; i < 500; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const variation = Math.random() * 20 - 10;
    const value = Math.max(0, Math.min(255, base + variation));
    ctx.fillStyle = `rgb(${value}, ${value}, ${value})`;
    ctx.fillRect(x, y, 2, 2);
  }
}

// ── 帆布纹理 ──
function drawCanvasNormal(ctx: CanvasRenderingContext2D, size: number): void {
  for (let x = 0; x < size; x += 4) {
    for (let y = 0; y < size; y += 4) {
      const isWarp = (x + y) % 8 < 4;
      const nx = isWarp ? 0.6 : 0.4;
      const ny = isWarp ? 0.4 : 0.6;
      ctx.fillStyle = `rgb(${Math.floor(nx * 255)}, ${Math.floor(ny * 255)}, 200)`;
      ctx.fillRect(x, y, 4, 4);
    }
  }
}

function drawCanvasRoughness(ctx: CanvasRenderingContext2D, size: number, base: number): void {
  for (let x = 0; x < size; x += 4) {
    for (let y = 0; y < size; y += 4) {
      const variation = Math.random() * 10 - 5;
      const value = Math.max(0, Math.min(255, base + variation));
      ctx.fillStyle = `rgb(${value}, ${value}, ${value})`;
      ctx.fillRect(x, y, 4, 4);
    }
  }
}

// ── 光面纹理 ──
function drawPatentNormal(_ctx: CanvasRenderingContext2D, _size: number): void {
  // 光面材质几乎没有法线细节
}

function drawPatentRoughness(ctx: CanvasRenderingContext2D, size: number, base: number): void {
  // 添加微小的划痕
  for (let i = 0; i < 20; i++) {
    const x1 = Math.random() * size;
    const y1 = Math.random() * size;
    const x2 = x1 + (Math.random() - 0.5) * 50;
    const y2 = y1 + (Math.random() - 0.5) * 50;
    const value = Math.min(255, base + 30);
    ctx.strokeStyle = `rgb(${value}, ${value}, ${value})`;
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
}

// ── 金属纹理 ──
function drawMetallicNormal(ctx: CanvasRenderingContext2D, size: number): void {
  // 添加微小的划痕和凹痕
  for (let i = 0; i < 50; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = Math.random() * 2 + 0.5;
    const nx = Math.random() * 0.1 + 0.45;
    const ny = Math.random() * 0.1 + 0.45;
    ctx.fillStyle = `rgb(${Math.floor(nx * 255)}, ${Math.floor(ny * 255)}, 230)`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawMetallicRoughness(ctx: CanvasRenderingContext2D, size: number, base: number): void {
  // 添加微小的划痕
  for (let i = 0; i < 30; i++) {
    const x1 = Math.random() * size;
    const y1 = Math.random() * size;
    const x2 = x1 + (Math.random() - 0.5) * 30;
    const y2 = y1 + (Math.random() - 0.5) * 30;
    const value = Math.max(0, base - 20);
    ctx.strokeStyle = `rgb(${value}, ${value}, ${value})`;
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
}

/**
 * 材质类型显示名称映射
 */
export const MATERIAL_DISPLAY_NAMES: Record<MaterialType, string> = {
  leather: '皮革',
  mesh: '网面',
  suede: '麂皮',
  canvas: '帆布',
  patent: '光面',
  metallic: '金属',
};

/**
 * 材质类型描述
 */
export const MATERIAL_DESCRIPTIONS: Record<MaterialType, string> = {
  leather: '经典皮革质感，适合正装鞋',
  mesh: '透气网面，适合运动鞋',
  suede: '柔软麂皮，质感细腻',
  canvas: '轻便帆布，休闲风格',
  patent: '亮面处理，时尚感强',
  metallic: '金属光泽，未来感十足',
};

/**
 * 生成材质预览球体（用于UI展示）
 */
export function createMaterialPreviewSphere(
  materialType: MaterialType,
  size: number = 50
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  // 绘制材质预览球体
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size / 2 - 2;

  // 创建渐变模拟球体
  const gradient = ctx.createRadialGradient(
    centerX - radius * 0.3,
    centerY - radius * 0.3,
    0,
    centerX,
    centerY,
    radius
  );

  // 根据材质类型设置颜色
  let baseColor: string;
  switch (materialType) {
    case 'leather':
      baseColor = '#8B4513';
      break;
    case 'mesh':
      baseColor = '#E0E0E0';
      break;
    case 'suede':
      baseColor = '#DEB887';
      break;
    case 'canvas':
      baseColor = '#F5F5DC';
      break;
    case 'patent':
      baseColor = '#000000';
      break;
    case 'metallic':
      baseColor = '#C0C0C0';
      break;
    default:
      baseColor = '#808080';
  }

  gradient.addColorStop(0, lightenColor(baseColor, 50));
  gradient.addColorStop(0.5, baseColor);
  gradient.addColorStop(1, darkenColor(baseColor, 50));

  // 绘制球体
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.fillStyle = gradient;
  ctx.fill();

  // 添加高光
  const highlightGradient = ctx.createRadialGradient(
    centerX - radius * 0.3,
    centerY - radius * 0.3,
    0,
    centerX - radius * 0.3,
    centerY - radius * 0.3,
    radius * 0.5
  );
  highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
  highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.fillStyle = highlightGradient;
  ctx.fill();

  return canvas;
}

/**
 * 颜色变亮
 */
function lightenColor(color: string, amount: number): string {
  const hex = color.replace('#', '');
  const r = Math.min(255, parseInt(hex.substring(0, 2), 16) + amount);
  const g = Math.min(255, parseInt(hex.substring(2, 4), 16) + amount);
  const b = Math.min(255, parseInt(hex.substring(4, 6), 16) + amount);
  
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

/**
 * 颜色变暗
 */
function darkenColor(color: string, amount: number): string {
  const hex = color.replace('#', '');
  const r = Math.max(0, parseInt(hex.substring(0, 2), 16) - amount);
  const g = Math.max(0, parseInt(hex.substring(2, 4), 16) - amount);
  const b = Math.max(0, parseInt(hex.substring(4, 6), 16) - amount);
  
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}
