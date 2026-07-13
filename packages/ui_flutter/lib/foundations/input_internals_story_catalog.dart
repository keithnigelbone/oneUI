import 'package:flutter/material.dart';

import 'input_field_showcase.dart';
import 'input_internals_showcase.dart';

/// Active subtree under `Components/Inputs/Input/Internals/*`.
enum InputInternalsComponent {
  dynamicText,
  feedback,
}

/// `Components/Inputs/Input/Internals/InputDynamicText/*` — React Storybook parity.
enum InputDynamicTextFoundationStory {
  docs,
  defaultStory,
  liveRegion,
  figmaSizes,
  showcase,
  surfaceContext,
}

const List<InputDynamicTextFoundationStory> kInputDynamicTextStoryNavOrder = [
  InputDynamicTextFoundationStory.docs,
  InputDynamicTextFoundationStory.defaultStory,
  InputDynamicTextFoundationStory.liveRegion,
  InputDynamicTextFoundationStory.figmaSizes,
  InputDynamicTextFoundationStory.showcase,
  InputDynamicTextFoundationStory.surfaceContext,
];

extension InputDynamicTextFoundationStoryMeta
    on InputDynamicTextFoundationStory {
  String get title => switch (this) {
        InputDynamicTextFoundationStory.docs => 'Docs',
        InputDynamicTextFoundationStory.defaultStory => 'Default',
        InputDynamicTextFoundationStory.liveRegion =>
          'Leading copy with polite live region',
        InputDynamicTextFoundationStory.figmaSizes => 'Figma sizes (S / M / L)',
        InputDynamicTextFoundationStory.showcase => 'Showcase',
        InputDynamicTextFoundationStory.surfaceContext => 'Surface context',
      };

  String get description => switch (this) {
        InputDynamicTextFoundationStory.docs =>
          'Figma `.DNA/DynamicText`: optional content (Body / Text-Medium) and optional '
              'trailing `Button` (`attention="low"`, `condensed`).',
        InputDynamicTextFoundationStory.defaultStory =>
          'Default args: size m, character count + helper button.',
        InputDynamicTextFoundationStory.liveRegion =>
          'Leading copy uses `aria-live="polite"` for screen reader updates.',
        InputDynamicTextFoundationStory.figmaSizes =>
          'S / M / L row sizes with matching trailing button scale.',
        InputDynamicTextFoundationStory.showcase =>
          'Content-only, end-only, both, and size matrix.',
        InputDynamicTextFoundationStory.surfaceContext =>
          'Leading copy + helper button on default, bold, and subtle surfaces.',
      };

  Widget Function(BuildContext) get buildSection => switch (this) {
        InputDynamicTextFoundationStory.docs => (_) => const SizedBox.shrink(),
        InputDynamicTextFoundationStory.defaultStory => (_) =>
            const SizedBox.shrink(),
        InputDynamicTextFoundationStory.liveRegion =>
          inputDynamicTextLiveRegionSection,
        InputDynamicTextFoundationStory.figmaSizes =>
          inputDynamicTextFigmaSizesSection,
        InputDynamicTextFoundationStory.showcase =>
          inputDynamicTextShowcaseSection,
        InputDynamicTextFoundationStory.surfaceContext =>
          inputDynamicTextSurfaceContextSection,
      };
}

/// `Components/Inputs/Input/Internals/InputFeedback/*` — React Storybook parity.
enum InputFeedbackFoundationStory {
  docs,
  defaultStory,
  variantsAndAttention,
  customIcon,
  roles,
  surfaceContext,
}

const List<InputFeedbackFoundationStory> kInputFeedbackStoryNavOrder = [
  InputFeedbackFoundationStory.docs,
  InputFeedbackFoundationStory.defaultStory,
  InputFeedbackFoundationStory.variantsAndAttention,
  InputFeedbackFoundationStory.customIcon,
  InputFeedbackFoundationStory.roles,
  InputFeedbackFoundationStory.surfaceContext,
];

extension InputFeedbackFoundationStoryMeta on InputFeedbackFoundationStory {
  String get title => switch (this) {
        InputFeedbackFoundationStory.docs => 'Docs',
        InputFeedbackFoundationStory.defaultStory => 'Default',
        InputFeedbackFoundationStory.variantsAndAttention =>
          'Variants × attention × size',
        InputFeedbackFoundationStory.customIcon => 'Custom icon',
        InputFeedbackFoundationStory.roles => 'Roles (alert vs status)',
        InputFeedbackFoundationStory.surfaceContext => 'Surface context',
      };

  String get description => switch (this) {
        InputFeedbackFoundationStory.docs =>
          'Semantic feedback for inputs: four variants, three attention levels, S/M/L sizes.',
        InputFeedbackFoundationStory.defaultStory =>
          'Negative / low / m with default error icon.',
        InputFeedbackFoundationStory.variantsAndAttention =>
          'Full matrix of variant × attention × size.',
        InputFeedbackFoundationStory.customIcon =>
          'Override default semantic icon per variant.',
        InputFeedbackFoundationStory.roles =>
          'Negative uses alert semantics; positive uses status.',
        InputFeedbackFoundationStory.surfaceContext =>
          'Variant × attention rows inside secondary Surface modes.',
      };

  Widget Function(BuildContext) get buildSection => switch (this) {
        InputFeedbackFoundationStory.docs => (_) => const SizedBox.shrink(),
        InputFeedbackFoundationStory.defaultStory => (_) =>
            const SizedBox.shrink(),
        InputFeedbackFoundationStory.variantsAndAttention =>
          inputFeedbackShowcaseSection,
        InputFeedbackFoundationStory.customIcon =>
          inputFeedbackCustomIconSection,
        InputFeedbackFoundationStory.roles => inputFeedbackRolesSection,
        InputFeedbackFoundationStory.surfaceContext =>
          inputFeedbackSurfaceContextSection,
      };
}
