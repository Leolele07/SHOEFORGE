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
  const rotateCount = useUIStore((s) => s.rotateCount);

  const targetPos = useRef(new THREE.Vector3());
  const targetLookAt = useRef(new THREE.Vector3());
  const isAnimating = useRef(false);
  const currentAngle = useRef(0);

  // 根据角度计算相机位置（纯水平视角，相机Y=鞋子中心Y）
  const getCameraPositionFromAngle = (angle: number): THREE.Vector3 => {
    const cx = shoeCenter[0];
    const cy = shoeCenter[1]; // 相机Y与鞋子中心Y一致，纯水平视角
    const cz = shoeCenter[2];
    const d = cameraDistance;

    // 绕Y轴旋转，初始位置在+Z方向
    const x = cx + d * Math.sin(angle);
    const z = cz + d * Math.cos(angle);
    return new THREE.Vector3(x, cy, z);
  };

  // 初始化视角（侧面，纯水平）
  useEffect(() => {
    currentAngle.current = 0;
    const initPos = getCameraPositionFromAngle(0);
    camera.position.copy(initPos);
    camera.lookAt(shoeCenter[0], shoeCenter[1], shoeCenter[2]);
    targetPos.current.copy(initPos);
    targetLookAt.current.set(shoeCenter[0], shoeCenter[1], shoeCenter[2]);

    if (controlsRef.current) {
      controlsRef.current.target.set(shoeCenter[0], shoeCenter[1], shoeCenter[2]);
      controlsRef.current.update();
    }
  }, [shoeCenter, cameraDistance]);

  // 处理视角切换
  useEffect(() => {
    // 转左/转右时，lookAt的Y与相机Y一致（纯水平视角）
    const lookAt = new THREE.Vector3(shoeCenter[0], shoeCenter[1], shoeCenter[2]);
    targetLookAt.current.copy(lookAt);

    if (presetCamera === 'rotateLeft') {
      currentAngle.current -= Math.PI / 2;
      targetPos.current.copy(getCameraPositionFromAngle(currentAngle.current));
      isAnimating.current = true;
    } else if (presetCamera === 'rotateRight') {
      currentAngle.current += Math.PI / 2;
      targetPos.current.copy(getCameraPositionFromAngle(currentAngle.current));
      isAnimating.current = true;
    } else if (presetCamera === 'top') {
      targetPos.current.set(shoeCenter[0] + 0.01, shoeCenter[1] + cameraDistance, shoeCenter[2] + 0.01);
      isAnimating.current = true;
    } else if (presetCamera === 'bottom') {
      targetPos.current.set(shoeCenter[0] + 0.01, shoeCenter[1] - cameraDistance, shoeCenter[2] + 0.01);
      isAnimating.current = true;
    } else if (presetCamera === 'free') {
      // 自由模式：移动到斜上方初始位置
      targetPos.current.set(
        shoeCenter[0] + cameraDistance * 0.7,
        shoeCenter[1] + cameraDistance * 0.3,
        shoeCenter[2] + cameraDistance * 0.7
      );
      currentAngle.current = Math.atan2(cameraDistance * 0.7, cameraDistance * 0.7);
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
