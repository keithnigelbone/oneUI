'use client';

import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { ComponentMeta } from '@oneui/shared';
import { Button } from '@oneui/ui/components/Button';
import { IconButton } from '@oneui/ui/components/IconButton';
import { Collapsible } from '@oneui/ui/components/Collapsible';
import { Icon } from '@oneui/ui/components/Icon';
import { StorybookCodePanel } from '@/components/CodePreview';
import { StorybookLivePreview } from './StorybookLivePreview';
import { QaStorybookControlField } from './QaStorybookControlField';
import {
  buildInitialStorybookProps,
  formatApiValue,
  getStorybookPlaygroundProps,
  mergeStorybookPreviewProps,
  propTableDescription,
  resetStorybookProps,
} from './storybookPlaygroundState';
import { buildStorybookJsxPreview, buildStorybookJsonPreview } from './storybookJsxPreview';
import { resolveStorybookExternalUrl } from './qaStorybookNav';
import styles from './qa-storybook.module.css';

type Viewport = 'mobile' | 'tablet' | 'desktop';
type CodeTab = 'jsx' | 'json';

const VIEWPORT_MAX_WIDTH: Record<Viewport, string> = {
  mobile: '375px',
  tablet: '768px',
  desktop: '100%',
};

function ControlSection({
  index,
  name,
  hint,
  children,
}: {
  index: number;
  name: string;
  hint: string;
  children: ReactNode;
}) {
  return (
    <section className={styles.controlSection}>
      <div className={styles.controlSectionHeader}>
        <span className={styles.controlIndex}>{index}.</span>
        <h3 className={styles.controlName}>{name}</h3>
      </div>
      <p className={styles.controlHint}>{hint}</p>
      <div className={styles.controlField}>{children}</div>
    </section>
  );
}

export function QaStorybookComponentPlayground({ meta }: { meta: ComponentMeta }) {
  const playgroundPropDefs = useMemo(() => getStorybookPlaygroundProps(meta), [meta]);
  const [props, setProps] = useState<Record<string, unknown>>(() => buildInitialStorybookProps(meta));
  const [viewport, setViewport] = useState<Viewport>('desktop');
  const [codeTab, setCodeTab] = useState<CodeTab>('jsx');
  const [copied, setCopied] = useState(false);

  const previewProps = useMemo(() => mergeStorybookPreviewProps(meta, props), [meta, props]);
  const jsxPreview = useMemo(() => buildStorybookJsxPreview(meta, previewProps), [meta, previewProps]);
  const jsonPreview = useMemo(() => buildStorybookJsonPreview(previewProps), [previewProps]);
  const codePreview = codeTab === 'jsx' ? jsxPreview : jsonPreview;

  const apiRows = useMemo(() => {
    const playgroundNames = new Set(playgroundPropDefs.map((p) => p.name));
    const tableProps = meta.props.filter(
      (p) => playgroundNames.has(p.name) || p.type === 'enum' || p.type === 'boolean',
    );

    return tableProps.map((prop) => ({
      property: prop.name,
      value: formatApiValue(previewProps[prop.name] ?? prop.defaultValue),
      description: propTableDescription(prop),
    }));
  }, [meta.props, playgroundPropDefs, previewProps]);

  const reset = useCallback(() => {
    setProps(resetStorybookProps(meta));
    setViewport('desktop');
  }, [meta]);

  const updateProp = useCallback((name: string, value: unknown) => {
    setProps((prev) => ({ ...prev, [name]: value }));
  }, []);

  const copyCode = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(codePreview);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  }, [codePreview]);

  const storybookUrl = resolveStorybookExternalUrl(meta);

  return (
    <>
      <header className={styles.pageHeader}>
        <Link to="/" className={styles.backLink}>
          <Icon icon="chevronLeft" size="3.5" emphasis="low" aria-hidden />
          Back to Components
        </Link>

        <div className={styles.headerRow}>
          <div className={styles.headerCopy}>
            <h1 className={styles.pageTitle}>{meta.displayName}</h1>
            <p className={styles.pageDescription}>
              {meta.description.split(/(?<=[.!?])\s+/)[0] ?? meta.description}
            </p>
          </div>

          <div className={styles.headerActions}>
            <Button
              attention="medium"
              size={10}
              appearance="primary"
              className={styles.storybookLinkBtn}
              end={<Icon icon="externalLink" size="3.5" emphasis="low" aria-hidden />}
              onClick={() => window.open(storybookUrl, '_blank', 'noopener,noreferrer')}
              data-testid="qa-storybook-view-external"
            >
              View in Storybook
            </Button>
            <IconButton
              attention="low"
              size={10}
              appearance="neutral"
              icon="components"
              className={styles.codeJumpBtn}
              aria-label="Jump to code section"
              onClick={() =>
                document.getElementById('qa-storybook-code-section')?.scrollIntoView({ behavior: 'smooth' })
              }
              data-testid="qa-storybook-jump-code"
            />
          </div>
        </div>
      </header>

      <div className={styles.playgroundWorkspace}>
        <div className={styles.playgroundGrid}>
          <aside className={styles.controlsColumn} data-testid="qa-storybook-controls">
            <h2 className={styles.columnHeading}>Controls</h2>
            <div className={styles.controlsStack}>
              {playgroundPropDefs.length === 0 ? (
                <p className={styles.controlHint}>
                  No interactive props are defined for this component. Preview uses catalog defaults.
                </p>
              ) : (
                playgroundPropDefs.map((prop, index) => (
                  <ControlSection
                    key={prop.name}
                    index={index + 1}
                    name={prop.name}
                    hint={propTableDescription(prop)}
                  >
                    <QaStorybookControlField
                      prop={prop}
                      value={props[prop.name]}
                      onChange={(next) => updateProp(prop.name, next)}
                    />
                  </ControlSection>
                ))
              )}
            </div>
          </aside>

          <div className={styles.rightColumn}>
            <h2 className={styles.columnHeading}>Live Preview</h2>

            <div
              className={styles.previewFrame}
              style={{ maxWidth: VIEWPORT_MAX_WIDTH[viewport] }}
              data-testid="qa-storybook-preview"
            >
              <StorybookLivePreview meta={meta} props={props} />
            </div>

            <div className={styles.previewToolbar}>
              <div className={styles.viewportGroup} role="group" aria-label="Preview viewport">
                <IconButton
                  attention={viewport === 'mobile' ? 'medium' : 'low'}
                  size={10}
                  appearance="neutral"
                  icon="smartphone"
                  aria-label="Mobile viewport"
                  aria-pressed={viewport === 'mobile'}
                  onClick={() => setViewport('mobile')}
                />
                <IconButton
                  attention={viewport === 'tablet' ? 'medium' : 'low'}
                  size={10}
                  appearance="neutral"
                  icon="tablet"
                  aria-label="Tablet viewport"
                  aria-pressed={viewport === 'tablet'}
                  onClick={() => setViewport('tablet')}
                />
                <IconButton
                  attention={viewport === 'desktop' ? 'medium' : 'low'}
                  size={10}
                  appearance="neutral"
                  icon="monitor"
                  aria-label="Desktop viewport"
                  aria-pressed={viewport === 'desktop'}
                  onClick={() => setViewport('desktop')}
                />
              </div>
              <Button
                attention="low"
                size={10}
                appearance="neutral"
                className={styles.resetBtn}
                onClick={reset}
                data-testid="qa-storybook-reset"
              >
                Reset
              </Button>
            </div>

            <section
              id="qa-storybook-code-section"
              className={styles.codeSection}
              data-testid="qa-storybook-code-section"
            >
              <div className={styles.codeSplit}>
                <StorybookCodePanel
                  codeTab={codeTab}
                  onCodeTabChange={setCodeTab}
                  jsxCode={jsxPreview}
                  jsonCode={jsonPreview}
                  copied={copied}
                  onCopy={copyCode}
                />

                <div className={styles.apiTableWrap}>
                  <table className={styles.apiTable} data-testid="qa-storybook-api-table">
                    <thead>
                      <tr>
                        <th scope="col">Property</th>
                        <th scope="col">Value</th>
                        <th scope="col">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {apiRows.map((row) => (
                        <tr key={row.property}>
                          <td>
                            <code className={styles.propertyBadge}>{row.property}</code>
                          </td>
                          <td>
                            <code className={styles.valueBadge}>{row.value}</code>
                          </td>
                          <td className={styles.apiDescription}>{row.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      <section className={styles.usageSection}>
        <Collapsible defaultOpen={false} className={styles.usageCollapsible}>
          <Collapsible.Trigger className={styles.usageTrigger}>
            <span className={styles.usageTriggerLabel}>Usage Guidelines</span>
            <Icon icon="chevronDown" size="4" emphasis="medium" aria-hidden className={styles.usageChevron} />
          </Collapsible.Trigger>
          <Collapsible.Panel className={styles.usagePanel}>
            <p className={styles.usageBody}>{meta.description}</p>
            {meta.tags?.length ? (
              <p className={styles.usageTags}>Tags: {meta.tags.join(', ')}</p>
            ) : null}
          </Collapsible.Panel>
        </Collapsible>
      </section>
    </>
  );
}
