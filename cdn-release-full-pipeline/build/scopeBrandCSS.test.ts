import { describe, expect, it } from 'vitest';
import { scopeBrandCSS } from './scopeBrandCSS';

describe('scopeBrandCSS', () => {
  it('scopes material, surface, step, appearance, and boundary selectors', () => {
    const brandCSS = `
@layer brand {
  :root { --Primary-Bold: var(--Primary-Fill-Bold); }
  [data-surface="bold"] { --Surface-Halo-Gap: var(--Surface-Fill-Bold); }
  [data-surface-step="1300"] { --Primary-High: var(--Primary-Fill-Bold-High); }
  [data-mode="light"] [data-surface-step="1400"],
  [data-mode="light"] [data-surface-step="1500"] { --Primary-Default: var(--Primary-Fill-Default); }
  [data-mode="dark"] [data-surface-step="200"],
  [data-mode="dark"] [data-surface-step="300"] { --Primary-Default: var(--Primary-Fill-Default); }
  [data-appearance="secondary"] { --Text-High: var(--Secondary-High); }
  [data-context-boundary] { --Primary-Bold: var(--Primary-Fill-Bold); }
  [data-material="transparent"][data-media="dynamic"] { --Surface-Fill-Blend: var(--Surface-Fill-Blend); }
}
`;

    const result = scopeBrandCSS(brandCSS, '', 'jio', 'light');
    const scope = '[data-brand="jio"][data-mode="light"]';

    expect(result).toContain(`${scope} { --Primary-Bold: var(--Primary-Fill-Bold); }`);
    expect(result).toContain(`${scope} [data-surface="bold"]`);
    expect(result).toContain(`${scope} [data-surface-step="1300"]`);
    expect(result).toContain(`${scope} [data-surface-step="1400"]`);
    expect(result).toContain(`${scope} [data-surface-step="1500"]`);
    expect(result).not.toContain('[data-mode="light"] [data-brand="jio"]');
    expect(result).not.toContain('[data-mode="dark"]');
    expect(result).not.toContain(`${scope} ${scope}`);
    expect(result).toContain(`${scope} [data-appearance="secondary"]`);
    expect(result).toContain(`${scope} [data-context-boundary]`);
    expect(result).toContain(`${scope} [data-material="transparent"][data-media="dynamic"]`);
  });

  it('scopes theme-variant selectors with data-theme + data-mode', () => {
    const brandCSS = `@layer brand { :root { --Primary-Bold: red; } }`;
    const result = scopeBrandCSS(brandCSS, '', 'jio', 'dark', 'home');
    expect(result).toContain('[data-brand="jio"][data-theme="home"][data-mode="dark"]');
  });

  it('scopes only the leftmost simple selector of each comma entry, not mid-chain descendants', () => {
    const brandCSS = `
@layer brand {
  [data-material="transparent"][data-media="dynamic"][data-surface="bold"],
  [data-material="transparent"][data-media="dynamic"] [data-surface="bold"],
  [data-material="transparent"][data-media="dynamic"][data-surface="bold"] [data-material="transparent"][data-media="dynamic"]:not([data-surface="bold"]):not([data-surface="blend"]),
  [data-material="transparent"][data-media="dynamic"] [data-surface="bold"] [data-material="transparent"][data-media="dynamic"]:not([data-surface="bold"]):not([data-surface="blend"]) {
    --Text-High: rgba(0, 0, 0, 1);
  }
}
`;
    const result = scopeBrandCSS(brandCSS, '', 'jio', 'light');
    const scope = '[data-brand="jio"][data-mode="light"]';

    expect(result).toContain(
      `${scope} [data-material="transparent"][data-media="dynamic"][data-surface="bold"]`,
    );
    expect(result).not.toContain(`[data-surface="bold"] ${scope}`);
    expect(result).not.toContain(`${scope} ${scope}`);
  });
});
