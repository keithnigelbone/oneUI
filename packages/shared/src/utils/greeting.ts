/**
 * greeting.ts
 *
 * Pure function that returns a time-of-day greeting for the home landing.
 * Inspired by assistant home screens that use contextual welcome lines
 * ("Good morning, Nuno", "Welcome back", etc.).
 *
 * Design goals:
 * - Pure + deterministic given a `now` + `seed` so tests can pin output.
 * - Five buckets tuned to real human rhythms (not a rigid 6-hour grid).
 * - 2–3 template variants per bucket so the greeting isn't stale on
 *   consecutive reloads.
 * - Graceful fallback when the user has no name yet (OAuth isn't wired).
 *
 * Buckets (local time, using the hour from the provided `now`):
 *   05:00–07:59  early-morning
 *   08:00–11:59  morning
 *   12:00–16:59  afternoon
 *   17:00–20:59  evening
 *   21:00–04:59  late-night
 */

export type GreetingBucket =
  | 'early-morning'
  | 'morning'
  | 'afternoon'
  | 'evening'
  | 'late-night';

export interface GreetingResult {
  bucket: GreetingBucket;
  /** Full sentence, e.g. "Good morning, Nuno" or "Welcome back". */
  text: string;
}

export interface GreetingOptions {
  /**
   * Optional deterministic variant index — when provided, the variant is
   * picked by `seed % variants.length`. Pass the hour or a day-bucket
   * integer to keep the greeting stable for a short window.
   */
  seed?: number;
}

const TEMPLATES: Record<GreetingBucket, readonly string[]> = {
  'early-morning': [
    'Good morning, {name}',
    'Welcome back',
    'Continue your last project?',
  ],
  morning: [
    'Good morning, {name}',
    'Welcome back',
    'Continue your last project?',
  ],
  afternoon: [
    'Good afternoon, {name}',
    'Welcome back',
    'Continue your last project?',
  ],
  evening: [
    'Good evening, {name}',
    'Welcome back',
    'Continue your last project?',
  ],
  'late-night': [
    'Good evening, {name}',
    'Welcome back',
    'Continue your last project?',
  ],
};

/** Map a local hour (0–23) to a bucket. */
export function bucketForHour(hour: number): GreetingBucket {
  if (hour >= 5 && hour < 8) return 'early-morning';
  if (hour >= 8 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'late-night';
}

/**
 * Build the greeting string for a given moment. Pure — no Date.now(),
 * no Math.random() unless no seed is provided. Uses the hour as the
 * default variant seed so the template is stable within a given hour
 * and rotates across hours without needing any persistence.
 */
export function getGreeting(
  now: Date,
  name: string | null | undefined,
  options: GreetingOptions = {},
): GreetingResult {
  const bucket = bucketForHour(now.getHours());
  const variants = TEMPLATES[bucket];
  const effectiveSeed = options.seed !== undefined ? options.seed : now.getHours();
  const variantIndex = Math.abs(Math.trunc(effectiveSeed)) % variants.length;
  const template = variants[variantIndex];
  const trimmedName = name && name.trim().length > 0 ? name.trim() : null;
  const text = trimmedName
    ? template.replace('{name}', trimmedName)
    : // Strip the trailing ", {name}" when no name is available so
      // "Good morning, {name}" becomes "Good morning" — cleaner than
      // "Good morning, there" which reads awkwardly.
      template.replace(/,?\s*\{name\}/, '');
  return { bucket, text };
}
