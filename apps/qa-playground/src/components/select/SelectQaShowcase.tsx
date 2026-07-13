'use client';

import type { CSSProperties } from 'react';
import { useState } from 'react';
import { Select, type SelectOption, FIGMA_SELECT_INPUT_WIDTH } from '@oneui/ui/components/Select';
import type { SelectAppearance, SelectSize, SelectTriggerFigma } from '@oneui/ui/components/Select';
import { Surface } from '@oneui/ui/components/Surface';
import { QaApiSectionBody, QaShowcaseRoot, QaStoryBand } from '../shared/QaShowcaseLayout';
import styles from '../../styles/qa.module.css';

const rowLabel: CSSProperties = {
  minWidth: 'var(--Spacing-24)',
  fontFamily: 'var(--Typography-Font-Primary)',
  fontSize: 'var(--Body-S-FontSize)',
  lineHeight: 'var(--Body-S-LineHeight)',
  fontWeight: 'var(--Body-FontWeight-Medium)',
  color: 'var(--Text-Medium)',
};

const OPTIONS: SelectOption[] = [
  { value: '1', label: 'Option title', secondaryText: 'Short description of this option' },
  { value: '2', label: 'Option title', secondaryText: 'Short description of this option' },
  { value: '3', label: 'Option title', secondaryText: 'Short description of this option' },
];

const SECTIONS = [{ id: 'main', label: 'Section label' }];
const GROUPED = OPTIONS.map((o) => ({ ...o, group: 'main' }));

const TRIGGERS: SelectTriggerFigma[] = ['selectableInput', 'selectableButton', 'selectableIconButton'];
const SIZES: SelectSize[] = ['s', 'm', 'l'];
const APPEARANCES: SelectAppearance[] = [
  'primary',
  'secondary',
  'neutral',
  'sparkle',
  'positive',
  'negative',
  'warning',
  'informative',
];

const fieldWidth: CSSProperties = {
  width: FIGMA_SELECT_INPUT_WIDTH,
  maxWidth: '100%',
};

export function SelectQaShowcase() {
  const [single, setSingle] = useState('1');
  const [multi, setMulti] = useState<string[]>(['1']);

  return (
    <QaShowcaseRoot title="Select" slug="select">
      <QaStoryBand id="select-qa-default" title="Default" centerContent>
        <QaApiSectionBody>
          <div style={fieldWidth} data-testid="select-qa-default">
            <Select
              trigger="selectableInput"
              label="Label"
              options={OPTIONS}
              value={single}
              onValueChange={setSingle}
              placeholder="Choose an option"
            />
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="select-qa-trigger" title="1 trigger" overflow>
        <QaApiSectionBody>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--Spacing-4)' }}>
            {TRIGGERS.map((trigger) => (
              <div key={trigger} style={trigger === 'selectableInput' ? fieldWidth : undefined} data-testid={`select-qa-trigger-${trigger}`}>
                <p style={rowLabel}>{trigger}</p>
                <Select
                  trigger={trigger}
                  label={trigger === 'selectableInput' ? 'Label' : undefined}
                  triggerLabel={trigger === 'selectableButton' ? 'Button' : undefined}
                  options={OPTIONS}
                  value={single}
                  onValueChange={setSingle}
                  contained
                  chevron
                  aria-label={trigger === 'selectableInput' ? undefined : trigger}
                />
              </div>
            ))}
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="select-qa-menu" title="2 menuType" overflow>
        <QaApiSectionBody>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-5)' }}>
            <div style={fieldWidth} data-testid="select-qa-menu-single">
              <Select
                menuType="singleSelect"
                options={OPTIONS}
                value={single}
                onValueChange={setSingle}
                aria-label="Single select"
              />
            </div>
            <div style={fieldWidth} data-testid="select-qa-menu-multi">
              <Select
                menuType="multiSelect"
                secondaryText
                groups
                sections={SECTIONS}
                options={GROUPED}
                values={multi}
                onValuesChange={setMulti}
                showSearch
                aria-label="Multi select"
              />
            </div>
            <div data-testid="select-qa-menu-actions">
            <Select
              menuType="actions"
              trigger="selectableButton"
              triggerLabel="Actions"
              options={[
                { value: '1', label: 'Action' },
                { value: '2', label: 'Action' },
                { value: '3', label: 'Action' },
              ]}
              onAction={() => {}}
              aria-label="Actions menu"
            />
            </div>
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="select-qa-size" title="3 size (input trigger)" overflow>
        <QaApiSectionBody>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4)' }}>
            {SIZES.map((size) => (
              <div key={size} style={fieldWidth}>
                <p style={rowLabel}>{`size: ${size}`}</p>
                <Select.SelectableInput size={size} label />
              </div>
            ))}
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="select-qa-input-start" title="4 inputStart" overflow>
        <QaApiSectionBody>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4)' }}>
            {(['none', 'icon', 'avatar', 'image', 'text'] as const).map((start) => (
              <div key={start} style={fieldWidth}>
                <p style={rowLabel}>{`start: ${start}`}</p>
                <Select.SelectableInput label start={start} />
              </div>
            ))}
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="select-qa-appearance" title="5 appearance" overflow>
        <QaApiSectionBody>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4)' }}>
            {APPEARANCES.map((appearance) => (
              <div key={appearance} style={fieldWidth} data-testid={`select-qa-appearance-${appearance}`}>
                <p style={rowLabel}>{appearance}</p>
                <Select
                  trigger="selectableInput"
                  label="Label"
                  appearance={appearance}
                  options={OPTIONS}
                  value={single}
                  onValueChange={setSingle}
                />
              </div>
            ))}
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="select-qa-field-stack" title="6 label / description / feedback / helper" overflow>
        <QaApiSectionBody>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-5)', ...fieldWidth }}>
            <Select.SelectableInput label required description infoIcon helperText />
            <Select.SelectableInput label feedback state="feedback" />
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="select-qa-menu-panels" title="7 Menu panels (static)" overflow>
        <QaApiSectionBody>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--Spacing-5)' }}>
            <Select.Menu menuType="singleSelect" />
            <Select.Menu menuType="multiSelect" groups secondaryText showSearch />
            <Select.Menu menuType="actions" />
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="select-qa-surface" title="8 Surface context" overflow>
        <p className={styles.storySectionLead}>
          Secondary appearance on a secondary-tinted <code>subtle</code> surface.
        </p>
        <QaApiSectionBody>
          <Surface
            mode="subtle"
            appearance="secondary"
            style={{
              padding: 'var(--Spacing-4)',
              width: '100%',
              maxWidth: 'var(--Spacing-48)',
              boxSizing: 'border-box',
            }}
            data-testid="select-qa-surface"
          >
            <Select
              trigger="selectableInput"
              label="Surface select"
              appearance="secondary"
              options={OPTIONS}
              value={single}
              onValueChange={setSingle}
            />
          </Surface>
        </QaApiSectionBody>
      </QaStoryBand>
    </QaShowcaseRoot>
  );
}
