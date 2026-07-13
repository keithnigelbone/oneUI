import 'package:flutter/material.dart';

import '../theme/one_ui_scope.dart';
import '../tokens/dimension_scale.dart';
import '../widgets/one_ui_bottom_navigation.dart';
import '../widgets/one_ui_bottom_navigation_types.dart';
import '../widgets/one_ui_surface.dart';
import 'bottom_navigation_brand_bind.dart';

/// Mobile-frame wrapper — no explicit background so surface context cascades.
Widget bottomNavMobileFrame(
  BuildContext context, {
  required Widget child,
  required String instanceKey,
  double width = 360,
  String appearance = 'primary',
}) {
  final radius = getSpacingTokenPx(
    spacingName: '4-5',
    platform: OneUiScope.of(context).platformId,
    density: OneUiScope.of(context).density,
    platformsConfig: OneUiScope.of(context).platformsFoundationConfig,
  );
  return ClipRRect(
    borderRadius: BorderRadius.circular(radius),
    child: SizedBox(
      width: width,
      child: bottomNavigationBrandKeyed(
        context,
        instanceKey: instanceKey,
        appearance: appearance,
        child: child,
      ),
    ),
  );
}

TextStyle _storyCaptionStyle(BuildContext context) {
  final typo = OneUiScope.nativeTypographyOf(context);
  return typo?.emphasisStyle('label', 'S', emphasis: 'low') ??
      Theme.of(context).textTheme.labelSmall?.copyWith(
            color: Theme.of(context).colorScheme.onSurfaceVariant,
          ) ??
      const TextStyle(fontSize: 12);
}

Widget _storyCaption(BuildContext context, String text) {
  return Text(text, style: _storyCaptionStyle(context));
}

double _gap(BuildContext context, String tail) {
  return getSpacingTokenPx(
    spacingName: tail,
    platform: OneUiScope.of(context).platformId,
    density: OneUiScope.of(context).density,
    platformsConfig: OneUiScope.of(context).platformsFoundationConfig,
  );
}

const _itemDefs = <({String value, String label, String icon})>[
  (value: 'home', label: 'Home', icon: 'home'),
  (value: 'search', label: 'Search', icon: 'search'),
  (value: 'explore', label: 'Explore', icon: 'globe'),
  (value: 'inbox', label: 'Inbox', icon: 'mail'),
  (value: 'profile', label: 'Profile', icon: 'user'),
];

Widget bottomNavigationDefaultSection(BuildContext context) {
  return bottomNavMobileFrame(
    context,
    instanceKey: 'default-showcase',
    child: OneUiBottomNavigation(
      semanticsLabel: 'Primary',
      defaultValue: 'search',
      children: const [
        OneUiBottomNavItem(value: 'home', icon: 'home', label: 'Home'),
        OneUiBottomNavItem(value: 'search', icon: 'search', label: 'Search'),
        OneUiBottomNavItem(value: 'profile', icon: 'user', label: 'Profile'),
      ],
    ),
  );
}

Widget bottomNavigationLabelTypesSection(BuildContext context) {
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      for (final type in kOneUiBottomNavLabelTypes) ...[
        _storyCaption(context, 'labelType = $type'),
        SizedBox(height: _gap(context, '3')),
        bottomNavMobileFrame(
          context,
          instanceKey: 'label-type-$type',
          child: OneUiBottomNavigation(
            semanticsLabel: 'Primary $type',
            labelType: type,
            defaultValue: 'home',
            children: [
              OneUiBottomNavItem(
                value: 'home',
                icon: 'home',
                label: 'Home',
                semanticsLabel: 'Home',
              ),
              OneUiBottomNavItem(
                value: 'search',
                icon: 'search',
                label: 'Search',
                semanticsLabel: 'Search',
              ),
              OneUiBottomNavItem(
                value: 'inbox',
                icon: 'mail',
                label: 'Notifications and messages',
                semanticsLabel: 'Inbox',
              ),
              OneUiBottomNavItem(
                value: 'profile',
                icon: 'user',
                label: 'Profile',
                semanticsLabel: 'Profile',
              ),
            ],
          ),
        ),
        SizedBox(height: _gap(context, '5')),
      ],
    ],
  );
}

Widget bottomNavigationItemCountsSection(BuildContext context) {
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      for (final n in [2, 3, 4, 5]) ...[
        _storyCaption(context, '$n items'),
        SizedBox(height: _gap(context, '3')),
        bottomNavMobileFrame(
          context,
          instanceKey: 'item-count-$n',
          child: OneUiBottomNavigation(
            semanticsLabel: 'Primary $n',
            defaultValue: _itemDefs.first.value,
            children: [
              for (final def in _itemDefs.take(n))
                OneUiBottomNavItem(
                  value: def.value,
                  icon: def.icon,
                  label: def.label,
                ),
            ],
          ),
        ),
        SizedBox(height: _gap(context, '5')),
      ],
    ],
  );
}

Widget bottomNavigationStatesSection(BuildContext context) {
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      bottomNavMobileFrame(
        context,
        instanceKey: 'states-default',
        child: const OneUiBottomNavigation(
          semanticsLabel: 'States default',
          children: [
            OneUiBottomNavItem(value: 'home', icon: 'home', label: 'Home'),
            OneUiBottomNavItem(
                value: 'search', icon: 'search', label: 'Search'),
            OneUiBottomNavItem(
                value: 'profile', icon: 'user', label: 'Profile'),
          ],
        ),
      ),
      SizedBox(height: _gap(context, '5')),
      bottomNavMobileFrame(
        context,
        instanceKey: 'states-active',
        child: const OneUiBottomNavigation(
          semanticsLabel: 'States active',
          defaultValue: 'home',
          children: [
            OneUiBottomNavItem(value: 'home', icon: 'home', label: 'Home'),
            OneUiBottomNavItem(
                value: 'search', icon: 'search', label: 'Search'),
            OneUiBottomNavItem(
                value: 'profile', icon: 'user', label: 'Profile'),
          ],
        ),
      ),
      SizedBox(height: _gap(context, '5')),
      bottomNavMobileFrame(
        context,
        instanceKey: 'states-disabled',
        child: const OneUiBottomNavigation(
          semanticsLabel: 'States disabled',
          children: [
            OneUiBottomNavItem(value: 'home', icon: 'home', label: 'Home'),
            OneUiBottomNavItem(
              value: 'search',
              icon: 'search',
              label: 'Search',
              disabled: true,
            ),
            OneUiBottomNavItem(
                value: 'profile', icon: 'user', label: 'Profile'),
          ],
        ),
      ),
    ],
  );
}

Widget bottomNavigationFocusStateSection(BuildContext context) {
  return Wrap(
    spacing: _gap(context, '5'),
    runSpacing: _gap(context, '5'),
    crossAxisAlignment: WrapCrossAlignment.end,
    children: [
      Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          bottomNavMobileFrame(
            context,
            instanceKey: 'focus-idle',
            child: const OneUiBottomNavigation(
              semanticsLabel: 'Idle state',
              defaultValue: 'home',
              children: [
                OneUiBottomNavItem(value: 'home', icon: 'home', label: 'Home'),
                OneUiBottomNavItem(
                    value: 'search', icon: 'search', label: 'Search'),
                OneUiBottomNavItem(
                    value: 'profile', icon: 'user', label: 'Profile'),
              ],
            ),
          ),
          SizedBox(height: _gap(context, '3')),
          _storyCaption(context, 'Idle'),
        ],
      ),
      Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          bottomNavMobileFrame(
            context,
            instanceKey: 'focus-ring',
            child: const OneUiBottomNavigation(
              semanticsLabel: 'Focus state',
              defaultValue: 'home',
              children: [
                OneUiBottomNavItem(
                  value: 'home',
                  icon: 'home',
                  label: 'Home',
                  forceFocusRing: true,
                ),
                OneUiBottomNavItem(
                    value: 'search', icon: 'search', label: 'Search'),
                OneUiBottomNavItem(
                    value: 'profile', icon: 'user', label: 'Profile'),
              ],
            ),
          ),
          SizedBox(height: _gap(context, '3')),
          _storyCaption(context, 'Focus'),
        ],
      ),
    ],
  );
}

Widget bottomNavigationWithIconsSection(BuildContext context) {
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      _storyCaption(context, 'Default active color shift'),
      SizedBox(height: _gap(context, '3')),
      bottomNavMobileFrame(
        context,
        instanceKey: 'icons-swap',
        child: const OneUiBottomNavigation(
          semanticsLabel: 'Icon swap',
          defaultValue: 'home',
          children: [
            OneUiBottomNavItem(value: 'home', icon: 'home', label: 'Home'),
            OneUiBottomNavItem(value: 'cart', icon: 'bookmark', label: 'Saved'),
            OneUiBottomNavItem(
                value: 'profile', icon: 'user', label: 'Profile'),
          ],
        ),
      ),
      SizedBox(height: _gap(context, '5')),
      _storyCaption(context, 'Appearance primary, different icons'),
      SizedBox(height: _gap(context, '3')),
      bottomNavMobileFrame(
        context,
        instanceKey: 'icons-single',
        child: const OneUiBottomNavigation(
          semanticsLabel: 'Single icon',
          defaultValue: 'explore',
          children: [
            OneUiBottomNavItem(
                value: 'explore', icon: 'globe', label: 'Explore'),
            OneUiBottomNavItem(value: 'inbox', icon: 'mail', label: 'Inbox'),
            OneUiBottomNavItem(
                value: 'profile', icon: 'user', label: 'Profile'),
          ],
        ),
      ),
    ],
  );
}

Widget bottomNavigationResponsiveSection(BuildContext context) {
  return Wrap(
    spacing: _gap(context, '6'),
    runSpacing: _gap(context, '5'),
    crossAxisAlignment: WrapCrossAlignment.start,
    children: [
      Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _storyCaption(context, 'Phone (360)'),
          SizedBox(height: _gap(context, '3')),
          bottomNavMobileFrame(
            context,
            instanceKey: 'responsive-phone',
            width: 360,
            child: const OneUiBottomNavigation(
              semanticsLabel: 'Phone',
              defaultValue: 'home',
              children: [
                OneUiBottomNavItem(value: 'home', icon: 'home', label: 'Home'),
                OneUiBottomNavItem(
                    value: 'search', icon: 'search', label: 'Search'),
                OneUiBottomNavItem(
                    value: 'profile', icon: 'user', label: 'Profile'),
              ],
            ),
          ),
        ],
      ),
      Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _storyCaption(context, 'Tablet (720)'),
          SizedBox(height: _gap(context, '3')),
          bottomNavMobileFrame(
            context,
            instanceKey: 'responsive-tablet',
            width: 720,
            child: const OneUiBottomNavigation(
              semanticsLabel: 'Tablet',
              defaultValue: 'home',
              children: [
                OneUiBottomNavItem(value: 'home', icon: 'home', label: 'Home'),
                OneUiBottomNavItem(
                    value: 'search', icon: 'search', label: 'Search'),
                OneUiBottomNavItem(
                    value: 'profile', icon: 'user', label: 'Profile'),
                OneUiBottomNavItem(
                    value: 'saved', icon: 'bookmark', label: 'Saved'),
                OneUiBottomNavItem(value: 'more', icon: 'menu', label: 'More'),
              ],
            ),
          ),
        ],
      ),
    ],
  );
}

Widget bottomNavigationSurfaceModesSection(BuildContext context) {
  const modes = [
    ('default', 'default'),
    ('minimal', 'minimal'),
    ('subtle', 'subtle'),
    ('moderate', 'moderate'),
    ('bold', 'bold'),
    ('elevated', 'elevated'),
  ];
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      for (final (mode, label) in modes) ...[
        Wrap(
          crossAxisAlignment: WrapCrossAlignment.center,
          spacing: _gap(context, '4-5'),
          runSpacing: _gap(context, '3'),
          children: [
            SizedBox(
              width: 90,
              child: _storyCaption(context, label),
            ),
            bottomNavMobileFrame(
              context,
              instanceKey: 'surface-$mode',
              child: OneUiSurface(
                mode: mode,
                padding: EdgeInsets.zero,
                borderRadius: BorderRadius.circular(
                  getSpacingTokenPx(
                    spacingName: '4-5',
                    platform: OneUiScope.of(context).platformId,
                    density: OneUiScope.of(context).density,
                    platformsConfig:
                        OneUiScope.of(context).platformsFoundationConfig,
                  ),
                ),
                child: OneUiBottomNavigation(
                  semanticsLabel: 'Surface $label',
                  defaultValue: 'home',
                  children: const [
                    OneUiBottomNavItem(
                        value: 'home', icon: 'home', label: 'Home'),
                    OneUiBottomNavItem(
                        value: 'search', icon: 'search', label: 'Search'),
                    OneUiBottomNavItem(
                        value: 'profile', icon: 'user', label: 'Profile'),
                  ],
                ),
              ),
            ),
          ],
        ),
        SizedBox(height: _gap(context, '4-5')),
      ],
    ],
  );
}

Widget bottomNavigationAppearancesSection(BuildContext context) {
  const appearances = ['primary', 'secondary', 'sparkle', 'positive'];
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      for (final app in appearances) ...[
        _storyCaption(
          context,
          app[0].toUpperCase() + app.substring(1),
        ),
        SizedBox(height: _gap(context, '3')),
        bottomNavMobileFrame(
          context,
          instanceKey: 'appearance-$app',
          appearance: app,
          child: OneUiBottomNavigation(
            semanticsLabel: 'Appearance $app',
            appearance: app,
            defaultValue: 'home',
            children: const [
              OneUiBottomNavItem(value: 'home', icon: 'home', label: 'Home'),
              OneUiBottomNavItem(
                  value: 'search', icon: 'search', label: 'Search'),
              OneUiBottomNavItem(
                  value: 'profile', icon: 'user', label: 'Profile'),
            ],
          ),
        ),
        SizedBox(height: _gap(context, '5')),
      ],
    ],
  );
}
