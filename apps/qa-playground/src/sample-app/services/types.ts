export type PlanCategory = 'popular' | 'data' | 'unlimited' | 'value' | 'annual'

export interface Plan {
  id: string
  name: string
  price: number
  validityDays: number
  dataPerDay: number
  calls: string
  sms: string
  benefits: string[]
  category: PlanCategory
  tag?: string
}

export type DeviceCategory = 'all' | 'smartphone' | 'tablet' | 'router' | 'tv'

export interface Device {
  id: string
  name: string
  brand: string
  price: number
  mrp: number
  rating: number
  ratingCount: number
  image: string
  category: Exclude<DeviceCategory, 'all'>
  highlights: string[]
  inStock: boolean
}

export interface FaqItem {
  id: string
  category: SupportCategory
  question: string
  answer: string
}

export type SupportCategory = 'recharge' | 'devices' | 'account' | 'network'

export type NotificationKind = 'offer' | 'recharge' | 'account' | 'system'

export interface AppNotification {
  id: string
  kind: NotificationKind
  title: string
  message: string
  timestamp: string
  read: boolean
}

export interface Coupon {
  id: string
  code: string
  title: string
  description: string
  expiry: string
  category: string
}

import type { SemanticIconName } from '@oneui/shared';

export interface Reward {
  id: string
  title: string
  description: string
  points: number
  icon: SemanticIconName
}

export type HomeOfferAppearance = 'positive' | 'informative' | 'sparkle'

export interface HomeOffer {
  id: string
  title: string
  tag: string
  appearance: HomeOfferAppearance
}
