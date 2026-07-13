export type ImageProviderPreference =
  | 'auto'
  | 'google-nano-banana'
  | 'openai-gpt-image'
  | 'none';

export const IMAGE_PROVIDER_OPTIONS: Array<{ value: ImageProviderPreference; label: string }> = [
  { value: 'auto', label: 'Auto images' },
  { value: 'google-nano-banana', label: 'Google Nano Banana' },
  { value: 'openai-gpt-image', label: 'GPT Images' },
  { value: 'none', label: 'Images off' },
];
