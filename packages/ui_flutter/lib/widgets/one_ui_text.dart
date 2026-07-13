import 'package:flutter/foundation.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';

import '../engine/text_color_resolve.dart';
import '../engine/text_style_resolve.dart';
import '../theme/one_ui_scope.dart';
import '../utils/one_ui_href_launch.dart';
import 'convex_design_system_guard.dart';
import 'one_ui_text_a11y.dart';
import 'one_ui_text_types.dart';

/// Token-backed text — `Text.tsx` / `Text.native.tsx`.
///
/// Typography from Convex `nativeTheme.typography`; colours from surface roles
/// (`OneUiSurfaceScope`) with attention × appearance parity.
class OneUiText extends StatelessWidget {
  const OneUiText({
    super.key,
    this.variant = OneUiTextVariant.body,
    this.size,
    this.weight = OneUiTextWeight.high,
    this.attention = OneUiTextAttention.none,
    this.appearance = 'auto',
    this.language = OneUiTextLanguage.latin,
    this.lang,
    this.script,
    this.scriptMode = OneUiTextScriptMode.ui,
    this.italic = false,
    this.underline = false,
    this.strikethrough = false,
    this.textAlign,
    this.maxLines,
    this.text,
    this.child,
    this.link,
    this.onLinkPress,
    this.onPressed,
    this.href,
    this.target,
    this.rel,
    this.semanticsLabel,
    this.semanticsHint,
    this.excludeFromSemantics = false,
    this.ariaHidden = false,
    this.testId,
  });

  final OneUiTextVariant variant;
  final String? size;
  final OneUiTextWeight weight;
  final OneUiTextAttention attention;
  final String appearance;
  final OneUiTextLanguage language;

  /// BCP 47 language tag — infers script typography when [script] is omitted.
  final String? lang;

  /// Explicit script id (`devanagari`, `tamil`, …).
  final String? script;
  final OneUiTextScriptMode scriptMode;
  final bool italic;
  final bool underline;
  final bool strikethrough;
  final OneUiTextAlign? textAlign;
  final int? maxLines;
  final String? text;
  final Widget? child;

  /// Inline substring of visible copy, or trailing widget (RN `link` slot).
  final Object? link;
  final VoidCallback? onLinkPress;
  final VoidCallback? onPressed;

  /// Web `as="a"` destination — promotes link semantics when set.
  final String? href;
  final String? target;
  final String? rel;
  final String? semanticsLabel;
  final String? semanticsHint;
  final bool excludeFromSemantics;

  /// Web `aria-hidden` / RN hide from accessibility tree.
  final bool ariaHidden;
  final String? testId;

  @override
  Widget build(BuildContext context) {
    if (OneUiScope.nativeTypographyOf(context) == null) {
      return oneUiConvexGapPlaceholder(
        [
          'Flutter cannot render token-backed Text without Convex `nativeTheme:getNativeThemeSnapshot.typography`.',
        ],
      );
    }

    final state = resolveOneUiTextState(
      variant: variant,
      size: size,
      weight: weight,
      attention: attention,
      appearance: appearance,
      language: language,
      lang: lang,
      script: script,
      scriptMode: scriptMode,
      italic: italic,
      underline: underline,
      strikethrough: strikethrough,
      textAlign: textAlign,
    );

    final color = resolveOneUiTextColor(
      context,
      appearance: state.resolvedAppearance,
      attention: state.resolvedAttention,
    );

    final style = resolveOneUiTextStyle(
      context,
      variant: state.resolvedVariant,
      size: state.resolvedSize,
      weight: state.resolvedWeight,
      color: color,
      language: state.resolvedLanguage,
      resolvedScript: state.resolvedScript,
      scriptMode: state.resolvedScriptMode,
      italic: italic,
      underline: underline,
      strikethrough: strikethrough,
      textAlign: textAlign,
    );

    final visible = _visibleString();
    final align = oneUiTextAlignToFlutter(textAlign);
    final body = _buildBody(context, style, visible, align);

    final hrefTrimmed = href?.trim();
    final hasHref = hrefTrimmed != null && hrefTrimmed.isNotEmpty;
    final hasInlineLinkSubstring = _hasInlineLinkSubstring(visible);
    final tapHandler = onPressed ??
        (hasHref && !hasInlineLinkSubstring
            ? () => oneUiLaunchHref(
                  hrefTrimmed!,
                  target: target,
                  rel: rel,
                )
            : null);
    final outerLinkInteractive = tapHandler != null;

    final tid = testId?.trim();
    final hasTestId = tid != null && tid.isNotEmpty;

    final a11y = resolveOneUiTextSemantics(
      semanticsLabel: semanticsLabel,
      semanticsHint: semanticsHint,
      excludeFromSemantics: excludeFromSemantics,
      ariaHidden: ariaHidden,
      visibleText: visible,
      variant: state.resolvedVariant,
      isInteractive: outerLinkInteractive,
    );

    Widget result = body;
    if (a11y.hidden) {
      result = ExcludeSemantics(child: result);
    } else if (a11y.exposed || hasTestId) {
      final wrapperLabel = a11y.exposed
          ? a11y.label
          : (visible.trim().isNotEmpty ? visible.trim() : null);
      result = Semantics(
        container: true,
        excludeSemantics: a11y.exposed || hasTestId,
        header: a11y.isHeader,
        link: a11y.isLink,
        label: wrapperLabel,
        hint: a11y.hint,
        identifier: hasTestId ? tid : null,
        onTap: outerLinkInteractive ? tapHandler : null,
        child: result,
      );
    }

    if (outerLinkInteractive) {
      result = GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: tapHandler,
        child: result,
      );
    }

    if (hasTestId) {
      result = KeyedSubtree(key: ValueKey(tid), child: result);
    }

    final langTag = lang?.trim();
    final scriptKey =
        state.dataScript != null ? '|data-script=${state.dataScript}' : '';
    final scriptModeKey = state.dataScriptMode != null
        ? '|data-script-mode=${state.dataScriptMode}'
        : '';
    final langKey =
        langTag != null && langTag.isNotEmpty ? '|lang=$langTag' : '';
    final hrefKey = hasHref ? '|href=$hrefTrimmed' : '';
    final italicKey =
        state.dataItalic != null ? '|data-italic=${state.dataItalic}' : '';
    final underlineKey = state.dataUnderline != null
        ? '|data-underline=${state.dataUnderline}'
        : '';
    final strikeKey = state.dataStrikethrough != null
        ? '|data-strikethrough=${state.dataStrikethrough}'
        : '';
    final alignKey =
        state.dataAlign != null ? '|data-align=${state.dataAlign}' : '';

    return KeyedSubtree(
      key: ValueKey<String>(
        'oneui-text|data-variant=${state.dataVariant}|data-size=${state.dataSize}|'
        'data-weight=${state.dataWeight}|data-attention=${state.dataAttention}|'
        'data-appearance=${state.dataAppearance}|data-language=${state.dataLanguage}'
        '$scriptKey$scriptModeKey$langKey$hrefKey$italicKey$underlineKey$strikeKey$alignKey',
      ),
      child: result,
    );
  }

  String _visibleString() {
    if (child is Text) return (child as Text).data ?? '';
    if (child is String) return child as String;
    if (text != null) return text!;
    return '';
  }

  bool _hasInlineLinkSubstring(String visible) {
    if (link is! String) return false;
    final substring = (link as String).trim();
    return substring.isNotEmpty && visible.contains(substring);
  }

  Widget _buildBody(
    BuildContext context,
    TextStyle style,
    String visible,
    TextAlign? align,
  ) {
    if (child != null && link == null) {
      return DefaultTextStyle(style: style, maxLines: maxLines, child: child!);
    }

    if (link is Widget) {
      return Wrap(
        crossAxisAlignment: WrapCrossAlignment.center,
        children: [
          _textWidget(style, visible, align),
          link as Widget,
        ],
      );
    }

    if (link is String && visible.contains(link as String)) {
      if (onLinkPress == null) {
        assert(() {
          FlutterError.reportError(
            FlutterErrorDetails(
              exception: FlutterError(
                'OneUiText: inline `link` substring requires `onLinkPress` '
                '(RN Text.native.tsx contract). Rendering plain copy without '
                'link styling to avoid a dead interactive affordance.',
              ),
              library: 'ui_flutter',
              context: ErrorDescription('while building OneUiText inline link'),
            ),
          );
          return true;
        }());
        return _textWidget(style, visible, align);
      }
      return _inlineLinkText(context, style, visible, link as String, align);
    }

    return _textWidget(style, visible, align);
  }

  Widget _textWidget(TextStyle style, String data, TextAlign? align) {
    final text = Text(
      data,
      style: style,
      maxLines: maxLines != null && maxLines! > 0 ? maxLines : null,
      overflow:
          maxLines != null && maxLines! > 0 ? TextOverflow.ellipsis : null,
      textAlign: align,
    );
    // Block-level alignment needs width; unbounded horizontal parent ignores textAlign.
    if (align == null || align == TextAlign.left) return text;
    return SizedBox(width: double.infinity, child: text);
  }

  Widget _inlineLinkText(
    BuildContext context,
    TextStyle style,
    String visible,
    String linkSubstring,
    TextAlign? align,
  ) {
    final idx = visible.indexOf(linkSubstring);
    final before = visible.substring(0, idx);
    final after = visible.substring(idx + linkSubstring.length);
    final linkColor = resolveOneUiTextColor(
      context,
      appearance: 'primary',
      attention: OneUiTextAttention.tintedA11y,
    );
    final linkStyle = style.copyWith(
      color: linkColor,
      decoration: TextDecoration.underline,
      decorationColor: linkColor,
    );
    final recognizer = TapGestureRecognizer()..onTap = onLinkPress;

    final rich = Text.rich(
      TextSpan(
        style: style,
        children: [
          if (before.isNotEmpty) TextSpan(text: before),
          TextSpan(
            text: linkSubstring,
            style: linkStyle,
            recognizer: recognizer,
            semanticsLabel: linkSubstring,
          ),
          if (after.isNotEmpty) TextSpan(text: after),
        ],
      ),
      maxLines: maxLines != null && maxLines! > 0 ? maxLines : null,
      overflow:
          maxLines != null && maxLines! > 0 ? TextOverflow.ellipsis : null,
      textAlign: align,
    );
    if (align == null || align == TextAlign.left) return rich;
    return SizedBox(width: double.infinity, child: rich);
  }
}
