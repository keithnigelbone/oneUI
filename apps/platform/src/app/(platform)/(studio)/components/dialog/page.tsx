/**
 * components/dialog/page.tsx
 *
 * Dialog component showcase page
 * Displays variants, sizes, states, and usage examples
 */

'use client';

import React from 'react';
import { Dialog, DialogTrigger, DialogPortal, DialogClose, AlertDialog, AlertDialogTrigger, AlertDialogPortal, AlertDialogClose } from '@oneui/ui/components/Dialog';
import { Button } from '@oneui/ui/components/Button';
import { FoundationCard } from '@/design-tools/Foundations/shared';
import styles from '../component.module.css';

export default function DialogPage() {
  const [basicOpen, setBasicOpen] = React.useState(false);
  const [alertOpen, setAlertOpen] = React.useState(false);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Dialog</h1>
        <p className={styles.description}>
          Modal dialog for important content or actions. Includes standard Dialog (dismissible)
          and AlertDialog (requires user action). Supports backdrop dismiss, focus trapping,
          and keyboard navigation (Escape to close). WCAG AA accessible.
        </p>
      </div>

      <div className={styles.content}>
        {/* Basic Dialog */}
        <FoundationCard
          title="Basic Dialog"
          description="Standard dialog that can be dismissed by clicking the backdrop or pressing Escape."
        >
          <div className={styles.showcaseColumn}>
            <Dialog open={basicOpen} onOpenChange={setBasicOpen}>
              <DialogTrigger>
                <Button>Open Dialog</Button>
              </DialogTrigger>
              <DialogPortal
                title="Edit Profile"
                description="Make changes to your profile here."
              >
                <div style={{
                  padding: 'var(--Spacing-4-5)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--Spacing-4)'
                }}>
                  <p style={{ color: 'var(--Text-Medium)' }}>
                    This is a basic dialog. You can click the backdrop or press Escape to close it.
                  </p>
                  <div style={{ display: 'flex', gap: 'var(--Spacing-4)', justifyContent: 'flex-end' }}>
                    <DialogClose>
                      <Button attention="low">Cancel</Button>
                    </DialogClose>
                    <DialogClose>
                      <Button attention="high">Save Changes</Button>
                    </DialogClose>
                  </div>
                </div>
              </DialogPortal>
            </Dialog>
          </div>
        </FoundationCard>

        {/* Alert Dialog */}
        <FoundationCard
          title="Alert Dialog"
          description="Alert dialog requires explicit user action. Cannot be dismissed by clicking backdrop."
        >
          <div className={styles.showcaseColumn}>
            <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
              <AlertDialogTrigger>
                <Button attention="high">Delete Item</Button>
              </AlertDialogTrigger>
              <AlertDialogPortal
                title="Are you sure?"
                description="This action cannot be undone."
              >
                <div style={{
                  padding: 'var(--Spacing-4-5)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--Spacing-4)'
                }}>
                  <p style={{ color: 'var(--Text-Medium)' }}>
                    This will permanently delete the item and all associated data.
                  </p>
                  <div style={{ display: 'flex', gap: 'var(--Spacing-4)', justifyContent: 'flex-end' }}>
                    <AlertDialogClose>
                      <Button attention="low">Cancel</Button>
                    </AlertDialogClose>
                    <AlertDialogClose>
                      <Button attention="high">Delete</Button>
                    </AlertDialogClose>
                  </div>
                </div>
              </AlertDialogPortal>
            </AlertDialog>
          </div>
          <div className={styles.infoBox} style={{ marginTop: 'var(--Spacing-4)' }}>
            <svg className={styles.infoIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4M12 8h.01" />
            </svg>
            <p className={styles.infoText}>
              AlertDialog cannot be dismissed by clicking the backdrop. User must explicitly
              choose an action button.
            </p>
          </div>
        </FoundationCard>

        {/* Sizes */}
        <FoundationCard
          title="Sizes"
          description="Three size options for different content amounts."
        >
          <div className={styles.showcase}>
            <Dialog>
              <DialogTrigger>
                <Button size="small">Small Dialog</Button>
              </DialogTrigger>
              <DialogPortal size="small" title="Small Dialog">
                <div style={{ padding: 'var(--Spacing-4-5)' }}>
                  <p style={{ color: 'var(--Text-Medium)' }}>
                    Compact dialog for brief messages.
                  </p>
                  <div style={{ marginTop: 'var(--Spacing-4)', display: 'flex', justifyContent: 'flex-end' }}>
                    <DialogClose>
                      <Button attention="low">Close</Button>
                    </DialogClose>
                  </div>
                </div>
              </DialogPortal>
            </Dialog>

            <Dialog>
              <DialogTrigger>
                <Button size="medium">Medium Dialog</Button>
              </DialogTrigger>
              <DialogPortal size="medium" title="Medium Dialog">
                <div style={{ padding: 'var(--Spacing-4-5)' }}>
                  <p style={{ color: 'var(--Text-Medium)' }}>
                    Standard dialog size for most content.
                  </p>
                  <div style={{ marginTop: 'var(--Spacing-4)', display: 'flex', justifyContent: 'flex-end' }}>
                    <DialogClose>
                      <Button attention="low">Close</Button>
                    </DialogClose>
                  </div>
                </div>
              </DialogPortal>
            </Dialog>

            <Dialog>
              <DialogTrigger>
                <Button size="large">Large Dialog</Button>
              </DialogTrigger>
              <DialogPortal size="large" title="Large Dialog">
                <div style={{ padding: 'var(--Spacing-4-5)' }}>
                  <p style={{ color: 'var(--Text-Medium)' }}>
                    Large dialog for detailed content or forms.
                  </p>
                  <div style={{ marginTop: 'var(--Spacing-4)', display: 'flex', justifyContent: 'flex-end' }}>
                    <DialogClose>
                      <Button attention="low">Close</Button>
                    </DialogClose>
                  </div>
                </div>
              </DialogPortal>
            </Dialog>
          </div>
        </FoundationCard>

        {/* Usage */}
        <FoundationCard
          title="Usage"
          description="Import and use the Dialog component."
          collapsible
        >
          <pre className={styles.codeBlock}>
{`import {
  Dialog,
  DialogTrigger,
  DialogPortal,
  DialogClose,
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogPortal,
  AlertDialogClose,
  Button
} from '@oneui/ui';

function MyComponent() {
  return (
    <>
      {/* Basic Dialog */}
      <Dialog>
        <DialogTrigger>
          <Button>Open Dialog</Button>
        </DialogTrigger>
        <DialogPortal
          title="Dialog Title"
          description="Dialog description"
          size="medium"
        >
          <div style={{ padding: '1rem' }}>
            <p>Dialog content goes here.</p>
            <DialogClose>
              <Button>Close</Button>
            </DialogClose>
          </div>
        </DialogPortal>
      </Dialog>

      {/* Alert Dialog */}
      <AlertDialog>
        <AlertDialogTrigger>
          <Button attention="high">Delete</Button>
        </AlertDialogTrigger>
        <AlertDialogPortal
          title="Confirm Deletion"
          description="This action cannot be undone."
          size="small"
        >
          <div style={{ padding: '1rem' }}>
            <AlertDialogClose>
              <Button attention="low">Cancel</Button>
            </AlertDialogClose>
            <AlertDialogClose>
              <Button attention="high">Delete</Button>
            </AlertDialogClose>
          </div>
        </AlertDialogPortal>
      </AlertDialog>
    </>
  );
}

// Controlled
const [open, setOpen] = useState(false);

<Dialog open={open} onOpenChange={setOpen}>
  {/* ... */}
</Dialog>`}
          </pre>
        </FoundationCard>

        {/* Props */}
        <FoundationCard
          title="Props"
          description="Available props for Dialog and AlertDialog components."
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
                <td rowSpan={3}><code>Dialog</code></td>
                <td><code>open</code></td>
                <td><code>boolean</code></td>
                <td>-</td>
                <td>Whether dialog is open (controlled)</td>
              </tr>
              <tr>
                <td><code>defaultOpen</code></td>
                <td><code>boolean</code></td>
                <td>-</td>
                <td>Default open state (uncontrolled)</td>
              </tr>
              <tr>
                <td><code>onOpenChange</code></td>
                <td><code>(open: boolean) =&gt; void</code></td>
                <td>-</td>
                <td>Called when dialog opens or closes</td>
              </tr>
              <tr>
                <td><code>DialogTrigger</code></td>
                <td><code>children</code></td>
                <td><code>ReactElement</code></td>
                <td>Required</td>
                <td>Element that triggers the dialog</td>
              </tr>
              <tr>
                <td rowSpan={3}><code>DialogPortal</code></td>
                <td><code>title</code></td>
                <td><code>string</code></td>
                <td>-</td>
                <td>Dialog title</td>
              </tr>
              <tr>
                <td><code>description</code></td>
                <td><code>string</code></td>
                <td>-</td>
                <td>Dialog description</td>
              </tr>
              <tr>
                <td><code>size</code></td>
                <td><code>&apos;small&apos; | &apos;medium&apos; | &apos;large&apos;</code></td>
                <td><code>&apos;medium&apos;</code></td>
                <td>Dialog size</td>
              </tr>
              <tr>
                <td><code>DialogClose</code></td>
                <td><code>children</code></td>
                <td><code>ReactElement</code></td>
                <td>Required</td>
                <td>Element that closes the dialog</td>
              </tr>
              <tr>
                <td rowSpan={3}><code>AlertDialog</code></td>
                <td><code>open</code></td>
                <td><code>boolean</code></td>
                <td>-</td>
                <td>Whether alert is open (controlled)</td>
              </tr>
              <tr>
                <td><code>defaultOpen</code></td>
                <td><code>boolean</code></td>
                <td>-</td>
                <td>Default open state (uncontrolled)</td>
              </tr>
              <tr>
                <td><code>onOpenChange</code></td>
                <td><code>(open: boolean) =&gt; void</code></td>
                <td>-</td>
                <td>Called when alert opens or closes</td>
              </tr>
              <tr>
                <td><code>AlertDialogTrigger</code></td>
                <td><code>children</code></td>
                <td><code>ReactElement</code></td>
                <td>Required</td>
                <td>Element that triggers the alert</td>
              </tr>
              <tr>
                <td rowSpan={3}><code>AlertDialogPortal</code></td>
                <td><code>title</code></td>
                <td><code>string</code></td>
                <td>-</td>
                <td>Alert title</td>
              </tr>
              <tr>
                <td><code>description</code></td>
                <td><code>string</code></td>
                <td>-</td>
                <td>Alert description</td>
              </tr>
              <tr>
                <td><code>size</code></td>
                <td><code>&apos;small&apos; | &apos;medium&apos; | &apos;large&apos;</code></td>
                <td><code>&apos;small&apos;</code></td>
                <td>Alert size</td>
              </tr>
              <tr>
                <td><code>AlertDialogClose</code></td>
                <td><code>children</code></td>
                <td><code>ReactElement</code></td>
                <td>Required</td>
                <td>Element that closes the alert</td>
              </tr>
            </tbody>
          </table>
        </FoundationCard>
      </div>
    </div>
  );
}
