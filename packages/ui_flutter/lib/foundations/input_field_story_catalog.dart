import 'package:flutter/material.dart';

import 'input_field_showcase.dart';

/// Sidebar order — parity with web `Components/Inputs/InputField`.
enum InputFieldFoundationStory {
  docs,
  defaultStory,
  sizes,
  attentions,
  states,
  withSlots,
  appearances,
  feedback,
  dynamicTextRow,
  fullComposition,
  controlled,
  figmaSlots,
  shapes,
  search,
  surfaceContext,
}

const List<InputFieldFoundationStory> kInputFieldStoryNavOrder = [
  InputFieldFoundationStory.docs,
  InputFieldFoundationStory.defaultStory,
  InputFieldFoundationStory.sizes,
  InputFieldFoundationStory.attentions,
  InputFieldFoundationStory.states,
  InputFieldFoundationStory.withSlots,
  InputFieldFoundationStory.appearances,
  InputFieldFoundationStory.feedback,
  InputFieldFoundationStory.dynamicTextRow,
  InputFieldFoundationStory.fullComposition,
  InputFieldFoundationStory.controlled,
  InputFieldFoundationStory.figmaSlots,
  InputFieldFoundationStory.shapes,
  InputFieldFoundationStory.search,
  InputFieldFoundationStory.surfaceContext,
];

extension InputFieldFoundationStoryMeta on InputFieldFoundationStory {
  String get title => switch (this) {
        InputFieldFoundationStory.docs => 'Docs',
        InputFieldFoundationStory.defaultStory => 'Default',
        InputFieldFoundationStory.sizes => 'Sizes',
        InputFieldFoundationStory.attentions => 'Attentions',
        InputFieldFoundationStory.states => 'States',
        InputFieldFoundationStory.withSlots => 'WithSlots',
        InputFieldFoundationStory.appearances => 'Appearances',
        InputFieldFoundationStory.feedback => 'Feedback',
        InputFieldFoundationStory.dynamicTextRow => 'DynamicTextRow',
        InputFieldFoundationStory.fullComposition => 'FullComposition',
        InputFieldFoundationStory.controlled => 'Controlled',
        InputFieldFoundationStory.figmaSlots =>
          'Figma slots (label / feedback / dynamic)',
        InputFieldFoundationStory.shapes => 'Shapes',
        InputFieldFoundationStory.search => 'Search',
        InputFieldFoundationStory.surfaceContext => 'SurfaceContext',
      };

  String get description => switch (this) {
        InputFieldFoundationStory.docs =>
          'InputField aggregator — label, bordered input, feedback, dynamic row.',
        InputFieldFoundationStory.defaultStory =>
          'Label + placeholder, medium size, auto appearance.',
        InputFieldFoundationStory.sizes => 'S / M / L (f8 / f10 / f12).',
        InputFieldFoundationStory.attentions =>
          'Medium (outlined) vs high (filled).',
        InputFieldFoundationStory.states =>
          'Idle, filled, disabled, read-only, error, description, required.',
        InputFieldFoundationStory.withSlots =>
          'start / start2 / end / end2 slot grid.',
        InputFieldFoundationStory.appearances =>
          'All multi-accent appearance roles.',
        InputFieldFoundationStory.feedback =>
          'InputFeedback variant × attention × size matrix.',
        InputFieldFoundationStory.dynamicTextRow =>
          'Figma DynamicText row — content only, end button, both, S/M/L sizes.',
        InputFieldFoundationStory.fullComposition =>
          'Email (description, informative hint, dynamic row) + Password error.',
        InputFieldFoundationStory.controlled =>
          'Round-trips `value` through `onChange` (RN `InputFieldControlled`).',
        InputFieldFoundationStory.figmaSlots =>
          'Custom feedback + dynamicTextSlot (Figma 4298:6330).',
        InputFieldFoundationStory.shapes => 'Default vs pill bordered shell.',
        InputFieldFoundationStory.search =>
          'Search pill patterns — clear/voice two-slot, filter, sizes S/M/L, 4-slot catalog.',
        InputFieldFoundationStory.surfaceContext =>
          'Secondary Surface modes (default→bold) — medium outlined + high filled per row.',
      };

  Widget Function(BuildContext) get buildSection => switch (this) {
        InputFieldFoundationStory.docs => (_) => const SizedBox.shrink(),
        InputFieldFoundationStory.defaultStory => inputFieldDefaultSection,
        InputFieldFoundationStory.sizes => inputFieldSizesSection,
        InputFieldFoundationStory.attentions => inputFieldAttentionsSection,
        InputFieldFoundationStory.states => inputFieldStatesSection,
        InputFieldFoundationStory.withSlots => inputFieldWithSlotsSection,
        InputFieldFoundationStory.appearances => inputFieldAppearancesSection,
        InputFieldFoundationStory.feedback => inputFieldFeedbackSection,
        InputFieldFoundationStory.dynamicTextRow =>
          inputFieldDynamicTextSection,
        InputFieldFoundationStory.fullComposition =>
          inputFieldFullCompositionSection,
        InputFieldFoundationStory.controlled => inputFieldControlledSection,
        InputFieldFoundationStory.figmaSlots => inputFieldFigmaSlotsSection,
        InputFieldFoundationStory.shapes => inputFieldShapesSection,
        InputFieldFoundationStory.search => inputFieldSearchSection,
        InputFieldFoundationStory.surfaceContext =>
          inputFieldSurfaceContextSection,
      };
}
