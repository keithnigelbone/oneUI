/// Engine parity — every built component resolver must resolve all configured
/// appearance roles (RN `useSurfaceTokens` / Convex `themeConfig.appearances`).
library;

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/engine/avatar_color_resolve.dart';
import 'package:ui_flutter/engine/badge_color_resolve.dart';
import 'package:ui_flutter/engine/button_color_resolve.dart';
import 'package:ui_flutter/engine/chip_color_resolve.dart';
import 'package:ui_flutter/engine/cpi_color_resolve.dart';
import 'package:ui_flutter/engine/counter_badge_color_resolve.dart';
import 'package:ui_flutter/engine/icon_button_color_resolve.dart';
import 'package:ui_flutter/engine/icon_color_resolve.dart';
import 'package:ui_flutter/engine/icon_contained_color_resolve.dart';
import 'package:ui_flutter/engine/indicator_badge_color_resolve.dart';
import 'package:ui_flutter/engine/input_color_resolve.dart';
import 'package:ui_flutter/engine/input_size_resolve.dart';
import 'package:ui_flutter/engine/input_feedback_resolve.dart';
import 'package:ui_flutter/engine/checkbox_color_resolve.dart';
import 'package:ui_flutter/engine/radio_color_resolve.dart';
import 'package:ui_flutter/engine/native_design_system_payload.dart';
import 'package:ui_flutter/engine/surface_engine.dart';
import 'package:ui_flutter/engine/text_color_resolve.dart';
import 'package:ui_flutter/foundations/surface_palettes.dart';
import 'package:ui_flutter/theme/one_ui_scope.dart';
import 'package:ui_flutter/theme/surface_scope.dart';
import 'package:ui_flutter/tokens/appearance_roles.dart';
import 'package:ui_flutter/widgets/one_ui_avatar_types.dart';
import 'package:ui_flutter/widgets/one_ui_badge_types.dart';
import 'package:ui_flutter/widgets/one_ui_button_types.dart';
import 'package:ui_flutter/widgets/one_ui_chip_types.dart';
import 'package:ui_flutter/widgets/one_ui_counter_badge_types.dart';
import 'package:ui_flutter/widgets/one_ui_icon_button_types.dart';
import 'package:ui_flutter/widgets/one_ui_icon_contained_types.dart';
import 'package:ui_flutter/widgets/one_ui_icon_types.dart';
import 'package:ui_flutter/widgets/one_ui_input_feedback_types.dart';
import 'package:ui_flutter/widgets/one_ui_input_types.dart';
import 'package:ui_flutter/widgets/one_ui_checkbox_types.dart';
import 'package:ui_flutter/widgets/one_ui_radio_types.dart';
import 'package:ui_flutter/widgets/one_ui_text_types.dart';

ThemeConfig _allRolesThemeConfig() {
  final grey = buildGreyscalePalette();
  final accent = buildColoredPalette();
  return ThemeConfig(
    appearances: {
      for (final role in appearanceRoles)
        role: buildScaleDefinition(
          role,
          role == 'primary' || role == 'sparkle' ? accent : grey,
          role == 'primary' ? 600 : 1300,
          anchorBoldToBaseStep: role == 'brand-bg' || role == 'primary',
        ),
    },
  );
}

NativeDesignSystemPayload _minimalDs() {
  return NativeDesignSystemPayload.tryParse({
    'componentCustomProperties': <String, dynamic>{
      '--Button-borderRadius': '9999px',
      '--IconButton-borderRadius': '9999px',
      '--IconButton-containerSize-10': '40px',
      '--IconButton-iconSize-10': '18px',
      '--IconButton-borderWidth-bold': '0px',
      '--IconButton-borderWidth-subtle': '0px',
      '--IconButton-borderWidth-ghost': '0px',
      '--Chip-borderWidth': '1px',
      '--Stroke-M': '1px',
      '--Disabled-Opacity': '0.38',
    },
    'dimensionContexts': <dynamic>[],
    'activeDimensionKey': 'S:default',
    'activeDimensionContext': {
      'platformId': 'S',
      'density': 'default',
      'dimensions': <String, String>{
        '--Stroke-XL': '2px',
        '--Focus-Outline-Width': '2px',
      },
    },
  })!;
}

void main() {
  late ThemeConfig themeConfig;
  late NativeDesignSystemPayload ds;
  late SurfaceContextValue root;

  setUp(() {
    themeConfig = _allRolesThemeConfig();
    ds = _minimalDs();
    root = buildRootSurfaceContext(
      themeConfig: themeConfig,
      rootParentStep: 2500,
      darkMode: false,
    );
  });

  Future<void> pump(WidgetTester tester, Widget child) async {
    await tester.pumpWidget(
      MaterialApp(
        home: OneUiSurfaceScope(
          value: root,
          child: OneUiScope(
            platformId: 'S',
            density: 'default',
            designSystem: ds,
            child: Builder(builder: (ctx) => child),
          ),
        ),
      ),
    );
  }

  for (final role in appearanceRoles) {
    testWidgets('tokensForAppearance resolves $role', (tester) async {
      await pump(
        tester,
        Builder(
          builder: (ctx) {
            expect(
              OneUiSurfaceScope.isAppearanceConfigured(ctx, role),
              isTrue,
            );
            final t = OneUiSurfaceScope.tokensForAppearance(ctx, role);
            expect(t.surfaces[kSurfaceBold], isNotNull);
            return const SizedBox();
          },
        ),
      );
    });
  }

  testWidgets('Button bold resolves every configured role', (tester) async {
    await pump(
      tester,
      Builder(
        builder: (ctx) {
          for (final role in appearanceRoles) {
            final c = resolveButtonColors(
              ctx,
              ds,
              variant: OneUiButtonVariantKind.bold,
              appearance: role,
            );
            expect(c.background.alpha, greaterThan(0));
          }
          return const SizedBox();
        },
      ),
    );
  });

  testWidgets(
    'Button paint rewrites primary-scoped convex overrides per appearance',
    (tester) async {
      final pinnedDs = NativeDesignSystemPayload.tryParse({
        'componentCustomProperties': <String, dynamic>{
          ...ds.componentCustomProperties,
          '--Button-backgroundColor-bold': 'var(--Primary-Bold)',
          '--Button-backgroundColor-subtle': 'var(--Primary-Subtle)',
          '--Button-textColor-subtle': 'var(--Primary-TintedA11y)',
        },
        'dimensionContexts': ds.dimensionContexts,
        'activeDimensionKey': ds.activeDimensionKey,
        'activeDimensionContext': ds.activeDimensionContext,
      })!;

      await tester.pumpWidget(
        MaterialApp(
          home: OneUiSurfaceScope(
            value: root,
            child: OneUiScope(
              platformId: 'S',
              density: 'default',
              designSystem: pinnedDs,
              child: Builder(
                builder: (ctx) {
                  final primary = resolveButtonColors(
                    ctx,
                    pinnedDs,
                    variant: OneUiButtonVariantKind.bold,
                    appearance: 'primary',
                  );
                  final negative = resolveButtonColors(
                    ctx,
                    pinnedDs,
                    variant: OneUiButtonVariantKind.bold,
                    appearance: 'negative',
                  );
                  final positive = resolveButtonColors(
                    ctx,
                    pinnedDs,
                    variant: OneUiButtonVariantKind.bold,
                    appearance: 'positive',
                  );
                  final negativeSubtle = resolveButtonColors(
                    ctx,
                    pinnedDs,
                    variant: OneUiButtonVariantKind.subtle,
                    appearance: 'negative',
                  );
                  final primarySubtle = resolveButtonColors(
                    ctx,
                    pinnedDs,
                    variant: OneUiButtonVariantKind.subtle,
                    appearance: 'primary',
                  );

                  expect(
                      negative.background, isNot(equals(primary.background)));
                  expect(
                      positive.background, isNot(equals(primary.background)));
                  expect(negativeSubtle.background,
                      isNot(equals(primarySubtle.background)));
                  expect(negativeSubtle.foreground,
                      isNot(equals(primarySubtle.foreground)));
                  return const SizedBox();
                },
              ),
            ),
          ),
        ),
      );
    },
  );

  testWidgets('IconButton bold resolves every configured role', (tester) async {
    await pump(
      tester,
      Builder(
        builder: (ctx) {
          for (final role in appearanceRoles) {
            final c = resolveIconButtonColors(
              ctx,
              ds,
              variant: OneUiIconButtonVariantKind.bold,
              appearance: role,
            );
            expect(c.background.alpha, greaterThan(0));
          }
          return const SizedBox();
        },
      ),
    );
  });

  testWidgets('Chip + Badge + CPI resolvers per role', (tester) async {
    await pump(
      tester,
      Builder(
        builder: (ctx) {
          for (final role in appearanceRoles) {
            resolveBadgeColors(
              ctx,
              ds,
              variant: 'bold',
              appearance: role,
            );
            resolveCpiColors(ctx, ds, appearance: role);
            final chipState = resolveOneUiChipState(appearance: role);
            resolveChipPaint(
              ctx,
              ds,
              state: chipState,
              selected: true,
              pressed: false,
              roleAppearance: chipRoleAppearanceForTokens(
                appearanceProp: role,
                resolvedAppearance: chipState.resolvedAppearance,
              ),
            );
            resolveCounterBadgeColors(
              ctx,
              ds,
              variant: 'bold',
              appearance: role,
            );
            resolveIndicatorBadgeColors(ctx, ds, appearance: role);
            resolveOneUiTextColor(
              ctx,
              appearance: role,
              attention: OneUiTextAttention.high,
            );
            resolveOneUiIconColor(
              ctx,
              appearance: role,
              emphasis: OneUiIconEmphasis.high,
            );
            resolveIconContainedColors(
              ctx,
              appearance: role,
              attention: OneUiIconContainedAttention.high,
            );
            resolveAvatarColors(
              ctx,
              appearance: role,
              attention: OneUiAvatarAttention.high,
              showingImage: false,
            );
            resolveInputPaint(
              context: ctx,
              designSystem: ds,
              appearance: role,
              role: OneUiSurfaceScope.tokensForAppearance(ctx, role),
              errorRole: null,
              attention: OneUiInputAttention.medium,
              borders: const InputBorderWidths(
                idle: 1,
                focus: 2,
                disabledOpacity: 0.38,
                rootStackGap: 6,
              ),
              hasFocus: false,
              hasError: false,
              isDisabled: false,
              isHovered: false,
            );
            resolveInputFeedbackPaint(
              ctx,
              variant: OneUiInputFeedbackVariant.negative,
              attention: OneUiInputFeedbackAttention.high,
            );
            final radioState = resolveOneUiRadioState(
              appearance: role,
              isChecked: true,
            );
            final radioPaint = resolveRadioPaint(
              ctx,
              ds,
              state: radioState,
              pressed: false,
              hovered: false,
              roleAppearance: radioState.resolvedAppearance,
              uncheckedRoleAppearance: resolveOneUiRadioUncheckedAppearance(
                ctx,
                readOnly: false,
              ),
            );
            expect(radioPaint.indicatorColor.alpha, greaterThan(0));
            final checkboxState = resolveOneUiCheckboxState(
              appearance: role,
              isChecked: true,
            );
            final checkboxPaint = resolveCheckboxPaint(
              ctx,
              ds,
              state: checkboxState,
              pressed: false,
              hovered: false,
              roleAppearance: checkboxState.resolvedAppearance,
              uncheckedRoleAppearance: resolveOneUiCheckboxUncheckedAppearance(
                ctx,
                readOnly: false,
              ),
            );
            expect(checkboxPaint.indicatorColor.alpha, greaterThan(0));
          }
          return const SizedBox();
        },
      ),
    );
  });
}
