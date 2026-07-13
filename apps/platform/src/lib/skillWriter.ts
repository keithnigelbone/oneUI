/**
 * skillWriter.ts
 *
 * Server-side helpers shared between `/api/skills/draft` and `/api/skills/review`:
 * few-shot example fetch, Convex client construction, and JSON-fence stripping
 * for LLM responses.
 */

import { ConvexHttpClient } from 'convex/browser';
import { api } from '@oneui/convex';
import type { Id } from '@oneui/convex/_generated/dataModel';

export interface FewShotSkill {
  name: string;
  category: string;
  systemPromptTemplate: string;
  description?: string;
  attentionPattern?: string;
  dosDonts?: string[];
  vertical?: string;
  archetype?: string;
}

const FEW_SHOT_TARGET = 5;

function toFewShot(s: {
  name: string;
  category: string;
  systemPromptTemplate: string;
  description?: string;
  attentionPattern?: string;
  dosDonts?: string[];
  vertical?: string;
  archetype?: string;
}): FewShotSkill {
  return {
    name: s.name,
    category: s.category,
    systemPromptTemplate: s.systemPromptTemplate,
    description: s.description,
    attentionPattern: s.attentionPattern,
    dosDonts: s.dosDonts,
    vertical: s.vertical,
    archetype: s.archetype,
  };
}

/**
 * Fetch up to {@link FEW_SHOT_TARGET} few-shot examples for the Skill Writer.
 * Brand top-rated skills (with `positiveRatings > 0`) win; cold-start brands
 * fall through to the canonical `DEFAULT_SKILLS` seed.
 *
 * Both Convex queries fire in parallel — `getDefaults` returns a static
 * constant and never depends on the top-rated result, so serializing them
 * just adds a round-trip on the cold-start path.
 */
export async function fetchFewShotSkills(
  client: ConvexHttpClient,
  brandId: Id<'brands'>,
): Promise<FewShotSkill[]> {
  const [topRated, defaults] = await Promise.all([
    client.query(api.compositionSkills.getTopRated, { brandId, limit: FEW_SHOT_TARGET }),
    client.query(api.compositionSkills.getDefaults, {}),
  ]);
  const rated = topRated.filter((s: { positiveRatings?: number }) => (s.positiveRatings ?? 0) > 0);
  if (rated.length >= FEW_SHOT_TARGET) {
    return rated.slice(0, FEW_SHOT_TARGET).map(toFewShot);
  }
  const need = FEW_SHOT_TARGET - rated.length;
  return [...rated.map(toFewShot), ...defaults.slice(0, need).map(toFewShot)];
}

/**
 * Strip leading/trailing markdown fences (``` or ```json) from an LLM
 * response. Used by every route that asks Claude for JSON output.
 */
export function stripJSONFences(text: string): string {
  const trimmed = text.trim();
  if (trimmed.startsWith('```')) {
    return trimmed.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  }
  return trimmed;
}

/**
 * Render a few-shot example as a plain-text block for inclusion in the
 * system prompt. Conservative — keeps the model focused on the template
 * structure, not on padding metadata.
 */
export function renderFewShot(skill: FewShotSkill): string {
  const lines: string[] = [];
  lines.push(`### Skill: ${skill.name} (category: ${skill.category})`);
  if (skill.vertical) lines.push(`Vertical: ${skill.vertical}`);
  if (skill.archetype) lines.push(`Archetype: ${skill.archetype}`);
  if (skill.description) lines.push(`Description: ${skill.description}`);
  if (skill.attentionPattern) lines.push(`Attention: ${skill.attentionPattern}`);
  if (skill.dosDonts && skill.dosDonts.length > 0) {
    lines.push(`Do/Don't: ${skill.dosDonts.join(' | ')}`);
  }
  lines.push('');
  lines.push('Template:');
  lines.push(skill.systemPromptTemplate);
  return lines.join('\n');
}

/**
 * Get a server-side `ConvexHttpClient` from env. Throws a clear error when
 * the Convex URL isn't configured so the route surfaces it as a 500.
 */
export function getConvexClient(): ConvexHttpClient {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL ?? process.env.CONVEX_URL;
  if (!url) {
    throw new Error(
      'NEXT_PUBLIC_CONVEX_URL is not set — Skill Writer routes need it to fetch few-shot examples.',
    );
  }
  return new ConvexHttpClient(url);
}
