/**
 * Wraps the app in a Convex client and applies the selected brand/sub-brand/mode
 * (from brandStore) via BrandInjector. Picks a sensible default brand on first
 * load. Replaces the old --ui-* boot path.
 */
import { useEffect, useMemo, type ReactNode } from 'react'
import { ConvexProvider, ConvexReactClient, useQuery } from 'convex/react'
import { useValue } from '@tldraw/state-react'
import { api } from '@oneui/convex'

import { BrandInjector } from './BrandInjector'
import { getBrandAtom, setBrandId } from './brandStore'

const DEFAULT_BRAND_SLUG = 'jio-default'

function readConvexUrl(): string | undefined {
  const env = import.meta.env as Record<string, string | undefined>
  return (
    env.VITE_CONVEX_URL ??
    env.CONVEX_URL ??
    env.STORYBOOK_CONVEX_URL ??
    env.NEXT_PUBLIC_CONVEX_URL
  )
}

export function BrandShell({ children }: { children: ReactNode }) {
  const client = useMemo(() => {
    const url = readConvexUrl()
    return url ? new ConvexReactClient(url) : null
  }, [])

  // No Convex configured → render children with the static semantic-token
  // fallback (components still paint, just unbranded).
  if (!client) return <>{children}</>

  return (
    <ConvexProvider client={client}>
      <BrandShellInner>{children}</BrandShellInner>
    </ConvexProvider>
  )
}

function BrandShellInner({ children }: { children: ReactNode }) {
  const sel = useValue('brand selection', () => getBrandAtom().get(), [])
  const brands = useQuery(api.brands.list)

  // Resolve a default brand once the list loads (or if the persisted id is stale).
  useEffect(() => {
    if (!brands?.length) return
    if (!sel.brandId || !brands.some((b) => b._id === sel.brandId)) {
      const def = brands.find((b) => b.slug === DEFAULT_BRAND_SLUG) ?? brands[0]
      if (def) setBrandId(def._id)
    }
  }, [brands, sel.brandId])

  // Keep the document mode attribute in sync (also set by setMode on change).
  useEffect(() => {
    document.documentElement.setAttribute('data-mode', sel.mode)
  }, [sel.mode])

  // Until a brand resolves, render unbranded (fallback semantic tokens).
  if (!sel.brandId) return <>{children}</>

  return (
    <BrandInjector brandId={sel.brandId} subBrandId={sel.subBrandId || undefined} theme={sel.mode}>
      {children}
    </BrandInjector>
  )
}
