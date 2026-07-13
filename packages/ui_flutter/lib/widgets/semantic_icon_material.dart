import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';

import '../icons/jio_icon_catalog.dart';
import '../icons/jio_semantic_mapping.dart';
import 'one_ui_directional_icon.dart';

/// Maps [SemanticIconName](`@oneui/shared` `types/icons.ts`) to Material [IconData]
/// when the Jio catalog is unavailable (offline / tests without assets).
IconData oneUiMaterialIconForSemanticName(String name) {
  final canonical = resolveCanonicalSemanticIconName(name);
  final key = canonical.replaceAll(RegExp(r'[_\-\s]'), '').toLowerCase();
  final icon = _semanticIconMap[key];
  if (icon != null) return icon;
  if (kDebugMode) {
    debugPrint('One UI: unknown semantic icon "$name" — using placeholder');
  }
  return Icons.crop_square;
}

/// Token-colour-inheriting semantic icon — prefers Jio SVG (web Storybook parity),
/// then Material fallback.
class OneUiSemanticIcon extends StatefulWidget {
  const OneUiSemanticIcon(
    this.name, {
    super.key,
    this.size,
    this.color,
    this.semanticLabel,
  });

  final String name;

  /// Defaults to [IconTheme.size] then 24.
  final double? size;

  /// When null, uses [IconTheme.of] colour (web `currentColor`).
  final Color? color;

  /// Passed to [Icon.semanticLabel]; empty string hides from semantics (web `aria-hidden`).
  final String? semanticLabel;

  @override
  State<OneUiSemanticIcon> createState() => _OneUiSemanticIconState();
}

class _OneUiSemanticIconState extends State<OneUiSemanticIcon> {
  @override
  void initState() {
    super.initState();
    _ensureCatalogThenRebuild();
  }

  void _ensureCatalogThenRebuild() {
    if (JioIconCatalog.instance.isReady) return;
    JioIconCatalog.instance.ensureLoaded().then((_) {
      if (mounted) setState(() {});
    });
  }

  @override
  Widget build(BuildContext context) {
    final pixelSize = widget.size ?? IconTheme.of(context).size ?? 24;
    final tint =
        widget.color ?? IconTheme.of(context).color ?? const Color(0xFF000000);

    if (!JioIconCatalog.instance.isReady) {
      // Reserve layout space while the catalog loads — avoid Material → Jio SVG
      // glyph swap on first paint (preload via main() / ensureOneUiBrandDefaultsLoaded).
      return SizedBox(width: pixelSize, height: pixelSize);
    }

    final jio = JioIconCatalog.instance.buildSemanticGlyph(
      widget.name,
      size: pixelSize,
      color: tint,
    );
    if (jio != null) {
      return oneUiWrapDirectionalSemanticIcon(
        context,
        semanticName: widget.name,
        child: ExcludeSemantics(
          excluding: widget.semanticLabel == '',
          child: SizedBox(width: pixelSize, height: pixelSize, child: jio),
        ),
      );
    }

    return oneUiWrapDirectionalSemanticIcon(
      context,
      semanticName: widget.name,
      child: Icon(
        oneUiMaterialIconForSemanticName(widget.name),
        size: pixelSize,
        color: tint,
        semanticLabel: widget.semanticLabel ?? '',
      ),
    );
  }
}

final Map<String, IconData> _semanticIconMap = {
  'add': Icons.add,
  'remove': Icons.remove,
  'close': Icons.close,
  'edit': Icons.edit,
  'delete': Icons.delete_outline,
  'copy': Icons.copy,
  'save': Icons.save_outlined,
  'refresh': Icons.refresh,
  'download': Icons.download,
  'upload': Icons.upload,
  'share': Icons.share,
  'link': Icons.link,
  'unlink': Icons.link_off,
  'menu': Icons.menu,
  'search': Icons.search,
  'home': Icons.home_outlined,
  'settings': Icons.settings_outlined,
  'arrowleft': Icons.arrow_back,
  'arrowright': Icons.arrow_forward,
  'arrowup': Icons.arrow_upward,
  'arrowdown': Icons.arrow_downward,
  'chevronleft': Icons.chevron_left,
  'chevronright': Icons.chevron_right,
  'chevronup': Icons.keyboard_arrow_up,
  'chevrondown': Icons.keyboard_arrow_down,
  'externallink': Icons.open_in_new,
  'firstpage': Icons.first_page,
  'lastpage': Icons.last_page,
  'back': Icons.arrow_back_ios_new,
  'next': Icons.arrow_forward_ios,
  'check': Icons.check,
  'checkcircle': Icons.check_circle_outline,
  'warning': Icons.warning_amber_rounded,
  // Jio `IcError` — filled circle with X (not Material `error_outline` ! glyph).
  'error': Icons.cancel,
  'info': Icons.info_outline,
  'help': Icons.help_outline,
  'loading': Icons.hourglass_empty,
  'play': Icons.play_arrow,
  'pause': Icons.pause,
  'stop': Icons.stop,
  'volumeon': Icons.volume_up,
  'volumeoff': Icons.volume_off,
  'microphone': Icons.mic,
  'image': Icons.image_outlined,
  'video': Icons.videocam_outlined,
  'user': Icons.person_outline,
  'users': Icons.people_outline,
  'useradd': Icons.person_add_outlined,
  'userremove': Icons.person_remove_outlined,
  'eye': Icons.visibility_outlined,
  'eyeoff': Icons.visibility_off_outlined,
  'lock': Icons.lock_outline,
  'unlock': Icons.lock_open_outlined,
  'star': Icons.star_outline,
  'starfilled': Icons.star,
  'heart': Icons.favorite_border,
  'heartfilled': Icons.favorite,
  'bookmark': Icons.bookmark_border,
  'bookmarkfilled': Icons.bookmark,
  'filter': Icons.filter_list,
  'sort': Icons.sort,
  'grid': Icons.grid_view,
  'list': Icons.list,
  'morehorizontal': Icons.more_horiz,
  'mail': Icons.mail_outline,
  'phone': Icons.phone_outlined,
  'chat': Icons.chat_bubble_outline,
  'notification': Icons.notifications_outlined,
  'file': Icons.insert_drive_file_outlined,
  'folder': Icons.folder_open,
  'document': Icons.description_outlined,
  'calendar': Icons.calendar_today_outlined,
  'clock': Icons.access_time,
  'location': Icons.location_on_outlined,
  'sun': Icons.wb_sunny_outlined,
  'moon': Icons.dark_mode_outlined,
  'palette': Icons.palette_outlined,
  'layers': Icons.layers_outlined,
  'components': Icons.widgets_outlined,
  'canvas': Icons.aspect_ratio,
  'create': Icons.create,
  'sparkles': Icons.auto_awesome,
  'globe': Icons.public,
  'smartphone': Icons.smartphone,
  'tablet': Icons.tablet,
  'monitor': Icons.desktop_windows_outlined,
  'tv': Icons.tv,
  'printer': Icons.print,
  'billboard': Icons.campaign_outlined,
  'bus': Icons.directions_bus_outlined,
};
