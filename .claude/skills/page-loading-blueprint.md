# Page Loading Blueprint

Copy-paste architecture for building performant pages in OneUI Studio.
Every new page or route should follow this structure.

---

## Blueprint: Standard Platform Page

```tsx
// app/(platform)/brands/[brandId]/overview/page.tsx

import { Suspense } from 'react';
import { BrandOverviewHeader } from './BrandOverviewHeader';
import { BrandOverviewHeaderSkeleton } from './BrandOverviewHeaderSkeleton';
import { PalettePanel } from './PalettePanel';
import { PalettePanelSkeleton } from './PalettePanelSkeleton';
import { TypographyPanel } from './TypographyPanel';
import { TypographyPanelSkeleton } from './TypographyPanelSkeleton';
import { SurfacePanel } from './SurfacePanel';
import { SurfacePanelSkeleton } from './SurfacePanelSkeleton';

// Params come from the URL — no query needed for the ID itself
export default function BrandOverviewPage({
  params,
}: {
  params: { brandId: string };
}) {
  return (
    <div className="space-y-6">
      {/* ZONE 1: Header — depends on brand name + basic info */}
      <Suspense fallback={<BrandOverviewHeaderSkeleton />}>
        <BrandOverviewHeader brandId={params.brandId} />
      </Suspense>

      {/* ZONE 2: Data panels — each fetches independently, in parallel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Suspense fallback={<PalettePanelSkeleton />}>
          <PalettePanel brandId={params.brandId} />
        </Suspense>
        <Suspense fallback={<TypographyPanelSkeleton />}>
          <TypographyPanel brandId={params.brandId} />
        </Suspense>
        <Suspense fallback={<SurfacePanelSkeleton />}>
          <SurfacePanel brandId={params.brandId} />
        </Suspense>
      </div>
    </div>
  );
}
```

### Why This Works

1. **Three Suspense boundaries** = three parallel data streams.
   Header, palettes, typography, and surfaces all start fetching
   the moment the page mounts — not sequentially.

2. **brandId from URL params** = no parent query needed.
   The ID is known immediately from the route, eliminating the
   "fetch parent to get child ID" waterfall.

3. **Each skeleton matches its panel** = no layout shift when
   data arrives. The skeleton occupies the same space.

4. **No single giant Suspense** = if one panel is slow (e.g.,
   surfaces doing complex computation), the others appear
   independently.

---

## Blueprint: Data Panel Component

```tsx
// app/(platform)/brands/[brandId]/overview/PalettePanel.tsx
'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';

interface PalettePanelProps {
  brandId: string;
}

export function PalettePanel({ brandId }: PalettePanelProps) {
  // Single query — this component owns this subscription
  const data = useQuery(api.foundations.getBrandOverviewData, {
    brandId: brandId as Id<'brands'>,
  });

  // undefined = loading → the parent Suspense shows skeleton
  // In Convex with Suspense integration, useQuery suspends automatically.
  // Without Suspense integration, handle manually:
  if (data === undefined) return null; // Suspense fallback handles this
  if (data === null) return <EmptyState message="Brand not found" />;

  return (
    <div className="rounded-lg border bg-card p-4">
      <h3 className="text-sm font-medium text-muted-foreground mb-3">
        Color Palettes
      </h3>
      {/* Render palette swatches from data.palettes */}
      <PaletteSwatchGrid palettes={data.palettes} />
    </div>
  );
}
```

### Key Pattern: useQuery Loading States

Convex `useQuery` has three states:

| Return value | Meaning                        | What to show         |
|--------------|--------------------------------|----------------------|
| `undefined`  | Query is loading (first mount) | Skeleton (via Suspense or manual check) |
| `null`       | Query returned null (not found)| Empty state / error  |
| `data`       | Query resolved with data       | Actual content       |

NEVER do this:

```tsx
// ❌ WRONG — extra state variable, stale data, double renders
const [isLoading, setIsLoading] = useState(true);
const data = useQuery(api.brands.get, { brandId });
useEffect(() => {
  if (data !== undefined) setIsLoading(false);
}, [data]);
```

---

## Blueprint: Skeleton Component

Every data panel needs a matching skeleton. The skeleton must:

1. Match the exact dimensions and layout of the loaded content
2. Use `animate-pulse` on `bg-muted` blocks
3. Never use a centered spinner
4. Provide structural hierarchy (heading skeleton, content skeleton)

```tsx
// app/(platform)/brands/[brandId]/overview/PalettePanelSkeleton.tsx

export function PalettePanelSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-4">
      {/* Title skeleton — matches h3 dimensions */}
      <div className="h-4 w-28 bg-muted animate-pulse rounded mb-3" />

      {/* Swatch grid skeleton — matches PaletteSwatchGrid */}
      <div className="grid grid-cols-10 gap-1">
        {Array.from({ length: 10 }, (_, i) => (
          <div
            key={i}
            className="aspect-square bg-muted animate-pulse rounded-sm"
          />
        ))}
      </div>

      {/* Second row */}
      <div className="grid grid-cols-10 gap-1 mt-2">
        {Array.from({ length: 10 }, (_, i) => (
          <div
            key={i}
            className="aspect-square bg-muted animate-pulse rounded-sm"
          />
        ))}
      </div>
    </div>
  );
}
```

---

## Blueprint: Layout with Token Injection

```tsx
// app/(platform)/layout.tsx

import '@/styles/tokens/dimensions/scale.css';
import '@/styles/tokens/motion.css';
import '@/styles/tokens/typography.css';
import '@/styles/tokens/primitives.css';
import '@/styles/tokens/semantic.css';
import '@/styles/tokens/light.css';
import '@/styles/tokens/density/default.css';
// ↑ All static — bundled at build time, zero runtime cost

import { Suspense } from 'react';
import { PlatformShell } from '@/components/platform/PlatformShell';
import { FoundationStyleBridge } from '@/components/platform/FoundationStyleBridge';
import { PlatformSkeleton } from '@/components/platform/PlatformSkeleton';

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Theme hydration — runs before React, prevents FOUC */}
      <script
        dangerouslySetInnerHTML={{
          __html: `(function(){try{var t=localStorage.getItem('oneui-studio:theme')||'light';var d=localStorage.getItem('oneui-studio:density')||'default';document.documentElement.setAttribute('data-theme',t);document.documentElement.setAttribute('data-density',d)}catch(e){}})()`,
        }}
      />

      {/* Shell renders immediately — no data dependency */}
      <PlatformShell>
        {/* Foundation data streams in — shell already visible */}
        <Suspense fallback={<PlatformSkeleton />}>
          <FoundationStyleBridge>
            {children}
          </FoundationStyleBridge>
        </Suspense>
      </PlatformShell>
    </>
  );
}
```

### Load Timeline for This Layout

```
0ms    — HTML arrives, blocking <script> sets data-theme
10ms   — Static token CSS parsed (from bundle)
50ms   — React hydration begins
80ms   — PlatformShell renders (sidebar + topbar visible)
80ms   — Suspense fallback shows PlatformSkeleton in content area
80ms   — FoundationStyleBridge mounts, subscribes to Convex
~350ms — Convex responds with getBrandOverviewData
~360ms — useBrandCSS generates token CSS, injects <style>
~370ms — Suspense resolves, children render with correct tokens
~370ms — Each child's own Suspense boundaries show their skeletons
~500ms — Child Convex queries resolve, panels populate
```

---

## Blueprint: Heavy Page with Lazy Imports

For pages that import heavy libraries (color math, chart libraries,
Storybook preview machinery), use dynamic imports:

```tsx
// app/(platform)/brands/[brandId]/components/page.tsx

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { ComponentEditorSkeleton } from './ComponentEditorSkeleton';

// Heavy import — loads only when this page is visited
const ComponentEditor = dynamic(
  () => import('./ComponentEditor'),
  {
    loading: () => <ComponentEditorSkeleton />,
    ssr: false, // Client-only — uses browser APIs
  }
);

export default function ComponentsPage({
  params,
}: {
  params: { brandId: string };
}) {
  return (
    <Suspense fallback={<ComponentEditorSkeleton />}>
      <ComponentEditor brandId={params.brandId} />
    </Suspense>
  );
}
```

---

## Blueprint: Conditional Queries (Skip Pattern)

When a query depends on a value that might not be available yet
(e.g., user hasn't selected a brand), use Convex's skip pattern:

```tsx
function RecipeEditor({ brandId }: { brandId: string | null }) {
  // "skip" tells Convex to not subscribe at all — no network request
  const recipes = useQuery(
    api.recipes.getByBrand,
    brandId ? { brandId: brandId as Id<'brands'> } : 'skip'
  );

  if (!brandId) return <SelectBrandPrompt />;
  if (recipes === undefined) return <RecipeEditorSkeleton />;
  return <RecipeEditorContent recipes={recipes} />;
}
```

This is critical for performance: skipped queries create ZERO
network overhead. Without the skip pattern, Convex would fire
a query with invalid arguments, get an error, and retry — wasting
bandwidth and time.

---

## Blueprint: Optimistic Updates for Instant Feel

For mutations that the user triggers (saving a recipe, changing a
color), add optimistic updates so the UI reflects the change
immediately while Convex confirms:

```tsx
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';

function useUpdateRecipeSelection() {
  return useMutation(api.recipes.setSelection).withOptimisticUpdate(
    (localStore, { brandId, component, selections }) => {
      // Immediately update the local cache
      const current = localStore.getQuery(
        api.recipes.getByBrand,
        { brandId }
      );
      if (current) {
        const updated = current.map((r) =>
          r.component === component
            ? { ...r, selections }
            : r
        );
        localStore.setQuery(
          api.recipes.getByBrand,
          { brandId },
          updated
        );
      }
    }
  );
}
```

Optimistic updates make interactions feel instant (< 50ms) instead
of waiting for a full Convex round-trip (200-500ms).

---

## Anti-Patterns to Avoid

### 1. The God Query

```tsx
// ❌ One query that returns EVERYTHING for a page
const everything = useQuery(api.brands.getEverything, { brandId });
// Returns: brand, palettes, typography, surfaces, recipes, usage stats,
// team members, export history, changelog...
// Problem: 50KB+ payload, slow query, invalidates on ANY change
```

Split into focused queries that each panel owns.

### 2. The useEffect Data Copy

```tsx
// ❌ Copying Convex data into local state
const data = useQuery(api.brands.get, { brandId });
const [brand, setBrand] = useState(null);
useEffect(() => {
  if (data) setBrand(data);
}, [data]);
// Problem: stale data, extra render cycle, defeats reactivity
```

Use `data` directly. If you need derived state, use `useMemo`.

### 3. The Prop Drilling Data Fetch

```tsx
// ❌ Fetching at the top and drilling through 5 layers
function Page() {
  const data = useQuery(api.foundations.getBrandOverviewData, { brandId });
  return <Layout data={data}><Section data={data}><Panel data={data}>...
}
```

Use `FoundationDataContext` for shared data. Let leaf components
fetch their own specific data.

### 4. The Missing Skip

```tsx
// ❌ Querying with potentially undefined args
const brandId = useBrandId(); // might be null on first render
const data = useQuery(api.brands.get, { brandId }); // ERROR if null
```

Always use the skip pattern for conditional queries.
