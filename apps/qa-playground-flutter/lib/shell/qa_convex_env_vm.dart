import 'dart:io';

import 'package:path/path.dart' as p;

import 'qa_dotenv_parse.dart';

String? readConvexUrlFromEnvFiles() {
  final cwd = Directory.current.path;
  final candidates = <String>[
    p.normalize(p.join(cwd, '..', '..', '.env.local')),
    p.normalize(p.join(cwd, '..', '..', '..', '.env.local')),
    p.normalize(p.join(cwd, '.env.local')),
    p.normalize(p.join(cwd, '..', 'storybook', '.env.local')),
    p.normalize(p.join(cwd, 'apps', 'storybook_flutter', '.env.local')),
    p.normalize(p.join(cwd, 'apps', 'storybook', '.env.local')),
  ];
  final seen = <String>{};
  for (final path in candidates) {
    if (!seen.add(path)) continue;
    final file = File(path);
    if (!file.existsSync()) continue;
    final url = parseConvexUrlFromDotEnvSource(file.readAsStringSync());
    if (url != null && url.isNotEmpty) return url;
  }
  return null;
}
