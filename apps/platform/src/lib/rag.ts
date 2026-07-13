/**
 * rag.ts
 *
 * Server-side helpers for the RAG layer shared by every chat endpoint.
 * Owns the OpenAI embedding client, the Convex HTTP client, and the
 * constants that parameterise both. Factored out of the per-endpoint
 * tools.ts files so the embedding pipeline lives in one place.
 *
 * Consumed by:
 *   - apps/platform/src/app/api/chat/tools.ts (home chat)
 *   - apps/platform/src/app/(platform)/(builder)/create/lib/tools.ts
 */

import { ConvexHttpClient } from 'convex/browser';

export const EMBED_MODEL = 'text-embedding-3-small';
export const EMBED_DIMENSIONS = 1536;
export const RAG_MAX_RESULTS = 5;
export const RAG_CHUNK_CHAR_CAP = 3200;

let cachedConvexClient: ConvexHttpClient | null = null;

export function getConvexClient(): ConvexHttpClient {
  if (cachedConvexClient) return cachedConvexClient;
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) throw new Error('NEXT_PUBLIC_CONVEX_URL is not set');
  cachedConvexClient = new ConvexHttpClient(url);
  return cachedConvexClient;
}

/**
 * Embed a query string using OpenAI's text-embedding-3-small (1536 dims).
 * Throws if `OPENAI_API_KEY` is unset or the request fails.
 */
export async function embedQuery(text: string): Promise<number[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY is not set');
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: EMBED_MODEL,
      input: text,
      dimensions: EMBED_DIMENSIONS,
    }),
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Embedding request failed: ${response.status} ${body}`);
  }
  const payload = (await response.json()) as { data: Array<{ embedding: number[] }> };
  return payload.data[0].embedding;
}
