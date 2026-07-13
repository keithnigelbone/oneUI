import type { SemanticIconName } from '@/sample-app/types/oneui';

/** Sample app lives under this prefix — only mounted when user opens Sample App Demo. */
export const SAMPLE_APP_BASE = '/demo/jio';

export const ROUTES = {
  home: SAMPLE_APP_BASE,
  plans: `${SAMPLE_APP_BASE}/plans`,
  devices: `${SAMPLE_APP_BASE}/devices`,
  support: `${SAMPLE_APP_BASE}/support`,
  account: `${SAMPLE_APP_BASE}/account`,
  notifications: `${SAMPLE_APP_BASE}/notifications`,
  rewards: `${SAMPLE_APP_BASE}/rewards`,
  accessibility: `${SAMPLE_APP_BASE}/accessibility`,
  coverage: `${SAMPLE_APP_BASE}/coverage`,
  showcase: `${SAMPLE_APP_BASE}/showcase`,
  qaPlayground: '/',
  qaPlaygroundCoverage: '/qa/coverage',
} as const;

export function qaPlaygroundComponentPath(slug: string) {
  return `/c/${slug}` as const;
}

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];

export interface NavEntry {
  path: RoutePath;
  label: string;
  icon: SemanticIconName;
}

/** Primary navigation shown in the header and mobile bottom bar. */
export const PRIMARY_NAV: NavEntry[] = [
  { path: ROUTES.home, label: 'Home', icon: 'home' },
  { path: ROUTES.plans, label: 'Plans', icon: 'smartphone' },
  { path: ROUTES.devices, label: 'Devices', icon: 'tv' },
  { path: ROUTES.rewards, label: 'Rewards', icon: 'star' },
  { path: ROUTES.support, label: 'Support', icon: 'help' },
];

/** Secondary destinations surfaced in the header utility area. */
export const UTILITY_NAV: NavEntry[] = [
  { path: ROUTES.notifications, label: 'Notifications', icon: 'notification' },
  { path: ROUTES.account, label: 'My Account', icon: 'user' },
  { path: ROUTES.accessibility, label: 'Accessibility', icon: 'eye' },
  { path: ROUTES.qaPlayground, label: 'QA Playground', icon: 'grid' },
  { path: ROUTES.coverage, label: 'Coverage', icon: 'info' },
];
