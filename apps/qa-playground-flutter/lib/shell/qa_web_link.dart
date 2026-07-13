import 'package:flutter/foundation.dart';

import 'qa_web_link_stub.dart' if (dart.library.html) 'qa_web_link_web.dart';

void qaOpenInNewTab(String path) {
  if (kIsWeb) {
    openQaWebPath(path);
  }
}

void qaPushPath(String path) {
  if (kIsWeb) {
    pushQaWebPath(path);
  }
}

void qaPopToCatalog() {
  if (kIsWeb) {
    pushQaWebPath('/');
  }
}
