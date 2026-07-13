import 'package:flutter/material.dart';

import 'input_field_showcase.dart';
import 'input_showcase.dart';

/// Top-level `Components/Inputs/Input/*` stories (excluding Internals subtree).
enum InputFoundationStory {
  docs,
  defaultStory,
  withLabelAndDescription,
  withExternalLabel,
  sizes,
  appearances,
  attentionLevels,
  withSlots,
  states,
  shapes,
  fullComposition,
  slotsComposition,
  search,
  controlled,
  inputSurfaceContext,
  fieldSurfaceContext,
  inputFieldDefault,
  inputFieldWithError,
  inputFieldControlled,
}

const List<InputFoundationStory> kInputStoryNavOrder = [
  InputFoundationStory.docs,
  InputFoundationStory.defaultStory,
  InputFoundationStory.withLabelAndDescription,
  InputFoundationStory.withExternalLabel,
  InputFoundationStory.sizes,
  InputFoundationStory.appearances,
  InputFoundationStory.attentionLevels,
  InputFoundationStory.withSlots,
  InputFoundationStory.states,
  InputFoundationStory.shapes,
  InputFoundationStory.fullComposition,
  InputFoundationStory.slotsComposition,
  InputFoundationStory.search,
  InputFoundationStory.controlled,
  InputFoundationStory.inputSurfaceContext,
  InputFoundationStory.fieldSurfaceContext,
  InputFoundationStory.inputFieldDefault,
  InputFoundationStory.inputFieldWithError,
  InputFoundationStory.inputFieldControlled,
];

extension InputFoundationStoryMeta on InputFoundationStory {
  String get title => switch (this) {
        InputFoundationStory.docs => 'Docs',
        InputFoundationStory.defaultStory => 'Default',
        InputFoundationStory.withLabelAndDescription =>
          'With Label And Description',
        InputFoundationStory.withExternalLabel => 'With external label (a11y)',
        InputFoundationStory.sizes => 'Sizes',
        InputFoundationStory.appearances => 'Appearances',
        InputFoundationStory.attentionLevels => 'Attention Levels',
        InputFoundationStory.withSlots => 'With Slots',
        InputFoundationStory.states => 'States',
        InputFoundationStory.shapes => 'Shapes',
        InputFoundationStory.fullComposition => 'Full composition',
        InputFoundationStory.slotsComposition =>
          'Figma slots (label / feedback / dynamic)',
        InputFoundationStory.search => 'Search',
        InputFoundationStory.controlled => 'Controlled',
        InputFoundationStory.inputSurfaceContext => 'Input surface context',
        InputFoundationStory.fieldSurfaceContext => 'Field surface context',
        InputFoundationStory.inputFieldDefault => 'InputField Default',
        InputFoundationStory.inputFieldWithError => 'InputField Error',
        InputFoundationStory.inputFieldControlled => 'InputField Controlled',
      };

  String get description => switch (this) {
        InputFoundationStory.docs =>
          'Input family overview — web/RN Storybook parity.',
        InputFoundationStory.defaultStory =>
          'Placeholder only, medium size, auto appearance.',
        InputFoundationStory.withLabelAndDescription =>
          'Native label + description stack.',
        InputFoundationStory.withExternalLabel =>
          'Visible label outside OneUiInput (web labelAssociation / field-owned label).',
        InputFoundationStory.sizes =>
          'S / M / L (f8 / f10 / f12) with slot icons.',
        InputFoundationStory.appearances =>
          'All nine multi-accent appearance roles.',
        InputFoundationStory.attentionLevels =>
          'Medium (outlined) vs high (filled).',
        InputFoundationStory.withSlots =>
          'start / start2 / end / end2 slot grid.',
        InputFoundationStory.states =>
          'Default, disabled, read-only, error highlight.',
        InputFoundationStory.shapes => 'Default radius vs pill.',
        InputFoundationStory.fullComposition =>
          'Label + description + feedback + dynamic row — Figma InputField stack.',
        InputFoundationStory.slotsComposition =>
          'Composed feedback and dynamic rows under the bordered input.',
        InputFoundationStory.search =>
          'Pill search patterns and S/M/L size row with matched trailing IconButton sizes.',
        InputFoundationStory.controlled =>
          'Round-trips value through onChange.',
        InputFoundationStory.inputSurfaceContext =>
          'Inputs inside OneUiSurface modes — token remapping parity.',
        InputFoundationStory.fieldSurfaceContext =>
          'Outlined and filled inputs on secondary Surface modes (default → bold).',
        InputFoundationStory.inputFieldDefault =>
          'Label + description + bordered input.',
        InputFoundationStory.inputFieldWithError =>
          'Invalid chrome + paired negative InputFeedback.',
        InputFoundationStory.inputFieldControlled =>
          'Controlled value + dynamic text + helper action.',
      };

  Widget Function(BuildContext) get buildSection => switch (this) {
        InputFoundationStory.docs => (_) => const SizedBox.shrink(),
        InputFoundationStory.defaultStory => inputDefaultSection,
        InputFoundationStory.withLabelAndDescription =>
          inputWithLabelAndDescriptionSection,
        InputFoundationStory.withExternalLabel => inputWithExternalLabelSection,
        InputFoundationStory.sizes => inputSizesSection,
        InputFoundationStory.appearances => inputAppearancesSection,
        InputFoundationStory.attentionLevels => inputAttentionSection,
        InputFoundationStory.withSlots => inputWithSlotsSection,
        InputFoundationStory.states => inputStatesSection,
        InputFoundationStory.shapes => inputShapesSection,
        InputFoundationStory.fullComposition =>
          inputFieldFullCompositionSection,
        InputFoundationStory.slotsComposition => inputFieldFigmaSlotsSection,
        InputFoundationStory.search => inputFieldSearchSection,
        InputFoundationStory.controlled => inputControlledSection,
        InputFoundationStory.inputSurfaceContext => inputSurfaceContextSection,
        InputFoundationStory.fieldSurfaceContext =>
          inputFieldSurfaceContextSection,
        InputFoundationStory.inputFieldDefault => inputFieldDefaultSection,
        InputFoundationStory.inputFieldWithError => inputFieldWithErrorSection,
        InputFoundationStory.inputFieldControlled =>
          inputFieldControlledSection,
      };
}
