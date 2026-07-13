import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/engine/native_design_system_payload.dart';
import 'package:ui_flutter/engine/native_theme_snapshot.dart';
import 'package:ui_flutter/engine/surface_engine.dart';

void main() {
  test('NativeThemeSnapshot.tryParse restores ThemeConfig palettes', () {
    final snap = NativeThemeSnapshot.tryParse({
      'schemaVersion': 1,
      'brandId': 'b1',
      'themeConfig': {
        'appearances': {
          'primary': {
            'name': 'Test',
            'baseStep': 1400,
            'darkerBaseStep': 1500,
            'palette': {'100': '#010101', '2500': '#fefefe'},
            'anchorBoldToBaseStep': false,
          },
        },
      },
      'rootParentStep': 2500,
      'darkMode': false,
      'brandHash': 'x',
      'configuredRoles': ['primary'],
    });
    expect(snap, isNotNull);
    expect(snap!.schemaVersion, 1);
    expect(snap.brandId, 'b1');
    expect(snap.themeConfig.appearances['primary']!.palette[100], '#010101');
    expect(snap.themeConfig.appearances['primary']!.palette[2500], '#fefefe');
  });

  test('NativeDesignSystemPayload resolves var() against dimensions', () {
    final ds = NativeDesignSystemPayload.tryParse({
      'componentCustomProperties': <String, dynamic>{},
      'dimensionContexts': <dynamic>[],
      'activeDimensionKey': 'S:default',
      'activeDimensionContext': {
        'platformId': 'S',
        'densityId': 'default',
        'dimensions': {'--Dimension-f4': '4px'},
        'gridMargin': '16px',
        'gridGutter': '12px',
      },
    })!;
    expect(ds.parsePx(ds.resolveCSSValue('var(--Dimension-f4)')), 4.0);
  });

  test('NativeDesignSystemPayload var() fallback and component→dimension chain',
      () {
    final ds = NativeDesignSystemPayload.tryParse({
      'componentCustomProperties': <String, dynamic>{
        '--Button-paddingHorizontal': 'var(--Dimension-f4)',
        '--Button-borderRadius': 'var(--Shape-Pill)',
      },
      'dimensionContexts': <dynamic>[],
      'activeDimensionKey': 'S:default',
      'activeDimensionContext': {
        'platformId': 'S',
        'densityId': 'default',
        'dimensions': {'--Dimension-f4': '4px', '--Shape-Pill': '9999px'},
        'gridMargin': '16px',
        'gridGutter': '12px',
      },
    })!;
    expect(ds.resolveCSSValue('var(--Missing, 2px)'), '2px');
    expect(ds.componentLengthPx('--Button-paddingHorizontal'), 4.0);
    expect(ds.componentLengthPx('--Button-borderRadius'), 9999.0);
  });

  test(
      'resolveCSSValue var(--Shape-Pill) without platform/density (toolbar unset)',
      () {
    final ds = NativeDesignSystemPayload.tryParse({
      'componentCustomProperties': <String, dynamic>{},
      'dimensionContexts': <dynamic>[],
      'activeDimensionKey': '',
    })!;
    expect(ds.resolveCSSValue('var(--Shape-Pill)'), '9999px');
  });

  test('brand --Stroke-L override wins over static primitive default', () {
    final ds = NativeDesignSystemPayload.tryParse({
      'componentCustomProperties': <String, dynamic>{
        '--Stroke-L': '8px',
      },
      'dimensionContexts': <dynamic>[],
      'activeDimensionKey': 'L:default',
    })!;
    expect(
      ds.resolveComponentLengthPxCascade(['--Stroke-L']),
      8.0,
    );
  });

  test(
      'Shape-Pill primitive wins over bogus dimension slice entry (stadium parity)',
      () {
    final ds = NativeDesignSystemPayload.tryParse({
      'componentCustomProperties': <String, dynamic>{
        '--Button-borderRadius': 'var(--Shape-Pill)',
      },
      'dimensionContexts': <dynamic>[],
      'activeDimensionKey': 'S:default',
      'activeDimensionContext': {
        'platformId': 'S',
        'densityId': 'default',
        'dimensions': {
          '--Shape-Pill': '8px',
        },
        'gridMargin': '16px',
        'gridGutter': '12px',
      },
    })!;
    expect(ds.componentLengthPx('--Button-borderRadius'), 9999.0);
  });

  test(
      'resolveComponentLengthPxCascade falls back Shape-Pill when --Button-borderRadius absent',
      () {
    final ds = NativeDesignSystemPayload.tryParse({
      'componentCustomProperties': <String, dynamic>{},
      'dimensionContexts': <dynamic>[],
      'activeDimensionKey': '',
    })!;
    expect(
      ds.resolveComponentLengthPxCascade(['--Button-borderRadius']),
      9999.0,
    );
  });

  test(
      'NativeDesignSystemPayload resolves var(--Spacing-*) from augmented dimension contexts',
      () {
    final ds = NativeDesignSystemPayload.tryParse({
      'componentCustomProperties': <String, dynamic>{
        '--Button-paddingHorizontal': 'var(--Spacing-M)',
      },
      'dimensionContexts': <dynamic>[],
      'activeDimensionKey': 'S:default',
      'activeDimensionContext': {
        'platformId': 'S',
        'densityId': 'default',
        'dimensions': {'--Dimension-f0': '16px', '--Spacing-M': '16px'},
        'gridMargin': '16px',
        'gridGutter': '12px',
      },
    })!;
    expect(ds.componentLengthPx('--Button-paddingHorizontal'), 16.0);
  });

  test('themeConfigFromJson normalizes 8-digit ARGB palette stops (Jio blue)',
      () {
    final tc = themeConfigFromJson({
      'appearances': {
        'primary': {
          'name': 'Brand',
          'baseStep': 600,
          'darkerBaseStep': 700,
          'palette': {'600': '#FF0053C8'},
          'anchorBoldToBaseStep': true,
        },
      },
    });
    expect(tc.appearances['primary']!.palette[600], '#0053c8');
  });

  test('resolveRootSurfaceRoles uses full Convex role without token merge', () {
    final themeConfig = ThemeConfig(appearances: {
      'primary': ScaleDefinition(
        name: 'Primary',
        baseStep: 1400,
        darkerBaseStep: 1500,
        palette: {100: '#000000', 1400: '#aa0000', 2500: '#ffffff'},
      ),
    });
    final roles = resolveRootSurfaceRoles(
      themeConfig: themeConfig,
      rootParentStep: 2500,
      darkMode: false,
      rootRolesJson: {
        'primary': {
          'surfaces': {
            'minimal': '#111111',
            'subtle': '#222222',
            'bold': '#333333'
          },
          'content': {},
          'onBoldContent': {},
          'onSubtleContent': {},
          'states': {},
        },
      },
    );
    expect(roles['primary']!.surfaces['minimal'], '#111111');
    // Engine would compute a different bold at root — snapshot must win entirely.
    expect(roles['primary']!.surfaces['bold'], '#333333');
  });

  test('resolvedRolesFromRootRoles parses buildNativeTheme rootRoles', () {
    final roles = resolvedRolesFromRootRoles({
      'primary': {
        'surfaces': {
          'minimal': '#111111',
          'subtle': '#222222',
          'bold': '#333333'
        },
        'content': {'high': '#444444'},
        'onBoldContent': {'high': '#ffffff'},
        'onSubtleContent': {'tintedA11y': '#555555'},
        'states': {},
      },
      'secondary': {
        'surfaces': {
          'minimal': '#aaaaaa',
          'subtle': '#bbbbbb',
          'bold': '#cccccc'
        },
        'content': {},
        'onBoldContent': {},
        'onSubtleContent': {},
        'states': {},
      },
    });
    expect(roles['primary']!.surfaces['bold'], '#333333');
    expect(roles['secondary']!.surfaces['subtle'], '#bbbbbb');
  });

  test(
      'NativeDesignSystemPayload picks active context from dimensionContexts when slice omitted',
      () {
    final ds = NativeDesignSystemPayload.tryParse({
      'componentCustomProperties': <String, dynamic>{},
      'dimensionContexts': <dynamic>[
        {
          'platformId': 'L',
          'densityId': 'compact',
          'dimensions': {'--Dimension-f0': '24px'},
          'gridMargin': '20px',
          'gridGutter': '16px',
        },
      ],
      'activeDimensionKey': 'L:compact',
    })!;
    expect(ds.activeDimensionContext?.platformId, 'L');
    expect(ds.dimensionStepPx('f0'), 24.0);
  });
}
