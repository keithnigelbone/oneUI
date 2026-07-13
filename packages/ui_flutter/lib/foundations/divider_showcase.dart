/// Divider showcase — `Divider.stories.tsx` / `Divider.showcase.tsx`.
library;

import 'package:flutter/material.dart';

import '../foundations/dimensions_resolve.dart';
import '../theme/one_ui_scope.dart';
import '../widgets/one_ui_divider.dart';
import '../widgets/one_ui_icon.dart';
import '../widgets/one_ui_surface.dart';
import '../widgets/one_ui_text.dart';
import '../widgets/one_ui_text_types.dart';

double _gap(BuildContext context, [String tail = '5']) {
  final scope = OneUiScope.of(context);
  return resolveSpacingPx(
    designSystem: scope.designSystem,
    platformsConfig: scope.platformsFoundationConfig,
    platformId: scope.platformId,
    density: scope.density,
    spacingName: tail,
  );
}

Widget _sectionLabel(BuildContext context, String text) {
  return OneUiText(
    variant: OneUiTextVariant.label,
    size: 'S',
    weight: OneUiTextWeight.low,
    attention: OneUiTextAttention.medium,
    text: text,
  );
}

Widget _labeledRow(BuildContext context, String label, Widget divider) {
  return Column(
    crossAxisAlignment: CrossAxisAlignment.stretch,
    children: [
      _sectionLabel(context, label),
      SizedBox(height: _gap(context, '3')),
      divider,
    ],
  );
}

Widget buildDividerDefaultPreview(BuildContext context) {
  return const Center(child: OneUiDivider());
}

Widget buildDividerOrientationsSection(BuildContext context) {
  final gap6 = _gap(context, '6');
  final h = _gap(context, '18');
  return SizedBox(
    height: h,
    child: Row(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Expanded(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _sectionLabel(context, 'Horizontal'),
              SizedBox(height: _gap(context, '3-5')),
              const OneUiDivider(),
            ],
          ),
        ),
        SizedBox(width: gap6),
        const OneUiDivider(orientation: kOneUiDividerVertical),
        SizedBox(width: gap6),
        Center(child: _sectionLabel(context, 'Vertical')),
      ],
    ),
  );
}

Widget buildDividerSizesSection(BuildContext context) {
  return Column(
    crossAxisAlignment: CrossAxisAlignment.stretch,
    children: [
      for (final size in [
        kOneUiDividerSizeS,
        kOneUiDividerSizeM,
        kOneUiDividerSizeL
      ])
        Padding(
          padding: EdgeInsets.only(bottom: _gap(context)),
          child: _labeledRow(
            context,
            'Size ${size.toUpperCase()}',
            OneUiDivider(size: size),
          ),
        ),
    ],
  );
}

Widget buildDividerAttentionLevelsSection(BuildContext context) {
  return Column(
    crossAxisAlignment: CrossAxisAlignment.stretch,
    children: [
      for (final attention in ['high', 'medium', 'low'])
        Padding(
          padding: EdgeInsets.only(bottom: _gap(context)),
          child: _labeledRow(
            context,
            attention[0].toUpperCase() + attention.substring(1),
            OneUiDivider(attention: attention),
          ),
        ),
    ],
  );
}

Widget buildDividerAttentionWithIconSection(BuildContext context) {
  return Column(
    crossAxisAlignment: CrossAxisAlignment.stretch,
    children: [
      for (final attention in ['high', 'medium', 'low'])
        Padding(
          padding: EdgeInsets.only(bottom: _gap(context)),
          child: _labeledRow(
            context,
            attention[0].toUpperCase() + attention.substring(1),
            OneUiDivider(
              content: kOneUiDividerContentIcon,
              attention: attention,
              child: const OneUiIcon(icon: 'star', excludeFromSemantics: true),
            ),
          ),
        ),
    ],
  );
}

Widget buildDividerAttentionWithTextSection(BuildContext context) {
  return Column(
    crossAxisAlignment: CrossAxisAlignment.stretch,
    children: [
      for (final attention in ['high', 'medium', 'low'])
        Padding(
          padding: EdgeInsets.only(bottom: _gap(context)),
          child: _labeledRow(
            context,
            attention[0].toUpperCase() + attention.substring(1),
            OneUiDivider(
              content: kOneUiDividerContentText,
              attention: attention,
              child: 'Section',
            ),
          ),
        ),
    ],
  );
}

Widget buildDividerWithIconSection(BuildContext context) {
  return Column(
    crossAxisAlignment: CrossAxisAlignment.stretch,
    children: [
      for (final align in [
        kOneUiDividerAlignStart,
        kOneUiDividerAlignCenter,
        kOneUiDividerAlignEnd,
      ])
        Padding(
          padding: EdgeInsets.only(bottom: _gap(context)),
          child: _labeledRow(
            context,
            align[0].toUpperCase() + align.substring(1),
            OneUiDivider(
              content: kOneUiDividerContentIcon,
              contentAlign: align,
              attention: 'medium',
              child: const OneUiIcon(icon: 'star', excludeFromSemantics: true),
            ),
          ),
        ),
    ],
  );
}

Widget buildDividerWithLabelSection(BuildContext context) {
  return Column(
    crossAxisAlignment: CrossAxisAlignment.stretch,
    children: [
      for (final align in [
        kOneUiDividerAlignStart,
        kOneUiDividerAlignCenter,
        kOneUiDividerAlignEnd,
      ])
        Padding(
          padding: EdgeInsets.only(bottom: _gap(context)),
          child: _labeledRow(
            context,
            align[0].toUpperCase() + align.substring(1),
            OneUiDivider(
              content: kOneUiDividerContentText,
              contentAlign: align,
              attention: 'medium',
              child: 'Section',
            ),
          ),
        ),
    ],
  );
}

Widget buildDividerRoundCapsSection(BuildContext context) {
  return Column(
    crossAxisAlignment: CrossAxisAlignment.stretch,
    children: [
      _labeledRow(
        context,
        'Round caps (default)',
        const OneUiDivider(size: kOneUiDividerSizeL, attention: 'high'),
      ),
      SizedBox(height: _gap(context)),
      _labeledRow(
        context,
        'Sharp caps',
        const OneUiDivider(
          size: kOneUiDividerSizeL,
          attention: 'high',
          roundCaps: false,
        ),
      ),
      SizedBox(height: _gap(context)),
      _labeledRow(
        context,
        'Round caps with label',
        const OneUiDivider(
          content: kOneUiDividerContentLabel,
          size: kOneUiDividerSizeL,
          attention: 'high',
          child: 'Section',
        ),
      ),
    ],
  );
}

Widget buildDividerSurfaceContextSection(BuildContext context) {
  final pad = _gap(context);
  return Column(
    crossAxisAlignment: CrossAxisAlignment.stretch,
    children: [
      _labeledRow(
        context,
        'Default surface',
        const OneUiDivider(
          content: kOneUiDividerContentText,
          attention: 'medium',
          child: 'Default',
        ),
      ),
      SizedBox(height: _gap(context, '6')),
      for (final mode in ['minimal', 'subtle', 'bold'])
        Padding(
          padding: EdgeInsets.only(bottom: _gap(context, '6')),
          child: OneUiSurface(
            mode: mode,
            borderRadius: BorderRadius.circular(_gap(context, '2')),
            child: Padding(
              padding: EdgeInsets.all(pad),
              child: _labeledRow(
                context,
                '${mode[0].toUpperCase()}${mode.substring(1)} surface',
                OneUiDivider(
                  content: kOneUiDividerContentText,
                  attention: 'medium',
                  child: 'On ${mode[0].toUpperCase()}${mode.substring(1)}',
                ),
              ),
            ),
          ),
        ),
    ],
  );
}

Widget buildDividerVerticalSizesSection(BuildContext context) {
  final gap7 = _gap(context, '7');
  return SizedBox(
    height: 200,
    child: Row(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        for (final size in [
          kOneUiDividerSizeS,
          kOneUiDividerSizeM,
          kOneUiDividerSizeL
        ])
          Expanded(
            child: Padding(
              padding: EdgeInsets.symmetric(horizontal: gap7 / 2),
              child: Column(
                children: [
                  _sectionLabel(context, size.toUpperCase()),
                  SizedBox(height: _gap(context, '3-5')),
                  Expanded(
                    child: OneUiDivider(
                      orientation: kOneUiDividerVertical,
                      size: size,
                    ),
                  ),
                ],
              ),
            ),
          ),
      ],
    ),
  );
}

Widget buildDividerVerticalAttentionSection(BuildContext context) {
  final gap7 = _gap(context, '7');
  return SizedBox(
    height: 200,
    child: Row(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        for (final attention in ['high', 'medium', 'low'])
          Expanded(
            child: Padding(
              padding: EdgeInsets.symmetric(horizontal: gap7 / 2),
              child: Column(
                children: [
                  _sectionLabel(context, attention),
                  SizedBox(height: _gap(context, '3-5')),
                  Expanded(
                    child: OneUiDivider(
                      orientation: kOneUiDividerVertical,
                      attention: attention,
                    ),
                  ),
                ],
              ),
            ),
          ),
      ],
    ),
  );
}

Widget buildDividerVerticalWithIconSection(BuildContext context) {
  final gap7 = _gap(context, '7');
  return SizedBox(
    height: 200,
    child: Row(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        for (final align in [
          kOneUiDividerAlignStart,
          kOneUiDividerAlignCenter,
          kOneUiDividerAlignEnd,
        ])
          Expanded(
            child: Padding(
              padding: EdgeInsets.symmetric(horizontal: gap7 / 2),
              child: Column(
                children: [
                  _sectionLabel(context, align),
                  SizedBox(height: _gap(context, '3-5')),
                  Expanded(
                    child: OneUiDivider(
                      orientation: kOneUiDividerVertical,
                      content: kOneUiDividerContentIcon,
                      contentAlign: align,
                      attention: 'medium',
                      child: const OneUiIcon(
                          icon: 'star', excludeFromSemantics: true),
                    ),
                  ),
                ],
              ),
            ),
          ),
      ],
    ),
  );
}

Widget buildDividerVerticalWithLabelSection(BuildContext context) {
  final gap7 = _gap(context, '7');
  return SizedBox(
    height: 200,
    child: Row(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        for (final align in [
          kOneUiDividerAlignStart,
          kOneUiDividerAlignCenter,
          kOneUiDividerAlignEnd,
        ])
          Expanded(
            child: Padding(
              padding: EdgeInsets.symmetric(horizontal: gap7 / 2),
              child: Column(
                children: [
                  _sectionLabel(context, align),
                  SizedBox(height: _gap(context, '3-5')),
                  Expanded(
                    child: OneUiDivider(
                      orientation: kOneUiDividerVertical,
                      content: kOneUiDividerContentText,
                      contentAlign: align,
                      attention: 'medium',
                      child: 'OR',
                    ),
                  ),
                ],
              ),
            ),
          ),
      ],
    ),
  );
}

Widget buildDividerVerticalInlineSection(BuildContext context) {
  final gap4 = _gap(context, '4');
  final gap45 = _gap(context, '4-5');
  final rowH = _gap(context, '7');
  final rowH2 = _gap(context, '9');
  final bodyS =
      OneUiScope.nativeTypographyOf(context)?.emphasisStyle('body', 'S') ??
          Theme.of(context).textTheme.bodySmall;

  Widget crumb(String label) => Text(label, style: bodyS);

  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      SizedBox(
        height: rowH,
        child: Row(
          children: [
            crumb('Home'),
            SizedBox(width: gap4),
            const OneUiDivider(orientation: kOneUiDividerVertical),
            SizedBox(width: gap4),
            crumb('Products'),
            SizedBox(width: gap4),
            const OneUiDivider(orientation: kOneUiDividerVertical),
            SizedBox(width: gap4),
            crumb('About'),
            SizedBox(width: gap4),
            const OneUiDivider(orientation: kOneUiDividerVertical),
            SizedBox(width: gap4),
            crumb('Contact'),
          ],
        ),
      ),
      SizedBox(height: _gap(context, '6')),
      SizedBox(
        height: rowH2,
        child: Row(
          children: [
            crumb('Section A'),
            SizedBox(width: gap45),
            const OneUiDivider(
              orientation: kOneUiDividerVertical,
              attention: 'high',
              size: kOneUiDividerSizeL,
            ),
            SizedBox(width: gap45),
            crumb('Section B'),
            SizedBox(width: gap4),
            const OneUiDivider(
              orientation: kOneUiDividerVertical,
              attention: 'medium',
            ),
            SizedBox(width: gap4),
            crumb('Section C'),
          ],
        ),
      ),
    ],
  );
}
