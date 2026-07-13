/**
 * InputField.stories.tsx
 *
 * Storybook documentation for the InputField aggregator (label, slots, feedback, dynamic text, Field validation).
 */

import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { InputField } from './InputField';
import type { InputAppearance, InputSize } from '../Input/Input.shared';
import React from 'react';
import {
  InputFieldSizes,
  InputFieldStates,
  InputFieldWithSlots,
  InputFieldAppearances,
  InputFieldAttentions,
  InputFeedbackShowcase,
  InputDynamicTextShowcase,
  InputFieldFullComposition,
  InputFieldSlotsComposition,
  InputFieldShapes,
  InputFieldSurfaceContext,
  InputFieldSearch,
} from '../Input/Input.showcase';

const SlotIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
    <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" fill="currentColor" />
  </svg>
);

type InputFieldStoryArgs = {
  placeholder?: string;
  label?: string;
  description?: string;
  size?: number | string;
  appearance?: string;
  shape?: 'default' | 'pill';
  attention?: 'medium' | 'high';
  start?: boolean;
  end?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  error?: string;
  type?: string;
  dynamicText?: string;
};

const meta = {
  title: 'Components/Inputs/InputField',
  component: InputField as any,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    controls: {},
    docs: {
      description: {
        component:
          'Full text field: optional `label` / `labelSlot`, bordered input (same DNA as **Input**), `error` / `feedback`, `dynamicText` / `helperButton` / `dynamicTextSlot`, and Base UI `Field` validation (`validationMode`, `validate`). Stack gap matches Figma `.DNA/InputField` (4298:6330). For the bordered box only (no label or messages), see **Components/Inputs/Input**.',
      },
    },
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['xs', 's', 'm', 'l'],
      description: 'Component size — XS, S, M, L',
      table: { defaultValue: { summary: 'm' } },
    },
    appearance: {
      control: 'select',
      options: [
        'auto', 'primary', 'secondary', 'neutral', 'sparkle',
        'positive', 'negative', 'warning', 'informative',
      ],
      description: 'Multi-accent appearance role',
      table: { defaultValue: { summary: 'auto' } },
    },
    shape: {
      control: 'radio',
      options: ['default', 'pill'],
      table: { defaultValue: { summary: 'default' } },
    },
    attention: {
      control: 'radio',
      options: ['medium', 'high'],
      description: 'Visual attention — medium (outlined) or high (filled neutral background)',
      table: { defaultValue: { summary: 'medium' } },
    },
    start: { control: 'boolean', description: 'Toggle start slot icon' },
    end: { control: 'boolean', description: 'Toggle end slot icon' },
    disabled: { control: 'boolean' },
    readOnly: { control: 'boolean' },
    required: { control: 'boolean' },
    placeholder: { control: 'text' },
    label: { control: 'text' },
    description: { control: 'text' },
    error: { control: 'text' },
    dynamicText: { control: 'text' },
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'tel', 'url', 'search'],
      table: { defaultValue: { summary: 'text' } },
    },
  },
} satisfies Meta<InputFieldStoryArgs>;

export default meta;
type Story = StoryObj<InputFieldStoryArgs>;

export const Default: Story = {
  args: {
    placeholder: 'Placeholder',
    label: 'Label',
    size: 'm',
    appearance: 'auto',
    shape: 'default',
    attention: 'medium',
    start: false,
    end: false,
    disabled: false,
    readOnly: false,
    required: false,
    type: 'text',
  },
  render: ({ start: showStart, end: showEnd, size, appearance, attention, dynamicText, ...args }: InputFieldStoryArgs) => (
    <div style={{ width: 348 }}>
      <InputField
        {...args}
        size={size as InputSize}
        appearance={appearance as InputAppearance}
        attention={attention}
        start={showStart ? <SlotIcon /> : undefined}
        end={showEnd ? <SlotIcon /> : undefined}
        dynamicText={dynamicText || undefined}
      />
    </div>
  ),
};

export const Sizes: Story = {
  render: () => <div style={{ width: 348 }}><InputFieldSizes /></div>,
  parameters: { docs: { description: { story: 'Four sizes: XS (f6), S (f8), M (f10), L (f12). Radius tokens flow through the dimension cascade so the output stays in sync across platforms.' } } },
};

export const Attentions: Story = {
  render: () => <div style={{ width: 348 }}><InputFieldAttentions /></div>,
  parameters: {
    docs: {
      description: {
        story: 'Attention levels: medium (outlined, default) and high (filled). The filled variant uses the role\'s Subtle token for its background and adapts on colored surfaces via the surface context cascade.',
      },
    },
  },
};

export const States: Story = {
  render: () => <InputFieldStates />,
  parameters: { layout: 'padded', docs: { description: { story: 'All visual states: idle, filled, disabled, read-only, error, description, required.' } } },
};

export const WithSlots: Story = {
  render: () => <div style={{ width: 348 }}><InputFieldWithSlots /></div>,
  parameters: { docs: { description: { story: '4-slot system: start, start2, end, end2.' } } },
};

export const Appearances: Story = {
  render: () => <InputFieldAppearances />,
  parameters: { layout: 'padded', docs: { description: { story: 'All 8 multi-accent appearance roles.' } } },
};

export const Feedback: Story = {
  render: () => <div style={{ width: 500 }}><InputFeedbackShowcase /></div>,
  parameters: {
    docs: {
      description: {
        story:
          'InputFeedback matrix (aggregated). For isolated API docs see **Components/Inputs/Input/Internals/InputFeedback**.',
      },
    },
  },
};

export const DynamicTextRow: Story = {
  render: () => <div style={{ width: 348 }}><InputDynamicTextShowcase /></div>,
  parameters: {
    docs: {
      description: {
        story:
          'Figma DynamicText row. For isolated controls see **Components/Inputs/Input/Internals/InputDynamicText**.',
      },
    },
  },
};

export const FullComposition: Story = {
  render: () => <div style={{ width: 348 }}><InputFieldFullComposition /></div>,
  parameters: { docs: { description: { story: 'Label + description, feedback, and DynamicText row — matches Figma stack order.' } } },
};

export const FigmaSlots: Story = {
  name: 'Figma slots (label / feedback / dynamic)',
  render: () => <div style={{ width: 348 }}><InputFieldSlotsComposition /></div>,
  parameters: {
    docs: {
      description: {
        story:
          'Uses `labelSlot`, `feedback` (`InputFeedback`), and `dynamicTextSlot` (`InputDynamicText`) per Figma `.DNA/InputField` (4298:6330).',
      },
    },
  },
};

export const Shapes: Story = {
  render: () => <div style={{ width: 348 }}><InputFieldShapes /></div>,
  parameters: { docs: { description: { story: 'Default vs pill shapes.' } } },
};

export const Search: Story = {
  render: () => <div style={{ width: 400 }}><InputFieldSearch /></div>,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story:
          '4-slot system variations rendered as search patterns — mirrors the Figma DNA frame at node 4306:7247. Shows every combination of start / start2 / end / end2 with leading search icons, trailing voice/clear/filter IconButtons, avatars, chevrons, currency prefixes, unit suffixes, and per-size composition.',
      },
    },
  },
};

export const SurfaceContext: Story = {
  render: () => <InputFieldSurfaceContext />,
  parameters: {
    layout: 'padded',
    docs: { description: { story: 'Input adapts on all 6 surface modes. Secondary fill overrides ensure surface backgrounds use the secondary appearance role, matching the input\'s own appearance.' } },
  },
};

const inputFieldMotionCSS = `
  @keyframes inputFeedbackEnterSubtle {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes inputFeedbackExitSubtle {
    from { opacity: 1; }
    to { opacity: 0; }
  }
  /* data-oneui-input-feedback-slot — stable hook; .feedbackSlot is CSS-module hashed */
  .inputfield-motion-subtle [data-oneui-input-feedback-slot]:not([data-exiting]) [data-oneui-input-feedback] {
    animation: inputFeedbackEnterSubtle var(--Motion-Duration-L) var(--Motion-Easing-Entrance-Moderate) both !important;
    transform: none !important;
  }
  .inputfield-motion-subtle [data-oneui-input-feedback-slot][data-exiting] [data-oneui-input-feedback] {
    animation: inputFeedbackExitSubtle var(--Motion-Duration-M) var(--Motion-Easing-Exit-Moderate) both !important;
    transform: none !important;
  }
`;

const inputFieldMotionControlStyle: React.CSSProperties = {
  padding: 'var(--Spacing-1) var(--Spacing-3-5)',
  borderRadius: 'var(--Shape-3)',
  border: 'var(--Stroke-M) solid var(--Primary-Stroke-Low)',
  background: 'var(--Primary-Subtle)',
  color: 'var(--Text-High)',
  cursor: 'pointer',
  fontSize: 'var(--Label-XS-FontSize)',
  lineHeight: 'var(--Label-XS-LineHeight)',
  fontFamily: 'var(--Typography-Font-Primary, inherit)',
};

function InputFieldMotionDemo({
  size = 'm',
  attention = 'medium',
  reducedMotion = false,
}: {
  size?: InputSize;
  attention?: 'medium' | 'high';
  reducedMotion?: boolean;
}) {
  const [error, setError] = React.useState<string | undefined>(undefined);
  const [value, setValue] = React.useState('Filled value');

  return (
    <>
      <style>{inputFieldMotionCSS}</style>
      <div
        className={`story-column${reducedMotion ? ' inputfield-motion-subtle' : ''}`}
        style={{ gap: 'var(--Spacing-4)', alignItems: 'center', width: 348 }}
      >
        <div className="story-row" style={{ gap: 'var(--Spacing-2)', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setError('This field is required.')}
            style={inputFieldMotionControlStyle}
          >
            Show feedback
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setError(undefined)}
            style={inputFieldMotionControlStyle}
          >
            Clear
          </button>
        </div>

        <InputField
          label="Label"
          placeholder="Placeholder"
          size={size}
          attention={attention}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          error={error}
        />
      </div>
    </>
  );
}

export const Motion: Story = {
  name: 'Motion',
  parameters: {
    docs: {
      source: {
        language: 'css',
        code: `/* Enter: L + Entrance-Moderate | Exit: M + Exit-Moderate (reversed motion) */

.feedbackSlot:not([data-exiting]) [data-oneui-input-feedback] {
  animation: inputFeedbackEnter var(--Motion-Duration-L) var(--Motion-Easing-Entrance-Moderate) both;
}

.feedbackSlot[data-exiting] [data-oneui-input-feedback] {
  animation: inputFeedbackExit var(--Motion-Duration-M) var(--Motion-Easing-Exit-Moderate) both;
}`,
      },
      description: {
        story:
          '**InputField** reserves a feedback row so the input stays fixed. Feedback **enters** (opacity `0` → `1`, `−8px` → `0`) with **Motion-Duration-L** + **Entrance-Moderate**; **exits** with the reverse motion using **Motion-Duration-M** + **Exit-Moderate**. Toggle **Subtle motion** to preview reduced-motion behaviour (opacity only, no translate).',
      },
    },
  },
  args: {
    size: 'm',
    attention: 'medium',
    subtleMotion: false,
  } as InputFieldStoryArgs & { subtleMotion?: boolean },
  argTypes: {
    subtleMotion: {
      name: 'Subtle motion',
      control: 'boolean',
      description: 'Opacity-only feedback motion (accessibility / reduced motion demo)',
      table: {
        category: 'Accessibility',
        defaultValue: { summary: 'false' },
      },
    },
  } as any,
  render: (args: InputFieldStoryArgs & { subtleMotion?: boolean }) => (
    <InputFieldMotionDemo
      size={args.size as InputSize}
      attention={args.attention}
      reducedMotion={args.subtleMotion}
    />
  ),
  play: async ({ canvasElement, args }: { canvasElement: HTMLElement; args: { subtleMotion?: boolean } }) => {
    if (!args.subtleMotion) return;

    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Show feedback' }));

    canvasElement.querySelectorAll('[data-oneui-input-feedback]').forEach((el) => {
      const styles = getComputedStyle(el);
      expect(styles.transform, 'Feedback must not translate in subtle motion').toBe('none');
      expect(styles.animationName, 'Feedback uses opacity-only entrance in subtle motion').toContain('inputFeedbackEnterSubtle');
      expect(styles.opacity, 'Feedback should be visible after entrance').not.toBe('0');
    });
  },
};
