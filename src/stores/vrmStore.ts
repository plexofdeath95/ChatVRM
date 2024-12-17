// useVrmStore.ts
import { create } from "zustand";
import { Model } from "@/features/vrmViewer/model";

type VRMStore = {
  model: Model | null;
  setModel: (model: Model | null) => void;
};

export const useVrmStore = create<VRMStore>((set) => ({
  model: null,
  setModel: (model: Model | null) => set({ model }),
}));
