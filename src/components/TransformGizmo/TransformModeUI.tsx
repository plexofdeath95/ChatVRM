// src/components/TransformModeUI.tsx

import { useSelectionStore } from "@/stores/selectionStore";
import { LuRotate3D, LuMove3D, LuScale3D } from "react-icons/lu";

export function TransformModeUI() {
  const selectedObject = useSelectionStore((state) => state.selectedObject);
  const transformMode = useSelectionStore((state) => state.transformMode);
  const changeTransformMode = useSelectionStore(
    (state) => state.changeTransformMode
  );

  if (!selectedObject) return null;

  const buttonStyle = {
    padding: "0.75rem",
    borderRadius: "50%",
    margin: "0 0.5rem",
    backgroundColor: "#444",
    color: "#fff",
    transition: "background-color 0.2s ease",
  };

  const activeButtonStyle = {
    backgroundColor: "#FACC15",
    color: "#000",
  };

  return (
    <div
      id="transform-mode-ui"
      style={{
        display: "inline-flex",
        justifyContent: "center",
        alignItems: "center",
        width: "auto",
        padding: "1rem",
        backgroundColor: "rgba(115, 178, 189, 0.5)",
        borderRadius: "12px",
      }}
      className={`self-center`}
    >
      <button
        onClick={() => changeTransformMode("translate")}
        style={{
          ...buttonStyle,
          ...(transformMode === "translate" ? activeButtonStyle : {}),
        }}
      >
        <LuMove3D style={{ width: "1rem", height: "auto" }} />
      </button>
      <button
        onClick={() => changeTransformMode("rotate")}
        style={{
          ...buttonStyle,
          ...(transformMode === "rotate" ? activeButtonStyle : {}),
        }}
      >
        <LuRotate3D style={{ width: "1rem", height: "auto" }} />
      </button>
      <button
        onClick={() => changeTransformMode("scale")}
        style={{
          ...buttonStyle,
          ...(transformMode === "scale" ? activeButtonStyle : {}),
        }}
      >
        <LuScale3D style={{ width: "1rem", height: "auto" }} />
      </button>
    </div>
  );
}
