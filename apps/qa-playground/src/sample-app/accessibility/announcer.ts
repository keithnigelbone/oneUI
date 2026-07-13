import { create } from 'zustand'

interface AnnouncerState {
  message: string
  announce: (message: string) => void
}

/**
 * Tiny global store backing a polite ARIA live region. Any component can call
 * `announce()` to push a message that assistive tech will read out.
 */
export const useAnnouncer = create<AnnouncerState>((set) => ({
  message: '',
  announce: (message) => {
    // Reset first so identical consecutive messages still trigger a change.
    set({ message: '' })
    requestAnimationFrame(() => set({ message }))
  },
}))
