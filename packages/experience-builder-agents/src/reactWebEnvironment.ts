/**
 * React web / OneUI runtime contract injected into generation prompts.
 *
 * This is server-side context only: it makes the planner/design/IR steps target
 * the actual AST preview route instead of improvising browser-default markup.
 */

export const REACT_WEB_ONEUI_ENVIRONMENT_CONTRACT = [
  'React web + OneUI runtime contract:',
  '- Target output is Jio Experience IR compiled to the OneUI AST renderer; never emit HTML, JSX, CSS, or raw browser links.',
  '- Preview route mounts IconProvider, JioIconsInit, FoundationStyleProvider, theme, platform, density, and brand attributes.',
  '- Use only registry components and semantic icon names. Do not invent icon sets, raw SVGs, icon fonts, colors, fonts, or dimensions.',
  '- Every non-default or tinted section must be a Surface recipe with a canonical surfaceMode. Never simulate surfaces with raw backgrounds.',
  '- Page structure must follow the selected pagePatternId and ordered section recipes. Each section needs nested layout, real copy, and a clear role.',
  '- Generated layouts must look like finished React product UI: header/hero/content/proof/action hierarchy for web pages, not a flat list of controls.',
  '- Verification blocks ready status on missing brand CSS variables, blank screenshots, browser-default links/layout, missing icon loader, dropped critical props, or unsafe iframe sandbox flags.',
].join('\n');

export function renderReactWebOneUIEnvironmentContract(): string {
  return REACT_WEB_ONEUI_ENVIRONMENT_CONTRACT;
}
