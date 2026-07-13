import { create } from 'zustand'
import { NOTIFICATIONS } from '@/sample-app/services/catalog'
import type { AppNotification } from '@/sample-app/services/types'
import type { ThemePreference } from '@/sample-app/utils/resolveTheme'

const THEME_STORAGE_KEY = 'jio-sample-theme'

function readStoredTheme(): ThemePreference {
  if (typeof window === 'undefined') return 'light'
  const stored = localStorage.getItem(THEME_STORAGE_KEY)
  if (stored === 'light' || stored === 'dark' || stored === 'auto') return stored
  return 'light'
}

export type Language = 'en' | 'hi' | 'mr'

interface AppState {
  // Profile
  profileName: string
  profileEmail: string
  profilePhone: string
  setProfile: (name: string, email: string, phone: string) => void

  // Search
  globalSearch: string
  setGlobalSearch: (q: string) => void

  // Cart (devices) + wishlist
  cartCount: number
  addToCart: (qty?: number) => void
  wishlist: string[]
  toggleWishlist: (id: string) => void

  // Saved plans
  savedPlans: string[]
  toggleSavedPlan: (id: string) => void

  // Recharge history (last recharged plan)
  lastRecharge: { planId: string; mobile: string } | null
  setLastRecharge: (planId: string, mobile: string) => void

  // Notifications
  notifications: AppNotification[]
  markNotificationRead: (id: string) => void
  markAllNotificationsRead: () => void
  unreadCount: () => number

  // Rewards
  rewardPoints: number
  redeemReward: (cost: number) => boolean

  // Settings & preferences
  themePreference: ThemePreference
  setThemePreference: (t: ThemePreference) => void
  language: Language
  setLanguage: (l: Language) => void
  pushNotifications: boolean
  smsAlerts: boolean
  emailAlerts: boolean
  dataLimitGb: number
  setPushNotifications: (v: boolean) => void
  setSmsAlerts: (v: boolean) => void
  setEmailAlerts: (v: boolean) => void
  setDataLimitGb: (v: number) => void

  // QA: hover/long-press component inspector (dev only)
  qaComponentInspector: boolean
  setQaComponentInspector: (v: boolean) => void
}

export const useAppStore = create<AppState>((set, get) => ({
  profileName: 'Prathip kattekola',
  profileEmail: 'prathip.kattekola@example.com',
  profilePhone: '+91 98765 43210',
  setProfile: (profileName, profileEmail, profilePhone) =>
    set({ profileName, profileEmail, profilePhone }),

  globalSearch: '',
  setGlobalSearch: (globalSearch) => set({ globalSearch }),

  cartCount: 0,
  addToCart: (qty = 1) => set((s) => ({ cartCount: s.cartCount + qty })),
  wishlist: [],
  toggleWishlist: (id) =>
    set((s) => ({
      wishlist: s.wishlist.includes(id)
        ? s.wishlist.filter((w) => w !== id)
        : [...s.wishlist, id],
    })),

  savedPlans: ['p-239'],
  toggleSavedPlan: (id) =>
    set((s) => ({
      savedPlans: s.savedPlans.includes(id)
        ? s.savedPlans.filter((p) => p !== id)
        : [...s.savedPlans, id],
    })),

  lastRecharge: null,
  setLastRecharge: (planId, mobile) => set({ lastRecharge: { planId, mobile } }),

  notifications: NOTIFICATIONS.map((n) => ({ ...n })),
  markNotificationRead: (id) =>
    set((s) => ({
      notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    })),
  markAllNotificationsRead: () =>
    set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) })),
  unreadCount: () => get().notifications.filter((n) => !n.read).length,

  rewardPoints: 1250,
  redeemReward: (cost) => {
    const { rewardPoints } = get()
    if (rewardPoints < cost) return false
    set({ rewardPoints: rewardPoints - cost })
    return true
  },

  themePreference: readStoredTheme(),
  setThemePreference: (themePreference) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(THEME_STORAGE_KEY, themePreference)
    }
    set({ themePreference })
  },
  language: 'en',
  setLanguage: (language) => set({ language }),
  pushNotifications: true,
  smsAlerts: true,
  emailAlerts: false,
  dataLimitGb: 2,
  setPushNotifications: (pushNotifications) => set({ pushNotifications }),
  setSmsAlerts: (smsAlerts) => set({ smsAlerts }),
  setEmailAlerts: (emailAlerts) => set({ emailAlerts }),
  setDataLimitGb: (dataLimitGb) => set({ dataLimitGb }),

  qaComponentInspector: import.meta.env.DEV && (import.meta.env.VITE_QA_COMPONENT_INSPECTOR ?? 'true') !== 'false',
  setQaComponentInspector: (qaComponentInspector) => set({ qaComponentInspector }),
}))
