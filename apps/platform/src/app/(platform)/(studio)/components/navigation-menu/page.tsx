/**
 * components/navigation-menu/page.tsx
 *
 * NavigationMenu component showcase page
 * Displays variants, sizes, states, and usage examples
 */

'use client';

import React from 'react';
import { NavigationMenu } from '@oneui/ui/components/NavigationMenu';
import { FoundationCard } from '@/design-tools/Foundations/shared';
import styles from '../component.module.css';

export default function NavigationMenuPage() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>NavigationMenu</h1>
        <p className={styles.description}>
          Primary navigation component with dropdown submenus. Supports keyboard navigation
          (Arrow keys, Tab, Escape), hover and click interactions, and both horizontal and
          vertical layouts. WCAG AA accessible.
        </p>
      </div>

      <div className={styles.content}>
        {/* Basic Navigation */}
        <FoundationCard
          title="Basic Navigation"
          description="Simple navigation menu with links."
        >
          <NavigationMenu>
            <NavigationMenu.Item value="home">
              <NavigationMenu.Link href="#">Home</NavigationMenu.Link>
            </NavigationMenu.Item>
            <NavigationMenu.Item value="about">
              <NavigationMenu.Link href="#">About</NavigationMenu.Link>
            </NavigationMenu.Item>
            <NavigationMenu.Item value="services">
              <NavigationMenu.Link href="#">Services</NavigationMenu.Link>
            </NavigationMenu.Item>
            <NavigationMenu.Item value="contact">
              <NavigationMenu.Link href="#">Contact</NavigationMenu.Link>
            </NavigationMenu.Item>
          </NavigationMenu>
        </FoundationCard>

        {/* With Submenus */}
        <FoundationCard
          title="With Submenus"
          description="Dropdown submenus triggered by hover or click."
        >
          <NavigationMenu>
            <NavigationMenu.Item value="products">
              <NavigationMenu.Trigger>Products</NavigationMenu.Trigger>
              <NavigationMenu.Content>
                <div style={{
                  padding: 'var(--Spacing-4-5)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--Spacing-4)',
                  minWidth: '200px'
                }}>
                  <NavigationMenu.Link href="#">Product A</NavigationMenu.Link>
                  <NavigationMenu.Link href="#">Product B</NavigationMenu.Link>
                  <NavigationMenu.Link href="#">Product C</NavigationMenu.Link>
                </div>
              </NavigationMenu.Content>
            </NavigationMenu.Item>

            <NavigationMenu.Item value="solutions">
              <NavigationMenu.Trigger>Solutions</NavigationMenu.Trigger>
              <NavigationMenu.Content>
                <div style={{
                  padding: 'var(--Spacing-4-5)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--Spacing-4)',
                  minWidth: '200px'
                }}>
                  <NavigationMenu.Link href="#">For Business</NavigationMenu.Link>
                  <NavigationMenu.Link href="#">For Enterprise</NavigationMenu.Link>
                  <NavigationMenu.Link href="#">For Developers</NavigationMenu.Link>
                </div>
              </NavigationMenu.Content>
            </NavigationMenu.Item>

            <NavigationMenu.Item value="pricing">
              <NavigationMenu.Link href="#">Pricing</NavigationMenu.Link>
            </NavigationMenu.Item>
          </NavigationMenu>
        </FoundationCard>

        {/* Vertical Orientation */}
        <FoundationCard
          title="Vertical Orientation"
          description="Navigation menu in vertical layout for sidebars."
        >
          <NavigationMenu orientation="vertical">
            <NavigationMenu.Item value="dashboard">
              <NavigationMenu.Link href="#">Dashboard</NavigationMenu.Link>
            </NavigationMenu.Item>

            <NavigationMenu.Item value="projects">
              <NavigationMenu.Trigger>Projects</NavigationMenu.Trigger>
              <NavigationMenu.Content>
                <div style={{
                  padding: 'var(--Spacing-4-5)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--Spacing-4)',
                  minWidth: '200px'
                }}>
                  <NavigationMenu.Link href="#">All Projects</NavigationMenu.Link>
                  <NavigationMenu.Link href="#">My Projects</NavigationMenu.Link>
                  <NavigationMenu.Link href="#">Shared</NavigationMenu.Link>
                </div>
              </NavigationMenu.Content>
            </NavigationMenu.Item>

            <NavigationMenu.Item value="team">
              <NavigationMenu.Link href="#">Team</NavigationMenu.Link>
            </NavigationMenu.Item>

            <NavigationMenu.Item value="settings">
              <NavigationMenu.Link href="#">Settings</NavigationMenu.Link>
            </NavigationMenu.Item>
          </NavigationMenu>
        </FoundationCard>

        {/* Usage */}
        <FoundationCard
          title="Usage"
          description="Import and use the NavigationMenu component."
          collapsible
        >
          <pre className={styles.codeBlock}>
{`import { NavigationMenu } from '@oneui/ui';

function MyComponent() {
  return (
    <NavigationMenu>
      {/* Simple link */}
      <NavigationMenu.Item value="home">
        <NavigationMenu.Link href="/">Home</NavigationMenu.Link>
      </NavigationMenu.Item>

      {/* With dropdown submenu */}
      <NavigationMenu.Item value="products">
        <NavigationMenu.Trigger>Products</NavigationMenu.Trigger>
        <NavigationMenu.Content>
          <div style={{ padding: '1rem' }}>
            <NavigationMenu.Link href="/products/a">
              Product A
            </NavigationMenu.Link>
            <NavigationMenu.Link href="/products/b">
              Product B
            </NavigationMenu.Link>
          </div>
        </NavigationMenu.Content>
      </NavigationMenu.Item>

      {/* Another link */}
      <NavigationMenu.Item value="about">
        <NavigationMenu.Link href="/about">About</NavigationMenu.Link>
      </NavigationMenu.Item>
    </NavigationMenu>
  );
}

// Vertical orientation
<NavigationMenu orientation="vertical">
  {/* ... */}
</NavigationMenu>

// Controlled
const [active, setActive] = useState('home');

<NavigationMenu value={active} onValueChange={setActive}>
  {/* ... */}
</NavigationMenu>`}
          </pre>
        </FoundationCard>

        {/* Props */}
        <FoundationCard
          title="Props"
          description="Available props for NavigationMenu components."
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
                <td rowSpan={4}><code>NavigationMenu</code></td>
                <td><code>value</code></td>
                <td><code>string</code></td>
                <td>-</td>
                <td>Active item value (controlled)</td>
              </tr>
              <tr>
                <td><code>defaultValue</code></td>
                <td><code>string</code></td>
                <td>-</td>
                <td>Default active item (uncontrolled)</td>
              </tr>
              <tr>
                <td><code>onValueChange</code></td>
                <td><code>(value: string) =&gt; void</code></td>
                <td>-</td>
                <td>Called when active item changes</td>
              </tr>
              <tr>
                <td><code>orientation</code></td>
                <td><code>&apos;horizontal&apos; | &apos;vertical&apos;</code></td>
                <td><code>&apos;horizontal&apos;</code></td>
                <td>Layout orientation</td>
              </tr>
              <tr>
                <td><code>NavigationMenu.Item</code></td>
                <td><code>value</code></td>
                <td><code>string</code></td>
                <td>Required</td>
                <td>Unique value for this item</td>
              </tr>
              <tr>
                <td><code>NavigationMenu.Trigger</code></td>
                <td><code>children</code></td>
                <td><code>ReactNode</code></td>
                <td>Required</td>
                <td>Trigger label</td>
              </tr>
              <tr>
                <td><code>NavigationMenu.Content</code></td>
                <td><code>children</code></td>
                <td><code>ReactNode</code></td>
                <td>Required</td>
                <td>Dropdown content</td>
              </tr>
              <tr>
                <td><code>NavigationMenu.Link</code></td>
                <td><code>href</code></td>
                <td><code>string</code></td>
                <td>Required</td>
                <td>Link destination</td>
              </tr>
            </tbody>
          </table>
        </FoundationCard>
      </div>
    </div>
  );
}
