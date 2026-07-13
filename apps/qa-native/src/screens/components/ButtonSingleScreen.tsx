/**
 * ButtonSingleScreen — minimal Button mount.
 *
 * Mirrors ButtonScreen's pattern: relies on the outer `<OneUIBrandProvider>`
 * mounted in `App.tsx` (no nested provider). Renders one uncontained,
 * primary button per attention level.
 */

import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Chip, InputFeedback, useSurfaceTokens } from '@oneui/ui-native';
import { Icon } from '@oneui/ui-native/components/Icon';
import { CheckboxField } from '@oneui/ui-native/components/CheckboxField';
import { CircularProgressIndicator } from '@oneui/ui-native/components/CircularProgressIndicator';
import { Radio } from '@oneui/ui-native/components/Radio';
import { RadioField } from '@oneui/ui-native/components/RadioField';
import { tokens } from '@oneui/tokens';
import * as JdsIcons from '@jds/core-icons--react-native';

export function ButtonSingleScreen(): React.ReactElement {
  const role = useSurfaceTokens('neutral');
  const [checked, setChecked] = useState(false);
  return (
    <View
      testID='screen-ButtonSingle'
      style={[styles.container, { backgroundColor: role.surfaces.default }]}
    >
      <Button
        start={<Icon icon={JdsIcons.IcAdd} />}
        appearance='primary'
        attention='high'
        contained={false}
        testID='btn-single-high'
      >
        Button
      </Button>
      <Button
      start={<Icon icon={JdsIcons.IcAdd} />}
        appearance='secondary'
        attention='high'
        contained={true}
        testID='btn-single-medium'
      >
        Button
      </Button>
      <Button
      start={<Icon icon={JdsIcons.IcAdd} />}
        appearance='primary'
        attention='low'
        contained={false}
        testID='btn-single-low'
      >
        Button
      </Button>

      <Icon appearance='negative' emphasis='high' icon={JdsIcons.IcAdd} />
      <Chip appearance='secondary' attention='high'>Chips</Chip>

      <CircularProgressIndicator size='L' content='icon' value={50}>
        <Icon icon={JdsIcons.IcAdd} size='8' aria-hidden />
      </CircularProgressIndicator>

      <Radio testID='radio-single-readonly' label='Read-only radio' checked readOnly />
      {/* <Radio testID='radio-single-readonly' label='Read-only radio' checked={false} readOnly /> */}

      <RadioField
        testID='radiofield-single-readonly'
        label='Read-only radio field'
        description='This field cannot be changed.'
        checked
        readOnly
        fullWidth
        style={styles.field}
      />


      <CheckboxField
        testID='cbf-single'
        label='Send me product news'
        description='You can change this any time.'
        dynamicText='Helper text'
        feedback={
          <InputFeedback
            variant='negative'
            feedback_message='Feedback message for this field.'
            size='s'
          />
        }
        selected={checked}
        onSelectedChange={setChecked}
        fullWidth
        style={styles.field}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: tokens.spacing['6'],
    gap: tokens.spacing['4'],
  },
  field: {
    alignSelf: 'stretch',
  },
});
