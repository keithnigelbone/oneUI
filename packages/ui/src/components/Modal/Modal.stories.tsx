/**
 * Modal.stories.tsx
 * Storybook documentation for Modal component
 *
 * Each story inlines its JSX in `render` so Storybook's "Show code" panel
 * displays the real usage. The showcase functions in Modal.showcase.tsx remain
 * available (and importable from `@oneui/ui/components/Modal`) for the platform
 * documentation page; the inlining here is a deliberate duplication so the
 * source-view stays accurate.
 */

import type { Meta, StoryObj } from '@storybook/react-vite';
import { within, userEvent, expect, waitFor, screen } from 'storybook/test';
import React, { useState } from 'react';
import { Modal } from './Modal';
import { Button } from '../Button/Button';
import { InputField } from '../InputField/InputField';
import { Text } from '../Text/Text';
import type { ModalSize } from './Modal.shared';

const meta: Meta<typeof Modal> = {
  title: 'Components/Overlays/Modal',
  component: Modal,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Focused overlay with structured header/body/footer layout. Supports S/M/L/FullWidth sizes, divider visibility on scroll, and max-height scrollable body. The popup itself is role-neutral — per-role styling is applied to the children you pass into the slots (footer buttons, headerStart, body content).',
      },
    },
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['S', 'M', 'L', 'FullWidth'],
      description: 'Modal width preset',
      table: { defaultValue: { summary: 'M' } },
    },
    header: {
      control: 'boolean',
      description: 'Whether to show the header section',
      table: { defaultValue: { summary: 'true' } },
    },
    headerAlign: {
      control: 'radio',
      options: ['left', 'center'],
      description: 'Header content alignment',
      table: { defaultValue: { summary: 'left' } },
    },
    showTitle: {
      control: 'boolean',
      description: 'Whether to show the title',
      table: { defaultValue: { summary: 'true' } },
    },
    title: {
      control: 'text',
      description: 'Modal title text',
    },
    showDescription: {
      control: 'boolean',
      description:
        'Whether to show the description when description text is provided',
      table: { defaultValue: { summary: 'true' } },
    },
    description: {
      control: 'text',
      description: 'Modal description text',
    },
    dismissible: {
      control: 'boolean',
      description: 'Whether Escape and outside press can dismiss the modal',
      table: { defaultValue: { summary: 'true' } },
    },
    footer: {
      control: 'boolean',
      description: 'Whether to show the footer section',
      table: { defaultValue: { summary: 'true' } },
    },
    footerOrientation: {
      control: 'radio',
      options: ['horizontal', 'vertical'],
      description: 'Footer button stacking direction',
      table: { defaultValue: { summary: 'horizontal' } },
    },
    dividerTopVisibility: {
      control: 'radio',
      options: ['none', 'onScroll', 'always'],
      description: 'Top divider visibility',
      table: { defaultValue: { summary: 'none' } },
    },
    dividerTopScrollPosition: {
      control: 'radio',
      options: ['start', 'middle', 'end'],
      description: 'Scroll threshold for top divider visibility when dividerTopVisibility is onScroll',
      table: { defaultValue: { summary: 'middle' } },
    },
    dividerBottomVisibility: {
      control: 'radio',
      options: ['none', 'onScroll', 'always'],
      description: 'Bottom divider visibility',
      table: { defaultValue: { summary: 'none' } },
    },
    dividerBottomScrollPosition: {
      control: 'radio',
      options: ['start', 'middle', 'end'],
      description:
        'Scroll threshold through which bottom divider remains visible when dividerBottomVisibility is onScroll',
      table: { defaultValue: { summary: 'middle' } },
    },
    // Hidden
    open: { table: { disable: true } },
    defaultOpen: { table: { disable: true } },
    onOpenChange: { table: { disable: true } },
    className: { table: { disable: true } },
    style: { table: { disable: true } },
    children: { table: { disable: true } },
    footerEnd: { table: { disable: true } },
    footerStart: { table: { disable: true } },
    headerStart: { table: { disable: true } },
  },
};

export default meta;
type Story = StoryObj<typeof Modal>;

const labelStyle: React.CSSProperties = {
  fontSize: 'var(--Label-XS-FontSize)',
  lineHeight: 'var(--Label-XS-LineHeight)',
  color: 'var(--Text-Low)',
  fontFamily: 'var(--Typography-Font-Primary)',
};

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

// 1. Default — args-driven so Storybook controls work
export const Default: Story = {
  args: {
    size: 'M',
    header: true,
    headerAlign: 'left',
    showTitle: true,
    title: 'Title',
    showDescription: true,
    description: 'A short description that appears below the title.',
    footer: true,
    footerOrientation: 'horizontal',
    dividerTopVisibility: 'none',
    dividerTopScrollPosition: 'middle',
    dividerBottomVisibility: 'none',
    dividerBottomScrollPosition: 'middle',
    dismissible: true,
  },
  render: (args) => {
    const [open, setOpen] = useState(false);
    return (
      <div>
        <Button attention="high" onPress={() => setOpen(true)}>
          Open Modal
        </Button>
        <Modal
          {...args}
          open={open}
          onOpenChange={setOpen}
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
          <Text weight="low" variant="body" size="M">
            This is the modal body content. You can place any layout or elements here as needed.
          </Text>
        </Modal>
      </div>
    );
  },
};

// 2. Sizes
export const Sizes: Story = {
  name: 'Sizes',
  render: () => {
    const [openSize, setOpenSize] = useState<ModalSize | null>(null);
    const sizes: ModalSize[] = ['S', 'M', 'L', 'FullWidth'];
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
            <Text weight="low" variant="body" size="M">
              Content area for the {size} modal. The width adjusts according to the size preset.
            </Text>
          </Modal>
        ))}
      </div>
    );
  },
};

// 3. Header Alignment
export const HeaderAlignment: Story = {
  name: 'Header Alignment',
  render: () => {
    const [openAlign, setOpenAlign] = useState<'left' | 'center' | null>(null);
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
            <Text weight="low" variant="body" size="M">
              The header content is aligned to the {align}.
            </Text>
          </Modal>
        ))}
      </div>
    );
  },
};

// 4. Scrollable Content
export const Scrollable: Story = {
  name: 'Scrollable Content',
  render: () => {
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
            <Text weight="low" key={i} variant="body" size="M">
              Paragraph {i + 1}: This is sample content to demonstrate scrolling behaviour. When
              content exceeds the max-height, the body area scrolls independently while the header
              and footer remain fixed.
            </Text>
          ))}
        </Modal>
      </div>
    );
  },
};

// 5. Vertical Footer
export const VerticalFooter: Story = {
  name: 'Vertical Footer',
  render: () => {
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
          <Text weight="low" variant="body" size="M">
            The footer buttons are stacked vertically, useful for mobile layouts or when actions
            need more visual weight.
          </Text>
        </Modal>
      </div>
    );
  },
};

// 6. No Header
export const NoHeader: Story = {
  name: 'No Header',
  render: () => {
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
          <Text weight="low" variant="body" size="M">
            This modal has no header. The body content is the primary focus.
          </Text>
        </Modal>
      </div>
    );
  },
};

// 7. No Footer
export const NoFooter: Story = {
  name: 'No Footer',
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <div>
        <Button onPress={() => setOpen(true)}>No Footer Modal</Button>
        <Modal open={open} onOpenChange={setOpen} title="Information" footer={false}>
          <Text weight="low" variant="body" size="M">
            This modal has no footer — the close button in the header is the only way to dismiss it
            (along with clicking the backdrop).
          </Text>
        </Modal>
      </div>
    );
  },
};

// 8. With Dividers
export const WithDividers: Story = {
  name: 'With Dividers',
  render: () => {
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
          <Text weight="low" variant="body" size="M">
            Dividers are always visible between the header, body, and footer sections, regardless of
            scroll position.
          </Text>
        </Modal>
      </div>
    );
  },
};

// 9. With Description
export const WithDescription: Story = {
  name: 'With Description',
  render: () => {
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
          <Text weight="low" variant="body" size="M">
            Modal body content goes here.
          </Text>
        </Modal>
      </div>
    );
  },
};

// 10. Motion — entry/exit animation
//
// Entry: panel scale 0.90 → 1 + opacity 0 → 1, backdrop scrim opacity 0 → 50%.
//        Duration XL (450ms), Easing Entrance Moderate.
// Exit:  panel scale 1 → 0.90 + opacity 1 → 0, backdrop scrim 50% → 0%.
//        Duration M (200ms), Easing Exit Moderate.
// Reduced motion: opacity only (no scale), Subtle duration tokens.
//
// To test reduced motion: Chrome DevTools → Rendering panel →
//   "Emulate CSS prefers-reduced-motion: reduce".

const modalMotionCode = `/* Modal entry/exit motion — from Modal.module.css.
   Asymmetric timing: slower in, snappier out.
   Backdrop fades 0 → 50% scrim (--Scrim is rgba(0,0,0,0.5)). */

.backdrop[data-starting-style],
.backdrop[data-ending-style] {
  opacity: 0;
}
.backdrop[data-open] {
  transition: opacity var(--Motion-Duration-L) var(--Motion-Easing-Entrance-Moderate);
}
.backdrop[data-ending-style] {
  transition: opacity var(--Motion-Duration-M) var(--Motion-Easing-Exit-Moderate);
}

.popup[data-starting-style],
.popup[data-ending-style] {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.90);
}
.popup[data-open] {
  transition:
    opacity var(--Motion-Duration-L) var(--Motion-Easing-Entrance-Moderate),
    transform var(--Motion-Duration-L) var(--Motion-Easing-Entrance-Moderate);
}
.popup[data-ending-style] {
  transition:
    opacity var(--Motion-Duration-M) var(--Motion-Easing-Exit-Moderate),
    transform var(--Motion-Duration-M) var(--Motion-Easing-Exit-Moderate);
}

/* Reduced motion: opacity only (no scale), Subtle tokens */
@media (prefers-reduced-motion: reduce) {
  .backdrop[data-open] {
    transition: opacity var(--Motion-Duration-Subtle-L) var(--Motion-Easing-Entrance-Subtle);
  }
  .backdrop[data-ending-style] {
    transition: opacity var(--Motion-Duration-Subtle-M) var(--Motion-Easing-Exit-Subtle);
  }
  .popup[data-starting-style],
  .popup[data-ending-style] {
    transform: translate(-50%, -50%);
  }
  .popup[data-open] {
    transition: opacity var(--Motion-Duration-Subtle-L) var(--Motion-Easing-Entrance-Subtle);
  }
  .popup[data-ending-style] {
    transition: opacity var(--Motion-Duration-Subtle-M) var(--Motion-Easing-Exit-Subtle);
  }
}`;

/* Reduced-motion override for the Motion story toggle.
 * Targets Base UI Dialog via its data attributes (works through the portal).
 * Mirrors the @media (prefers-reduced-motion: reduce) block in Modal.module.css. */
const modalSubtleMotionCSS = `
  [role="dialog"][data-starting-style],
  [role="dialog"][data-ending-style] {
    transform: translate(-50%, -50%) !important;
  }
  [role="dialog"][data-open] {
    transition: opacity var(--Motion-Duration-Subtle-L) var(--Motion-Easing-Entrance-Subtle) !important;
  }
  [role="dialog"][data-ending-style] {
    transition: opacity var(--Motion-Duration-Subtle-M) var(--Motion-Easing-Exit-Subtle) !important;
  }
  [class*="backdrop"][data-open] {
    transition: opacity var(--Motion-Duration-Subtle-L) var(--Motion-Easing-Entrance-Subtle) !important;
  }
  [class*="backdrop"][data-ending-style] {
    transition: opacity var(--Motion-Duration-Subtle-M) var(--Motion-Easing-Exit-Subtle) !important;
  }
`;

function ModalMotionDemo({ subtleMotion }: { subtleMotion: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      {subtleMotion && <style>{modalSubtleMotionCSS}</style>}
      <Button attention="high" onPress={() => setOpen(true)}>
        Open Modal
      </Button>
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
        <Text weight="low" variant="body" size="M">
          This is the modal body content. You can place any layout or elements here as needed.
        </Text>
      </Modal>
    </>
  );
}

export const Motion: Story = {
  name: 'Motion',
  parameters: {
    docs: {
      source: {
        language: 'css',
        code: modalMotionCode,
      },
    },
  },
  args: {
    subtleMotion: false,
  } as any,
  argTypes: {
    subtleMotion: {
      name: 'Subtle motion',
      control: 'boolean',
      description: 'Subtle motion (reduced motion accessibility mode)',
      table: {
        category: 'Accessibility',
        defaultValue: { summary: 'false' },
      },
    },
  } as any,
  render: (args: any) => <ModalMotionDemo subtleMotion={args.subtleMotion} />,
};

// 11. Edit-name flow — a realistic form-edit modal.
//
// Trigger button shows the current project name. Opening the modal pre-fills a
// draft input with that name. The Save button is disabled when the draft is
// empty. Saving commits the draft to the parent state and closes the modal;
// Cancel closes without mutating. The play function exercises the full
// round-trip: open → type new value → save → assert parent state updated.
//
// Catches regressions in: controlled-modal state wiring, slot input interaction,
// onOpenChange close-on-submit pattern, and state propagation back to the
// parent from inside the portalled modal.
export const EditNameFlow: Story = {
  name: 'Edit-name Flow',
  render: () => {
    const [name, setName] = useState('Untitled project');
    const [draft, setDraft] = useState(name);
    const [open, setOpen] = useState(false);

    const openModal = () => {
      setDraft(name);
      setOpen(true);
    };
    const save = () => {
      const trimmed = draft.trim();
      if (!trimmed) return;
      setName(trimmed);
      setOpen(false);
    };

    return (
      <div style={{ ...column, alignItems: 'flex-start' }}>
        <Button attention="medium" onPress={openModal} data-testid="trigger">
          {name}
        </Button>
        <Modal
          open={open}
          onOpenChange={setOpen}
          title="Edit project name"
          description="Give your project a memorable name."
          showDescription
          footerEnd={
            <>
              <Button attention="low" onPress={() => setOpen(false)}>
                Cancel
              </Button>
              <Button attention="high" onPress={save} disabled={!draft.trim()}>
                Save
              </Button>
            </>
          }
        >
          <InputField
            label="Name"
            placeholder="Project name"
            value={draft}
            onChange={setDraft}
            autoFocus
          />
        </Modal>
      </div>
    );
  },
  play: async ({ canvasElement }: any) => {
    const canvas = within(canvasElement);

    // 1. Trigger shows the initial name.
    const trigger = await canvas.findByTestId('trigger');
    await expect(trigger).toHaveTextContent('Untitled project');

    // 2. Open the modal.
    await userEvent.click(trigger);
    await waitFor(() => {
      expect(document.querySelector('[role="dialog"]')).toBeInTheDocument();
    });

    // 3. The draft input is pre-filled with the current name.
    const input = (await screen.findByLabelText('Name')) as HTMLInputElement;
    await expect(input.value).toBe('Untitled project');

    // 4. Save is enabled when there's content.
    const save = await screen.findByRole('button', { name: 'Save' });
    await expect(save).not.toBeDisabled();

    // 5. Clearing the input disables Save (empty-name guard).
    await userEvent.clear(input);
    await waitFor(() => expect(save).toBeDisabled());

    // 6. Type a new name; Save re-enables.
    await userEvent.type(input, 'Q1 2026 roadmap');
    await waitFor(() => expect(save).not.toBeDisabled());

    // 7. Click Save → modal closes AND the trigger reflects the new name.
    await userEvent.click(save);
    await waitFor(() => {
      expect(document.querySelector('[role="dialog"]')).not.toBeInTheDocument();
    });
    await expect(trigger).toHaveTextContent('Q1 2026 roadmap');
  },
};
