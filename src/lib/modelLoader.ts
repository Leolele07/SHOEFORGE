import * as THREE from 'three';
import type { ModelMetadata, PartInfo, PartId, PartGroup, MaterialType } from '@/types';

/**
 * 从GLB场景中提取模型元数据
 */
export function extractModelMetadata(
  scene: THREE.Scene,
  fileName: string
): ModelMetadata {
  const customizableParts: PartInfo[] = [];
  let meshCount = 0;

  // 计算包围盒
  const boundingBox = new THREE.Box3().setFromObject(scene);
  const center = boundingBox.getCenter(new THREE.Vector3());
  const size = boundingBox.getSize(new THREE.Vector3());

  // 遍历场景，识别可定制部件
  scene.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      meshCount++;
      
      // 识别部件
      const partInfo = identifyPart(child);
      if (partInfo) {
        customizableParts.push(partInfo);
      }
    }
  });

  return {
    fileName,
    meshCount,
    customizableParts,
    boundingBox: {
      center: [center.x, center.y, center.z],
      size: [size.x, size.y, size.z],
    },
  };
}

/**
 * 识别mesh对应的部件类型
 */
function identifyPart(mesh: THREE.Mesh): PartInfo | null {
  const name = mesh.name.toLowerCase();
  
  // 根据mesh名称识别部件类型
  const partGroup = identifyPartGroup(name);
  if (!partGroup) return null;

  // 获取默认颜色
  let defaultColor = '#FFFFFF';
  if (mesh.material instanceof THREE.MeshStandardMaterial) {
    defaultColor = '#' + mesh.material.color.getHexString();
  }

  // 获取默认材质类型
  const defaultMaterial = identifyMaterialType(mesh);

  return {
    partId: mesh.name as PartId,
    name: getPartDisplayName(partGroup),
    meshName: mesh.name,
    defaultColor,
    defaultMaterial,
    group: partGroup,
  };
}

/**
 * 根据mesh名称识别部件分组
 */
function identifyPartGroup(name: string): PartGroup | null {
  const partKeywords: Record<PartGroup, string[]> = {
    upper: ['upper', 'shoe', 'body', 'main', '鞋面', '鞋身'],
    midsole: ['midsole', 'middle', '中底'],
    outsole: ['outsole', 'bottom', 'sole', '外底', '鞋底'],
    tongue: ['tongue', '鞋舌'],
    lace: ['lace', 'string', '鞋带'],
    lining: ['lining', 'inner', '内衬'],
    heel: ['heel', 'back', '后跟'],
    swoosh: ['swoosh', 'logo', '标志', 'logo'],
    other: ['other', 'accessory', '其他'],
  };

  for (const [group, keywords] of Object.entries(partKeywords)) {
    if (keywords.some((keyword) => name.includes(keyword))) {
      return group as PartGroup;
    }
  }

  // 如果无法识别，返回'other'
  return 'other';
}

/**
 * 识别材质类型
 */
function identifyMaterialType(mesh: THREE.Mesh): MaterialType {
  if (!(mesh.material instanceof THREE.MeshStandardMaterial)) {
    return 'leather';
  }

  const material = mesh.material;
  
  // 根据材质属性推断类型
  if (material.metalness > 0.7) {
    return 'metallic';
  }
  
  if (material.roughness < 0.3) {
    return 'patent';
  }
  
  if (material.roughness > 0.8) {
    return 'suede';
  }

  // 默认返回皮革
  return 'leather';
}

/**
 * 获取部件显示名称
 */
function getPartDisplayName(group: PartGroup): string {
  const names: Record<PartGroup, string> = {
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

  return names[group] || '未知部件';
}

/**
 * 自动适配相机位置
 */
export function fitCameraToObject(
  camera: THREE.Camera,
  object: THREE.Object3D,
  controls?: any
) {
  const boundingBox = new THREE.Box3().setFromObject(object);
  const center = boundingBox.getCenter(new THREE.Vector3());
  const size = boundingBox.getSize(new THREE.Vector3());

  const maxDim = Math.max(size.x, size.y, size.z);
  const fov = (camera as THREE.PerspectiveCamera).fov * (Math.PI / 180);
  let cameraZ = Math.abs(maxDim / (2 * Math.tan(fov / 2)));

  // 添加一些边距
  cameraZ *= 1.5;

  camera.position.set(center.x, center.y, center.z + cameraZ);
  camera.lookAt(center);

  if (controls) {
    controls.target.copy(center);
    controls.update();
  }
}
