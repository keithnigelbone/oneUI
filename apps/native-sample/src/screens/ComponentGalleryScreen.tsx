/**
 * ComponentGalleryScreen.tsx
 *
 * Mounts every Button showcase from
 * `packages/ui-native/src/components/Button/Button.showcase.native.tsx` so
 * the component-level token consumption is visible. As more native
 * components ship, drop their showcase imports in here.
 */

import React from 'react';
import {
  ButtonAppearances,
  ButtonAttentionLevels,
  ButtonCondensed,
  ButtonContained,
  ButtonDensity,
  ButtonFullWidth,
  ButtonLoadingWithSlots,
  ButtonMotion,
  ButtonSizes,
  ButtonSlotPadding,
  ButtonStates,
  ButtonSurfaceContext,
  ButtonThemes,
  ButtonWithSlots,
} from '@oneui/ui-native/showcase/Button';
import { ScreenScaffold } from '../components/ScreenScaffold';
import { Section } from '../shared/Section';

export function ComponentGalleryScreen(): React.ReactElement {
  return (
    <ScreenScaffold
      title='Component gallery'
      description='Component-level views of the active brand × theme. Each section reads tokens through useSurfaceTokens, exactly like a real screen.'
    >
      <Section title='Attention levels'>
        <ButtonAttentionLevels />
      </Section>
      <Section title='Themes'>
        <ButtonThemes />
      </Section>
      <Section title='Sizes'>
        <ButtonSizes />
      </Section>
      <Section title='Contained'>
        <ButtonContained />
      </Section>
      <Section title='Condensed'>
        <ButtonCondensed />
      </Section>
      <Section title='Slot-aware padding'>
        <ButtonSlotPadding />
      </Section>
      <Section title='States'>
        <ButtonStates />
      </Section>
      <Section title='With slots'>
        <ButtonWithSlots />
      </Section>
      <Section title='Loading with slots'>
        <ButtonLoadingWithSlots />
      </Section>
      <Section title='Full width'>
        <ButtonFullWidth />
      </Section>
      <Section title='Appearances'>
        <ButtonAppearances />
      </Section>
      <Section title='Density'>
        <ButtonDensity />
      </Section>
      <Section title='Motion'>
        <ButtonMotion />
      </Section>
      <Section title='Surface context'>
        <ButtonSurfaceContext />
      </Section>
    </ScreenScaffold>
  );
}
