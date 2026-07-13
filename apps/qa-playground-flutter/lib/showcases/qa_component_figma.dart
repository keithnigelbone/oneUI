import 'package:flutter/material.dart';
import 'package:ui_flutter/storybook.dart';

class QaFigmaBand {
  const QaFigmaBand({
    required this.title,
    required this.subtitle,
    required this.child,
  });

  final String title;
  final String subtitle;
  final Widget child;
}

List<QaFigmaBand> qaFigmaValidationForSlug(String slug) {
  switch (slug) {
    case 'checkbox':
      return [
        QaFigmaBand(
          title: 'Sizes matrix',
          subtitle: 'Figma size rows — S / M / L',
          child: CheckboxFoundationsPage(story: CheckboxFoundationStory.sizes),
        ),
        QaFigmaBand(
          title: 'States matrix',
          subtitle: 'Unchecked / checked / indeterminate / disabled',
          child: CheckboxFoundationsPage(story: CheckboxFoundationStory.states),
        ),
        QaFigmaBand(
          title: 'Appearances',
          subtitle: 'Configured appearance roles on the brand',
          child: CheckboxFoundationsPage(story: CheckboxFoundationStory.appearances),
        ),
        QaFigmaBand(
          title: 'Focus state',
          subtitle: 'Informative focus halo via forceFocusRing',
          child: CheckboxFoundationsPage(story: CheckboxFoundationStory.focusState),
        ),
      ];
    case 'checkbox-field':
      return [
        QaFigmaBand(
          title: 'Sizes',
          subtitle: 'Field size tokens',
          child: CheckboxFieldFoundationsPage(story: CheckboxFieldFoundationStory.sizes),
        ),
        QaFigmaBand(
          title: 'States',
          subtitle: 'Invalid, disabled, required',
          child: CheckboxFieldFoundationsPage(story: CheckboxFieldFoundationStory.states),
        ),
      ];
    case 'button':
      return [
        QaFigmaBand(
          title: 'Attention levels',
          subtitle: 'High / medium / low attention mapping',
          child: ButtonFoundationsPage(story: ButtonFoundationStory.attentionLevels),
        ),
        QaFigmaBand(
          title: 'Sizes',
          subtitle: 'Size tokens XS–L',
          child: ButtonFoundationsPage(story: ButtonFoundationStory.sizes),
        ),
        QaFigmaBand(
          title: 'Appearances',
          subtitle: 'Multi-accent role fills',
          child: ButtonFoundationsPage(story: ButtonFoundationStory.appearances),
        ),
        QaFigmaBand(
          title: 'Focus state',
          subtitle: 'Focus halo on interactive variants',
          child: ButtonFoundationsPage(story: ButtonFoundationStory.focusState),
        ),
      ];
    case 'input':
      return [
        QaFigmaBand(
          title: 'Sizes',
          subtitle: 'Input height matrix',
          child: InputFoundationsPage(story: InputFoundationStory.sizes),
        ),
        QaFigmaBand(
          title: 'States',
          subtitle: 'Disabled, read-only, invalid',
          child: InputFoundationsPage(story: InputFoundationStory.states),
        ),
        QaFigmaBand(
          title: 'Appearances',
          subtitle: 'Role-based fills',
          child: InputFoundationsPage(story: InputFoundationStory.appearances),
        ),
      ];
    case 'input-field':
      return [
        QaFigmaBand(
          title: 'Sizes',
          subtitle: 'Field + input size matrix',
          child: InputFieldFoundationsPage(story: InputFieldFoundationStory.sizes),
        ),
        QaFigmaBand(
          title: 'States',
          subtitle: 'Validation and disabled states',
          child: InputFieldFoundationsPage(story: InputFieldFoundationStory.states),
        ),
        QaFigmaBand(
          title: 'Figma slots',
          subtitle: 'Start/end slot composition grid',
          child: InputFieldFoundationsPage(story: InputFieldFoundationStory.figmaSlots),
        ),
      ];
    case 'input-dynamic-text':
      return [
        QaFigmaBand(
          title: 'Figma sizes',
          subtitle: 'S / M / L dynamic text rows',
          child: InputDynamicTextFoundationsPage(story: InputDynamicTextFoundationStory.figmaSizes),
        ),
      ];
    case 'input-feedback':
      return [
        QaFigmaBand(
          title: 'Variants and attention',
          subtitle: 'Alert vs status × attention levels',
          child: InputFeedbackFoundationsPage(story: InputFeedbackFoundationStory.variantsAndAttention),
        ),
        QaFigmaBand(
          title: 'Roles',
          subtitle: 'Semantic feedback appearances',
          child: InputFeedbackFoundationsPage(story: InputFeedbackFoundationStory.roles),
        ),
      ];
    case 'radio':
      return [
        QaFigmaBand(
          title: 'Sizes',
          subtitle: 'S / M / L radio dots',
          child: RadioFoundationsPage(story: RadioFoundationStory.sizes),
        ),
        QaFigmaBand(
          title: 'States',
          subtitle: 'Checked, disabled, read-only',
          child: RadioFoundationsPage(story: RadioFoundationStory.states),
        ),
        QaFigmaBand(
          title: 'Appearances',
          subtitle: 'Multi-accent roles',
          child: RadioFoundationsPage(story: RadioFoundationStory.appearances),
        ),
      ];
    case 'radio-field':
      return [
        QaFigmaBand(
          title: 'Multi options',
          subtitle: 'Radio group field layout',
          child: RadioFieldFoundationsPage(story: RadioFieldFoundationStory.multiOptions),
        ),
        QaFigmaBand(
          title: 'Disabled',
          subtitle: 'Disabled field blocks selection',
          child: RadioFieldFoundationsPage(story: RadioFieldFoundationStory.disabled),
        ),
      ];
    case 'chip':
      return [
        QaFigmaBand(
          title: 'Attention levels',
          subtitle: 'High / medium / low fills',
          child: ChipFoundationsPage(story: ChipFoundationStory.attentionLevels),
        ),
        QaFigmaBand(
          title: 'Sizes',
          subtitle: 'S / M / L chip heights',
          child: ChipFoundationsPage(story: ChipFoundationStory.sizes),
        ),
        QaFigmaBand(
          title: 'States',
          subtitle: 'Selected and disabled',
          child: ChipFoundationsPage(story: ChipFoundationStory.states),
        ),
      ];
    case 'chip-group':
      return [
        QaFigmaBand(
          title: 'Variants',
          subtitle: 'Single vs multi selection',
          child: ChipGroupFoundationsPage(story: ChipGroupFoundationStory.variants),
        ),
        QaFigmaBand(
          title: 'Sizes',
          subtitle: 'Group size tokens',
          child: ChipGroupFoundationsPage(story: ChipGroupFoundationStory.sizes),
        ),
      ];
    case 'badge':
      return [
        QaFigmaBand(
          title: 'Sizes',
          subtitle: 'XS through XL',
          child: BadgeFoundationsPage(story: BadgeFoundationStory.sizes),
        ),
        QaFigmaBand(
          title: 'Figma slot matrix',
          subtitle: 'Slot composition grid',
          child: BadgeFoundationsPage(story: BadgeFoundationStory.figmaSlotMatrix),
        ),
        QaFigmaBand(
          title: 'Appearances',
          subtitle: 'Role-based badge fills',
          child: BadgeFoundationsPage(story: BadgeFoundationStory.appearances),
        ),
      ];
    case 'counter-badge':
      return [
        QaFigmaBand(
          title: 'Sizes',
          subtitle: 'XS / S / M count pills',
          child: CounterBadgeFoundationsPage(story: CounterBadgeFoundationStory.sizes),
        ),
        QaFigmaBand(
          title: 'Max value',
          subtitle: 'Cap display at max (99+)',
          child: CounterBadgeFoundationsPage(story: CounterBadgeFoundationStory.maxValue),
        ),
      ];
    case 'indicator-badge':
      return [
        QaFigmaBand(
          title: 'Sizes',
          subtitle: 'S / M / L dot diameters',
          child: IndicatorBadgeFoundationsPage(story: IndicatorBadgeFoundationStory.sizes),
        ),
        QaFigmaBand(
          title: 'Appearances',
          subtitle: 'Status role colours',
          child: IndicatorBadgeFoundationsPage(story: IndicatorBadgeFoundationStory.appearances),
        ),
      ];
    case 'avatar':
      return [
        QaFigmaBand(
          title: 'Sizes',
          subtitle: '2XS through 2XL',
          child: AvatarFoundationsPage(story: AvatarFoundationStory.sizes),
        ),
        QaFigmaBand(
          title: 'Variants',
          subtitle: 'Image, icon, text (initials)',
          child: AvatarFoundationsPage(story: AvatarFoundationStory.variants),
        ),
        QaFigmaBand(
          title: 'Attention levels',
          subtitle: 'High / medium / low',
          child: AvatarFoundationsPage(story: AvatarFoundationStory.attentionLevels),
        ),
      ];
    case 'text':
      return [
        QaFigmaBand(
          title: 'Variants',
          subtitle: 'Display through code roles',
          child: TextFoundationsPage(story: TextFoundationStory.variants),
        ),
        QaFigmaBand(
          title: 'Sizes',
          subtitle: 'Per-role size scale',
          child: TextFoundationsPage(story: TextFoundationStory.sizes),
        ),
      ];
    case 'image':
      return [
        QaFigmaBand(
          title: 'Aspect ratios',
          subtitle: 'All 12 presets (1:1 … 21:9)',
          child: ImageFoundationsPage(story: ImageFoundationStory.aspectRatios),
        ),
        QaFigmaBand(
          title: 'Object fit',
          subtitle: 'cover / contain / fill / none / scale-down',
          child: ImageFoundationsPage(story: ImageFoundationStory.objectFitModes),
        ),
        QaFigmaBand(
          title: 'States',
          subtitle: 'Default / interactive / disabled / error',
          child: ImageFoundationsPage(story: ImageFoundationStory.states),
        ),
        QaFigmaBand(
          title: 'With fallback',
          subtitle: 'Broken src → icon / custom / fallbackSrc',
          child: ImageFoundationsPage(story: ImageFoundationStory.withFallback),
        ),
        QaFigmaBand(
          title: 'Corner radius',
          subtitle: 'Shape token scale on the clip',
          child: ImageFoundationsPage(story: ImageFoundationStory.cornerRadius),
        ),
        QaFigmaBand(
          title: 'Interactive',
          subtitle: 'Pressable image with focus ring',
          child: ImageFoundationsPage(story: ImageFoundationStory.interactive),
        ),
      ];
    case 'icon':
      return [
        QaFigmaBand(
          title: 'Sizes',
          subtitle: 'F-step icon sizes',
          child: IconFoundationsPage(story: IconFoundationStory.sizes),
        ),
        QaFigmaBand(
          title: 'Appearances',
          subtitle: 'Role-based colours',
          child: IconFoundationsPage(story: IconFoundationStory.appearances),
        ),
      ];
    case 'icon-contained':
      return [
        QaFigmaBand(
          title: 'Attention levels',
          subtitle: 'Bold / subtle / ghost',
          child: IconContainedFoundationsPage(story: IconContainedFoundationStory.attentionLevels),
        ),
        QaFigmaBand(
          title: 'Sizes',
          subtitle: 'Container size matrix',
          child: IconContainedFoundationsPage(story: IconContainedFoundationStory.sizes),
        ),
      ];
    case 'icon-button':
      return [
        QaFigmaBand(
          title: 'Attention levels',
          subtitle: 'Bold / subtle / ghost',
          child: IconButtonFoundationsPage(story: IconButtonFoundationStory.attentionLevels),
        ),
        QaFigmaBand(
          title: 'Sizes',
          subtitle: 'Container size matrix',
          child: IconButtonFoundationsPage(story: IconButtonFoundationStory.sizes),
        ),
        QaFigmaBand(
          title: 'Loading',
          subtitle: 'Spinner replaces icon',
          child: IconButtonFoundationsPage(story: IconButtonFoundationStory.loadingStates),
        ),
      ];
    case 'circular-progress-indicator':
      return [
        QaFigmaBand(
          title: 'Variants',
          subtitle: 'Indeterminate vs determinate',
          child: CircularProgressIndicatorFoundationsPage(
            story: CircularProgressIndicatorFoundationStory.variants,
          ),
        ),
        QaFigmaBand(
          title: 'Sizes',
          subtitle: 'S / M / L ring diameters',
          child: CircularProgressIndicatorFoundationsPage(
            story: CircularProgressIndicatorFoundationStory.sizes,
          ),
        ),
        QaFigmaBand(
          title: 'Appearances',
          subtitle: 'Role-based stroke colours',
          child: CircularProgressIndicatorFoundationsPage(
            story: CircularProgressIndicatorFoundationStory.appearances,
          ),
        ),
      ];
    case 'linear-progress-indicator':
      return [
        QaFigmaBand(
          title: 'Types',
          subtitle: 'Determinate vs indeterminate',
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              LinearProgressIndicatorFoundationsPage(
                story: LinearProgressIndicatorFoundationStory.determinate,
              ),
              const SizedBox(height: 16),
              LinearProgressIndicatorFoundationsPage(
                story: LinearProgressIndicatorFoundationStory.indeterminate,
              ),
            ],
          ),
        ),
        QaFigmaBand(
          title: 'Sizes',
          subtitle: 'S / M / L track heights',
          child: LinearProgressIndicatorFoundationsPage(
            story: LinearProgressIndicatorFoundationStory.sizes,
          ),
        ),
        QaFigmaBand(
          title: 'Caps',
          subtitle: 'roundCaps true / false',
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              LinearProgressIndicatorFoundationsPage(
                story: LinearProgressIndicatorFoundationStory.roundCaps,
              ),
              const SizedBox(height: 16),
              LinearProgressIndicatorFoundationsPage(
                story: LinearProgressIndicatorFoundationStory.flatCaps,
              ),
            ],
          ),
        ),
        QaFigmaBand(
          title: 'Appearances',
          subtitle: 'Multi-accent colour roles',
          child: LinearProgressIndicatorFoundationsPage(
            story: LinearProgressIndicatorFoundationStory.appearances,
          ),
        ),
        QaFigmaBand(
          title: 'All variants',
          subtitle: 'det/indet × round/flat × S/M/L matrix',
          child: LinearProgressIndicatorFoundationsPage(
            story: LinearProgressIndicatorFoundationStory.allVariants,
          ),
        ),
      ];
    case 'bottom-navigation':
      return [
        QaFigmaBand(
          title: 'Label types',
          subtitle: 'Figma Label COMPONENT_SET — 1line / 2line / none',
          child: BottomNavigationFoundationsPage(
            story: BottomNavigationFoundationStory.labelTypes,
          ),
        ),
        QaFigmaBand(
          title: 'Item counts',
          subtitle: 'Figma Items — 2 / 3 / 4 / 5 children',
          child: BottomNavigationFoundationsPage(
            story: BottomNavigationFoundationStory.itemCounts,
          ),
        ),
        QaFigmaBand(
          title: 'Appearances',
          subtitle: 'Multi-accent rows — auto through informative',
          child: BottomNavigationFoundationsPage(
            story: BottomNavigationFoundationStory.appearances,
          ),
        ),
        QaFigmaBand(
          title: 'States',
          subtitle: 'Active, disabled, and divider toggle',
          child: BottomNavigationFoundationsPage(
            story: BottomNavigationFoundationStory.states,
          ),
        ),
      ];
    case 'divider':
      return [
        QaFigmaBand(
          title: 'Orientation',
          subtitle: 'orientation: horizontal / vertical stroke tokens',
          child: DividerFoundationsPage(story: DividerFoundationStory.orientations),
        ),
        QaFigmaBand(
          title: 'Size',
          subtitle: 'size: S / M / L → --Stroke-S/M/L (0.5 / 1 / 1.5px)',
          child: DividerFoundationsPage(story: DividerFoundationStory.sizes),
        ),
        QaFigmaBand(
          title: 'Attention',
          subtitle: 'attention: high / medium / low — stroke colour tier',
          child: DividerFoundationsPage(story: DividerFoundationStory.attentionLevels),
        ),
        QaFigmaBand(
          title: 'Round caps',
          subtitle: 'roundCaps: true (Figma default) / false',
          child: DividerFoundationsPage(story: DividerFoundationStory.roundCaps),
        ),
        QaFigmaBand(
          title: 'Slot — icon',
          subtitle: 'slot: icon × contentAlign center / start / end',
          child: DividerFoundationsPage(story: DividerFoundationStory.withIcon),
        ),
        QaFigmaBand(
          title: 'Slot — label',
          subtitle: 'slot: label × contentAlign center / start / end',
          child: DividerFoundationsPage(story: DividerFoundationStory.withLabel),
        ),
        QaFigmaBand(
          title: 'Surface context',
          subtitle: 'neutral → primary stroke remap inside Surface modes',
          child: DividerFoundationsPage(story: DividerFoundationStory.surfaceContext),
        ),
        QaFigmaBand(
          title: 'Vertical sizes',
          subtitle: 'vertical orientation × S / M / L stroke',
          child: DividerFoundationsPage(story: DividerFoundationStory.verticalSizes),
        ),
      ];
    case 'logo':
      return [
        QaFigmaBand(
          title: 'Sizes',
          subtitle: 'Figma size — XS / S / M / L / XL + custom',
          child: LogoFoundationsPage(story: LogoFoundationStory.sizes),
        ),
        QaFigmaBand(
          title: 'Variants',
          subtitle: 'Mark (circular) vs full wordmark',
          child: LogoFoundationsPage(story: LogoFoundationStory.variants),
        ),
        QaFigmaBand(
          title: 'Content sources',
          subtitle: 'children > svgContent > src',
          child: LogoFoundationsPage(story: LogoFoundationStory.contentSources),
        ),
        QaFigmaBand(
          title: 'Interactive',
          subtitle: 'Figma interactive=true — tappable with focus ring',
          child: LogoFoundationsPage(story: LogoFoundationStory.interactive),
        ),
        QaFigmaBand(
          title: 'Surface context',
          subtitle: 'currentColor remap across surface modes',
          child: LogoFoundationsPage(story: LogoFoundationStory.surfaceContext),
        ),
        QaFigmaBand(
          title: 'Image fallback',
          subtitle: 'Broken src and empty-content fallbacks',
          child: LogoFoundationsPage(story: LogoFoundationStory.imageFallback),
        ),
      ];
    case 'slider':
      return [
        QaFigmaBand(
          title: 'Types',
          subtitle: 'Figma type: continuous vs range',
          child: SliderFoundationsPage(story: SliderFoundationStory.types),
        ),
        QaFigmaBand(
          title: 'Knob styles',
          subtitle: 'Figma knobStyle: inside vs outside',
          child: SliderFoundationsPage(story: SliderFoundationStory.knobStyles),
        ),
        QaFigmaBand(
          title: 'With slots',
          subtitle: 'Figma start/end: iconButton',
          child: SliderFoundationsPage(story: SliderFoundationStory.withSlots),
        ),
        QaFigmaBand(
          title: 'Sizes',
          subtitle: 'Figma size s / m / l — track + knob scale',
          child: SliderFoundationsPage(story: SliderFoundationStory.sizes),
        ),
        QaFigmaBand(
          title: 'Dev-node matrix',
          subtitle: 'Figma size × type × knobStyle × slots',
          child: SliderFoundationsPage(story: SliderFoundationStory.figmaMatrix),
        ),
      ];
    case 'touch-slider':
      return [
        QaFigmaBand(
          title: 'Progress styles',
          subtitle: 'Figma progressStyle: rounded vs sharp at 0/50/100',
          child: TouchSliderFoundationsPage(
            story: TouchSliderFoundationStory.progressStyles,
          ),
        ),
        QaFigmaBand(
          title: 'Slot matrix',
          subtitle: 'Start icon at cap centre — horizontal/vertical × values',
          child: TouchSliderFoundationsPage(
            story: TouchSliderFoundationStory.slotMatrix,
          ),
        ),
        QaFigmaBand(
          title: 'Vertical',
          subtitle: 'Figma orientation: vertical × progressStyle',
          child: TouchSliderFoundationsPage(
            story: TouchSliderFoundationStory.vertical,
          ),
        ),
        QaFigmaBand(
          title: 'Appearances',
          subtitle: 'Figma appearance roles',
          child: TouchSliderFoundationsPage(
            story: TouchSliderFoundationStory.appearances,
          ),
        ),
      ];
    default:
      return const [];
  }
}

const Set<String> kQaFigmaValidationSlugs = {
  'checkbox',
  'checkbox-field',
  'button',
  'input',
  'input-field',
  'input-dynamic-text',
  'input-feedback',
  'radio',
  'radio-field',
  'chip',
  'chip-group',
  'badge',
  'counter-badge',
  'indicator-badge',
  'avatar',
  'text',
  'image',
  'icon',
  'icon-contained',
  'icon-button',
  'circular-progress-indicator',
  'linear-progress-indicator',
  'bottom-navigation',
  'divider',
  'logo',
  'slider',
  'touch-slider',
};

bool qaHasFigmaValidationTab(String slug) => kQaFigmaValidationSlugs.contains(slug);
