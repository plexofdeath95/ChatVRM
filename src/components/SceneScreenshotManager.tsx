import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useScreenshotStore } from "@/stores/screenshotStore";
import { useInteractableStore } from "@/stores/interactionStores";

export function SceneScreenshotManager() {
  const isInitialized = useRef(false);

  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    // Create perspective camera with wider FOV for better scene coverage
    const screenshotCamera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);
    
    // Position for isometric-style view
    const distance = 6;
    const angle = Math.PI / 4; // 45 degrees
    const height = 4;
    
    // Calculate camera position for isometric view
    screenshotCamera.position.set(
      distance * Math.cos(angle),  // X
      height,                      // Y
      distance * Math.sin(angle)   // Z
    );
    
    // Look at the center of the scene, slightly elevated
    screenshotCamera.lookAt(0, 1, 0);
    
    // Set the camera in the store
    useScreenshotStore.getState().setScreenshotCamera(screenshotCamera);

    return () => {
      useScreenshotStore.getState().setLastScreenshot(null);
    };
  }, []); // Empty dependency array

  return null;
} 