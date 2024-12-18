// src/stores/selectionStore.ts

import { create } from "zustand";
import { Object3D } from "three";

type SelectionState = {
  selectedObject: Object3D | null;
  isTransforming: boolean;
  selectObject: (obj: Object3D | null) => void;
  clearSelection: () => void;
  setIsTransforming: (value: boolean) => void;
};

export const useSelectionStore = create<SelectionState>((set) => ({
  selectedObject: null,
  isTransforming: false,
  selectObject: (obj) => {
    set({ selectedObject: obj });
  },
  clearSelection: () => {
    set({ selectedObject: null });
  },
  setIsTransforming: (value) => set({ isTransforming: value }),
}));
