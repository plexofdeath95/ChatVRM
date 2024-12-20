import { create } from "zustand";
import * as THREE from "three";

type ScreenshotStore = {
  screenshotCamera: THREE.PerspectiveCamera | null;
  lastScreenshot: string | null;
  shouldTakeScreenshot: boolean;
  setScreenshotCamera: (camera: THREE.PerspectiveCamera) => void;
  setLastScreenshot: (screenshot: string | null) => void;
  captureScreenshot: (renderer: THREE.WebGLRenderer, scene: THREE.Scene, mainCamera: THREE.Camera) => void;
  takeScreenshot: () => void;
};

export const useScreenshotStore = create<ScreenshotStore>((set, get) => ({
  screenshotCamera: null,
  lastScreenshot: null,
  shouldTakeScreenshot: false,
  setScreenshotCamera: (camera) => set({ screenshotCamera: camera }),
  setLastScreenshot: (screenshot) => set({ lastScreenshot: screenshot }),
  captureScreenshot: (renderer, scene, mainCamera) => {
    const screenshotCamera = get().screenshotCamera;
    if (!screenshotCamera) return;

    // Store current camera and renderer state
    const currentCamera = mainCamera;
    const currentSize = renderer.getSize(new THREE.Vector2());
    const currentRenderTarget = renderer.getRenderTarget();

    // Set temporary render size for screenshot
    renderer.setSize(1024, 1024);
    
    // Render with screenshot camera
    renderer.render(scene, screenshotCamera);
    
    // Get the base64 image
    const screenshot = renderer.domElement.toDataURL('image/jpeg', 0.8);
    
    // Restore original state
    renderer.setRenderTarget(currentRenderTarget);
    renderer.setSize(currentSize.x, currentSize.y);
    renderer.render(scene, currentCamera);

    // Store the screenshot
    set({ lastScreenshot: screenshot });
  },
  takeScreenshot: () => {
    // This will be called by the SceneScreenshotHandler component
    set({ shouldTakeScreenshot: true });
  }
})); 