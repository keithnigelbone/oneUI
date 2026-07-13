'use client';

import { Button } from '@oneui/ui/components/Button';
import { Surface } from '@oneui/ui/components/Surface';
import styles from './DocComponents.module.css';

export function InstallSnippet() {
  return (
    <pre>
      <code>{`pnpm add @oneui/ui @oneui/tokens @oneui/shared`}</code>
    </pre>
  );
}

export function SurfaceRuleCallout() {
  return (
    <Surface mode="bold" className={styles.exampleSurface}>
      <h2>Use Surface for branded backgrounds</h2>
      <p>
        Components adapt through the <code>data-surface</code> cascade. A raw div with a background color does not
        remap child tokens.
      </p>
      <div className={styles.exampleActions}>
        <Button variant="bold">Bold action</Button>
        <Button variant="subtle">Secondary</Button>
        <Button variant="ghost" appearance="neutral">
          Low attention
        </Button>
      </div>
    </Surface>
  );
}

export function BrandAwareExample() {
  return (
    <div className={styles.section}>
      <Surface mode="subtle" className={styles.exampleSurface}>
        <h2>Brand-aware preview</h2>
        <p>Switch brand, theme, or density in the header. This example reads the same runtime tokens as consumers.</p>
        <div className={styles.exampleActions}>
          <Button appearance="primary" variant="bold">
            Get started
          </Button>
          <Button appearance="secondary" variant="subtle">
            Learn more
          </Button>
          <Button appearance="neutral" variant="ghost">
            View specs
          </Button>
        </div>
      </Surface>

      <Surface mode="bold" className={styles.exampleSurface}>
        <h2>Bold surface context</h2>
        <p>The same components remain readable on bold brand surfaces because tokens remap below this container.</p>
        <div className={styles.exampleActions}>
          <Button appearance="primary" variant="bold">
            Primary
          </Button>
          <Button appearance="primary" variant="subtle">
            Subtle
          </Button>
          <Button appearance="neutral" variant="ghost">
            Neutral ghost
          </Button>
        </div>
      </Surface>
    </div>
  );
}
