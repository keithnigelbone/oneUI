import type { ArtboardPreset } from '@/design-tools/ExperienceCanvas';
import { ASSET_DIMENSIONS } from './social-platforms';

/** Social / marketing dimensions as tldraw artboard presets for Create. */
export const CREATE_ARTBOARD_PRESETS: ArtboardPreset[] = ASSET_DIMENSIONS.map((d) => ({
  name: d.name,
  w: d.width,
  h: d.height,
  label: d.name,
}));
