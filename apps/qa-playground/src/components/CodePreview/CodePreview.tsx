'use client';

import { useMemo } from 'react';
import { Button } from '@oneui/ui/components/Button';
import { Icon } from '@oneui/ui/components/Icon';
import { normalizeCodeForDisplay } from './codeFormatter';
import { highlightCode } from './codeHighlighter';
import type { CodePreviewLanguage } from './syntaxTheme';
import styles from './CodePreview.module.css';

export type CodePreviewTab = 'jsx' | 'json';

export type CodePreviewProps = {
  language: CodePreviewLanguage;
  code: string;
  'data-testid'?: string;
  'aria-label'?: string;
};

export function CodePreview({
  language,
  code,
  'data-testid': dataTestId,
  'aria-label': ariaLabel,
}: CodePreviewProps) {
  const displayCode = useMemo(() => normalizeCodeForDisplay(code), [code]);
  const highlighted = useMemo(
    () => highlightCode(displayCode, language),
    [displayCode, language],
  );

  return (
    <div className={styles.panel}>
      <pre
        className={styles.code}
        data-testid={dataTestId}
        tabIndex={0}
        role="region"
        aria-label={ariaLabel}
      >
        <code>{highlighted}</code>
      </pre>
    </div>
  );
}

export type CodePreviewTabsProps = {
  value: CodePreviewTab;
  onValueChange: (next: CodePreviewTab) => void;
  copied: boolean;
  onCopy: () => void;
  copyTestId?: string;
};

export function CodePreviewTabs({
  value,
  onValueChange,
  copied,
  onCopy,
  copyTestId,
}: CodePreviewTabsProps) {
  return (
    <div className={styles.tabsRow}>
      <ul className={styles.tabList} role="tablist" aria-label="Code output format">
        <li role="presentation">
          <button
            type="button"
            role="tab"
            id="qa-code-tab-jsx"
            aria-selected={value === 'jsx'}
            aria-controls="qa-code-panel"
            className={`${styles.tab} ${value === 'jsx' ? styles.tabActive : ''}`}
            onClick={() => onValueChange('jsx')}
          >
            Code (JSX)
          </button>
        </li>
        <li role="presentation">
          <button
            type="button"
            role="tab"
            id="qa-code-tab-json"
            aria-selected={value === 'json'}
            aria-controls="qa-code-panel"
            className={`${styles.tab} ${value === 'json' ? styles.tabActive : ''}`}
            onClick={() => onValueChange('json')}
          >
            Props (JSON)
          </button>
        </li>
      </ul>
      <div className={styles.copyWrap} title="Copy">
        <Button
          attention="low"
          size={8}
          appearance="neutral"
          start={<Icon icon="copy" size="4" emphasis="medium" aria-hidden />}
          onClick={onCopy}
          data-testid={copyTestId}
        >
          {copied ? 'Copied' : 'Copy'}
        </Button>
      </div>
    </div>
  );
}

export type StorybookCodePanelProps = {
  codeTab: CodePreviewTab;
  onCodeTabChange: (next: CodePreviewTab) => void;
  jsxCode: string;
  jsonCode: string;
  copied: boolean;
  onCopy: () => void;
};

/** Tabs + highlighted code panel — drop-in for storybook code section. */
export function StorybookCodePanel({
  codeTab,
  onCodeTabChange,
  jsxCode,
  jsonCode,
  copied,
  onCopy,
}: StorybookCodePanelProps) {
  const activeCode = codeTab === 'jsx' ? jsxCode : jsonCode;

  return (
    <div className={styles.root}>
      <CodePreviewTabs
        value={codeTab}
        onValueChange={onCodeTabChange}
        copied={copied}
        onCopy={onCopy}
        copyTestId="qa-storybook-copy-code"
      />
      <div id="qa-code-panel" role="tabpanel" aria-labelledby={`qa-code-tab-${codeTab}`}>
        <CodePreview
          language={codeTab}
          code={activeCode}
          data-testid="qa-storybook-code-block"
          aria-label={codeTab === 'jsx' ? 'Generated JSX' : 'Generated JSON props'}
        />
      </div>
    </div>
  );
}
