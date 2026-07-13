'use client';

/**
 * Modal.showcase.tsx
 *
 * Shared variant display components for Modal.
 * Imported by both Storybook stories and the platform documentation page —
 * keeping them in sync with a single source of truth.
 *
 * Rules:
 * - No Storybook imports
 * - No platform (app) imports
 * - All styling via CSS custom property tokens
 */

import React, { useState } from 'react';
import { Modal } from './Modal';
import { Button } from '../Button/Button';

// ─── Shared layout helpers ────────────────────────────────────────────────────

const column: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--Spacing-4)',
  width: '100%',
};

const row: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 'var(--Spacing-3-5)',
  alignItems: 'center',
};

const labelStyle: React.CSSProperties = {
  fontSize: 'var(--Label-XS-FontSize)',
  lineHeight: 'var(--Label-XS-LineHeight)',
  color: 'var(--Text-Low)',
  fontFamily: 'var(--Typography-Font-Primary)',
};

const bodyText: React.CSSProperties = {
  fontSize: 'var(--Body-M-FontSize)',
  lineHeight: 'var(--Body-M-LineHeight)',
  fontFamily: 'var(--Typography-Font-Primary)',
  color: 'var(--Text-High)',
  margin: 0,
};

// ─── Exported showcase components ─────────────────────────────────────────────

/**
 * Default modal — title + body + footer with Cancel/Save
 */
export function ModalDefault() {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <Button onPress={() => setOpen(true)}>Open Modal</Button>
      <Modal
        open={open}
        onOpenChange={setOpen}
        title="Title"
        footerEnd={
          <>
            <Button attention="low" onPress={() => setOpen(false)}>
              Cancel
            </Button>
            <Button attention="high" onPress={() => setOpen(false)}>
              Save
            </Button>
          </>
        }
      >
        <p style={bodyText}>
          This is the modal body content. You can place any layout or elements here as needed.
        </p>
      </Modal>
    </div>
  );
}

/**
 * Modal sizes — S / M / L / FullWidth
 */
export function ModalSizes() {
  const [openSize, setOpenSize] = useState<string | null>(null);
  const sizes = ['S', 'M', 'L', 'FullWidth'] as const;

  return (
    <div style={column}>
      <span style={labelStyle}>Size variants</span>
      <div style={row}>
        {sizes.map((size) => (
          <Button key={size} attention="medium" onPress={() => setOpenSize(size)}>
            {size}
          </Button>
        ))}
      </div>
      {sizes.map((size) => (
        <Modal
          key={size}
          open={openSize === size}
          onOpenChange={(isOpen) => !isOpen && setOpenSize(null)}
          size={size}
          title={`${size} Modal`}
          description="This demonstrates the size variant."
          showDescription
          footerEnd={
            <>
              <Button attention="low" onPress={() => setOpenSize(null)}>
                Cancel
              </Button>
              <Button attention="high" onPress={() => setOpenSize(null)}>
                Confirm
              </Button>
            </>
          }
        >
          <p style={bodyText}>
            Content area for the {size} modal. The width adjusts according to the size preset.
          </p>
        </Modal>
      ))}
    </div>
  );
}

/**
 * Modal with header alignment options
 */
export function ModalHeaderAlign() {
  const [openAlign, setOpenAlign] = useState<string | null>(null);
  const aligns = ['left', 'center'] as const;

  return (
    <div style={column}>
      <span style={labelStyle}>Header alignment</span>
      <div style={row}>
        {aligns.map((align) => (
          <Button key={align} attention="medium" onPress={() => setOpenAlign(align)}>
            {align}
          </Button>
        ))}
      </div>
      {aligns.map((align) => (
        <Modal
          key={align}
          open={openAlign === align}
          onOpenChange={(isOpen) => !isOpen && setOpenAlign(null)}
          title={`Header aligned ${align}`}
          headerAlign={align}
          description="Description text appears below the title."
          showDescription
          footerEnd={
            <Button attention="high" onPress={() => setOpenAlign(null)}>
              Done
            </Button>
          }
        >
          <p style={bodyText}>The header content is aligned to the {align}.</p>
        </Modal>
      ))}
    </div>
  );
}

/**
 * Modal with scrollable content + dividers
 */
export function ModalScrollable() {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <Button onPress={() => setOpen(true)}>Scrollable Modal</Button>
      <Modal
        open={open}
        onOpenChange={setOpen}
        title="Scrollable Content"
        size="S"
        dividerTopVisibility="onScroll"
        dividerBottomVisibility="onScroll"
        footerEnd={
          <>
            <Button attention="low" onPress={() => setOpen(false)}>
              Cancel
            </Button>
            <Button attention="high" onPress={() => setOpen(false)}>
              Save
            </Button>
          </>
        }
      >
        {Array.from({ length: 20 }, (_, i) => (
          <p key={i} style={bodyText}>
            Paragraph {i + 1}: This is sample content to demonstrate scrolling behaviour. When
            content exceeds the max-height, the body area scrolls independently while the header and
            footer remain fixed.
          </p>
        ))}
      </Modal>
    </div>
  );
}

/**
 * Modal with vertical footer buttons
 */
export function ModalVerticalFooter() {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <Button onPress={() => setOpen(true)}>Vertical Footer</Button>
      <Modal
        open={open}
        onOpenChange={setOpen}
        title="Vertical Footer"
        footerOrientation="vertical"
        footerEnd={
          <>
            <Button attention="high" fullWidth onPress={() => setOpen(false)}>
              Primary Action
            </Button>
            <Button attention="low" fullWidth onPress={() => setOpen(false)}>
              Secondary Action
            </Button>
          </>
        }
      >
        <p style={bodyText}>
          The footer buttons are stacked vertically, useful for mobile layouts or when actions need
          more visual weight.
        </p>
      </Modal>
    </div>
  );
}

/**
 * Modal without header (body-only)
 */
export function ModalNoHeader() {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <Button onPress={() => setOpen(true)}>No Header Modal</Button>
      <Modal
        open={open}
        onOpenChange={setOpen}
        header={false}
        aria-label="Information modal"
        footerEnd={
          <Button attention="high" onPress={() => setOpen(false)}>
            Close
          </Button>
        }
      >
        <p style={bodyText}>This modal has no header. The body content is the primary focus.</p>
      </Modal>
    </div>
  );
}

/**
 * Modal without footer
 */
export function ModalNoFooter() {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <Button onPress={() => setOpen(true)}>No Footer Modal</Button>
      <Modal open={open} onOpenChange={setOpen} title="Information" footer={false}>
        <p style={bodyText}>
          This modal has no footer — the close button in the header is the only way to dismiss it
          (along with clicking the backdrop).
        </p>
      </Modal>
    </div>
  );
}

/**
 * Modal with always-visible dividers
 */
export function ModalWithDividers() {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <Button onPress={() => setOpen(true)}>Always Dividers</Button>
      <Modal
        open={open}
        onOpenChange={setOpen}
        title="With Dividers"
        dividerTopVisibility="always"
        dividerBottomVisibility="always"
        footerEnd={
          <>
            <Button attention="low" onPress={() => setOpen(false)}>
              Cancel
            </Button>
            <Button attention="high" onPress={() => setOpen(false)}>
              Confirm
            </Button>
          </>
        }
      >
        <p style={bodyText}>
          Dividers are always visible between the header, body, and footer sections, regardless of
          scroll position.
        </p>
      </Modal>
    </div>
  );
}

/**
 * Modal with description visible
 */
export function ModalWithDescription() {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <Button onPress={() => setOpen(true)}>With Description</Button>
      <Modal
        open={open}
        onOpenChange={setOpen}
        title="Modal Title"
        description="This is a helpful description that provides additional context about what this modal is for."
        showDescription
        footerEnd={
          <>
            <Button attention="low" onPress={() => setOpen(false)}>
              Cancel
            </Button>
            <Button attention="high" onPress={() => setOpen(false)}>
              Save
            </Button>
          </>
        }
      >
        <p style={bodyText}>Modal body content goes here.</p>
      </Modal>
    </div>
  );
}