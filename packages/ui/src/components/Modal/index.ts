export { Modal, ModalTrigger, ModalClose } from './Modal';
export { useModalState } from './Modal.shared';
export type {
  ModalProps,
  ModalSize,
  DividerVisibility,
  FooterOrientation,
  HeaderAlign,
} from './Modal.shared';

// Token manifest for Component Token Editor
export {
  MODAL_TOKEN_MANIFEST,
  MODAL_TOKENS,
  getModalTokensByCategory,
  getModalTokenDefault,
  isModalTokenLocked,
  getModalTokenLockReason,
} from './Modal.tokens';

// Recipe definition for Component Recipe System
export { MODAL_RECIPE_DEFINITION } from './Modal.recipe';

// Unified component metadata
export { MODAL_META } from './Modal.meta';

// Showcase components — shared between Storybook stories and platform documentation
export {
  ModalDefault,
  ModalSizes,
  ModalHeaderAlign,
  ModalScrollable,
  ModalVerticalFooter,
  ModalNoHeader,
  ModalNoFooter,
  ModalWithDividers,
  ModalWithDescription,
} from './Modal.showcase';
