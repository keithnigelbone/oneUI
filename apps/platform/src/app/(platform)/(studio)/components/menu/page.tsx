/**
 * components/menu/page.tsx
 *
 * Menu component showcase page
 * Displays variants, groups, disabled items, and usage examples
 */

'use client';

import React, { useState } from 'react';
import { Menu } from '@oneui/ui/components/Menu';
import { Button } from '@oneui/ui/components/Button';
import { FoundationCard } from '@/design-tools/Foundations/shared';
import styles from '../component.module.css';

export default function MenuPage() {
  const [isOpen1, setIsOpen1] = useState(false);
  const [isOpen2, setIsOpen2] = useState(false);
  const [isOpen3, setIsOpen3] = useState(false);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Menu</h1>
        <p className={styles.description}>
          A dropdown menu that displays a list of actions or options when triggered. Supports grouping, icons, and disabled states.
        </p>
      </div>
      <div className={styles.content}>
        {/* Basic Menu */}
        <FoundationCard
          title="Basic Menu"
          description="Click the button to show the menu."
        >
          <div className={styles.showcase}>
            <Menu open={isOpen1} onOpenChange={setIsOpen1}>
              <Menu.Trigger>
                <Button>Open Menu</Button>
              </Menu.Trigger>
              <Menu.Portal>
                <Menu.Item onClick={() => alert('Edit clicked')}>Edit</Menu.Item>
                <Menu.Item onClick={() => alert('Duplicate clicked')}>Duplicate</Menu.Item>
                <Menu.Separator />
                <Menu.Item onClick={() => alert('Delete clicked')}>Delete</Menu.Item>
              </Menu.Portal>
            </Menu>
          </div>
        </FoundationCard>

        {/* With Groups */}
        <FoundationCard
          title="With Groups"
          description="Organize menu items into labeled groups."
        >
          <div className={styles.showcase}>
            <Menu open={isOpen2} onOpenChange={setIsOpen2}>
              <Menu.Trigger>
                <Button attention="medium">Grouped Menu</Button>
              </Menu.Trigger>
              <Menu.Portal>
                <Menu.Group label="File">
                  <Menu.Item onClick={() => alert('New clicked')}>New</Menu.Item>
                  <Menu.Item onClick={() => alert('Open clicked')}>Open</Menu.Item>
                  <Menu.Item onClick={() => alert('Save clicked')}>Save</Menu.Item>
                </Menu.Group>
                <Menu.Separator />
                <Menu.Group label="Edit">
                  <Menu.Item onClick={() => alert('Cut clicked')}>Cut</Menu.Item>
                  <Menu.Item onClick={() => alert('Copy clicked')}>Copy</Menu.Item>
                  <Menu.Item onClick={() => alert('Paste clicked')}>Paste</Menu.Item>
                </Menu.Group>
              </Menu.Portal>
            </Menu>
          </div>
        </FoundationCard>

        {/* With Disabled Items */}
        <FoundationCard
          title="Disabled Items"
          description="Disable specific menu items."
        >
          <div className={styles.showcase}>
            <Menu open={isOpen3} onOpenChange={setIsOpen3}>
              <Menu.Trigger>
                <Button attention="low">Menu with Disabled</Button>
              </Menu.Trigger>
              <Menu.Portal>
                <Menu.Item onClick={() => alert('Available clicked')}>Available</Menu.Item>
                <Menu.Item disabled onClick={() => alert('This will not fire')}>
                  Disabled Item
                </Menu.Item>
                <Menu.Item onClick={() => alert('Another available clicked')}>Another Available</Menu.Item>
                <Menu.Separator />
                <Menu.Item disabled onClick={() => alert('This will not fire either')}>
                  Also Disabled
                </Menu.Item>
              </Menu.Portal>
            </Menu>
          </div>
        </FoundationCard>

        {/* Usage */}
        <FoundationCard
          title="Usage"
          description="Import and use the Menu component."
          collapsible
        >
          <pre className={styles.codeBlock}>
{`import { Menu, Button } from '@oneui/ui';

// Basic usage
<Menu>
  <Menu.Trigger>
    <Button>Open Menu</Button>
  </Menu.Trigger>
  <Menu.Portal>
    <Menu.Item onClick={() => console.log('Edit')}>Edit</Menu.Item>
    <Menu.Item onClick={() => console.log('Delete')}>Delete</Menu.Item>
  </Menu.Portal>
</Menu>

// With groups and separators
<Menu>
  <Menu.Trigger>
    <Button>Actions</Button>
  </Menu.Trigger>
  <Menu.Portal>
    <Menu.Group label="File">
      <Menu.Item onClick={handleNew}>New</Menu.Item>
      <Menu.Item onClick={handleOpen}>Open</Menu.Item>
    </Menu.Group>
    <Menu.Separator />
    <Menu.Group label="Edit">
      <Menu.Item onClick={handleCut}>Cut</Menu.Item>
      <Menu.Item onClick={handleCopy}>Copy</Menu.Item>
    </Menu.Group>
  </Menu.Portal>
</Menu>

// Controlled with disabled items
const [isOpen, setIsOpen] = useState(false);

<Menu open={isOpen} onOpenChange={setIsOpen}>
  <Menu.Trigger>
    <Button>More</Button>
  </Menu.Trigger>
  <Menu.Portal side="bottom" align="end">
    <Menu.Item onClick={handleEdit}>Edit</Menu.Item>
    <Menu.Item disabled>Delete (disabled)</Menu.Item>
  </Menu.Portal>
</Menu>`}
          </pre>
        </FoundationCard>

        {/* Props */}
        <FoundationCard
          title="Props"
          description="Available props for the Menu components."
          collapsible
        >
          <table className={styles.propsTable}>
            <thead>
              <tr>
                <th>Component</th>
                <th>Prop</th>
                <th>Type</th>
                <th>Default</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>Menu</code></td>
                <td><code>open</code></td>
                <td><code>boolean</code></td>
                <td>-</td>
                <td>Controlled open state</td>
              </tr>
              <tr>
                <td><code>Menu</code></td>
                <td><code>defaultOpen</code></td>
                <td><code>boolean</code></td>
                <td><code>false</code></td>
                <td>Initial open state</td>
              </tr>
              <tr>
                <td><code>Menu</code></td>
                <td><code>onOpenChange</code></td>
                <td><code>(open: boolean) =&gt; void</code></td>
                <td>-</td>
                <td>Called when open state changes</td>
              </tr>
              <tr>
                <td><code>Menu.Portal</code></td>
                <td><code>side</code></td>
                <td><code>&apos;top&apos; | &apos;bottom&apos; | &apos;left&apos; | &apos;right&apos;</code></td>
                <td><code>&apos;bottom&apos;</code></td>
                <td>Which side to position on</td>
              </tr>
              <tr>
                <td><code>Menu.Portal</code></td>
                <td><code>align</code></td>
                <td><code>&apos;start&apos; | &apos;center&apos; | &apos;end&apos;</code></td>
                <td><code>&apos;start&apos;</code></td>
                <td>Alignment along the side</td>
              </tr>
              <tr>
                <td><code>Menu.Portal</code></td>
                <td><code>sideOffset</code></td>
                <td><code>number</code></td>
                <td><code>4</code></td>
                <td>Distance from anchor</td>
              </tr>
              <tr>
                <td><code>Menu.Item</code></td>
                <td><code>onClick</code></td>
                <td><code>() =&gt; void</code></td>
                <td>-</td>
                <td>Called when item is clicked</td>
              </tr>
              <tr>
                <td><code>Menu.Item</code></td>
                <td><code>disabled</code></td>
                <td><code>boolean</code></td>
                <td><code>false</code></td>
                <td>Whether item is disabled</td>
              </tr>
              <tr>
                <td><code>Menu.Item</code></td>
                <td><code>className</code></td>
                <td><code>string</code></td>
                <td>-</td>
                <td>Additional CSS class</td>
              </tr>
              <tr>
                <td><code>Menu.Group</code></td>
                <td><code>label</code></td>
                <td><code>string</code></td>
                <td>-</td>
                <td>Group label text</td>
              </tr>
            </tbody>
          </table>
        </FoundationCard>
      </div>
    </div>
  );
}
