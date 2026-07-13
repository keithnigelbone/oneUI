import 'package:flutter/material.dart';

import '../widgets/one_ui_icon.dart';
import '../widgets/one_ui_icon_remote.dart';
import '../widgets/one_ui_icon_types.dart';
import 'icon_showcase.dart';

enum _IconInputMode { semantic, url }

/// Web `Default` + `Interactive` — centered preview + Controls panel.
class IconDefaultStoryPage extends StatefulWidget {
  const IconDefaultStoryPage({super.key});

  @override
  State<IconDefaultStoryPage> createState() => _IconDefaultStoryPageState();
}

class _IconDefaultStoryPageState extends State<IconDefaultStoryPage> {
  _IconInputMode _inputMode = _IconInputMode.semantic;
  String _semanticName = 'heart';
  String _remoteUrl = kOneUiIconRemoteUrlPresets.first.$2;
  String _size = '5';
  String? _appearance = 'neutral';
  OneUiIconEmphasis _emphasis = OneUiIconEmphasis.high;
  bool _tintRaster = false;
  bool _exposeA11y = true;
  late final TextEditingController _labelController;
  late final TextEditingController _customIconController;

  static const _appearances = <String?>[null, 'auto', ...kOneUiIconAppearances];

  @override
  void initState() {
    super.initState();
    _labelController = TextEditingController(text: 'Interactive heart');
    _customIconController = TextEditingController(text: _semanticName);
  }

  @override
  void dispose() {
    _labelController.dispose();
    _customIconController.dispose();
    super.dispose();
  }

  Object get _resolvedIcon {
    if (_inputMode == _IconInputMode.url) {
      return _remoteUrl.trim();
    }
    final custom = _customIconController.text.trim();
    if (custom.isNotEmpty) return custom;
    return _semanticName;
  }

  bool get _isRasterUrl =>
      _inputMode == _IconInputMode.url && !isOneUiIconRemoteSvgUrl(_remoteUrl);

  void _selectSemantic(String name) {
    setState(() {
      _semanticName = name;
      _customIconController.text = name;
      _labelController.text = 'Interactive $name';
    });
  }

  void _selectRemoteUrl(String url, String label) {
    setState(() {
      _remoteUrl = url;
      _customIconController.text = url;
      _labelController.text = label;
      if (!isOneUiIconRemoteSvgUrl(url)) {
        _tintRaster = true;
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final scheme = theme.colorScheme;
    final iconValue = _resolvedIcon;

    final preview = OneUiIcon(
      icon: iconValue,
      size: _size,
      appearance: _appearance,
      emphasis: _emphasis,
      tintRaster: _isRasterUrl ? _tintRaster : false,
      semanticsLabel: _exposeA11y ? _labelController.text : null,
      excludeFromSemantics: !_exposeA11y ? true : null,
    );

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Expanded(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Column(
              children: [
                Text(
                  _inputMode == _IconInputMode.semantic
                      ? 'Jio semantic icon'
                      : 'Remote URL icon',
                  style: theme.textTheme.labelMedium?.copyWith(
                    color: scheme.onSurfaceVariant,
                  ),
                ),
                const SizedBox(height: 12),
                Center(child: preview),
                const SizedBox(height: 16),
                SelectableText(
                  iconValue is String ? iconValue.toString() : 'Widget glyph',
                  style: theme.textTheme.bodySmall?.copyWith(
                    fontFamily: 'monospace',
                    color: scheme.onSurfaceVariant,
                  ),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          ),
        ),
        Material(
          color: scheme.surfaceContainerHighest.withValues(alpha: 0.5),
          child: Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Controls',
                  style: theme.textTheme.titleSmall
                      ?.copyWith(fontWeight: FontWeight.w600),
                ),
                const SizedBox(height: 12),
                SegmentedButton<_IconInputMode>(
                  segments: const [
                    ButtonSegment(
                      value: _IconInputMode.semantic,
                      label: Text('Jio semantic'),
                      icon: Icon(Icons.label_outline, size: 18),
                    ),
                    ButtonSegment(
                      value: _IconInputMode.url,
                      label: Text('Remote URL'),
                      icon: Icon(Icons.link, size: 18),
                    ),
                  ],
                  selected: {_inputMode},
                  onSelectionChanged: (v) {
                    setState(() {
                      _inputMode = v.first;
                      if (_inputMode == _IconInputMode.semantic) {
                        _customIconController.text = _semanticName;
                      } else {
                        _customIconController.text = _remoteUrl;
                      }
                    });
                  },
                ),
                const SizedBox(height: 12),
                if (_inputMode == _IconInputMode.semantic) ...[
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: [
                      for (final name in kOneUiIconSemanticPresets.take(12))
                        FilterChip(
                          label: Text(name),
                          selected: _semanticName == name,
                          onSelected: (_) => _selectSemantic(name),
                        ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  DropdownMenu<String>(
                    label: const Text('icon (semantic preset)'),
                    initialSelection: _semanticName,
                    dropdownMenuEntries: [
                      for (final n in kOneUiIconSemanticPresets)
                        DropdownMenuEntry(value: n, label: n),
                    ],
                    onSelected: (v) {
                      if (v != null) _selectSemantic(v);
                    },
                  ),
                ] else ...[
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: [
                      for (final (label, url)
                          in kOneUiIconRemoteUrlPresets.take(8))
                        FilterChip(
                          label: Text(label),
                          selected: _remoteUrl == url,
                          onSelected: (_) => _selectRemoteUrl(url, label),
                        ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  DropdownMenu<String>(
                    label: const Text('icon (URL preset)'),
                    initialSelection: _remoteUrl,
                    dropdownMenuEntries: [
                      for (final (label, url) in kOneUiIconRemoteUrlPresets)
                        DropdownMenuEntry(value: url, label: label),
                    ],
                    onSelected: (v) {
                      if (v != null) {
                        final match = kOneUiIconRemoteUrlPresets
                            .where((e) => e.$2 == v)
                            .firstOrNull;
                        _selectRemoteUrl(v, match?.$1 ?? 'Remote icon');
                      }
                    },
                  ),
                  if (_isRasterUrl) ...[
                    const SizedBox(height: 8),
                    FilterChip(
                      label: const Text('tintRaster'),
                      selected: _tintRaster,
                      onSelected: (v) => setState(() => _tintRaster = v),
                    ),
                  ],
                ],
                const SizedBox(height: 12),
                SizedBox(
                  width: double.infinity,
                  child: TextField(
                    decoration: InputDecoration(
                      labelText: _inputMode == _IconInputMode.semantic
                          ? 'icon (semantic name or paste URL)'
                          : 'icon (https:// URL)',
                      isDense: true,
                      border: const OutlineInputBorder(),
                      helperText: _inputMode == _IconInputMode.semantic
                          ? "e.g. 'heart' or paste a full https:// URL"
                          : 'Full CDN URL — same prop as semantic names',
                    ),
                    controller: _customIconController,
                    onChanged: (v) {
                      setState(() {
                        if (_inputMode == _IconInputMode.url ||
                            isOneUiIconNetworkSrc(v)) {
                          _inputMode = _IconInputMode.url;
                          _remoteUrl = v.trim();
                        } else {
                          _semanticName = v.trim();
                        }
                      });
                    },
                  ),
                ),
                const SizedBox(height: 12),
                Wrap(
                  spacing: 16,
                  runSpacing: 12,
                  crossAxisAlignment: WrapCrossAlignment.center,
                  children: [
                    DropdownMenu<String>(
                      label: const Text('size'),
                      initialSelection: _size,
                      dropdownMenuEntries: [
                        for (final s in kOneUiIconSizes)
                          DropdownMenuEntry(value: s, label: s),
                      ],
                      onSelected: (v) {
                        if (v != null) setState(() => _size = v);
                      },
                    ),
                    DropdownMenu<String?>(
                      label: const Text('appearance'),
                      initialSelection: _appearance,
                      dropdownMenuEntries: [
                        const DropdownMenuEntry(
                            value: null, label: 'inherit / neutral'),
                        for (final a in kOneUiIconAppearances)
                          DropdownMenuEntry(value: a, label: a),
                      ],
                      onSelected: (v) => setState(() => _appearance = v),
                    ),
                    DropdownMenu<OneUiIconEmphasis>(
                      label: const Text('emphasis'),
                      initialSelection: _emphasis,
                      dropdownMenuEntries: [
                        for (final e in OneUiIconEmphasis.values)
                          DropdownMenuEntry(value: e, label: e.name),
                      ],
                      onSelected: (v) {
                        if (v != null) setState(() => _emphasis = v);
                      },
                    ),
                    SizedBox(
                      width: 220,
                      child: TextField(
                        decoration: const InputDecoration(
                          labelText: 'aria-label',
                          isDense: true,
                          border: OutlineInputBorder(),
                        ),
                        controller: _labelController,
                        enabled: _exposeA11y,
                        onChanged: (_) => setState(() {}),
                      ),
                    ),
                    FilterChip(
                      label: const Text('aria-label set'),
                      selected: _exposeA11y,
                      onSelected: (v) => setState(() => _exposeA11y = v),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
