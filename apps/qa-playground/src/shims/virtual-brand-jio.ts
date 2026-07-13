/**
 * QA Playground shim for `virtual:oneui-brand/jio` — uses baked fallback CSS so
 * `BrandProvider` resolves without CDN / `@oneui/vite-plugin` at dev time.
 */
export { default } from '../../../../packages/ui/cdn-bootstrap/jio';

export const decorations: unknown[] = [];
export const themeConfig = null;
export const materialsFoundation = null;
export const branding = { brandName: 'Jio', logoSvg: null };
export const fontsFoundation = null;
