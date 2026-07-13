/**
 * Select.tsx
 *
 * OneUI Select micropattern — Base UI Select (single/multi listbox) and Base UI Menu
 * (actions). Composes InputField / Button / IconButton triggers per Figma.
 */

'use client';

import * as React from 'react';
import { Select as BaseSelect } from '@base-ui/react/select';
import { Menu as BaseMenu } from '@base-ui/react/menu';
import clsx from 'clsx';
import styles from './Select.module.css';
import { BrandScopePortal } from '../../contexts/BrandScopeContext';
import { InputField } from '../InputField/InputField';
import { Button } from '../Button/Button';
import { IconButton } from '../IconButton/IconButton';
import { Icon } from '../Icon/Icon';
import { Checkbox } from '../Checkbox/Checkbox';
import { SelectChevronIcon, SelectCheckIcon } from './SelectIcons';
import {
  FIGMA_SELECT_MULTI_SECTIONS,
  FIGMA_SELECT_OPTION_SECONDARY,
  FIGMA_SELECT_PLACEHOLDER,
  FIGMA_SELECT_SINGLE_OPTIONS,
  FIGMA_SELECT_MENU_SIDE_OFFSET_PX,
} from './Select.figma';
import { SelectInputFieldTrigger } from './SelectInputFieldTrigger';
import { resolveSelectTriggerStart, resolveSelectStartSlot } from './SelectStartSlots';
import {
  type SelectBaseProps,
  type SelectOption,
  type SelectSection,
  type SelectSelectableInputProps,
  type SelectSelectableButtonProps,
  type SelectSelectableIconButtonProps,
  type SelectMenuProps,
  groupSelectOptions,
  getSelectAccessibilityProps,
  menuAlignFromAlignment,
  menuSideFromDirection,
  selectAppearanceToInputAppearance,
  selectSizeToButtonSize,
  selectTriggerText,
  useSelectState,
  resolveDefaultAttention,
} from './Select.shared';
import type { ButtonProps } from '../Button/Button.shared';
import type { IconButtonProps } from '../IconButton/IconButton.shared';

const FIGMA_HEART_ICON = (
  <Icon icon="heart" size="4" appearance="primary" emphasis="high" aria-hidden />
);

export type { SelectOption, SelectSection } from './Select.shared';

export interface SelectProps<T extends string | number = string>
  extends SelectBaseProps<T> {
  /** @deprecated Use `onValueChange` — kept for platform app compatibility. */
  onChange?: (value: T) => void;
}

function useSelectOpen(
  openProp: boolean | undefined,
  onOpenChange?: (open: boolean) => void,
) {
  const [open, setOpen] = React.useState(openProp ?? false);

  React.useEffect(() => {
    if (openProp !== undefined) {
      setOpen(openProp);
    }
  }, [openProp]);

  const handleOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      setOpen(nextOpen);
      onOpenChange?.(nextOpen);
    },
    [onOpenChange],
  );

  const forceClose = React.useCallback(() => {
    setOpen(false);
    onOpenChange?.(false);
  }, [onOpenChange]);

  return { open, handleOpenChange, forceClose };
}

function useSearchState(searchable: boolean, isOpen: boolean) {
  const [searchQuery, setSearchQuery] = React.useState('');
  React.useEffect(() => {
    if (!isOpen) setSearchQuery('');
  }, [isOpen]);
  const handleSearchKeyDown = React.useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') return;
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
  }, []);
  const handleSearchKeyUp = React.useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
  }, []);
  return {
    searchQuery,
    setSearchQuery,
    handleSearchKeyDown,
    handleSearchKeyUp,
    enabled: searchable,
  };
}

function filterOptions<T extends string | number>(
  options: SelectOption<T>[],
  query: string,
): SelectOption<T>[] {
  if (!query.trim()) return options;
  const q = query.trim().toLowerCase();
  return options.filter(
    (o) =>
      o.label.toLowerCase().includes(q) ||
      (o.secondaryText?.toLowerCase().includes(q) ?? false),
  );
}

// ── Trigger surfaces (standalone compound previews) ─────────────────────────

interface TriggerRenderProps<T extends string | number> {
  props: SelectProps<T>;
  state: ReturnType<typeof useSelectState<T>>;
  isOpen: boolean;
  displayText: string;
  isPlaceholder: boolean;
  a11y: ReturnType<typeof getSelectAccessibilityProps<T>>;
  className?: string;
}

function SelectButtonTrigger<T extends string | number>({
  props,
  state,
  isOpen,
  displayText,
  a11y,
  className,
}: TriggerRenderProps<T>) {
  const showChevron = props.chevron !== false;
  return (
    <Button
      attention={resolveDefaultAttention(props)}
      appearance={state.appearance}
      size={selectSizeToButtonSize(state.size)}
      condensed={props.condensed}
      contained={props.contained ?? true}
      end={showChevron ? <SelectChevronIcon open={isOpen} /> : undefined}
      start={props.start}
      disabled={state.isDisabled}
      className={clsx(styles.buttonTrigger, className)}
      aria-expanded={a11y['aria-expanded']}
      aria-haspopup={a11y['aria-haspopup']}
      aria-label={a11y['aria-label']}
    >
      {displayText}
    </Button>
  );
}

function SelectIconButtonTrigger<T extends string | number>({
  props,
  state,
  isOpen,
  a11y,
  className,
}: TriggerRenderProps<T>) {
  return (
    <IconButton
      icon={props.triggerIcon ?? FIGMA_HEART_ICON}
      attention={resolveDefaultAttention(props)}
      appearance={state.appearance}
      size={selectSizeToButtonSize(state.size)}
      condensed={props.condensed}
      contained={props.contained ?? true}
      disabled={state.isDisabled}
      className={clsx(styles.iconButtonTrigger, className)}
      aria-expanded={a11y['aria-expanded']}
      aria-haspopup={a11y['aria-haspopup']}
      aria-label={a11y['aria-label'] ?? props.label ?? 'Select'}
    />
  );
}

// ── Listbox Select (single + multi) ─────────────────────────────────────────

function SelectListbox<T extends string | number = string>(props: SelectProps<T>) {
  const {
    options,
    sections,
    value,
    values,
    onChange,
    onValueChange,
    onValuesChange,
    placeholder = FIGMA_SELECT_PLACEHOLDER,
    disabled = false,
    className,
    searchable: searchableProp,
    showSearch,
    onOpenChange,
    open: openProp,
  } = props;

  const state = useSelectState(props);
  const searchable = searchableProp ?? showSearch ?? state.searchable;
  const { open, handleOpenChange: notifyOpenChange, forceClose } = useSelectOpen(
    openProp,
    onOpenChange,
  );
  const search = useSearchState(searchable, open);
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  const filteredOptions = React.useMemo(
    () => filterOptions(options, search.searchQuery),
    [options, search.searchQuery],
  );
  const grouped = React.useMemo(
    () => groupSelectOptions(filteredOptions, sections),
    [filteredOptions, sections],
  );
  const hiddenValues = React.useMemo(() => {
    if (!searchable || !search.searchQuery) return null;
    const hidden = new Set<string>();
    for (const opt of options) {
      if (!opt.label.toLowerCase().includes(search.searchQuery.toLowerCase())) {
        hidden.add(String(opt.value));
      }
    }
    return hidden;
  }, [options, search.searchQuery, searchable]);

  const visibleCount = hiddenValues ? options.length - hiddenValues.size : options.length;

  const items = React.useMemo(
    () => options.map((opt) => ({ value: opt.value, label: opt.label })),
    [options],
  );

  const { text: displayText, isPlaceholder } = selectTriggerText(
    options,
    state,
    placeholder,
    props.triggerLabel,
  );
  const a11y = getSelectAccessibilityProps(props, state, open);

  const handleOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      notifyOpenChange(nextOpen);
      if (!nextOpen) search.setSearchQuery('');
    },
    [notifyOpenChange, search],
  );

  const handleValueChange = React.useCallback(
    (newValue: T | T[] | null) => {
      if (state.isMulti) {
        onValuesChange?.((newValue as T[]) ?? []);
        return;
      }
      const next = newValue as T | null;
      if (next !== null) {
        onValueChange?.(next);
        onChange?.(next);
        forceClose();
      }
    },
    [onChange, onValueChange, onValuesChange, forceClose, state.isMulti],
  );

  React.useEffect(() => {
    if (searchable && open) {
      requestAnimationFrame(() => searchInputRef.current?.focus());
    }
  }, [open, searchable, search.searchQuery]);

  const selectValue = state.isMulti ? (values ?? []) : (value ?? null);
  const hasSwatches = options.some((opt) => opt.color || opt.swatch);
  const selectedOption = options.find((opt) => opt.value === value);

  const isInputFillMenu = state.trigger === 'input' && state.menuSize === 'fill';

  const positionerClassName = clsx(
    styles.positioner,
    state.menuSize === 'fill' && styles.positionerFill,
    isInputFillMenu && styles.selectMenuWrapper,
  );

  const popupClassName = clsx(
    styles.popup,
    styles[`menuSize-${state.menuSize}`],
    isInputFillMenu && styles.popupInputFill,
    isInputFillMenu && styles.selectMenu,
  );

  const menuSideOffset =
    state.trigger === 'input' ? FIGMA_SELECT_MENU_SIDE_OFFSET_PX : 4;

  // Figma SelectInputWrapper — menu opens below input with 8px gap, not overlapping trigger text.
  const alignItemWithTrigger = state.trigger !== 'input';

  const sizeClass =
    state.size === 's' ? styles['size-sm'] : state.size === 'l' ? styles['size-lg'] : styles['size-md'];

  return (
    <BaseSelect.Root
      value={selectValue as T}
      onValueChange={handleValueChange}
      disabled={disabled}
      items={items}
      multiple={state.isMulti}
      modal
      open={open}
      onOpenChange={handleOpenChange}
    >
      {state.trigger === 'input' ? (
        <>
          <SelectInputFieldTrigger
            props={props}
            state={state}
            isOpen={open}
            displayText={displayText}
            isPlaceholder={isPlaceholder}
            className={className}
          />
          <span className={styles.srOnly} aria-hidden="true">
            <BaseSelect.Value />
          </span>
        </>
      ) : (
        <BaseSelect.Trigger
          className={clsx(styles.trigger, sizeClass, className)}
          nativeButton
          aria-label={a11y['aria-label']}
          aria-labelledby={a11y['aria-labelledby']}
          aria-describedby={a11y['aria-describedby']}
          aria-required={a11y['aria-required']}
          aria-invalid={a11y['aria-invalid']}
          render={
            state.trigger === 'button'
              ? (triggerProps) => (
                  <Button
                    // Base UI trigger props are generic HTML button attrs; Button's
                    // interface doesn't extend those, so bridge the render-prop spread.
                    {...(triggerProps as Partial<ButtonProps>)}
                    attention={resolveDefaultAttention(props)}
                    appearance={state.appearance}
                    size={selectSizeToButtonSize(state.size)}
                    condensed={props.condensed}
                    contained={props.contained ?? true}
                    end={
                      props.chevron !== false ? <SelectChevronIcon open={open} /> : undefined
                    }
                    start={resolveSelectTriggerStart(props)}
                    disabled={state.isDisabled}
                    className={clsx(styles.buttonTrigger, className)}
                  >
                    {displayText}
                  </Button>
                )
              : (triggerProps) => (
                  <IconButton
                    {...(triggerProps as Partial<IconButtonProps>)}
                    icon={props.triggerIcon ?? FIGMA_HEART_ICON}
                    attention={resolveDefaultAttention(props)}
                    appearance={state.appearance}
                    size={selectSizeToButtonSize(state.size)}
                    condensed={props.condensed}
                    contained={props.contained ?? true}
                    disabled={state.isDisabled}
                    className={clsx(styles.iconButtonTrigger, className)}
                    aria-label={a11y['aria-label'] ?? props.label ?? 'Select'}
                  />
                )
          }
        />
      )}

      <BaseSelect.Portal>
        <BrandScopePortal>
          <BaseSelect.Backdrop className={styles.backdrop} />
          <BaseSelect.Positioner
            className={positionerClassName}
            side={menuSideFromDirection(state.menuDirection)}
            align={menuAlignFromAlignment(state.menuAlignment)}
            sideOffset={menuSideOffset}
            alignItemWithTrigger={alignItemWithTrigger}
          >
            <BaseSelect.Popup className={popupClassName}>
              {searchable && (
                <div
                  className={styles.searchContainer}
                  onKeyDown={search.handleSearchKeyDown}
                  onKeyUp={search.handleSearchKeyUp}
                >
                  <input
                    ref={searchInputRef}
                    type="search"
                    className={styles.searchInput}
                    placeholder="Search…"
                    value={search.searchQuery}
                    onChange={(e) => search.setSearchQuery(e.target.value)}
                    onMouseDown={(e) => e.stopPropagation()}
                    aria-label="Filter options"
                  />
                </div>
              )}
              <BaseSelect.List className={styles.list}>
                {grouped.map((group, gi) => (
                  <React.Fragment key={group.section?.id ?? `g-${gi}`}>
                    {group.section?.label ? (
                      <div className={styles.sectionLabel}>{group.section.label}</div>
                    ) : gi > 0 ? (
                      <div className={styles.sectionDivider} />
                    ) : null}
                    {group.options.map((option, optionIndex) => {
                      const isHidden = hiddenValues?.has(String(option.value)) ?? false;
                      const isSelected = state.isMulti
                        ? (values ?? []).includes(option.value)
                        : value === option.value;
                      const isLastInGroup = optionIndex === group.options.length - 1;
                      return (
                        <BaseSelect.Item
                          key={String(option.value)}
                          value={option.value}
                          disabled={option.disabled}
                          className={clsx(
                            styles.item,
                            isInputFillMenu && styles.itemFigmaList,
                            isInputFillMenu && !isLastInGroup && styles.itemFigmaDivider,
                            isHidden && styles.itemHidden,
                          )}
                        >
                          {state.isMulti ? (
                            <span className={styles.itemCheckbox} aria-hidden="true">
                              <Checkbox
                                checked={isSelected}
                                appearance={state.appearance}
                                size="m"
                              />
                            </span>
                          ) : null}
                          <span className={styles.itemContent}>
                            {option.icon ? (
                              <span className={styles.optionIcon} aria-hidden="true">
                                {option.icon as React.ReactNode}
                              </span>
                            ) : null}
                            {option.color ? (
                              <span
                                className={styles.colorSwatch}
                                style={{ backgroundColor: option.color }}
                                aria-hidden="true"
                              />
                            ) : null}
                            <span className={styles.itemTextBlock}>
                              <BaseSelect.ItemText className={styles.itemText}>
                                {option.label}
                              </BaseSelect.ItemText>
                              {state.showSecondaryText && option.secondaryText ? (
                                <span className={styles.itemSecondary}>
                                  {option.secondaryText}
                                </span>
                              ) : null}
                            </span>
                          </span>
                          {!state.isMulti ? (
                            <BaseSelect.ItemIndicator className={styles.itemIndicator}>
                              <SelectCheckIcon />
                            </BaseSelect.ItemIndicator>
                          ) : null}
                          {option.badge ? (
                            <span className={styles.itemBadge}>{option.badge}</span>
                          ) : null}
                        </BaseSelect.Item>
                      );
                    })}
                  </React.Fragment>
                ))}
                {searchable && visibleCount === 0 ? (
                  <div className={styles.noResults}>No matches</div>
                ) : null}
              </BaseSelect.List>
            </BaseSelect.Popup>
          </BaseSelect.Positioner>
        </BrandScopePortal>
      </BaseSelect.Portal>
    </BaseSelect.Root>
  );
}

// ── Actions menu ──────────────────────────────────────────────────────────────

function SelectActionsMenu<T extends string | number = string>(props: SelectProps<T>) {
  const {
    options,
    sections,
    onAction,
    placeholder = 'Button',
    disabled = false,
    className,
    searchable: searchableProp,
    showSearch,
    onOpenChange,
    open: openProp,
  } = props;

  const state = useSelectState(props);
  const searchable = searchableProp ?? showSearch ?? false;
  const { open, handleOpenChange: notifyOpenChange, forceClose } = useSelectOpen(
    openProp,
    onOpenChange,
  );
  const search = useSearchState(searchable, open);
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  const filteredOptions = React.useMemo(
    () => filterOptions(options, search.searchQuery),
    [options, search.searchQuery],
  );
  const grouped = React.useMemo(
    () => groupSelectOptions(filteredOptions, sections),
    [filteredOptions, sections],
  );

  const { text: displayText } = selectTriggerText(
    options,
    state,
    placeholder,
    props.triggerLabel ?? placeholder,
  );
  const a11y = getSelectAccessibilityProps(props, state, open);

  const handleOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      notifyOpenChange(nextOpen);
      if (!nextOpen) search.setSearchQuery('');
    },
    [notifyOpenChange, search],
  );

  React.useEffect(() => {
    if (searchable && open) {
      requestAnimationFrame(() => searchInputRef.current?.focus());
    }
  }, [open, searchable, search.searchQuery]);

  const popupClassName = clsx(styles.popup, styles[`menuSize-${state.menuSize}`]);

  const positionerClassName = clsx(
    styles.positioner,
    state.menuSize === 'fill' && styles.positionerFill,
  );

  return (
    <BaseMenu.Root disabled={disabled} open={open} onOpenChange={handleOpenChange}>
      <BaseMenu.Trigger
        render={(triggerProps) => {
          if (state.trigger === 'iconButton') {
            return (
              <IconButton
                {...(triggerProps as Partial<IconButtonProps>)}
                icon={props.triggerIcon ?? FIGMA_HEART_ICON}
                attention={resolveDefaultAttention(props)}
                appearance={state.appearance}
                size={selectSizeToButtonSize(state.size)}
                condensed={props.condensed}
                contained={props.contained ?? true}
                disabled={state.isDisabled}
                className={clsx(styles.iconButtonTrigger, className)}
                aria-label={a11y['aria-label'] ?? props.label ?? 'Select'}
              />
            );
          }
          return (
            <Button
              // Base UI trigger props are generic HTML button attrs; Button's
              // interface doesn't extend those, so bridge the render-prop spread.
              {...(triggerProps as Partial<ButtonProps>)}
              attention={resolveDefaultAttention(props)}
              appearance={state.appearance}
              size={selectSizeToButtonSize(state.size)}
              condensed={props.condensed}
              contained={props.contained ?? true}
              end={
                props.chevron !== false ? <SelectChevronIcon open={open} /> : undefined
              }
              start={props.start}
              disabled={state.isDisabled}
              className={clsx(styles.buttonTrigger, className)}
            >
              {displayText}
            </Button>
          );
        }}
      />
      <BaseMenu.Portal>
        <BrandScopePortal>
          <BaseMenu.Positioner
            className={positionerClassName}
            side={menuSideFromDirection(state.menuDirection)}
            align={menuAlignFromAlignment(state.menuAlignment)}
            sideOffset={4}
          >
            <BaseMenu.Popup className={popupClassName}>
              {searchable && (
                <div
                  className={styles.searchContainer}
                  onKeyDown={search.handleSearchKeyDown}
                  onKeyUp={search.handleSearchKeyUp}
                >
                  <input
                    ref={searchInputRef}
                    type="search"
                    className={styles.searchInput}
                    placeholder="Search…"
                    value={search.searchQuery}
                    onChange={(e) => search.setSearchQuery(e.target.value)}
                    onMouseDown={(e) => e.stopPropagation()}
                    aria-label="Filter options"
                  />
                </div>
              )}
              <div className={styles.list}>
                {grouped.map((group, gi) => (
                  <React.Fragment key={group.section?.id ?? `ag-${gi}`}>
                    {group.section?.label ? (
                      <div className={styles.sectionLabel}>{group.section.label}</div>
                    ) : gi > 0 ? (
                      <div className={styles.sectionDivider} />
                    ) : null}
                    {group.options.map((option) => (
                      <BaseMenu.Item
                        key={String(option.value)}
                        className={styles.item}
                        disabled={option.disabled}
                        onClick={() => {
                          if (!option.disabled) {
                            onAction?.(option.value);
                            forceClose();
                          }
                        }}
                      >
                        <span className={styles.itemContent}>
                          <span className={styles.itemTextBlock}>
                            <span className={styles.itemText}>{option.label}</span>
                            {state.showSecondaryText && option.secondaryText ? (
                              <span className={styles.itemSecondary}>
                                {option.secondaryText}
                              </span>
                            ) : null}
                          </span>
                        </span>
                      </BaseMenu.Item>
                    ))}
                  </React.Fragment>
                ))}
              </div>
            </BaseMenu.Popup>
          </BaseMenu.Positioner>
        </BrandScopePortal>
      </BaseMenu.Portal>
    </BaseMenu.Root>
  );
}

// ── Public export ─────────────────────────────────────────────────────────────

export function Select<T extends string | number = string>(props: SelectProps<T>) {
  const state = useSelectState(props);
  if (state.isActions) {
    return <SelectActionsMenu {...props} />;
  }
  return <SelectListbox {...props} />;
}

/** Standalone SelectableInput trigger presentation (Storybook / docs / Figma grid). */
export function SelectSelectableInput(props: SelectSelectableInputProps) {
  const size = props.size ?? 'm';
  const inputSize = size === 's' ? 8 : size === 'l' ? 12 : 10;
  const attention = props.attention ?? (props.filled ? 'high' : 'medium');
  const label =
    props.label === true ? 'Label' : typeof props.label === 'string' ? props.label : undefined;
  const description =
    props.description === true
      ? 'Description'
      : typeof props.description === 'string'
        ? props.description
        : undefined;
  const helperText =
    props.helperText === true
      ? 'Helper text'
      : typeof props.helperText === 'string'
        ? props.helperText
        : undefined;
  const feedback =
    props.feedback === true
      ? 'Feedback message'
      : typeof props.feedback === 'string'
        ? props.feedback
        : undefined;

  return (
    <InputField
      label={label}
      description={description}
      required={props.required}
      infoIcon={props.infoIcon}
      size={inputSize}
      appearance={selectAppearanceToInputAppearance(props.appearance)}
      shape={props.shape ?? 'default'}
      attention={attention}
      start={resolveSelectStartSlot(props.start, size)}
      end={<SelectChevronIcon open={props.state === 'active'} />}
      placeholder={FIGMA_SELECT_PLACEHOLDER}
      readOnly
      invalid={props.feedback === true}
      feedback={feedback}
      dynamicText={helperText}
      fullWidth
      className={styles.inputFieldInTrigger}
    />
  );
}

export function SelectSelectableButton(props: SelectSelectableButtonProps) {
  const mockState = useSelectState({
    options: [],
    trigger: 'selectableButton',
    size: props.size ?? 'm',
    attention: props.attention ?? 'medium',
    condensed: props.condensed,
    contained: props.contained,
    chevron: props.chevron,
  });
  const a11y = getSelectAccessibilityProps({}, mockState, props.state === 'active');
  return (
    <SelectButtonTrigger
      props={{
        options: [],
        attention: props.attention ?? 'medium',
        condensed: props.condensed,
        contained: props.contained,
        chevron: props.chevron,
        triggerLabel: 'Button',
        start: props.start === 'icon' ? '♥' : undefined,
      }}
      state={mockState}
      isOpen={props.state === 'active'}
      displayText="Button"
      isPlaceholder={false}
      a11y={a11y}
    />
  );
}

export function SelectSelectableIconButton(props: SelectSelectableIconButtonProps) {
  const mockState = useSelectState({
    options: [],
    trigger: 'selectableIconButton',
    size: props.size ?? 'm',
    attention: props.attention ?? 'high',
    condensed: props.condensed,
    contained: props.contained,
  });
  const a11y = getSelectAccessibilityProps({ label: 'Favourites' }, mockState, props.state === 'active');
  return (
    <SelectIconButtonTrigger
      props={{
        options: [],
        attention: props.attention ?? 'high',
        condensed: props.condensed,
        contained: props.contained,
        triggerIcon: FIGMA_HEART_ICON,
      }}
      state={mockState}
      isOpen={props.state === 'active'}
      displayText=""
      isPlaceholder={false}
      a11y={a11y}
    />
  );
}

export function SelectMenuPanel(props: SelectMenuProps) {
  const options: SelectOption[] = FIGMA_SELECT_SINGLE_OPTIONS.map((o) => ({
    ...o,
    secondaryText: props.secondaryText ? FIGMA_SELECT_OPTION_SECONDARY : undefined,
  }));
  const sections = props.groups ? FIGMA_SELECT_MULTI_SECTIONS : undefined;
  if (sections) {
    options.forEach((o) => {
      o.group = 'main';
    });
  }
  const isFill = props.menuSize === 'fill';
  return (
    <div
      className={clsx(
        styles.popup,
        isFill && styles.popupInputFill,
        styles.menuPanelStatic,
        styles[`menuSize-${props.menuSize ?? 'm'}`],
      )}
      data-menu-type={props.menuType ?? 'singleSelect'}
    >
      {props.showSearch ? (
        <div className={styles.searchContainer}>
          <input type="search" className={styles.searchInput} placeholder="Search…" readOnly />
        </div>
      ) : null}
      <div className={styles.list}>
        {sections?.map((section) => (
          <div key={section.id} className={styles.group}>
            <div className={styles.sectionLabel}>{section.label}</div>
            {options.map((option, i) => (
              <div
                key={option.value}
                className={clsx(
                  styles.item,
                  isFill && styles.itemFigmaList,
                  isFill && i < options.length - 1 && styles.itemFigmaDivider,
                )}
                data-selected={i === 2 || undefined}
              >
                {props.menuType === 'multiSelect' ? (
                  <span className={styles.itemCheckbox}>
                    <Checkbox checked={i === 0} size="m" />
                  </span>
                ) : null}
                <span className={styles.itemContent}>
                  <span className={styles.itemTextBlock}>
                    <span className={styles.itemText}>{option.label}</span>
                    {option.secondaryText ? (
                      <span className={styles.itemSecondary}>{option.secondaryText}</span>
                    ) : null}
                  </span>
                </span>
                {props.menuType === 'singleSelect' && i === 2 ? (
                  <span className={styles.itemIndicator}>
                    <SelectCheckIcon />
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        )) ?? (
          options.map((option, i) => (
            <div
              key={option.value}
              className={clsx(
                styles.item,
                isFill && styles.itemFigmaList,
                isFill && i < options.length - 1 && styles.itemFigmaDivider,
              )}
            >
              <span className={styles.itemText}>{option.label}</span>
              {props.menuType === 'singleSelect' && i === 2 ? (
                <span className={styles.itemIndicator}>
                  <SelectCheckIcon />
                </span>
              ) : null}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

Select.SelectableInput = SelectSelectableInput;
Select.SelectableButton = SelectSelectableButton;
Select.SelectableIconButton = SelectSelectableIconButton;
Select.Menu = SelectMenuPanel;

export default Select;
