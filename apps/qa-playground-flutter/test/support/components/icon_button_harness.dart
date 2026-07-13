/// IconButton harness for QA playground widget tests.
///
/// Mirrors [chip_harness.dart] / [button_harness.dart]:
///   - [qaIconButtonTestDesignSystem] — synthetic measurement DS with distinct
///     container px per f-step so size/condensed assertions are not circular.
///   - [pumpIconButtonQaHarness] — synthetic-DS pump for fast functional/a11y/
///     figma/platform tests (offline).
///   - [pumpIconButtonJioHarness] / [pumpIconButtonJioHarnessSettled] — real Jio
///     Convex fixture for goldens + E2E (production token resolution).
///   - Finders / accessors read REAL rendered values (getSize, BoxDecoration,
///     SemanticsData, Opacity) — never re-parse the token under test.
library;

import '../semantics_helpers.dart';

export '../pump_one_ui_app.dart'
    show
        qaInputFieldTestDesignSystem,
        pumpOneUiQaApp,
        pumpOneUiQaHarness,
        kOneUiQaTestPlatforms;
export '../semantics_helpers.dart' show withSemanticsHandle;
export '../test_widgets_all_platforms.dart' show testWidgetsAllPlatforms;

import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/engine/native_design_system_payload.dart';
import 'package:ui_flutter/engine/surface_engine.dart' show ThemeConfig;
import 'package:ui_flutter/icons/jio_icon_catalog.dart';
import 'package:ui_flutter/theme/one_ui_scope.dart';
import 'package:ui_flutter/theme/surface_scope.dart';
import 'package:ui_flutter/widgets/one_ui_focus_interactive.dart';
import 'package:ui_flutter/widgets/one_ui_icon_button.dart';
import 'package:ui_flutter/widgets/one_ui_surface.dart';

import '../pump_one_ui_app.dart' show qaInputFieldTestDesignSystem, pumpOneUiQaApp;

/// Container px per Figma alias — locked to [qaIconButtonTestDesignSystem].
const Map<String, double> kQaIconButtonContainerPx = {
  '2xs': 20,
  'xs': 24,
  's': 32,
  'm': 40,
  'l': 48,
  'xl': 56,
};

/// Condensed container px per alias — locked to [qaIconButtonTestDesignSystem].
const Map<String, double> kQaIconButtonCondensedContainerPx = {
  '2xs': 16,
  'xs': 20,
  's': 28,
  'm': 32,
  'l': 40,
  'xl': 48,
};

const List<String> kQaIconButtonFigmaAppearances = <String>[
  'neutral',
  'primary',
  'secondary',
  'negative',
  'positive',
  'informative',
  'warning',
];

NativeDesignSystemPayload qaIconButtonTestDesignSystem() {
  final base = qaInputFieldTestDesignSystem();
  final props = Map<String, dynamic>.from(base.componentCustomProperties);

  const containerByStep = {
    '4': 20.0,
    '6': 24.0,
    '8': 32.0,
    '10': 40.0,
    '12': 48.0,
    '14': 56.0,
  };
  const iconByStep = {
    '4': 10.0,
    '6': 12.0,
    '8': 16.0,
    '10': 20.0,
    '12': 24.0,
    '14': 28.0,
  };
  const condensedByStep = {
    '4': 16.0,
    '6': 20.0,
    '8': 28.0,
    '10': 32.0,
    '12': 40.0,
    '14': 48.0,
  };

  props['--IconButton-borderRadius'] = '9999px';
  props['--Disabled-Opacity'] = '0.38';
  props['--Loading-Opacity'] = '0.38';

  for (final entry in containerByStep.entries) {
    final sz = entry.key;
    props['--IconButton-containerSize-$sz'] = '${entry.value.toInt()}px';
    props['--IconButton-iconSize-$sz'] = '${iconByStep[sz]!.toInt()}px';
    props['--IconButton-containerSize-$sz-condensed'] =
        '${condensedByStep[sz]!.toInt()}px';
    props['--IconButton-condensedContainerSize-$sz'] =
        '${condensedByStep[sz]!.toInt()}px';
  }
  for (final v in ['bold', 'subtle', 'ghost']) {
    props['--IconButton-borderWidth-$v'] = '0px';
  }

  return NativeDesignSystemPayload.tryParse({
    'componentCustomProperties': props,
    'dimensionContexts': base.dimensionContexts,
    'activeDimensionKey': base.activeDimensionKey,
    'activeDimensionContext': base.activeDimensionContext,
  })!;
}

Future<void> ensureIconButtonIconsLoaded() async {
  TestWidgetsFlutterBinding.ensureInitialized();
  await JioIconCatalog.instance.ensureLoaded();
}

Future<void> pumpIconButtonQaHarness(
  WidgetTester tester,
  Widget child, {
  NativeDesignSystemPayload? designSystem,
  bool settle = true,
}) async {
  await ensureIconButtonIconsLoaded();
  await tester.pumpWidget(
    pumpOneUiQaApp(
      child,
      designSystem: designSystem ?? qaIconButtonTestDesignSystem(),
    ),
  );
  if (settle) {
    await tester.pumpAndSettle();
  } else {
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 16));
  }
}

const int _kIconButtonDarkRootStep = 100;

Widget pumpIconButtonJioApp(
  Widget child, {
  ThemeConfig? themeConfig,
  bool? darkMode,
  NativeDesignSystemPayload? designSystem,
  String? surfaceMode,
  String surfaceAppearance = 'primary',
  String platformId = 'S',
  String density = 'default',
}) {
  final fx = jioFixture;
  final effectiveDark = darkMode ?? fx.darkMode;
  final effectiveStep = darkMode == null
      ? fx.rootParentStep
      : (effectiveDark ? _kIconButtonDarkRootStep : 2500);

  Widget inner = child;
  if (surfaceMode != null) {
    inner = OneUiSurface(
      mode: surfaceMode,
      appearance: surfaceAppearance,
      child: inner,
    );
  }

  return MaterialApp(
    home: OneUiSurfaceBootstrap(
      themeConfig: themeConfig ?? fx.themeConfig,
      darkMode: effectiveDark,
      rootParentStep: effectiveStep,
      rootRoles: darkMode == null ? fx.rootRoles : null,
      child: OneUiScope(
        platformId: platformId,
        density: density,
        nativeTypography: fx.nativeTypography,
        designSystem: designSystem ?? fx.designSystem,
        child: Scaffold(
          backgroundColor: effectiveDark ? const Color(0xFF101010) : null,
          body: Center(
            child: Padding(
              padding: const EdgeInsets.all(12),
              child: inner,
            ),
          ),
        ),
      ),
    ),
  );
}

Future<void> pumpIconButtonJioHarness(
  WidgetTester tester,
  Widget child, {
  ThemeConfig? themeConfig,
  bool? darkMode,
  NativeDesignSystemPayload? designSystem,
  String? surfaceMode,
  String surfaceAppearance = 'primary',
  String platformId = 'S',
  String density = 'default',
}) async {
  await ensureJioFixtureReady();
  await ensureIconButtonIconsLoaded();
  await tester.pumpWidget(pumpIconButtonJioApp(
    child,
    themeConfig: themeConfig,
    darkMode: darkMode,
    designSystem: designSystem,
    surfaceMode: surfaceMode,
    surfaceAppearance: surfaceAppearance,
    platformId: platformId,
    density: density,
  ));
  await tester.pump();
  await tester.pump(const Duration(milliseconds: 16));
}

Future<void> pumpIconButtonJioHarnessSettled(
  WidgetTester tester,
  Widget child, {
  ThemeConfig? themeConfig,
  bool? darkMode,
  NativeDesignSystemPayload? designSystem,
  String? surfaceMode,
  String surfaceAppearance = 'primary',
  String platformId = 'S',
  String density = 'default',
}) async {
  await ensureJioFixtureReady();
  await ensureIconButtonIconsLoaded();
  await tester.pumpWidget(pumpIconButtonJioApp(
    child,
    themeConfig: themeConfig,
    darkMode: darkMode,
    designSystem: designSystem,
    surfaceMode: surfaceMode,
    surfaceAppearance: surfaceAppearance,
    platformId: platformId,
    density: density,
  ));
  await tester.pumpAndSettle();
}

Finder iconButtonRootFinder() => find.byType(OneUiIconButton);

Finder iconButtonInteractiveFinder() => find.byType(OneUiFocusInteractive);

/// Chrome root: `Opacity` → `SizedBox` → `DecoratedBox` from [OneUiIconButton.buildChrome].
Finder iconButtonChromeFinder({Finder? within}) => find.descendant(
      of: within ?? iconButtonInteractiveFinder().first,
      matching: find.byWidgetPredicate((w) {
        if (w is! Opacity) return false;
        final child = w.child;
        return child is SizedBox && child.child is DecoratedBox;
      }),
    );

Size iconButtonChromeSize(WidgetTester tester, {Finder? within}) {
  final opacity = tester.widget<Opacity>(iconButtonChromeFinder(within: within).first);
  final box = opacity.child as SizedBox;
  if (box.width != null && box.height != null) {
    return Size(box.width!, box.height!);
  }
  return tester.getSize(find.byWidget(opacity));
}

double iconButtonHeightPx(WidgetTester tester, {Finder? within}) =>
    iconButtonChromeSize(tester, within: within).height;

double iconButtonWidthPx(WidgetTester tester, {Finder? within}) =>
    iconButtonChromeSize(tester, within: within).width;

/// WCAG hit floor wired on [OneUiFocusInteractive] — visual chrome may stay smaller
/// (e.g. 2xs = 20px) while tap area expands on touch-first platforms.
Size iconButtonMinHitTestSize(WidgetTester tester, {Finder? within}) {
  final interactive = tester.widget<OneUiFocusInteractive>(
    within ?? iconButtonInteractiveFinder().first,
  );
  final min = interactive.minHitTestSize;
  expect(
    min,
    isNotNull,
    reason:
        'IconButton should pass minHitTestSize on touch-first platforms (S-360+).',
  );
  return min!;
}

BoxDecoration iconButtonDecoration(WidgetTester tester, {Finder? within}) {
  final opacity = tester.widget<Opacity>(iconButtonChromeFinder(within: within).first);
  final box = (opacity.child as SizedBox).child! as DecoratedBox;
  return box.decoration! as BoxDecoration;
}

Color? iconButtonFill(WidgetTester tester, {Finder? within}) =>
    iconButtonDecoration(tester, within: within).color;

double iconButtonOpacity(WidgetTester tester, {Finder? within}) =>
    tester.widget<Opacity>(iconButtonChromeFinder(within: within).first).opacity;

/// Layout width — for `fullWidth`, reads the `SizedBox(width: infinity)` shell.
/// Otherwise returns the painted chrome width ([iconButtonWidthPx]).
double iconButtonLayoutWidthPx(WidgetTester tester) {
  final fullWidthShell = find.descendant(
    of: iconButtonRootFinder(),
    matching: find.byWidgetPredicate(
      (w) => w is SizedBox && w.width == double.infinity,
    ),
  );
  if (fullWidthShell.evaluate().isNotEmpty) {
    return tester.getSize(fullWidthShell.first).width;
  }
  return iconButtonWidthPx(tester);
}

SemanticsData iconButtonSemanticsData(
  WidgetTester tester, {
  String? semanticsLabel,
}) {
  // Semantics live on [OneUiFocusInteractive], not on the outer label finder when
  // loading (nested "Loading" node can shadow the tree in some modes).
  final finder = iconButtonInteractiveFinder();
  expect(finder, findsOneWidget);
  final data = tester.getSemantics(finder).getSemanticsData();
  if (semanticsLabel != null) {
    expect(data.label, contains(semanticsLabel));
  }
  return data;
}

void expectIconButtonEnabled(WidgetTester tester, {String? semanticsLabel}) {
  withSemanticsHandle(tester, () {
    final data = iconButtonSemanticsData(tester, semanticsLabel: semanticsLabel);
    expect(data.hasFlag(SemanticsFlag.hasEnabledState), isTrue);
    expect(data.hasFlag(SemanticsFlag.isEnabled), isTrue);
  });
}

void expectIconButtonDisabled(WidgetTester tester, {String? semanticsLabel}) {
  withSemanticsHandle(tester, () {
    final data = iconButtonSemanticsData(tester, semanticsLabel: semanticsLabel);
    expect(data.hasFlag(SemanticsFlag.hasEnabledState), isTrue);
    expect(data.hasFlag(SemanticsFlag.isEnabled), isFalse);
  });
}

AnimationController iconButtonPressController(WidgetTester tester) {
  // ignore: invalid_use_of_protected_member
  final state = tester.state(find.byType(OneUiFocusInteractive));
  // ignore: avoid_dynamic_calls
  final ctrl = (state as dynamic).pressControllerForTesting as AnimationController?;
  if (ctrl == null) {
    throw StateError(
      'OneUiFocusInteractive does not expose pressControllerForTesting.',
    );
  }
  return ctrl;
}
