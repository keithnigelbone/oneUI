import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:http/http.dart' as http;

import 'one_ui_avatar_network_image_io.dart' show loadOneUiAvatarImageBytes;
import 'one_ui_icon_remote_cache.dart';
import 'one_ui_icon_remote_shared.dart';

/// Fills parent — IO/desktop/mobile network image (`Image.memory` / SVG markup).
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
  State<OneUiImageRemote> createState() => _OneUiImageRemoteIoState();
}

class _OneUiImageRemoteIoState extends State<OneUiImageRemote> {
  Uint8List? _bytes;
  String? _svgXml;
  bool _failed = false;
  bool _errorReported = false;
  Object? _loadToken;

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void didUpdateWidget(OneUiImageRemote oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.url != widget.url) {
      _bytes = null;
      _svgXml = null;
      _failed = false;
      _errorReported = false;
      _load();
    }
  }

  bool _isBundledAssetPath(String url) {
    final trimmed = url.trim();
    return trimmed.startsWith('assets/') || trimmed.startsWith('packages/');
  }

  Future<void> _load() async {
    final token = Object();
    _loadToken = token;
    final trimmed = widget.url.trim();

    if (isOneUiIconRemoteSvgUrl(trimmed)) {
      final cached = kOneUiIconRemoteSvgCache[trimmed];
      if (cached != null) {
        if (!mounted || _loadToken != token) return;
        setState(() => _svgXml = cached);
        widget.onLoad?.call();
        return;
      }

      try {
        final String body;
        if (_isBundledAssetPath(trimmed)) {
          body = await rootBundle.loadString(trimmed);
        } else {
          final response = await http.get(Uri.parse(trimmed));
          if (response.statusCode != 200 || response.body.trim().isEmpty) {
            _fail();
            return;
          }
          body = response.body;
        }
        if (!mounted || _loadToken != token) return;
        kOneUiIconRemoteSvgCache[trimmed] = body;
        setState(() => _svgXml = body);
        widget.onLoad?.call();
      } on Object {
        if (!mounted || _loadToken != token) return;
        _fail();
      }
      return;
    }

    final bytes = await loadOneUiAvatarImageBytes(trimmed);
    if (!mounted || _loadToken != token) return;
    if (bytes != null) {
      setState(() => _bytes = bytes);
      widget.onLoad?.call();
    } else {
      _fail();
    }
  }

  void _fail() {
    if (_failed) return;
    setState(() => _failed = true);
    if (!_errorReported) {
      _errorReported = true;
      widget.onError();
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_failed) return const SizedBox.expand();

    final xml = _svgXml;
    if (xml != null) {
      return SvgPicture.string(
        xml,
        fit: widget.fit,
        alignment: widget.alignment,
        width: double.infinity,
        height: double.infinity,
        excludeFromSemantics: true,
      );
    }

    final bytes = _bytes;
    if (bytes == null) return const SizedBox.expand();

    return Image.memory(
      bytes,
      fit: widget.fit,
      alignment: widget.alignment,
      width: double.infinity,
      height: double.infinity,
      filterQuality: FilterQuality.high,
      excludeFromSemantics: true,
      errorBuilder: (_, __, ___) {
        // errorBuilder runs during build — notify parent only; avoid setState here.
        WidgetsBinding.instance.addPostFrameCallback((_) {
          if (!mounted || _errorReported) return;
          _errorReported = true;
          widget.onError();
        });
        return const SizedBox.expand();
      },
    );
  }
}
