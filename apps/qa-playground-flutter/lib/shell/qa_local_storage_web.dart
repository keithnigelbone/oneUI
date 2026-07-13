// ignore: avoid_web_libraries_in_flutter
import 'dart:html' as html;

String? qaLoadString(String key) => html.window.localStorage[key];

void qaSaveString(String key, String value) {
  html.window.localStorage[key] = value;
}
