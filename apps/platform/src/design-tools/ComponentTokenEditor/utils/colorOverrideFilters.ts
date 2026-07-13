import type { ComponentTokenManifest, TokenOverrideValue } from '@oneui/shared';

const INTERACTION_PAINT_CHANNELS = new Set(['fill', 'stroke', 'text', 'underline']);
const INTERACTION_PAINT_TOKENS = new Set([
  'backgroundColor',
  'borderColor',
  'textColor',
  'underlineColor',
]);
const INTERACTION_PAINT_VARIANTS = new Set(['bold', 'subtle', 'ghost']);
const INTERACTION_PAINT_STATES = new Set(['hover', 'pressed']);
const INTERACTION_PAINT_SCOPES = new Set(['variant', 'variant-state']);

function getBaseTokenName(tokenName: string): string {
  return tokenName.split('.')[0] ?? tokenName;
}

function parseInteractionModifier(tokenName: string): { variant: string; state?: string } | null {
  const [, modifier, extra] = tokenName.split('.');
  if (!modifier || extra) return null;

  const [variant, state] = modifier.split('-');
  if (!INTERACTION_PAINT_VARIANTS.has(variant)) return null;
  if (state !== undefined && !INTERACTION_PAINT_STATES.has(state)) return null;

  return { variant, state };
}

function isScopedInteractionPaintOverride(
  tokenName: string,
  override: TokenOverrideValue
): boolean {
  const baseTokenName = getBaseTokenName(tokenName);
  if (!INTERACTION_PAINT_TOKENS.has(baseTokenName)) return false;
  if (!override.scope || !INTERACTION_PAINT_SCOPES.has(override.scope)) return false;

  const target = parseInteractionModifier(tokenName);
  if (!target) return false;

  const overrideState = override.state === 'default' ? undefined : override.state;
  if (override.variant && override.variant !== target.variant) return false;
  if (overrideState && overrideState !== target.state) return false;

  return true;
}

function isStructuredInteractionPaintOverride(
  tokenName: string,
  override: TokenOverrideValue
): boolean {
  const baseTokenName = getBaseTokenName(tokenName);
  if (
    override.variant &&
    override.channel &&
    INTERACTION_PAINT_CHANNELS.has(override.channel) &&
    INTERACTION_PAINT_TOKENS.has(baseTokenName) &&
    override.valueKind
  ) {
    return true;
  }

  return isScopedInteractionPaintOverride(tokenName, override);
}

export function isColorTokenOverride(
  tokenName: string,
  manifestTokens: ComponentTokenManifest['tokens']
): boolean {
  const baseTokenName = getBaseTokenName(tokenName);
  return manifestTokens[baseTokenName]?.category === 'color';
}

export function filterLocalColorOverrideMap(
  overrides: ReadonlyMap<string, TokenOverrideValue>,
  manifestTokens: ComponentTokenManifest['tokens']
): Map<string, TokenOverrideValue> {
  const next = new Map<string, TokenOverrideValue>();
  for (const [key, override] of overrides) {
    if (
      !isColorTokenOverride(key, manifestTokens) ||
      isStructuredInteractionPaintOverride(key, override)
    ) {
      next.set(key, override);
    }
  }
  return next;
}
