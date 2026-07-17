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
  shoeCenter = [0, 0, 0],
  cameraDistance = 5,
}) => {
  const { camera } = useThree();
  const presetCamera = useUIStore((s) => s.presetCamera);
  const rotateCount = useUIStore((s) => s.rotateCount);

  const targetPos = useRef(new THREE.Vector3());
  const targetLookAt = useRef(new THREE.Vector3());
  const isAnimating = useRef(false);
  const currentStep = useRef(0); // 0=正面, 1=右侧面, 2=背面, 3=左侧面

  // 四个方向的相机位置（垂直于对应的边）
  // 正面(-X) → 右侧面(+Z) → 背面(+X) → 左侧面(-Z)
  const getCameraPositionFromStep = (step: number): THREE.Vector3 => {
    const cx = shoeCenter[0];
    const cy = shoeCenter[1]; // 纯水平视角
    const cz = shoeCenter[2];
    const d = cameraDistance;

    const normalizedStep = ((step % 4) + 4) % 4; // 确保在0-3范围内

    switch (normalizedStep) {
      case 0: // 正面（鞋头方向，-X方向）
        return new THREE.Vector3(cx - d, cy, cz);
      case 1: // 右侧面（+Z方向）
        return new THREE.Vector3(cx, cy, cz + d);
      case 2: // 背面（鞋跟方向，+X方向）
        return new THREE.Vector3(cx + d, cy, cz);
      case 3: // 左侧面（-Z方向）
        return new THREE.Vector3(cx, cy, cz - d);
      default:
        return new THREE.Vector3(cx - d, cy, cz);
    }
  };

  // 初始化视角（正面，鞋头方向）
  useEffect(() => {
    currentStep.current = 0;
    const initPos = getCameraPositionFromStep(0);
    
    camera.position.set(initPos.x, initPos.y, initPos.z);
    camera.lookAt(shoeCenter[0], shoeCenter[1], shoeCenter[2]);
    
    targetPos.current.copy(initPos);
    targetLookAt.current.set(shoeCenter[0], shoeCenter[1], shoeCenter[2]);

    if (controlsRef.current) {
      controlsRef.current.target.set(shoeCenter[0], shoeCenter[1], shoeCenter[2]);
      controlsRef.current.update();
    }
  }, [shoeCenter, cameraDistance, controlsRef]);

  // 处理视角切换
  useEffect(() => {
    const lookAt = new THREE.Vector3(shoeCenter[0], shoeCenter[1], shoeCenter[2]);
    targetLookAt.current.copy(lookAt);

    if (presetCamera === 'rotateLeft') {
      // 向左旋转90度（逆时针）
      currentStep.current = ((currentStep.current - 1) + 4) % 4;
      targetPos.current.copy(getCameraPositionFromStep(currentStep.current));
      isAnimating.current = true;
    } else if (presetCamera === 'rotateRight') {
      // 向右旋转90度（顺时针）
      currentStep.current = (currentStep.current + 1) % 4;
      targetPos.current.copy(getCameraPositionFromStep(currentStep.current));
      isAnimating.current = true;
    } else if (presetCamera === 'top') {
      targetPos.current.set(shoeCenter[0] + 0.01, shoeCenter[1] + cameraDistance, shoeCenter[2] + 0.01);
      isAnimating.current = true;
    } else if (presetCamera === 'bottom') {
      targetPos.current.set(shoeCenter[0] + 0.01, shoeCenter[1] - cameraDistance, shoeCenter[2] + 0.01);
      isAnimating.current = true;
    } else if (presetCamera === 'free') {
      targetPos.current.set(
        shoeCenter[0] + cameraDistance * 0.7,
        shoeCenter[1] + cameraDistance * 0.3,
        shoeCenter[2] + cameraDistance * 0.7
      );
      isAnimating.current = true;
    }
  }, [presetCamera, rotateCount, shoeCenter, cameraDistance]);

  // 更新OrbitControls设置
  useEffect(() => {
    if (!controlsRef.current) return;
    const controls = controlsRef.current;

    controls.enablePan = true;
    controls.enableZoom = true;

    if (presetCamera === 'free') {
      controls.enableRotate = true;
      controls.mouseButtons = {
        LEFT: THREE.MOUSE.ROTATE,
        MIDDLE: THREE.MOUSE.PAN,
        RIGHT: THREE.MOUSE.DOLLY
      };
      controls.minPolarAngle = 0;
      controls.maxPolarAngle = Math.PI;
    } else if (presetCamera === 'bottom' || presetCamera === 'top') {
      controls.enableRotate = true;
      controls.mouseButtons = {
        LEFT: THREE.MOUSE.ROTATE,
        MIDDLE: THREE.MOUSE.PAN,
        RIGHT: THREE.MOUSE.DOLLY
      };
      controls.minPolarAngle = 0;
      controls.maxPolarAngle = Math.PI;
    } else {
      // 转左/转右模式：只能平移和缩放
      controls.enableRotate = false;
      controls.mouseButtons = {
        LEFT: THREE.MOUSE.PAN,
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.ROTATE
      };
    }

    controls.target.copy(targetLookAt.current);
    controls.update();
  }, [presetCamera, controlsRef, shoeCenter, cameraDistance]);

  // 动画相机位置
  useFrame(() => {
    if (!isAnimating.current) return;

    camera.position.lerp(targetPos.current, 0.12);
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
