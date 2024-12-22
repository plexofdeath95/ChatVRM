import { create } from "zustand";

export type OpenAIVoice = "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer";

export const DEFAULT_VOICE: OpenAIVoice = "nova";

interface ImageInteractionState {
  description: string;
  imageUrl: string | null;
  processed: boolean;
  selectedVoice: OpenAIVoice;
  setDescription: (description: string) => void;
  setImageUrl: (url: string | null) => void;
  setProcessed: (processed: boolean) => void;
  setSelectedVoice: (voice: OpenAIVoice) => void;
  reset: () => void;
}

export const useImageInteractionStore = create<ImageInteractionState>((set) => ({
  description: "",
  imageUrl: null,
  processed: false,
  selectedVoice: DEFAULT_VOICE,
  setDescription: (description) => set({ description, processed: false }),
  setImageUrl: (imageUrl) => set({ imageUrl }),
  setProcessed: (processed) => set({ processed }),
  setSelectedVoice: (voice) => set({ selectedVoice: voice }),
  reset: () => set({ description: "", imageUrl: null, processed: false }),
}));

