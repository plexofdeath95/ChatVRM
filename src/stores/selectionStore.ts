// src/stores/selectionStore.ts

import { create } from "zustand";
import { Object3D } from "three";

type SelectionState = {
  selectedObject: Object3D | null;
  selectObject: (obj: Object3D | null) => void;
  clearSelection: () => void;
};

export const useSelectionStore = create<SelectionState>((set) => ({
  selectedObject: null,
  selectObject: (obj) => set({ selectedObject: obj }),
  clearSelection: () => set({ selectedObject: null }),
}));
