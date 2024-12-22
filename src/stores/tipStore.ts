import { create } from 'zustand'

interface TipState {
  lastTipAmount: number | null
  processed: boolean
  setLastTipAmount: (amount: number) => void
  setProcessed: (processed: boolean) => void
  clearTip: () => void
}

export const useTipStore = create<TipState>((set) => ({
  lastTipAmount: null,
  processed: false,
  setLastTipAmount: (amount) => set({ lastTipAmount: amount, processed: false }),
  setProcessed: (processed) => set({ processed }),
  clearTip: () => set({ lastTipAmount: null, processed: true })
})) 