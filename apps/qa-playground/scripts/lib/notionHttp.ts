/**
 * Notion HTTP transport — Node fetch with curl fallback for TLS issues on corporate Macs.
 */
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

export function formatFetchError(error: unknown): string {
  if (!(error instanceof Error)) return 'Unknown error';
  const parts = [error.message];
  const cause = error.cause;
  if (cause instanceof Error) {
    parts.push(cause.message);
    const code = (cause as NodeJS.ErrnoException).code;
    if (code) parts.push(`code=${code}`);
  }
  return parts.join(' — ');
}

function isTlsOrNetworkError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const cause = error.cause as NodeJS.ErrnoException | undefined;
  const tlsCodes = new Set([
    'UNABLE_TO_GET_ISSUER_CERT_LOCALLY',
    'SELF_SIGNED_CERT_IN_CHAIN',
    'CERT_HAS_EXPIRED',
  ]);
  if (cause?.code && tlsCodes.has(cause.code)) return true;
  return error.message === 'fetch failed';
}

async function curlPostJson(
  url: string,
  headers: Record<string, string>,
  body: unknown,
): Promise<{ ok: boolean; status: number; json: () => Promise<unknown>; text: () => Promise<string> }> {
  const args = ['-sS', '-w', '\n%{http_code}', '-X', 'POST', url];
  for (const [key, value] of Object.entries(headers)) {
    args.push('-H', `${key}: ${value}`);
  }
  args.push('-d', JSON.stringify(body));

  const { stdout } = await execFileAsync('curl', args, {
    maxBuffer: 20 * 1024 * 1024,
  });

  const trimmed = stdout.trimEnd();
  const newline = trimmed.lastIndexOf('\n');
  const responseBody = newline >= 0 ? trimmed.slice(0, newline) : trimmed;
  const status = newline >= 0 ? Number.parseInt(trimmed.slice(newline + 1), 10) : 200;

  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => JSON.parse(responseBody) as unknown,
    text: async () => responseBody,
  };
}

type EnvSource = Record<string, string | undefined>;

function useCurl(env: EnvSource): boolean {
  const flag = env.NOTION_USE_CURL ?? process.env.NOTION_USE_CURL;
  return flag === '1' || flag === 'true';
}

async function curlPatchJson(
  url: string,
  headers: Record<string, string>,
  body: unknown,
): Promise<{ ok: boolean; status: number; json: () => Promise<unknown>; text: () => Promise<string> }> {
  const args = ['-sS', '-w', '\n%{http_code}', '-X', 'PATCH', url];
  for (const [key, value] of Object.entries(headers)) {
    args.push('-H', `${key}: ${value}`);
  }
  args.push('-d', JSON.stringify(body));

  const { stdout } = await execFileAsync('curl', args, {
    maxBuffer: 20 * 1024 * 1024,
  });

  const trimmed = stdout.trimEnd();
  const newline = trimmed.lastIndexOf('\n');
  const responseBody = newline >= 0 ? trimmed.slice(0, newline) : trimmed;
  const status = newline >= 0 ? Number.parseInt(trimmed.slice(newline + 1), 10) : 200;

  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => JSON.parse(responseBody) as unknown,
    text: async () => responseBody,
  };
}

async function curlGetJson(
  url: string,
  headers: Record<string, string>,
): Promise<{ ok: boolean; status: number; json: () => Promise<unknown>; text: () => Promise<string> }> {
  const args = ['-sS', '-w', '\n%{http_code}', '-X', 'GET', url];
  for (const [key, value] of Object.entries(headers)) {
    args.push('-H', `${key}: ${value}`);
  }

  const { stdout } = await execFileAsync('curl', args, {
    maxBuffer: 20 * 1024 * 1024,
  });

  const trimmed = stdout.trimEnd();
  const newline = trimmed.lastIndexOf('\n');
  const responseBody = newline >= 0 ? trimmed.slice(0, newline) : trimmed;
  const status = newline >= 0 ? Number.parseInt(trimmed.slice(newline + 1), 10) : 200;

  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => JSON.parse(responseBody) as unknown,
    text: async () => responseBody,
  };
}

export async function notionGetJson(
  url: string,
  headers: Record<string, string>,
  env: EnvSource = process.env,
): Promise<{ ok: boolean; status: number; json: () => Promise<unknown>; text: () => Promise<string> }> {
  if (useCurl(env)) {
    return curlGetJson(url, headers);
  }

  try {
    const res = await fetch(url, { method: 'GET', headers });
    return {
      ok: res.ok,
      status: res.status,
      json: () => res.json(),
      text: () => res.text(),
    };
  } catch (error) {
    if (!isTlsOrNetworkError(error)) throw error;
    try {
      return await curlGetJson(url, headers);
    } catch (curlError) {
      throw new Error(
        `${formatFetchError(error)}. Curl fallback also failed: ${formatFetchError(curlError)}`,
      );
    }
  }
}

export async function notionPostJson(
  url: string,
  headers: Record<string, string>,
  body: unknown,
  env: EnvSource = process.env,
): Promise<{ ok: boolean; status: number; json: () => Promise<unknown>; text: () => Promise<string> }> {
  if (useCurl(env)) {
    return curlPostJson(url, headers, body);
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    return {
      ok: res.ok,
      status: res.status,
      json: () => res.json(),
      text: () => res.text(),
    };
  } catch (error) {
    if (!isTlsOrNetworkError(error)) throw error;
    try {
      return await curlPostJson(url, headers, body);
    } catch (curlError) {
      throw new Error(
        `${formatFetchError(error)}. Curl fallback also failed: ${formatFetchError(curlError)}`,
      );
    }
  }
}

export async function notionPatchJson(
  url: string,
  headers: Record<string, string>,
  body: unknown,
  env: EnvSource = process.env,
): Promise<{ ok: boolean; status: number; json: () => Promise<unknown>; text: () => Promise<string> }> {
  if (useCurl(env)) {
    return curlPatchJson(url, headers, body);
  }

  try {
    const res = await fetch(url, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(body),
    });
    return {
      ok: res.ok,
      status: res.status,
      json: () => res.json(),
      text: () => res.text(),
    };
  } catch (error) {
    if (!isTlsOrNetworkError(error)) throw error;
    try {
      return await curlPatchJson(url, headers, body);
    } catch (curlError) {
      throw new Error(
        `${formatFetchError(error)}. Curl fallback also failed: ${formatFetchError(curlError)}`,
      );
    }
  }
}
