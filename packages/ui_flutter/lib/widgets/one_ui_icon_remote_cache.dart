import 'dart:typed_data';

/// In-memory cache for remote icon raster bytes.
final Map<String, Uint8List> kOneUiIconRemoteImageCache = {};

final Map<String, Future<Uint8List?>> kOneUiIconRemoteImageLoadInFlight = {};
final Set<String> kOneUiIconRemoteImageLoadFailed = {};

/// In-memory cache for remote SVG markup.
final Map<String, String> kOneUiIconRemoteSvgCache = {};

final Map<String, Future<String?>> kOneUiIconRemoteSvgLoadInFlight = {};
final Set<String> kOneUiIconRemoteSvgLoadFailed = {};
