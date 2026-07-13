/**
 * Modal.showcase.native.tsx
 *
 * Native peer of `packages/ui/src/components/Modal/Modal.showcase.tsx`.
 */

import React, { useState } from 'react';
import { View, Text, type TextStyle, type ViewStyle } from 'react-native';
import { tokens, typography } from '@oneui/tokens';
import { Modal } from './Modal.native';
import type { ModalSize, HeaderAlign } from './interface';
import { Button } from '../Button/Button.native';
import { useSurfaceTokens } from '../../theme';

// ─── Layout helpers ───────────────────────────────────────────────────────────

const column: ViewStyle = {
  flexDirection: 'column',
  gap: tokens.spacing['4'],
  width: '100%',
};

const row: ViewStyle = {
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: tokens.spacing['3-5'],
  alignItems: 'center',
};

function CaptionLabel({ children }: { children: React.ReactNode }): React.ReactElement {
  const role = useSurfaceTokens('neutral');
  return (
    <Text
      style={{
        fontSize: typography.size.xs,
        color: role.content.low,
      }}
    >
      {children}
    </Text>
  );
}

const bodyText: TextStyle = {
  fontSize: typography.size.m,
  marginVertical: tokens.spacing['2'],
};

function BodyContent({ children }: { children: React.ReactNode }): React.ReactElement {
  const role = useSurfaceTokens('neutral');
  return <Text style={[bodyText, { color: role.content.high }]}>{children}</Text>;
}

// ─── Showcases ────────────────────────────────────────────────────────────────

export function ModalDefault(): React.ReactElement {
  const [open, setOpen] = useState(false);

  return (
    <View style={row}>
      <Button onPress={() => setOpen(true)}>Open Modal</Button>
      <Modal
        open={open}
        onOpenChange={setOpen}
        title="Title"
        footerEnd={
          <View style={row}>
            <Button attention="low" onPress={() => setOpen(false)}>
              Cancel
            </Button>
            <Button attention="high" onPress={() => setOpen(false)}>
              Save
            </Button>
          </View>
        }
      >
        <BodyContent>
          This is the modal body content. You can place any layout or elements here as needed.
        </BodyContent>
      </Modal>
    </View>
  );
}

export function ModalSizes(): React.ReactElement {
  const [openSize, setOpenSize] = useState<ModalSize | null>(null);
  const sizes = ['s', 'm', 'l', 'fullWidth'] as const;

  return (
    <View style={column}>
      <CaptionLabel>Size variants</CaptionLabel>
      <View style={row}>
        {sizes.map((size) => (
          <Button key={size} attention="medium" onPress={() => setOpenSize(size)}>
            {size}
          </Button>
        ))}
      </View>
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
            <View style={row}>
              <Button attention="low" onPress={() => setOpenSize(null)}>
                Cancel
              </Button>
              <Button attention="high" onPress={() => setOpenSize(null)}>
                Confirm
              </Button>
            </View>
          }
        >
        <BodyContent>
          Content area for the {size} modal. The width adjusts according to the size preset.
        </BodyContent>
        </Modal>
      ))}
    </View>
  );
}

export function ModalHeaderAlign(): React.ReactElement {
  const [openAlign, setOpenAlign] = useState<HeaderAlign | null>(null);
  const aligns = ['left', 'center'] as const;

  return (
    <View style={column}>
      <CaptionLabel>Header alignment</CaptionLabel>
      <View style={row}>
        {aligns.map((align) => (
          <Button key={align} attention="medium" onPress={() => setOpenAlign(align)}>
            {align}
          </Button>
        ))}
      </View>
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
          <BodyContent>The header content is aligned to the {align}.</BodyContent>
        </Modal>
      ))}
    </View>
  );
}

export function ModalScrollable(): React.ReactElement {
  const [open, setOpen] = useState(false);

  return (
    <View style={row}>
      <Button onPress={() => setOpen(true)}>Scrollable Modal</Button>
      <Modal
        open={open}
        onOpenChange={setOpen}
        title="Scrollable Content"
        size="s"
        dividerTopVisibility="onScroll"
        dividerBottomVisibility="onScroll"
        footerEnd={
          <View style={row}>
            <Button attention="low" onPress={() => setOpen(false)}>
              Cancel
            </Button>
            <Button attention="high" onPress={() => setOpen(false)}>
              Save
            </Button>
          </View>
        }
      >
        {Array.from({ length: 20 }, (_, i) => (
          <BodyContent key={i}>
            Paragraph {i + 1}: This is sample content to demonstrate scrolling behaviour. When
            content exceeds the max-height, the body area scrolls independently while the header and
            footer remain fixed.
          </BodyContent>
        ))}
      </Modal>
    </View>
  );
}

export function ModalVerticalFooter(): React.ReactElement {
  const [open, setOpen] = useState(false);

  return (
    <View style={row}>
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
        <BodyContent>
          The footer buttons are stacked vertically, useful for mobile layouts or when actions need
          more visual weight.
        </BodyContent>
      </Modal>
    </View>
  );
}

export function ModalNoHeader(): React.ReactElement {
  const [open, setOpen] = useState(false);

  return (
    <View style={row}>
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
        <BodyContent>This modal has no header. The body content is the primary focus.</BodyContent>
      </Modal>
    </View>
  );
}

export function ModalNoFooter(): React.ReactElement {
  const [open, setOpen] = useState(false);

  return (
    <View style={row}>
      <Button onPress={() => setOpen(true)}>No Footer Modal</Button>
      <Modal open={open} onOpenChange={setOpen} title="Information" footer={false}>
        <BodyContent>
          This modal has no footer — the close button in the header is the only way to dismiss it.
        </BodyContent>
      </Modal>
    </View>
  );
}

export function ModalWithDividers(): React.ReactElement {
  const [open, setOpen] = useState(false);

  return (
    <View style={row}>
      <Button onPress={() => setOpen(true)}>Always Dividers</Button>
      <Modal
        open={open}
        onOpenChange={setOpen}
        title="With Dividers"
        dividerTopVisibility="always"
        dividerBottomVisibility="always"
        footerEnd={
          <View style={row}>
            <Button attention="low" onPress={() => setOpen(false)}>
              Cancel
            </Button>
            <Button attention="high" onPress={() => setOpen(false)}>
              Confirm
            </Button>
          </View>
        }
      >
        <BodyContent>
          Dividers are always visible between the header, body, and footer sections, regardless of
          scroll position.
        </BodyContent>
      </Modal>
    </View>
  );
}

export function ModalWithDescription(): React.ReactElement {
  const [open, setOpen] = useState(false);

  return (
    <View style={row}>
      <Button onPress={() => setOpen(true)}>With Description</Button>
      <Modal
        open={open}
        onOpenChange={setOpen}
        title="Modal Title"
        description="This is a helpful description that provides additional context about what this modal is for."
        showDescription
        footerEnd={
          <View style={row}>
            <Button attention="low" onPress={() => setOpen(false)}>
              Cancel
            </Button>
            <Button attention="high" onPress={() => setOpen(false)}>
              Save
            </Button>
          </View>
        }
      >
        <BodyContent>Modal body content goes here.</BodyContent>
      </Modal>
    </View>
  );
}
