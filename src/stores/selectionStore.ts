// src/stores/selectionStore.ts

import { create } from "zustand";
import { Object3D } from "three";

type SelectionState = {
  selectedObject: Object3D | null;
  isTransforming: boolean;
  transformMode: "translate" | "rotate" | "scale";
  selectObject: (obj: Object3D | null) => void;
  clearSelection: () => void;
  setIsTransforming: (value: boolean) => void;
  changeTransformMode: (mode: "translate" | "rotate" | "scale") => void;
};

export const useSelectionStore = create<SelectionState>((set) => ({
  selectedObject: null,
  isTransforming: false,
  transformMode: "translate",
  selectObject: (obj) => {
    set({ selectedObject: obj });
  },
  clearSelection: () => {
    set({ selectedObject: null });
  },
  setIsTransforming: (value) => set({ isTransforming: value }),
  changeTransformMode: (mode) => set({ transformMode: mode }),
}));
