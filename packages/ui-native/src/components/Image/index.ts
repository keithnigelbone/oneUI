/**
 * Image (native) barrel.
 */

export { Image } from './Image.native';
export type {
  ImageProps,
  ImageAspectRatio,
  ImageFit,
  ImageObjectFit,
  ImageLoadingStrategy,
} from './interface';
export { useImageState, parseAspectRatio, normalizeObjectFit, resolveObjectFit } from './interface';
