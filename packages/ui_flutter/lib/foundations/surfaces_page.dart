import 'package:flutter/material.dart';

import '../engine/surface_engine.dart';
import '../widgets/one_ui_button.dart';
import '../widgets/one_ui_surface.dart';

/// Which Surfaces foundation story to show — matches web `Surfaces.stories.tsx` exports
/// (`AllModes`, `NestedStacking`, `OnBoldInversion`) via the Flutter Storybook sidebar.
enum SurfacesFoundationStory {
  allModes,
  nestedStacking,
  onBoldInversion,
}

/// Foundations / Surfaces — behavioral parity with `apps/storybook/.../Surfaces.stories.tsx`.
///
/// Uses the same `resolveSurface` → `resolveNativeContextRoles` pipeline as
/// React Native `SurfaceContext.tsx` (ported from `packages/shared/src/engine/surfaceNew.ts`).
///
/// Sample controls use **[OneUiButton]** (Convex `designSystem.componentCustomProperties`), matching
/// web `apps/storybook/.../Surfaces.stories.tsx` which uses **`Button`** from `@oneui/ui`.
///
/// The active story is chosen from the app sidebar, not in-page tabs.
class SurfacesFoundationsPage extends StatelessWidget {
  const SurfacesFoundationsPage({super.key, required this.story});

  final SurfacesFoundationStory story;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Text(
          'Surface algorithm matches `surfaceNew.ts`: parent step, contrast '
          'direction, relative offsets (minimal/subtle/moderate), bold anchor '
          'vs fallback, elevated +100 toward light, on-bold / on-subtle content '
          're-resolution (`allowScalePalette` in `resolveContentFull`). '
          'No-brand Storybook uses greyscale palettes for neutral+primary (${kSurfaceSteps.length} steps), '
          'same visual language as web default brand.',
          style: Theme.of(context)
              .textTheme
              .bodySmall
              ?.copyWith(color: scheme.onSurfaceVariant),
        ),
        const SizedBox(height: 16),
        switch (story) {
          SurfacesFoundationStory.allModes => const _AllModesBody(),
          SurfacesFoundationStory.nestedStacking => const _NestedStackBody(),
          SurfacesFoundationStory.onBoldInversion => const _OnBoldBody(),
        },
      ],
    );
  }
}

/// Mirrors web `Surfaces.stories.tsx` BG_MODES — no moderate/ghost/elevated in this grid.
const List<String> _bgModes = [
  kSurfaceDefault,
  kSurfaceMinimal,
  kSurfaceSubtle,
  kSurfaceBold,
];

const Map<String, String> _modeDescriptions = {
  kSurfaceDefault: 'Page background. No surface override.',
  kSurfaceMinimal: 'Container — lightest tint.',
  kSurfaceSubtle: 'Container — subtle tint.',
  kSurfaceBold: 'Container — bold accent. Triggers on-bold inversion.',
  kSurfaceElevated: 'Floating surface (cards). +1 step toward light, capped.',
  kSurfaceGhost: 'Same step as parent; transparent fill.',
};

/// Bold / subtle / ghost row — aligns with web `Surfaces.stories.tsx` (`size="small"` → Flutter `8`;
/// default size story uses `10`).
class _SurfaceStoryButtonRow extends StatelessWidget {
  const _SurfaceStoryButtonRow({
    required this.dense,
    this.appearance = 'primary',
  });

  final bool dense;

  /// Role passed through to each [OneUiButton] (`primary` matches web defaults).
  final String appearance;

  @override
  Widget build(BuildContext context) {
    final size = dense ? 8 : 10;
    return Wrap(
      spacing: dense ? 6 : 10,
      runSpacing: dense ? 6 : 10,
      children: [
        OneUiButton(
          label: 'Bold',
          variant: OneUiButtonVariant.bold,
          size: size,
          appearance: appearance,
          onPressed: () {},
        ),
        OneUiButton(
          label: 'Subtle',
          variant: OneUiButtonVariant.subtle,
          size: size,
          appearance: appearance,
          onPressed: () {},
        ),
        OneUiButton(
          label: 'Ghost',
          variant: OneUiButtonVariant.ghost,
          size: size,
          appearance: appearance,
          onPressed: () {},
        ),
      ],
    );
  }
}

class _AllModesBody extends StatelessWidget {
  const _AllModesBody();

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(
          'Background surface modes',
          style: Theme.of(context).textTheme.titleMedium,
        ),
        const SizedBox(height: 8),
        Text(
          'All BG-family container modes. Each cell is an [OneUiSurface] with a Bold / Subtle / Ghost '
          '[OneUiButton] row (Convex component tokens — same pipeline as React `Button`). '
          'Matches web: default, minimal, subtle, bold only.',
          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: Theme.of(context).colorScheme.onSurfaceVariant,
              ),
        ),
        const SizedBox(height: 16),
        Wrap(
          spacing: 12,
          runSpacing: 12,
          children: [
            for (final mode in _bgModes)
              SizedBox(
                width: 280,
                child: OneUiSurface(
                  mode: mode,
                  appearance: 'primary',
                  borderRadius: BorderRadius.circular(12),
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('mode="$mode"',
                          style: Theme.of(context).textTheme.labelSmall),
                      const SizedBox(height: 4),
                      Text(
                        _modeDescriptions[mode] ?? '',
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                              color: Theme.of(context)
                                  .colorScheme
                                  .onSurfaceVariant,
                            ),
                      ),
                      const SizedBox(height: 12),
                      const _SurfaceStoryButtonRow(dense: true),
                    ],
                  ),
                ),
              ),
          ],
        ),
      ],
    );
  }
}

class _NestedStackBody extends StatelessWidget {
  const _NestedStackBody();

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(
          'Nested stacking',
          style: Theme.of(context).textTheme.titleMedium,
        ),
        const SizedBox(height: 8),
        Text(
          'default → minimal → subtle → bold (innermost). Each [OneUiSurface] '
          're-runs `resolveNativeContextRoles` at its container step — same as RN.',
          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: Theme.of(context).colorScheme.onSurfaceVariant,
              ),
        ),
        const SizedBox(height: 16),
        OneUiSurface(
          mode: kSurfaceDefault,
          appearance: 'primary',
          borderRadius: BorderRadius.circular(12),
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('mode="$kSurfaceDefault"',
                  style: Theme.of(context).textTheme.labelSmall),
              OneUiSurface(
                mode: kSurfaceMinimal,
                appearance: 'primary',
                borderRadius: BorderRadius.circular(12),
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('mode="$kSurfaceMinimal"',
                        style: Theme.of(context).textTheme.labelSmall),
                    OneUiSurface(
                      mode: kSurfaceSubtle,
                      appearance: 'primary',
                      borderRadius: BorderRadius.circular(12),
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('mode="$kSurfaceSubtle"',
                              style: Theme.of(context).textTheme.labelSmall),
                          OneUiSurface(
                            mode: kSurfaceBold,
                            appearance: 'primary',
                            borderRadius: BorderRadius.circular(12),
                            padding: const EdgeInsets.all(16),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text('mode="$kSurfaceBold"',
                                    style:
                                        Theme.of(context).textTheme.labelSmall),
                                const SizedBox(height: 8),
                                const _SurfaceStoryButtonRow(dense: true),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _OnBoldBody extends StatelessWidget {
  const _OnBoldBody();

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(
          'On-bold inversion',
          style: Theme.of(context).textTheme.titleMedium,
        ),
        const SizedBox(height: 8),
        Text(
          'Compare default vs bold containers — [OneUiButton] variants remap via '
          'nested `OneUiSurfaceScope` tokens (`onBoldContent` vs page content).',
          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: Theme.of(context).colorScheme.onSurfaceVariant,
              ),
        ),
        const SizedBox(height: 16),
        for (final mode in [kSurfaceDefault, kSurfaceBold])
          Padding(
            padding: const EdgeInsets.only(bottom: 16),
            child: OneUiSurface(
              mode: mode,
              appearance: 'primary',
              borderRadius: BorderRadius.circular(16),
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('<Surface mode="$mode">',
                      style: Theme.of(context).textTheme.labelSmall),
                  const SizedBox(height: 12),
                  const _SurfaceStoryButtonRow(dense: false),
                ],
              ),
            ),
          ),
      ],
    );
  }
}
