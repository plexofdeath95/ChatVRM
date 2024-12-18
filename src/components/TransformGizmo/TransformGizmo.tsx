// src/components/TransformGizmo.tsx

import { useEffect, useRef } from "react";
import { TransformControls } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useSelectionStore } from "@/stores/selectionStore";
import { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";
import { useCameraStore } from "@/stores/cameraStore";

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

  useEffect(() => {
    const controls = transformRef.current;
    if (!controls) return;

    if (selectedObject) {
      controls.attach(selectedObject);
      console.log(
        "TransformGizmo: Attached to",
        selectedObject.name || selectedObject.type
      );
      console.log(selectedObject);
    } else {
      controls.detach();
      console.log("TransformGizmo: Detached");
    }
  }, [selectedObject]);

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
      }}
    />
  );
}
