/**
 * Modal QA tests — smoke, functional, a11y, and bug-catching.
 *
 * Source: packages/ui-native/src/components/Modal/Modal.native.tsx
 *
 * ─── Figma API table ─────────────────────────────────────────────────────────
 *
 *   Property               Figma values              Native prop / values
 *   ─────────────────────────────────────────────────────────────────────────
 *   size                   s | m | l | fullWidth     size: 's'|'m'|'l'|'fullWidth'
 *   header                 true | false              header?: boolean (default true)
 *   headerAlign            left | center             headerAlign?: 'left'|'center'
 *   headerStart            none | Icon | badge       headerStart?: ReactNode
 *   Title                  true | false              showTitle?: boolean (default true)
 *   Description            true | false              showDescription?: boolean (default true)
 *   dividerTopVisibility   none | onScroll | always  dividerTopVisibility?: DividerVisibility
 *   body                   figmaNativeSlot           children: ReactNode
 *   dividerBottomVisibility none|onScroll|always     dividerBottomVisibility?: DividerVisibility
 *   footer                 true | false              footer?: boolean (default true)
 *   footerOrientation      horizontal | vertical     footerOrientation?: 'horizontal'|'vertical'
 *   footerStart            none (figmaNativeSlot)    footerStart?: ReactNode
 *   maxHeight              number (vh) — code only   NOT IMPLEMENTED (BUG-MDL-4)
 *   open                   — code only               open?: boolean
 *
 * ─── Native-only props (no Figma equivalent) ─────────────────────────────────
 *
 *   defaultOpen, onOpenChange, dismissible, footerEnd, aria-label,
 *   aria-labelledby (BUG-MDL-2), testID, style, accessibilityHint
 
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { describe, it, expect, vi } from 'vitest';
import { Modal } from '@ui-native/components/Modal/Modal.native';
import type { ModalSize } from '@ui-native/components/Modal/interface';
import { wrap } from '../../utils/renderWithTheme';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const BODY = <View testID="modal-body" />;

/** Finds the popup container (the View that carries all a11y props). */
function getPopup() {
  return screen.UNSAFE_getByProps({ accessibilityModal: true });
}

// ─── Figma matrix: size × header ─────────────────────────────────────────────
//
// Rows = size (s/m/l/fullWidth), columns = header (true/false)

describe('Modal — Figma matrix: size × header', () => {
  const SIZES = ['s', 'm', 'l', 'fullWidth'] as const satisfies readonly ModalSize[];
  const HEADERS = [true, false] as const;

  for (const size of SIZES) {
    for (const header of HEADERS) {
      it(`[smoke] size="${size}" header=${header} renders without crashing`, () => {
        expect(() =>
          render(wrap(
            <Modal
              open={true}
              size={size}
              header={header}
              title="Title"
              description="Description"
              testID={`modal-${size}-${String(header)}`}
            >
              {BODY}
            </Modal>,
          )),
        ).not.toThrow();
      });

      it(`[fn] size="${size}" header=${header} — RN Modal is visible`, () => {
        const { getByTestId } = render(wrap(
          <Modal
            open={true}
            size={size}
            header={header}
            title="Title"
            testID={`modal-${size}-${String(header)}`}
          >
            {BODY}
          </Modal>,
        ));
        expect(getByTestId(`modal-${size}-${String(header)}`).props.visible).toBe(true);
      });
    }
  }
});

// ─── Smoke ────────────────────────────────────────────────────────────────────

describe('Modal — smoke', () => {
  it('[smoke] renders with open=true', () => {
    expect(() =>
      render(wrap(<Modal open={true} testID="m">{BODY}</Modal>)),
    ).not.toThrow();
  });

  it('[smoke] renders with open=false', () => {
    expect(() =>
      render(wrap(<Modal open={false} testID="m">{BODY}</Modal>)),
    ).not.toThrow();
  });

  it('[smoke] renders with defaultOpen=true (uncontrolled)', () => {
    expect(() =>
      render(wrap(<Modal defaultOpen={true} testID="m">{BODY}</Modal>)),
    ).not.toThrow();
  });

  it('[smoke] renders all headerAlign variants', () => {
    for (const align of ['left', 'center'] as const) {
      const { unmount } = render(wrap(
        <Modal open={true} headerAlign={align} title="T">{BODY}</Modal>,
      ));
      unmount();
    }
  });

  it('[smoke] renders all footerOrientation variants', () => {
    for (const orientation of ['horizontal', 'vertical'] as const) {
      const { unmount } = render(wrap(
        <Modal open={true} footerOrientation={orientation} footerEnd={<View />}>
          {BODY}
        </Modal>,
      ));
      unmount();
    }
  });

  it('[smoke] renders all dividerTopVisibility variants', () => {
    for (const vis of ['none', 'onScroll', 'always'] as const) {
      const { unmount } = render(wrap(
        <Modal open={true} dividerTopVisibility={vis}>{BODY}</Modal>,
      ));
      unmount();
    }
  });

  it('[smoke] renders all dividerBottomVisibility variants', () => {
    for (const vis of ['none', 'onScroll', 'always'] as const) {
      const { unmount } = render(wrap(
        <Modal open={true} dividerBottomVisibility={vis}>{BODY}</Modal>,
      ));
      unmount();
    }
  });

  it('[smoke] renders with all optional props', () => {
    expect(() =>
      render(wrap(
        <Modal
          open={true}
          size="m"
          header={true}
          headerAlign="center"
          headerStart={<View testID="hdr-start" />}
          title="Full Dialog"
          description="Extended description text"
          showTitle={true}
          showDescription={true}
          dividerTopVisibility="always"
          dividerBottomVisibility="always"
          footer={true}
          footerOrientation="horizontal"
          footerStart={<View testID="ftr-start" />}
          footerEnd={<View testID="ftr-end" />}
          aria-label="Confirm action"
          accessibilityHint="Double tap to confirm"
          testID="full-modal"
        >
          {BODY}
        </Modal>,
      )),
    ).not.toThrow();
  });
});

// ─── Functional: open / close state ──────────────────────────────────────────

describe('Modal — functional: open / close state', () => {
  it('[fn] controlled open=true → RN Modal visible=true', () => {
    render(wrap(<Modal open={true} testID="m">{BODY}</Modal>));
    expect(screen.getByTestId('m').props.visible).toBe(true);
  });

  it('[fn] controlled open=false → RN Modal visible=false', () => {
    render(wrap(<Modal open={false} testID="m">{BODY}</Modal>));
    expect(screen.getByTestId('m').props.visible).toBe(false);
  });

  it('[fn] uncontrolled defaultOpen=true → visible=true', () => {
    render(wrap(<Modal defaultOpen={true} testID="m">{BODY}</Modal>));
    expect(screen.getByTestId('m').props.visible).toBe(true);
  });

  it('[fn] uncontrolled defaultOpen=false → visible=false', () => {
    render(wrap(<Modal defaultOpen={false} testID="m">{BODY}</Modal>));
    expect(screen.getByTestId('m').props.visible).toBe(false);
  });

  it('[fn] no open/defaultOpen → defaults to closed (visible=false)', () => {
    render(wrap(<Modal testID="m">{BODY}</Modal>));
    expect(screen.getByTestId('m').props.visible).toBe(false);
  });

  it('[fn] controlled: close button fires onOpenChange(false, close-press)', () => {
    const handler = vi.fn();
    render(wrap(
      <Modal open={true} title="T" onOpenChange={handler} testID="m">{BODY}</Modal>,
    ));
    fireEvent.press(screen.getByLabelText('Close'));
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith(false, { reason: 'close-press' });
  });

  it('[fn] uncontrolled: close button press sets visible=false', () => {
    render(wrap(<Modal defaultOpen={true} title="T" testID="m">{BODY}</Modal>));
    expect(screen.getByTestId('m').props.visible).toBe(true);
    fireEvent.press(screen.getByLabelText('Close'));
    expect(screen.getByTestId('m').props.visible).toBe(false);
  });

  it('[fn] dismissible=true (default): onRequestClose fires onOpenChange(false, outside-press)', () => {
    const handler = vi.fn();
    render(wrap(
      <Modal open={true} onOpenChange={handler} testID="m">{BODY}</Modal>,
    ));
    screen.getByTestId('m').props.onRequestClose?.();
    expect(handler).toHaveBeenCalledWith(false, { reason: 'outside-press' });
  });

  it('[fn] dismissible=false: onRequestClose does NOT fire onOpenChange', () => {
    const handler = vi.fn();
    render(wrap(
      <Modal open={true} dismissible={false} onOpenChange={handler} testID="m">{BODY}</Modal>,
    ));
    screen.getByTestId('m').props.onRequestClose?.();
    expect(handler).not.toHaveBeenCalled();
  });

  it('[fn] dismissible=false: close button still fires onOpenChange(false, close-press)', () => {
    // dismissible guards back-button / backdrop only; the X button always fires
    const handler = vi.fn();
    render(wrap(
      <Modal open={true} dismissible={false} title="T" onOpenChange={handler} testID="m">{BODY}</Modal>,
    ));
    fireEvent.press(screen.getByLabelText('Close'));
    expect(handler).toHaveBeenCalledWith(false, { reason: 'close-press' });
  });

  it('[fn] uncontrolled: onRequestClose with dismissible=true sets visible=false', () => {
    render(wrap(<Modal defaultOpen={true} testID="m">{BODY}</Modal>));
    screen.getByTestId('m').props.onRequestClose?.();
    expect(screen.getByTestId('m').props.visible).toBe(false);
  });

  it('[fn] uncontrolled: onRequestClose with dismissible=false leaves visible=true', () => {
    render(wrap(<Modal defaultOpen={true} dismissible={false} testID="m">{BODY}</Modal>));
    screen.getByTestId('m').props.onRequestClose?.();
    expect(screen.getByTestId('m').props.visible).toBe(true);
  });

  it('[fn] controlled open prop update re-syncs visible state', () => {
    const { rerender } = render(wrap(<Modal open={false} testID="m">{BODY}</Modal>));
    expect(screen.getByTestId('m').props.visible).toBe(false);
    rerender(wrap(<Modal open={true} testID="m">{BODY}</Modal>));
    expect(screen.getByTestId('m').props.visible).toBe(true);
  });
});

// ─── Functional: header ───────────────────────────────────────────────────────

describe('Modal — functional: header', () => {
  it('[fn] title text renders when showTitle=true (default)', () => {
    render(wrap(<Modal open={true} title="My Dialog Title">{BODY}</Modal>));
    expect(screen.getByText('My Dialog Title')).toBeTruthy();
  });

  it('[fn] showTitle=false hides title text', () => {
    render(wrap(
      <Modal open={true} title="My Dialog Title" showTitle={false}>{BODY}</Modal>,
    ));
    expect(screen.queryByText('My Dialog Title')).toBeNull();
  });

  it('[fn] description text renders when showDescription=true (default)', () => {
    render(wrap(
      <Modal open={true} description="Supplemental description">{BODY}</Modal>,
    ));
    expect(screen.getByText('Supplemental description')).toBeTruthy();
  });

  it('[fn] showDescription=false hides description text', () => {
    render(wrap(
      <Modal open={true} description="Supplemental description" showDescription={false}>{BODY}</Modal>,
    ));
    expect(screen.queryByText('Supplemental description')).toBeNull();
  });

  it('[fn] header=true (default) shows the close button', () => {
    render(wrap(<Modal open={true} title="T">{BODY}</Modal>));
    expect(screen.getByLabelText('Close')).toBeTruthy();
  });

  it('[fn] header=false hides the close button', () => {
    render(wrap(<Modal open={true} header={false} title="T">{BODY}</Modal>));
    expect(screen.queryByLabelText('Close')).toBeNull();
  });

  it('[fn] header=false hides title text', () => {
    render(wrap(<Modal open={true} header={false} title="My Dialog Title">{BODY}</Modal>));
    expect(screen.queryByText('My Dialog Title')).toBeNull();
  });

  it('[fn] header=false hides description text', () => {
    render(wrap(
      <Modal open={true} header={false} description="Desc text">{BODY}</Modal>,
    ));
    expect(screen.queryByText('Desc text')).toBeNull();
  });

  it('[fn] headerStart slot renders its content', () => {
    render(wrap(
      <Modal open={true} title="T" headerStart={<View testID="header-icon" />}>{BODY}</Modal>,
    ));
    expect(screen.getByTestId('header-icon')).toBeTruthy();
  });

  it('[fn] headerStart=undefined renders no start content', () => {
    render(wrap(<Modal open={true} title="T">{BODY}</Modal>));
    expect(screen.queryByTestId('header-icon')).toBeNull();
  });

  it('[fn] headerAlign=center renders without crashing', () => {
    expect(() =>
      render(wrap(
        <Modal open={true} headerAlign="center" title="Centered">{BODY}</Modal>,
      )),
    ).not.toThrow();
  });

  it('[fn] headerAlign=left renders without crashing', () => {
    expect(() =>
      render(wrap(
        <Modal open={true} headerAlign="left" title="Left aligned">{BODY}</Modal>,
      )),
    ).not.toThrow();
  });

  it('[fn] header=false and header=true × headerAlign combinations smoke', () => {
    for (const header of [true, false]) {
      for (const align of ['left', 'center'] as const) {
        const { unmount } = render(wrap(
          <Modal open={true} header={header} headerAlign={align} title="T">{BODY}</Modal>,
        ));
        unmount();
      }
    }
  });
});

// ─── Functional: body ─────────────────────────────────────────────────────────

describe('Modal — functional: body (children)', () => {
  it('[fn] children render inside modal body', () => {
    render(wrap(
      <Modal open={true}>
        <View testID="body-child" />
      </Modal>,
    ));
    expect(screen.getByTestId('body-child')).toBeTruthy();
  });

  it('[fn] multiple children all render', () => {
    render(wrap(
      <Modal open={true}>
        <View testID="child-a" />
        <View testID="child-b" />
        <View testID="child-c" />
      </Modal>,
    ));
    expect(screen.getByTestId('child-a')).toBeTruthy();
    expect(screen.getByTestId('child-b')).toBeTruthy();
    expect(screen.getByTestId('child-c')).toBeTruthy();
  });
});

// ─── Functional: footer ───────────────────────────────────────────────────────

describe('Modal — functional: footer', () => {
  it('[fn] footerEnd slot renders its content', () => {
    render(wrap(
      <Modal open={true} footerEnd={<View testID="save-btn" />}>{BODY}</Modal>,
    ));
    expect(screen.getByTestId('save-btn')).toBeTruthy();
  });

  it('[fn] footerStart slot renders its content', () => {
    render(wrap(
      <Modal open={true} footerStart={<View testID="tertiary-btn" />}>{BODY}</Modal>,
    ));
    expect(screen.getByTestId('tertiary-btn')).toBeTruthy();
  });

  it('[fn] both footerStart and footerEnd render together', () => {
    render(wrap(
      <Modal
        open={true}
        footerStart={<View testID="ftr-start" />}
        footerEnd={<View testID="ftr-end" />}
      >
        {BODY}
      </Modal>,
    ));
    expect(screen.getByTestId('ftr-start')).toBeTruthy();
    expect(screen.getByTestId('ftr-end')).toBeTruthy();
  });

  it('[fn] footer=false hides footerEnd content', () => {
    render(wrap(
      <Modal open={true} footer={false} footerEnd={<View testID="save-btn" />}>{BODY}</Modal>,
    ));
    expect(screen.queryByTestId('save-btn')).toBeNull();
  });

  it('[fn] footer=false hides footerStart content', () => {
    render(wrap(
      <Modal open={true} footer={false} footerStart={<View testID="tertiary-btn" />}>{BODY}</Modal>,
    ));
    expect(screen.queryByTestId('tertiary-btn')).toBeNull();
  });

  it('[fn] footerOrientation=vertical renders without crashing', () => {
    expect(() =>
      render(wrap(
        <Modal open={true} footerOrientation="vertical" footerEnd={<View testID="btn" />}>{BODY}</Modal>,
      )),
    ).not.toThrow();
  });

  it('[fn] footerOrientation=horizontal renders without crashing', () => {
    expect(() =>
      render(wrap(
        <Modal open={true} footerOrientation="horizontal" footerEnd={<View testID="btn" />}>{BODY}</Modal>,
      )),
    ).not.toThrow();
  });
});

// ─── Functional: dividers ─────────────────────────────────────────────────────

describe('Modal — functional: dividers', () => {
  it('[fn] dividerTopVisibility=always renders a Divider above body', () => {
    render(wrap(
      <Modal open={true} dividerTopVisibility="always" title="T">{BODY}</Modal>,
    ));
    // Modal's Dividers use roundCaps=true — acts as discriminator
    expect(screen.UNSAFE_getAllByProps({ roundCaps: true }).length).toBeGreaterThanOrEqual(1);
  });

  it('[fn] dividerBottomVisibility=always renders a Divider below body', () => {
    render(wrap(
      <Modal open={true} dividerBottomVisibility="always" title="T">{BODY}</Modal>,
    ));
    expect(screen.UNSAFE_getAllByProps({ roundCaps: true }).length).toBeGreaterThanOrEqual(1);
  });

  it('[fn] both dividers=always renders exactly two Dividers', () => {
    render(wrap(
      <Modal
        open={true}
        dividerTopVisibility="always"
        dividerBottomVisibility="always"
        title="T"
      >
        {BODY}
      </Modal>,
    ));
    expect(screen.UNSAFE_getAllByProps({ roundCaps: true }).length).toBe(2);
  });

  it('[fn] dividerTopVisibility=onScroll does not show divider before scroll', () => {
    // Before any scroll event, scrollState='fits' → no divider shown
    render(wrap(
      <Modal open={true} dividerTopVisibility="onScroll" title="T">{BODY}</Modal>,
    ));
    // No roundCaps elements should appear in the initial (pre-scroll) state
    let count = 0;
    try { count = screen.UNSAFE_getAllByProps({ roundCaps: true }).length; } catch { count = 0; }
    expect(count).toBe(0);
  });
});

// ─── A11y ─────────────────────────────────────────────────────────────────────

describe('Modal — a11y', () => {
  it('[a11y] popup container has accessibilityModal=true', () => {
    render(wrap(<Modal open={true} title="T">{BODY}</Modal>));
    expect(getPopup().props.accessibilityModal).toBe(true);
  });

  it('[a11y] popup container has accessible=true', () => {
    render(wrap(<Modal open={true} title="T">{BODY}</Modal>));
    expect(getPopup().props.accessible).toBe(true);
  });

  it('[a11y] aria-label maps to accessibilityLabel on popup', () => {
    render(wrap(
      <Modal open={true} aria-label="Confirm deletion" title="T">{BODY}</Modal>,
    ));
    expect(getPopup().props.accessibilityLabel).toBe('Confirm deletion');
  });

  it('[a11y] aria-label takes precedence over title for accessibilityLabel', () => {
    render(wrap(
      <Modal open={true} aria-label="Explicit label" title="Title Text">{BODY}</Modal>,
    ));
    expect(getPopup().props.accessibilityLabel).toBe('Explicit label');
  });

  it('[a11y] title used as accessibilityLabel fallback when no aria-label', () => {
    render(wrap(<Modal open={true} title="Dialog Title">{BODY}</Modal>));
    expect(getPopup().props.accessibilityLabel).toBe('Dialog Title');
  });

  it('[a11y] no accessibilityLabel when aria-label absent, header hidden, and title absent', () => {
    render(wrap(<Modal open={true}>{BODY}</Modal>));
    expect(getPopup().props.accessibilityLabel).toBeUndefined();
  });

  it('[a11y] accessibilityHint forwarded to popup container', () => {
    render(wrap(
      <Modal open={true} title="T" accessibilityHint="Double tap to dismiss">{BODY}</Modal>,
    ));
    expect(getPopup().props.accessibilityHint).toBe('Double tap to dismiss');
  });

  it('[a11y] close button has accessible label "Close"', () => {
    render(wrap(<Modal open={true} title="T">{BODY}</Modal>));
    expect(screen.getByLabelText('Close')).toBeTruthy();
  });

  it('[a11y] RN Modal has animationType="fade"', () => {
    render(wrap(<Modal open={true} testID="m">{BODY}</Modal>));
    expect(screen.getByTestId('m').props.animationType).toBe('fade');
  });

  it('[a11y] RN Modal has transparent=true (renders scrim layer)', () => {
    render(wrap(<Modal open={true} testID="m">{BODY}</Modal>));
    expect(screen.getByTestId('m').props.transparent).toBe(true);
  });

  it('[a11y] showTitle=false: title not used as accessibilityLabel fallback', () => {
    render(wrap(
      <Modal open={true} title="Hidden Title" showTitle={false}>{BODY}</Modal>,
    ));
    // showTitle=false suppresses the title fallback in getModalAccessibilityProps
    expect(getPopup().props.accessibilityLabel).toBeUndefined();
  });
});

// ─── Bugs (all intentionally failing) ────────────────────────────────────────

describe('Modal — bugs (all intentionally failing)', () => {
  it('[bug] BUG-MDL-1 · popup accessibilityRole should be "alertdialog", not "alert"', () => {
    render(wrap(<Modal open={true} title="T">{BODY}</Modal>));
    // FAILS: getModalAccessibilityProps returns accessibilityRole:'alert'
    // Correct ARIA role for a modal dialog is 'alertdialog'
    // File: packages/ui-native/src/components/Modal/interface.ts:180
    expect(getPopup().props.accessibilityRole).toBe('alertdialog');
  });

  it('[bug] BUG-MDL-2 · aria-labelledby should be forwarded as accessibilityLabelledBy', () => {
    render(wrap(
      <Modal open={true} aria-labelledby="dialog-heading" title="T">{BODY}</Modal>,
    ));
    // FAILS: getModalAccessibilityProps never reads aria-labelledby
    // Screen readers cannot link the dialog to an external label element
    // File: packages/ui-native/src/components/Modal/interface.ts:172-185
    expect(getPopup().props.accessibilityLabelledBy).toBe('dialog-heading');
  });

  it('[bug] BUG-MDL-4 · maxHeight prop should be accepted per Figma code-only API', () => {
    // Figma API table: maxHeight (code only) — "Specify the max-height of the modal"
    // ModalProps has no maxHeight field → prop is silently dropped → height not overridable
    // POPUP_SIZE.s hard-codes maxHeight:'50%'
    // File: packages/ui-native/src/components/Modal/interface.ts:40
    // @ts-expect-error — maxHeight not in ModalProps; should be added per Figma spec
    render(wrap(<Modal open={true} maxHeight={300} title="T">{BODY}</Modal>));
    const popup = getPopup();
    const fs = StyleSheet.flatten(popup.props.style);
    // FAILS: maxHeight is '50%' (POPUP_SIZE.s default) — prop is not wired up
    expect(fs.maxHeight).toBe(300);
  });
});
