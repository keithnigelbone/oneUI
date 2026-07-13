/**
 * Stable local image assets available to the DCA Sandpack playground.
 *
 * These URLs are served by the platform app from
 * `apps/platform/public/playground-assets/images/` and mirrored into
 * Sandpack's virtual `/public` file system so they resolve inside the
 * cross-origin iframe. Keep this registry in sync with the public folder.
 */

export interface PlaygroundImageAsset {
  id: string;
  label: string;
  url: string;
  alt: string;
}

export const PLAYGROUND_IMAGE_ASSETS = [
  {
    id: 'ecommerce-hero',
    label: 'E-commerce hero',
    url: '/playground-assets/images/ecommerce-hero.svg',
    alt: 'Assorted shopping products arranged for an e-commerce hero',
  },
  {
    id: 'product-card-1',
    label: 'Product card 1',
    url: '/playground-assets/images/product-card-1.svg',
    alt: 'Premium headphones product image',
  },
  {
    id: 'product-card-2',
    label: 'Product card 2',
    url: '/playground-assets/images/product-card-2.svg',
    alt: 'Smartwatch product image',
  },
  {
    id: 'product-card-3',
    label: 'Product card 3',
    url: '/playground-assets/images/product-card-3.svg',
    alt: 'Sneakers product image',
  },
  {
    id: 'lifestyle-1',
    label: 'Lifestyle',
    url: '/playground-assets/images/lifestyle-1.svg',
    alt: 'Lifestyle service card image',
  },
  {
    id: 'finance-card',
    label: 'Finance card',
    url: '/playground-assets/images/finance-card.svg',
    alt: 'Finance dashboard card image',
  },
  {
    id: 'media-card',
    label: 'Media card',
    url: '/playground-assets/images/media-card.svg',
    alt: 'Streaming media card image',
  },
  {
    id: 'placeholder',
    label: 'Neutral placeholder',
    url: '/playground-assets/images/placeholder.svg',
    alt: 'Neutral generated image placeholder',
  },
] as const satisfies readonly PlaygroundImageAsset[];

export const PLAYGROUND_IMAGE_FALLBACK_SRC = '/playground-assets/images/placeholder.svg';

export const PLAYGROUND_IMAGE_URLS = PLAYGROUND_IMAGE_ASSETS.map((asset) => asset.url);
export const PLAYGROUND_PROMPT_IMAGE_ASSETS = PLAYGROUND_IMAGE_ASSETS.filter(
  (asset) => asset.id !== 'placeholder',
);

export const PLAYGROUND_IMAGE_URL_SET = new Set<string>([
  ...PLAYGROUND_IMAGE_URLS,
  // Legacy placeholder accepted for old saved compositions. New repairs
  // normalize to PLAYGROUND_IMAGE_FALLBACK_SRC so Sandpack can mirror it.
  '/oneui-generated-image-placeholder.svg',
]);

export function isPlaygroundImageUrl(src: string): boolean {
  return PLAYGROUND_IMAGE_URL_SET.has(src.trim());
}

export function formatPlaygroundImagePromptList(): string {
  return PLAYGROUND_PROMPT_IMAGE_ASSETS
    .map((asset) => `    - \`${asset.url}\` — ${asset.label}; alt: "${asset.alt}"`)
    .join('\n');
}
