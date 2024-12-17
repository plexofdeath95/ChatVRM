// cameraStore.ts
import { create } from "zustand";
import { OrbitControls as OrbitControlsImpl } from "three-stdlib";

type CameraStore = {
  orbitControlsRef: React.RefObject<OrbitControlsImpl> | null;
  setOrbitControlsRef: (ref: React.RefObject<OrbitControlsImpl>) => void;
};

export const useCameraStore = create<CameraStore>((set) => ({
  orbitControlsRef: null,
  setOrbitControlsRef: (ref) => set({ orbitControlsRef: ref }),
}));
