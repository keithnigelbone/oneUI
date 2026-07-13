/**
 * imageGeneration.ts
 *
 * Optional topic-image generation seam for Experience Lab runs. The workflow
 * calls this only when a request opts in through `imageGeneration`; missing API
 * keys skip cleanly so direct tests and local development never hit a vendor by
 * accident.
 */

export type ImageProviderPreference =
  | 'auto'
  | 'google-nano-banana'
  | 'openai-gpt-image'
  | 'none';

export type ResolvedImageProvider = Exclude<ImageProviderPreference, 'auto' | 'none'>;

export interface ImageGenerationConfig {
  enabled?: boolean;
  provider?: ImageProviderPreference;
  count?: number;
  model?: string;
  size?: string;
}

export interface GeneratedImageAsset {
  id: string;
  provider: ResolvedImageProvider;
  model: string;
  mimeType: string;
  src: string;
  alt: string;
  prompt: string;
  topic: string;
}

export interface ImageGenerationInput {
  config?: ImageGenerationConfig;
  topic: string;
  artifactType: string;
  outputProfile: string;
  brandId?: string;
  designContext?: string;
}

export interface ImageGenerationResult {
  assets: GeneratedImageAsset[];
  provider?: ResolvedImageProvider;
  model?: string;
  skippedReason?: string;
}

export interface ImageGenerationDeps {
  fetchImpl?: typeof fetch;
  env?: Record<string, string | undefined>;
}

const DEFAULT_GOOGLE_MODEL = 'gemini-2.5-flash-image';
const DEFAULT_OPENAI_MODEL = 'gpt-image-1.5';
const DEFAULT_SIZE = '1024x1024';
const MAX_IMAGES_PER_RUN = 3;

export async function runImageGeneration(
  input: ImageGenerationInput,
  deps: ImageGenerationDeps = {}
): Promise<ImageGenerationResult> {
  const config = input.config;
  if (!config || config.enabled === false || config.provider === 'none') {
    return { assets: [], skippedReason: config ? 'disabled' : 'not-requested' };
  }

  const env = deps.env ?? process.env;
  const provider = resolveProvider(config.provider ?? 'auto', env);
  if (!provider) {
    return { assets: [], skippedReason: 'missing-api-key' };
  }

  const fetchImpl = deps.fetchImpl ?? fetch;
  const count = clampImageCount(config.count);
  const prompt = buildImagePrompt(input);
  if (provider === 'google-nano-banana') {
    const model = config.model || env.GOOGLE_IMAGE_MODEL || DEFAULT_GOOGLE_MODEL;
    const assets = await generateWithGoogle({
      fetchImpl,
      apiKey: googleApiKey(env)!,
      model,
      prompt,
      count,
      topic: input.topic,
    });
    return { assets, provider, model };
  }

  const model = config.model || env.OPENAI_IMAGE_MODEL || DEFAULT_OPENAI_MODEL;
  const assets = await generateWithOpenAI({
    fetchImpl,
    apiKey: env.OPENAI_API_KEY!,
    model,
    prompt,
    count,
    size: config.size || DEFAULT_SIZE,
    topic: input.topic,
  });
  return { assets, provider, model };
}

function clampImageCount(value: number | undefined): number {
  if (typeof value !== 'number' || Number.isNaN(value)) return 1;
  return Math.max(1, Math.min(MAX_IMAGES_PER_RUN, Math.round(value)));
}

function googleApiKey(env: Record<string, string | undefined>): string | undefined {
  return env.GOOGLE_API_KEY || env.GEMINI_API_KEY;
}

function resolveProvider(
  preference: ImageProviderPreference,
  env: Record<string, string | undefined>
): ResolvedImageProvider | null {
  if (preference === 'none') return null;
  if (preference === 'google-nano-banana') return googleApiKey(env) ? preference : null;
  if (preference === 'openai-gpt-image') return env.OPENAI_API_KEY ? preference : null;
  if (googleApiKey(env)) return 'google-nano-banana';
  if (env.OPENAI_API_KEY) return 'openai-gpt-image';
  return null;
}

function buildImagePrompt(input: ImageGenerationInput): string {
  const designContext = input.designContext?.trim()
    ? `\nOneUI and DESIGN.md quality context:\n${input.designContext.slice(0, 1800)}`
    : '';
  return [
    `Generate topic imagery for a OneUI ${input.artifactType} on ${input.outputProfile}.`,
    `Topic: ${input.topic}.`,
    input.brandId ? `Brand id: ${input.brandId}.` : '',
    'Create a polished, useful visual asset that directly supports the topic.',
    'Avoid generic stock-photo staging. Prefer clear product, service, place, or state imagery the UI can actually use.',
    'Do not render interface chrome or screenshots. Do not include readable text unless the topic absolutely requires it.',
    'The image should fit into a modern Jio design-system experience and leave room for UI composition around it.',
    designContext,
  ]
    .filter(Boolean)
    .join('\n');
}

async function generateWithGoogle(args: {
  fetchImpl: typeof fetch;
  apiKey: string;
  model: string;
  prompt: string;
  count: number;
  topic: string;
}): Promise<GeneratedImageAsset[]> {
  const assets: GeneratedImageAsset[] = [];
  for (let index = 0; index < args.count; index += 1) {
    const response = await args.fetchImpl(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(args.model)}:generateContent?key=${encodeURIComponent(args.apiKey)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: args.prompt }] }],
          generationConfig: { responseModalities: ['IMAGE'] },
        }),
      }
    );
    if (!response.ok) {
      throw new Error(`Google image generation failed (${response.status}): ${await response.text()}`);
    }
    const json = (await response.json()) as {
      candidates?: Array<{ content?: { parts?: Array<Record<string, unknown>> } }>;
    };
    for (const candidate of json.candidates ?? []) {
      for (const part of candidate.content?.parts ?? []) {
        const inline =
          (part.inlineData as { mimeType?: string; data?: string } | undefined) ??
          (part.inline_data as { mimeType?: string; data?: string } | undefined);
        if (!inline?.data) continue;
        const mimeType = inline.mimeType || 'image/png';
        assets.push({
          id: `image-google-${index + 1}-${assets.length + 1}`,
          provider: 'google-nano-banana',
          model: args.model,
          mimeType,
          src: `data:${mimeType};base64,${inline.data}`,
          alt: altForTopic(args.topic),
          prompt: args.prompt,
          topic: args.topic,
        });
      }
    }
  }
  return assets.slice(0, args.count);
}

async function generateWithOpenAI(args: {
  fetchImpl: typeof fetch;
  apiKey: string;
  model: string;
  prompt: string;
  count: number;
  size: string;
  topic: string;
}): Promise<GeneratedImageAsset[]> {
  const response = await args.fetchImpl('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${args.apiKey}`,
    },
    body: JSON.stringify({
      model: args.model,
      prompt: args.prompt,
      n: args.count,
      size: args.size,
    }),
  });
  if (!response.ok) {
    throw new Error(`OpenAI image generation failed (${response.status}): ${await response.text()}`);
  }
  const json = (await response.json()) as {
    data?: Array<{ b64_json?: string; url?: string; mime_type?: string }>;
  };
  return (json.data ?? []).map((image, index) => {
    const mimeType = image.mime_type || 'image/png';
    return {
      id: `image-openai-${index + 1}`,
      provider: 'openai-gpt-image' as const,
      model: args.model,
      mimeType,
      src: image.b64_json ? `data:${mimeType};base64,${image.b64_json}` : image.url || '',
      alt: altForTopic(args.topic),
      prompt: args.prompt,
      topic: args.topic,
    };
  }).filter((asset) => asset.src.length > 0);
}

function altForTopic(topic: string): string {
  const cleaned = topic.replace(/\s+/g, ' ').trim();
  if (!cleaned) return 'Generated topic image';
  return `Generated image for ${cleaned.slice(0, 120)}`;
}
