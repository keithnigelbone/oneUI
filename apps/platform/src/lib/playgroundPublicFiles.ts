import { PLAYGROUND_IMAGE_URLS } from '@oneui/shared/engine/playgroundImageAssets';

const LEGACY_PUBLIC_IMAGE_URLS = ['/oneui-generated-image-placeholder.svg'];
const PUBLIC_IMAGE_URLS = [...PLAYGROUND_IMAGE_URLS, ...LEGACY_PUBLIC_IMAGE_URLS];

let publicFilesPromise: Promise<Record<string, string>> | null = null;

function toSandpackPublicPath(url: string): string {
  return `/public${url}`;
}

export function loadPlaygroundPublicFiles(): Promise<Record<string, string>> {
  if (!publicFilesPromise) {
    publicFilesPromise = Promise.all(
      PUBLIC_IMAGE_URLS.map(async (url) => {
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(`Playground image asset fetch failed for ${url}: ${res.status}`);
        }
        const contents = await res.text();
        return [
          [toSandpackPublicPath(url), contents],
          [url, contents],
        ] as const;
      }),
    ).then((entries) => Object.fromEntries(entries.flat()));
  }
  return publicFilesPromise;
}
