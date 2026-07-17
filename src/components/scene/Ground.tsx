import React from 'react';

interface GroundProps {
  visible?: boolean;
}

export const Ground: React.FC<GroundProps> = ({ visible = true }) => {
  if (!visible) return null;

  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.005, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial
          color="#e8e8e8"
          roughness={0.95}
          metalness={0}
        />
      </mesh>
      <gridHelper args={[30, 30, '#cccccc', '#e0e0e0']} position={[0, 0, 0]} />
    </>
  );
};
