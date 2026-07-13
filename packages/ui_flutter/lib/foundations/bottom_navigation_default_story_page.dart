import 'package:flutter/material.dart';

import '../theme/one_ui_scope.dart';
import '../tokens/dimension_scale.dart';
import '../widgets/one_ui_bottom_navigation.dart';
import '../widgets/one_ui_bottom_navigation_types.dart';
import 'bottom_navigation_brand_bind.dart';
import 'bottom_navigation_showcase.dart';

/// React `Default` story — argTypes-style controls + uncontrolled preview.
class BottomNavigationDefaultStoryPage extends StatefulWidget {
  const BottomNavigationDefaultStoryPage({super.key});

  @override
  State<BottomNavigationDefaultStoryPage> createState() =>
      _BottomNavigationDefaultStoryPageState();
}

class _BottomNavigationDefaultStoryPageState
    extends State<BottomNavigationDefaultStoryPage> {
  OneUiBottomNavigationLabelType _labelType = kOneUiBottomNavLabel1Line;
  bool _showDivider = true;
  String _appearance = 'primary';

  double _gap(BuildContext context, String tail) {
    return getSpacingTokenPx(
      spacingName: tail,
      platform: OneUiScope.of(context).platformId,
      density: OneUiScope.of(context).density,
      platformsConfig: OneUiScope.of(context).platformsFoundationConfig,
    );
  }

  @override
  Widget build(BuildContext context) {
    bindBottomNavigationBrandScope(context);
    final brandKey = bottomNavigationBrandScopeKey(
      context,
      appearance: _appearance,
    );
    final typo = OneUiScope.nativeTypographyOf(context);
    final caption = typo?.emphasisStyle('label', 'S', emphasis: 'low') ??
        Theme.of(context).textTheme.labelSmall;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Wrap(
            spacing: _gap(context, '4'),
            runSpacing: _gap(context, '3'),
            crossAxisAlignment: WrapCrossAlignment.center,
            children: [
              DropdownButton<OneUiBottomNavigationLabelType>(
                value: _labelType,
                items: [
                  for (final t in kOneUiBottomNavLabelTypes)
                    DropdownMenuItem(value: t, child: Text('labelType: $t')),
                ],
                onChanged: (v) {
                  if (v != null) setState(() => _labelType = v);
                },
              ),
              Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Switch(
                    value: _showDivider,
                    onChanged: (v) => setState(() => _showDivider = v),
                  ),
                  Text('showDivider', style: caption),
                ],
              ),
              DropdownButton<String>(
                value: _appearance,
                items: const [
                  DropdownMenuItem(
                      value: 'auto', child: Text('appearance: auto')),
                  DropdownMenuItem(
                      value: 'primary', child: Text('appearance: primary')),
                  DropdownMenuItem(
                    value: 'secondary',
                    child: Text('appearance: secondary'),
                  ),
                  DropdownMenuItem(
                      value: 'neutral', child: Text('appearance: neutral')),
                  DropdownMenuItem(
                      value: 'sparkle', child: Text('appearance: sparkle')),
                  DropdownMenuItem(
                    value: 'brand-bg',
                    child: Text('appearance: brand-bg'),
                  ),
                  DropdownMenuItem(
                      value: 'positive', child: Text('appearance: positive')),
                  DropdownMenuItem(
                      value: 'negative', child: Text('appearance: negative')),
                  DropdownMenuItem(
                      value: 'warning', child: Text('appearance: warning')),
                  DropdownMenuItem(
                    value: 'informative',
                    child: Text('appearance: informative'),
                  ),
                ],
                onChanged: (v) {
                  if (v != null) setState(() => _appearance = v);
                },
              ),
            ],
          ),
          SizedBox(height: _gap(context, '4')),
          bottomNavMobileFrame(
            context,
            instanceKey: 'default-story',
            appearance: _appearance,
            child: OneUiBottomNavigation(
              key: ValueKey(
                  'bn-default-$brandKey-$_labelType-$_showDivider-$_appearance'),
              semanticsLabel: 'Primary',
              labelType: _labelType,
              showDivider: _showDivider,
              appearance: _appearance,
              defaultValue: 'search',
              children: const [
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
    );
  }
}
