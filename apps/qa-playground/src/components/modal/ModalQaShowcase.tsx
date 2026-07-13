'use client';

import { useState, type CSSProperties } from 'react';
import { Modal } from '@oneui/ui/components/Modal';
import { Button } from '@oneui/ui/components/Button';
import { QaShowcaseRoot, QaStoryBand } from '../shared/QaShowcaseLayout';
import styles from '../../styles/qa.module.css';
import type { ModalAppearance, ModalSize } from '@oneui/ui/components/Modal';

/**
 * Modal QA — Figma API surface coverage per Modal.shared.ts.
 * Section bands use {@link ../shared/QaShowcaseLayout#QaStoryBand} with `data-testid` triggers.
 */

const FIGMA_APPEARANCE_ROLES: Exclude<ModalAppearance, 'auto'>[] = [
  'neutral',
  'primary',
  'secondary',
  'sparkle',
  'negative',
  'positive',
  'warning',
  'informative',
];

const MODAL_SIZES: ModalSize[] = ['S', 'M', 'L', 'FullWidth'];

const flowRow: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 'var(--Spacing-4)',
  alignItems: 'center',
};

const stack: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--Spacing-3-5)',
  width: '100%',
};

const cellLabel: CSSProperties = {
  fontFamily: 'var(--Typography-Font-Primary)',
  fontSize: 'var(--Label-XS-FontSize)',
  lineHeight: 'var(--Label-XS-LineHeight)',
  fontWeight: 'var(--Label-FontWeight-Low)',
  color: 'var(--Text-Medium)',
};

const rowLabel: CSSProperties = {
  fontFamily: 'var(--Typography-Font-Primary)',
  fontSize: 'var(--Body-S-FontSize)',
  lineHeight: 'var(--Body-S-LineHeight)',
  fontWeight: 'var(--Body-FontWeight-Medium)',
  color: 'var(--Text-Medium)',
  margin: 0,
  minWidth: 'var(--Spacing-28)',
};

const noteStyle: CSSProperties = {
  ...cellLabel,
  maxWidth: 'var(--Spacing-40)',
  marginBlockEnd: 'var(--Spacing-3)',
};

const bodyText: CSSProperties = {
  fontSize: 'var(--Body-M-FontSize)',
  lineHeight: 'var(--Body-M-LineHeight)',
  fontFamily: 'var(--Typography-Font-Primary)',
  color: 'var(--Text-High)',
  margin: 0,
};

function ApiSectionBody({ children }: { children: React.ReactNode }) {
  return <div className={styles.apiSectionBody}>{children}</div>;
}

/** Reusable controlled modal wrapper for trigger + open/close in showcase. */
function ModalCell({
  triggerLabel,
  triggerTestId,
  children,
}: {
  triggerLabel: string;
  triggerTestId?: string;
  children: (open: boolean, setOpen: (v: boolean) => void) => React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    // data-testid on the wrapper <div> — Button does not forward data-* attributes
    // (BUG-001: Button component strips data-* props; see qa-bugs.md).
    <div data-testid={triggerTestId}>
      <Button onPress={() => setOpen(true)}>
        {triggerLabel}
      </Button>
      {children(open, setOpen)}
    </div>
  );
}

export function ModalQaShowcase() {
  return (
    <QaShowcaseRoot>
      {/* ── Default ──────────────────────────────────────────────────────── */}
      <QaStoryBand id="modal-figma-default" title="Default (Modal.stories Default)">
        <ApiSectionBody>
          <ModalCell triggerLabel="Open Default Modal" triggerTestId="modal-trigger-default">
            {(open, setOpen) => (
              <Modal
                open={open}
                onOpenChange={setOpen}
                title="Title"
                data-testid="modal-figma-default"
                footerContent={
                  <>
                    <Button attention="low" onPress={() => setOpen(false)}>Cancel</Button>
                    <Button attention="high" onPress={() => setOpen(false)}>Save</Button>
                  </>
                }
              >
                <p style={bodyText}>This is the modal body content.</p>
              </Modal>
            )}
          </ModalCell>
        </ApiSectionBody>
      </QaStoryBand>

      {/* ── Size ─────────────────────────────────────────────────────────── */}
      <QaStoryBand id="modal-figma-size" title="size (Figma: S | M | L | FullWidth)">
        <ApiSectionBody>
          <div style={flowRow}>
            {MODAL_SIZES.map((size) => (
              <ModalCell
                key={size}
                triggerLabel={`Size ${size}`}
                triggerTestId={`modal-trigger-size-${size.toLowerCase()}`}
              >
                {(open, setOpen) => (
                  <Modal
                    open={open}
                    onOpenChange={setOpen}
                    size={size}
                    title={`${size} Modal`}
                    showDescription
                    description="Demonstrates the size variant."
                    data-testid={`modal-size-${size.toLowerCase()}`}
                    footerContent={
                      <>
                        <Button attention="low" onPress={() => setOpen(false)}>Cancel</Button>
                        <Button attention="high" onPress={() => setOpen(false)}>Save</Button>
                      </>
                    }
                  >
                    <p style={bodyText}>
                      Content area for the {size} modal. The width adjusts according to the size preset.
                    </p>
                  </Modal>
                )}
              </ModalCell>
            ))}
          </div>
        </ApiSectionBody>
      </QaStoryBand>

      {/* ── headerStart ──────────────────────────────────────────────────── */}
      <QaStoryBand id="modal-figma-header-start" title="headerStart (Figma: none | Icon | badge)">
        <ApiSectionBody>
          <div style={flowRow}>
            {(
              [
                {
                  type: 'icon' as const,
                  label: 'headerStart: icon',
                  content: <span data-testid="modal-header-start-icon">★</span>,
                },
                {
                  type: 'badge' as const,
                  label: 'headerStart: badge',
                  content: <span data-testid="modal-header-start-badge">NEW</span>,
                },
              ] as const
            ).map(({ type, label, content }) => (
              <ModalCell
                key={type}
                triggerLabel={label}
                triggerTestId={`modal-trigger-header-start-${type}`}
              >
                {(open, setOpen) => (
                  <Modal
                    open={open}
                    onOpenChange={setOpen}
                    title={`Header ${type}`}
                    headerStart={type}
                    headerStartContent={content}
                    data-testid={`modal-header-start-${type}`}
                    footerContent={
                      <Button attention="high" onPress={() => setOpen(false)}>Done</Button>
                    }
                  >
                    <p style={bodyText}>headerStart=&quot;{type}&quot; with slot content.</p>
                  </Modal>
                )}
              </ModalCell>
            ))}
          </div>
        </ApiSectionBody>
      </QaStoryBand>

      {/* ── headerAlign ──────────────────────────────────────────────────── */}
      <QaStoryBand id="modal-figma-header-align" title="headerAlign (Figma: left | center)">
        <ApiSectionBody>
          <div style={flowRow}>
            {(['left', 'center'] as const).map((align) => (
              <ModalCell
                key={align}
                triggerLabel={`Header ${align}`}
                triggerTestId={`modal-trigger-header-align-${align}`}
              >
                {(open, setOpen) => (
                  <Modal
                    open={open}
                    onOpenChange={setOpen}
                    title={`Header aligned ${align}`}
                    headerAlign={align}
                    showDescription
                    description="Description text below the title."
                    data-testid={`modal-header-align-${align}`}
                    footerContent={
                      <Button attention="high" onPress={() => setOpen(false)}>Done</Button>
                    }
                  >
                    <p style={bodyText}>The header content is aligned to the {align}.</p>
                  </Modal>
                )}
              </ModalCell>
            ))}
          </div>
        </ApiSectionBody>
      </QaStoryBand>

      {/* ── header: false ────────────────────────────────────────────────── */}
      <QaStoryBand id="modal-figma-no-header" title="header: false (Figma component property)">
        <ApiSectionBody>
          <p style={noteStyle}>
            ⚠️ Figma <code>header: false</code> removes title, description, and close button.
          </p>
          <ModalCell triggerLabel="No Header Modal" triggerTestId="modal-trigger-no-header">
            {(open, setOpen) => (
              <Modal
                open={open}
                onOpenChange={setOpen}
                header={false}
                data-testid="modal-no-header"
                footerContent={
                  <Button attention="high" onPress={() => setOpen(false)}>Close</Button>
                }
              >
                <p style={bodyText}>This modal has no header. Body content is the primary focus.</p>
              </Modal>
            )}
          </ModalCell>
        </ApiSectionBody>
      </QaStoryBand>

      {/* ── footer: false ────────────────────────────────────────────────── */}
      <QaStoryBand id="modal-figma-no-footer" title="footer: false (Figma component property)">
        <ApiSectionBody>
          <ModalCell triggerLabel="No Footer Modal" triggerTestId="modal-trigger-no-footer">
            {(open, setOpen) => (
              <Modal
                open={open}
                onOpenChange={setOpen}
                title="Information"
                footer={false}
                data-testid="modal-no-footer"
              >
                <p style={bodyText}>
                  No footer — the close button in the header is the only way to dismiss (or backdrop click).
                </p>
              </Modal>
            )}
          </ModalCell>
        </ApiSectionBody>
      </QaStoryBand>

      {/* ── showTitle / showDescription ──────────────────────────────────── */}
      <QaStoryBand
        id="modal-figma-description"
        title="Title + Description (Figma: Title | Description visibility)"
      >
        <ApiSectionBody>
          <div style={stack}>
            <div style={{ display: 'flex', gap: 'var(--Spacing-4)', flexWrap: 'wrap' }}>
              <ModalCell triggerLabel="title: false" triggerTestId="modal-trigger-title-false">
                {(open, setOpen) => (
                  <Modal
                    open={open}
                    onOpenChange={setOpen}
                    title="Hidden Title"
                    showTitle={false}
                    showDescription
                    description="Title hidden; description visible."
                    data-testid="modal-title-false"
                    footerContent={
                      <Button attention="high" onPress={() => setOpen(false)}>OK</Button>
                    }
                  >
                    <p style={bodyText}>showTitle=false — no title in header.</p>
                  </Modal>
                )}
              </ModalCell>
              <ModalCell triggerLabel="description: false" triggerTestId="modal-trigger-desc-false">
                {(open, setOpen) => (
                  <Modal
                    open={open}
                    onOpenChange={setOpen}
                    title="Title"
                    showDescription={false}
                    data-testid="modal-desc-false"
                    footerContent={
                      <Button attention="high" onPress={() => setOpen(false)}>OK</Button>
                    }
                  >
                    <p style={bodyText}>No description shown.</p>
                  </Modal>
                )}
              </ModalCell>
              <ModalCell triggerLabel="description: true" triggerTestId="modal-trigger-desc-true">
                {(open, setOpen) => (
                  <Modal
                    open={open}
                    onOpenChange={setOpen}
                    title="Modal Title"
                    description="This is a helpful description providing additional context."
                    showDescription
                    data-testid="modal-desc-true"
                    footerContent={
                      <>
                        <Button attention="low" onPress={() => setOpen(false)}>Cancel</Button>
                        <Button attention="high" onPress={() => setOpen(false)}>Save</Button>
                      </>
                    }
                  >
                    <p style={bodyText}>Body content goes here.</p>
                  </Modal>
                )}
              </ModalCell>
            </div>
          </div>
        </ApiSectionBody>
      </QaStoryBand>

      {/* ── dividerTopVisibility / dividerBottomVisibility ───────────────── */}
      <QaStoryBand
        id="modal-figma-dividers"
        title="dividerTopVisibility / dividerBottomVisibility (none | onScroll | always)"
      >
        <ApiSectionBody>
          <div style={flowRow}>
            {(['none', 'onScroll', 'always'] as const).map((vis) => (
              <ModalCell
                key={vis}
                triggerLabel={`Dividers: ${vis}`}
                triggerTestId={`modal-trigger-dividers-${vis}`}
              >
                {(open, setOpen) => (
                  <Modal
                    open={open}
                    onOpenChange={setOpen}
                    title="Divider Test"
                    dividerTopVisibility={vis}
                    dividerBottomVisibility={vis}
                    data-testid={`modal-dividers-${vis}`}
                    dividerTopScrollPosition='end'
                    footerContent={
                      <>
                        <Button attention="low" onPress={() => setOpen(false)}>Cancel</Button>
                        <Button attention="high" onPress={() => setOpen(false)}>Confirm</Button>
                      </>
                    }
                  >
                    <p style={bodyText}>
                      Top and bottom dividers set to <code>{vis}</code>.
                    </p>
                    <p style={bodyText}>
                      Top and bottom dividers set to <code>{vis}</code>.
                    </p>
                    <p style={bodyText}>
                      Top and bottom dividers set to <code>{vis}</code>.
                    </p>
                    <p style={bodyText}>
                      Top and bottom dividers set to <code>{vis}</code>.
                    </p>
                    <p style={bodyText}>
                      Top and bottom dividers set to <code>{vis}</code>.
                    </p>
                    <p style={bodyText}>
                      Top and bottom dividers set to <code>{vis}</code>.
                    </p>
                    <p style={bodyText}>
                      Top and bottom dividers set to <code>{vis}</code>.
                    </p>
                    <p style={bodyText}>
                      Top and bottom dividers set to <code>{vis}</code>.
                    </p>
                    <p style={bodyText}>
                      Top and bottom dividers set to <code>{vis}</code>.
                    </p>
                    <p style={bodyText}>
                      Top and bottom dividers set to <code>{vis}</code>.
                    </p>

                    <p style={bodyText}>
                      Top and bottom dividers set to <code>{vis}</code>.
                    </p>
                    <p style={bodyText}>
                      Top and bottom dividers set to <code>{vis}</code>.
                    </p>
                    <p style={bodyText}>
                      Top and bottom dividers set to <code>{vis}</code>.
                    </p>
                    <p style={bodyText}>
                      Top and bottom dividers set to <code>{vis}</code>.
                    </p>
                    <p style={bodyText}>
                      Top and bottom dividers set to <code>{vis}</code>.
                    </p>

                    <p style={bodyText}>
                      Top and bottom dividers set to <code>{vis}</code>.
                    </p>
                    <p style={bodyText}>
                      Top and bottom dividers set to <code>{vis}</code>.
                    </p>
                    <p style={bodyText}>
                      Top and bottom dividers set to <code>{vis}</code>.
                    </p>
                    <p style={bodyText}>
                      Top and bottom dividers set to <code>{vis}</code>.
                    </p>
                    <p style={bodyText}>
                      Top and bottom dividers set to <code>{vis}</code>.
                    </p>
                  </Modal>
                )}
              </ModalCell>
            ))}
          </div>
        </ApiSectionBody>
      </QaStoryBand>

      {/* ── footerOrientation ────────────────────────────────────────────── */}
      <QaStoryBand
        id="modal-figma-footer-orientation"
        title="footerOrientation + footerStart (Figma: horizontal | vertical, footerStart slot)"
      >
        <ApiSectionBody>
          <ModalCell triggerLabel="footerStart slot" triggerTestId="modal-trigger-footer-start">
            {(open, setOpen) => (
              <Modal
                open={open}
                onOpenChange={setOpen}
                title="Footer Start Slot"
                data-testid="modal-footer-start"
                footerStart={
                  <span data-testid="modal-footer-start-slot">Optional footer leading content</span>
                }
                footerContent={
                  <>
                    <Button attention="low" onPress={() => setOpen(false)}>Cancel</Button>
                    <Button attention="high" onPress={() => setOpen(false)}>Save</Button>
                  </>
                }
              >
                <p style={bodyText}>footerStart slot before action buttons.</p>
              </Modal>
            )}
          </ModalCell>
          <div style={flowRow}>
            {(['horizontal', 'vertical'] as const).map((orient) => (
              <ModalCell
                key={orient}
                triggerLabel={`Footer ${orient}`}
                triggerTestId={`modal-trigger-footer-${orient}`}
              >
                {(open, setOpen) => (
                  <Modal
                    open={open}
                    onOpenChange={setOpen}
                    title={`Footer: ${orient}`}
                    footerOrientation={orient}
                    data-testid={`modal-footer-${orient}`}
                    footerContent={
                      <>
                        <Button
                          attention="high"
                          fullWidth={orient === 'vertical'}
                          onPress={() => setOpen(false)}
                        >
                          Primary Action
                        </Button>
                        <Button
                          attention="low"
                          fullWidth={orient === 'vertical'}
                          onPress={() => setOpen(false)}
                        >
                          Secondary Action
                        </Button>
                      </>
                    }
                  >
                    <p style={bodyText}>Footer buttons are {orient}.</p>
                  </Modal>
                )}
              </ModalCell>
            ))}
          </div>
        </ApiSectionBody>
      </QaStoryBand>

      {/* ── appearance ───────────────────────────────────────────────────── */}
      <QaStoryBand id="modal-figma-appearance" title="appearance (Figma variable modes)">
        <ApiSectionBody>
          <p style={noteStyle}>
            ⚠️ <code>brand-bg</code> is implemented in code / Storybook but is{' '}
            <strong>not</strong> on the attached Figma API list — shown once below for parity.
          </p>
          <div style={stack}>
            {FIGMA_APPEARANCE_ROLES.map((appearance) => (
              <div
                key={appearance}
                style={{ display: 'flex', alignItems: 'center', gap: 'var(--Spacing-5)', flexWrap: 'wrap' }}
              >
                <span style={{ ...rowLabel, minWidth: 'var(--Spacing-28)' }}>{appearance}</span>
                <ModalCell
                  triggerLabel={`Open ${appearance}`}
                  triggerTestId={`modal-trigger-appearance-${appearance}`}
                >
                  {(open, setOpen) => (
                    <Modal
                      open={open}
                      onOpenChange={setOpen}
                      appearance={appearance}
                      title={`${appearance.charAt(0).toUpperCase()}${appearance.slice(1)} Modal`}
                      description={`Appearance role: ${appearance}`}
                      showDescription
                      data-testid={`modal-appearance-${appearance}`}
                      footerContent={
                        <>
                          <Button appearance={appearance} attention="low" onPress={() => setOpen(false)}>
                            Cancel
                          </Button>
                          <Button appearance={appearance} attention="high" onPress={() => setOpen(false)}>
                            Confirm
                          </Button>
                        </>
                      }
                    >
                      <p style={bodyText}>
                        This modal uses the <strong>{appearance}</strong> appearance role.
                      </p>
                    </Modal>
                  )}
                </ModalCell>
              </div>
            ))}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--Spacing-5)', flexWrap: 'wrap' }}>
              <span style={{ ...rowLabel, minWidth: 'var(--Spacing-28)' }}>brand-bg ⚠️</span>
              <ModalCell triggerLabel="Open brand-bg" triggerTestId="modal-trigger-appearance-brand-bg">
                {(open, setOpen) => (
                  <Modal
                    open={open}
                    onOpenChange={setOpen}
                    appearance="brand-bg"
                    title="Brand-Bg Modal"
                    data-testid="modal-appearance-brand-bg"
                    footerContent={
                      <Button appearance="brand-bg" attention="high" onPress={() => setOpen(false)}>
                        Close
                      </Button>
                    }
                  >
                    <p style={bodyText}>brand-bg appearance role.</p>
                  </Modal>
                )}
              </ModalCell>
            </div>
          </div>
        </ApiSectionBody>
      </QaStoryBand>

      {/* ── maxHeight / scrollable ────────────────────────────────────────── */}
      <QaStoryBand id="modal-figma-scrollable" title="maxHeight (Figma: number vh) — scrollable body">
        <ApiSectionBody>
          <p style={noteStyle}>
            ⚠️ When content exceeds <code>maxHeight</code> vh, the body scrolls while the header and footer
            remain fixed. Dividers appear <code>onScroll</code>.
          </p>
          <ModalCell triggerLabel="Open Scrollable Modal" triggerTestId="modal-trigger-scrollable">
            {(open, setOpen) => (
              <Modal
                open={open}
                onOpenChange={setOpen}
                title="Scrollable Content"
                maxHeight={50}
                dividerTopVisibility="onScroll"
                dividerBottomVisibility="onScroll"
                data-testid="modal-scrollable"
                footerContent={
                  <>
                    <Button attention="low" onPress={() => setOpen(false)}>Cancel</Button>
                    <Button attention="high" onPress={() => setOpen(false)}>Save</Button>
                  </>
                }
              >
                {Array.from({ length: 20 }, (_, i) => (
                  <p key={i} style={{ ...bodyText, marginBottom: 'var(--Spacing-3)' }}>
                    Paragraph {i + 1}: Sample content demonstrating scrolling behaviour at 50 vh.
                  </p>
                ))}
              </Modal>
            )}
          </ModalCell>
        </ApiSectionBody>
      </QaStoryBand>

      {/* ── dismissible ──────────────────────────────────────────────────── */}
      <QaStoryBand id="modal-figma-dismissible" title="dismissible (backdrop click to close)">
        <ApiSectionBody>
          <div style={flowRow}>
            <ModalCell triggerLabel="dismissible: true" triggerTestId="modal-trigger-dismissible-true">
              {(open, setOpen) => (
                <Modal
                  open={open}
                  onOpenChange={setOpen}
                  title="Dismissible"
                  dismissible
                  data-testid="modal-dismissible-true"
                  footerContent={
                    <Button attention="high" onPress={() => setOpen(false)}>Close</Button>
                  }
                >
                  <p style={bodyText}>Click outside to dismiss.</p>
                </Modal>
              )}
            </ModalCell>
            <ModalCell triggerLabel="dismissible: false" triggerTestId="modal-trigger-dismissible-false">
              {(open, setOpen) => (
                <Modal
                  open={open}
                  onOpenChange={setOpen}
                  title="Non-Dismissible"
                  dismissible={false}
                  data-testid="modal-dismissible-false"
                  footerContent={
                    <Button attention="high" onPress={() => setOpen(false)}>Must use button</Button>
                  }
                >
                  <p style={bodyText}>Backdrop click does not dismiss. Use the button.</p>
                </Modal>
              )}
            </ModalCell>
          </div>
        </ApiSectionBody>
      </QaStoryBand>

      {/* ── auto appearance (default resolved) ───────────────────────────── */}
      <QaStoryBand id="modal-figma-appearance-auto" title="appearance: auto (resolves to primary)">
        <ApiSectionBody>
          <ModalCell triggerLabel="Open auto appearance" triggerTestId="modal-trigger-appearance-auto">
            {(open, setOpen) => (
              <Modal
                open={open}
                onOpenChange={setOpen}
                appearance="auto"
                title="Auto Appearance"
                data-testid="modal-appearance-auto"
                footerContent={
                  <>
                    <Button attention="low" onPress={() => setOpen(false)}>Cancel</Button>
                    <Button attention="high" onPress={() => setOpen(false)}>Save</Button>
                  </>
                }
              >
                <p style={bodyText}>appearance=&quot;auto&quot; resolves to primary.</p>
              </Modal>
            )}
          </ModalCell>
        </ApiSectionBody>
      </QaStoryBand>
    </QaShowcaseRoot>
  );
}
