/**
 * @oneui/experience-builder-registry
 *
 * The deterministic registry slice of the Jio AI Experience Builder Lab.
 * Exposes the single source of truth (Jio web alpha catalog + generated meta)
 * as production-shaped `JioComponentRegistryItem`s and answers membership by
 * EXACT lookup with a typed component-gap path for unregistered components.
 */

export {
  queryRegistry,
  getRegistryItem,
  isRegistered,
  KNOWN_DRIFT_EXCLUSIONS,
  type QueryRegistryFilter,
  type GetRegistryItemResult,
  type JioRegistryItemFound,
  type JioComponentGap,
} from './queryRegistry';
