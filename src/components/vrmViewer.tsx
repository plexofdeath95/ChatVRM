import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { Vector3 } from "three";
import { buildUrl } from "@/utils/buildUrl";
import { Model } from "@/features/vrmViewer/model";
import { loadVRMAnimation } from "@/lib/VRMAnimation/loadVRMAnimation";
import { OrbitControls as OrbitControlsImpl } from "three-stdlib";

function Environment() {
  const gltf = useGLTF(buildUrl("/low_poly_room.glb"));
  
  return (
    <primitive 
      object={gltf.scene} 
      scale={1} 
      position={[0, 0, 0]}
    />
  );
}

function VrmModel({
  url,
  orbitControlsRef,
}: {
  url: string;
  orbitControlsRef: React.RefObject<OrbitControlsImpl>;
}) {
  const { scene, camera } = useThree();
  const [model, setModel] = useState<Model | null>(null);

  useEffect(() => {
    let m: Model | null = new Model(camera);

    (async () => {
      await m.loadVRM(url);
      if (!m?.vrm) return;

      m.vrm.scene.traverse((obj) => {
        obj.frustumCulled = false;
      });

      scene.add(m.vrm.scene);

      const vrma = await loadVRMAnimation(buildUrl("/idle_loop.vrma"));
      if (vrma) m.loadAnimation(vrma);

      // Give the scene at least a frame to settle
      requestAnimationFrame(() => {
        setTimeout(() => {
          const headNode = m?.vrm?.humanoid.getNormalizedBoneNode("head");
          if (headNode) {
            const headWPos = headNode.getWorldPosition(new Vector3());
            camera.position.set(
              camera.position.x,
              headWPos.y,
              camera.position.z
            );

            if (orbitControlsRef?.current) {
              orbitControlsRef.current.target.set(
                headWPos.x,
                headWPos.y,
                headWPos.z
              );
              orbitControlsRef.current.update();
            }
          }
        }, 50);
      });

      setModel(m);
    })();

    return () => {
      if (m?.vrm) {
        scene.remove(m.vrm.scene);
        m.unLoadVrm();
        m = null;
      }
    };
  }, [url, scene, camera, orbitControlsRef]);

  useFrame((_, delta) => {
    model?.update(delta);
  });

  return null;
}

export default function VrmViewer() {
  const [vrmUrl, setVrmUrl] = useState(buildUrl("/AvatarSample_B.vrm"));
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const orbitControlsRef = useRef<OrbitControlsImpl>(null);

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
          far: 20 
        }}
        className="h-full w-full"
      >
        <ambientLight intensity={1.2} />
        <directionalLight 
          intensity={0.8} 
          position={[2, 2, 1]} 
          castShadow
        />
        <directionalLight 
          intensity={0.3} 
          position={[-2, 2, -1]} 
          color="#ffffff"
        />
        <pointLight 
          position={[0, 2, 0]} 
          intensity={0.5} 
          color="#ffffff"
        />
        <Suspense fallback={null}>
          <Environment />
          <VrmModel url={vrmUrl} orbitControlsRef={orbitControlsRef} />
        </Suspense>
        <OrbitControls
          ref={orbitControlsRef}
          target={[0, 1, 0]}
          enableDamping={true}
          dampingFactor={0.2}
          screenSpacePanning={true}
          enablePan={false}
          maxDistance={7}
          minDistance={1}
        />
      </Canvas>
    </div>
  );
}

useGLTF.preload(buildUrl("/low_poly_room.glb"));
