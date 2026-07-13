// ignore: avoid_web_libraries_in_flutter
import 'dart:html' as html;
import 'dart:ui_web' as ui_web;

import 'package:flutter/material.dart';

import 'one_ui_icon_remote_shared.dart';

/// Fills parent — Flutter web uses [Image.network] (raster) or `<img>` for SVG.
class OneUiImageRemote extends StatefulWidget {
  const OneUiImageRemote({
    super.key,
    required this.url,
    required this.fit,
    required this.onError,
    this.onLoad,
    this.alignment = Alignment.center,
  });

  final String url;
  final BoxFit fit;
  final Alignment alignment;
  final VoidCallback onError;
  final VoidCallback? onLoad;

  @override
  State<OneUiImageRemote> createState() => _OneUiImageRemoteWebState();
}

class _OneUiImageRemoteWebState extends State<OneUiImageRemote> {
  bool _errorReported = false;
  bool _loaded = false;

  static final Set<String> _registeredViewTypes = <String>{};

  void _fail() {
    if (_errorReported) return;
    _errorReported = true;
    widget.onError();
  }

  void _reportLoad() {
    if (_loaded) return;
    _loaded = true;
    WidgetsBinding.instance.addPostFrameCallback((_) => widget.onLoad?.call());
  }

  @override
  void didUpdateWidget(OneUiImageRemote oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.url != widget.url) {
      _errorReported = false;
      _loaded = false;
    }
  }

  String _objectFitCss() {
    return switch (widget.fit) {
      BoxFit.contain => 'contain',
      BoxFit.fill => 'fill',
      BoxFit.fitWidth => 'scale-down',
      BoxFit.fitHeight => 'scale-down',
      BoxFit.none => 'none',
      BoxFit.scaleDown => 'scale-down',
      _ => 'cover',
    };
  }

  String _objectPositionCss() {
    final x = widget.alignment.x;
    final y = widget.alignment.y;
    final h = x < -0.33
        ? 'left'
        : x > 0.33
            ? 'right'
            : 'center';
    final v = y < -0.33
        ? 'top'
        : y > 0.33
            ? 'bottom'
            : 'center';
    return '$h $v';
  }

  Widget _buildSvgHtmlElement() {
    final trimmed = widget.url.trim();
    final viewType = 'oneui-image-svg-${trimmed.hashCode}-${widget.fit.name}';

    if (!_registeredViewTypes.contains(viewType)) {
      _registeredViewTypes.add(viewType);
      final fit = _objectFitCss();
      final position = _objectPositionCss();
      ui_web.platformViewRegistry.registerViewFactory(viewType, (int _) {
        final img = html.ImageElement()
          ..src = trimmed
          ..style.width = '100%'
          ..style.height = '100%'
          ..style.objectFit = fit
          ..style.objectPosition = position
          ..style.display = 'block';

        img.onError.listen((_) {
          WidgetsBinding.instance.addPostFrameCallback((_) {
            if (!mounted || _errorReported) return;
            _fail();
          });
        });
        img.onLoad.listen((_) {
          WidgetsBinding.instance.addPostFrameCallback((_) {
            if (!mounted) return;
            _reportLoad();
          });
        });

        return img;
      });
    }

    if (_errorReported) return const SizedBox.expand();

    return HtmlElementView(viewType: viewType);
  }

  @override
  Widget build(BuildContext context) {
    if (isOneUiIconRemoteSvgUrl(widget.url)) {
      return _buildSvgHtmlElement();
    }

    return Image.network(
      widget.url,
      fit: widget.fit,
      alignment: widget.alignment,
      width: double.infinity,
      height: double.infinity,
      filterQuality: FilterQuality.high,
      excludeFromSemantics: true,
      loadingBuilder: (context, child, progress) {
        if (progress == null) {
          _reportLoad();
          return child;
        }
        return const SizedBox.expand();
      },
      errorBuilder: (_, __, ___) {
        _fail();
        return const SizedBox.expand();
      },
    );
  }
}
