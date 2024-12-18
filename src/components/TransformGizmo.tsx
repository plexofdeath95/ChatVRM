import { useEffect, useRef } from "react";
import { TransformControls } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";
import { useSelectionStore } from "@/stores/selectionStore";

type TransformGizmoProps = {
  orbitControlsRef: React.RefObject<OrbitControlsImpl>;
};

export function TransformGizmo({ orbitControlsRef }: TransformGizmoProps) {
  const { selectedObject } = useSelectionStore();
  const transformRef = useRef(null);
  useEffect(() => {
    const controls = transformRef.current as any;
    if (!controls) return;

    const handleMouseDown = () => {
      if (orbitControlsRef.current) {
        orbitControlsRef.current.enabled = false;
      }
    };

    const handleMouseUp = () => {
      if (orbitControlsRef.current) {
        orbitControlsRef.current.enabled = true;
      }
    };

    controls.addEventListener("mouseDown", handleMouseDown);
    controls.addEventListener("mouseUp", handleMouseUp);

    return () => {
      controls.removeEventListener("mouseDown", handleMouseDown);
      controls.removeEventListener("mouseUp", handleMouseUp);
    };
  }, [orbitControlsRef]);

  useEffect(() => {
    const controls = transformRef.current as any;
    if (!controls) return;

    if (selectedObject) {
      controls.attach(selectedObject);

      // Compute bounding box center to position the controls
      const box = new THREE.Box3().setFromObject(selectedObject);
      const center = box.getCenter(new THREE.Vector3());
      controls.position.copy(center);
    } else {
      controls.detach();
    }
  }, [selectedObject]);

  return <TransformControls ref={transformRef} />;
}
