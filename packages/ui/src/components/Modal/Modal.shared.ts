/**
 * Modal.shared.ts
 * Shared types and hooks for Modal component
 * Used by both web and React Native implementations
 *
 * React API ≠ Figma API. Two intentional differences:
 *   1. `appearance` is NOT surfaced — the modal popup is role-neutral.
 *      Per-role styling is delegated to the slot children (footer buttons,
 *      headerStart, body content).
 *   2. `headerStart` is a single `ReactNode` slot per RFC 0001 — Figma's
 *      `none | icon | badge` enum is collapsed because presence/absence of
 *      the ReactNode is the gate, and the enum enforced nothing in code.
 *
 * Figma API surface preserved as-is for everything else:
 *   size: S | M | L | FullWidth
 *   header: true | false
 *   headerAlign: left | center
 *   title: true | false
 *   description: true | false
 *   dividerTopVisibility: none | onScroll | always
 *   dividerTopScrollPosition: start | middle | end
 *   body: figmaNativeSlot (customisable content area)
 *   dividerBottomVisibility: none | onScroll | always
 *   dividerBottomScrollPosition: start | middle | end
 *   footer: true | false
 *   footerOrientation: horizontal | vertical
 *   footerStart: none (figma native slot)
 *
 * Note: max-height is intentionally NOT a prop — Figma spec calls for fixed
 * per-size max-heights (S=50vh, M=70vh, L=85vh, FullWidth=100vh−margin) with
 * a mobile-viewport collapse to a unified 85vh. These are baked into the CSS
 * (.sizeS / .sizeM / .sizeL / .sizeFullWidth) and overridable via the
 * --Modal-maxHeight-* CSS custom property boundary.
 */

import type { ReactNode, CSSProperties, Ref } from 'react';

/** Modal size aligned with Figma spec: S, M, L, FullWidth */
export type ModalSize = 'S' | 'M' | 'L' | 'FullWidth';

/**
 * Reason the modal closed, forwarded from Base UI's Dialog Root.
 * Lets consumers distinguish "user pressed Escape" from "user clicked outside"
 * etc. — useful for guard flows ("warn before discard on Escape, allow silent
 * dismiss on outside-press").
 */
export type ModalCloseReason =
  | 'trigger-press'
  | 'outside-press'
  | 'escape-key'
  | 'close-press'
  | 'focus-out'
  | 'imperative-action'
  | 'none';

export interface ModalOpenChangeDetails {
  /** Why the modal opened or closed. */
  reason: ModalCloseReason;
  /** Native event associated with the Base UI change, when available. */
  event?: Event;
  /** Element that triggered the open/close request, when available. */
  trigger?: Element;
  /** Cancel Base UI's internal handling for this change request. */
  cancel?: () => void;
  /** Allows propagation when Base UI would otherwise stop it. */
  allowPropagation?: () => void;
  /** Whether a consumer has cancelled Base UI's internal handling. */
  isCanceled?: boolean;
  /** Whether Base UI is allowed to propagate the event. */
  isPropagationAllowed?: boolean;
}

/** Divider visibility options */
export type DividerVisibility = 'none' | 'onScroll' | 'always';

/** Scroll positions used by on-scroll divider thresholds */
export type DividerScrollPosition = 'start' | 'middle' | 'end';

/** Footer button orientation */
export type FooterOrientation = 'horizontal' | 'vertical';

/** Header alignment */
export type HeaderAlign = 'left' | 'center';

export interface ModalProps {
  /** Whether the modal is open (controlled) */
  open?: boolean;
  /** Default open state (uncontrolled) */
  defaultOpen?: boolean;
  /**
   * Called when the modal opens or closes. The `details.reason` arg lets
   * you distinguish dismiss triggers (Escape vs outside-press vs close button)
   * and inspect the underlying Base UI event/trigger details.
   */
  onOpenChange?: (open: boolean, details: ModalOpenChangeDetails) => void;

  /**
   * Whether Escape/outside press can dismiss the modal.
   * Explicit close controls and controlled parent state changes still work.
   * @default true
   */
  dismissible?: boolean;

  /**
   * Modal size preset.
   * @default "M"
   */
  size?: ModalSize;

  /**
   * Whether to show the header section.
   * @default true
   */
  header?: boolean;

  /**
   * Header content alignment.
   * @default "left"
   */
  headerAlign?: HeaderAlign;

  /**
   * Content for the header start slot. Renders before the title.
   * Per RFC 0001: presence/absence of the ReactNode is the visibility gate —
   * no enum discriminator needed.
   */
  headerStart?: ReactNode;

  /**
   * Whether to show the title.
   * @default true
   */
  showTitle?: boolean;

  /** Modal title text */
  title?: string;

  /**
   * Whether to show the description.
   * @default true
   */
  showDescription?: boolean;

  /** Modal description text */
  description?: string;

  /**
   * Top divider visibility behaviour.
   * @default "none"
   */
  dividerTopVisibility?: DividerVisibility;

  /**
   * Scroll threshold at which the top divider appears when
   * `dividerTopVisibility="onScroll"`.
   * @default "middle"
   */
  dividerTopScrollPosition?: DividerScrollPosition;

  /** Modal body content */
  children: ReactNode;

  /**
   * Bottom divider visibility behaviour.
   * @default "none"
   */
  dividerBottomVisibility?: DividerVisibility;

  /**
   * Scroll threshold through which the bottom divider remains visible when
   * `dividerBottomVisibility="onScroll"`.
   * @default "middle"
   */
  dividerBottomScrollPosition?: DividerScrollPosition;

  /**
   * Whether to show the footer section.
   * @default true
   */
  footer?: boolean;

  /**
   * Footer button orientation.
   * @default "horizontal"
   */
  footerOrientation?: FooterOrientation;

  /** Content for the footer start slot */
  footerStart?: ReactNode;

  /** Footer content (typically action buttons) */
  footerEnd?: ReactNode;

  /**
   * Accessible name for the dialog. Required when `header={false}` or
   * `showTitle={false}` — without it, screen readers announce an unnamed
   * dialog (WCAG 2.1 AA 4.1.2 violation). When the title is visible, Base UI
   * auto-wires `aria-labelledby` from <Dialog.Title> and this is optional.
   */
  'aria-label'?: string;

  /**
   * Optional id of an element labelling the dialog. Mutually exclusive with
   * `aria-label`. Takes precedence over Base UI's auto-wired Title link.
   */
  'aria-labelledby'?: string;

  /** Test id forwarded to the dialog popup */
  'data-testid'?: string;

  /** Additional class name */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
  /** Ref forwarding */
  ref?: Ref<HTMLDivElement>;
}

export function useModalState(props: ModalProps) {
  const resolvedSize = props.size ?? 'M';

  const dataAttrs: Record<string, string | undefined> = {
    'data-size': resolvedSize,
    ...(props.headerAlign === 'center' ? { 'data-header-align': 'center' } : {}),
    ...(props.footerOrientation === 'vertical' ? { 'data-footer-orientation': 'vertical' } : {}),
    'data-divider-top-scroll-position': props.dividerTopScrollPosition ?? 'middle',
    'data-divider-bottom-scroll-position': props.dividerBottomScrollPosition ?? 'middle',
  };

  return {
    resolvedSize,
    dataAttrs,
    showHeader: props.header !== false,
    showTitle: props.showTitle !== false,
    showDescription: props.showDescription !== false,
    showFooter: props.footer !== false,
    dividerTopVisibility: props.dividerTopVisibility ?? 'none',
    dividerBottomVisibility: props.dividerBottomVisibility ?? 'none',
    dividerTopScrollPosition: props.dividerTopScrollPosition ?? 'middle',
    dividerBottomScrollPosition: props.dividerBottomScrollPosition ?? 'middle',
    footerOrientation: props.footerOrientation ?? 'horizontal',
    headerAlign: props.headerAlign ?? 'left',
  };
}
