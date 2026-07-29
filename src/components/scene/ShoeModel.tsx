import React, { useRef, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import type { PartId, PartConfig, PartInfo, PartGroup } from '@/types';
import { updateMaterialProperties, applyTextureToMaterial } from '@/lib/materialPresets';

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

  // 遍历场景，为每个mesh添加交互性
  useEffect(() => {
    if (!scene) return;

    const parts: PartInfo[] = [];

    // 创建partId到mesh的映射
    const partMeshMap = new Map<string, THREE.Mesh[]>();

    // 递归遍历场景，找到所有mesh及其所属的部件组
    function traverseWithPartId(obj: THREE.Object3D, currentPartId: string | null) {
      if (obj instanceof THREE.Mesh) {
        // 确定partId：优先使用当前部件组ID，否则使用mesh名称
        const partId = currentPartId || obj.name || 'unknown';
        
        // 将mesh添加到对应的部件组
        if (!partMeshMap.has(partId)) {
          partMeshMap.set(partId, []);
        }
        partMeshMap.get(partId)!.push(obj);
        
        // 保存原始材质引用（用于恢复原始）
        const originalMaterial = obj.material instanceof THREE.MeshStandardMaterial 
          ? obj.material.clone() 
          : null;
        
        // 设置userData
        obj.userData = {
          ...obj.userData,
          partId: partId,
          isShoePart: true,
          originalMaterial: originalMaterial,  // 保存原始材质
        };
        obj.castShadow = true;
        obj.receiveShadow = true;
        
        // 克隆材质以支持独立颜色修改
        if (obj.material && obj.material instanceof THREE.Material) {
          obj.material = obj.material.clone();
        }
      }
      
      // 检查子节点是否是部件组（有名称且包含mesh的组）
      for (const child of obj.children) {
        if (child.name && child.name !== 'Sketchfab_model' && child.name !== 'Collada visual scene group') {
          // 这是一个部件组
          traverseWithPartId(child, child.name);
        } else {
          // 继续使用当前的partId
          traverseWithPartId(child, currentPartId);
        }
      }
    }
    
    traverseWithPartId(scene, null);
    
    // 为每个部件组创建PartInfo
    partMeshMap.forEach((meshes, partId) => {
      // 尝试识别部件组
      const partGroup = identifyPartGroup(partId);
      
      // 获取默认颜色（从第一个mesh）
      let defaultColor = '#FFFFFF';
      for (const mesh of meshes) {
        if (mesh.material instanceof THREE.MeshStandardMaterial) {
          defaultColor = '#' + mesh.material.color.getHexString();
          break;
        }
      }
      
      parts.push({
        id: partId as PartId,
        name: partGroup?.name || partId,
        group: partGroup?.group || 'accessory',
        defaultColor,
        meshes,
      });
    });
    
    // 将映射存储到全局变量，供后续使用
    (window as any).partMeshMap = partMeshMap;

    if (onModelLoaded && parts.length > 0) {
      onModelLoaded(parts);
    }
  }, [scene, onModelLoaded]);

  // 应用材质配置
  useEffect(() => {
    if (!scene || !partConfigs) return;

    const partMeshMap = (window as any).partMeshMap as Map<string, THREE.Mesh[]>;
    if (!partMeshMap) return;

    // 遍历所有部件配置
    partConfigs.forEach((config, partId) => {
      const meshes = partMeshMap.get(partId);
      if (!meshes) return;
      
      // 为该部件的所有mesh应用配置
      for (const mesh of meshes) {
        // 确保材质是MeshStandardMaterial
        if (!(mesh.material instanceof THREE.MeshStandardMaterial)) {
          // 如果不是，创建一个新的标准材质
          const oldMaterial = mesh.material;
          mesh.material = new THREE.MeshStandardMaterial();
          // 复制原材质的颜色
          if (oldMaterial instanceof THREE.Material && 'color' in oldMaterial) {
            (mesh.material as THREE.MeshStandardMaterial).color = (oldMaterial as any).color;
          }
        }
        
        const material = mesh.material as THREE.MeshStandardMaterial;
        
        // 如果未修改，恢复原始材质
        if (!config.isModified) {
          const originalMaterial = mesh.userData.originalMaterial;
          if (originalMaterial instanceof THREE.MeshStandardMaterial) {
            material.copy(originalMaterial);
          }
          mesh.visible = config.visible;
          continue;
        }
        
        // 已修改的部件，应用用户配置
        // 更新材质属性（包括颜色）
        updateMaterialProperties(material, config.materialType, config.color, config.roughness, config.metalness);
        
        // 应用贴图（如果有用户上传的贴图）
        if (config.textures && config.textures.length > 0) {
          // 清除旧贴图
          material.map = null;
          material.normalMap = null;
          material.roughnessMap = null;
          material.metalnessMap = null;
          
          // 应用用户上传的贴图
          for (const textureConfig of config.textures) {
            applyTextureToMaterial(material, textureConfig);
          }
        }
        // 如果没有用户上传的贴图，保留原始贴图
        
        mesh.visible = config.visible;
      }
    });
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
    '中底': { name: '中底', group: 'midsole' },
    '鞋带边': { name: '鞋带边', group: 'lace' },
    '鞋眼片': { name: '鞋眼片', group: 'lace' },
    '鞋面': { name: '鞋面', group: 'upper' },
    '金属帽': { name: '金属帽', group: 'accessory' },
    '内里': { name: '内里', group: 'lining' },
    '橡胶鞋底': { name: '橡胶鞋底', group: 'outsole' },
    'LOGO外': { name: 'LOGO外', group: 'swoosh' },
    'LOGO内': { name: 'LOGO内', group: 'swoosh' },
    '鞋带外': { name: '鞋带外', group: 'lace' },
    '后跟TPU': { name: '后跟TPU', group: 'heel' },
    '鞋舌内': { name: '鞋舌内', group: 'tongue' },
    '鞋舌外': { name: '鞋舌外', group: 'tongue' },
    'Upper': { name: '鞋面', group: 'upper' },
    'Midsole': { name: '中底', group: 'midsole' },
    'Outsole': { name: '外底', group: 'outsole' },
    'Tongue': { name: '鞋舌', group: 'tongue' },
    'Lace': { name: '鞋带', group: 'lace' },
    'Lining': { name: '内衬', group: 'lining' },
    'Heel': { name: '后跟', group: 'heel' },
    'Swoosh': { name: '标志', group: 'swoosh' },
    'Logo': { name: '标志', group: 'swoosh' },
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
