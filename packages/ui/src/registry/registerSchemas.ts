/**
 * registerSchemas.ts
 *
 * Thin re-export that makes schema registration an explicit dependency when
 * a consumer wants it. `metaRegistry.ts` already registers all schemas as a
 * module-load side-effect — importing this file simply guarantees that
 * side-effect has fired (because importing it pulls in `./metaRegistry`).
 */

import { COMPONENT_META_REGISTRY } from './metaRegistry';

/** True once metaRegistry has been evaluated and shared schemas populated. */
export const COMPONENT_SCHEMAS_REGISTERED = Object.keys(COMPONENT_META_REGISTRY).length > 0;
