// src/components/SceneContent.tsx

import React, { useCallback, useEffect, useRef } from "react";
import { useSelectionStore } from "@/stores/selectionStore";
import { useInteractableStore } from "@/stores/interactionStores";
import { LowPolyRoom } from "@/model-components/LowPolyRoom";
import ImageFrame from "./imageFrame";

export function SceneContent() {
  const selectObject = useSelectionStore((state) => state.selectObject);
  const clearSelection = useSelectionStore((state) => state.clearSelection);
  const isTransforming = useSelectionStore((state) => state.isTransforming);
  const setLastInteracted = useInteractableStore((state) => state.setLastInteracted);

  const isTransformingRef = useRef(isTransforming);

  useEffect(() => {
    isTransformingRef.current = isTransforming;
  }, [isTransforming]);

  const onPointerDown = useCallback(
    (e: any) => {
      setTimeout(() => {
        if (isTransformingRef.current) {
          return;
        }

        e.stopPropagation();

        if (e.intersections.length > 0) {
          const intersectedObject = e.intersections[0].object;

          let parent = intersectedObject;
          while (parent) {
            if (parent.userData.selectable) {
              selectObject(parent);
              //setLastInteracted(parent.name);
              return;
            }
            parent = parent.parent;
          }

          clearSelection();
        } else {
          clearSelection();
        }
      }, 100);
    },
    [selectObject, clearSelection, setLastInteracted]
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
