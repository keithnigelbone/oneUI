/**
 * Tooltip.showcase.native.tsx — web `Tooltip.stories.tsx` parity.
 * All interactive demos use `trigger="click"` (no hover on touch).
 */

import React, { useState } from 'react';
import { Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { tokens, typography } from '@oneui/tokens';
import { Tooltip } from './Tooltip.native';
import { Button } from '../Button/Button.native';
import { Checkbox } from '../Checkbox/Checkbox.native';
import { Surface, useSurfaceTokens } from '../../theme';
import type { TooltipPosition } from './interface';

const LONG_TOOLTIP_TEXT =
  'Default tooltip copy uses a single line. Long sentences extend horizontally until you pass maxWidth, which enables wrapping inside that width.';

const CLICK = { trigger: 'click' as const, delay: 0 };

const POSITION_ROWS = [
  ['bottom', 'bottomStart', 'bottomEnd'],
  ['top', 'topStart', 'topEnd'],
  ['left', 'leftStart', 'leftEnd'],
  ['right', 'rightStart', 'rightEnd'],
] as const satisfies readonly (readonly TooltipPosition[])[];

const row: StyleProp<ViewStyle> = {
  flexDirection: 'row',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: tokens.spacing['6'],
};

const column: StyleProp<ViewStyle> = {
  flexDirection: 'column',
  gap: tokens.spacing['4'],
  alignSelf: 'stretch',
};

function Caption({ children }: { children: React.ReactNode }): React.ReactElement {
  const role = useSurfaceTokens('neutral');
  return (
    <Text style={{ fontSize: typography.size.s, color: role.content.medium }}>{children}</Text>
  );
}

function PositionCell({ position }: { position: TooltipPosition }): React.ReactElement {
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: tokens.spacing['24'],
        minWidth: tokens.spacing['20'],
      }}
    >
      <Tooltip content="Tooltip" position={position} {...CLICK}>
        <Button attention="high">{position}</Button>
      </Tooltip>
    </View>
  );
}

export function TooltipDefault(): React.ReactElement {
  return (
    <View style={{ gap: tokens.spacing['2'], alignSelf: 'flex-start' }}>
      <Caption>
        Tap the button (click trigger). Popup above trigger, tip centered on bottom.
      </Caption>
      <Tooltip content="Tooltip" {...CLICK}>
        <Button>Click me</Button>
      </Tooltip>
    </View>
  );
}

export function TooltipPositions(): React.ReactElement {
  return (
    <View style={column}>
      <Caption>
        All 12 position variants — tap a button to open (click trigger). 4 sides × 3 alignments.
      </Caption>
      <View
        style={{ gap: tokens.spacing['0-5'], padding: tokens.spacing['0-5'], alignSelf: 'stretch' }}
      >
        {POSITION_ROWS.map((positions) => (
          <View
            key={positions[0]}
            style={{ flexDirection: 'row', gap: tokens.spacing['0-5'], alignSelf: 'stretch' }}
          >
            {positions.map((position) => (
              <PositionCell key={position} position={position} />
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}

export function TooltipArrow(): React.ReactElement {
  return (
    <View style={column}>
      <Caption>Toggle the arrow (tip). Tap each button to compare (Figma tip property).</Caption>
      <View style={row}>
        <Tooltip content="With arrow" arrow side="bottom" {...CLICK}>
          <Button>Arrow: true</Button>
        </Tooltip>
        <Tooltip content="Without arrow" arrow={false} side="bottom" {...CLICK}>
          <Button>Arrow: false</Button>
        </Tooltip>
      </View>
    </View>
  );
}

export function TooltipTriggerModes(): React.ReactElement {
  return (
    <View style={column}>
      <Caption>
        Native sample uses click trigger only. Tap to toggle open/closed (web also supports hover
        and focus).
      </Caption>
      <View style={row}>
        <Tooltip content="Click tooltip" {...CLICK}>
          <Button>Click</Button>
        </Tooltip>
      </View>
    </View>
  );
}

export function TooltipDelay(): React.ReactElement {
  return (
    <View style={column}>
      <Caption>Custom delay before the tooltip appears after tap. Default is 200ms.</Caption>
      <View style={row}>
        <Tooltip content="No delay" delay={0} trigger="click">
          <Button>Instant</Button>
        </Tooltip>
        <Tooltip content="300ms delay" delay={300} trigger="click">
          <Button>300ms</Button>
        </Tooltip>
        <Tooltip content="1000ms delay" delay={1000} trigger="click">
          <Button>1000ms</Button>
        </Tooltip>
      </View>
    </View>
  );
}

export function TooltipDisabled(): React.ReactElement {
  return (
    <View style={column}>
      <Caption>Disabled tooltips do not open on tap.</Caption>
      <View style={row}>
        <Tooltip content="This tooltip works" disabled={false} {...CLICK}>
          <Button>Enabled</Button>
        </Tooltip>
        <Tooltip content="This won't show" disabled {...CLICK}>
          <Button>Disabled</Button>
        </Tooltip>
      </View>
    </View>
  );
}

function TooltipControlledDemo(): React.ReactElement {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <View style={[row, { alignItems: 'center' }]}>
      <Button attention="medium" onPress={() => setIsOpen(!isOpen)}>
        {isOpen ? 'Hide Tooltip' : 'Show Tooltip'}
      </Button>
      <Tooltip content="Controlled tooltip" open={isOpen} onOpenChange={setIsOpen} trigger="manual">
        <Button>Target</Button>
      </Tooltip>
    </View>
  );
}

export function TooltipControlled(): React.ReactElement {
  return (
    <View style={column}>
      <Caption>
        Controlled mode with trigger=&quot;manual&quot;. Only responds to the open prop.
      </Caption>
      <TooltipControlledDemo />
    </View>
  );
}

export function TooltipMaxWidth(): React.ReactElement {
  return (
    <View style={column}>
      <Caption>Tap each button. maxWidth constrains long copy to wrap.</Caption>
      <View style={row}>
        <Tooltip content="Short tooltip text" side="bottom" {...CLICK}>
          <Button>Default width</Button>
        </Tooltip>
        <Tooltip
          content="This is a tooltip with a much longer text that demonstrates the max-width constraint. The content will wrap to multiple lines when it exceeds the maximum width."
          maxWidth={200}
          side="bottom"
          {...CLICK}
        >
          <Button>maxWidth: 200</Button>
        </Tooltip>
      </View>
    </View>
  );
}

export function TooltipMotion(): React.ReactElement {
  const [subtle, setSubtle] = useState(false);
  const role = useSurfaceTokens('neutral');

  return (
    <View style={column}>
      <Checkbox
        label="Subtle motion (opacity-only, faster timing)"
        selected={subtle}
        onSelectedChange={setSubtle}
      />
      <Caption>
        Tap any position button to study entrance/exit motion. Subtle skips transform slide.
      </Caption>
      <View
        style={{
          gap: tokens.spacing['7'],
          padding: tokens.spacing['10'],
          alignSelf: 'stretch',
        }}
      >
        {POSITION_ROWS.map((positions) => (
          <View
            key={positions[0]}
            style={{ flexDirection: 'row', gap: tokens.spacing['7'], alignSelf: 'stretch' }}
          >
            {positions.map((position) => (
              <View
                key={position}
                style={{
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: tokens.spacing['24'],
                  minWidth: tokens.spacing['20'],
                }}
              >
                <Tooltip content="Tooltip" position={position} subtle={subtle} {...CLICK}>
                  <Button attention="high">{position}</Button>
                </Tooltip>
              </View>
            ))}
          </View>
        ))}
      </View>
      {!subtle ? (
        <Text style={{ fontSize: typography.size.xs, color: role.content.low }}>
          Moderate motion: 5px slide + fade (matches web Tooltip.module.css).
        </Text>
      ) : null}
    </View>
  );
}

export function TooltipLongContent(): React.ReactElement {
  return (
    <View style={[column, { gap: tokens.spacing['8'] }]}>
      <View style={{ gap: tokens.spacing['3'], flex: 1, minWidth: tokens.spacing['40'] }}>
        <Caption>Default — no maxWidth (single line, may extend past preview).</Caption>
        <Tooltip content={LONG_TOOLTIP_TEXT} side="bottom" {...CLICK}>
          <Button>Click — default</Button>
        </Tooltip>
      </View>
      <View style={{ gap: tokens.spacing['3'], flex: 1, minWidth: tokens.spacing['40'] }}>
        <Caption>With maxWidth (wraps inside token width).</Caption>
        <Tooltip
          content={LONG_TOOLTIP_TEXT}
          maxWidth={tokens.spacing['40']}
          side="bottom"
          {...CLICK}
        >
          <Button>Click — maxWidth</Button>
        </Tooltip>
      </View>
    </View>
  );
}

export function TooltipPortal(): React.ReactElement {
  return (
    <View style={column}>
      <Caption>
        Native renders the popup as a trigger-relative sibling (no root Modal portal). Tap to open —
        popup stays anchored to the button inside scroll content.
      </Caption>
      <Tooltip content="Inline anchor — popup relative to trigger." side="bottom" {...CLICK}>
        <Button>Click to open</Button>
      </Tooltip>
    </View>
  );
}

export function TooltipInsideBoldSurface(): React.ReactElement {
  return (
    <Surface
      mode="bold"
      appearance="primary"
      style={{
        padding: tokens.spacing['4-5'],
        borderRadius: tokens.shape.l,
        alignSelf: 'flex-start',
      }}
    >
      <Tooltip content="Tooltip on a bold surface" {...CLICK}>
        <Button variant="bold">Click me</Button>
      </Tooltip>
    </Surface>
  );
}

export function TooltipInsideSubtleSurface(): React.ReactElement {
  return (
    <Surface
      mode="subtle"
      appearance="primary"
      style={{
        padding: tokens.spacing['4-5'],
        borderRadius: tokens.shape.l,
        alignSelf: 'flex-start',
      }}
    >
      <Tooltip content="Tooltip on a subtle surface" {...CLICK}>
        <Button variant="subtle">Click me</Button>
      </Tooltip>
    </Surface>
  );
}

export function TooltipSurfaceContext(): React.ReactElement {
  const modes = ['default', 'minimal', 'subtle', 'moderate', 'bold', 'elevated'] as const;
  return (
    <View
      style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: tokens.spacing['4'],
        alignSelf: 'stretch',
      }}
    >
      {modes.map((mode) => (
        <Surface
          key={mode}
          mode={mode}
          appearance="primary"
          style={{
            padding: tokens.spacing['4-5'],
            borderRadius: tokens.shape.l,
            alignItems: 'center',
            minWidth: tokens.spacing['28'],
          }}
        >
          <Tooltip content={`Tooltip on ${mode}`} {...CLICK}>
            <Button variant={mode === 'bold' ? 'bold' : 'subtle'}>{mode}</Button>
          </Tooltip>
        </Surface>
      ))}
    </View>
  );
}
