/**
 * Loaded only when STORYBOOK_OFFLINE=1 at Storybook config time (see preview.ts).
 * Keeps `@jds/kb-core` out of the default Vite graph so local Convex dev does not
 * require a kb-core install/build unless you opt into offline mode.
 */
export async function loadOfflineBrandSnapshot(brandSlug: string): Promise<void> {
  const { getBrand } = await import('@jds/kb-core');
  (globalThis as { __JDS_OFFLINE_BRAND__?: unknown }).__JDS_OFFLINE_BRAND__ =
    getBrand(brandSlug);
}
