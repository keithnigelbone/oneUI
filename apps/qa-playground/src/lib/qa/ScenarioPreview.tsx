'use client';

import type { ComponentMeta } from '@oneui/shared';
import type { ComponentType, CSSProperties, ReactNode } from 'react';
import type { PaginationProps } from '@oneui/ui/components/Pagination';
import { InputDynamicText, InputFeedback } from '@oneui/ui/components/Input';
import { Radio, RadioGroup } from '@oneui/ui/components/Radio';
import { RadioField } from '@oneui/ui/components/RadioField';
import { TabGroup, TabItem } from '@oneui/ui/components/Tabs';
import { COMPONENT_REGISTRY } from '@oneui/ui/registry/componentRegistry';
import { CatalogThumbFallback } from '@/components/catalog/CatalogThumbFallback';
import { sanitizePaginationProps } from '@/components/pagination/safePaginationProps';
import { renderCatalogCompositePreview } from './catalogThumbnailPreview';
import catalogStyles from '@/styles/catalog.module.css';
import { applyMetaDefaultProps } from './scenarioProps';
import { stripQaInternalProps } from './formatProps';

const INPUT_DYNAMIC_TEXT_PREVIEW_FRAME: CSSProperties = {
  width: 'min(100%, calc(var(--Spacing-40) + var(--Spacing-40) + var(--Spacing-4)))',
  maxWidth: '100%',
  flexShrink: 0,
  boxSizing: 'border-box',
};

function ensureRenderableChildren(meta: ComponentMeta, props: Record<string, unknown>): Record<string, unknown> {
  const next = { ...props };
  if (next.children !== undefined && next.children !== null) return next;
  const childProp = meta.props.find((p) => p.name === 'children');
  if (!childProp) return next;
  if (childProp.type === 'string' || childProp.type === 'ReactNode') {
    next.children =
      meta.slug === 'button'
        ? 'Button'
        : meta.slug === 'switch'
          ? 'Label'
          : meta.displayName.slice(0, 24);
  }
  return next;
}

/**
 * Tooltip requires a React element as `children` (the trigger) and a `content`
 * string (the bubble text).  Neither can be derived from the generic scalar path,
 * so we inject sensible defaults here when the scenario omits them.
 *
 * We use a plain <button> so there is no circular import back to the UI package.
 * `defaultOpen + trigger="manual"` keeps the tooltip open for visual inspection.
 */
function ensureTooltipChildren(meta: ComponentMeta, props: Record<string, unknown>): Record<string, unknown> {
  if (meta.slug !== 'tooltip') return props;
  const next = { ...props };
  if (next.children == null) {
    next.children = (
      <button
        type="button"
        style={{
          fontFamily: 'var(--Typography-Font-Primary)',
          fontSize: 'var(--Body-S-FontSize)',
          padding: '4px 12px',
          borderRadius: '999px',
          border: '1px solid var(--Border-Subtle, #e0e0e0)',
          background: 'var(--Surface-Default, #fff)',
          cursor: 'default',
        }}
      >
        Trigger
      </button>
    );
  }
  if (next.content == null) {
    next.content = 'Tooltip';
  }
  if (next.defaultOpen == null) {
    next.defaultOpen = true;
  }
  if (next.trigger == null) {
    next.trigger = 'manual';
  }
  return next;
}

function ensureSelectOptions(meta: ComponentMeta, props: Record<string, unknown>): Record<string, unknown> {
  if (meta.slug !== 'select') return props;
  const next = { ...props };
  if (!Array.isArray(next.options) || next.options.length === 0) {
    next.options = [
      { value: 'opt-1', label: 'Option 1' },
      { value: 'opt-2', label: 'Option 2' },
    ];
  }
  if (next.defaultValue == null && next.value == null) {
    next.defaultValue = 'opt-1';
  }
  return next;
}

export function ScenarioPreview({
  meta,
  props,
  thumbnailMode = false,
}: {
  meta: ComponentMeta;
  props: Record<string, unknown>;
  /** Catalog cards: prefer registry preview components and composite defaults. */
  thumbnailMode?: boolean;
}) {
  const stripped = stripQaInternalProps(props);
  const withTooltip = ensureTooltipChildren(meta, stripped);
  const withDefaults = applyMetaDefaultProps(meta, withTooltip);
  const withSelect = ensureSelectOptions(meta, withDefaults);
  const clean = ensureRenderableChildren(meta, withSelect);
  const entry = COMPONENT_REGISTRY[meta.name];
  const Cmp = entry?.component as ComponentType<Record<string, unknown>> | undefined;

  const wrapThumbnail = (node: ReactNode) => (
    <div className={catalogStyles.thumbStage}>{node}</div>
  );

  if (meta.slug === 'input-feedback') {
    return (
      <div style={INPUT_DYNAMIC_TEXT_PREVIEW_FRAME}>
        <InputFeedback {...clean} />
      </div>
    );
  }

  if (meta.slug === 'input-feedback') {
    return (
      <div style={INPUT_DYNAMIC_TEXT_PREVIEW_FRAME}>
        <InputFeedback {...clean} />
      </div>
    );
  }

  const renderRegisteredComponent = (RegisteredCmp: ComponentType<Record<string, unknown>>) => {
    if (meta.slug === 'radio') {
      const value = typeof clean.value === 'string' ? clean.value : 'preview-option';
      const selected = clean.checked === true;
      return (
        <RadioGroup defaultValue={selected ? value : undefined} aria-label="Preview radio group">
          <Radio {...clean} value={value} />
        </RadioGroup>
      );
    }

    if (meta.slug === 'radio-field') {
      const { children: _children, ...fieldProps } = clean;
      return (
        <div
          style={{
            width: '100%',
            maxWidth: '100%',
            boxSizing: 'border-box',
          }}
        >
          <RadioField
            {...fieldProps}
            name={
              typeof fieldProps.name === 'string' ? fieldProps.name : 'qa-preview-radio-field'
            }
            label={typeof fieldProps.label === 'string' ? fieldProps.label : 'Default Radio'}
            appearance={
              (fieldProps.appearance as 'primary' | 'secondary' | 'auto' | undefined) ??
              'primary'
            }
            size={(fieldProps.size as 's' | 'm' | 'l' | undefined) ?? 'm'}
          />
        </div>
      );
    }

    if (meta.slug === 'pagination') {
      return <RegisteredCmp {...sanitizePaginationProps(clean as unknown as PaginationProps)} />;
    }

    return <RegisteredCmp {...clean} />;
  };

  /**
   * Catalog card uses `COMPONENT_REGISTRY.Tabs` (compound `Tabs.Root` only). Passing matrix props
   * without `Tabs.List` / `Tabs.Item` children breaks the home grid — render the flat `TabGroup` API instead.
   */
  if (meta.slug === 'tabs') {
    const size = (clean.size as 's' | 'm' | 'l' | undefined) ?? 'm';
    const orientation = (clean.orientation as 'horizontal' | 'vertical' | undefined) ?? 'horizontal';
    const tabsPreview = (
      <div
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          boxSizing: 'border-box',
        }}
      >
        <TabGroup defaultValue="one" size={size} orientation={orientation} appearance="primary">
          <TabItem value="one">Tab</TabItem>
          <TabItem value="two">Tab</TabItem>
        </TabGroup>
      </div>
    );
    return thumbnailMode ? wrapThumbnail(tabsPreview) : tabsPreview;
  }

  if (thumbnailMode) {
    const composite = renderCatalogCompositePreview(meta, clean);
    if (composite) {
      return wrapThumbnail(composite);
    }

    if (Cmp) {
      return wrapThumbnail(renderRegisteredComponent(Cmp));
    }

    return wrapThumbnail(<CatalogThumbFallback meta={meta} />);
  }

  if (meta.slug === 'input-dynamic-text') {
    return (
      <div style={INPUT_DYNAMIC_TEXT_PREVIEW_FRAME}>
        <InputDynamicText {...clean} />
      </div>
    );
  }

  if (Cmp) {
    return renderRegisteredComponent(Cmp);
  }

  return (
    <p
      style={{
        fontFamily: 'var(--Typography-Font-Primary)',
        fontSize: 'var(--Body-S-FontSize)',
        lineHeight: 'var(--Body-S-LineHeight)',
        fontWeight: 'var(--Body-FontWeight-Low)',
        color: 'var(--Text-Medium)',
        margin: 0,
        textAlign: 'center',
      }}
    >
      No canvas component in COMPONENT_REGISTRY for{' '}
      <strong>{meta.displayName}</strong> — check registry or props below.
    </p>
  );
}
