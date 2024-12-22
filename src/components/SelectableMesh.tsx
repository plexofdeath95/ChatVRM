import React, { forwardRef, useEffect, useState } from 'react';
import { Mesh } from 'three';
import { useSelectionStore } from '@/stores/selectionStore';
import { HoverableMaterial } from './TransformGizmo/HoverableMaterial';
import * as THREE from 'three';

interface SelectableMeshProps {
  geometry: THREE.BufferGeometry;
  material: THREE.Material;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  name?: string;
  children?: React.ReactNode;
}

export const SelectableMesh = forwardRef<Mesh, SelectableMeshProps>(({
  geometry,
  material,
  position,
  rotation,
  scale,
  name,
  children,
  ...props
}, ref) => {
  const [isHovered, setIsHovered] = useState(false);
  const selectObject = useSelectionStore(state => state.selectObject);
  const selectedObject = useSelectionStore(state => state.selectedObject);
  const isSelected = selectedObject?.uuid === (ref as React.RefObject<Mesh>)?.current?.uuid;

  // Extract color and map from any material type
  const materialColor = (material as any).color?.getHex() || "#ffffff";
  const materialMap = (material as any).map || null;

  return (
    <mesh
      ref={ref}
      geometry={geometry}
      position={position}
      rotation={rotation}
      scale={scale}
      name={name}
      onPointerOver={() => setIsHovered(true)}
      onPointerOut={() => setIsHovered(false)}
      onClick={(e) => {
        e.stopPropagation();
        selectObject(e.object);
      }}
      {...props}
    >
      <HoverableMaterial
        map={materialMap}
        color={materialColor}
        hovered={isHovered || isSelected}
        borderColor={isSelected ? "#00ff00" : "#ffffff"}
        borderWidth={0.02}
      />
    </mesh>
  );
});

SelectableMesh.displayName = 'SelectableMesh'; 