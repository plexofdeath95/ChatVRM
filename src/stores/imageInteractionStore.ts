import { create } from "zustand";

// just needs to store the genearted description

export const useImageInteractionStore = create<{
  description: string;
  setDescription: (description: string) => void;
}>((set) => ({
  description: "",
  setDescription: (description) => set({ description }),
}));

