import * as THREE from "three";
import { VRM, VRMLoaderPlugin, VRMUtils } from "@pixiv/three-vrm";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { VRMAnimation } from "../../lib/VRMAnimation/VRMAnimation";
import { loadVRMAnimation } from "@/lib/VRMAnimation/loadVRMAnimation";
import { VRMLookAtSmootherLoaderPlugin } from "@/lib/VRMLookAtSmootherLoaderPlugin/VRMLookAtSmootherLoaderPlugin";
import { LipSync } from "../lipSync/lipSync";
import { EmoteController } from "../emoteController/emoteController";
import { Screenplay } from "../messages/messages";

export interface VRMAnimationDefinition {
  url: string;
  name: string;
  description: string;
  category: 'idle' | 'talking' | 'emote' | 'reaction';
}

/**
 * Class to manage a 3D character
 */
export class Model {
  public vrm?: VRM | null;
  public mixer?: THREE.AnimationMixer;
  public emoteController?: EmoteController;
  private currentAnimation?: { action: THREE.AnimationAction; definition: VRMAnimationDefinition };
  private loadedAnimations: Map<string, { action: THREE.AnimationAction; definition: VRMAnimationDefinition }> = new Map();

  private _lookAtTargetParent: THREE.Object3D;
  private _lipSync?: LipSync;

  constructor(lookAtTargetParent: THREE.Object3D) {
    this._lookAtTargetParent = lookAtTargetParent;
    this._lipSync = new LipSync(new AudioContext());
  }

  public async loadVRM(url: string): Promise<void> {
    const loader = new GLTFLoader();
    loader.register(
      (parser) =>
        new VRMLoaderPlugin(parser, {
          lookAtPlugin: new VRMLookAtSmootherLoaderPlugin(parser),
        })
    );

    const gltf = await loader.loadAsync(url);

    const vrm = (this.vrm = gltf.userData.vrm);
    vrm.scene.name = "VRMRoot";

    VRMUtils.rotateVRM0(vrm);
    this.mixer = new THREE.AnimationMixer(vrm.scene);

    this.emoteController = new EmoteController(vrm, this._lookAtTargetParent);
  }

  public unLoadVrm() {
    if (this.vrm) {
      VRMUtils.deepDispose(this.vrm.scene);
      this.vrm = null;
    }
    this.loadedAnimations.clear();
    this.currentAnimation = undefined;
  }

  /**
   * Load VRM animations
   */
  public async loadAnimation(definition: VRMAnimationDefinition): Promise<void> {
    const { vrm, mixer } = this;
    if (vrm == null || mixer == null) {
      throw new Error("You have to load VRM first");
    }

    try {
      const vrmAnimation = await loadVRMAnimation(definition.url);
      if (vrmAnimation) {
        const clip = vrmAnimation.createAnimationClip(vrm);
        const action = mixer.clipAction(clip);
        this.loadedAnimations.set(definition.name, { action, definition });
        
        // If this is the first animation, play it immediately
        if (this.loadedAnimations.size === 1) {
          action.play();
        }
      }
    } catch (error) {
      console.error(`Failed to load animation ${definition.name}:`, error);
    }
  }

  /**
   * Play a specific animation by name
   */
  public playAnimation(name: string, fadeTime: number = 0.5): void {
    const animation = this.loadedAnimations.get(name);
    if (!animation) {
      console.warn(`Animation ${name} not found`);
      return;
    }

    if (this.currentAnimation) {
      this.currentAnimation.action.fadeOut(fadeTime);
    }

    animation.action.reset().fadeIn(fadeTime).play();
    this.currentAnimation = animation;
  }

  /**
   * Play audio and perform lip sync with appropriate animation
   */
  public async speak(buffer: ArrayBuffer, screenplay: Screenplay) {
    // Play the requested animation if available, otherwise fallback to talking animation
    if (screenplay.animation && this.loadedAnimations.has(screenplay.animation)) {
      this.playAnimation(screenplay.animation);
    } else {
      // Fallback to random talking animation
      const talkingAnimations = Array.from(this.loadedAnimations.values())
        .filter(anim => anim.definition.category === 'talking');
      
      if (talkingAnimations.length > 0) {
        const randomIndex = Math.floor(Math.random() * talkingAnimations.length);
        this.playAnimation(talkingAnimations[randomIndex].definition.name);
      }
    }

    // Play the emotion
    this.emoteController?.playEmotion(screenplay.expression);

    // Wait for audio to finish playing
    await new Promise((resolve) => {
      this._lipSync?.playFromArrayBuffer(buffer, () => {
        // Return to idle_loop animation and neutral expression after speaking
        if (this.loadedAnimations.has("idle_loop")) {
          this.playAnimation("idle_loop");
        }
        this.emoteController?.playEmotion("neutral");
        resolve(true);
      });
    });
  }

  public update(delta: number): void {
    if (this._lipSync) {
      const { volume } = this._lipSync.update();
      this.emoteController?.lipSync("aa", volume);
    }

    this.emoteController?.update(delta);
    this.mixer?.update(delta);
    this.vrm?.update(delta);
  }
}
