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
}

export const ShoeModel: React.FC<ShoeModelProps> = ({
  url,
  selectedPartId: _selectedPartId,
  partConfigs,
  onPartSelect,
  onModelLoaded,
}) => {
  const { scene } = useGLTF(url);
  const groupRef = useRef<THREE.Group>(null);
  const hasCentered = useRef(false);

  // 自动居中模型
  useEffect(() => {
    if (!scene || !groupRef.current || hasCentered.current) return;

    const box = new THREE.Box3().setFromObject(scene);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    // 计算缩放比例，让鞋子大小约为2个单位
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 2 / maxDim;
    groupRef.current.scale.setScalar(scale);

    // 居中：先缩放，再平移
    // 缩放后的中心点
    const scaledCenter = center.clone().multiplyScalar(scale);
    const scaledMinY = box.min.y * scale;

    // 将鞋子放在原点中心，底部在y=0
    groupRef.current.position.x = -scaledCenter.x;
    groupRef.current.position.y = -scaledMinY;
    groupRef.current.position.z = -scaledCenter.z;

    hasCentered.current = true;
  }, [scene]);

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
