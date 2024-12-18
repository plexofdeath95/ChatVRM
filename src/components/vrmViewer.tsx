// vrmViewer.tsx
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { buildUrl } from "@/utils/buildUrl";
import { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { useLoadVrmModel } from "@/features/vrmViewer/useLoadVrmModel";
import { LowPolyRoom } from "@/model-components/LowPolyRoom";
import { useCameraStore } from "@/stores/cameraStore";
import ImageFrame from "./imageFrame";
import { useSelectionStore } from "@/stores/selectionStore";
import { TransformGizmo } from "./TransformGizmo/TransformGizmo";
import { SceneContent } from "./SceneContent";
import { useKeyboardShortcuts } from "@/features/hooks/useKeyboardShortcuts";
function VrmModel({
  url,
  orbitControlsRef,
}: {
  url: string;
  orbitControlsRef: React.RefObject<OrbitControlsImpl>;
}) {
  const { scene, camera } = useThree();
  const model = useLoadVrmModel({ url, scene, camera, orbitControlsRef });

  useFrame((_, delta) => {
    model?.update(delta);
  });

  return null;
}

export default function VrmViewer() {
  const [vrmUrl, setVrmUrl] = useState(buildUrl("/jin_ai16z_wif_hat.vrm"));
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const orbitControlsRef = useRef<OrbitControlsImpl>(null);

  const setOrbitControlsRef = useCameraStore(
    (state) => state.setOrbitControlsRef
  );

  useEffect(() => {
    setOrbitControlsRef(orbitControlsRef);
  }, [setOrbitControlsRef, orbitControlsRef]);

  const handleDrop = useCallback((event: DragEvent) => {
    event.preventDefault();
    const files = event.dataTransfer?.files;
    if (!files) return;

    const file = files[0];
    if (!file) return;

    const file_type = file.name.split(".").pop();
    if (file_type === "vrm") {
      const blob = new Blob([file], { type: "application/octet-stream" });
      const url = window.URL.createObjectURL(blob);
      setVrmUrl(url);
    }
  }, []);

  const handleDragOver = useCallback((event: DragEvent) => {
    event.preventDefault();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener("dragover", handleDragOver);
    canvas.addEventListener("drop", handleDrop);

    return () => {
      canvas.removeEventListener("dragover", handleDragOver);
      canvas.removeEventListener("drop", handleDrop);
    };
  }, [handleDrop, handleDragOver]);

  useKeyboardShortcuts();

  return (
    <div className="absolute top-0 left-0 w-screen h-[100svh] -z-10">
      <Canvas
        ref={canvasRef}
        camera={{
          position: [2, 4, 4],
          fov: 20,
          near: 0.1,
          far: 500,
        }}
        className="h-full w-full"
      >
        <ambientLight intensity={1.2} />
        <directionalLight intensity={0.8} position={[2, 2, 1]} castShadow />
        <directionalLight
          intensity={0.3}
          position={[-2, 2, -1]}
          color="#ffffff"
        />
        <pointLight position={[0, 2, 0]} intensity={0.5} color="#ffffff" />
        <VrmModel url={vrmUrl} orbitControlsRef={orbitControlsRef} />
        <Suspense fallback={null}>
          <SceneContent />
        </Suspense>
        <TransformGizmo />
        <OrbitControls
          ref={orbitControlsRef}
          target={[0, 1, 0]}
          enableDamping={true}
          dampingFactor={0.2}
          screenSpacePanning={true}
          enablePan={true}
          maxDistance={20}
          minDistance={1}
        />
      </Canvas>
    </div>
  );
}
