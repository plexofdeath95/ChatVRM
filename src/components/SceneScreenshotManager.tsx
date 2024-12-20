import { useEffect } from "react";
import * as THREE from "three";
import { useScreenshotStore } from "@/stores/screenshotStore";
import { useInteractableStore } from "@/stores/interactionStores";

export function SceneScreenshotManager() {
  useEffect(() => {
    const screenshotCamera = new THREE.PerspectiveCamera(90, 1, 0.1, 1000);
    
    // Position camera for isometric view
    const distance = 3;
    screenshotCamera.position.set(distance, distance, distance);
    screenshotCamera.lookAt(0, 0, 0);
    
    useScreenshotStore.getState().setScreenshotCamera(screenshotCamera);

    return () => {
      useScreenshotStore.getState().setLastScreenshot(null);
    };
  }, []);

  return null;
} 