import 'semantic_icon_resolve.dart';

/// Jio semantic → catalog id — mirrors `packages/ui/src/icons/semanticMappings/jio.ts`.
const Map<String, String> kJioSemanticToCatalogId = {
  'add': 'IcAdd',
  'remove': 'IcMinus',
  'close': 'IcClose',
  'edit': 'IcEdit',
  'delete': 'IcTrashClear',
  'copy': 'IcCopyDocument',
  'save': 'IcSave',
  'refresh': 'IcRefresh',
  'download': 'IcDownload',
  'upload': 'IcUpload',
  'share': 'IcShare',
  'link': 'IcLink',
  'unlink': 'IcUnlink',
  'menu': 'IcBurgerMenu',
  'search': 'IcSearch',
  'home': 'IcHome',
  'settings': 'IcSettings',
  'arrowLeft': 'IcArrowBack',
  'arrowRight': 'IcArrowNext',
  'arrowUp': 'IcArrowUp',
  'arrowDown': 'IcArrowDown',
  'chevronLeft': 'IcChevronLeft',
  'chevronRight': 'IcChevronRight',
  'chevronUp': 'IcChevronUp',
  'chevronDown': 'IcChevronDown',
  'externalLink': 'IcOpenInNewTab',
  'firstPage': 'IcFirstpage',
  'lastPage': 'IcLastpage',
  'back': 'IcBack',
  'next': 'IcNext',
  'check': 'IcConfirm',
  'checkCircle': 'IcSuccess',
  'warning': 'IcWarning',
  'error': 'IcError',
  'info': 'IcInfo',
  'help': 'IcHelp',
  'loading': 'IcStatusLoading',
  'play': 'IcPlay',
  'pause': 'IcPause',
  'stop': 'IcStop',
  'volumeOn': 'IcSound',
  'volumeOff': 'IcSoundDisabled',
  'microphone': 'IcMic',
  'image': 'IcImage',
  'video': 'IcVideo',
  'user': 'IcProfile',
  'users': 'IcGroup',
  'userAdd': 'IcContactAdd',
  'userRemove': 'IcAccountClose',
  'eye': 'IcVisible',
  'eyeOff': 'IcVisibleOff',
  'lock': 'IcLock',
  'unlock': 'IcLockUnlock',
  'star': 'IcStar',
  'starFilled': 'IcStar',
  'heart': 'IcCare',
  'heartFilled': 'IcCare',
  'bookmark': 'IcBookmark',
  'bookmarkFilled': 'IcBookmark',
  'filter': 'IcFilter',
  'sort': 'IcSort',
  'grid': 'IcViewTile',
  'list': 'IcList',
  'moreHorizontal': 'IcMoreHorizontal',
  'mail': 'IcMail',
  'phone': 'IcCall',
  'chat': 'IcChat',
  'notification': 'IcNotification',
  'file': 'IcDocument',
  'folder': 'IcFolder',
  'document': 'IcDocumentPdf',
  'calendar': 'IcCalendar',
  'clock': 'IcTime',
  'location': 'IcLocationPoint',
  'sun': 'IcSunnyClear',
  'moon': 'IcNightClear',
  'palette': 'IcColourPalette',
  'layers': 'IcMapLayers',
  'components': 'IcWidgets',
  'canvas': 'IcFrame',
  'create': 'IcMagic',
  'sparkles': 'IcAiSparkle',
  'globe': 'IcGlobe',
  'smartphone': 'IcMobile',
  'tablet': 'IcTablet',
  'monitor': 'IcLaptop',
  'tv': 'IcTv',
  'printer': 'IcPrint',
  'billboard': 'IcMegaphone',
  'bus': 'IcBusFront',
};

/// Normalizes legacy / Material-style names to canonical camelCase keys.
String resolveCanonicalSemanticIconName(String name) {
  final trimmed = name.trim();
  if (trimmed.isEmpty) return trimmed;
  if (kJioSemanticToCatalogId.containsKey(trimmed)) return trimmed;

  final aliased = normalizeSemanticIconLookupKey(trimmed);
  if (kJioSemanticToCatalogId.containsKey(aliased)) return aliased;

  final flat = trimmed.toLowerCase().replaceAll(RegExp(r'[_\-\s]'), '');
  for (final key in kJioSemanticToCatalogId.keys) {
    if (key.toLowerCase().replaceAll(RegExp(r'[_\-\s]'), '') == flat) {
      return key;
    }
  }
  return aliased;
}

/// Resolves `heart` → `IcCare`, etc. (Storybook uses icon set `jio`).
String? jioCatalogIdForSemanticName(String name) {
  final canonical = resolveCanonicalSemanticIconName(name);
  if (canonical.isEmpty) return null;
  return kJioSemanticToCatalogId[canonical];
}
