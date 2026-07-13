export { SecondaryNav } from './SecondaryNav.native';
export { HeaderNative, PrimaryNav } from './HeaderNative.native';
export { HeaderItem } from './HeaderItem.native';

export type {
  HeaderNativeProps,
  HeaderItemProps,
  HeaderItemAttention,
  HeaderItemSlotSize,
  HeaderItemSlotSizeInput,
  PrimaryNavProps,
  PrimaryNavType,
  PrimaryNavEndActionsType,
  SecondaryNavProps,
} from './interface';

export {
  useHeaderState,
  usePrimaryNavState,
  useHeaderItemState,
  resolvePrimaryNavLayout,
  humanizeHeaderItemValue,
  getHeaderAccessibilityProps,
  getPrimaryNavAccessibilityProps,
  getSecondaryNavAccessibilityProps,
  getHeaderItemAccessibilityProps,
} from './interface';

export { useHeaderContext } from './HeaderContext';
export { collectHeaderItemElements, hasNonEmptyReactChildren, headerItemElementKey, warnIfHeaderItemChildrenDropped } from './Header.utils.native';
