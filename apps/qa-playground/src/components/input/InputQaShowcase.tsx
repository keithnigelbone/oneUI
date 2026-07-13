'use client';

import { useState, type CSSProperties, type ReactNode } from 'react';
import { Input } from '@oneui/ui/components/Input';
import { InputField } from '@oneui/ui/components/InputField';
import type { InputAppearance, InputAttention, InputProps, InputShape, InputSize } from '@oneui/ui/components/Input';
import { Avatar } from '@oneui/ui/components/Avatar';
import { Button } from '@oneui/ui/components/Button';
import { Chip } from '@oneui/ui/components/Chip';
import { ChipGroup } from '@oneui/ui/components/ChipGroup';
import { Icon } from '@oneui/ui/components/Icon';
import { IconButton } from '@oneui/ui/components/IconButton';
import { Image } from '@oneui/ui/components/Image';
import { QaApiSectionBody, QaShowcaseRoot, QaStoryBand } from '../shared/QaShowcaseLayout';
import styles from '../../styles/qa.module.css';

const inputCellStyle: CSSProperties = {
  width: 'var(--Spacing-40)',
  maxWidth: '100%',
};

const fullWidthCellStyle: CSSProperties = {
  width: '100%',
  maxWidth: '100%',
};

const INPUT_TYPES: { type: string; testId: string; placeholder: string }[] = [
  { type: 'text', testId: 'input-type-text', placeholder: 'Text' },
  { type: 'email', testId: 'input-type-email', placeholder: 'you@example.com' },
  { type: 'password', testId: 'input-type-password', placeholder: 'Password' },
  { type: 'number', testId: 'input-type-number', placeholder: '0' },
  { type: 'tel', testId: 'input-type-tel', placeholder: '+1 000 000 0000' },
  { type: 'search', testId: 'input-type-search', placeholder: 'Search' },
];

const appearanceRowLabelStyle: CSSProperties = {
  minWidth: 'var(--Spacing-24)',
  flexShrink: 0,
  fontFamily: 'var(--Typography-Font-Primary)',
  fontSize: 'var(--Body-S-FontSize)',
  lineHeight: 'var(--Body-S-LineHeight)',
  fontWeight: 'var(--Body-FontWeight-Medium)',
  color: 'var(--Text-Medium)',
};

const slotTextStyle: CSSProperties = {
  fontFamily: 'var(--Typography-Font-Primary)',
  fontSize: 'var(--Body-S-FontSize)',
  lineHeight: 'var(--Body-S-LineHeight)',
  fontWeight: 'var(--Body-FontWeight-Medium)',
  color: 'var(--Text-Medium)',
};

const FIGMA_SIZES: { figma: string; size: InputSize }[] = [
  { figma: 'S', size: 's' },
  { figma: 'M', size: 'm' },
  { figma: 'L', size: 'l' },
];

const LEGACY_SIZES: { alias: string; size: InputSize }[] = [
  { alias: 'small', size: 'small' },
  { alias: 'medium', size: 'medium' },
  { alias: 'large', size: 'large' },
];

const FIGMA_APPEARANCES = [
  'auto',
  'neutral',
  'primary',
  'secondary',
  'sparkle',
  'negative',
  'positive',
  'warning',
  'informative',
] as const satisfies readonly InputAppearance[];

const FIGMA_ATTENTIONS: InputAttention[] = ['medium', 'high'];
const FIGMA_SHAPES: InputShape[] = ['default', 'pill'];

function SlotText({ children }: { children: ReactNode }) {
  return <span style={slotTextStyle}>{children}</span>;
}

function MaxLengthDemo() {
  const [value, setValue] = useState('');
  return (
    <div style={inputCellStyle}>
      <Input
        label="Max length"
        placeholder="Max 10 chars"
        value={value}
        onChange={(next) => setValue(next.slice(0, 10))}
        data-testid="input-maxlength"
      />
    </div>
  );
}

function PasswordWithToggle() {
  const [visible, setVisible] = useState(false);
  return (
    <div style={inputCellStyle}>
      <Input
        type={visible ? 'text' : 'password'}
        placeholder="Password"
        size="m"
        data-testid="input-type-password"
        end={
          <IconButton
            icon={visible ? 'visibility_off' : 'visibility'}
            aria-label={visible ? 'Hide password' : 'Show password'}
            attention="low"
            size="s"
            data-testid="input-password-toggle"
            onClick={() => setVisible((v) => !v)}
          />
        }
      />
    </div>
  );
}

type ComboRow = { caption: string; props: InputProps };

const COMBO_MATRIX: ComboRow[] = [
  { caption: 'M · medium attention · secondary', props: { size: 'm', attention: 'medium', placeholder: 'Label' } },
  { caption: 'M · high attention · primary', props: { size: 'm', attention: 'high', appearance: 'primary', placeholder: 'Label' } },
  { caption: 'S · pill · sparkle', props: { size: 's', shape: 'pill', appearance: 'sparkle', placeholder: 'Label' } },
  {
    caption: 'L · start + end slots',
    props: {
      size: 'l',
      start: <Icon icon="search" aria-hidden />,
      end: <Icon icon="close" aria-hidden />,
      placeholder: 'Search',
    },
  },
];

/**
 * Input QA playground — Figma Input API (`/c/input`). Composed field UX: `/c/input-field`.
 */
export function InputQaShowcase() {
  return (
    <QaShowcaseRoot layout="centered">
      <QaStoryBand id="input-qa-default" title="Default (idle)" centerContent>
        <div style={inputCellStyle}>
          <Input placeholder="Placeholder" size="m" data-testid="input-default" />
        </div>
      </QaStoryBand>

      <QaStoryBand id="input-qa-placeholder" title="Placeholder" centerContent>
        <div style={inputCellStyle}>
          <Input placeholder="Type here…" size="m" data-testid="input-placeholder" />
        </div>
      </QaStoryBand>

      <QaStoryBand id="input-qa-size" title="1 Size (S · M · L)" overflow>
        <p className={styles.storySectionLeadCompact}>
          Figma S/M/L → code <code>s</code> / <code>m</code> / <code>l</code>. Figma <strong>XS</strong> is not supported —{' '}
          <code>xs</code> / <code>6</code> coerce to <code>s</code> ⚠️.
        </p>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow}>
            {FIGMA_SIZES.map(({ figma, size }) => (
              <div key={figma} className={styles.scenarioLabeledCell}>
                <Input size={size} placeholder="Label" data-testid={`input-size-${figma}`} />
                <span className={styles.scenarioCellCaption}>{`size: ${figma}`}</span>
              </div>
            ))}
            <div className={styles.scenarioLabeledCell}>
              <Input size={6} placeholder="Label" data-testid="input-size-XS" />
              <span className={styles.scenarioCellCaption}>size: XS (coerces to S) ⚠️</span>
            </div>
          </div>
        </QaApiSectionBody>
        <p className={styles.storySectionLeadCompact}>
          Legacy aliases <code>small</code> / <code>medium</code> / <code>large</code> — not in Figma size table ⚠️.
        </p>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow}>
            {LEGACY_SIZES.map(({ alias, size }) => (
              <div key={alias} className={styles.scenarioLabeledCell}>
                <Input size={size} placeholder="Label" data-testid={`input-size-alias-${alias}`} />
                <span className={styles.scenarioCellCaption}>{`size: ${alias} ⚠️`}</span>
              </div>
            ))}
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="input-qa-attention" title="2 Attention (medium · high)" overflow>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow}>
            {FIGMA_ATTENTIONS.map((attention) => (
              <div key={attention} className={styles.scenarioLabeledCell}>
                <Input attention={attention} placeholder="Label" data-testid={`input-attention-${attention}`} />
                <span className={styles.scenarioCellCaption}>{`attention: ${attention}`}</span>
              </div>
            ))}
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="input-qa-appearance" title="3 Appearance (Figma + auto)" overflow>
        <QaApiSectionBody>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4)' }}>
            {FIGMA_APPEARANCES.map((appearance) => (
              <div
                key={appearance}
                style={{ display: 'flex', alignItems: 'center', gap: 'var(--Spacing-5)', flexWrap: 'wrap' }}
              >
                <span style={appearanceRowLabelStyle}>{appearance}</span>
                <div style={inputCellStyle}>
                  <Input appearance={appearance} placeholder="Label" data-testid={`input-appearance-${appearance}`} />
                </div>
              </div>
            ))}
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="input-qa-shape" title="4 Shape (default · pill)" overflow>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow}>
            {FIGMA_SHAPES.map((shape) => (
              <div key={shape} className={styles.scenarioLabeledCell}>
                <Input shape={shape} placeholder="Label" data-testid={`input-shape-${shape}`} />
                <span className={styles.scenarioCellCaption}>{`shape: ${shape}`}</span>
              </div>
            ))}
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="input-qa-states" title="5 State (idle · filled · readOnly · disabled · feedback)" overflow>
        <QaApiSectionBody>
          <div className={styles.scenarioStackWide}>
            <div className={styles.scenarioLabeledCellWide}>
              <div style={inputCellStyle}>
                <Input placeholder="Idle" data-testid="input-state-idle" />
              </div>
              <span className={styles.scenarioCellCaption}>state: idle</span>
            </div>
            <div className={styles.scenarioLabeledCellWide}>
              <div style={inputCellStyle}>
                <Input aria-label="Filled value" defaultValue="Filled value" data-testid="input-state-filled" />
              </div>
              <span className={styles.scenarioCellCaption}>state: filled</span>
            </div>
            <div className={styles.scenarioLabeledCellWide}>
              <div style={inputCellStyle}>
                <Input aria-label="Read only value" readOnly defaultValue="Read only value" data-testid="input-readonly" />
              </div>
              <span className={styles.scenarioCellCaption}>state: readOnly</span>
            </div>
            <div className={styles.scenarioLabeledCellWide}>
              <div style={inputCellStyle}>
                <Input disabled placeholder="Disabled" data-testid="input-disabled" />
              </div>
              <span className={styles.scenarioCellCaption}>disabled: true</span>
            </div>
            <div className={styles.scenarioLabeledCellWide}>
              <div style={inputCellStyle}>
                <Input errorHighlight placeholder="Feedback border" data-testid="input-error" />
              </div>
              <span className={styles.scenarioCellCaption}>
                state: feedback — <code>errorHighlight</code> → shell <code>data-invalid</code> only ⚠️
              </span>
            </div>
            <div className={styles.scenarioLabeledCellWide}>
              <div style={inputCellStyle}>
                <Input required placeholder="Required" data-testid="input-required" />
              </div>
              <span className={styles.scenarioCellCaption}>required (HTML)</span>
            </div>
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="input-qa-adornments" title="6 Start / end adornments (smoke)" overflow>
        <QaApiSectionBody>
          <div className={styles.scenarioStackWide}>
            <div className={styles.scenarioLabeledCellWide}>
              <div style={inputCellStyle}>
                <Input
                  start={<Icon icon="search" aria-hidden />}
                  placeholder="Search"
                  data-testid="input-start-adornment"
                />
              </div>
              <span className={styles.scenarioCellCaption}>start: Icon</span>
            </div>
            <div className={styles.scenarioLabeledCellWide}>
              <div style={inputCellStyle}>
                <Input end={<Icon icon="close" aria-hidden />} placeholder="Clearable" data-testid="input-end-adornment" />
              </div>
              <span className={styles.scenarioCellCaption}>end: Icon</span>
            </div>
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="input-qa-slots" title="7 Slots (Figma matrix)" overflow>
        <QaApiSectionBody>
          <div className={styles.scenarioStackWide}>
            <div className={styles.scenarioLabeledCellWide}>
              <div style={inputCellStyle}>
                <Input start={<Icon icon="search" aria-hidden />} placeholder="start: Icon" data-testid="input-slot-start-icon" />
              </div>
            </div>
            <div className={styles.scenarioLabeledCellWide}>
              <div style={inputCellStyle}>
                <Input
                  start={<IconButton icon="search" aria-label="Search" attention="low" size="s" />}
                  placeholder="start: IconButton"
                  data-testid="input-slot-start-iconbutton"
                />
              </div>
            </div>
            <div className={styles.scenarioLabeledCellWide}>
              <div style={inputCellStyle}>
                <Input
                  start={<Avatar content="text" alt="PK" size="s" />}
                  placeholder="start: Avatar"
                  data-testid="input-slot-start-avatar"
                />
              </div>
            </div>
            <div className={styles.scenarioLabeledCellWide}>
              <div style={inputCellStyle}>
                <Input
                  start={
                    <Image
                      src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24'%3E%3Crect fill='%23ccc' width='24' height='24'/%3E%3C/svg%3E"
                      alt="Sample thumbnail"
                      aspectRatio="1:1"
                      width={24}
                      height={24}
                    />
                  }
                  placeholder="start: Image"
                  data-testid="input-slot-start-image"
                />
              </div>
            </div>
            <div className={styles.scenarioLabeledCellWide}>
              <div style={inputCellStyle}>
                <Input
                  start={
                    <ChipGroup aria-label="Filter" size="s">
                      <Chip value="tag">Tag</Chip>
                    </ChipGroup>
                  }
                  placeholder="start: ChipGroup"
                  data-testid="input-slot-start-chipgroup"
                />
              </div>
            </div>
            <div className={styles.scenarioLabeledCellWide}>
              <div style={inputCellStyle}>
                <Input start={<SlotText>IN</SlotText>} placeholder="start: Text" data-testid="input-slot-start-text" />
              </div>
            </div>
            <div className={styles.scenarioLabeledCellWide}>
              <div style={inputCellStyle}>
                <Input start2={<SlotText>$</SlotText>} placeholder="0.00" data-testid="input-slot-start2-text" />
              </div>
            </div>
            <div className={styles.scenarioLabeledCellWide}>
              <div style={inputCellStyle}>
                <Input
                  end={<IconButton icon="close" aria-label="Clear" attention="low" size="s" />}
                  placeholder="end: IconButton"
                  data-testid="input-slot-end-iconbutton"
                />
              </div>
            </div>
            <div className={styles.scenarioLabeledCellWide}>
              <div style={inputCellStyle}>
                <Input end={<Icon icon="close" aria-hidden />} placeholder="end: Icon" data-testid="input-slot-end-icon" />
              </div>
            </div>
            <div className={styles.scenarioLabeledCellWide}>
              <div style={inputCellStyle}>
                <Input
                  end={
                    <Button attention="low" size="s" condensed>
                      Go
                    </Button>
                  }
                  placeholder="end: Button"
                  data-testid="input-slot-end-button"
                />
              </div>
            </div>
            <div className={styles.scenarioLabeledCellWide}>
              <div style={inputCellStyle}>
                <Input end={<SlotText>kg</SlotText>} placeholder="Weight" data-testid="input-slot-end-text" />
              </div>
            </div>
            <div className={styles.scenarioLabeledCellWide}>
              <div style={inputCellStyle}>
                <Input end2={<SlotText>.00</SlotText>} placeholder="Amount" data-testid="input-slot-end2-text" />
              </div>
            </div>
            <div className={styles.scenarioLabeledCellWide}>
              <div style={inputCellStyle}>
                <Input end2={<Icon icon="info" aria-hidden />} placeholder="end2: Icon" data-testid="input-slot-end2-icon" />
              </div>
            </div>
            <div className={styles.scenarioLabeledCellWide}>
              <div style={inputCellStyle}>
                <Input
                  end2={<IconButton icon="info" aria-label="Info" attention="low" size="s" />}
                  placeholder="end2: IconButton"
                  data-testid="input-slot-end2-iconbutton"
                />
              </div>
            </div>
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="input-qa-types" title="8 HTML input types" overflow>
        <QaApiSectionBody>
          <div className={styles.scenarioStackWide}>
            {INPUT_TYPES.filter((t) => t.type !== 'password').map(({ type, testId, placeholder }) => (
              <div key={type} className={styles.scenarioLabeledCellWide}>
                <div style={inputCellStyle}>
                  <Input type={type} placeholder={placeholder} size="m" data-testid={testId} />
                </div>
                <span className={styles.scenarioCellCaption}>{`type: ${type}`}</span>
              </div>
            ))}
            <div className={styles.scenarioLabeledCellWide}>
              <PasswordWithToggle />
              <span className={styles.scenarioCellCaption}>type: password + visibility toggle</span>
            </div>
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="input-qa-validation" title="9 Validation attributes" overflow>
        <QaApiSectionBody>
          <div className={styles.scenarioStackWide}>
            <div className={styles.scenarioLabeledCellWide}>
              <MaxLengthDemo />
              <span className={styles.scenarioCellCaption}>max length — QA truncates in onChange (no Input prop) ⚠️</span>
            </div>
            <div className={styles.scenarioLabeledCellWide}>
              <div style={inputCellStyle}>
                <Input aria-label="Pattern" placeholder="Letters only" data-testid="input-pattern" />
              </div>
              <span className={styles.scenarioCellCaption}>
                Native <code>pattern</code> not on <code>InputProps</code> — placeholder only ⚠️
              </span>
            </div>
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="input-qa-layout" title="10 Layout (full width · autoFocus)" overflow>
        <QaApiSectionBody>
          <div className={styles.scenarioStackWide}>
            <div className={styles.scenarioLabeledCellWide}>
              <div style={fullWidthCellStyle}>
                <Input placeholder="Full width" style={{ width: '100%' }} data-testid="input-fullwidth" />
              </div>
              <span className={styles.scenarioCellCaption}>full width via container + style</span>
            </div>
            <div className={styles.scenarioLabeledCellWide}>
              <div style={inputCellStyle}>
                <Input autoFocus placeholder="Auto focused" data-testid="input-autofocus" />
              </div>
              <span className={styles.scenarioCellCaption}>autoFocus — state: focus/active</span>
            </div>
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="input-qa-labeled" title="11 Label + description" overflow>
        <div style={inputCellStyle}>
          <InputField
            label="Email"
            description="We will never share your address."
            placeholder="you@example.com"
            data-testid="input-labeled"
          />
        </div>
      </QaStoryBand>

      <QaStoryBand id="input-qa-combos" title="12 Combination matrix" overflow>
        <QaApiSectionBody>
          <div className={styles.scenarioStackWide}>
            {COMBO_MATRIX.map((row, index) => (
              <div key={row.caption} className={styles.scenarioLabeledCellWide}>
                <span className={styles.scenarioCellCaption}>{row.caption}</span>
                <div style={inputCellStyle}>
                  <Input {...row.props} data-testid={`input-combo-${index}`} />
                </div>
              </div>
            ))}
          </div>
        </QaApiSectionBody>
      </QaStoryBand>
    </QaShowcaseRoot>
  );
}
