/**
 * Composition Phased Compiler — Junior-designer workflow envelope around the
 * standard composition compiler. Each phase rewrites the user prompt with a
 * preamble that restricts what the LLM should output, while the underlying
 * rules + component reference stay constant.
 *
 * The shape of the AST never changes between phases — `skeleton` outputs are
 * the same `ASTRoot` schema as `polish` outputs, just with placeholder
 * elements (`<div data-slot-placeholder="true" data-slot-label="hero" />`)
 * standing in for components that haven't been chosen yet. That keeps the
 * downstream renderer, validator, and version stack identical across phases.
 */

import type { GenerationPhase } from './compositionTypes';

// ---------------------------------------------------------------------------
// Phase preambles — appended to the user prompt before generation.
//
// We deliberately do NOT change the system prompt between phases: the rules,
// component reference, and brand summary stay constant so the model can't
// drift out of the design philosophy. Only the *task framing* differs.
// ---------------------------------------------------------------------------

const PHASE_DIRECTIVES: Record<GenerationPhase, string> = {
  skeleton: `# Phase 1 of 3 — SKELETON

Generate the layout SHAPE only. No real components yet, no copy.

Output rules:
- Use real Surface containers (Surface, ContentBlock, JioRibbon) for top-level structure.
- For every region inside containers, emit a placeholder element of this exact form:
  {
    "id": "<unique>",
    "kind": "element",
    "tag": "div",
    "props": {
      "data-slot-placeholder": "true",
      "data-slot-label": "<short kebab-case role, e.g. hero, data-row, cta-group, list-item>",
      "data-slot-hint": "<one short sentence explaining what will fill this slot>"
    },
    "children": []
  }
- Use Surface modes correctly: default for the page, subtle/minimal for grouped sections, bold ONLY for hero moments.
- Apply the spacing rhythm (Spacing-5/6 between sections, Spacing-4 between related items) on the containers via inline gap styles using numeric --Spacing-* tokens.
- DO NOT emit Button, Input, Card, Chip, or any other concrete component yet — those land in phase 2.
- DO NOT emit copy text. Slot labels are the only text in this phase.

Goal: a labelled wireframe the designer can confirm in 5 seconds.`,

  components: `# Phase 2 of 3 — COMPONENTS

You will be given the SKELETON AST as \`priorAst\`. Replace every \`data-slot-placeholder="true"\` element with the appropriate real component(s), preserving the surrounding Surface structure exactly.

Output rules:
- Keep all Surface containers, layout elements, and inline styles from the prior AST byte-identical UNLESS the slot's component requires a structural change (e.g. a stat tile region needs a flex row of Cards).
- Replace each placeholder by reading its \`data-slot-label\` and \`data-slot-hint\`, then choosing the right component:
  - "hero" → Title/Headline + ContentBlock + Button (one bold)
  - "data-row" → flex row of stat Cards
  - "cta-group" → 1 bold Button + 0–1 ghost Buttons
  - "list-item" → ListItem with start/end slots
  - "input" → Input or InputField with proper Label
  - …etc. Reach for the component most directly named by the slot label.
- For copy, use bracketed placeholders: "[Hero headline]", "[Subtitle copy]", "[CTA label]". Real copy lands in phase 3.
- Honour the attention pyramid: at most one bold/high-attention component per region.
- Wire correct typography roles (Display/Headline/Title for headings, Body for paragraphs, Label for buttons).

Goal: every placeholder becomes a real component while the layout shape stays recognisable from phase 1.`,

  polish: `# Phase 3 of 3 — POLISH

You will be given the COMPONENTS AST as \`priorAst\`. The components are right; now make the composition shippable.

Output rules:
- Replace every "[bracketed]" placeholder with real, voice-appropriate copy that fits the brand and the brief.
- Apply the final attention pass:
  - Verify exactly one bold/high-attention element exists per region (the "120% detail").
  - Push secondary actions to subtle/ghost variants (the "80% rest").
  - Tag the hero element with attention="high" if it isn't already.
- Refine typography role assignments — heroes use Display, page titles Headline, sections Title, body Body, UI text Label.
- Preserve the AST structure from phase 2 unless a component genuinely needs to be swapped for a better fit. Do not restructure layout.
- Add motion / elevation hints only where they functionally aid hierarchy (FAB, popover, hero rise).

Goal: a ready-to-ship composition that reads as one cohesive design choice, not three iterations stitched together.`,
};

export interface BuildPhasedPromptArgs {
  phase: GenerationPhase;
  /** Original user brief — same for all three phases. */
  userPrompt: string;
  /** Brand name for prompt interpolation. */
  brandName?: string;
  /** Output of the prior phase, when this is phase 2 or 3. JSON-stringified ASTRoot. */
  priorAst?: string;
}

/**
 * Build the user-side prompt for a given phase. Combine with the standard
 * composition system prompt (from `compileCompositionRules`) — together they
 * form the full request to the LLM.
 *
 * Pure function. The `priorAst` is the SOLE channel through which phases
 * stay consistent; any structural decision the model makes in phase 1
 * propagates because the model literally sees its own prior output.
 */
export function buildPhasedUserPrompt(args: BuildPhasedPromptArgs): string {
  const { phase, userPrompt, brandName, priorAst } = args;

  const lines: string[] = [];
  lines.push(PHASE_DIRECTIVES[phase]);
  lines.push('');

  if (brandName) lines.push(`Brand: ${brandName}.`);
  lines.push(`Brief: ${userPrompt}`);
  lines.push('');

  if (phase !== 'skeleton') {
    if (!priorAst) {
      throw new Error(
        `buildPhasedUserPrompt: phase "${phase}" requires priorAst (output of the previous phase)`,
      );
    }
    lines.push('## priorAst (your previous output to refine — do NOT discard it)');
    lines.push('```json');
    lines.push(priorAst);
    lines.push('```');
    lines.push('');
  }

  lines.push('Output ONLY the JSON AST. No commentary, no markdown fences.');

  return lines.join('\n');
}
