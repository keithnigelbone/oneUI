/**
 * BuildAppsCard — sidebar card on the Brand Overview surfacing the DevLens
 * one-click setup. Layer-2 nudge.
 *
 * Renders next to the foundation selections + agents sections. Surfaces the
 * brand slug so the user can paste it straight into `oneui.config.json`.
 */

import { Button } from '@oneui/ui/components/Button';
import { Surface } from '@oneui/ui/components/Surface';

export interface BuildAppsCardProps {
  readonly brandName: string;
  readonly brandSlug: string;
}

const PLUGIN_INSTALL = 'claude /plugin install devlens-mobile-sdlc';

export function BuildAppsCard({ brandName, brandSlug }: BuildAppsCardProps): React.ReactElement {
  return (
    <Surface
      mode="subtle"
      appearance="primary"
      style={{
        padding: 'var(--Spacing-L)',
        borderRadius: 'var(--Shape-4-5)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--Spacing-M)',
      }}
      data-testid="brand-overview-build-apps"
    >
      <header>
        <h3
          style={{
            fontFamily: 'var(--Typography-Font-Primary)',
            fontSize: 'var(--Title-M-FontSize)',
            lineHeight: 'var(--Title-M-LineHeight)',
            fontWeight: 'var(--Title-M-FontWeight)',
            color: 'var(--Primary-High)',
            margin: 0,
          }}
        >
          Build apps with {brandName}
        </h3>
        <p
          style={{
            fontFamily: 'var(--Typography-Font-Primary)',
            fontSize: 'var(--Body-S-FontSize)',
            lineHeight: 'var(--Body-S-LineHeight)',
            fontWeight: 'var(--Body-FontWeight-Low)',
            color: 'var(--Primary-TintedA11y)',
            margin: 'var(--Spacing-2XS) 0 0',
          }}
        >
          DevLens auto-detects this brand from <code>oneui.config.json</code> and
          generates RN / web code that matches its tokens, surfaces, and recipes.
        </p>
      </header>

      <pre
        aria-label="oneui.config.json snippet"
        style={{
          fontFamily: 'var(--Typography-Font-Code)',
          fontSize: 'var(--Code-S-FontSize)',
          lineHeight: 'var(--Code-S-LineHeight)',
          background: 'var(--Surface-Halo-Gap, var(--Surface-Main))',
          padding: 'var(--Spacing-S) var(--Spacing-M)',
          borderRadius: 'var(--Shape-3-5)',
          margin: 0,
          overflowX: 'auto',
          color: 'var(--Text-High)',
        }}
      >
        {`{ "brandId": "${brandSlug}" }`}
      </pre>

      <div style={{ display: 'flex', gap: 'var(--Spacing-S)', flexWrap: 'wrap' }}>
        <Button
          attention="high"
          appearance="primary"
          size="m"
          onClick={() => {
            if (typeof window !== 'undefined') {
              window.open(
                'https://github.com/Shireesh1-Shukla_jplgit/Devlens',
                '_blank',
                'noopener,noreferrer',
              );
            }
          }}
        >
          Set up DevLens
        </Button>
        <Button
          attention="medium"
          appearance="primary"
          size="m"
          onClick={() => {
            if (typeof navigator !== 'undefined' && navigator.clipboard) {
              void navigator.clipboard.writeText(PLUGIN_INSTALL);
            }
          }}
        >
          Copy install command
        </Button>
      </div>
    </Surface>
  );
}
