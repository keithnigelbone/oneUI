import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:http/http.dart' as http;

import 'one_ui_icon_remote_cache.dart';
import 'one_ui_icon_remote_shared.dart';

export 'one_ui_icon_remote_shared.dart';

Future<Uint8List?> loadOneUiIconRemoteImageBytes(String url) {
  final trimmed = url.trim();
  if (kOneUiIconRemoteImageLoadFailed.contains(trimmed)) {
    return Future.value(null);
  }
  final cached = kOneUiIconRemoteImageCache[trimmed];
  if (cached != null) return Future.value(cached);

  return kOneUiIconRemoteImageLoadInFlight.putIfAbsent(trimmed, () async {
    try {
      final response = await http.get(Uri.parse(trimmed));
      if (response.statusCode == 200 && response.bodyBytes.isNotEmpty) {
        kOneUiIconRemoteImageCache[trimmed] = response.bodyBytes;
        return response.bodyBytes;
      }
      kOneUiIconRemoteImageLoadFailed.add(trimmed);
      return null;
    } on Object {
      kOneUiIconRemoteImageLoadFailed.add(trimmed);
      return null;
    } finally {
      kOneUiIconRemoteImageLoadInFlight.remove(trimmed);
    }
  });
}

Future<String?> loadOneUiIconRemoteSvgXml(String url) {
  final trimmed = url.trim();
  if (kOneUiIconRemoteSvgLoadFailed.contains(trimmed)) {
    return Future.value(null);
  }
  final cached = kOneUiIconRemoteSvgCache[trimmed];
  if (cached != null) return Future.value(cached);

  return kOneUiIconRemoteSvgLoadInFlight.putIfAbsent(trimmed, () async {
    try {
      final response = await http.get(Uri.parse(trimmed));
      if (response.statusCode == 200 && response.body.trim().isNotEmpty) {
        kOneUiIconRemoteSvgCache[trimmed] = response.body;
        return response.body;
      }
      kOneUiIconRemoteSvgLoadFailed.add(trimmed);
      return null;
    } on Object {
      kOneUiIconRemoteSvgLoadFailed.add(trimmed);
      return null;
    } finally {
      kOneUiIconRemoteSvgLoadInFlight.remove(trimmed);
    }
  });
}

/// Network glyph for [OneUiIcon] — SVG (tinted) or raster (IO).
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
  State<OneUiIconRemote> createState() => _OneUiIconRemoteIoState();
}

class _OneUiIconRemoteIoState extends State<OneUiIconRemote> {
  String? _svgXml;
  Uint8List? _rasterBytes;
  bool _failed = false;
  bool _errorReported = false;
  bool _loadReported = false;
  Object? _loadToken;

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void didUpdateWidget(OneUiIconRemote oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.src != widget.src) {
      _svgXml = null;
      _rasterBytes = null;
      _failed = false;
      _errorReported = false;
      _loadReported = false;
      _load();
    }
  }

  void _load() {
    if (isOneUiIconRemoteSvgUrl(widget.src)) {
      _loadSvg();
    } else {
      _loadRaster();
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
    final xml = await loadOneUiIconRemoteSvgXml(widget.src);
    if (!mounted || _loadToken != token) return;
    if (xml != null) {
      setState(() => _svgXml = xml);
      _reportLoad();
    } else {
      _fail();
    }
  }

  Future<void> _loadRaster() async {
    final token = Object();
    _loadToken = token;
    final bytes = await loadOneUiIconRemoteImageBytes(widget.src);
    if (!mounted || _loadToken != token) return;
    if (bytes != null) {
      setState(() => _rasterBytes = bytes);
      _reportLoad();
    } else {
      _fail();
    }
  }

  Widget _placeholder() => SizedBox(width: widget.size, height: widget.size);

  Widget _wrapTint(Widget child, {required bool tint}) {
    if (!tint) return child;
    return ColorFiltered(
      colorFilter: ColorFilter.mode(widget.color, BlendMode.srcIn),
      child: child,
    );
  }

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

  Widget _buildRaster() {
    final bytes = _rasterBytes;
    if (_failed) return _placeholder();
    if (bytes == null) return _placeholder();

    final sidePx = widget.size.round();
    return _wrapTint(
      Image.memory(
        bytes,
        width: widget.size,
        height: widget.size,
        fit: BoxFit.contain,
        filterQuality: FilterQuality.high,
        cacheWidth: sidePx > 0 ? sidePx : null,
        cacheHeight: sidePx > 0 ? sidePx : null,
        excludeFromSemantics: true,
        errorBuilder: (_, __, ___) {
          _fail();
          return _placeholder();
        },
      ),
      tint: widget.tintRaster,
    );
  }

  @override
  Widget build(BuildContext context) {
    if (isOneUiIconRemoteSvgUrl(widget.src)) {
      return _buildSvg();
    }
    return _buildRaster();
  }
}
