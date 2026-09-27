import { create } from 'zustand'

type ToastTone = 'success' | 'error'

export interface ToastItem {
  id: number
  message: string
  tone: ToastTone
}

interface ToastState {
  items: ToastItem[]
  show: (message: string, tone?: ToastTone) => void
  dismiss: (id: number) => void
}

let nextToastId = 1

export const useToastStore = create<ToastState>((set) => ({
  items: [],
  show: (message, tone = 'success') => {
    const item = { id: nextToastId++, message, tone }
    set((state) => ({ items: [...state.items, item] }))
    window.setTimeout(() => useToastStore.getState().dismiss(item.id), 3800)
  },
  dismiss: (id) => set((state) => ({ items: state.items.filter((item) => item.id !== id) })),
}))
