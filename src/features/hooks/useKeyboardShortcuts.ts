// src/hooks/useKeyboardShortcuts.ts

import { useEffect } from "react";
import { useSelectionStore } from "@/stores/selectionStore";

export function useKeyboardShortcuts() {
  const changeTransformMode = useSelectionStore(
    (state) => state.changeTransformMode
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case "w":
          changeTransformMode("translate");
          break;
        case "e":
          changeTransformMode("rotate");
          break;
        case "r":
          changeTransformMode("scale");
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [changeTransformMode]);
}
