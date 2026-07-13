import 'dart:typed_data';

/// In-memory cache — docs page renders many avatars with the same sample URL.
final Map<String, Uint8List> kOneUiAvatarNetworkImageCache = {};

final Map<String, Future<Uint8List?>> kAvatarImageLoadInFlight = {};
final Set<String> kAvatarImageLoadFailed = {};
