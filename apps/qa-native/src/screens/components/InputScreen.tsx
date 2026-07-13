/**
 * InputScreen — focused test surface for `<Input>` from
 * `@oneui/ui-native/components/Input`, per CombinationsRules/InputRules.txt.
 *
 * Sections:
 *   1. Sizes        — S / M / L
 *   2. Attentions   — medium / high
 *   3. Appearances  — auto + 8 roles
 *   4. Shape        — default / pill
 *   5. States       — idle / focus-active / filled / readOnly / feedback
 *   6. Slots        — per-slot coverage: each slot rendered with every content
 *                     type it supports (others empty)
 *   7. Disabled     — disabled=true
 *
 * Notes:
 *   - Input has only S/M/L sizes (no XS), so section 1 renders those three.
 *   - "focus/active" can't be forced in a static mount; that cell is a normal
 *     interactive input — tap it to see the focus chrome.
 *   - Section 6 renders per-slot type coverage (one input per supported type in
 *     each slot) rather than the full ~280-way cartesian product. start2 is
 *     treated as none/text (its typical prefix usage).
 */

import React from 'react';
import { ScrollView, StyleSheet, Text as RNText, View, Image as RNImage } from 'react-native';
import { useSurfaceTokens } from '@oneui/ui-native';
import { Input } from '@oneui/ui-native/components/Input';
import type { InputAppearance } from '@oneui/ui-native/components/Input';
import { Icon } from '@oneui/ui-native/components/Icon';
import { IconButton } from '@oneui/ui-native/components/IconButton';
import { Avatar } from '@oneui/ui-native/components/Avatar';
import { Image } from '@oneui/ui-native/components/Image';
import { Button } from '@oneui/ui-native/components/Button';
import { ChipGroup } from '@oneui/ui-native/components/ChipGroup';
import { Chip } from '@oneui/ui-native/components/Chip';
import { InputFeedback } from '@oneui/ui-native/components/InputFeedback';
import { tokens, typography } from '@oneui/tokens';
import * as JdsIcons from '@jds/core-icons--react-native';

const GLYPH = JdsIcons.IcSearch;
const SAMPLE_IMAGE = RNImage.resolveAssetSource(
  require('../../../assets/images/profile_men.jpeg'),
).uri;

const APPEARANCES: readonly InputAppearance[] = [
  'auto',
  'neutral',
  'primary',
  'secondary',
  'sparkle',
  'positive',
  'negative',
  'warning',
  'informative',
];

/* ─── Slot content builders ──────────────────────────────────────────────── */

function slotIcon(): React.ReactNode {
  return <Icon icon={GLYPH} size='4' appearance='neutral' aria-hidden />;
}
function slotIconButton(): React.ReactNode {
  return <IconButton icon={GLYPH} size='xs' attention='low' aria-label='slot action' />;
}
function slotAvatar(): React.ReactNode {
  return <Avatar content='text' size='xs' appearance='secondary' alt='AB' />;
}
function slotImage(): React.ReactNode {
  return <Image src={SAMPLE_IMAGE} alt='slot image' aspectRatio='1:1' width={24} height={24} />;
}
function slotChipGroup(): React.ReactNode {
  return (
    <ChipGroup aria-label='slot filters' size='s' defaultValue={['a']}>
      <Chip value='a'>A</Chip>
      <Chip value='b'>B</Chip>
    </ChipGroup>
  );
}
function slotButton(): React.ReactNode {
  return (
    <Button size='xs' variant='subtle' appearance='primary'>
      Go
    </Button>
  );
}

/* ─── Screen ─────────────────────────────────────────────────────────────── */

export function InputScreen(): React.ReactElement {
  const role = useSurfaceTokens('neutral');
  return (
    <ScrollView
      testID='screen-Input'
      style={{ backgroundColor: role.surfaces.default }}
      contentContainerStyle={styles.content}
    >
      {/* 1 · Sizes */}
      <Section testID='section-sizes' title='1 · Sizes (S / M / L)'>
        {(['s', 'm', 'l'] as const).map((size) => (
          <Cell key={size} label={`size ${size}`}>
            <Input
              testID={`input-size-${size}`}
              size={size}
              placeholder={`size ${size}`}
              accessibilityLabel={`size ${size} input`}
            />
          </Cell>
        ))}
      </Section>

      {/* 2 · Attentions */}
      <Section testID='section-attentions' title='2 · Attentions (medium / high)'>
        {(['medium', 'high'] as const).map((attention) => (
          <Cell key={attention} label={attention}>
            <Input
              testID={`input-attention-${attention}`}
              attention={attention}
              placeholder={`attention ${attention}`}
              accessibilityLabel={`${attention} attention input`}
            />
          </Cell>
        ))}
      </Section>

      {/* 3 · Appearances */}
      <Section testID='section-appearances' title='3 · Appearances'>
        {APPEARANCES.map((appearance) => (
          <Cell key={appearance} label={appearance}>
            <Input
              testID={`input-appearance-${appearance}`}
              appearance={appearance}
              attention='high'
              defaultValue={appearance}
              accessibilityLabel={`${appearance} appearance input`}
            />
          </Cell>
        ))}
      </Section>

      {/* 4 · Shape */}
      <Section testID='section-shape' title='4 · Shape (default / pill)'>
        {(['default', 'pill'] as const).map((shape) => (
          <Cell key={shape} label={shape}>
            <Input
              testID={`input-shape-${shape}`}
              shape={shape}
              placeholder={`shape ${shape}`}
              accessibilityLabel={`${shape} shape input`}
            />
          </Cell>
        ))}
      </Section>

      {/* 5 · States */}
      <Section testID='section-states' title='5 · States'>
        <Cell label='idle'>
          <Input testID='input-state-idle' placeholder='Idle' accessibilityLabel='Idle input' />
        </Cell>
        <Cell label='focus / active (tap to focus)'>
          <Input
            testID='input-state-focus'
            placeholder='Focus / active'
            accessibilityLabel='Focus active input'
          />
        </Cell>
        <Cell label='filled'>
          <Input testID='input-state-filled' defaultValue='Input text' accessibilityLabel='Filled input' />
        </Cell>
        <Cell label='readOnly'>
          <Input
            testID='input-state-readonly'
            defaultValue='Read-only value'
            readOnly
            accessibilityLabel='Read-only input'
          />
        </Cell>
        <Cell label='feedback (error)'>
          <Input
            testID='input-state-feedback'
            defaultValue='Invalid value'
            errorHighlight
            aria-invalid
            accessibilityLabel='Feedback input'
          />
          <InputFeedback variant='negative'>This field has an error</InputFeedback>
        </Cell>
      </Section>

      {/* 6 · Slots — per-slot type coverage */}
      <Section testID='section-slots' title='6 · Slots (per-slot type coverage)'>
        <SubLabel>start — none / icon / icon button / avatar / image / chip group / text</SubLabel>
        <Cell label='start: none'>
          <Input testID='input-start-none' placeholder='start none' accessibilityLabel='start none' />
        </Cell>
        <Cell label='start: icon'>
          <Input testID='input-start-icon' start={slotIcon()} placeholder='start icon' accessibilityLabel='start icon' />
        </Cell>
        <Cell label='start: icon button'>
          <Input testID='input-start-iconbutton' start={slotIconButton()} placeholder='start icon button' accessibilityLabel='start icon button' />
        </Cell>
        <Cell label='start: avatar'>
          <Input testID='input-start-avatar' start={slotAvatar()} placeholder='start avatar' accessibilityLabel='start avatar' />
        </Cell>
        <Cell label='start: image'>
          <Input testID='input-start-image' start={slotImage()} placeholder='start image' accessibilityLabel='start image' />
        </Cell>
        <Cell label='start: chip group'>
          <Input testID='input-start-chipgroup' start={slotChipGroup()} placeholder='start chip group' accessibilityLabel='start chip group' />
        </Cell>
        <Cell label='start: text'>
          <Input testID='input-start-text' start='Rs' placeholder='start text' accessibilityLabel='start text' />
        </Cell>

        <SubLabel>start2 — none / text</SubLabel>
        <Cell label='start2: none'>
          <Input testID='input-start2-none' placeholder='start2 none' accessibilityLabel='start2 none' />
        </Cell>
        <Cell label='start2: text'>
          <Input testID='input-start2-text' start={slotIcon()} start2='$' placeholder='0.00' accessibilityLabel='start2 text' />
        </Cell>

        <SubLabel>end — none / icon / icon button / button / text</SubLabel>
        <Cell label='end: none'>
          <Input testID='input-end-none' placeholder='end none' accessibilityLabel='end none' />
        </Cell>
        <Cell label='end: icon'>
          <Input testID='input-end-icon' end={slotIcon()} placeholder='end icon' accessibilityLabel='end icon' />
        </Cell>
        <Cell label='end: icon button'>
          <Input testID='input-end-iconbutton' end={slotIconButton()} placeholder='end icon button' accessibilityLabel='end icon button' />
        </Cell>
        <Cell label='end: button'>
          <Input testID='input-end-button' end={slotButton()} placeholder='end button' accessibilityLabel='end button' />
        </Cell>
        <Cell label='end: text'>
          <Input testID='input-end-text' end='Go' placeholder='end text' accessibilityLabel='end text' />
        </Cell>

        <SubLabel>end2 — none / text / icon / icon button</SubLabel>
        <Cell label='end2: none'>
          <Input testID='input-end2-none' placeholder='end2 none' accessibilityLabel='end2 none' />
        </Cell>
        <Cell label='end2: text'>
          <Input testID='input-end2-text' end={slotIcon()} end2='kg' placeholder='end2 text' accessibilityLabel='end2 text' />
        </Cell>
        <Cell label='end2: icon'>
          <Input testID='input-end2-icon' end={slotIcon()} end2={slotIcon()} placeholder='end2 icon' accessibilityLabel='end2 icon' />
        </Cell>
        <Cell label='end2: icon button'>
          <Input testID='input-end2-iconbutton' end={slotIcon()} end2={slotIconButton()} placeholder='end2 icon button' accessibilityLabel='end2 icon button' />
        </Cell>
      </Section>

      {/* 7 · Disabled */}
      <Section testID='section-disabled' title='7 · Disabled'>
        <Cell label='disabled'>
          <Input
            testID='input-disabled'
            disabled
            defaultValue='Disabled value'
            accessibilityLabel='Disabled input'
          />
        </Cell>
      </Section>
    </ScrollView>
  );
}

/* ─── Primitives ─────────────────────────────────────────────────────────── */

function Section({
  testID,
  title,
  children,
}: {
  testID: string;
  title: string;
  children: React.ReactNode;
}): React.ReactElement {
  const role = useSurfaceTokens('neutral');
  return (
    <View testID={testID} style={[styles.section, { borderColor: role.content.strokeLow }]}>
      <RNText style={[styles.sectionTitle, { color: role.content.high }]}>{title}</RNText>
      {children}
    </View>
  );
}

function SubLabel({ children }: { children: React.ReactNode }): React.ReactElement {
  const role = useSurfaceTokens('neutral');
  return <RNText style={[styles.subLabel, { color: role.content.medium }]}>{children}</RNText>;
}

function Cell({ label, children }: { label: string; children: React.ReactNode }): React.ReactElement {
  const role = useSurfaceTokens('neutral');
  return (
    <View style={styles.cell}>
      <RNText style={[styles.caption, { color: role.content.low }]}>{label}</RNText>
      {children}
    </View>
  );
}

/* ─── Styles ─────────────────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  content: {
    padding: tokens.spacing['4'],
    gap: tokens.spacing['5'],
  },
  section: {
    gap: tokens.spacing['4'],
    paddingBottom: tokens.spacing['4'],
    borderBottomWidth: 1,
  },
  sectionTitle: {
    fontSize: typography.size.l,
    fontWeight: typography.weight.high,
  },
  subLabel: {
    fontSize: typography.size.s,
    fontWeight: typography.weight.medium,
  },
  cell: {
    gap: tokens.spacing['2'],
  },
  caption: {
    fontSize: typography.size.xs,
  },
});
