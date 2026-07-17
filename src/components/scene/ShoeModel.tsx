import React, { useRef, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import type { PartId, PartConfig, PartInfo, PartGroup, MaterialType } from '@/types';
import { updateMaterialProperties } from '@/lib/materialPresets';

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

    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.userData = {
          ...child.userData,
          partId: child.name as PartId,
          isShoePart: true,
        };
        child.castShadow = true;
        child.receiveShadow = true;

        const partInfo = identifyPart(child);
        if (partInfo) {
          parts.push(partInfo);
        }
      }
    });

    if (onModelLoaded && parts.length > 0) {
      onModelLoaded(parts);
    }
  }, [scene, onModelLoaded]);

  // 应用材质配置
  useEffect(() => {
    if (!scene || !partConfigs) return;

    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const partId = child.name as PartId;
        const config = partConfigs.get(partId);

        if (config) {
          if (child.material instanceof THREE.MeshStandardMaterial) {
            updateMaterialProperties(child.material, config.materialType, config.color);
            if (config.roughness !== undefined) {
              child.material.roughness = config.roughness;
            }
            if (config.metalness !== undefined) {
              child.material.metalness = config.metalness;
            }
          }
          child.visible = config.visible;
        }
      }
    });
  }, [scene, partConfigs]);

  const handleClick = (event: any) => {
    event.stopPropagation();
    const mesh = event.object as THREE.Mesh;
    const partId = mesh.userData.partId as PartId;
    if (partId) {
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

function identifyPart(mesh: THREE.Mesh): PartInfo | null {
  const name = mesh.name.toLowerCase();
  const partGroup = identifyPartGroup(name);
  if (!partGroup) return null;

  let defaultColor = '#FFFFFF';
  if (mesh.material instanceof THREE.MeshStandardMaterial) {
    defaultColor = '#' + mesh.material.color.getHexString();
  }

  return {
    partId: mesh.name as PartId,
    name: getPartDisplayName(partGroup),
    meshName: mesh.name,
    defaultColor,
    defaultMaterial: identifyMaterialType(mesh),
    group: partGroup,
  };
}

function identifyPartGroup(name: string): PartGroup | null {
  const partKeywords: Record<PartGroup, string[]> = {
    upper: ['upper', 'shoe', 'body', 'main'],
    midsole: ['midsole', 'middle'],
    outsole: ['outsole', 'bottom', 'sole'],
    tongue: ['tongue'],
    lace: ['lace', 'string'],
    lining: ['lining', 'inner'],
    heel: ['heel', 'back'],
    swoosh: ['swoosh', 'logo'],
    other: ['other', 'accessory'],
  };

  for (const [group, keywords] of Object.entries(partKeywords)) {
    if (keywords.some((keyword) => name.includes(keyword))) {
      return group as PartGroup;
    }
  }
  return 'other';
}

function identifyMaterialType(mesh: THREE.Mesh): MaterialType {
  if (!(mesh.material instanceof THREE.MeshStandardMaterial)) return 'leather';
  const material = mesh.material;
  if (material.metalness > 0.7) return 'metallic';
  if (material.roughness < 0.3) return 'patent';
  if (material.roughness > 0.8) return 'suede';
  return 'leather';
}

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
