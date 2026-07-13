// Build a tldraw store with our custom shape utils + ComponentDef record.

import { createTLStore, defaultBindingUtils, defaultShapeUtils } from 'tldraw'
import { customShapeUtils } from '@/shapes'
import { componentDefValidator } from '@/lib/componentDef'
import { clearPersistedSnapshot, loadSavedSnapshot } from '@/lib/persistence'
import { registerOneUiComponents } from '@/manifest/oneuiManifest'

export function makeStore() {
  // Replace the legacy ui-* library tiles with the One UI manifest. Runs after
  // the legacy shape modules self-register (imported via '@/shapes' above).
  registerOneUiComponents()

  const store = createTLStore({
    // Default shape + binding utils must be paired — arrow bindings reference
    // arrow shape migrations. Our custom utils are layered on top.
    shapeUtils: [...defaultShapeUtils, ...customShapeUtils],
    bindingUtils: [...defaultBindingUtils],
    records: {
      componentDef: {
        scope: 'document',
        validator: componentDefValidator,
      },
    },
  })

  const saved = loadSavedSnapshot()
  if (saved) {
    try {
      store.loadStoreSnapshot(saved as any)
    } catch (err) {
      console.warn('[store] saved snapshot failed schema validation; discarding.', err)
      clearPersistedSnapshot()
    }
  }

  return store
}
