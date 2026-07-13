import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

import 'one_ui_avatar_network_image_cache.dart';

/// Loads avatar image bytes (IO / mobile / desktop).
Future<Uint8List?> loadOneUiAvatarImageBytes(String url) {
  if (kAvatarImageLoadFailed.contains(url)) {
    return Future.value(null);
  }
  final cached = kOneUiAvatarNetworkImageCache[url];
  if (cached != null) return Future.value(cached);

  return kAvatarImageLoadInFlight.putIfAbsent(url, () async {
    try {
      final response = await http.get(Uri.parse(url));
      if (response.statusCode == 200 && response.bodyBytes.isNotEmpty) {
        kOneUiAvatarNetworkImageCache[url] = response.bodyBytes;
        return response.bodyBytes;
      }
      kAvatarImageLoadFailed.add(url);
      return null;
    } catch (_) {
      kAvatarImageLoadFailed.add(url);
      return null;
    } finally {
      kAvatarImageLoadInFlight.remove(url);
    }
  });
}

/// Avatar photo — [Image.memory] from HTTP bytes.
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
      _OneUiAvatarNetworkImageIoState();
}

class _OneUiAvatarNetworkImageIoState extends State<OneUiAvatarNetworkImage> {
  Uint8List? _bytes;
  bool _failed = false;
  bool _errorReported = false;
  Object? _loadToken;

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void didUpdateWidget(OneUiAvatarNetworkImage oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.url != widget.url) {
      _bytes = null;
      _failed = false;
      _errorReported = false;
      _load();
    }
  }

  Future<void> _load() async {
    final token = Object();
    _loadToken = token;

    final bytes = await loadOneUiAvatarImageBytes(widget.url);
    if (!mounted || _loadToken != token) return;

    if (bytes != null) {
      setState(() => _bytes = bytes);
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

  Widget _placeholder() => SizedBox(width: widget.side, height: widget.side);

  @override
  Widget build(BuildContext context) {
    if (_failed) return _placeholder();

    final bytes = _bytes;
    if (bytes == null) return _placeholder();

    final sidePx = widget.side.round();
    return ClipRRect(
      borderRadius: widget.borderRadius,
      clipBehavior: Clip.antiAlias,
      child: Image.memory(
        bytes,
        width: widget.side,
        height: widget.side,
        fit: BoxFit.cover,
        filterQuality: FilterQuality.medium,
        cacheWidth: sidePx > 0 ? sidePx : null,
        cacheHeight: sidePx > 0 ? sidePx : null,
        excludeFromSemantics: true,
        errorBuilder: (_, __, ___) {
          WidgetsBinding.instance.addPostFrameCallback((_) {
            if (!mounted || _errorReported) return;
            _errorReported = true;
            widget.onError();
          });
          return _placeholder();
        },
      ),
    );
  }
}
