// useVrmStore.ts
import { create } from "zustand";
import { Model } from "@/features/vrmViewer/model";

export const availableVrms = [
  {
    name: "ai16z",
    url: "/vrms/jin_ai16z_wif_hat.vrm",
    previewImg: "/vrms/AI16z.webp",
  },
  {
    name: "Klip",
    url: "/vrms/Klip.vrm",
    previewImg: "/vrms/vrms_vrm_thumbs_Klip.webp",
  },
];

type VRMStore = {
  model: Model | null;
  vrmUrl: string;
  setModel: (model: Model | null) => void;
  setVrmUrl: (url: string) => void;
};

export const useVrmStore = create<VRMStore>((set) => ({
  model: null,
  vrmUrl: "/vrms/jin_ai16z_wif_hat.vrm",
  setModel: (model: Model | null) => set({ model }),
  setVrmUrl: (url: string) => set({ vrmUrl: url }),
}));
