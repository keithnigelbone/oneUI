/// Resolves accessible names from [Semantics.identifier] anchors — web
/// `aria-labelledby` parity for Flutter when no explicit label is provided.
library;

import 'package:flutter/semantics.dart';
import 'package:flutter/widgets.dart';

/// Returns the first non-empty label on a [Semantics] node whose
/// [SemanticsProperties.identifier] matches [identifier].
///
/// Walks the element tree from the binding root so sibling label anchors
/// (e.g. `Semantics(identifier: 'caption-id', label: 'Upload')`) can name
/// controls that only pass `semanticsLabelledBy: 'caption-id'`.
String? oneUiLookupSemanticsLabelByIdentifier(
  BuildContext context,
  String identifier,
) {
  final id = identifier.trim();
  if (id.isEmpty) return null;

  final fromElementTree = _lookupOnElementTree(id);
  if (fromElementTree != null) return fromElementTree;

  return _lookupOnSemanticsTree(id);
}

String? _lookupOnSemanticsTree(String id) {
  final owner = WidgetsBinding.instance.pipelineOwner.semanticsOwner;
  if (owner == null) return null;

  String? found;
  bool visit(SemanticsNode node) {
    if (found != null) return false;
    if (node.identifier.trim() == id) {
      final plain = node.label.trim();
      if (plain.isNotEmpty) {
        found = plain;
        return false;
      }
      final attributed = node.attributedLabel.string.trim();
      if (attributed.isNotEmpty) {
        found = attributed;
        return false;
      }
    }
    node.visitChildren(visit);
    return found == null;
  }

  final root = owner.rootSemanticsNode;
  if (root == null) return null;
  visit(root);
  return found;
}

String? _lookupOnElementTree(String id) {
  String? found;
  void visit(Element element) {
    if (found != null) return;
    final widget = element.widget;
    if (widget is Semantics) {
      final props = widget.properties;
      if (props.identifier?.trim() == id) {
        final plain = props.label?.trim();
        if (plain != null && plain.isNotEmpty) {
          found = plain;
          return;
        }
        final attributed = props.attributedLabel?.string.trim();
        if (attributed != null && attributed.isNotEmpty) {
          found = attributed;
          return;
        }
      }
    }
    element.visitChildren(visit);
  }

  final root = WidgetsBinding.instance.rootElement;
  if (root != null) {
    visit(root);
  }
  return found;
}
