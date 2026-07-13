/**
 * referenceResolver.ts
 *
 * Pure function that scores a candidate pool of reference screens against a
 * composition request (vertical + context + archetype) and returns top-k.
 *
 * No Convex, no fetch — the caller loads candidates from `referenceScreens`
 * (optionally denormalised with their collection's vertical/platform) and
 * passes them in. The same function is used server-side (API routes) and
 * client-side (playground preview of which references will be sent).
 *
 * Scoring is intentionally simple and transparent so designers can reason
 * about why a screen was selected. Weights can be tuned without changing shape.
 */

import type {
  ReferenceScreen,
  ResolveReferencesInput,
  ScoredReference,
} from './compositionTypes';

const WEIGHT_CONTEXT_MATCH = 40;
const WEIGHT_VERTICAL_MATCH = 30;
const WEIGHT_ARCHETYPE_EXACT = 25;
const WEIGHT_ARCHETYPE_FUZZY = 12;
const WEIGHT_APPROVED = 10;
const WEIGHT_HAS_ANALYSIS = 8;
const WEIGHT_HAS_NOTES = 4;

/**
 * Fuzzy archetype match: exact, then containment either way, then shared
 * word (hyphen/space split). Returns 0 (no signal) upwards.
 */
function scoreArchetype(requested: string | undefined, candidate: string): number {
  if (!requested) return 0;
  const a = requested.trim().toLowerCase();
  const b = candidate.trim().toLowerCase();
  if (!a || !b) return 0;
  if (a === b) return WEIGHT_ARCHETYPE_EXACT;
  if (a.includes(b) || b.includes(a)) return WEIGHT_ARCHETYPE_FUZZY;
  const aWords = new Set(a.split(/[-\s/]/).filter(Boolean));
  const bWords = new Set(b.split(/[-\s/]/).filter(Boolean));
  for (const word of aWords) if (bWords.has(word)) return WEIGHT_ARCHETYPE_FUZZY / 2;
  return 0;
}

/** Returns top-k references sorted by relevance, with scoring breadcrumbs. */
export function resolveReferences(
  candidates: readonly ReferenceScreen[],
  input: ResolveReferencesInput,
): ScoredReference[] {
  const { context, vertical, archetype } = input;
  const limit = Math.max(1, input.limit ?? 3);
  const includeDrafts = input.includeDrafts ?? false;

  const pool = candidates.filter((c) => {
    if (!includeDrafts && c.status && c.status !== 'approved') return false;
    return true;
  });

  const scored: ScoredReference[] = pool.map((screen) => {
    const reasons: string[] = [];
    let score = 0;

    if (screen.context === context) {
      score += WEIGHT_CONTEXT_MATCH;
      reasons.push(`context match (${context})`);
    }

    const screenVertical = screen.vertical ?? screen.collectionVertical;
    if (vertical && screenVertical === vertical) {
      score += WEIGHT_VERTICAL_MATCH;
      reasons.push(`vertical match (${vertical})`);
    }

    const archScore = scoreArchetype(archetype, screen.archetype);
    if (archScore > 0) {
      score += archScore;
      reasons.push(
        archScore >= WEIGHT_ARCHETYPE_EXACT
          ? `archetype exact (${screen.archetype})`
          : `archetype fuzzy (${screen.archetype})`,
      );
    }

    if (screen.status === 'approved') {
      score += WEIGHT_APPROVED;
      reasons.push('approved');
    }
    if (screen.analysisSummary) {
      score += WEIGHT_HAS_ANALYSIS;
      reasons.push('has analysis');
    }
    if (
      (screen.tokensObserved?.length ?? 0) > 0 ||
      screen.attentionNotes ||
      (screen.dosDonts?.length ?? 0) > 0
    ) {
      score += WEIGHT_HAS_NOTES;
      reasons.push('has designer notes');
    }

    return { screen, score, reasons };
  });

  // Drop zero-score candidates entirely — they add noise without signal.
  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/**
 * Render a compact "Visual Precedent" prompt section from selected references.
 * Images themselves are injected as vision content blocks at the API edge —
 * this text goes into the system prompt.
 */
export function renderReferencePrecedent(refs: readonly ScoredReference[]): string {
  if (refs.length === 0) return '';

  const lines: string[] = [];
  lines.push('## Visual Precedent');
  lines.push(
    'The following reference screens were retrieved from the Jio design catalog.',
    'Images are attached as vision input. Study their composition, surface usage,',
    'attention hierarchy, and typography scale — your output should feel native',
    'alongside them, not like a generic template.',
    '',
  );

  refs.forEach(({ screen }, i) => {
    lines.push(`### Reference ${i + 1} — ${screen.name}`);
    lines.push(
      `- Archetype: ${screen.archetype}`,
      `- Context: ${screen.context}`,
      ...(screen.vertical || screen.collectionVertical
        ? [`- Vertical: ${screen.vertical ?? screen.collectionVertical}`]
        : []),
    );
    if (screen.description) lines.push(`- Description: ${screen.description}`);
    if (screen.tokensObserved?.length) {
      lines.push(`- Tokens observed: ${screen.tokensObserved.join(', ')}`);
    }
    if (screen.attentionNotes) {
      lines.push(`- Attention: ${screen.attentionNotes}`);
    }
    if (screen.dosDonts?.length) {
      lines.push('- Do / Don\'t:');
      for (const d of screen.dosDonts) lines.push(`  - ${d}`);
    }
    if (screen.analysisSummary) {
      lines.push('', screen.analysisSummary.trim(), '');
    } else {
      lines.push('');
    }
  });

  return lines.join('\n');
}
