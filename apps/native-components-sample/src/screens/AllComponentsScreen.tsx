/**
 * AllComponentsScreen — comprehensive showcase of all @oneui/ui-native components.
 *
 * Each section shows a component across all attention levels (bold/subtle/ghost)
 * and all appearance roles (primary → informative). Follows the same structure
 * as JioTypeUIWeightsScreen: ComponentsChrome header + ScrollView content.
 */

import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { tokens, typography } from '@oneui/tokens';
import { COMPONENT_APPEARANCE_ROLES } from '@oneui/shared';
import type { IconComponent } from '@oneui/shared';
import Svg, { Path } from 'react-native-svg';
import {
  Avatar,
  Badge,
  BottomNavigation,
  BottomNavigationItem,
  Button,
  Checkbox,
  CheckboxField,
  Chip,
  ChipGroup,
  CircularProgressIndicator,
  CounterBadge,
  Divider,
  IconButton,
  IconContained,
  IndicatorBadge,
  InputField,
  Radio,
  RadioField,
  Surface,
  Text as OneUIText,
  Tooltip,
  TooltipProvider,
  useSurfaceTokens,
} from '@oneui/ui-native';
import { ComponentsChrome } from '../components/ComponentsChrome';
import type { ComponentsStackParamList } from './components/ComponentsStack';

type Props = NativeStackScreenProps<ComponentsStackParamList, 'AllComponents'>;

const StarGlyph: IconComponent = ({ size = 24, color = 'currentColor', fill }) => (
  <Svg width={size} height={size} viewBox='0 0 24 24' fill='none'>
    <Path
      d='M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z'
      fill={fill ?? color}
    />
  </Svg>
);

const ATTENTION_LEVELS = ['high', 'medium', 'low'] as const;
const VARIANTS = ['bold', 'subtle', 'ghost'] as const;
const APPEARANCES = COMPONENT_APPEARANCE_ROLES;

// ─── Layout helpers ────────────────────────────────────────────────────────────

function SectionHeader({ children }: { children: string }): React.ReactElement {
  const roles = useSurfaceTokens('neutral');
  return (
    <Text
      style={[
        styles.sectionHeader,
        {
          color: roles.content.high,
          fontSize: typography.size.xl,
          fontWeight: typography.weight.high,
        },
      ]}
    >
      {children}
    </Text>
  );
}

function SubHeader({ children }: { children: string }): React.ReactElement {
  const roles = useSurfaceTokens('neutral');
  return (
    <Text
      style={[
        styles.subHeader,
        {
          color: roles.content.medium,
          fontSize: typography.size.s,
          fontWeight: typography.weight.medium,
          textTransform: 'uppercase',
        },
      ]}
    >
      {children}
    </Text>
  );
}

function Row({ children }: { children: React.ReactNode }): React.ReactElement {
  return <View style={styles.row}>{children}</View>;
}

function LabeledItem({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}): React.ReactElement {
  const roles = useSurfaceTokens('neutral');
  return (
    <View style={styles.labeledItem}>
      {children}
      <Text
        style={{
          fontSize: typography.size['2xs'],
          color: roles.content.low,
          textAlign: 'center',
        }}
      >
        {label}
      </Text>
    </View>
  );
}

function SectionDivider(): React.ReactElement {
  const roles = useSurfaceTokens('neutral');
  return (
    <View
      style={[styles.sectionDivider, { borderBottomColor: roles.content.strokeLow }]}
    />
  );
}

// ─── Button section ────────────────────────────────────────────────────────────

function ButtonSection(): React.ReactElement {
  return (
    <View style={styles.section}>
      <SectionHeader>Button</SectionHeader>

      <SubHeader>Attention levels (primary)</SubHeader>
      <Row>
        {ATTENTION_LEVELS.map((att) => (
          <LabeledItem key={att} label={att}>
            <Button appearance='primary' attention={att}>
              {att.charAt(0).toUpperCase() + att.slice(1)}
            </Button>
          </LabeledItem>
        ))}
      </Row>

      <SubHeader>Variants (primary)</SubHeader>
      <Row>
        {VARIANTS.map((v) => (
          <LabeledItem key={v} label={v}>
            <Button appearance='primary' variant={v}>
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </Button>
          </LabeledItem>
        ))}
      </Row>

      <SubHeader>Appearances — bold</SubHeader>
      <Row>
        {APPEARANCES.map((app) => (
          <LabeledItem key={app} label={app}>
            <Button appearance={app} variant='bold'>
              Bold
            </Button>
          </LabeledItem>
        ))}
      </Row>

      <SubHeader>Appearances — subtle</SubHeader>
      <Row>
        {APPEARANCES.map((app) => (
          <LabeledItem key={app} label={app}>
            <Button appearance={app} variant='subtle'>
              Subtle
            </Button>
          </LabeledItem>
        ))}
      </Row>

      <SubHeader>Appearances — ghost</SubHeader>
      <Row>
        {APPEARANCES.map((app) => (
          <LabeledItem key={app} label={app}>
            <Button appearance={app} variant='ghost'>
              Ghost
            </Button>
          </LabeledItem>
        ))}
      </Row>

      <SubHeader>Disabled states</SubHeader>
      <Row>
        {VARIANTS.map((v) => (
          <LabeledItem key={v} label={`${v} disabled`}>
            <Button appearance='primary' variant={v} disabled>
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </Button>
          </LabeledItem>
        ))}
      </Row>

      <SubHeader>Sizes</SubHeader>
      <Row>
        {(['xs', 's', 'm', 'l'] as const).map((sz) => (
          <LabeledItem key={sz} label={sz}>
            <Button appearance='primary' variant='bold' size={sz}>
              {sz.toUpperCase()}
            </Button>
          </LabeledItem>
        ))}
      </Row>

      <SubHeader>Bold on surfaces</SubHeader>
      <View style={styles.surfaceRow}>
        {VARIANTS.map((v) => (
          <Surface key={v} mode='bold' style={styles.surfaceCard}>
            <Button appearance='primary' variant={v}>
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </Button>
          </Surface>
        ))}
      </View>
    </View>
  );
}

// ─── Chip section ──────────────────────────────────────────────────────────────

function ChipSection(): React.ReactElement {
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const toggle = (key: string) =>
    setSelected((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <View style={styles.section}>
      <SectionHeader>Chip</SectionHeader>

      <SubHeader>Attention levels</SubHeader>
      <Row>
        {ATTENTION_LEVELS.map((att) => (
          <LabeledItem key={att} label={att}>
            <Chip
              attention={att}
              selected={selected[`att-${att}`]}
              onSelectedChange={() => toggle(`att-${att}`)}
            >
              {att}
            </Chip>
          </LabeledItem>
        ))}
      </Row>

      <SubHeader>Variants</SubHeader>
      <Row>
        {VARIANTS.map((v) => (
          <LabeledItem key={v} label={v}>
            <Chip
              variant={v}
              selected={selected[`v-${v}`]}
              onSelectedChange={() => toggle(`v-${v}`)}
            >
              {v}
            </Chip>
          </LabeledItem>
        ))}
      </Row>

      <SubHeader>Appearances — ghost</SubHeader>
      <Row>
        {APPEARANCES.map((app) => (
          <LabeledItem key={app} label={app}>
            <Chip
              appearance={app}
              variant='ghost'
              selected={selected[`app-${app}`]}
              onSelectedChange={() => toggle(`app-${app}`)}
            >
              {app}
            </Chip>
          </LabeledItem>
        ))}
      </Row>

      <SubHeader>Sizes</SubHeader>
      <Row>
        {(['s', 'm', 'l'] as const).map((sz) => (
          <LabeledItem key={sz} label={sz}>
            <Chip
              size={sz}
              selected={selected[`sz-${sz}`]}
              onSelectedChange={() => toggle(`sz-${sz}`)}
            >
              {sz.toUpperCase()}
            </Chip>
          </LabeledItem>
        ))}
      </Row>
    </View>
  );
}

// ─── Badge section ─────────────────────────────────────────────────────────────

function BadgeSection(): React.ReactElement {
  return (
    <View style={styles.section}>
      <SectionHeader>Badge / CounterBadge / IndicatorBadge</SectionHeader>

      <SubHeader>Badge — appearances</SubHeader>
      <Row>
        {APPEARANCES.map((app) => (
          <LabeledItem key={app} label={app}>
            <Badge appearance={app}>New</Badge>
          </LabeledItem>
        ))}
      </Row>

      <SubHeader>CounterBadge — appearances</SubHeader>
      <Row>
        {APPEARANCES.map((app) => (
          <LabeledItem key={app} label={app}>
            <CounterBadge value={5} appearance={app} />
          </LabeledItem>
        ))}
      </Row>

      <SubHeader>IndicatorBadge — appearances</SubHeader>
      <Row>
        {APPEARANCES.map((app) => (
          <LabeledItem key={app} label={app}>
            <IndicatorBadge appearance={app} />
          </LabeledItem>
        ))}
      </Row>
    </View>
  );
}

// ─── Avatar section ────────────────────────────────────────────────────────────

function AvatarSection(): React.ReactElement {
  return (
    <View style={styles.section}>
      <SectionHeader>Avatar</SectionHeader>

      <SubHeader>Sizes</SubHeader>
      <Row>
        {(['2xs', 'xs', 's', 'm', 'l', 'xl', '2xl'] as const).map((sz) => (
          <LabeledItem key={sz} label={sz}>
            <Avatar size={sz} content='text' alt='OU' />
          </LabeledItem>
        ))}
      </Row>

      <SubHeader>Appearances</SubHeader>
      <Row>
        {APPEARANCES.map((app) => (
          <LabeledItem key={app} label={app}>
            <Avatar size='m' content='text' alt='UI' appearance={app} />
          </LabeledItem>
        ))}
      </Row>
    </View>
  );
}

// ─── IconButton section ────────────────────────────────────────────────────────

function IconButtonSection(): React.ReactElement {
  return (
    <View style={styles.section}>
      <SectionHeader>IconButton / IconContained</SectionHeader>

      <SubHeader>IconButton — attention levels</SubHeader>
      <Row>
        {ATTENTION_LEVELS.map((att) => (
          <LabeledItem key={att} label={att}>
            <IconButton icon={StarGlyph} appearance='primary' attention={att} aria-label={att} />
          </LabeledItem>
        ))}
      </Row>

      <SubHeader>IconButton — appearances (high)</SubHeader>
      <Row>
        {APPEARANCES.map((app) => (
          <LabeledItem key={app} label={app}>
            <IconButton icon={StarGlyph} appearance={app} attention='high' aria-label={app} />
          </LabeledItem>
        ))}
      </Row>

      <SubHeader>IconContained — appearances</SubHeader>
      <Row>
        {APPEARANCES.map((app) => (
          <LabeledItem key={app} label={app}>
            <IconContained icon={StarGlyph} appearance={app} aria-label={app} />
          </LabeledItem>
        ))}
      </Row>
    </View>
  );
}

// ─── CircularProgressIndicator section ────────────────────────────────────────

function ProgressSection(): React.ReactElement {
  return (
    <View style={styles.section}>
      <SectionHeader>CircularProgressIndicator</SectionHeader>

      <SubHeader>Determinate — appearances</SubHeader>
      <Row>
        {APPEARANCES.map((app) => (
          <LabeledItem key={app} label={app}>
            <CircularProgressIndicator
              variant='determinate'
              value={65}
              appearance={app}
              size='M'
            />
          </LabeledItem>
        ))}
      </Row>

      <SubHeader>Indeterminate — appearances</SubHeader>
      <Row>
        {APPEARANCES.map((app) => (
          <LabeledItem key={app} label={app}>
            <CircularProgressIndicator
              variant='indeterminate'
              appearance={app}
              size='M'
            />
          </LabeledItem>
        ))}
      </Row>

      <SubHeader>Sizes</SubHeader>
      <Row>
        {(['2XS', 'XS', 'S', 'M', 'L', 'XL'] as const).map((sz) => (
          <LabeledItem key={sz} label={sz}>
            <CircularProgressIndicator
              variant='indeterminate'
              appearance='primary'
              size={sz}
            />
          </LabeledItem>
        ))}
      </Row>
    </View>
  );
}

// ─── Checkbox & Radio section ──────────────────────────────────────────────────

function SelectionSection(): React.ReactElement {
  const [cbChecked, setCbChecked] = useState(false);
  const [radioVal, setRadioVal] = useState('a');

  return (
    <View style={styles.section}>
      <SectionHeader>Checkbox / Radio</SectionHeader>

      <SubHeader>Checkbox — appearances</SubHeader>
      <Row>
        {APPEARANCES.map((app) => (
          <LabeledItem key={app} label={app}>
            <Checkbox
              appearance={app}
              selected={cbChecked}
              onSelectedChange={setCbChecked}
              label={app}
            />
          </LabeledItem>
        ))}
      </Row>

      <SubHeader>Checkbox — states</SubHeader>
      <Row>
        {[
          { label: 'unchecked', selected: false as const, indeterminate: false },
          { label: 'checked', selected: true as const, indeterminate: false },
          { label: 'indeterminate', selected: false as const, indeterminate: true },
          { label: 'disabled', selected: false as const, indeterminate: false, disabled: true },
        ].map((item) => (
          <LabeledItem key={item.label} label={item.label}>
            <Checkbox
              appearance='primary'
              selected={item.selected}
              indeterminate={item.indeterminate}
              disabled={item.disabled}
              onSelectedChange={() => {}}
              label={item.label}
            />
          </LabeledItem>
        ))}
      </Row>

      <SubHeader>Radio — appearances</SubHeader>
      <Row>
        {APPEARANCES.map((app, i) => (
          <LabeledItem key={app} label={app}>
            <Radio
              appearance={app}
              value={app}
              checked={radioVal === app || (i === 0 && radioVal === 'a')}
              onChange={() => setRadioVal(app)}
              label={app}
            />
          </LabeledItem>
        ))}
      </Row>
    </View>
  );
}

// ─── Text section ──────────────────────────────────────────────────────────────

function TextSection(): React.ReactElement {
  return (
    <View style={styles.section}>
      <SectionHeader>Text</SectionHeader>

      <SubHeader>Variants</SubHeader>
      <View style={styles.textStack}>
        {(
          [
            ['display', 'L'],
            ['headline', 'L'],
            ['title', 'M'],
            ['body', 'M'],
            ['label', 'S'],
          ] as const
        ).map(([variant, size]) => (
          <OneUIText key={`${variant}-${size}`} variant={variant} size={size}>
            {`${variant} / ${size} — The quick brown fox`}
          </OneUIText>
        ))}
      </View>
    </View>
  );
}

// ─── Divider section ───────────────────────────────────────────────────────────

function DividerSection(): React.ReactElement {
  return (
    <View style={styles.section}>
      <SectionHeader>Divider</SectionHeader>
      <SubHeader>Default</SubHeader>
      <Divider />
      <SubHeader>With label</SubHeader>
      <Divider>Section</Divider>
    </View>
  );
}

// ─── InputField section ────────────────────────────────────────────────────────

function InputFieldSection(): React.ReactElement {
  return (
    <View style={styles.section}>
      <SectionHeader>InputField</SectionHeader>
      <SubHeader>Appearances</SubHeader>
      {(['primary', 'secondary', 'neutral'] as const).map((app) => (
        <InputField
          key={app}
          label={app.charAt(0).toUpperCase() + app.slice(1)}
          description='Supporting description text'
          appearance={app}
          placeholder='Placeholder…'
          aria-label={`${app} input`}
        />
      ))}
      <SubHeader>Error state</SubHeader>
      <InputField
        label='Email'
        error='Please enter a valid email address'
        appearance='primary'
        defaultValue='not-an-email'
        aria-label='email input'
      />
      <SubHeader>Disabled</SubHeader>
      <InputField
        label='Disabled'
        disabled
        defaultValue='Cannot edit this'
        aria-label='disabled input'
      />
    </View>
  );
}

// ─── ChipGroup section ─────────────────────────────────────────────────────────

function ChipGroupSection(): React.ReactElement {
  return (
    <View style={styles.section}>
      <SectionHeader>ChipGroup</SectionHeader>
      <SubHeader>Single-select (default)</SubHeader>
      <ChipGroup defaultValue={['option-1']} aria-label='single-select chips'>
        {(['option-1', 'option-2', 'option-3'] as const).map((v) => (
          <Chip key={v} value={v}>
            {v.replace('-', ' ')}
          </Chip>
        ))}
      </ChipGroup>
      <SubHeader>Multi-select (maxSelections=2)</SubHeader>
      <ChipGroup
        defaultValue={['tag-a']}
        maxSelections={2}
        aria-label='multi-select chips'
        appearance='secondary'
      >
        {(['tag-a', 'tag-b', 'tag-c', 'tag-d'] as const).map((v) => (
          <Chip key={v} value={v}>
            {v.toUpperCase()}
          </Chip>
        ))}
      </ChipGroup>
    </View>
  );
}

// ─── CheckboxField section ─────────────────────────────────────────────────────

function CheckboxFieldSection(): React.ReactElement {
  return (
    <View style={styles.section}>
      <SectionHeader>CheckboxField</SectionHeader>
      <SubHeader>Single integrated mode</SubHeader>
      {(['primary', 'secondary', 'neutral'] as const).map((app) => (
        <CheckboxField
          key={app}
          label={app.charAt(0).toUpperCase() + app.slice(1)}
          description='Optional description'
          appearance={app}
          defaultSelected={app === 'primary'}
          aria-label={`${app} checkbox`}
        />
      ))}
      <SubHeader>Multi-option mode</SubHeader>
      <CheckboxField
        label='Preferences'
        description='Select all that apply'
        aria-label='preferences group'
      >
        <Checkbox value='newsletters' label='Newsletters' aria-label='newsletters' />
        <Checkbox value='updates' label='Product updates' aria-label='updates' />
        <Checkbox value='offers' label='Special offers' aria-label='offers' />
      </CheckboxField>
    </View>
  );
}

// ─── RadioField section ────────────────────────────────────────────────────────

function RadioFieldSection(): React.ReactElement {
  return (
    <View style={styles.section}>
      <SectionHeader>RadioField</SectionHeader>
      <SubHeader>Multi-option group</SubHeader>
      <RadioField
        label='Preferred contact'
        description='Choose how we reach you'
        defaultValue='email'
        aria-label='contact preference'
      >
        <Radio value='email' aria-label='email'>
          Email
        </Radio>
        <Radio value='phone' aria-label='phone'>
          Phone
        </Radio>
        <Radio value='sms' aria-label='sms'>
          SMS
        </Radio>
      </RadioField>
      <SubHeader>Appearances</SubHeader>
      {(['primary', 'secondary', 'positive'] as const).map((app) => (
        <RadioField
          key={app}
          label={app.charAt(0).toUpperCase() + app.slice(1)}
          defaultValue='yes'
          aria-label={`${app} radio field`}
          appearance={app}
        >
          <Radio value='yes' aria-label='yes'>
            Yes
          </Radio>
          <Radio value='no' aria-label='no'>
            No
          </Radio>
        </RadioField>
      ))}
    </View>
  );
}

// ─── BottomNavigation section ──────────────────────────────────────────────────

function BottomNavigationSection(): React.ReactElement {
  return (
    <View style={styles.section}>
      <SectionHeader>BottomNavigation</SectionHeader>
      <SubHeader>Default (1-line labels)</SubHeader>
      <BottomNavigation aria-label='bottom-nav-demo' defaultValue='home'>
        <BottomNavigationItem
          value='home'
          label='Home'
          icon={StarGlyph}
          aria-label='home'
        />
        <BottomNavigationItem
          value='search'
          label='Search'
          icon={StarGlyph}
          aria-label='search'
        />
        <BottomNavigationItem
          value='profile'
          label='Profile'
          icon={StarGlyph}
          aria-label='profile'
        />
      </BottomNavigation>
      <SubHeader>Appearances</SubHeader>
      {(['primary', 'secondary', 'neutral'] as const).map((app) => (
        <View key={app} style={{ marginBottom: tokens.spacing['2-5'] }}>
          <BottomNavigation
            aria-label={`${app} bottom nav`}
            defaultValue='a'
            appearance={app}
          >
            <BottomNavigationItem value='a' label='First' icon={StarGlyph} aria-label='first' />
            <BottomNavigationItem value='b' label='Second' icon={StarGlyph} aria-label='second' />
            <BottomNavigationItem value='c' label='Third' icon={StarGlyph} aria-label='third' />
          </BottomNavigation>
        </View>
      ))}
    </View>
  );
}

// ─── Tooltip section ───────────────────────────────────────────────────────────

function TooltipSection(): React.ReactElement {
  return (
    <TooltipProvider>
      <View style={styles.section}>
        <SectionHeader>Tooltip</SectionHeader>
        <SubHeader>Sides</SubHeader>
        <View style={[styles.row, { justifyContent: 'center', paddingVertical: tokens.spacing['5'] }]}>
          {(['top', 'bottom', 'left', 'right'] as const).map((side) => (
            <Tooltip
              key={side}
              content={`Tooltip on ${side}`}
              side={side}
              aria-label={`tooltip ${side}`}
            >
              <Button variant='subtle' appearance='neutral'>
                {side}
              </Button>
            </Tooltip>
          ))}
        </View>
        <SubHeader>With trigger button</SubHeader>
        <View style={styles.row}>
          <Tooltip content='This is helpful context about the action.' side='top' aria-label='info tooltip'>
            <Button variant='bold' appearance='primary'>
              Hover me
            </Button>
          </Tooltip>
        </View>
      </View>
    </TooltipProvider>
  );
}

// ─── Surface context section ───────────────────────────────────────────────────

function SurfaceContextSection(): React.ReactElement {
  return (
    <View style={styles.section}>
      <SectionHeader>Surface context</SectionHeader>
      <SubHeader>Button variants inside bold surface</SubHeader>
      <View style={styles.surfaceDemoRow}>
        {VARIANTS.map((v) => (
          <Surface key={v} mode='bold' style={styles.surfaceDemoCard}>
            <Text
              style={{
                color: 'white',
                fontSize: typography.size['2xs'],
                marginBottom: tokens.spacing['2-5'],
                textAlign: 'center',
              }}
            >
              bold surface
            </Text>
            <Button appearance='primary' variant={v}>
              {v}
            </Button>
          </Surface>
        ))}
      </View>

      <SubHeader>Button variants inside subtle surface</SubHeader>
      <View style={styles.surfaceDemoRow}>
        {VARIANTS.map((v) => (
          <Surface key={v} mode='subtle' style={styles.surfaceDemoCard}>
            <Button appearance='primary' variant={v}>
              {v}
            </Button>
          </Surface>
        ))}
      </View>
    </View>
  );
}

// ─── Main screen ───────────────────────────────────────────────────────────────

export function AllComponentsScreen({ navigation }: Props): React.ReactElement {
  const roles = useSurfaceTokens('neutral');

  return (
    <View style={[styles.outer, { backgroundColor: roles.surfaces.default }]}>
      <ComponentsChrome
        variant='allComponents'
        navigation={navigation}
        title='All Components'
      />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <ButtonSection />
        <SectionDivider />
        <ChipSection />
        <SectionDivider />
        <BadgeSection />
        <SectionDivider />
        <AvatarSection />
        <SectionDivider />
        <IconButtonSection />
        <SectionDivider />
        <ProgressSection />
        <SectionDivider />
        <SelectionSection />
        <SectionDivider />
        <TextSection />
        <SectionDivider />
        <DividerSection />
        <SectionDivider />
        <InputFieldSection />
        <SectionDivider />
        <ChipGroupSection />
        <SectionDivider />
        <CheckboxFieldSection />
        <SectionDivider />
        <RadioFieldSection />
        <SectionDivider />
        <BottomNavigationSection />
        <SectionDivider />
        <TooltipSection />
        <SectionDivider />
        <SurfaceContextSection />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: tokens.spacing['4-5'],
    paddingBottom: tokens.spacing['10'],
  },
  section: {
    gap: tokens.spacing['3-5'],
    paddingVertical: tokens.spacing['4'],
  },
  sectionHeader: {
    marginBottom: tokens.spacing['1'],
  },
  subHeader: {
    marginTop: tokens.spacing['2-5'],
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: tokens.spacing['3-5'],
    alignItems: 'flex-start',
  },
  labeledItem: {
    alignItems: 'center',
    gap: tokens.spacing['2'],
  },
  sectionDivider: {
    borderBottomWidth: 1,
    marginVertical: tokens.spacing['2'],
  },
  surfaceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: tokens.spacing['3-5'],
  },
  surfaceCard: {
    padding: tokens.spacing['4'],
    borderRadius: tokens.shape.m,
    alignItems: 'center',
  },
  textStack: {
    gap: tokens.spacing['3'],
  },
  surfaceDemoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: tokens.spacing['3-5'],
  },
  surfaceDemoCard: {
    padding: tokens.spacing['4'],
    borderRadius: tokens.shape.m,
    alignItems: 'center',
    gap: tokens.spacing['2-5'],
  },
});
