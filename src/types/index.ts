// ── 部件标识 ──
export type PartId = string & { readonly __brand: 'PartId' };

// ── 材质类型枚举 ──
export type MaterialType =
  | 'leather'      // 皮革
  | 'mesh'         // 网面
  | 'suede'        // 麂皮
  | 'canvas'       // 帆布
  | 'patent'       // 光面
  | 'metallic';    // 金属

// ── 部件分组 ──
export type PartGroup = 
  | 'upper'        // 鞋面
  | 'midsole'      // 中底
  | 'outsole'      // 外底
  | 'tongue'       // 鞋舌
  | 'lace'         // 鞋带
  | 'lining'       // 内衬
  | 'heel'         // 后跟
  | 'swoosh'       // 标志
  | 'other';       // 其他

// ── 单个部件的定制配置 ──
export interface PartConfig {
  partId: PartId;
  color: string;            // Hex 颜色 #RRGGBB
  materialType: MaterialType;
  roughness?: number;       // 0-1, 仅高级模式
  metalness?: number;       // 0-1, 仅高级模式
  visible: boolean;
}

// ── 完整方案 ──
export interface DesignPreset {
  id: string;
  name: string;
  createdAt: string;        // ISO 8601
  modelFileName: string;
  thumbnail?: string;       // Base64 缩略图
  parts: PartConfig[];
}

// ── 模型元数据（GLB 解析结果） ──
export interface ModelMetadata {
  fileName: string;
  meshCount: number;
  customizableParts: PartInfo[];
  boundingBox: {
    center: [number, number, number];
    size: [number, number, number];
  };
}

export interface PartInfo {
  partId: PartId;
  name: string;             // 显示名，如"鞋面"、"鞋舌"、"中底"
  meshName: string;         // GLB 中的原始节点名
  defaultColor: string;
  defaultMaterial: MaterialType;
  group: PartGroup;         // 部件分组
}

// ── PBR 材质参数 ──
export interface PBRParams {
  roughness: number;
  metalness: number;
  normalScale: number;
  color?: string;
}

// ── 相机预设 ──
export type CameraPreset = 'rotateLeft' | 'rotateRight' | 'top' | 'bottom' | 'free';

// ── UI 面板类型 ──
export type PanelType = 'parts' | 'color' | 'material' | null;

// ── 模型加载错误类型 ──
export interface ModelLoadError {
  type: 'UNSUPPORTED_FORMAT' | 'CORRUPTED_FILE' | 'TOO_LARGE' | 'UNKNOWN';
  message: string;
  retryable: boolean;
}

// ── WebGL 错误类型 ──
export interface WebGLError {
  type: 'NOT_SUPPORTED' | 'CONTEXT_LOST';
  message: string;
}

// ── 预设颜色方案 ──
export const PRESET_COLORS = [
  '#FFFFFF', '#000000', '#FF0000', '#00FF00',
  '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF',
  '#FFA500', '#800080', '#008000', '#FFC0CB',
  '#808080', '#C0C0C0', '#800000', '#808000',
  '#008080', '#000080', '#FFD700', '#4B0082',
];

// ── 材质预设库 ──
export const MATERIAL_PRESETS: Record<MaterialType, PBRParams> = {
  leather: { roughness: 0.8, metalness: 0.1, normalScale: 1.0 },
  mesh: { roughness: 0.9, metalness: 0.0, normalScale: 0.5 },
  suede: { roughness: 0.95, metalness: 0.0, normalScale: 0.8 },
  canvas: { roughness: 0.85, metalness: 0.0, normalScale: 0.6 },
  patent: { roughness: 0.2, metalness: 0.3, normalScale: 0.3 },
  metallic: { roughness: 0.3, metalness: 0.9, normalScale: 0.4 },
};

// ── 材质显示名称 ──
export const MATERIAL_NAMES: Record<MaterialType, string> = {
  leather: '皮革',
  mesh: '网面',
  suede: '麂皮',
  canvas: '帆布',
  patent: '光面',
  metallic: '金属',
};

// ── 材质描述 ──
export const MATERIAL_DESCRIPTIONS: Record<MaterialType, string> = {
  leather: '经典皮革质感，适合正装鞋',
  mesh: '透气网面，适合运动鞋',
  suede: '柔软麂皮，质感细腻',
  canvas: '轻便帆布，休闲风格',
  patent: '亮面处理，时尚感强',
  metallic: '金属光泽，未来感十足',
};

// ── 部件分组显示名称 ──
export const PART_GROUP_NAMES: Record<PartGroup, string> = {
  upper: '鞋面',
  midsole: '中底',
  outsole: '外底',
  tongue: '鞋舌',
  lace: '鞋带',
  lining: '内衬',
  heel: '后跟',
  swoosh: '标志',
  other: '其他',
};
