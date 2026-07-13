import 'package:flutter/material.dart';

import '../engine/text_style_resolve.dart';
import '../theme/one_ui_scope.dart';
import 'dimensions_resolve.dart';
import 'input_internals_brand_bind.dart';
import '../widgets/one_ui_icon.dart';
import '../widgets/one_ui_surface.dart';
import '../widgets/one_ui_input.dart';
import '../widgets/one_ui_input_dynamic_text.dart';
import '../widgets/one_ui_input_dynamic_text_types.dart';
import '../widgets/one_ui_input_feedback.dart';
import '../widgets/one_ui_input_feedback_types.dart';
import '../widgets/one_ui_input_types.dart';
import '../widgets/one_ui_text_types.dart';

const _demoWidth = 348.0;

Widget _internalsDemo(Widget child) =>
    SizedBox(width: _demoWidth, child: child);

Widget _sectionLabel(BuildContext context, String text) {
  final style = resolveOneUiTextTypographyStyle(
    context,
    variant: OneUiTextVariant.label,
    size: 'XS',
    weight: OneUiTextWeight.low,
  )?.copyWith(color: Theme.of(context).colorScheme.onSurfaceVariant);
  return Text(text, style: style);
}

/// Mirrors `InputDynamicText.stories.tsx` LiveRegion story.
Widget inputDynamicTextLiveRegionSection(BuildContext context) {
  bindInputInternalsBrandScope(context);
  return _internalsDemo(
    OneUiInputDynamicText(
      key: ValueKey('live-${inputInternalsBrandScopeKey(context)}'),
      size: OneUiInputLabelSize.m,
      content: 'Updating: 12 / 100 characters',
      end: 'Clear',
      ariaLive: OneUiInputDynamicTextAriaLive.polite,
    ),
  );
}

/// Mirrors `InputDynamicText.stories.tsx` FigmaSizes story.
Widget inputDynamicTextFigmaSizesSection(BuildContext context) {
  bindInputInternalsBrandScope(context);
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      for (final row in [
        (OneUiInputLabelSize.s, 'S'),
        (OneUiInputLabelSize.m, 'M'),
        (OneUiInputLabelSize.l, 'L'),
      ]) ...[
        _internalsDemo(
          OneUiInputDynamicText(
            key: ValueKey(
                'figma-${row.$2}-${inputInternalsBrandScopeKey(context)}'),
            size: row.$1,
            content: 'Dynamic text',
            end: 'Helper Button',
          ),
        ),
        const SizedBox(height: 12),
      ],
    ],
  );
}

/// Mirrors `InputDynamicTextShowcase` in `Input.showcase.tsx`.
Widget inputDynamicTextShowcaseSection(BuildContext context) {
  bindInputInternalsBrandScope(context);
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      _sectionLabel(context, 'Dynamic text only'),
      _internalsDemo(
        OneUiInputDynamicText(
          key: ValueKey('dyn-only-${inputInternalsBrandScopeKey(context)}'),
          size: OneUiInputLabelSize.m,
          content: '0/100 characters',
        ),
      ),
      const SizedBox(height: 16),
      _sectionLabel(context, 'End button only'),
      _internalsDemo(
        OneUiInputDynamicText(
          key: ValueKey('end-only-${inputInternalsBrandScopeKey(context)}'),
          size: OneUiInputLabelSize.m,
          end: 'Help',
        ),
      ),
      const SizedBox(height: 16),
      _sectionLabel(context, 'Both'),
      _internalsDemo(
        OneUiInputDynamicText(
          key: ValueKey('both-${inputInternalsBrandScopeKey(context)}'),
          size: OneUiInputLabelSize.m,
          content: '0/100 characters',
          end: 'Learn more',
        ),
      ),
      const SizedBox(height: 16),
      _sectionLabel(context, 'Sizes (S / M / L)'),
      for (final row in [
        (OneUiInputLabelSize.s, 'S'),
        (OneUiInputLabelSize.m, 'M'),
        (OneUiInputLabelSize.l, 'L'),
      ]) ...[
        _internalsDemo(
          OneUiInputDynamicText(
            key: ValueKey(
                'size-${row.$2}-${inputInternalsBrandScopeKey(context)}'),
            size: row.$1,
            content: 'Dynamic text (${row.$2})',
            end: 'Helper Button',
          ),
        ),
        const SizedBox(height: 8),
      ],
    ],
  );
}

/// Mirrors `InputFeedbackShowcase` in `Input.showcase.tsx`.
Widget inputFeedbackShowcaseSection(BuildContext context) {
  bindInputInternalsBrandScope(context);
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      for (final variant in kOneUiInputFeedbackVariants) ...[
        _sectionLabel(context, variant.name),
        const SizedBox(height: 8),
        for (final size in kOneUiInputFeedbackSizes) ...[
          _sectionLabel(context, 'size: ${size.wireValue}'),
          Wrap(
            spacing: 12,
            runSpacing: 8,
            children: [
              for (final attention in kOneUiInputFeedbackAttentions)
                SizedBox(
                  width: _demoWidth,
                  child: OneUiInputFeedback(
                    key: ValueKey(
                      'fb-${variant.name}-${attention.name}-${size.wireValue}-'
                      '${inputInternalsBrandScopeKey(context)}',
                    ),
                    variant: variant,
                    attention: attention,
                    size: size,
                    feedbackMessage: 'Feedback message',
                  ),
                ),
            ],
          ),
          const SizedBox(height: 12),
        ],
        const SizedBox(height: 8),
      ],
    ],
  );
}

/// Mirrors `InputFeedback.stories.tsx` CustomIcon story.
Widget inputFeedbackCustomIconSection(BuildContext context) {
  bindInputInternalsBrandScope(context);
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      _internalsDemo(
        OneUiInputFeedback(
          key: ValueKey('custom-help-${inputInternalsBrandScopeKey(context)}'),
          variant: OneUiInputFeedbackVariant.informative,
          attention: OneUiInputFeedbackAttention.medium,
          feedbackMessage: 'Replaced default info icon with help.',
          customIcon: const OneUiIcon(
            icon: 'help',
            size: '4',
            excludeFromSemantics: true,
          ),
        ),
      ),
      const SizedBox(height: 12),
      _internalsDemo(
        OneUiInputFeedback(
          key: ValueKey('custom-lock-${inputInternalsBrandScopeKey(context)}'),
          variant: OneUiInputFeedbackVariant.negative,
          attention: OneUiInputFeedbackAttention.low,
          feedbackMessage: 'Using lock instead of error.',
          customIcon: const OneUiIcon(
            icon: 'lock',
            size: '4',
            excludeFromSemantics: true,
          ),
        ),
      ),
    ],
  );
}

/// Mirrors `InputFeedback.stories.tsx` Roles story.
Widget inputFeedbackRolesSection(BuildContext context) {
  bindInputInternalsBrandScope(context);
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      _internalsDemo(
        OneUiInputFeedback(
          key: ValueKey('role-neg-${inputInternalsBrandScopeKey(context)}'),
          variant: OneUiInputFeedbackVariant.negative,
          feedbackMessage: 'Negative uses alert semantics.',
        ),
      ),
      const SizedBox(height: 12),
      _internalsDemo(
        OneUiInputFeedback(
          key: ValueKey('role-pos-${inputInternalsBrandScopeKey(context)}'),
          variant: OneUiInputFeedbackVariant.positive,
          feedbackMessage: 'Positive uses status semantics.',
        ),
      ),
    ],
  );
}

/// Feedback rows on secondary surfaces — web `InputFeedbackSurfaceContext`.
Widget inputFeedbackSurfaceContextSection(BuildContext context) {
  bindInputInternalsBrandScope(context);
  final scope = OneUiScope.of(context);
  final pad = resolveSpacingPx(
    designSystem: scope.designSystem,
    platformsConfig: scope.platformsFoundationConfig,
    platformId: scope.platformId,
    density: scope.density,
    spacingName: '4-5',
  );
  final gap = resolveSpacingPx(
    designSystem: scope.designSystem,
    platformsConfig: scope.platformsFoundationConfig,
    platformId: scope.platformId,
    density: scope.density,
    spacingName: '3',
  );

  const modes = [
    ('default', 'page background'),
    ('minimal', 'light tint'),
    ('subtle', 'medium tint'),
    ('bold', 'full accent fill'),
  ];

  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      for (final row in modes) ...[
        _sectionLabel(context, '${row.$1} — ${row.$2}'),
        const SizedBox(height: 8),
        OneUiSurface(
          mode: row.$1,
          appearance: 'secondary',
          padding: EdgeInsets.all(pad),
          borderRadius: BorderRadius.circular(12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              OneUiInputFeedback(
                key: ValueKey(
                    'fb-neg-${row.$1}-${inputInternalsBrandScopeKey(context)}'),
                variant: OneUiInputFeedbackVariant.negative,
                feedbackMessage: 'Negative low',
              ),
              SizedBox(height: gap),
              OneUiInputFeedback(
                variant: OneUiInputFeedbackVariant.positive,
                attention: OneUiInputFeedbackAttention.medium,
                feedbackMessage: 'Positive medium',
              ),
              SizedBox(height: gap),
              OneUiInputFeedback(
                variant: OneUiInputFeedbackVariant.warning,
                attention: OneUiInputFeedbackAttention.high,
                feedbackMessage: 'Warning high',
              ),
            ],
          ),
        ),
        const SizedBox(height: 20),
      ],
    ],
  );
}

/// Dynamic text on default vs bold/subtle surfaces.
Widget inputDynamicTextSurfaceContextSection(BuildContext context) {
  bindInputInternalsBrandScope(context);
  final scope = OneUiScope.of(context);
  final pad = resolveSpacingPx(
    designSystem: scope.designSystem,
    platformsConfig: scope.platformsFoundationConfig,
    platformId: scope.platformId,
    density: scope.density,
    spacingName: '4',
  );

  Widget surfaceBlock(String mode, Widget child) {
    return OneUiSurface(
      mode: mode,
      appearance: 'secondary',
      padding: EdgeInsets.all(pad),
      borderRadius: BorderRadius.circular(12),
      child: child,
    );
  }

  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      _sectionLabel(context, 'Default surface'),
      const SizedBox(height: 8),
      _internalsDemo(
        OneUiInputDynamicText(
          key: ValueKey('dyn-def-${inputInternalsBrandScopeKey(context)}'),
          size: OneUiInputLabelSize.m,
          content: '0 / 100 characters',
          end: 'Helper Button',
        ),
      ),
      const SizedBox(height: 16),
      _sectionLabel(context, 'Bold surface'),
      const SizedBox(height: 8),
      surfaceBlock(
        'bold',
        OneUiInputDynamicText(
          size: OneUiInputLabelSize.m,
          content: 'Dynamic text on bold',
          end: 'Helper Button',
        ),
      ),
      const SizedBox(height: 16),
      _sectionLabel(context, 'Subtle surface'),
      const SizedBox(height: 8),
      surfaceBlock(
        'subtle',
        OneUiInputDynamicText(
          size: OneUiInputLabelSize.m,
          content: 'Dynamic text on subtle',
          end: 'Helper Button',
        ),
      ),
    ],
  );
}
