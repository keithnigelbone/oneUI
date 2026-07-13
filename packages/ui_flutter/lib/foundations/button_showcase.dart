/// Button showcase sections — Dart peer of `Button.showcase.tsx`.
///
/// Imported by [ButtonFoundationsPage] only (no Storybook-specific deps).
library;

import 'package:flutter/material.dart';
import '../widgets/convex_design_system_guard.dart';

import '../engine/native_design_system_payload.dart';
import '../foundations/dimensions_resolve.dart';
import '../theme/one_ui_scope.dart';
import '../theme/surface_scope.dart';
import '../tokens/appearance_roles.dart';
import '../widgets/button_convex_audit.dart';
import '../widgets/one_ui_button.dart';
import '../widgets/one_ui_button_types.dart';
import '../widgets/one_ui_surface.dart';

// ─── Layout helpers (token spacing via Convex / static fallback) ─────────────

double _storyGap(BuildContext context) {
  final scope = OneUiScope.of(context);
  return resolveSpacingPx(
    designSystem: scope.designSystem,
    platformsConfig: scope.platformsFoundationConfig,
    platformId: scope.platformId,
    density: scope.density,
    spacingName: '4',
  );
}

double _storyGapLarge(BuildContext context) {
  final scope = OneUiScope.of(context);
  return resolveSpacingPx(
    designSystem: scope.designSystem,
    platformsConfig: scope.platformsFoundationConfig,
    platformId: scope.platformId,
    density: scope.density,
    spacingName: '4-5',
  );
}

TextStyle? _captionStyle(BuildContext context) {
  final typo = OneUiScope.nativeTypographyOf(context);
  return typo?.emphasisStyle('label', 'XS', emphasis: 'low') ??
      Theme.of(context).textTheme.labelSmall?.copyWith(
            color: Theme.of(context).colorScheme.onSurfaceVariant,
          );
}

TextStyle? _sectionStyle(BuildContext context) {
  final typo = OneUiScope.nativeTypographyOf(context);
  return typo?.emphasisStyle('label', 'S', emphasis: 'low') ??
      Theme.of(context).textTheme.labelMedium?.copyWith(
            color: Theme.of(context).colorScheme.onSurfaceVariant,
          );
}

Widget _caption(BuildContext context, String text) {
  return Text(text, style: _captionStyle(context));
}

Widget _sectionLabel(BuildContext context, String text) {
  return Text(text, style: _sectionStyle(context));
}

/// Story-only: merge `--Button-*` overrides into the active [OneUiScope.designSystem].
Widget _buttonScopeWithOverrides(
  BuildContext context, {
  required Map<String, String> componentOverrides,
  required Widget child,
}) {
  final parent = OneUiScope.of(context);
  final base = parent.designSystem;
  if (base == null) return child;

  final merged = Map<String, String>.from(base.componentCustomProperties);
  merged.addAll(componentOverrides);
  final ds = NativeDesignSystemPayload(
    componentCustomProperties: merged,
    dimensionContexts: base.dimensionContexts,
    activeDimensionKey: base.activeDimensionKey,
    activeDimensionContext: base.activeDimensionContext,
  );

  return OneUiScope(
    platformId: parent.platformId,
    density: parent.density,
    platformsFoundationConfig: parent.platformsFoundationConfig,
    designSystem: ds,
    nativeTypography: parent.nativeTypography,
    buttonOrnament: parent.buttonOrnament,
    typographyConfig: parent.typographyConfig,
    customFonts: parent.customFonts,
    foundationAccentColor: parent.foundationAccentColor,
    child: child,
  );
}

// ─── Convex coverage (Flutter-only diagnostic) ───────────────────────────────

Widget buttonConvexCoverageSection(BuildContext context) {
  final audit = ButtonConvexAudit.run(context);
  final theme = Theme.of(context);
  final scheme = theme.colorScheme;

  Widget listBlock(String title, List<String> items, Color accent) {
    if (items.isEmpty) return const SizedBox.shrink();
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(title, style: theme.textTheme.titleSmall?.copyWith(color: accent)),
        const SizedBox(height: 8),
        for (final item in items)
          Padding(
            padding: const EdgeInsets.only(bottom: 4),
            child: Text(item, style: theme.textTheme.bodySmall),
          ),
      ],
    );
  }

  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      Text(
        audit.isComplete
            ? 'Convex Button payload: complete'
            : 'Convex Button payload: gaps detected',
        style: theme.textTheme.titleMedium?.copyWith(
          color: audit.isComplete
              ? Colors.green.shade800
              : Colors.deepOrange.shade800,
          fontWeight: FontWeight.w600,
        ),
      ),
      const SizedBox(height: 8),
      Text(
        'Audits `getNativeThemeSnapshot.designSystem.componentCustomProperties` against '
        'web `Button.module.css`. Orange [OneUiButton] cards at runtime mean unresolved tokens.',
        style:
            theme.textTheme.bodySmall?.copyWith(color: scheme.onSurfaceVariant),
      ),
      SizedBox(height: _storyGapLarge(context)),
      listBlock('Present (${audit.present.length})',
          audit.present.take(12).toList(), scheme.primary),
      if (audit.present.length > 12)
        Text('… +${audit.present.length - 12} more',
            style: theme.textTheme.bodySmall),
      SizedBox(height: _storyGap(context)),
      listBlock('Missing (${audit.missing.length})', audit.missing,
          Colors.deepOrange),
      SizedBox(height: _storyGap(context)),
      listBlock('Unresolved (${audit.unresolved.length})', audit.unresolved,
          Colors.deepOrange),
      SizedBox(height: _storyGap(context)),
      listBlock('Notes', audit.notes, scheme.onSurfaceVariant),
    ],
  );
}

// ─── Stories (parity names with web Button.stories.tsx) ──────────────────────

Widget buttonDefaultSection(BuildContext context) {
  return const OneUiButton(label: 'Button', size: 10);
}

Widget buttonAttentionLevelsSection(BuildContext context) {
  return Wrap(
    spacing: _storyGap(context),
    runSpacing: _storyGap(context),
    crossAxisAlignment: WrapCrossAlignment.center,
    children: const [
      OneUiButton(label: 'High', attention: OneUiButtonAttention.high),
      OneUiButton(label: 'Medium', attention: OneUiButtonAttention.medium),
      OneUiButton(label: 'Low', attention: OneUiButtonAttention.low),
    ],
  );
}

Widget buttonSizesSection(BuildContext context) {
  return Wrap(
    spacing: _storyGap(context),
    runSpacing: _storyGap(context),
    crossAxisAlignment: WrapCrossAlignment.end,
    children: [
      for (final e in [
        (6, 'Extra Small', 'Dense inline'),
        (8, 'Small', 'Compact UI'),
        (10, 'Medium', 'Default'),
        (12, 'Large', 'Touch targets'),
      ])
        Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            OneUiButton(label: e.$2, size: e.$1),
            SizedBox(height: _storyGap(context) * 0.75),
            _caption(context, e.$3),
          ],
        ),
    ],
  );
}

Widget buttonCondensedSection(BuildContext context) {
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      _caption(
        context,
        'Two rows compare default vs condensed token maps (min-height + padding). '
        'This is not a repeat of the Sizes story — each size label appears once per row.',
      ),
      SizedBox(height: _storyGap(context)),
      for (final condensed in [false, true])
        Padding(
          padding: EdgeInsets.only(bottom: _storyGapLarge(context)),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _sectionLabel(context, condensed ? 'Condensed' : 'Default'),
              SizedBox(height: _storyGap(context)),
              Wrap(
                spacing: _storyGap(context),
                runSpacing: _storyGap(context),
                children: [
                  for (final s in [6, 8, 10, 12])
                    OneUiButton(
                      label: switch (s) {
                        6 => 'Extra Small',
                        8 => 'Small',
                        10 => 'Medium',
                        12 => 'Large',
                        _ => 'Button',
                      },
                      size: s,
                      condensed: condensed,
                    ),
                ],
              ),
            ],
          ),
        ),
    ],
  );
}

Widget buttonContainedSection(BuildContext context) {
  final scope = OneUiScope.of(context);
  final gap = resolveSpacingPx(
    designSystem: scope.designSystem,
    platformsConfig: scope.platformsFoundationConfig,
    platformId: scope.platformId,
    density: scope.density,
    spacingName: '4',
  );

  Widget rowLabel(String caption) => SizedBox(
        width: 120,
        child: Padding(
          padding: EdgeInsets.only(right: gap),
          child: Text(caption, style: _captionStyle(context)),
        ),
      );

  Widget buttonStrip({required bool contained}) => Expanded(
        child: Wrap(
          spacing: gap,
          runSpacing: gap,
          crossAxisAlignment: WrapCrossAlignment.center,
          children: [
            for (final s in [6, 8, 10, 12])
              OneUiButton(
                label: switch (s) {
                  6 => 'Extra Small',
                  8 => 'Small',
                  10 => 'Medium',
                  12 => 'Large',
                  _ => 'Button',
                },
                size: s,
                contained: contained,
              ),
          ],
        ),
      );

  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      _caption(
        context,
        '`contained=true` uses `--Button-*` tokens (minHeight, padding, iconSize). '
        '`contained=false` mirrors web LinkButton — reads `--LinkButton-*` from the brand '
        'component recipe (`minHeight`, `paddingHorizontal`, `iconSize`, `iconGap`, `borderRadius`). '
        'Brand overrides in the platform component editor apply to uncontained sizing.',
      ),
      SizedBox(height: _storyGap(context)),
      Padding(
        padding: EdgeInsets.only(bottom: _storyGapLarge(context)),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            rowLabel('contained=true'),
            buttonStrip(contained: true),
          ],
        ),
      ),
      Row(
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          rowLabel('contained=false'),
          buttonStrip(contained: false),
        ],
      ),
      SizedBox(height: _storyGapLarge(context)),
      _sectionLabel(context, 'Uncontained × attention (LinkButton tokens)'),
      SizedBox(height: _storyGap(context)),
      Wrap(
        spacing: gap,
        runSpacing: gap,
        children: [
          for (final attention in OneUiButtonAttention.values)
            OneUiButton(
              label: switch (attention) {
                OneUiButtonAttention.high => 'High',
                OneUiButtonAttention.medium => 'Medium',
                OneUiButtonAttention.low => 'Low',
              },
              contained: false,
              attention: attention,
            ),
        ],
      ),
      SizedBox(height: _storyGapLarge(context)),
      _sectionLabel(
          context, 'Uncontained with slots (`--LinkButton-iconSize-*`)'),
      SizedBox(height: _storyGap(context)),
      Wrap(
        spacing: gap,
        runSpacing: gap,
        children: [
          for (final s in [6, 8, 10, 12])
            OneUiButton(
              label: switch (s) {
                6 => 'XS + icon',
                8 => 'S + icon',
                10 => 'M + icon',
                12 => 'L + icon',
                _ => '',
              },
              size: s,
              contained: false,
              start: const OneUiButtonSlotIcon(),
            ),
        ],
      ),
      SizedBox(height: _storyGapLarge(context)),
      _sectionLabel(context, 'Uncontained multi-accent'),
      SizedBox(height: _storyGap(context)),
      Wrap(
        spacing: gap,
        runSpacing: gap,
        children: [
          for (final app in ['primary', 'secondary', 'positive', 'negative'])
            OneUiButton(
              label: app,
              contained: false,
              appearance: app,
              attention: OneUiButtonAttention.high,
            ),
        ],
      ),
    ],
  );
}

Widget buttonSlotPaddingSection(BuildContext context) {
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      _sectionLabel(context, 'Without slots (wider padding)'),
      SizedBox(height: _storyGap(context)),
      Wrap(
        spacing: _storyGap(context),
        children: [
          for (final s in [6, 8, 10, 12])
            OneUiButton(
                label: switch (s) {
                  6 => 'XS',
                  8 => 'S',
                  10 => 'M',
                  12 => 'L',
                  _ => ''
                },
                size: s),
        ],
      ),
      SizedBox(height: _storyGapLarge(context)),
      _sectionLabel(context, 'With start slot (reduced padding + gap)'),
      SizedBox(height: _storyGap(context)),
      Wrap(
        spacing: _storyGap(context),
        children: [
          for (final s in [6, 8, 10, 12])
            OneUiButton(
              label: switch (s) {
                6 => 'XS',
                8 => 'S',
                10 => 'M',
                12 => 'L',
                _ => ''
              },
              size: s,
              start: const OneUiButtonSlotIcon(),
            ),
        ],
      ),
      SizedBox(height: _storyGapLarge(context)),
      _sectionLabel(context, 'With both slots'),
      SizedBox(height: _storyGap(context)),
      Wrap(
        spacing: _storyGap(context),
        children: [
          for (final s in [6, 8, 10, 12])
            OneUiButton(
              label: switch (s) {
                6 => 'XS',
                8 => 'S',
                10 => 'M',
                12 => 'L',
                _ => ''
              },
              size: s,
              start: const OneUiButtonSlotIcon(),
              end: const OneUiButtonSlotIcon(),
            ),
        ],
      ),
    ],
  );
}

Widget buttonStatesSection(BuildContext context) {
  return Wrap(
    spacing: _storyGap(context),
    runSpacing: _storyGap(context),
    crossAxisAlignment: WrapCrossAlignment.end,
    children: [
      Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const OneUiButton(label: 'Default'),
          SizedBox(height: _storyGap(context) * 0.75),
          _caption(context, 'Normal'),
        ],
      ),
      Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const OneUiButton(label: 'Disabled', disabled: true),
          SizedBox(height: _storyGap(context) * 0.75),
          _caption(context, 'Not available'),
        ],
      ),
      Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const OneUiButton(label: 'Loading', loading: true),
          SizedBox(height: _storyGap(context) * 0.75),
          _caption(context, 'In progress'),
        ],
      ),
    ],
  );
}

Widget _buttonStoryLabeledColumn(
  BuildContext context, {
  required String caption,
  required Widget button,
}) {
  return Column(
    mainAxisSize: MainAxisSize.min,
    children: [
      button,
      SizedBox(height: _storyGap(context) * 0.75),
      _caption(context, caption),
    ],
  );
}

/// Web `ButtonFocusState` — idle vs forced focus ring (`data-force-state="focus"`).
Widget buttonFocusStateSection(BuildContext context) {
  final gap = _storyGap(context);
  final gapLarge = _storyGapLarge(context);

  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      _caption(
        context,
        'Idle vs keyboard focus — ring mirrors web `:focus-visible` (inner gap '
        '`--Stroke-XL` / `--Surface-Halo-Gap`, outer `--Focus-Outline`). '
        'Use Tab to move focus; Enter or Space activates the button (same as React / RN). '
        'The Focus column uses `forceFocusRing` like web `data-force-state="focus"`.',
      ),
      SizedBox(height: gap),
      Row(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          _buttonStoryLabeledColumn(
            context,
            caption: 'Idle',
            button: Padding(
              padding: EdgeInsets.all(gap),
              child: const OneUiButton(
                  label: 'Default', attention: OneUiButtonAttention.high),
            ),
          ),
          SizedBox(width: gapLarge),
          _buttonStoryLabeledColumn(
            context,
            caption: 'Focus (forceFocusRing)',
            button: Padding(
              padding: EdgeInsets.all(gap),
              child: const OneUiButton(
                label: 'Focused',
                attention: OneUiButtonAttention.high,
                forceFocusRing: true,
              ),
            ),
          ),
        ],
      ),
      SizedBox(height: gapLarge),
      _sectionLabel(context, 'Keyboard traversal (Tab → Enter / Space)'),
      SizedBox(height: gap),
      Wrap(
        spacing: gap,
        runSpacing: gap,
        crossAxisAlignment: WrapCrossAlignment.center,
        children: [
          OneUiButton(
            label: 'First (autofocus)',
            attention: OneUiButtonAttention.high,
            autofocus: true,
            onPressed: () {},
          ),
          const OneUiButton(
              label: 'Second', attention: OneUiButtonAttention.medium),
          const OneUiButton(
              label: 'Third', attention: OneUiButtonAttention.low),
          const OneUiButton(label: 'Uncontained', contained: false),
        ],
      ),
    ],
  );
}

Widget buttonWithSlotsSection(BuildContext context) {
  return Wrap(
    spacing: _storyGap(context),
    children: const [
      OneUiButton(label: 'Back', start: OneUiButtonSlotIcon()),
      OneUiButton(label: 'Next', end: OneUiButtonSlotIcon()),
      OneUiButton(
        label: 'Create',
        start: OneUiButtonSlotIcon(),
        end: OneUiButtonSlotIcon(),
      ),
    ],
  );
}

Widget buttonAppearancesSection(BuildContext context) {
  final roles = OneUiSurfaceScope.appearanceRolesForBrand(context);
  if (roles.isEmpty) {
    return oneUiConvexGapPlaceholder(
      ['No configured appearance roles on brand themeConfig.appearances'],
    );
  }

  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      for (final role in roles) ...[
        _sectionLabel(context, appearanceLabel(role)),
        SizedBox(height: _storyGap(context)),
        Wrap(
          spacing: _storyGap(context),
          children: [
            OneUiButton(
              label: 'High',
              attention: OneUiButtonAttention.high,
              appearance: role,
            ),
            OneUiButton(
              label: 'Medium',
              attention: OneUiButtonAttention.medium,
              appearance: role,
            ),
            OneUiButton(
              label: 'Low',
              attention: OneUiButtonAttention.low,
              appearance: role,
            ),
          ],
        ),
        SizedBox(height: _storyGapLarge(context)),
      ],
    ],
  );
}

Widget buttonFullWidthSection(BuildContext context) {
  return SizedBox(
    width: 320,
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: const [
        OneUiButton(
            label: 'High Full Width',
            attention: OneUiButtonAttention.high,
            fullWidth: true),
        SizedBox(height: 12),
        OneUiButton(
            label: 'Medium Full Width',
            attention: OneUiButtonAttention.medium,
            fullWidth: true),
        SizedBox(height: 12),
        OneUiButton(
            label: 'Low Full Width',
            attention: OneUiButtonAttention.low,
            fullWidth: true),
      ],
    ),
  );
}

Widget buttonSurfaceContextSection(BuildContext context) {
  final pad = resolveSpacingPx(
    designSystem: OneUiScope.of(context).designSystem,
    platformsConfig: OneUiScope.of(context).platformsFoundationConfig,
    platformId: OneUiScope.of(context).platformId,
    density: OneUiScope.of(context).density,
    spacingName: '5',
  );
  final gap = _storyGap(context);

  Widget surfaceRow(String mode, String desc) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _sectionLabel(context, '$mode — $desc'),
        SizedBox(height: _storyGap(context)),
        OneUiSurface(
          mode: mode,
          padding: EdgeInsets.all(pad),
          borderRadius: BorderRadius.circular(12),
          child: Wrap(
            spacing: gap,
            runSpacing: gap,
            children: const [
              OneUiButton(
                  label: 'High',
                  attention: OneUiButtonAttention.high,
                  start: OneUiButtonSlotIcon()),
              OneUiButton(
                  label: 'Medium',
                  attention: OneUiButtonAttention.medium,
                  start: OneUiButtonSlotIcon()),
              OneUiButton(
                  label: 'Low',
                  attention: OneUiButtonAttention.low,
                  end: OneUiButtonSlotIcon()),
            ],
          ),
        ),
        SizedBox(height: _storyGapLarge(context)),
      ],
    );
  }

  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      surfaceRow('default', 'page background'),
      surfaceRow('subtle', 'medium tint'),
      surfaceRow('bold', 'full accent colour'),
      _sectionLabel(
        context,
        'bold + icons — Low (ghost) focus halo inner gap matches the bold surface fill '
        '(not page white), so label + ring stay readable on transparent fills. '
        'Token focus halo when FocusHighlightMode.traditional '
        '(desktop-style pointer/keyboard); touch-first embeddings often omit the drawn ring '
        'while focus + semantics remain correct — same Flutter behaviour on mobile emulators '
        'and devices.',
      ),
      SizedBox(height: _storyGap(context)),
      OneUiSurface(
        mode: 'bold',
        padding: EdgeInsets.all(pad),
        borderRadius: BorderRadius.circular(12),
        child: Wrap(
          spacing: gap,
          children: const [
            OneUiButton(
              label: 'High focused',
              attention: OneUiButtonAttention.high,
              start: OneUiButtonSlotIcon(),
              end: OneUiButtonSlotIcon(),
              forceFocusRing: true,
            ),
            OneUiButton(
              label: 'Medium focused',
              attention: OneUiButtonAttention.medium,
              start: OneUiButtonSlotIcon(),
              end: OneUiButtonSlotIcon(),
              forceFocusRing: true,
            ),
            OneUiButton(
              label: 'Low focused',
              attention: OneUiButtonAttention.low,
              start: OneUiButtonSlotIcon(),
              end: OneUiButtonSlotIcon(),
              forceFocusRing: true,
            ),
          ],
        ),
      ),
    ],
  );
}

Widget buttonTypographyTokensSection(BuildContext context) {
  final gap = _storyGap(context);

  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      _caption(
        context,
        'Brand `--Button-textTransform` is matched case-insensitively (e.g. `Uppercase` → SHOUT). '
        '`--Button-letterSpacing` accepts em, px, rem (×14px base), and ch (× font-size × 0.5). '
        'When `--Button-textColor-ghost` resolves to transparent, label uses role `tintedA11y`; '
        'ghost hover keeps readable text (does not re-chain through the transparent token). '
        'Hover ghost rows on desktop to verify.',
      ),
      SizedBox(height: gap),
      _sectionLabel(context, 'textTransform — mixed-case token'),
      SizedBox(height: gap),
      Wrap(
        spacing: gap,
        runSpacing: gap,
        crossAxisAlignment: WrapCrossAlignment.center,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              const OneUiButton(
                  label: 'shout', attention: OneUiButtonAttention.high),
              SizedBox(height: gap * 0.5),
              _caption(context, 'default (none)'),
            ],
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              _buttonScopeWithOverrides(
                context,
                componentOverrides: const {
                  '--Button-textTransform': 'Uppercase'
                },
                child: const OneUiButton(
                    label: 'shout', attention: OneUiButtonAttention.high),
              ),
              SizedBox(height: gap * 0.5),
              _caption(context, '`--Button-textTransform: Uppercase`'),
            ],
          ),
        ],
      ),
      SizedBox(height: _storyGapLarge(context)),
      _sectionLabel(context, 'letterSpacing — rem & ch units'),
      SizedBox(height: gap),
      Wrap(
        spacing: gap,
        runSpacing: gap,
        crossAxisAlignment: WrapCrossAlignment.center,
        children: [
          _buttonScopeWithOverrides(
            context,
            componentOverrides: const {
              '--Button-textTransform': 'uppercase',
              '--Button-letterSpacing': '0.05rem',
            },
            child: const OneUiButton(
                label: 'rem spacing', attention: OneUiButtonAttention.medium),
          ),
          _buttonScopeWithOverrides(
            context,
            componentOverrides: const {
              '--Button-textTransform': 'uppercase',
              '--Button-letterSpacing': '0.08ch',
            },
            child: const OneUiButton(
                label: 'ch spacing', attention: OneUiButtonAttention.medium),
          ),
        ],
      ),
      SizedBox(height: _storyGapLarge(context)),
      _sectionLabel(context, 'ghost — transparent text token + hover'),
      SizedBox(height: gap),
      Wrap(
        spacing: gap,
        runSpacing: gap,
        children: [
          _buttonScopeWithOverrides(
            context,
            componentOverrides: const {
              '--Button-textColor-ghost': 'transparent'
            },
            child: const OneUiButton(
                label: 'Ghost hover', attention: OneUiButtonAttention.low),
          ),
          OneUiSurface(
            mode: 'bold',
            padding: EdgeInsets.all(gap),
            borderRadius: BorderRadius.circular(12),
            child: _buttonScopeWithOverrides(
              context,
              componentOverrides: const {
                '--Button-textColor-ghost': 'transparent'
              },
              child: const OneUiButton(
                label: 'Ghost on bold',
                attention: OneUiButtonAttention.low,
              ),
            ),
          ),
        ],
      ),
    ],
  );
}

Widget buttonThemesSection(BuildContext context) {
  final isDark = Theme.of(context).brightness == Brightness.dark;
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      _caption(
        context,
        'Active Material theme: ${isDark ? 'dark' : 'light'} (toggle via OS / app theme). '
        'Web renders light + dark blocks side-by-side. '
        'Attention level samples live under the Attention Levels story — not duplicated here.',
      ),
    ],
  );
}

Widget buttonDensitySection(BuildContext context) {
  final parent = OneUiScope.of(context);
  final densities = ['compact', 'default', 'open'];

  return Row(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      for (final d in densities)
        Expanded(
          child: OneUiScope(
            platformId: parent.platformId,
            density: d,
            platformsFoundationConfig: parent.platformsFoundationConfig,
            designSystem: parent.designSystem,
            nativeTypography: parent.nativeTypography,
            buttonOrnament: parent.buttonOrnament,
            typographyConfig: parent.typographyConfig,
            customFonts: parent.customFonts,
            foundationAccentColor: parent.foundationAccentColor,
            child: Padding(
              padding: EdgeInsets.only(right: d == 'open' ? 0 : 8),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _sectionLabel(context, d),
                  SizedBox(height: _storyGap(context)),
                  const OneUiButton(label: 'Small', size: 8),
                  SizedBox(height: _storyGap(context)),
                  const OneUiButton(label: 'Medium', size: 10),
                  SizedBox(height: _storyGap(context)),
                  const OneUiButton(label: 'Large', size: 12),
                ],
              ),
            ),
          ),
        ),
    ],
  );
}

Widget buttonLoadingWithSlotsSection(BuildContext context) {
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      Wrap(
        spacing: _storyGap(context),
        children: const [
          OneUiButton(
              label: 'Loading',
              loading: true,
              attention: OneUiButtonAttention.high),
          OneUiButton(
              label: 'Loading',
              loading: true,
              attention: OneUiButtonAttention.medium),
          OneUiButton(
              label: 'Loading',
              loading: true,
              attention: OneUiButtonAttention.low),
        ],
      ),
      SizedBox(height: _storyGapLarge(context)),
      Wrap(
        spacing: _storyGap(context),
        children: const [
          OneUiButton(
              label: 'With Start', loading: true, start: OneUiButtonSlotIcon()),
          OneUiButton(
              label: 'With End', loading: true, end: OneUiButtonSlotIcon()),
          OneUiButton(
            label: 'Both',
            loading: true,
            start: OneUiButtonSlotIcon(),
            end: OneUiButtonSlotIcon(),
          ),
        ],
      ),
    ],
  );
}

Widget buttonMotionSection(BuildContext context) {
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      _caption(
        context,
        'Pointer press applies token shrink matching web `:active`. Scale tokens '
        '(overridable per brand via Convex): `--Motion-Tap-Scale-XS` 7% (size 6), '
        '`--Motion-Tap-Scale-Default` 3% (S/M/L), `--Motion-Tap-Scale-FullWidth` 1%. '
        'Duration + easing from Button overrides or `--Motion-Duration-M` + '
        '`--Motion-Easing-Transition-Moderate`. Respect system reduced-motion (animations snap). '
        'Press and hold each button to see scale.',
      ),
      SizedBox(height: _storyGap(context)),
      Wrap(
        spacing: _storyGap(context),
        runSpacing: _storyGap(context),
        crossAxisAlignment: WrapCrossAlignment.end,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              const OneUiButton(label: 'XS tap scale', size: 6),
              SizedBox(height: _storyGap(context) * 0.5),
              _caption(context, 'size 6 → 7% (scale 0.93)'),
            ],
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              const OneUiButton(label: 'Default scale', size: 10),
              SizedBox(height: _storyGap(context) * 0.5),
              _caption(context, 'S/M/L → 3% (scale 0.97)'),
            ],
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              SizedBox(
                width: 280,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: const [
                    OneUiButton(
                      label: 'Full-width scale',
                      size: 10,
                      fullWidth: true,
                    ),
                  ],
                ),
              ),
              SizedBox(height: _storyGap(context) * 0.5),
              _caption(context, 'fullWidth → 1% (scale 0.99)'),
            ],
          ),
        ],
      ),
    ],
  );
}

Widget buttonInteractiveSection(BuildContext context) {
  return Builder(
    builder: (context) {
      void showPressed(String via) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
              content: Text('Button pressed ($via)'),
              duration: const Duration(seconds: 1)),
        );
      }

      return Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          _caption(
            context,
            'Pointer tap, or focus with Tab then activate with Enter / Space (web/RN parity).',
          ),
          SizedBox(height: _storyGap(context)),
          OneUiButton(
            label: 'Click me',
            attention: OneUiButtonAttention.high,
            size: 10,
            autofocus: true,
            onPressed: () => showPressed('pointer or keyboard'),
          ),
        ],
      );
    },
  );
}

Widget buttonResponsiveSection(BuildContext context) {
  final gap = _storyGap(context);
  return SizedBox(
    width: double.infinity,
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const OneUiButton(
          label: 'Full-Width Action',
          size: 12,
          fullWidth: true,
        ),
        SizedBox(height: gap),
        Wrap(
          spacing: gap,
          children: const [
            OneUiButton(
              label: 'Cancel',
              size: 8,
              attention: OneUiButtonAttention.low,
            ),
            OneUiButton(
              label: 'Confirm',
              size: 8,
              attention: OneUiButtonAttention.high,
            ),
          ],
        ),
      ],
    ),
  );
}
