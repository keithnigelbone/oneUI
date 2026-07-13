import { JIO_WEB_ALPHA_COMPONENTS } from '@oneui/ui/registry/jioAlphaCatalog';
import type { ComponentDocumentationSpec } from '@oneui/shared';
import { Badge } from '@oneui/ui/components/Badge';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { COMPONENT_DOC_SPECS } from '@/generated/componentSpecs';
import { ComponentPreview } from './ComponentPreview';
import styles from './DocComponents.module.css';

export function ComponentIndex() {
  return (
    <div className={styles.cardGrid}>
      {JIO_WEB_ALPHA_COMPONENTS.map((component) => (
        <Link className={styles.card} key={component.name} href={`/docs/components/${component.name.toLowerCase()}`}>
          <h2 className={styles.cardTitle}>{component.name}</h2>
          <p className={styles.cardText}>{('notes' in component ? component.notes : undefined) ?? component.importPath}</p>
          <ComponentBadges
            status={component.status}
            surfaceAware={component.surfaceAware}
            multiAccent={component.multiAccent}
            ariaLabel={`${component.name} support`}
          />
        </Link>
      ))}
    </div>
  );
}

export function ComponentDoc({ name }: { name: string }) {
  const entry = JIO_WEB_ALPHA_COMPONENTS.find((component) => component.name === name);
  const spec = readComponentSpec(name);

  if (!entry || !spec) {
    return (
      <Callout title="Component docs missing">
        This component is not currently part of the Jio web alpha documentation surface.
      </Callout>
    );
  }

  return (
    <div className={styles.section}>
      <ComponentBadges
        status={entry.status}
        surfaceAware={entry.surfaceAware}
        multiAccent={entry.multiAccent}
        ariaLabel={`${name} metadata`}
      />

      <section className={styles.section} id="preview">
        <h2>Preview</h2>
        <ComponentPreview name={name} />
      </section>

      <section className={styles.section} id="installation">
        <h2>Installation</h2>
        <p>Install the package set once, then import this component by path.</p>
        <pre>
          <code>{`pnpm add @oneui/ui @oneui/tokens @oneui/shared`}</code>
        </pre>
      </section>

      <section className={styles.section} id="usage">
        <h2>Usage</h2>
        <pre>
          <code>{`import { ${name} } from '${entry.importPath}';`}</code>
        </pre>
        {spec.codeSnippets[0] ? (
          <pre>
            <code>{spec.codeSnippets[0].code}</code>
          </pre>
        ) : null}
      </section>

      <section className={styles.section} id="intent">
        <h2>Intent</h2>
        <p>{spec.intentAndPurpose.intent.value}</p>
      </section>

      <section className={styles.section} id="composition">
        <h2>Composition Rules</h2>
        <BulletList title="Requires" items={spec.compositionRules.requires.value} />
        <BulletList title="Allows" items={spec.compositionRules.allows.value} />
        <BulletList title="Forbids" items={spec.compositionRules.forbids.value} />
      </section>

      <section className={styles.section} id="variants">
        <h2>Variant Logic</h2>
        <div className={styles.tableWrap}>
          <table>
            <thead>
              <tr>
                <th>Variant</th>
                <th>Use when</th>
                <th>Avoid when</th>
              </tr>
            </thead>
            <tbody>
              {spec.variantLogic.rules.map((rule) => (
                <tr key={rule.name}>
                  <td>
                    <code>{rule.name}</code>
                  </td>
                  <td>{rule.useWhen.value.join(', ')}</td>
                  <td>{rule.avoidWhen?.value.join(', ') ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className={styles.section} id="api-reference">
        <h2>API Reference</h2>
        <h3>Props</h3>
        <div className={styles.tableWrap}>
          <table>
            <thead>
              <tr>
                <th>Prop</th>
                <th>Type</th>
                <th>Required</th>
                <th>Default</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {spec.props.map((prop) => (
                <tr key={prop.name}>
                  <td>
                    <code>{prop.name}</code>
                  </td>
                  <td>
                    <code>{prop.type}</code>
                  </td>
                  <td>{prop.required ? 'Yes' : 'No'}</td>
                  <td>{prop.defaultValue ?? '-'}</td>
                  <td>{prop.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {spec.slots.length > 0 ? (
        <section className={styles.section} id="slots">
          <h2>Slots</h2>
          <div className={styles.tableWrap}>
            <table>
              <thead>
                <tr>
                  <th>Slot</th>
                  <th>Types</th>
                  <th>Tokens</th>
                </tr>
              </thead>
              <tbody>
                {spec.slots.map((slot) => (
                  <tr key={slot.name}>
                    <td>
                      <code>{slot.name}</code>
                    </td>
                    <td>{slot.types.join(', ')}</td>
                    <td>{slot.tokens.join(', ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </div>
  );
}

export function Callout({ children, title }: { children: ReactNode; title?: string }) {
  return (
    <aside className={styles.callout}>
      {title ? <p className={styles.calloutTitle}>{title}</p> : null}
      <div className={styles.calloutContent}>{children}</div>
    </aside>
  );
}

function ComponentBadges({
  ariaLabel,
  multiAccent,
  status,
  surfaceAware,
}: {
  ariaLabel: string;
  multiAccent?: boolean;
  status: string;
  surfaceAware?: boolean;
}) {
  return (
    <div className={styles.metaList} aria-label={ariaLabel}>
      <Badge appearance="neutral" size="s" variant="subtle">
        {status}
      </Badge>
      {surfaceAware ? (
        <Badge appearance="neutral" size="s" variant="ghost">
          surface-aware
        </Badge>
      ) : null}
      {multiAccent ? (
        <Badge appearance="neutral" size="s" variant="ghost">
          multi-accent
        </Badge>
      ) : null}
    </div>
  );
}

function BulletList({ items, title }: { items: string[]; title: string }) {
  return (
    <div>
      <h3>{title}</h3>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function readComponentSpec(name: string): ComponentDocumentationSpec | null {
  return (COMPONENT_DOC_SPECS as Record<string, ComponentDocumentationSpec>)[name] ?? null;
}
