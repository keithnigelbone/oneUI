import { Platform } from 'react-native';

const CONVEX_HOST = 'robust-stoat-734.convex.cloud';

/**
 * Convex URL for the native app.
 *
 * - Default: `EXPO_PUBLIC_CONVEX_URL` (cloud deployment).
 * - Android dev override: `EXPO_PUBLIC_CONVEX_URL_ANDROID` (e.g. local Convex via
 *   `adb reverse` — avoids corporate DNS/SSL blocking `*.convex.cloud`).
 */
export function getConvexUrl(): string {
  const cloud = process.env.EXPO_PUBLIC_CONVEX_URL;
  const androidOverride = process.env.EXPO_PUBLIC_CONVEX_URL_ANDROID;

  if (__DEV__ && Platform.OS === 'android' && androidOverride) {
    return androidOverride;
  }

  if (!cloud) {
    throw new Error(
      'EXPO_PUBLIC_CONVEX_URL is not set. Add it to apps/native-components-sample/.env.local.',
    );
  }

  return cloud;
}

/** Used by setup script to patch emulator /etc/hosts when DNS is blocked. */
export const CONVEX_CLOUD_HOST = CONVEX_HOST;
