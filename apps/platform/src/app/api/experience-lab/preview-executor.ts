import { DaytonaExecutor, type PreviewExecutor } from '@oneui/experience-builder-preview';
import { LabAstExecutor } from './lab-ast-executor';

const DAYTONA_TOKEN_PATTERN = /dtn_[A-Za-z0-9]+/;
const DEFAULT_DAYTONA_TIMEOUT_MS = 20_000;
const DEFAULT_DAYTONA_PREVIEW_TTL_SECONDS = 60 * 60;
const DEFAULT_DAYTONA_URL_CHECK_TIMEOUT_MS = 5_000;

interface ExperienceLabPreviewExecutorOptions {
  baseUrl?: string;
  brandCss?: string;
}

function extractDaytonaToken(): string | null {
  const raw = process.env.DAYTONA_API_KEY ?? '';
  const token = raw.match(DAYTONA_TOKEN_PATTERN)?.[0] ?? '';
  if (!token) return null;
  if (raw !== token) {
    process.env.DAYTONA_API_KEY = token;
  }
  return token;
}

class DaytonaWithLabAstFallbackExecutor implements PreviewExecutor {
  constructor(
    private readonly daytona: DaytonaExecutor,
    private readonly labAst: LabAstExecutor,
    private readonly brandCss: string = '',
  ) {}

  async render(input: Parameters<PreviewExecutor['render']>[0]) {
    const renderInput = this.brandCss
      ? { ...input, brandCss: this.brandCss }
      : input;
    const timeoutMs = Number.parseInt(
      process.env.EXPERIENCE_LAB_DAYTONA_TIMEOUT_MS ?? '',
      10,
    ) || DEFAULT_DAYTONA_TIMEOUT_MS;
    const daytonaRender = this.daytona.render(renderInput);
    try {
      const result = await withTimeout(daytonaRender, timeoutMs);
      if (result.rendered && result.previewState.url) {
        const validPreviewUrl = await verifyDaytonaPreviewUrl(result.previewState.url);
        if (validPreviewUrl.ok) return result;
        console.error(
          `[experience-lab/preview] Daytona preview URL is not usable (${validPreviewUrl.reason}); falling back to LabAst.`
        );
        const sandboxId = result.previewState.sandboxId;
        if (sandboxId) void this.daytona.expirePreview(sandboxId);
        return this.labAst.render(renderInput);
      }
      console.error(
        '[experience-lab/preview] Daytona returned no rendered live preview; falling back to LabAst.'
      );
    } catch (err) {
      console.error('[experience-lab/preview] Daytona render failed; falling back to LabAst:', err);
    }
    daytonaRender
      .then((lateResult) => {
        const sandboxId = lateResult.previewState.sandboxId;
        if (sandboxId) void this.daytona.expirePreview(sandboxId);
      })
      .catch(() => {});
    return this.labAst.render(renderInput);
  }

}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error(`Daytona preview timed out after ${timeoutMs}ms.`));
    }, timeoutMs);
    promise.then(
      (value) => {
        clearTimeout(timeout);
        resolve(value);
      },
      (err) => {
        clearTimeout(timeout);
        reject(err);
      },
    );
  });
}

function isCallbackUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.pathname === '/callback' || parsed.pathname.endsWith('/callback');
  } catch {
    return true;
  }
}

async function verifyDaytonaPreviewUrl(url: string): Promise<{ ok: true } | { ok: false; reason: string }> {
  if (isCallbackUrl(url)) {
    return { ok: false, reason: 'callback-url' };
  }
  if (process.env.EXPERIENCE_LAB_DAYTONA_URL_HEALTHCHECK === '0') {
    return { ok: true };
  }

  const timeoutMs = Number.parseInt(
    process.env.EXPERIENCE_LAB_DAYTONA_URL_CHECK_TIMEOUT_MS ?? '',
    10,
  ) || DEFAULT_DAYTONA_URL_CHECK_TIMEOUT_MS;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      cache: 'no-store',
      signal: controller.signal,
    });
    const finalUrl = response.url || url;
    if (isCallbackUrl(finalUrl)) {
      return { ok: false, reason: 'redirected-to-callback' };
    }
    if (!response.ok) {
      return { ok: false, reason: `http-${response.status}` };
    }
    const contentType = response.headers.get('content-type') ?? '';
    if (!contentType.includes('text/html')) {
      return { ok: false, reason: `content-type-${contentType || 'missing'}` };
    }
    const sample = await response.text();
    if (/sandbox not found|NOT_FOUND|not found/i.test(sample.slice(0, 1000))) {
      return { ok: false, reason: 'sandbox-not-found' };
    }
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      reason: err instanceof Error ? err.message : String(err),
    };
  } finally {
    clearTimeout(timeout);
  }
}

export function createExperienceLabPreviewExecutor(
  options: ExperienceLabPreviewExecutorOptions = {},
): PreviewExecutor {
  const labAst = new LabAstExecutor(options);
  const requested = process.env.EXPERIENCE_LAB_PREVIEW_EXECUTOR ?? 'daytona';
  const token = extractDaytonaToken();

  if (requested === 'lab-ast' || !token) {
    if (requested === 'daytona' && !token) {
      console.error(
        '[experience-lab/preview] DAYTONA_API_KEY is missing; using LabAst preview executor.'
      );
    }
    return labAst;
  }

  const ttlSeconds = Number.parseInt(
    process.env.EXPERIENCE_LAB_DAYTONA_PREVIEW_TTL_SECONDS ?? '',
    10,
  ) || DEFAULT_DAYTONA_PREVIEW_TTL_SECONDS;

  return new DaytonaWithLabAstFallbackExecutor(
    new DaytonaExecutor({ previewTtlSeconds: ttlSeconds }),
    labAst,
    options.brandCss ?? '',
  );
}

export const EXPERIENCE_LAB_PREVIEW_EXECUTOR_NAME = 'daytona-lab-ast-fallback' as const;
