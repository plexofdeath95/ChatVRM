import { useEffect, useState } from "react";
import { Model, VRMAnimationDefinition } from "@/features/vrmViewer/model";
import { Vector3, Camera, Scene } from "three";
import { buildUrl } from "@/utils/buildUrl";
import { useVrmStore } from "@/stores/vrmStore";

// Define available animations
export const AVAILABLE_ANIMATIONS: VRMAnimationDefinition[] = [
  // Idle animations
  {
    url: buildUrl("/idle_loop.vrma"),
    name: "idle_loop",
    description: "Default idle animation",
    category: "idle"
  },
  {
    url: buildUrl("/animations/anim_idle_happy.vrma"),
    name: "idle_happy",
    description: "Happy idle animation",
    category: "idle"
  },
  
  // Talking animations
  {
    url: buildUrl("/animations/anim_action_talk01.vrma"),
    name: "talk_01",
    description: "Talking animation variation 1",
    category: "talking"
  },
  {
    url: buildUrl("/animations/anim_action_talk02.vrma"),
    name: "talk_02",
    description: "Talking animation variation 2",
    category: "talking"
  },
  {
    url: buildUrl("/animations/anim_action_talk03.vrma"),
    name: "talk_03",
    description: "Talking animation variation 3",
    category: "talking"
  },
  
  // Emote animations
  {
    url: buildUrl("/animations/anim_action_argue.vrma"),
    name: "argue",
    description: "Arguing gesture",
    category: "emote"
  },
  {
    url: buildUrl("/animations/anim_action_axeswing.vrma"),
    name: "axe_swing",
    description: "Swinging axe motion",
    category: "emote"
  },
  {
    url: buildUrl("/animations/anim_action_clapping.vrma"),
    name: "clapping",
    description: "Clapping hands",
    category: "emote"
  },
  {
    url: buildUrl("/animations/anim_action_cocky.vrma"),
    name: "cocky",
    description: "Cocky attitude pose",
    category: "emote"
  },
  {
    url: buildUrl("/animations/anim_action_headshake.vrma"),
    name: "headshake",
    description: "Shaking head",
    category: "emote"
  },
  {
    url: buildUrl("/animations/anim_action_look.vrma"),
    name: "look",
    description: "Looking around",
    category: "emote"
  },
  {
    url: buildUrl("/animations/anim_action_lookshort.vrma"),
    name: "look_short",
    description: "Quick look",
    category: "emote"
  },
  {
    url: buildUrl("/animations/anim_action_spin.vrma"),
    name: "spin",
    description: "Spinning motion",
    category: "emote"
  },
  {
    url: buildUrl("/animations/anim_action_strong.vrma"),
    name: "strong",
    description: "Strong pose",
    category: "emote"
  },
  {
    url: buildUrl("/animations/anim_action_twerk.vrma"),
    name: "twerk",
    description: "Twerk dance",
    category: "emote"
  },
  {
    url: buildUrl("/animations/anim_action_wave.vrma"),
    name: "wave",
    description: "Waving gesture",
    category: "emote"
  },
  {
    url: buildUrl("/animations/anim_action_yelling.vrma"),
    name: "yelling",
    description: "Yelling motion",
    category: "emote"
  }
];

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

        // Load all available animations
        for (const animDef of AVAILABLE_ANIMATIONS) {
          await m.loadAnimation(animDef);
        }

        // Play default idle animation
        const defaultIdle = AVAILABLE_ANIMATIONS.find(anim => anim.name === "idle_loop");
        if (defaultIdle) {
          m.playAnimation(defaultIdle.name);
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
