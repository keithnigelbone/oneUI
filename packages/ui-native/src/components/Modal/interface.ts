/**
 * Modal interface (native)
 * Semantic source: packages/ui/src/components/Modal/Modal.shared.ts
 */

import type { ReactNode } from 'react';
import type { ViewStyle } from 'react-native';

/** Modal size aligned with Figma spec: s, m, l, fullWidth */
export type ModalSize = 's' | 'm' | 'l' | 'fullWidth';

/** Divider visibility options */
export type DividerVisibility = 'none' | 'onScroll' | 'always';

/** Scroll positions used by on-scroll divider thresholds */
export type DividerScrollPosition = 'start' | 'middle' | 'end';

/** Footer button orientation */
export type FooterOrientation = 'horizontal' | 'vertical';

/** Header alignment */
export type HeaderAlign = 'left' | 'center';

/** Reason the modal closed, aligned with web ModalCloseReason */
export type ModalCloseReason =
  | 'trigger-press'
  | 'outside-press'
  | 'escape-key'
  | 'close-press'
  | 'focus-out'
  | 'imperative-action'
  | 'none';

export interface ModalOpenChangeDetails {
  reason: ModalCloseReason;
  /** Native event associated with the change, when available. */
  event?: unknown;
}

export interface ModalProps {
  /** Whether the modal is open (controlled) */
  open?: boolean;
  /** Default open state (uncontrolled) */
  defaultOpen?: boolean;
  /** Called when the modal opens or closes. */
  onOpenChange?: (open: boolean, details: ModalOpenChangeDetails) => void;

  /**
   * Whether back button (Android) or outside press can dismiss the modal.
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

  /** Content for the header start slot. */
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
   * Scroll threshold at which the top divider appears when `dividerTopVisibility="onScroll"`.
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
   * Scroll threshold through which the bottom divider remains visible when `dividerBottomVisibility="onScroll"`.
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

  /** Accessible name for the dialog. */
  'aria-label'?: string;

  /** Optional id of an element labelling the dialog. */
  'aria-labelledby'?: string;

  /** React Native test identifier. */
  testID?: string;

  /** Additional native styles for the popup container. */
  style?: ViewStyle;

  /** Describes the result of performing an action (React Native). */
  accessibilityHint?: string;
}

export function useModalState(props: ModalProps) {
  const resolvedSize = props.size ?? 's';

  return {
    resolvedSize,
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

export function getModalAccessibilityProps(
  props: Pick<ModalProps, 'aria-label' | 'aria-labelledby' | 'title' | 'accessibilityHint'>,
  state: { showHeader: boolean; showTitle: boolean }
) {
  const label =
    props['aria-label'] ?? (state.showHeader && state.showTitle ? props.title : undefined);

  return {
    accessible: true,
    accessibilityRole: 'alert' as const,
    accessibilityLabel: label,
    accessibilityLabelledBy: props['aria-labelledby'],
    accessibilityHint: props.accessibilityHint,
    accessibilityModal: true,
  };
}
