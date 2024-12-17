// vrmViewer.tsx
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Box,
  DragControls,
  OrbitControls,
  TransformControls,
  useGLTF,
} from "@react-three/drei";
import { Vector3 } from "three";
import { buildUrl } from "@/utils/buildUrl";
import { Model } from "@/features/vrmViewer/model";
import { loadVRMAnimation } from "@/lib/VRMAnimation/loadVRMAnimation";
import { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { useLoadVrmModel } from "@/features/vrmViewer/useLoadVrmModel";
import { LowPolyRoom } from "@/model-components/LowPolyRoom";
import { useCameraStore } from "@/stores/cameraStore";

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
  const [vrmUrl, setVrmUrl] = useState(buildUrl("/AvatarSample_B.vrm"));
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

  return (
    <div className="absolute top-0 left-0 w-screen h-[100svh] -z-10">
      <Canvas
        ref={canvasRef}
        camera={{
          position: [2, 4, 4],
          fov: 20,
          near: 0.1,
          far: 20,
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
        <Suspense fallback={null}>
          <LowPolyRoom />
          <VrmModel url={vrmUrl} orbitControlsRef={orbitControlsRef} />
          {/* <TransformControls>
            <Box />
          </TransformControls> */}
        </Suspense>
        <OrbitControls
          ref={orbitControlsRef}
          target={[0, 1, 0]}
          enableDamping={true}
          dampingFactor={0.2}
          screenSpacePanning={true}
          enablePan={true}
          maxDistance={12}
          minDistance={1}
        />
      </Canvas>
    </div>
  );
}
