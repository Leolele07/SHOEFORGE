import React, { useEffect, useCallback, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useModelStore } from '@/store/modelStore';
import { useCustomizationStore } from '@/store/customizationStore';
import { useUIStore } from '@/store/uiStore';
import { ShoeModel } from './ShoeModel';
import { LoadingOverlay } from './LoadingOverlay';
import { EmptyState } from './EmptyState';
import { CameraPresets } from './CameraPresets';
import { CameraController } from './CameraController';
import { Ground } from './Ground';
import type { PartInfo } from '@/types';

const DEFAULT_MODEL_URL = '/models/shoe.gltf';
const DEFAULT_MODEL_NAME = 'NIKE SPORTS RUNNING CLASSIC.gltf';

// 存储鞋子边界信息，供CameraController使用
let shoeBoundsInfo: { center: THREE.Vector3; size: THREE.Vector3; frontDir: THREE.Vector3; shoeRotation?: number } | null = null;

export const getShoeBoundsInfo = () => shoeBoundsInfo;

const SceneContent: React.FC = () => {
  const presetCamera = useUIStore((s) => s.presetCamera);
  const controlsRef = useRef<any>(null);
  const [shoeCenter, setShoeCenter] = useState<[number, number, number]>([0, 0, 0]);
  const [cameraDistance, setCameraDistance] = useState(5);

  const showGround = !['free', 'bottom'].includes(presetCamera);
  const shoeOffsetY = ['free', 'bottom'].includes(presetCamera) ? 0.5 : 0;

  const handleShoeBounds = useCallback((bounds: { center: THREE.Vector3; size: THREE.Vector3; frontDir: THREE.Vector3 }) => {
    const newCenter: [number, number, number] = [bounds.center.x, bounds.center.y, bounds.center.z];
    setShoeCenter(newCenter);
    shoeBoundsInfo = bounds;

    // 立即更新OrbitControls的target为鞋子中心
    if (controlsRef.current) {
      controlsRef.current.target.set(newCenter[0], newCenter[1], newCenter[2]);
      controlsRef.current.update();
    }

    // 动态计算最佳相机距离
    const maxDim = Math.max(bounds.size.x, bounds.size.y, bounds.size.z);
    const fovRad = 45 * (Math.PI / 180);
    const idealDistance = (maxDim / (2 * Math.tan(fovRad / 2))) * 1.5;
    setCameraDistance(idealDistance);
  }, []);

  return (
    <>
      <color attach="background" args={['#f5f5f5']} />

      <ambientLight intensity={0.6} />
      <directionalLight
        position={[5, 8, 5]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={20}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
      />
      <directionalLight position={[-3, 4, -3]} intensity={0.3} />
      <hemisphereLight args={['#b1e1ff', '#b97a20', 0.3]} />

      <Ground visible={showGround} />

      <OrbitControls
        ref={controlsRef}
        enablePan={true}
        enableZoom={true}
        enableRotate={false}
        minDistance={cameraDistance * 0.3}
        maxDistance={cameraDistance * 3}
      />

      <CameraController controlsRef={controlsRef} shoeCenter={shoeCenter} cameraDistance={cameraDistance} />

      <group position={[0, shoeOffsetY, 0]}>
        <ShoeModelWrapper onShoeBounds={handleShoeBounds} />
      </group>
    </>
  );
};

interface ShoeModelWrapperProps {
  onShoeBounds: (bounds: { center: THREE.Vector3; size: THREE.Vector3; frontDir: THREE.Vector3; shoeRotation?: number }) => void;
}

const ShoeModelWrapper: React.FC<ShoeModelWrapperProps> = ({ onShoeBounds }) => {
  const { modelUrl } = useModelStore();
  const { selectedPartId, partConfigs, selectPart, initPartConfigs } = useCustomizationStore();

  const handleModelLoaded = useCallback((parts: PartInfo[]) => {
    initPartConfigs(parts);
  }, [initPartConfigs]);

  if (!modelUrl) return null;

  return (
    <ShoeModel
      url={modelUrl}
      selectedPartId={selectedPartId}
      partConfigs={partConfigs}
      onPartSelect={selectPart}
      onModelLoaded={handleModelLoaded}
      onShoeBounds={onShoeBounds}
    />
  );
};

export const ShoeScene: React.FC = () => {
  const { modelUrl, isLoading, loadError, setModelUrl, setModelMeta } = useModelStore();

  useEffect(() => {
    if (!modelUrl) {
      setModelUrl(DEFAULT_MODEL_URL);
      setModelMeta({
        fileName: DEFAULT_MODEL_NAME,
        meshCount: 0,
        customizableParts: [],
        boundingBox: { center: [0, 0, 0], size: [0, 0, 0] },
      });
    }
  }, [modelUrl, setModelUrl, setModelMeta]);

  return (
    <div className="scene-container">
      <div className="scene-canvas-wrapper">
        <Canvas
          camera={{ position: [3, 2.5, 3], fov: 45 }}
          gl={{ preserveDrawingBuffer: true }}
          dpr={[1, 2]}
          shadows
        >
          <SceneContent />
        </Canvas>

        {isLoading && <LoadingOverlay />}

        {loadError && (
          <div className="scene-error">
            <div className="scene-error-content">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <h3>加载失败</h3>
              <p>{loadError.message}</p>
              {loadError.retryable && (
                <button
                  onClick={() => useModelStore.getState().setLoadError(null)}
                  className="btn btn-primary btn-md"
                >
                  重新上传
                </button>
              )}
            </div>
          </div>
        )}

        {!modelUrl && !isLoading && !loadError && <EmptyState />}
      </div>

      {modelUrl && (
        <div className="scene-bottom-toolbar">
          <CameraPresets />
        </div>
      )}

      <style>{`
        .scene-container {
          height: 100%;
          display: flex;
          flex-direction: column;
          position: relative;
        }

        .scene-canvas-wrapper {
          flex: 1;
          position: relative;
          overflow: hidden;
        }

        .scene-error {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: var(--sf-bg-overlay);
          z-index: 20;
        }

        .scene-error-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: var(--sf-space-8);
          background-color: var(--sf-bg-primary);
          border-radius: var(--sf-radius-xl);
          box-shadow: var(--sf-shadow-xl);
          max-width: 400px;
        }

        .scene-error-content svg { color: var(--sf-color-error); margin-bottom: var(--sf-space-4); }
        .scene-error-content h3 { font-size: var(--sf-text-lg); font-weight: var(--sf-font-semibold); color: var(--sf-text-primary); margin-bottom: var(--sf-space-2); }
        .scene-error-content p { font-size: var(--sf-text-sm); color: var(--sf-text-secondary); margin-bottom: var(--sf-space-6); }

        .scene-bottom-toolbar {
          position: absolute;
          bottom: var(--sf-space-4);
          left: 50%;
          transform: translateX(-50%);
          z-index: 10;
        }

        @media (max-width: 768px) {
          .scene-bottom-toolbar {
            bottom: calc(var(--sf-bottombar-height) + var(--sf-space-2));
          }
        }
      `}</style>
    </div>
  );
};
