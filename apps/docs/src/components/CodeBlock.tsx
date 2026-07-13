'use client';

import { Button } from '@oneui/ui/components/Button';
import { Surface } from '@oneui/ui/components/Surface';
import type { ComponentProps, ReactNode } from 'react';
import { isValidElement, useCallback, useMemo, useState } from 'react';
import styles from './DocComponents.module.css';

type CodeBlockProps = ComponentProps<'pre'>;

export function CodeBlock({ children, className, ...props }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const code = useMemo(() => extractText(children), [children]);

  const handleCopy = useCallback(() => {
    if (!code) return;

    void navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    });
  }, [code]);

  return (
    <Surface mode="minimal" className={styles.codeBlock}>
      <div className={styles.codeToolbar}>
        <Button appearance="neutral" size="s" variant="ghost" onPress={handleCopy}>
          {copied ? 'Copied' : 'Copy'}
        </Button>
      </div>
      <pre className={[styles.codePre, className].filter(Boolean).join(' ')} {...props}>
        {children}
      </pre>
    </Surface>
  );
}

function extractText(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(extractText).join('');
  if (isValidElement<{ children?: ReactNode }>(node)) return extractText(node.props.children);
  return '';
}
