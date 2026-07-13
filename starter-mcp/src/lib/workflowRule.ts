/**
 * Single source of truth for the OneUI build workflow rule.
 *
 * Imported by:
 *   - hooks/scripts/ensure-rules.mjs  (SessionStart auto-install, via dist/)
 *   - src/index.ts                    (--install-rules CLI flag)
 *   - src/server.ts                   (MCP protocol instructions)
 *
 * Targets two rule surfaces:
 *   1. ~/.claude/rules/oneui-workflow.md   (Claude Code modular rule, path-scoped)
 *   2. MCP server `instructions` field      (protocol-level)
 *
 * Pattern mirrors devlens's `workflow-rule-body.ts` (one body, several builders).
 */

export const ONEUI_RULE_MARKER_START = '<!-- ONEUI_WORKFLOW_RULE_START -->';
export const ONEUI_RULE_MARKER_END = '<!-- ONEUI_WORKFLOW_RULE_END -->';

export const WORKFLOW_RULE_BODY = `When building OneUI/JDS UI — React web (\`@jds4/oneui-react\`) or React Native
(\`@oneui/ui-native\`) — follow this workflow.

## Phase 1: Context & Rules
- \`get_project_context\` — resolve brand, installed version, platform, components
- \`get_core_invariants\` + \`get_skill("oneui")\` — always-apply correctness rules & workflow

## Phase 2: Knowledge & Components
- \`search_design_system\` / \`list_skills\` + \`get_skill\` — load relevant guidance
- \`list_components\` + \`get_component_info\` — REAL props only, never invent an API
- \`get_brand_tokens\` (default \`jio\`) + \`get_surface_guide\` (before any tinted/dark bg)

## Phase 3: Build
- \`<BrandProvider>\` (web) / \`<OneUIBrandProvider>\` (native)
- Every tinted/dark/coloured area → \`<Surface mode="...">\`, never a bg on a raw div/View
- Tokens only: zero literals; role-explicit typography; no legacy \`--Typography-*\`
- Figma → RN: drive \`figma_to_code\` / the \`oneui:figma-to-native\` skill

## Phase 4: Validate & Self-heal (MANDATORY)
- \`validate_oneui_code\` (platform "react" | "reactnative") on every written file
- Self-heal up to 3 passes until the gate returns "All clear"
- Lint/typecheck passing is NOT the code gate

## Phase 5: Verify on device (React Native — MANDATORY for any Figma → RN screen)
- Build & launch: boot a simulator/emulator, \`expo run:ios\` / \`run:android\`
- Screenshot the running screen: \`xcrun simctl io booted screenshot ...\` (iOS) /
  \`adb -s <device> exec-out screencap -p > ...\` (Android)
- Fetch the Figma reference for the same node-id (Figma MCP \`get_screenshot\`)
- Compare: read both images and enumerate concrete mismatches (surface/appearance,
  colour-role resolution, spacing scale, typography, icons/images, clipping, scrim)
- Fix in the \`.native.tsx\` → re-run \`validate_oneui_code\` → rebuild → re-screenshot → re-compare
- Completion contract: loop until the rendered screen matches the Figma frame. Cap 5
  iterations. If not converged, return NEEDS_HUMAN_INPUT with specific blockers — NEVER
  silently declare success on \`validate_oneui_code\` alone. Permitted blockers only after
  ≥3 distinct fix attempts (Figma node 404, platform-incapable design feature, or plateaued
  similarity). If no working device / Figma screenshot tool, say so explicitly rather than
  claiming done.

## Hard Rules
- No literals (colors, px, font-size/weight/line-height)
- Real component props only — from \`get_component_info\`
- Surface discipline: tinted/dark → \`<Surface>\`, no decorative strokes on top
- \`validate_oneui_code\` clean is required; for Figma → RN the device verify loop (Phase 5)
  is ALSO required — a clean gate is not a verified screen`;

/** `~/.claude/rules/oneui-workflow.md` — path-scoped modular Claude Code rule. */
export function buildClaudeModularRule(): string {
  return [
    '---',
    'paths: "**/*.tsx,**/*.ts,**/*.jsx,**/*.js"',
    '---',
    '',
    '## OneUI Build Workflow',
    '',
    WORKFLOW_RULE_BODY,
    '',
  ].join('\n');
}

/** Marker-bracketed block for splicing into CLAUDE.md / AGENTS.md (not wired up yet). */
export function buildMarkedSection(): string {
  return [
    ONEUI_RULE_MARKER_START,
    '## OneUI Build Workflow',
    '',
    WORKFLOW_RULE_BODY,
    ONEUI_RULE_MARKER_END,
  ].join('\n');
}

/** MCP server `instructions` field — registry/setup preamble + the phase body. */
export function buildMcpInstructions(manifestLine: string): string {
  return [
    'OneUI / JDS design-system MCP. Use it to build React (web) apps that follow the OneUI design system.',
    'FIRST, for any install/setup: run check_oneui_registry — the @jds4/* packages are on a private',
    'Azure DevOps feed (JIO-DS-ONE-UI). If not connected, guide the user through .npmrc + PAT setup',
    '(get_registry_setup / oneui://registry-setup) before installing. Never write or log a real PAT.',
    '',
    WORKFLOW_RULE_BODY,
    '',
    'For a new PRD, use the /oneui-build-from-prd prompt — it orchestrates all steps and the self-heal loop automatically.',
    'For a fresh WEB project, run setup_oneui_project first; keep packages current with check/update_oneui_packages.',
    'For a fresh REACT NATIVE app, run create_oneui_native_app — it returns the @oneui/create-native-app CLI',
    'command (on the private JIO-DS-OneUI-Native feed). The CLI prompts for the PAT interactively, so present',
    'the command for the USER to run in their own terminal; do NOT run it from a non-interactive shell.',
    manifestLine,
  ].join('\n');
}
