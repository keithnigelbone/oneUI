// ignore: avoid_web_libraries_in_flutter
import 'dart:html' as html;
import 'dart:ui_web' as ui_web;

import 'package:flutter/material.dart';

final Set<String> _registeredViewTypes = <String>{};

/// Per-URL error subscribers (many avatars can share one sample URL).
final Map<String, List<VoidCallback>> _errorListenersByUrl = {};

String _viewTypeKey(String url, int sidePx) =>
    'oneui-avatar-$sidePx-${url.hashCode}';

void _registerAvatarImgFactory(String viewType, String url, int sidePx) {
  if (_registeredViewTypes.contains(viewType)) return;
  _registeredViewTypes.add(viewType);

  ui_web.platformViewRegistry.registerViewFactory(viewType, (int _) {
    final img = html.ImageElement()
      ..src = url
      ..style.width = '${sidePx}px'
      ..style.height = '${sidePx}px'
      ..style.objectFit = 'cover'
      ..style.display = 'block'
      ..style.margin = '0'
      ..style.padding = '0';

    img.onError.listen((_) {
      final listeners = _errorListenersByUrl[url];
      if (listeners == null) return;
      for (final cb in List<VoidCallback>.from(listeners)) {
        cb();
      }
    });

    return img;
  });
}

/// Avatar photo on Flutter Web — native `<img>` with explicit px size (no
/// [Flutter__ImgElementImage__] platform-view warnings from [Image.network]).
class OneUiAvatarNetworkImage extends StatefulWidget {
  const OneUiAvatarNetworkImage({
    super.key,
    required this.url,
    required this.side,
    required this.borderRadius,
    required this.onError,
  });

  final String url;
  final double side;
  final BorderRadius borderRadius;
  final VoidCallback onError;

  @override
  State<OneUiAvatarNetworkImage> createState() =>
      _OneUiAvatarNetworkImageWebState();
}

class _OneUiAvatarNetworkImageWebState extends State<OneUiAvatarNetworkImage> {
  bool _failed = false;
  bool _errorReported = false;
  late final VoidCallback _errorListener;

  @override
  void initState() {
    super.initState();
    _errorListener = _handleImageError;
    _errorListenersByUrl.putIfAbsent(widget.url, () => []).add(_errorListener);
  }

  @override
  void didUpdateWidget(OneUiAvatarNetworkImage oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.url != widget.url) {
      _removeListener(oldWidget.url);
      _failed = false;
      _errorReported = false;
      _errorListenersByUrl
          .putIfAbsent(widget.url, () => [])
          .add(_errorListener);
    }
  }

  @override
  void dispose() {
    _removeListener(widget.url);
    super.dispose();
  }

  void _removeListener(String url) {
    _errorListenersByUrl[url]?.remove(_errorListener);
    if (_errorListenersByUrl[url]?.isEmpty ?? false) {
      _errorListenersByUrl.remove(url);
    }
  }

  void _handleImageError() {
    if (!mounted || _failed) return;
    setState(() => _failed = true);
    if (!_errorReported) {
      _errorReported = true;
      widget.onError();
    }
  }

  Widget _placeholder() => SizedBox(width: widget.side, height: widget.side);

  @override
  Widget build(BuildContext context) {
    if (_failed) return _placeholder();

    final sidePx = widget.side.round().clamp(1, 4096);
    final viewType = _viewTypeKey(widget.url, sidePx);
    _registerAvatarImgFactory(viewType, widget.url, sidePx);

    return SizedBox(
      width: widget.side,
      height: widget.side,
      child: ClipRRect(
        borderRadius: widget.borderRadius,
        clipBehavior: Clip.antiAlias,
        child: HtmlElementView(viewType: viewType),
      ),
    );
  }
}
