/**
 * @oneui/experience-builder-preview
 *
 * The preview slice of the Jio AI Experience Builder Lab. Exports the
 * vendor-free `PreviewExecutor` seam (D-02), the `IframeCspExecutor` MVP
 * de-risk path (separate-origin token-handoff + credential-free Playwright
 * capture), and the PREV-03 lifecycle state machine. The Daytona production
 * executor (Plan 05) drops in behind the same seam.
 */

export { getPreviewExecutor, setPreviewExecutor } from './PreviewExecutor';
export type {
  PreviewProfile,
  RenderInput,
  RenderResult,
  PreviewVerification,
  PreviewVerificationCheck,
  PreviewState,
  PreviewExecutor,
} from './PreviewExecutor';

export {
  IframeCspExecutor,
  publishBundleForRender,
  consumeBundleForRender,
  TOKEN_TTL_MS,
} from './IframeCspExecutor';
export type { IframeCspExecutorOptions } from './IframeCspExecutor';

export { DaytonaExecutor } from './DaytonaExecutor';
export type { DaytonaExecutorOptions } from './DaytonaExecutor';

export {
  nextLifecycleState,
  isLiveState,
  framingForProfile,
  LIFECYCLE_ORDER,
  PROFILE_FRAMING,
  DEFAULT_PROFILES,
} from './lifecycle';
export type { PreviewLifecycleState } from './lifecycle';
