import 'package:flutter/widgets.dart';

/// No-op on non-web targets.
class OneUiWebAriaDescribedByBinder extends StatelessWidget {
  const OneUiWebAriaDescribedByBinder({
    super.key,
    required this.controlIdentifier,
    required this.ariaDescribedBy,
    required this.child,
  });

  final String controlIdentifier;
  final String? ariaDescribedBy;
  final Widget child;

  @override
  Widget build(BuildContext context) => child;
}
