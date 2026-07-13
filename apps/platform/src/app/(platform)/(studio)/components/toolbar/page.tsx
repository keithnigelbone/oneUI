/**
 * components/toolbar/page.tsx
 *
 * Toolbar component showcase page
 * Displays variants, sizes, states, and usage examples
 */

'use client';

import React from 'react';
import { Toolbar } from '@oneui/ui/components/Toolbar';
import { Button } from '@oneui/ui/components/Button';
import { IconButton } from '@oneui/ui/components/IconButton';
import { Separator } from '@oneui/ui/components/Separator';
import { Toggle } from '@oneui/ui/components/Toggle';
import { FoundationCard } from '@/design-tools/Foundations/shared';
import styles from '../component.module.css';

export default function ToolbarPage() {
  const [isBold, setIsBold] = React.useState(false);
  const [isItalic, setIsItalic] = React.useState(false);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Toolbar</h1>
        <p className={styles.description}>
          A container for grouping a set of controls, such as buttons, toggles, or dropdowns.
        </p>
      </div>
      <div className={styles.content}>
        <FoundationCard title="Horizontal Toolbar" description="Default horizontal layout.">
          <div className={styles.showcase}>
            <Toolbar orientation="horizontal" style={{
              padding: 'var(--Spacing-3-5)',
              backgroundColor: 'var(--Surface-Subtle)',
              borderRadius: 'var(--Shape-4)',
              gap: 'var(--Spacing-3-5)',
              display: 'flex',
              alignItems: 'center'
            }}>
              <Button size="small" attention="low">Cut</Button>
              <Button size="small" attention="low">Copy</Button>
              <Button size="small" attention="low">Paste</Button>
              <Separator orientation="vertical" style={{ height: '24px' }} />
              <Button size="small" attention="low">Undo</Button>
              <Button size="small" attention="low">Redo</Button>
            </Toolbar>
          </div>
        </FoundationCard>

        <FoundationCard title="Vertical Toolbar" description="Vertical layout for sidebar toolbars.">
          <div className={styles.showcase}>
            <Toolbar orientation="vertical" style={{
              padding: 'var(--Spacing-3-5)',
              backgroundColor: 'var(--Surface-Subtle)',
              borderRadius: 'var(--Shape-4)',
              gap: 'var(--Spacing-3-5)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start'
            }}>
              <IconButton icon="home" aria-label="Home" size="small" attention="low" />
              <IconButton icon="search" aria-label="Search" size="small" attention="low" />
              <IconButton icon="settings" aria-label="Settings" size="small" attention="low" />
              <Separator orientation="horizontal" style={{ width: '100%' }} />
              <IconButton icon="user" aria-label="Profile" size="small" attention="low" />
            </Toolbar>
          </div>
        </FoundationCard>

        <FoundationCard title="With Groups" description="Toolbar with logically grouped controls.">
          <div className={styles.showcase}>
            <Toolbar orientation="horizontal" style={{
              padding: 'var(--Spacing-3-5)',
              backgroundColor: 'var(--Surface-Subtle)',
              borderRadius: 'var(--Shape-4)',
              gap: 'var(--Spacing-4)',
              display: 'flex',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', gap: 'var(--Spacing-3)' }}>
                <IconButton icon="edit" aria-label="Bold" size="small" attention="low" />
                <IconButton icon="copy" aria-label="Italic" size="small" attention="low" />
                <IconButton icon="link" aria-label="Underline" size="small" attention="low" />
              </div>
              <Separator orientation="vertical" style={{ height: '24px' }} />
              <div style={{ display: 'flex', gap: 'var(--Spacing-3)' }}>
                <IconButton icon="list" aria-label="Align Left" size="small" attention="low" />
                <IconButton icon="grid" aria-label="Align Center" size="small" attention="low" />
                <IconButton icon="sort" aria-label="Align Right" size="small" attention="low" />
              </div>
              <Separator orientation="vertical" style={{ height: '24px' }} />
              <div style={{ display: 'flex', gap: 'var(--Spacing-3)' }}>
                <IconButton icon="link" aria-label="Insert Link" size="small" attention="low" />
                <IconButton icon="image" aria-label="Insert Image" size="small" attention="low" />
              </div>
            </Toolbar>
          </div>
        </FoundationCard>

        <FoundationCard title="With Toggle Buttons" description="Toolbar with stateful toggle controls.">
          <div className={styles.showcase}>
            <Toolbar orientation="horizontal" style={{
              padding: 'var(--Spacing-3-5)',
              backgroundColor: 'var(--Surface-Subtle)',
              borderRadius: 'var(--Shape-4)',
              gap: 'var(--Spacing-3-5)',
              display: 'flex',
              alignItems: 'center'
            }}>
              <Toggle
                pressed={isBold}
                onPressedChange={setIsBold}
                aria-label="Toggle bold"
              >
                <strong>B</strong>
              </Toggle>
              <Toggle
                pressed={isItalic}
                onPressedChange={setIsItalic}
                aria-label="Toggle italic"
              >
                <em>I</em>
              </Toggle>
              <Separator orientation="vertical" style={{ height: '24px' }} />
              <span style={{
                fontSize: 'var(--Typography-Size-XS)',
                color: 'var(--Text-Medium)',
                paddingLeft: 'var(--Spacing-3-5)'
              }}>
                Bold: {isBold ? 'On' : 'Off'}, Italic: {isItalic ? 'On' : 'Off'}
              </span>
            </Toolbar>
          </div>
        </FoundationCard>

        <FoundationCard title="Usage" description="Import and use the Toolbar component." collapsible>
          <pre className={styles.codeBlock}>
{`import { Toolbar, Button, IconButton, Separator, Toggle } from '@oneui/ui';

// Horizontal toolbar
<Toolbar orientation="horizontal">
  <Button size="small">Cut</Button>
  <Button size="small">Copy</Button>
  <Button size="small">Paste</Button>
  <Separator orientation="vertical" />
  <Button size="small">Undo</Button>
  <Button size="small">Redo</Button>
</Toolbar>

// Vertical toolbar
<Toolbar orientation="vertical">
  <IconButton icon="home" aria-label="Home" />
  <IconButton icon="search" aria-label="Search" />
  <Separator orientation="horizontal" />
  <IconButton icon="settings" aria-label="Settings" />
</Toolbar>

// With groups
<Toolbar>
  <div>
    <IconButton icon="edit" aria-label="Bold" />
    <IconButton icon="copy" aria-label="Italic" />
  </div>
  <Separator orientation="vertical" />
  <div>
    <IconButton icon="list" aria-label="Left" />
    <IconButton icon="grid" aria-label="Center" />
  </div>
</Toolbar>

// With toggles
const [bold, setBold] = useState(false);
<Toolbar>
  <Toggle pressed={bold} onPressedChange={setBold}>
    <strong>B</strong>
  </Toggle>
</Toolbar>`}
          </pre>
        </FoundationCard>

        <FoundationCard title="Props" description="Available props for the Toolbar component." collapsible>
          <table className={styles.propsTable}>
            <thead>
              <tr>
                <th>Prop</th>
                <th>Type</th>
                <th>Default</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>children</code></td>
                <td><code>ReactNode</code></td>
                <td>-</td>
                <td>Toolbar content (required)</td>
              </tr>
              <tr>
                <td><code>orientation</code></td>
                <td><code>&apos;horizontal&apos; | &apos;vertical&apos;</code></td>
                <td><code>&apos;horizontal&apos;</code></td>
                <td>Layout orientation</td>
              </tr>
              <tr>
                <td><code>className</code></td>
                <td><code>string</code></td>
                <td>-</td>
                <td>Additional class name</td>
              </tr>
            </tbody>
          </table>
        </FoundationCard>
      </div>
    </div>
  );
}
