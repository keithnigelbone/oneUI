/**
 * components/toast/page.tsx
 *
 * Toast component showcase page
 * Displays variants, positions, and usage examples
 */

'use client';

import React, { useState } from 'react';
import { Toast, ToastViewport, ToastProvider } from '@oneui/ui/components/Toast';
import { Button } from '@oneui/ui/components/Button';
import { Surface } from '@oneui/ui/components/Surface';
import { FoundationCard } from '@/design-tools/Foundations/shared';
import styles from '../component.module.css';

export default function ToastPage() {
  const [toasts, setToasts] = useState<Array<{
    id: number;
    title: string;
    description?: string;
    variant?: 'info' | 'success' | 'warning' | 'error';
  }>>([]);
  const [nextId, setNextId] = useState(1);

  const showToast = (
    title: string,
    description?: string,
    variant?: 'info' | 'success' | 'warning' | 'error'
  ) => {
    const id = nextId;
    setNextId(id + 1);
    setToasts((prev) => [...prev, { id, title, description, variant }]);
    // Auto-remove after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastProvider>
      <div className={styles.page}>
        <div className={styles.header}>
          <h1 className={styles.title}>Toast</h1>
          <p className={styles.description}>
            A brief notification message that appears temporarily to provide feedback or information. Supports different variants and positions.
          </p>
        </div>
        <div className={styles.content}>
          {/* Variants */}
          <FoundationCard
            title="Variants"
            description="Different visual styles for different types of messages."
          >
            <div className={styles.showcase}>
              <div className={styles.showcaseItem}>
                <Button
                  attention="medium"
                  onClick={() => showToast('Info Message', 'This is an informational message.', 'info')}
                >
                  Show Info
                </Button>
                <span className={styles.showcaseLabel}>Info</span>
              </div>
              <div className={styles.showcaseItem}>
                <Button
                  attention="medium"
                  onClick={() => showToast('Success!', 'Operation completed successfully.', 'success')}
                >
                  Show Success
                </Button>
                <span className={styles.showcaseLabel}>Success</span>
              </div>
              <div className={styles.showcaseItem}>
                <Button
                  attention="medium"
                  onClick={() => showToast('Warning', 'Please review your changes.', 'warning')}
                >
                  Show Warning
                </Button>
                <span className={styles.showcaseLabel}>Warning</span>
              </div>
              <div className={styles.showcaseItem}>
                <Button
                  attention="medium"
                  onClick={() => showToast('Error', 'Something went wrong.', 'error')}
                >
                  Show Error
                </Button>
                <span className={styles.showcaseLabel}>Error</span>
              </div>
            </div>
          </FoundationCard>

          {/* Simple Toasts */}
          <FoundationCard
            title="Simple Toast"
            description="Toast with just a title."
          >
            <div className={styles.showcase}>
              <Button onClick={() => showToast('Simple notification')}>
                Show Simple Toast
              </Button>
            </div>
          </FoundationCard>

          {/* With Action */}
          <FoundationCard
            title="With Action"
            description="Add action buttons to toasts for user interaction."
          >
            <div className={styles.showcase}>
              <div className={styles.infoBox}>
                <svg className={styles.infoIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4M12 8h.01" />
                </svg>
                <p className={styles.infoText}>
                  Action buttons can be added via the <code>action</code> prop when implementing toasts in your application.
                  The Toast component accepts a ReactNode for the action slot.
                </p>
              </div>
            </div>
          </FoundationCard>

          {/* Surface Context */}
          <FoundationCard
            title="Surface Context"
            description="Toast adapts when placed on different surface backgrounds."
          >
            <div className={styles.showcase} style={{ flexDirection: 'column', gap: 'var(--Spacing-3-5)' }}>
              {([
                { mode: 'default' as const, label: 'Default' },
                { mode: 'minimal' as const, label: 'Minimal' },
                { mode: 'subtle' as const, label: 'Subtle' },
                { mode: 'moderate' as const, label: 'Moderate' },
                { mode: 'bold' as const, label: 'Bold' },
                { mode: 'elevated' as const, label: 'Elevated' },
              ]).map(({ mode, label }) => (
                <Surface
                  key={mode}
                  mode={mode}
                  style={{
                    padding: 'var(--Spacing-4)',
                    borderRadius: 'var(--Shape-4)',
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 'var(--Spacing-4)',
                    width: '100%',
                  }}
                >
                  <span style={{ color: 'var(--Text-High)', minWidth: '100px', margin: 0, fontWeight: 'var(--Typography-Weight-Medium)', fontSize: 'var(--Typography-Size-S)' }}>
                    {label}
                  </span>
                  <div style={{ display: 'flex', gap: 'var(--Spacing-3-5)', flexWrap: 'wrap' }}>
                    <Button size="s" onClick={() => showToast(`Toast on ${label}`)}>Show Toast</Button>
                  </div>
                </Surface>
              ))}
            </div>
          </FoundationCard>

          {/* Usage */}
          <FoundationCard
            title="Usage"
            description="Import and use the Toast component."
            collapsible
          >
            <pre className={styles.codeBlock}>
{`import { Toast, ToastViewport, ToastProvider } from '@oneui/ui';

// Wrap your app with ToastProvider
function App() {
  const [toasts, setToasts] = useState([]);

  const showToast = (title, description, variant) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, title, description, variant }]);

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  };

  return (
    <ToastProvider>
      {/* Your app content */}
      <button onClick={() => showToast('Success!', 'Done', 'success')}>
        Show Toast
      </button>

      {/* Toast viewport for rendering toasts */}
      <ToastViewport position="bottom-right">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            title={toast.title}
            description={toast.description}
            variant={toast.variant}
            dismissible
          />
        ))}
      </ToastViewport>
    </ToastProvider>
  );
}

// With action button
<Toast
  title="File uploaded"
  description="Your file has been uploaded successfully."
  variant="success"
  action={<button>View</button>}
  dismissible
/>

// Different positions
<ToastViewport position="top-center">
  {/* toasts */}
</ToastViewport>

<ToastViewport position="bottom-right">
  {/* toasts */}
</ToastViewport>`}
            </pre>
          </FoundationCard>

          {/* Props */}
          <FoundationCard
            title="Props"
            description="Available props for the Toast components."
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
                  <td><code>Toast</code></td>
                  <td><code>title</code></td>
                  <td><code>string</code></td>
                  <td>-</td>
                  <td>Toast title (required)</td>
                </tr>
                <tr>
                  <td><code>Toast</code></td>
                  <td><code>description</code></td>
                  <td><code>string</code></td>
                  <td>-</td>
                  <td>Toast description</td>
                </tr>
                <tr>
                  <td><code>Toast</code></td>
                  <td><code>variant</code></td>
                  <td><code>&apos;info&apos; | &apos;success&apos; | &apos;warning&apos; | &apos;error&apos;</code></td>
                  <td><code>&apos;info&apos;</code></td>
                  <td>Visual variant</td>
                </tr>
                <tr>
                  <td><code>Toast</code></td>
                  <td><code>action</code></td>
                  <td><code>ReactNode</code></td>
                  <td>-</td>
                  <td>Action button or element</td>
                </tr>
                <tr>
                  <td><code>Toast</code></td>
                  <td><code>dismissible</code></td>
                  <td><code>boolean</code></td>
                  <td><code>true</code></td>
                  <td>Show close button</td>
                </tr>
                <tr>
                  <td><code>ToastViewport</code></td>
                  <td><code>position</code></td>
                  <td><code>&apos;top-center&apos; | &apos;top-right&apos; | &apos;bottom-center&apos; | &apos;bottom-right&apos;</code></td>
                  <td><code>&apos;bottom-right&apos;</code></td>
                  <td>Position on screen</td>
                </tr>
                <tr>
                  <td><code>ToastViewport</code></td>
                  <td><code>className</code></td>
                  <td><code>string</code></td>
                  <td>-</td>
                  <td>Additional CSS class</td>
                </tr>
              </tbody>
            </table>
          </FoundationCard>
        </div>

        {/* Toast viewport for rendering active toasts */}
        <ToastViewport position="bottom-right">
          {toasts.map((toast) => (
            <Toast
              key={toast.id}
              title={toast.title}
              description={toast.description}
              variant={toast.variant}
              dismissible
            />
          ))}
        </ToastViewport>
      </div>
    </ToastProvider>
  );
}
