// ignore: avoid_web_libraries_in_flutter
import 'dart:html' as html;

import 'package:flutter/scheduler.dart';
import 'package:flutter/widgets.dart';

/// Patches `aria-describedby` on the native `<input>` for Flutter web.
///
/// Semantics [controlsNodes] only maps to `aria-controls` today; this binder
/// sets the WCAG-correct attribute until framework support lands.
class OneUiWebAriaDescribedByBinder extends StatefulWidget {
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
  State<OneUiWebAriaDescribedByBinder> createState() =>
      _OneUiWebAriaDescribedByBinderState();
}

class _OneUiWebAriaDescribedByBinderState
    extends State<OneUiWebAriaDescribedByBinder> {
  @override
  void initState() {
    super.initState();
    _schedulePatch();
  }

  @override
  void didUpdateWidget(covariant OneUiWebAriaDescribedByBinder oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.controlIdentifier != widget.controlIdentifier ||
        oldWidget.ariaDescribedBy != widget.ariaDescribedBy) {
      _schedulePatch();
    }
  }

  void _schedulePatch() {
    SchedulerBinding.instance.addPostFrameCallback((_) => _patchDom());
  }

  void _patchDom() {
    if (!mounted) return;
    final describedBy = widget.ariaDescribedBy?.trim();
    if (describedBy == null || describedBy.isEmpty) return;

    final controlId = widget.controlIdentifier.trim();
    if (controlId.isEmpty) return;

    final input = _findTextFieldElement(controlId);
    if (input == null) return;

    input.setAttribute('aria-describedby', describedBy);
  }

  html.Element? _findTextFieldElement(String controlId) {
    for (final input in html.document.querySelectorAll('input, textarea')) {
      final host = input.parent;
      html.Element? cursor = input;
      while (cursor != null) {
        if (cursor.localName?.toLowerCase() == 'flt-semantics' &&
            cursor.id == controlId) {
          return input;
        }
        cursor = cursor.parent;
      }
      if (input.id == controlId) return input;
      if (host != null && host.id == controlId) return input;
    }

    final host = html.document.getElementById(controlId);
    if (host != null) {
      final nested = host.querySelector('input, textarea');
      if (nested != null) return nested;
      if (_isTextControl(host)) return host;
    }

    return null;
  }

  bool _isTextControl(html.Element el) {
    final tag = el.localName?.toLowerCase();
    return tag == 'input' || tag == 'textarea';
  }

  @override
  Widget build(BuildContext context) => widget.child;
}
