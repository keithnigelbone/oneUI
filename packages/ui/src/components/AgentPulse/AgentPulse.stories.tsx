/**
 * AgentPulse.stories.tsx
 * Storybook documentation for the AgentPulse component.
 */

import type { Meta, StoryObj } from '@storybook/react-vite';
import React, { useEffect, useState } from 'react';
import { AgentPulse } from './AgentPulse';
import {
  AgentPulseDefault,
  AgentPulseEmphasis,
  AgentPulseSizesFull,
  AgentPulseSurfaceContext,
} from './AgentPulse.showcase';
import {
  AGENT_PULSE_APPEARANCES,
  AGENT_PULSE_EMPHASIS_LEVELS,
  AGENT_PULSE_SIZES,
  AGENT_PULSE_STATES,
  type AgentPulseState,
} from './AgentPulse.shared';
import {
  getMicError,
  getSpeakingError,
  isAudioUnlocked,
  isSpeakingActive,
  onAudioStateChange,
  stopAll,
  unlockAudio,
} from './agentPulseAudio';

const APPEARANCES = [
  'primary',
  'secondary',
  'sparkle',
  'positive',
  'negative',
  'warning',
  'informative',
] as const;

const meta: Meta<typeof AgentPulse> = {
  title: 'Components/Feedback/AgentPulse [WIP]',
  component: AgentPulse,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Animated brand-coloured indicator for the four canonical agent states (idle, listening, thinking, speaking). Pure CSS + SVG (no Lottie). Listening and speaking are driven by real audio: a shared mic stream and a shared playback element. Every AgentPulse on the page pulses in sync from the same source.',
      },
    },
  },
  argTypes: {
    state: {
      control: 'select',
      options: AGENT_PULSE_STATES,
      description: 'Agent state — drives which animation loop plays.',
      table: { defaultValue: { summary: 'idle' } },
    },
    appearance: {
      control: 'select',
      options: [...AGENT_PULSE_APPEARANCES, 'positive', 'negative', 'warning', 'informative'],
      description: 'Multi-accent role — recolours the animation at runtime.',
      table: { defaultValue: { summary: 'secondary' } },
    },
    emphasis: {
      control: 'select',
      options: AGENT_PULSE_EMPHASIS_LEVELS,
      description: 'Tinted colour emphasis (Agent pulse is always tinted).',
      table: { defaultValue: { summary: 'tinted' } },
    },
    size: {
      control: 'select',
      options: [...AGENT_PULSE_SIZES, 'sm', 'md', 'lg', 'xl'],
      description: 'Figma dimension token (legacy sm/md/lg/xl still accepted).',
      table: { defaultValue: { summary: 'md' } },
    },
    reducedMotionFallback: {
      control: 'select',
      options: ['static', 'pulse', 'none'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof AgentPulse>;

// ============================================================================
// Audio toolbar — single user gesture unlocks the shared mic + speaking
// playback. Browsers require both `getUserMedia` and `audio.play()` to
// originate from a click, so we trigger them together here. Re-renders
// when the singleton's state changes via `onAudioStateChange`.
// ============================================================================

function useAudioState() {
  const [, force] = useState(0);
  useEffect(() => onAudioStateChange(() => force((n) => n + 1)), []);
  return {
    unlocked: isAudioUnlocked(),
    speakingActive: isSpeakingActive(),
    micError: getMicError(),
    speakingError: getSpeakingError(),
  };
}

const toolbarStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--Spacing-3)',
  marginBottom: 'var(--Spacing-5)',
  fontFamily: 'var(--Typography-Font-Primary)',
  fontSize: 'var(--Label-S-FontSize)',
  lineHeight: 'var(--Label-S-LineHeight)',
  color: 'var(--Text-Medium)',
};

const buttonStyle: React.CSSProperties = {
  appearance: 'none',
  border: 'none',
  borderRadius: 'var(--Shape-Pill)',
  padding: 'var(--Spacing-2) var(--Spacing-4)',
  background: 'var(--Primary-Bold)',
  color: 'var(--Primary-Bold-High)',
  fontFamily: 'var(--Typography-Font-Primary)',
  fontSize: 'var(--Label-S-FontSize)',
  lineHeight: 'var(--Label-S-LineHeight)',
  fontWeight: 'var(--Label-FontWeight-Medium)',
  cursor: 'pointer',
};

const errorStyle: React.CSSProperties = {
  color: 'var(--Negative-High, #c00)',
  fontFamily: 'var(--Typography-Font-Primary)',
  fontSize: 'var(--Label-S-FontSize)',
  lineHeight: 'var(--Label-S-LineHeight)',
};

function AgentPulseAudioToolbar() {
  const { unlocked, speakingActive, micError, speakingError } = useAudioState();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-2)' }}>
      <div style={toolbarStyle}>
        {unlocked ? (
          <>
            <span>
              Mic live · Speaking audio {speakingActive ? 'playing' : 'paused (no speaking instance on screen)'}.
            </span>
            <button type="button" style={buttonStyle} onClick={() => stopAll()}>
              Stop audio
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              style={buttonStyle}
              onClick={() => void unlockAudio()}
            >
              Enable audio demos
            </button>
            <span>Audio file plays only while the speaking state is on screen.</span>
          </>
        )}
      </div>
      {(micError || speakingError) && (
        <div style={errorStyle} role="alert">
          {micError && <div>Microphone: {micError}</div>}
          {speakingError && <div>Audio file: {speakingError}</div>}
        </div>
      )}
    </div>
  );
}

function WithAudioToolbar({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <AgentPulseAudioToolbar />
      {children}
    </div>
  );
}

// ============================================================================
// Stories.
// ============================================================================

export const Default: Story = {
  args: {
    state: 'idle',
    appearance: 'secondary',
    emphasis: 'tinted',
    size: 'md',
  },
};

export const DefaultAllStates: Story = {
  name: 'Default — all states',
  render: () => <AgentPulseDefault />,
};

export const Sizes: Story = {
  name: 'All sizes',
  render: () => <AgentPulseSizesFull />,
};

export const Emphasis: Story = {
  name: 'Emphasis levels',
  render: () => <AgentPulseEmphasis />,
};

export const OnSurfaceContext: Story = {
  name: 'On surface context',
  render: () => <AgentPulseSurfaceContext />,
};

export const Appearances: Story = {
  name: 'All appearance roles',
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, auto)',
        gap: 'var(--Spacing-6)',
      }}
    >
      {APPEARANCES.map((appearance) => (
        <div
          key={appearance}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'var(--Spacing-3)',
          }}
        >
          <AgentPulse
            state="thinking"
            appearance={appearance}
            emphasis="tinted"
            size="lg"
          />
          <span
            style={{
              fontFamily: 'var(--Typography-Font-Primary)',
              fontSize: 'var(--Label-XS-FontSize)',
              lineHeight: 'var(--Label-XS-LineHeight)',
              color: 'var(--Text-Low)',
            }}
          >
            {appearance}
          </span>
        </div>
      ))}
    </div>
  ),
};

export const StateMachine: Story = {
  name: 'Live state machine',
  render: () => {
    const states: AgentPulseState[] = ['idle', 'listening', 'thinking', 'speaking'];
    const [index, setIndex] = useState(0);
    useEffect(() => {
      const id = setInterval(() => setIndex((i) => (i + 1) % states.length), 2500);
      return () => clearInterval(id);
    }, []);
    return (
      <WithAudioToolbar>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'var(--Spacing-4)',
          }}
        >
          <AgentPulse state={states[index]} size="xl" />
          <span
            style={{
              fontFamily: 'var(--Typography-Font-Primary)',
              fontSize: 'var(--Label-S-FontSize)',
              lineHeight: 'var(--Label-S-LineHeight)',
              color: 'var(--Text-Medium)',
              textTransform: 'capitalize',
            }}
          >
            State: {states[index]}
          </span>
        </div>
      </WithAudioToolbar>
    );
  },
};

export const Paused: Story = {
  args: { state: 'thinking', size: 'lg', paused: true },
};

export const ReducedMotionPulse: Story = {
  name: 'Reduced motion (pulse fallback)',
  args: { state: 'thinking', size: 'lg', reducedMotionFallback: 'pulse' },
  parameters: {
    docs: {
      description: {
        story:
          'Toggle "Reduce Motion" in your OS to see this fallback render in place of the SVG animation.',
      },
    },
  },
};

// ============================================================================
// Motion (CSS) — uses the real <AgentPulse> + shared audio singletons.
// The stage selector flips between idle / listening / thinking / speaking;
// the audio toolbar above unlocks the shared mic + speaking playback so
// listening and speaking become audio-reactive.
// ============================================================================

export const Motion: StoryObj<{ stage: AgentPulseState }> = {
  name: 'Motion (CSS)',
  args: {
    stage: 'idle',
  },
  argTypes: {
    stage: {
      control: { type: 'radio' },
      options: ['idle', 'listening', 'thinking', 'speaking'],
      description:
        'Agent stage — flips between idle / listening / thinking / speaking. idle → listening and listening → thinking are animated bridge transitions; other changes snap.',
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          'Same <AgentPulse> component used by every other story. Click **Enable audio demos** above to wire the shared mic into listening and the shared speaking-audio source into speaking. Every AgentPulse instance on the page (including the ones in "All states" and "Live state machine") will react in sync from the same audio.',
      },
    },
  },
  render: (args) => (
    <WithAudioToolbar>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'var(--Spacing-L)',
        }}
      >
        <AgentPulse state={args.stage} size="xl" />
        <span
          style={{
            fontFamily: 'var(--Typography-Font-Primary)',
            fontSize: 'var(--Label-S-FontSize)',
            lineHeight: 'var(--Label-S-LineHeight)',
            color: 'var(--Text-Low)',
            textTransform: 'capitalize',
          }}
        >
          {args.stage}
        </span>
      </div>
    </WithAudioToolbar>
  ),
};
