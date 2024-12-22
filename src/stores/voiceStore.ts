import { create } from "zustand";
import { OpenAIVoice } from "./imageInteractionStore";

type VoiceStore = {
  selectedVoice: OpenAIVoice;
  setSelectedVoice: (voice: OpenAIVoice) => void;
}

export const useVoiceStore = create<VoiceStore>()((set) => ({
  selectedVoice: "nova",
  setSelectedVoice: (voice: OpenAIVoice) => set({ selectedVoice: voice }),
})); 