import type { ComponentMeta } from '@oneui/shared';
import type { CSSProperties, ReactNode } from 'react';
import { SegmentedControl } from '@oneui/ui/components/SegmentedControl';
import { AgentPulse } from '@oneui/ui/components/AgentPulse';
import { Avatar } from '@oneui/ui/components/Avatar';
import { BottomNavigation, BottomNavItem } from '@oneui/ui/components/BottomNavigation';
import { Chip } from '@oneui/ui/components/Chip';
import { ChipGroup } from '@oneui/ui/components/ChipGroup';
import { Divider } from '@oneui/ui/components/Divider';
import { Icon } from '@oneui/ui/components/Icon';
import { Slider } from '@oneui/ui/components/Slider';
import { Spinner } from '@oneui/ui/components/Spinner';
import { RadioField } from '@oneui/ui/components/RadioField';
import { TouchSlider } from '@oneui/ui/components/TouchSlider';
import { InputDynamicText, InputField } from '@oneui/ui/components/Input';
import { Stepper } from '@oneui/ui/components/Stepper';
import { TabGroup, TabItem } from '@oneui/ui/components/Tabs';
import { applyMetaDefaultProps } from './scenarioProps';

const CATALOG_THUMB_FRAME: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  maxWidth: '100%',
  boxSizing: 'border-box',
};

const CATALOG_THUMB_WIDE: CSSProperties = {
  ...CATALOG_THUMB_FRAME,
  width: 'min(100%, var(--Spacing-32))',
  paddingInline: 'var(--Spacing-3)',
};

/**
 * Components without a registry `previewComponent` (or that need composed children)
 * render here for catalog card thumbnails.
 */
export function renderCatalogCompositePreview(
  meta: ComponentMeta,
  props: Record<string, unknown>,
): ReactNode | null {
  const clean = applyMetaDefaultProps(meta, props);

  switch (meta.slug) {
    case 'segmented-control':
      return (
        <div style={CATALOG_THUMB_FRAME}>
          <SegmentedControl
            defaultValue="opt1"
            size={(clean.size as 's' | 'm' | 'l' | undefined) ?? 'm'}
            attention={(clean.attention as 'high' | 'medium' | 'low' | undefined) ?? 'high'}
            appearance={
              (clean.appearance as
                | 'primary'
                | 'secondary'
                | 'neutral'
                | 'auto'
                | undefined) ?? 'primary'
            }
            shape={(clean.shape as 'pill' | 'rectangular' | undefined) ?? 'pill'}
            type={(clean.type as 'text' | 'icon' | undefined) ?? 'text'}
            trackEmphasis={
              (clean.trackEmphasis as 'high' | 'medium' | 'low' | undefined) ?? 'medium'
            }
            equalWidth={clean.equalWidth === true}
            disabled={Boolean(clean.disabled)}
            aria-label="Segmented control preview"
          >
            <SegmentedControl.Item value="opt1">Option 1</SegmentedControl.Item>
            <SegmentedControl.Item value="opt2">Option 2</SegmentedControl.Item>
            <SegmentedControl.Item value="opt3">Option 3</SegmentedControl.Item>
          </SegmentedControl>
        </div>
      );
    case 'bottom-navigation': {
      const labelType = (clean.labelType as 'none' | '1line' | '2line' | undefined) ?? '1line';
      return (
        <div style={{ ...CATALOG_THUMB_FRAME, width: 'min(100%, var(--Spacing-40))' }}>
          <BottomNavigation
            aria-label="Preview navigation"
            defaultValue="home"
            labelType={labelType}
            showDivider
            style={{ width: '100%' }}
          >
            <BottomNavItem value="home" icon="home" label="Home" />
            <BottomNavItem value="browse" icon="heart" label="Browse" />
            <BottomNavItem value="search" icon="search" label="Search" />
          </BottomNavigation>
        </div>
      );
    }
    case 'chip-group':
      return (
        <div style={CATALOG_THUMB_FRAME}>
          <ChipGroup
            defaultValue="one"
            size={(clean.size as 's' | 'm' | 'l' | undefined) ?? 'm'}
            variant={(clean.variant as 'bold' | 'subtle' | 'ghost' | undefined) ?? 'ghost'}
            appearance={
              (clean.appearance as
                | 'primary'
                | 'secondary'
                | 'neutral'
                | 'auto'
                | undefined) ?? 'secondary'
            }
          >
            <Chip value="one">One</Chip>
            <Chip value="two">Two</Chip>
            <Chip value="three">Three</Chip>
          </ChipGroup>
        </div>
      );
    case 'spinner':
      return (
        <div style={CATALOG_THUMB_FRAME}>
          <Spinner
            size={(clean.size as 'S' | 'M' | 'L' | 'XS' | undefined) ?? 'M'}
            label={typeof clean.label === 'string' ? clean.label : 'Loading'}
          />
        </div>
      );
    case 'agent-pulse':
      return (
        <div style={CATALOG_THUMB_FRAME}>
          <AgentPulse
            state={(clean.state as 'idle' | 'listening' | 'thinking' | 'speaking' | undefined) ?? 'idle'}
            size={(clean.size as 'sm' | 'md' | 'lg' | undefined) ?? 'md'}
            appearance={
              (clean.appearance as 'primary' | 'secondary' | 'auto' | undefined) ?? 'primary'
            }
            aria-label={
              typeof clean['aria-label'] === 'string' ? clean['aria-label'] : 'Agent status'
            }
          />
        </div>
      );
    case 'tabs':
      return (
        <div style={CATALOG_THUMB_FRAME}>
          <TabGroup
            defaultValue="home"
            size={(clean.size as 's' | 'm' | 'l' | undefined) ?? 'm'}
            appearance={
              (clean.appearance as 'primary' | 'secondary' | 'neutral' | 'auto' | undefined) ??
              'primary'
            }
          >
            <TabItem value="home">Home</TabItem>
            <TabItem value="browse">Browse</TabItem>
          </TabGroup>
        </div>
      );
    case 'avatar':
      return (
        <div style={CATALOG_THUMB_FRAME}>
          <Avatar
            content="icon"
            size="m"
            attention="high"
            appearance="primary"
            alt="User"
            icon={<Icon icon="user" size="8" emphasis="high" aria-hidden />}
          />
        </div>
      );
    case 'divider':
      return (
        <div style={CATALOG_THUMB_WIDE}>
          <Divider
            orientation="horizontal"
            size={(clean.size as 's' | 'm' | 'l' | undefined) ?? 'm'}
            attention={
              (clean.attention as 'high' | 'medium' | 'low' | undefined) ?? 'medium'
            }
            appearance={
              (clean.appearance as 'primary' | 'secondary' | 'neutral' | 'auto' | undefined) ??
              'neutral'
            }
            style={{ width: '100%' }}
          />
        </div>
      );
    case 'slider':
      return (
        <div style={CATALOG_THUMB_WIDE}>
          <Slider
            defaultValue={(clean.defaultValue as number | undefined) ?? 50}
            min={(clean.min as number | undefined) ?? 0}
            max={(clean.max as number | undefined) ?? 100}
            step={(clean.step as number | undefined) ?? 1}
            showTooltip="false"
            appearance={
              (clean.appearance as 'primary' | 'secondary' | 'auto' | undefined) ?? 'primary'
            }
            knobStyle={(clean.knobStyle as 'outside' | 'inside' | undefined) ?? 'outside'}
            orientation="horizontal"
            style={{ width: '100%' }}
          />
        </div>
      );
    case 'touch-slider':
      return (
        <div style={CATALOG_THUMB_WIDE}>
          <TouchSlider
            defaultValue={(clean.defaultValue as number | undefined) ?? 40}
            min={(clean.min as number | undefined) ?? 0}
            max={(clean.max as number | undefined) ?? 100}
            step={(clean.step as number | undefined) ?? 1}
            progressStyle={
              (clean.progressStyle as 'rounded' | 'sharp' | undefined) ?? 'rounded'
            }
            appearance={
              (clean.appearance as 'primary' | 'secondary' | 'auto' | undefined) ?? 'primary'
            }
            orientation="horizontal"
            style={{ width: '100%' }}
          />
        </div>
      );
    case 'stepper':
      return (
        <div style={CATALOG_THUMB_FRAME}>
          <Stepper
            defaultValue={5}
            min={0}
            max={9}
            size={(clean.size as 's' | 'm' | 'l' | undefined) ?? 'm'}
            attention={(clean.attention as 'high' | 'medium' | 'low' | undefined) ?? 'medium'}
            appearance={
              (clean.appearance as 'primary' | 'secondary' | 'auto' | undefined) ?? 'primary'
            }
            aria-label="Preview stepper"
          />
        </div>
      );
    case 'input-field':
      return (
        <div style={CATALOG_THUMB_WIDE}>
          <InputField
            placeholder="Placeholder"
            size={(clean.size as 8 | 10 | 12 | undefined) ?? 10}
            attention={(clean.attention as 'high' | 'medium' | 'low' | undefined) ?? 'medium'}
            appearance={
              (clean.appearance as 'primary' | 'secondary' | 'auto' | undefined) ?? 'primary'
            }
            aria-label="Preview input"
          />
        </div>
      );
    case 'input-dynamic-text':
      return (
        <div style={CATALOG_THUMB_WIDE}>
          <InputDynamicText
            content="12 / 30"
            size={(clean.size as 's' | 'm' | 'l' | undefined) ?? 'm'}
            data-testid="catalog-thumb-input-dynamic-text"
          />
        </div>
      );
    case 'radio-field':
      return (
        <div
          style={{
            ...CATALOG_THUMB_FRAME,
            width: 'min(100%, var(--Spacing-32))',
            paddingInline: 'var(--Spacing-2)',
          }}
        >
          <RadioField
            name={
              typeof clean.name === 'string' ? clean.name : 'qa-catalog-radio-field'
            }
            label={typeof clean.label === 'string' ? clean.label : 'Default Radio'}
            appearance={
              (clean.appearance as 'primary' | 'secondary' | 'auto' | undefined) ??
              'primary'
            }
            size={(clean.size as 's' | 'm' | 'l' | undefined) ?? 'm'}
          />
        </div>
      );
    default:
      return null;
  }
}
