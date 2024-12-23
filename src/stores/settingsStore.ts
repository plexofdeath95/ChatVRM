import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  openAiApiKey: string;
  setOpenAiApiKey: (key: string) => void;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      openAiApiKey: '',
      setOpenAiApiKey: (key) => set({ openAiApiKey: key }),
    }),
    {
      name: 'settings-storage',
    }
  )
); 