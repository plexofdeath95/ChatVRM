import { LowPolyRoom } from "@/model-components/LowPolyRoom";
import ImageFrame from "./imageFrame";
import { useSelectionStore } from "@/stores/selectionStore";
import { useCallback, useEffect, useRef } from "react";
import { OrbitControls as OrbitControlsImpl } from "three-stdlib";

export function SceneContent({ children }: { children?: React.ReactNode }) {
  const selectObject = useSelectionStore((state) => state.selectObject);
  const clearSelection = useSelectionStore((state) => state.clearSelection);

  const onPointerDown = useCallback(
    (e: any) => {
      if (e.intersections.length > 0) {
        console.log(e);
        selectObject(e.intersections[0].object);
      } else {
        clearSelection();
      }
    },
    [selectObject, clearSelection]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        clearSelection();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [clearSelection]);

  return (
    <group onPointerDown={onPointerDown}>
      <LowPolyRoom />
      <ImageFrame position={[-0.4, 0.4, -2.4]} scale={[1, 1, 0.1]} />
    </group>
  );
}
