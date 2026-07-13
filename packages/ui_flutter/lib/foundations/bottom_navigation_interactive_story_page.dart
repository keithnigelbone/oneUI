import 'package:flutter/material.dart';

import '../theme/one_ui_scope.dart';
import '../tokens/dimension_scale.dart';
import '../widgets/one_ui_bottom_navigation.dart';
import 'bottom_navigation_brand_bind.dart';
import 'bottom_navigation_showcase.dart';

/// Web `Interactive` story — controlled value with active readout.
class BottomNavigationInteractiveStoryPage extends StatefulWidget {
  const BottomNavigationInteractiveStoryPage({super.key});

  @override
  State<BottomNavigationInteractiveStoryPage> createState() =>
      _BottomNavigationInteractiveStoryPageState();
}

class _BottomNavigationInteractiveStoryPageState
    extends State<BottomNavigationInteractiveStoryPage> {
  String _value = 'home';

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
    final brandKey = bottomNavigationBrandScopeKey(context);
    final typo = OneUiScope.nativeTypographyOf(context);
    final caption = typo?.emphasisStyle('label', 'S', emphasis: 'low') ??
        Theme.of(context).textTheme.labelSmall;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text.rich(
            TextSpan(
              style: caption,
              children: [
                const TextSpan(text: 'Active: '),
                TextSpan(
                  text: _value,
                  style: caption?.copyWith(fontWeight: FontWeight.w600),
                ),
              ],
            ),
            key: const Key('active-value'),
          ),
          SizedBox(height: _gap(context, '4')),
          bottomNavMobileFrame(
            context,
            instanceKey: 'interactive-story',
            child: OneUiBottomNavigation(
              key: ValueKey('bn-interactive-$brandKey-$_value'),
              semanticsLabel: 'Controlled',
              value: _value,
              onValueChange: (v) => setState(() => _value = v),
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
