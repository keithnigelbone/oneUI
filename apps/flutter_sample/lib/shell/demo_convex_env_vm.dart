import 'dart:io';

import 'demo_dotenv_parse.dart';

String? readConvexUrlFromEnvFiles() {
  final cwd = Directory.current.path;
  final candidates = <String>[
    '$cwd/../../.env.local',
    '$cwd/.env.local',
  ];
  for (final path in candidates) {
    final file = File(path);
    if (!file.existsSync()) continue;
    final url = parseConvexUrlFromDotEnvSource(file.readAsStringSync());
    if (url != null && url.isNotEmpty) return url;
  }
  return null;
}
