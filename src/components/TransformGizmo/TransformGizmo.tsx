// src/components/TransformGizmo.tsx

import { useEffect, useRef } from "react";
import { TransformControls } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useSelectionStore } from "@/stores/selectionStore";
import { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";
import { useCameraStore } from "@/stores/cameraStore";
import { useInteractableStore } from "@/stores/interactionStores";

type TransformGizmoProps = {
  orbitControlsRef: React.RefObject<OrbitControlsImpl>;
};

export function TransformGizmo() {
  const selectedObject = useSelectionStore((state) => state.selectedObject);
  const setIsTransforming = useSelectionStore(
    (state) => state.setIsTransforming
  );
  const transformMode = useSelectionStore((state) => state.transformMode);

  const orbitControlsRef = useCameraStore((state) => state.orbitControlsRef);

  const transformRef = useRef<any>(null);
  const { addObject, updateObject, updateNeighbors, setLastInteracted } = useInteractableStore();

  useEffect(() => {
    const controls = transformRef.current;
    if (!controls) return;

    if (selectedObject) {
      controls.attach(selectedObject);
      console.log(
        "TransformGizmo: Attached to",
        selectedObject.name || selectedObject.type
      );
      const objectMetadata = {
        id: selectedObject.name,
        position: selectedObject.position,
        rotation: selectedObject.rotation,
        recentlyInteracted: true,
        neighbors: [],
      };
      addObject(objectMetadata);
      console.log(selectedObject);
    } else {
      controls.detach();
      console.log("TransformGizmo: Detached");
    }
  }, [addObject, selectedObject]);

  return (
    <TransformControls
      ref={transformRef}
      mode={transformMode}
      onMouseDown={(e) => {
        setIsTransforming(true);
        if (orbitControlsRef?.current) {
          orbitControlsRef.current.enabled = false;
        }
      }}
      onMouseUp={(e) => {
        setIsTransforming(false);
        if (orbitControlsRef?.current) {
          orbitControlsRef.current.enabled = true;
        }
        if (selectedObject) {
          const objectMetadata = {
            id: selectedObject.name,
            position: selectedObject.position,
            rotation: selectedObject.rotation,
            recentlyInteracted: true,
            neighbors: [],
          };
          updateObject(selectedObject.name, objectMetadata);
          updateNeighbors();
          setLastInteracted(selectedObject.name);
        }
      }}
    />
  );
}
