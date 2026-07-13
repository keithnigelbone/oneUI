import '../engine/native_design_system_payload.dart';
import '../theme/one_ui_scope.dart';
import 'package:flutter/widgets.dart';

/// Expected Convex `designSystem.componentCustomProperties` keys for [OneUiButton].
///
/// Mirrors web `Button.module.css` + manifest defaults from `componentThemes.ts`.
/// Missing keys are listed for the Storybook **Convex coverage** story.
class ButtonConvexAudit {
  const ButtonConvexAudit({
    required this.present,
    required this.missing,
    required this.unresolved,
    required this.notes,
  });

  final List<String> present;
  final List<String> missing;
  final List<String> unresolved;
  final List<String> notes;

  bool get isComplete => missing.isEmpty && unresolved.isEmpty;

  static ButtonConvexAudit run(BuildContext context) {
    final ds = OneUiScope.designSystemOf(context);
    final typo = OneUiScope.nativeTypographyOf(context);
    final notes = <String>[];
    final present = <String>[];
    final missing = <String>[];
    final unresolved = <String>[];

    if (ds == null) {
      return ButtonConvexAudit(
        present: present,
        missing: ['designSystem (Convex getNativeThemeSnapshot schema ≥ 2)'],
        unresolved: unresolved,
        notes: [
          'Select a brand and deploy Convex `nativeTheme:getNativeThemeSnapshot` v2.',
        ],
      );
    }

    // Match [OneUiButton]: primitive `var(--Spacing-*)` resolution needs platform × density.
    final scope = OneUiScope.maybeOf(context);

    if (typo == null) {
      missing.add(
          'typography (snapshot.typography → OneUiScope.nativeTypography)');
    } else {
      present.add('typography');
    }

    void expectKey(String key, {bool length = true}) {
      final raw = ds.componentCustomProperties[key];
      if (raw == null) {
        missing.add(key);
        return;
      }
      present.add(key);
      if (!length) return;
      final resolved = ds.resolveCSSValue(
        raw,
        platformId: scope?.platformId,
        density: scope?.density,
        platformsConfig: scope?.platformsFoundationConfig,
        nativeTypography: typo,
      );
      if (resolved == null ||
          !NativeDesignSystemPayload.isConcreteCssValue(resolved)) {
        unresolved.add('$key → $raw');
      }
    }

    expectKey('--Button-borderRadius');
    {
      final rawBr = ds.componentCustomProperties['--Button-borderRadius'];
      if (rawBr != null) {
        final px = ds.resolveComponentLengthPxCascade(
          ['--Button-borderRadius'],
          platformId: scope?.platformId,
          density: scope?.density,
          platformsConfig: scope?.platformsFoundationConfig,
          nativeTypography: typo,
        );
        notes.add(
          '--Button-borderRadius raw=$rawBr → ${px != null ? "${px}px" : "?"} '
          '(Flutter `BorderRadius.circular`; web `Button.module.css` uses '
          '`--_btn-radius: var(--Button-borderRadius, var(--Shape-Pill))`). '
          'If this is a small px value, the brand Actions theme chose a non-pill '
          '`borderRadius` token — match React DevTools computed `--_btn-radius` here.',
        );
      }
    }
    expectKey('--Button-fontWeight');
    expectKey('--Button-textTransform', length: false);
    expectKey('--Button-letterSpacing', length: false);

    for (final sz in ['6', '8', '10', '12']) {
      final label = switch (sz) {
        '6' => 'XS',
        '8' => 'S',
        '10' => 'M',
        '12' => 'L',
        _ => sz,
      };
      expectKey('--Button-fontSize-$sz');
      expectKey('--Button-lineHeight-$sz');
      expectKey('--Button-minHeight-$sz');
      expectKey('--Button-paddingVertical-$sz');
      expectKey('--Button-paddingHorizontal-$sz');
      expectKey('--Button-paddingHorizontalStart-$sz');
      expectKey('--Button-paddingHorizontalEnd-$sz');
      expectKey('--Button-iconSize-$sz');
      final chain = ds.componentCustomProperties['--Button-fontSize-$sz'];
      if (chain != null) {
        final peeled = NativeDesignSystemPayload.peelLeadingVar(chain);
        if (peeled != '--Label-$label-FontSize') {
          notes.add(
              '--Button-fontSize-$sz chains to $peeled (expected --Label-$label-FontSize)');
        }
      }
      expectKey('--Button-condensedMinHeight-$sz');
      expectKey('--Button-condensedPaddingVertical-$sz');
      expectKey('--Button-condensedPaddingHorizontal-$sz');
    }

    for (final v in ['bold', 'subtle', 'ghost']) {
      expectKey('--Button-borderWidth-$v');
    }

    // Semantic state tokens — often injected via brand CSS, not always in component map.
    for (final sem in ['--Disabled-Opacity', '--Loading-Opacity']) {
      final raw = ds.rawTokenValue(sem) ?? ds.componentCustomProperties[sem];
      if (raw == null) {
        notes.add(
            '$sem not in snapshot — disabled/loading opacity uses Flutter fallback 0.38');
      } else {
        present.add(sem);
      }
    }

    // Ornament / decoration — not yet ported to Flutter painter.
    for (final deco in [
      '--Button-ornament-width-left',
      '--Button-cssDecorationClipPath',
      '--Button-cssDecorationColor',
    ]) {
      if (ds.componentCustomProperties[deco] == null) {
        notes.add(
            '$deco absent — ornaments/decoration not rendered in Flutter Button yet');
      } else {
        present.add(deco);
      }
    }

    if (ds.dimensionContexts.isEmpty) {
      notes.add(
        'dimensionContexts empty — spacing/icon gaps resolve via platformsFoundationConfig or static tables',
      );
    } else {
      present.add('dimensionContexts (${ds.dimensionContexts.length} slices)');
    }

    return ButtonConvexAudit(
      present: present,
      missing: missing,
      unresolved: unresolved,
      notes: notes,
    );
  }
}
