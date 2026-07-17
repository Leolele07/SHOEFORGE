import { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useUIStore } from '@/store/uiStore';

// 鞋子中心点
const SHOE_CENTER = new THREE.Vector3(0, 1, 0);

// 相机位置配置
const CAMERA_POSITIONS: Record<string, THREE.Vector3> = {
  front:     new THREE.Vector3(-5, 1.2, 0),
  side:      new THREE.Vector3(0, 1.2, 5),
  sideRight: new THREE.Vector3(0, 1.2, -5),
  back:      new THREE.Vector3(5, 1.2, 0),
  top:       new THREE.Vector3(0.01, 6, 0.01),
  bottom:    new THREE.Vector3(0.01, -3, 0.01),
  free:      new THREE.Vector3(3, 2.5, 3),
};

interface CameraControllerProps {
  controlsRef: React.RefObject<any>;
}

export const CameraController: React.FC<CameraControllerProps> = ({ controlsRef }) => {
  const { camera } = useThree();
  const presetCamera = useUIStore((s) => s.presetCamera);

  const targetPos = useRef(new THREE.Vector3(3, 2.5, 3));
  const isAnimating = useRef(false);

  // 更新OrbitControls设置
  useEffect(() => {
    if (!controlsRef.current) return;
    const controls = controlsRef.current;

    // 所有视角都支持：左键平移、滚轮缩放
    controls.enablePan = true;
    controls.enableZoom = true;
    controls.mouseButtons = {
      LEFT: THREE.MOUSE.PAN,      // 左键平移
      MIDDLE: THREE.MOUSE.DOLLY,  // 中键缩放
      RIGHT: THREE.MOUSE.ROTATE   // 右键旋转
    };

    if (presetCamera === 'free') {
      // 自由模式：左键旋转，完整360度
      controls.enableRotate = true;
      controls.mouseButtons.LEFT = THREE.MOUSE.ROTATE;
      controls.minPolarAngle = 0;
      controls.maxPolarAngle = Math.PI;
    } else if (presetCamera === 'bottom') {
      // 底部模式：左键旋转，可以从底部旋转查看
      controls.enableRotate = true;
      controls.mouseButtons.LEFT = THREE.MOUSE.ROTATE;
      controls.minPolarAngle = 0;
      controls.maxPolarAngle = Math.PI;
    } else {
      // 固定视角：只能平移和缩放
      controls.enableRotate = false;
    }

    // 确保旋转中心在鞋子中心
    controls.target.copy(SHOE_CENTER);
    controls.update();
  }, [presetCamera, controlsRef]);

  // 动画相机位置
  useEffect(() => {
    const pos = CAMERA_POSITIONS[presetCamera];
    if (!pos) return;
    targetPos.current.copy(pos);
    isAnimating.current = true;
  }, [presetCamera]);

  useFrame(() => {
    if (!isAnimating.current) return;

    camera.position.lerp(targetPos.current, 0.1);
    camera.lookAt(SHOE_CENTER);

    if (camera.position.distanceTo(targetPos.current) < 0.03) {
      camera.position.copy(targetPos.current);
      camera.lookAt(SHOE_CENTER);
      isAnimating.current = false;

      if (controlsRef.current) {
        controlsRef.current.target.copy(SHOE_CENTER);
        controlsRef.current.update();
      }
    }
  });

  return null;
};
