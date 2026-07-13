import 'dart:html' as html;

import '../reports/qa_report_paths.dart';

bool _isAbsoluteWebUrl(String path) =>
    path.startsWith('http://') || path.startsWith('https://');

void openQaWebPath(String path) {
  if (_isAbsoluteWebUrl(path)) {
    html.window.open(path, '_blank');
    return;
  }
  html.window.open(qaReportPublicPath(path), '_blank');
}

void pushQaWebPath(String path) {
  html.window.history.pushState(null, '', path);
}
