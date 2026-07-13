import 'package:flutter/widgets.dart';
import 'package:ui_flutter/widgets/one_ui_badge.dart';

import '../qa/component_test_stability.dart';

/// Catalog / detail stability badge — mirrors React `CatalogCardStabilityBadge`.
class QaStabilityBadge extends StatelessWidget {
  const QaStabilityBadge({
    required this.stability,
    this.compact = false,
    super.key,
  });

  final QaComponentTestStability stability;
  final bool compact;

  @override
  Widget build(BuildContext context) {
    final appearance = switch (stability) {
      QaComponentTestStability.stable => 'positive',
      QaComponentTestStability.unstable => 'negative',
      QaComponentTestStability.underDevelopment => 'neutral',
    };

    return OneUiBadge(
      size: compact ? 'xs' : 's',
      attention: 'medium',
      appearance: appearance,
      semanticsLabel: '${stability.badgeLabel} component status',
      child: stability.badgeLabel,
    );
  }
}
