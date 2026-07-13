// ignore: avoid_web_libraries_in_flutter
import 'dart:html' as html;
import 'dart:ui_web' as ui_web;

import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:http/http.dart' as http;

import 'one_ui_icon_remote_cache.dart';
import 'one_ui_icon_remote_shared.dart';

export 'one_ui_icon_remote_shared.dart';

final Set<String> _registeredViewTypes = <String>{};
final Map<String, List<VoidCallback>> _errorListenersByUrl = {};
final Map<String, List<VoidCallback>> _loadListenersByUrl = {};

String _viewTypeKey(String url, int sidePx) =>
    'oneui-icon-$sidePx-${url.hashCode}';

void _registerIconImgFactory({
  required String viewType,
  required String url,
  required int sidePx,
}) {
  if (_registeredViewTypes.contains(viewType)) return;
  _registeredViewTypes.add(viewType);

  ui_web.platformViewRegistry.registerViewFactory(viewType, (int _) {
    final img = html.ImageElement()
      ..src = url
      ..style.width = '${sidePx}px'
      ..style.height = '${sidePx}px'
      ..style.objectFit = 'contain'
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

    img.onLoad.listen((_) {
      final listeners = _loadListenersByUrl[url];
      if (listeners == null) return;
      for (final cb in List<VoidCallback>.from(listeners)) {
        cb();
      }
    });

    return img;
  });
}

/// Network glyph for [OneUiIcon] on Flutter Web.
///
/// - SVG: fetched markup + [SvgPicture] (token tint works in the Flutter layer).
/// - Raster, tinted: [Image.network] + [ColorFiltered] (platform-view tint is a no-op).
/// - Raster, original: native `<img>` via [HtmlElementView] (CORS-safe display).
class OneUiIconRemote extends StatefulWidget {
  const OneUiIconRemote({
    super.key,
    required this.src,
    required this.size,
    required this.color,
    this.tintRaster = false,
    this.onError,
    this.onLoad,
  });

  final String src;
  final double size;
  final Color color;
  final bool tintRaster;
  final VoidCallback? onError;
  final VoidCallback? onLoad;

  @override
  State<OneUiIconRemote> createState() => _OneUiIconRemoteWebState();
}

class _OneUiIconRemoteWebState extends State<OneUiIconRemote> {
  String? _svgXml;
  bool _failed = false;
  bool _errorReported = false;
  bool _loadReported = false;
  Object? _loadToken;

  @override
  void initState() {
    super.initState();
    if (isOneUiIconRemoteSvgUrl(widget.src)) {
      _loadSvg();
    }
  }

  @override
  void didUpdateWidget(OneUiIconRemote oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.src != widget.src) {
      _svgXml = null;
      _failed = false;
      _errorReported = false;
      _loadReported = false;
      if (isOneUiIconRemoteSvgUrl(widget.src)) {
        _loadSvg();
      }
    } else if (oldWidget.color != widget.color ||
        oldWidget.tintRaster != widget.tintRaster) {
      _loadReported = false;
    }
  }

  void _fail() {
    if (_failed) return;
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted || _failed) return;
      setState(() => _failed = true);
      if (!_errorReported) {
        _errorReported = true;
        widget.onError?.call();
      }
    });
  }

  void _reportLoad() {
    if (_loadReported) return;
    _loadReported = true;
    widget.onLoad?.call();
  }

  Future<void> _loadSvg() async {
    final token = Object();
    _loadToken = token;

    final trimmed = widget.src.trim();
    final cached = kOneUiIconRemoteSvgCache[trimmed];
    if (cached != null) {
      if (!mounted || _loadToken != token) return;
      setState(() => _svgXml = cached);
      _reportLoad();
      return;
    }

    try {
      final response = await http.get(Uri.parse(trimmed));
      if (!mounted || _loadToken != token) return;
      if (response.statusCode == 200 && response.body.trim().isNotEmpty) {
        kOneUiIconRemoteSvgCache[trimmed] = response.body;
        setState(() => _svgXml = response.body);
        _reportLoad();
      } else {
        _fail();
      }
    } on Object {
      if (!mounted || _loadToken != token) return;
      _fail();
    }
  }

  Widget _placeholder() => SizedBox(width: widget.size, height: widget.size);

  Widget _buildSvg() {
    final xml = _svgXml;
    if (_failed) return _placeholder();
    if (xml == null) return _placeholder();

    final prepared = prepareOneUiRemoteSvgForTint(xml);
    final usesCurrentColor = oneUiRemoteSvgUsesCurrentColor(prepared);

    return SvgPicture.string(
      prepared,
      width: widget.size,
      height: widget.size,
      fit: BoxFit.contain,
      theme: SvgTheme(currentColor: widget.color),
      colorFilter: usesCurrentColor
          ? null
          : ColorFilter.mode(widget.color, BlendMode.srcIn),
      excludeFromSemantics: true,
    );
  }

  Widget _buildTintedRaster() {
    if (_failed) return _placeholder();

    return ColorFiltered(
      colorFilter: ColorFilter.mode(widget.color, BlendMode.srcIn),
      child: Image.network(
        widget.src.trim(),
        width: widget.size,
        height: widget.size,
        fit: BoxFit.contain,
        filterQuality: FilterQuality.high,
        excludeFromSemantics: true,
        loadingBuilder: (context, child, progress) {
          if (progress == null) {
            WidgetsBinding.instance.addPostFrameCallback((_) => _reportLoad());
            return child;
          }
          return _placeholder();
        },
        errorBuilder: (_, __, ___) {
          _fail();
          return _placeholder();
        },
      ),
    );
  }

  Widget _buildOriginalRaster() {
    return _OneUiIconRemoteWebImg(
      url: widget.src.trim(),
      size: widget.size,
      onError: _fail,
      onLoad: _reportLoad,
      failed: _failed,
    );
  }

  @override
  Widget build(BuildContext context) {
    if (isOneUiIconRemoteSvgUrl(widget.src)) {
      return _buildSvg();
    }
    if (widget.tintRaster) {
      return _buildTintedRaster();
    }
    return _buildOriginalRaster();
  }
}

class _OneUiIconRemoteWebImg extends StatefulWidget {
  const _OneUiIconRemoteWebImg({
    required this.url,
    required this.size,
    required this.onError,
    required this.onLoad,
    required this.failed,
  });

  final String url;
  final double size;
  final VoidCallback onError;
  final VoidCallback onLoad;
  final bool failed;

  @override
  State<_OneUiIconRemoteWebImg> createState() => _OneUiIconRemoteWebImgState();
}

class _OneUiIconRemoteWebImgState extends State<_OneUiIconRemoteWebImg> {
  late final VoidCallback _errorListener;
  late final VoidCallback _loadListener;

  @override
  void initState() {
    super.initState();
    _errorListener = _handleImageError;
    _loadListener = widget.onLoad;
    _addListeners(widget.url);
  }

  @override
  void didUpdateWidget(_OneUiIconRemoteWebImg oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.url != widget.url) {
      _removeListeners(oldWidget.url);
      _addListeners(widget.url);
    }
  }

  @override
  void dispose() {
    _removeListeners(widget.url);
    super.dispose();
  }

  void _addListeners(String url) {
    _errorListenersByUrl.putIfAbsent(url, () => []).add(_errorListener);
    _loadListenersByUrl.putIfAbsent(url, () => []).add(_loadListener);
  }

  void _removeListeners(String url) {
    _errorListenersByUrl[url]?.remove(_errorListener);
    if (_errorListenersByUrl[url]?.isEmpty ?? false) {
      _errorListenersByUrl.remove(url);
    }
    _loadListenersByUrl[url]?.remove(_loadListener);
    if (_loadListenersByUrl[url]?.isEmpty ?? false) {
      _loadListenersByUrl.remove(url);
    }
  }

  void _handleImageError() {
    if (!mounted || widget.failed) return;
    widget.onError();
  }

  @override
  Widget build(BuildContext context) {
    if (widget.failed) {
      return SizedBox(width: widget.size, height: widget.size);
    }

    final sidePx = widget.size.round().clamp(1, 4096);
    final viewType = _viewTypeKey(widget.url, sidePx);
    _registerIconImgFactory(
        viewType: viewType, url: widget.url, sidePx: sidePx);

    return SizedBox(
      width: widget.size,
      height: widget.size,
      child: HtmlElementView(viewType: viewType),
    );
  }
}
