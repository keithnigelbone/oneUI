/**
 * Accordion.tsx
 * React (web) implementation using Base UI Accordion
 *
 * Key features:
 * - Uses @base-ui/react Accordion primitive (never fork)
 * - Token-only styling in CSS Module
 * - WCAG AA accessible with keyboard navigation
 * - Supports single and multiple open items
 * - Animated expand/collapse
 */

import React, { ReactNode } from 'react';
import { Accordion as BaseAccordion } from '@base-ui/react/accordion';
import styles from './Accordion.module.css';
import {
  AccordionProps,
  AccordionItemProps,
  AccordionTriggerProps,
  AccordionPanelProps,
} from './Accordion.shared';

export const Accordion: React.FC<AccordionProps> & {
  Item: typeof AccordionItem;
  Trigger: typeof AccordionTrigger;
  Panel: typeof AccordionPanel;
} = ({
  children,
  value,
  defaultValue,
  onValueChange,
  openMultiple = false,
  disabled,
  className,
  style,
}) => {
  const rootClassName = [styles.root, className].filter(Boolean).join(' ');

  return (
    <BaseAccordion.Root
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange ? (value) => onValueChange(value as string[]) : undefined}
      multiple={openMultiple}
      disabled={disabled}
      className={rootClassName}
      style={style}
    >
      {children}
    </BaseAccordion.Root>
  );
};

const AccordionItem: React.FC<AccordionItemProps> = ({
  children,
  value,
  disabled,
  className,
}) => {
  const itemClassName = [styles.item, className].filter(Boolean).join(' ');

  return (
    <BaseAccordion.Item value={value} disabled={disabled} className={itemClassName}>
      {children}
    </BaseAccordion.Item>
  );
};

const AccordionTrigger: React.FC<AccordionTriggerProps> = ({ children, className }) => {
  const triggerClassName = [styles.trigger, className].filter(Boolean).join(' ');

  return (
    <BaseAccordion.Header className={styles.header}>
      <BaseAccordion.Trigger className={triggerClassName}>
        {children}
        <PlusIcon className={styles.triggerIcon} />
      </BaseAccordion.Trigger>
    </BaseAccordion.Header>
  );
};

const AccordionPanel: React.FC<AccordionPanelProps> = ({ children, className }) => {
  const panelClassName = [styles.panel, className].filter(Boolean).join(' ');

  return (
    <BaseAccordion.Panel className={panelClassName}>
      <div className={styles.panelContent}>{children}</div>
    </BaseAccordion.Panel>
  );
};

function PlusIcon(props: React.ComponentProps<'svg'>) {
  return (
    <svg viewBox="0 0 12 12" fill="currentcolor" {...props}>
      <path d="M6.75 0H5.25V5.25H0V6.75L5.25 6.75V12H6.75V6.75L12 6.75V5.25H6.75V0Z" />
    </svg>
  );
}

Accordion.Item = AccordionItem;
Accordion.Trigger = AccordionTrigger;
Accordion.Panel = AccordionPanel;
