import { useEffect, useState } from "react";
import { Model } from "@/features/vrmViewer/model";
import { Vector3, Camera, Scene } from "three";
import { loadVRMAnimation } from "@/lib/VRMAnimation/loadVRMAnimation";
import { buildUrl } from "@/utils/buildUrl";
import { useVrmStore } from "@/stores/vrmStore";

type UseLoadVrmModelParams = {
  url: string;
  scene: Scene;
  camera: Camera;
  orbitControlsRef?: React.RefObject<any>;
};

export function useLoadVrmModel({
  url,
  scene,
  camera,
  orbitControlsRef,
}: UseLoadVrmModelParams) {
  const [model, setModel] = useState<Model | null>(null);

  useEffect(() => {
    let m: Model | null = new Model(camera);

    (async () => {
      try {
        await m.loadVRM(url);
        if (!m?.vrm) return;

        m.vrm.scene.traverse((obj) => {
          obj.frustumCulled = false;
        });

        m.vrm.scene.position.set(0, 0.15, 0);

        scene.add(m.vrm.scene);

        const vrma = await loadVRMAnimation(buildUrl("/idle_loop.vrma"));
        if (vrma) {
          m.loadAnimation(vrma);
        }

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
        useVrmStore.getState().setModel(m);
      } catch (error) {
        console.error("Failed to load VRM:", error);
        useVrmStore.getState().setModel(null);
      }
    })();

    return () => {
      if (m?.vrm) {
        scene.remove(m.vrm.scene);
        m.unLoadVrm();
        m = null;
        useVrmStore.getState().setModel(null);
      }
    };
  }, [url, scene, camera, orbitControlsRef]);

  return model;
}
