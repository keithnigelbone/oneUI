/**
 * Global QA component inspector flag.
 * Disabled in production builds regardless of value.
 * Override in dev with VITE_QA_COMPONENT_INSPECTOR=false in .env
 */
export const QA_COMPONENT_INSPECTOR =
  !import.meta.env.PROD &&
  (import.meta.env.VITE_QA_COMPONENT_INSPECTOR ?? 'true') !== 'false'
