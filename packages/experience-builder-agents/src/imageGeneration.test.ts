import { describe, expect, it, vi } from 'vitest';
import { runImageGeneration } from './imageGeneration';

const BASE = {
  config: { enabled: true, provider: 'auto' as const, count: 1 },
  topic: 'Jio fiber launch page',
  artifactType: 'web-ui',
  outputProfile: 'web-desktop',
  brandId: 'jio-default',
};

describe('runImageGeneration', () => {
  it('skips cleanly when no image provider key is configured', async () => {
    const fetchImpl = vi.fn();

    const result = await runImageGeneration(BASE, {
      fetchImpl: fetchImpl as unknown as typeof fetch,
      env: {},
    });

    expect(result.assets).toEqual([]);
    expect(result.skippedReason).toBe('missing-api-key');
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('uses Google Nano Banana when auto can resolve a Google key', async () => {
    const fetchImpl = vi.fn(async () =>
      new Response(
        JSON.stringify({
          candidates: [
            {
              content: {
                parts: [{ inlineData: { mimeType: 'image/png', data: 'abc123' } }],
              },
            },
          ],
        }),
        { status: 200 },
      ),
    );

    const result = await runImageGeneration(BASE, {
      fetchImpl: fetchImpl as unknown as typeof fetch,
      env: { GOOGLE_API_KEY: 'google-key' },
    });

    expect(result.provider).toBe('google-nano-banana');
    expect(result.model).toBe('gemini-2.5-flash-image');
    expect(result.assets[0]?.src).toBe('data:image/png;base64,abc123');
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('uses GPT Images when explicitly selected', async () => {
    const fetchImpl = vi.fn(async () =>
      new Response(
        JSON.stringify({
          data: [{ b64_json: 'xyz789' }],
        }),
        { status: 200 },
      ),
    );

    const result = await runImageGeneration(
      { ...BASE, config: { enabled: true, provider: 'openai-gpt-image', count: 1 } },
      {
        fetchImpl: fetchImpl as unknown as typeof fetch,
        env: { OPENAI_API_KEY: 'openai-key' },
      },
    );

    expect(result.provider).toBe('openai-gpt-image');
    expect(result.model).toBe('gpt-image-1.5');
    expect(result.assets[0]?.src).toBe('data:image/png;base64,xyz789');
  });
});
