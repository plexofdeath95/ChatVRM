import { useThree } from "@react-three/fiber";
import { useEffect } from "react";
import { useScreenshotStore } from "@/stores/screenshotStore";
import { useInteractableStore } from "@/stores/interactionStores";

export function SceneScreenshotHandler() {
  const { scene, gl, camera } = useThree();

  useEffect(() => {
    // Handle manual screenshot requests
    const unsubscribe = useScreenshotStore.subscribe((state) => {
      if (state.shouldTakeScreenshot) {
        useScreenshotStore.getState().captureScreenshot(gl, scene, camera);
        useScreenshotStore.getState().takeScreenshot();
      }
    });

    // Set up automatic screenshots every 10 seconds
    const intervalId = setInterval(() => {
      useScreenshotStore.getState().captureScreenshot(gl, scene, camera);
    }, 1000);

    // Clean up both the subscription and interval
    return () => {
      unsubscribe();
      clearInterval(intervalId);
    };
  }, [scene, gl, camera]);

  return null;
} 