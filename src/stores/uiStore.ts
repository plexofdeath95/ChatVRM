import { create } from "zustand";

type UIStore = {
  inputRef: React.RefObject<HTMLInputElement | HTMLTextAreaElement> | null;
  setInputRef: (
    ref: React.RefObject<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
};

export const useUI = create<UIStore>((set) => ({
  inputRef: null,
  setInputRef: (ref) => set({ inputRef: ref }),
}));
