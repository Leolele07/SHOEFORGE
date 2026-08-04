import React, { useRef, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import type { PartId, PartConfig, PartInfo, PartGroup } from '@/types';
import { updateMaterialProperties, applyTextureToMaterial } from '@/lib/materialPresets';
import { useModelStore } from '@/store/modelStore';

/** 比较两个 PartConfig 是否相同（浅比较关键字段） */
function configsEqual(a: PartConfig | undefined, b: PartConfig | undefined): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  return (
    a.color === b.color &&
    a.materialType === b.materialType &&
    a.roughness === b.roughness &&
    a.metalness === b.metalness &&
    a.visible === b.visible &&
    a.isModified === b.isModified &&
    a.textures === b.textures // 引用比较，store 中已保证每次变更产生新引用
  );
}

interface ShoeModelProps {
  url: string;
  selectedPartId: PartId | null;
  partConfigs: Map<PartId, PartConfig>;
  onPartSelect: (partId: PartId | null) => void;
  onModelLoaded?: (parts: PartInfo[]) => void;
  onShoeBounds?: (bounds: { center: THREE.Vector3; size: THREE.Vector3; frontDir: THREE.Vector3; shoeRotation?: number }) => void;
}

export const ShoeModel: React.FC<ShoeModelProps> = ({
  url,
  selectedPartId: _selectedPartId,
  partConfigs,
  onPartSelect,
  onModelLoaded,
  onShoeBounds,
}) => {
  const { scene } = useGLTF(url);
  const groupRef = useRef<THREE.Group>(null);
  const hasCentered = useRef(false);

  // 自动居中模型，鞋底放在y=0，并自动检测朝向旋转对齐
  useEffect(() => {
    if (!scene || !groupRef.current || hasCentered.current) return;

    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());

    // 计算缩放比例，让鞋子大小约为2个单位
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 2 / maxDim;
    groupRef.current.scale.setScalar(scale);

    // 缩放后的尺寸
    const scaledMinY = box.min.y * scale;

    // ── 自动检测鞋子朝向 ──
    // 策略：在XZ平面中，鞋子长轴是前后方向，短轴是左右方向
    // 找出长轴，然后判断哪端是鞋头（通常更低/更窄）
    let yRotation = 0;

    // 收集所有顶点的XZ分布
    const vertices: THREE.Vector3[] = [];
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh && child.geometry) {
        const posAttr = child.geometry.getAttribute('position');
        if (!posAttr) return;
        for (let i = 0; i < posAttr.count; i++) {
          vertices.push(new THREE.Vector3(
            posAttr.getX(i),
            posAttr.getY(i),
            posAttr.getZ(i)
          ));
        }
      }
    });

    if (vertices.length > 0) {
      // 计算XZ平面上的分布范围
      let minX = Infinity, maxX = -Infinity;
      let minZ = Infinity, maxZ = -Infinity;
      for (const v of vertices) {
        if (v.x < minX) minX = v.x;
        if (v.x > maxX) maxX = v.x;
        if (v.z < minZ) minZ = v.z;
        if (v.z > maxZ) maxZ = v.z;
      }
      const rangeX = maxX - minX;
      const rangeZ = maxZ - minZ;

      if (rangeX > rangeZ) {
        // 鞋子长轴在X方向，旋转90°使长轴对齐Z轴（朝向相机）
        yRotation = Math.PI / 2;
        const midX = (minX + maxX) / 2;
        let frontYSum = 0, frontCount = 0;
        let backYSum = 0, backCount = 0;
        for (const v of vertices) {
          if (v.x < midX) { frontYSum += v.y; frontCount++; }
          else { backYSum += v.y; backCount++; }
        }
        const frontAvgY = frontCount > 0 ? frontYSum / frontCount : 0;
        const backAvgY = backCount > 0 ? backYSum / backCount : 0;
        // 鞋头（更低的一端）应该朝向+Z（朝向相机）
        if (frontAvgY > backAvgY) {
          yRotation = -Math.PI / 2; // 反转
        }
      } else {
        // 鞋子长轴在Z方向，只需判断鞋头朝向
        const midZ = (minZ + maxZ) / 2;
        let frontYSum = 0, frontCount = 0;
        let backYSum = 0, backCount = 0;
        for (const v of vertices) {
          if (v.z < midZ) { frontYSum += v.y; frontCount++; }
          else { backYSum += v.y; backCount++; }
        }
        const frontAvgY = frontCount > 0 ? frontYSum / frontCount : 0;
        const backAvgY = backCount > 0 ? backYSum / backCount : 0;
        if (frontAvgY < backAvgY) {
          // -Z端是鞋头，旋转180°使鞋头朝向+Z
          yRotation = Math.PI;
        }
      }
    }

    // 应用检测到的旋转
    if (Math.abs(yRotation) > 0.001) {
      groupRef.current.rotation.y = yRotation;
    }

    // 重新计算旋转后的包围盒（用于父组件相机定位）
    const rotatedBox = new THREE.Box3().setFromObject(groupRef.current);
    const rotatedSize = rotatedBox.getSize(new THREE.Vector3());
    const rotatedCenter = rotatedBox.getCenter(new THREE.Vector3());

    // 水平居中，垂直方向让鞋底在y=0
    groupRef.current.position.x = -rotatedCenter.x;
    groupRef.current.position.y = -scaledMinY;
    groupRef.current.position.z = -rotatedCenter.z;

    // 通知父组件：鞋子的中心点、实际尺寸和旋转角度
    if (onShoeBounds) {
      const shoeCenter = new THREE.Vector3(0, rotatedSize.y / 2, 0);
      onShoeBounds({ 
        center: shoeCenter, 
        size: rotatedSize, 
        frontDir: new THREE.Vector3(0, 0, 1),
        shoeRotation: yRotation // 输出鞋子的旋转角度
      });
    }

    hasCentered.current = true;
  }, [scene, onShoeBounds]);

  // 遍历场景，以犀牛图层（命名GROUP）为单位组织部件
  useEffect(() => {
    if (!scene) return;

    const parts: PartInfo[] = [];
    const partMeshMap = new Map<PartId, THREE.Mesh[]>();

    // 跳过的容器节点名称（犀牛/Sketchfab导出时的包裹层）
    const SKIP_NAMES = new Set([
      'Sketchfab_model',
      'Collada visual scene group',
      'Scene',
      'RootNode',
      'defaultScene',
    ]);

    /**
     * 查找犀牛图层根节点：
     * 从根往下遍历，跳过已知容器名称和无名节点，
     * 找到第一个包含多个命名子 GROUP 的节点作为图层根。
     */
    function findLayerRoot(obj: THREE.Object3D): THREE.Object3D {
      // 如果当前节点名称在跳过列表中，或者是无名节点，递归到子节点
      if ((SKIP_NAMES.has(obj.name) || !obj.name) && obj.children.length > 0) {
        for (const child of obj.children) {
          const result = findLayerRoot(child);
          if (result !== child) return result;
        }
        // 所有子节点都没找到更好的，继续往下找
        if (obj.children.length === 1) {
          return findLayerRoot(obj.children[0]);
        }
      }

      // 检查当前节点的子节点中，有多少个是命名的 GROUP（不含 mesh 叶子节点）
      const namedGroupChildren = obj.children.filter(
        c => c.name && !SKIP_NAMES.has(c.name) && !(c instanceof THREE.Mesh)
      );

      // 如果有 2 个以上的命名子 GROUP，说明这就是图层根
      if (namedGroupChildren.length >= 2) {
        return obj;
      }

      // 否则继续往下找
      for (const child of obj.children) {
        if (!SKIP_NAMES.has(child.name) && !(child instanceof THREE.Mesh)) {
          return findLayerRoot(child);
        }
      }

      return obj;
    }

    /**
     * 递归收集某个节点下的所有 Mesh
     */
    function collectMeshes(obj: THREE.Object3D, meshes: THREE.Mesh[]) {
      if (obj instanceof THREE.Mesh) {
        meshes.push(obj);
      }
      for (const child of obj.children) {
        collectMeshes(child, meshes);
      }
    }

    const layerRoot = findLayerRoot(scene);

    // 遍历图层根的直接子节点，每个子节点 = 一个犀牛图层 = 一个部件
    for (const layerNode of layerRoot.children) {
      // 收集该图层下所有 mesh
      const meshes: THREE.Mesh[] = [];
      collectMeshes(layerNode, meshes);

      if (meshes.length === 0) continue;

      // 使用图层节点名称作为部件名
      const partName = layerNode.name || `Part_${parts.length}`;
      const partId = partName as PartId;

      // 保存映射
      partMeshMap.set(partId, meshes);

      // 为每个 mesh 设置交互信息和原始材质
      for (const mesh of meshes) {
        // 保存原始材质引用
        let originalMaterial = null;
        if (mesh.material instanceof THREE.MeshStandardMaterial) {
          originalMaterial = mesh.material.clone();
          if (mesh.material.map) originalMaterial.map = mesh.material.map.clone();
          if (mesh.material.normalMap) originalMaterial.normalMap = mesh.material.normalMap.clone();
          if (mesh.material.roughnessMap) originalMaterial.roughnessMap = mesh.material.roughnessMap.clone();
          if (mesh.material.metalnessMap) originalMaterial.metalnessMap = mesh.material.metalnessMap.clone();
        }

        mesh.userData = {
          ...mesh.userData,
          partId,
          isShoePart: true,
          originalMaterial,
        };
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        // 克隆材质以支持独立颜色修改
        if (mesh.material instanceof THREE.Material) {
          mesh.material = mesh.material.clone();
        }
      }

      // 获取默认颜色
      let defaultColor = '#FFFFFF';
      for (const mesh of meshes) {
        const originalMaterial = mesh.userData.originalMaterial;
        if (originalMaterial instanceof THREE.MeshStandardMaterial) {
          defaultColor = '#' + originalMaterial.color.getHexString();
          break;
        }
        if (mesh.material instanceof THREE.MeshStandardMaterial) {
          defaultColor = '#' + mesh.material.color.getHexString();
          break;
        }
      }

      // 识别部件分组
      const partGroup = identifyPartGroup(partName);

      parts.push({
        id: partId,
        name: partGroup?.name || partName,
        group: partGroup?.group || 'other',
        defaultColor,
        meshes,
      });
    }

    // 将映射存储到store，供后续使用
    useModelStore.getState().setPartMeshMap(partMeshMap);

    if (onModelLoaded && parts.length > 0) {
      onModelLoaded(parts);
    }
  }, [scene, onModelLoaded]);

  // 上一次的配置快照，用于增量比较
  const prevConfigsRef = useRef<Map<PartId, PartConfig>>(new Map());

  // 应用材质配置（增量更新：只处理实际变化的部件）
  useEffect(() => {
    if (!scene || !partConfigs) return;

    const partMeshMap = useModelStore.getState().partMeshMap;
    if (!partMeshMap) return;

    const prevConfigs = prevConfigsRef.current;

    // 遍历所有部件配置，找出变化的
    partConfigs.forEach((config, partId) => {
      const prevConfig = prevConfigs.get(partId);

      // 跳过未变化的部件
      if (configsEqual(prevConfig, config)) return;

      const meshes = partMeshMap.get(partId);
      if (!meshes) return;

      // 为该部件的所有mesh应用配置
      for (const mesh of meshes) {
        // 确保材质是MeshStandardMaterial
        if (!(mesh.material instanceof THREE.MeshStandardMaterial)) {
          const oldMaterial = mesh.material;
          mesh.material = new THREE.MeshStandardMaterial();
          if (oldMaterial instanceof THREE.Material && 'color' in oldMaterial) {
            (mesh.material as THREE.MeshStandardMaterial).color = (oldMaterial as any).color;
          }
        }

        const material = mesh.material as THREE.MeshStandardMaterial;

        // 如果未修改，恢复原始材质
        if (!config.isModified) {
          const originalMaterial = mesh.userData.originalMaterial;
          if (originalMaterial instanceof THREE.MeshStandardMaterial) {
            material.color.copy(originalMaterial.color);
            material.roughness = originalMaterial.roughness;
            material.metalness = originalMaterial.metalness;
            material.transparent = originalMaterial.transparent;
            material.opacity = originalMaterial.opacity;
            material.depthWrite = originalMaterial.depthWrite;
            material.side = originalMaterial.side;

            material.map = originalMaterial.map;
            material.normalMap = originalMaterial.normalMap;
            material.roughnessMap = originalMaterial.roughnessMap;
            material.metalnessMap = originalMaterial.metalnessMap;

            material.needsUpdate = true;
          }
          mesh.visible = config.visible;
          continue;
        }

        // 已修改的部件，应用用户配置
        updateMaterialProperties(material, config.materialType, config.color, config.roughness, config.metalness);

        // 处理贴图
        if (config.textures && config.textures.length > 0) {
          material.map = null;
          material.normalMap = null;
          material.roughnessMap = null;
          material.metalnessMap = null;

          for (const textureConfig of config.textures) {
            applyTextureToMaterial(material, textureConfig);
          }
        } else if (config.color === '#FFFFFF') {
          material.map = null;
          material.normalMap = null;
          material.roughnessMap = null;
          material.metalnessMap = null;
        }

        mesh.visible = config.visible;
      }
    });

    // 更新快照
    prevConfigsRef.current = new Map(partConfigs);
  }, [scene, partConfigs]);

  const handleClick = (event: any) => {
    event.stopPropagation();
    const mesh = event.object as THREE.Mesh;
    const partId = mesh.userData.partId as PartId;
    if (partId && partId !== 'unknown') {
      onPartSelect(partId);
    }
  };

  const handlePointerOver = (event: any) => {
    event.stopPropagation();
    document.body.style.cursor = 'pointer';
    const mesh = event.object as THREE.Mesh;
    if (mesh.material instanceof THREE.MeshStandardMaterial) {
      mesh.material.emissive.set(0x333333);
    }
  };

  const handlePointerOut = (event: any) => {
    document.body.style.cursor = 'default';
    const mesh = event.object as THREE.Mesh;
    if (mesh.material instanceof THREE.MeshStandardMaterial) {
      mesh.material.emissive.set(0x000000);
    }
  };

  return (
    <group ref={groupRef}>
      <primitive
        object={scene}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      />
    </group>
  );
};

function identifyPartGroup(name: string): { name: string; group: PartGroup } | null {
  const partKeywords: Record<string, { name: string; group: PartGroup }> = {
    // ── 犀牛图层名（英文）→ 中文名 + 分组 ──
    'Midsole': { name: '中底', group: 'midsole' },
    'Outsole': { name: '外底', group: 'outsole' },
    'Upper': { name: '鞋面', group: 'upper' },
    'Lining': { name: '内衬', group: 'lining' },
    'Heel_TPU': { name: '后跟TPU', group: 'heel' },
    'Heel': { name: '后跟', group: 'heel' },
    'Tongue_Inner': { name: '鞋舌内', group: 'tongue' },
    'Tongue_Outer': { name: '鞋舌外', group: 'tongue' },
    'Tongue': { name: '鞋舌', group: 'tongue' },
    'Lace_Edge': { name: '鞋带边', group: 'lace' },
    'Lace_Outer': { name: '鞋带外', group: 'lace' },
    'Lace': { name: '鞋带', group: 'lace' },
    'Eyelet': { name: '鞋眼', group: 'lace' },
    'Metal_Cap': { name: '金属帽', group: 'accessory' },
    'LOGO_outside': { name: 'LOGO外', group: 'swoosh' },
    'LOGO_inside': { name: 'LOGO内', group: 'swoosh' },
    'Swoosh': { name: '标志', group: 'swoosh' },
    'Logo': { name: '标志', group: 'swoosh' },
    // ── 中文名（兼容中文命名的犀牛文件）──
    '中底': { name: '中底', group: 'midsole' },
    '外底': { name: '外底', group: 'outsole' },
    '鞋面': { name: '鞋面', group: 'upper' },
    '内衬': { name: '内衬', group: 'lining' },
    '内里': { name: '内衬', group: 'lining' },
    '后跟': { name: '后跟', group: 'heel' },
    '鞋舌': { name: '鞋舌', group: 'tongue' },
    '鞋带': { name: '鞋带', group: 'lace' },
    '鞋带边': { name: '鞋带边', group: 'lace' },
    '鞋带外': { name: '鞋带外', group: 'lace' },
    '鞋眼片': { name: '鞋眼', group: 'lace' },
    '金属帽': { name: '金属帽', group: 'accessory' },
    'LOGO外': { name: 'LOGO外', group: 'swoosh' },
    'LOGO内': { name: 'LOGO内', group: 'swoosh' },
    '橡胶鞋底': { name: '外底', group: 'outsole' },
    '后跟TPU': { name: '后跟TPU', group: 'heel' },
    '鞋舌内': { name: '鞋舌内', group: 'tongue' },
    '鞋舌外': { name: '鞋舌外', group: 'tongue' },
  };

  // 直接匹配
  if (partKeywords[name]) {
    return partKeywords[name];
  }

  // 关键词匹配
  const lowerName = name.toLowerCase();
  for (const [key, value] of Object.entries(partKeywords)) {
    if (lowerName.includes(key.toLowerCase())) {
      return value;
    }
  }

  return { name: name, group: 'other' };
}
