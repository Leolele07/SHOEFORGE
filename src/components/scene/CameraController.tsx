import { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useUIStore } from '@/store/uiStore';

interface CameraControllerProps {
  controlsRef: React.RefObject<any>;
  shoeCenter?: [number, number, number];
  cameraDistance?: number;
}

export const CameraController: React.FC<CameraControllerProps> = ({
  controlsRef,
  shoeCenter = [0, 1, 0],
  cameraDistance = 5,
}) => {
  const { camera } = useThree();
  const presetCamera = useUIStore((s) => s.presetCamera);

  const targetPos = useRef(new THREE.Vector3(3, 2.5, 3));
  const targetLookAt = useRef(new THREE.Vector3(0, 1, 0));
  const isAnimating = useRef(false);

  const getCameraPosition = (preset: string): { pos: THREE.Vector3; lookAt: THREE.Vector3 } => {
    const cx = shoeCenter[0];
    const cy = shoeCenter[1];
    const cz = shoeCenter[2];
    const lookAt = new THREE.Vector3(cx, cy, cz);
    const d = cameraDistance;

    switch (preset) {
      case 'front':
        return { pos: new THREE.Vector3(cx - d, cy, cz), lookAt };
      case 'side':
        return { pos: new THREE.Vector3(cx, cy, cz + d), lookAt };
      case 'sideRight':
        return { pos: new THREE.Vector3(cx, cy, cz - d), lookAt };
      case 'back':
        return { pos: new THREE.Vector3(cx + d, cy, cz), lookAt };
      case 'top':
        return { pos: new THREE.Vector3(cx + 0.01, cy + d, cz + 0.01), lookAt };
      case 'bottom':
        return { pos: new THREE.Vector3(cx + 0.01, cy - d, cz + 0.01), lookAt };
      case 'free':
        return { pos: new THREE.Vector3(cx + d * 0.7, cy + d * 0.3, cz + d * 0.7), lookAt };
      default:
        return { pos: new THREE.Vector3(cx + d * 0.7, cy + d * 0.3, cz + d * 0.7), lookAt };
    }
  };

  // 更新OrbitControls设置
  useEffect(() => {
    if (!controlsRef.current) return;
    const controls = controlsRef.current;

    controls.enablePan = true;
    controls.enableZoom = true;
    controls.mouseButtons = {
      LEFT: THREE.MOUSE.PAN,
      MIDDLE: THREE.MOUSE.DOLLY,
      RIGHT: THREE.MOUSE.ROTATE
    };

    if (presetCamera === 'free') {
      controls.enableRotate = true;
      controls.enablePan = true;
      controls.mouseButtons = {
        LEFT: THREE.MOUSE.ROTATE,
        MIDDLE: THREE.MOUSE.PAN,
        RIGHT: THREE.MOUSE.DOLLY
      };
      controls.minPolarAngle = 0;
      controls.maxPolarAngle = Math.PI;
    } else if (presetCamera === 'bottom' || presetCamera === 'top') {
      controls.enableRotate = true;
      controls.enablePan = true;
      controls.mouseButtons = {
        LEFT: THREE.MOUSE.ROTATE,
        MIDDLE: THREE.MOUSE.PAN,
        RIGHT: THREE.MOUSE.DOLLY
      };
      controls.minPolarAngle = 0;
      controls.maxPolarAngle = Math.PI;
    } else {
      controls.enableRotate = false;
      controls.enablePan = true;
      controls.mouseButtons = {
        LEFT: THREE.MOUSE.PAN,
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.ROTATE
      };
    }

    const { lookAt } = getCameraPosition(presetCamera);
    controls.target.copy(lookAt);
    controls.update();
  }, [presetCamera, controlsRef, shoeCenter, cameraDistance]);

  // 动画相机位置
  useEffect(() => {
    const { pos, lookAt } = getCameraPosition(presetCamera);
    targetPos.current.copy(pos);
    targetLookAt.current.copy(lookAt);
    isAnimating.current = true;
  }, [presetCamera, shoeCenter, cameraDistance]);

  useFrame(() => {
    if (!isAnimating.current) return;

    camera.position.lerp(targetPos.current, 0.1);
    camera.lookAt(targetLookAt.current);

    if (camera.position.distanceTo(targetPos.current) < 0.03) {
      camera.position.copy(targetPos.current);
      camera.lookAt(targetLookAt.current);
      isAnimating.current = false;

      if (controlsRef.current) {
        controlsRef.current.target.copy(targetLookAt.current);
        controlsRef.current.update();
      }
    }
  });

  return null;
};
