import 'package:flutter/material.dart';

import '../engine/one_ui_text_script.dart';
import '../widgets/one_ui_text.dart';
import '../widgets/one_ui_text_types.dart';

/// Web `Default` story + Controls — mirrors `Text.stories.tsx` argTypes.
class TextDefaultStoryPage extends StatefulWidget {
  const TextDefaultStoryPage({super.key});

  @override
  State<TextDefaultStoryPage> createState() => _TextDefaultStoryPageState();
}

class _TextDefaultStoryPageState extends State<TextDefaultStoryPage> {
  OneUiTextVariant _variant = OneUiTextVariant.body;
  String _size = 'M';
  OneUiTextWeight _weight = OneUiTextWeight.high;
  OneUiTextAttention _attention = OneUiTextAttention.none;
  String _appearance = 'auto';
  OneUiTextLanguage _language = OneUiTextLanguage.latin;
  String? _lang;
  String? _script;
  OneUiTextScriptMode _scriptMode = OneUiTextScriptMode.ui;
  bool _italic = false;
  bool _underline = false;
  bool _strikethrough = false;
  OneUiTextAlign? _textAlign;
  int? _maxLines;
  String? _href;
  String? _semanticsLabel;
  String? _semanticsHint;
  bool _ariaHidden = false;

  late final TextEditingController _contentController;
  late final TextEditingController _langController;
  late final TextEditingController _hrefController;
  late final TextEditingController _semanticsLabelController;
  late final TextEditingController _semanticsHintController;

  @override
  void initState() {
    super.initState();
    _contentController = TextEditingController(
      text: 'The quick brown fox jumps over the lazy dog',
    );
    _langController = TextEditingController();
    _hrefController = TextEditingController();
    _semanticsLabelController = TextEditingController();
    _semanticsHintController = TextEditingController();
  }

  @override
  void dispose() {
    _contentController.dispose();
    _langController.dispose();
    _hrefController.dispose();
    _semanticsLabelController.dispose();
    _semanticsHintController.dispose();
    super.dispose();
  }

  List<String> get _sizeOptions => oneUiTextSizesForVariant(_variant);

  void _onVariantChanged(OneUiTextVariant v) {
    setState(() {
      _variant = v;
      if (!_sizeOptions.contains(_size)) {
        _size = _sizeOptions.contains('M') ? 'M' : _sizeOptions.first;
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final scheme = theme.colorScheme;

    final langTrim = _langController.text.trim();
    final hrefTrim = _hrefController.text.trim();
    final labelTrim = _semanticsLabelController.text.trim();
    final hintTrim = _semanticsHintController.text.trim();

    final preview = KeyedSubtree(
      key: ValueKey<String>(
        'text-default|${_variant.name}|$_size|${_weight.name}|${_attention.name}|'
        '${_appearance}|${_language.name}|$_italic|$_underline|$_strikethrough|'
        '${_textAlign?.name}|$_maxLines|${langTrim.isEmpty ? '' : langTrim}|'
        '${_script ?? ''}|${_scriptMode.name}|$hrefTrim|$labelTrim|$_ariaHidden',
      ),
      child: OneUiText(
        variant: _variant,
        size: _size,
        weight: _weight,
        attention: _attention,
        appearance: _appearance,
        language: _language,
        lang: langTrim.isEmpty ? null : langTrim,
        script: _script,
        scriptMode: _scriptMode,
        italic: _italic,
        underline: _underline,
        strikethrough: _strikethrough,
        textAlign: _textAlign,
        maxLines: _maxLines,
        text: _contentController.text,
        href: hrefTrim.isEmpty ? null : hrefTrim,
        semanticsLabel: labelTrim.isEmpty ? null : labelTrim,
        semanticsHint: hintTrim.isEmpty ? null : hintTrim,
        ariaHidden: _ariaHidden,
      ),
    );

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Expanded(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Center(child: preview),
          ),
        ),
        Material(
          color: scheme.surfaceContainerHighest.withOpacity(0.5),
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
                Wrap(
                  spacing: 16,
                  runSpacing: 12,
                  crossAxisAlignment: WrapCrossAlignment.center,
                  children: [
                    DropdownMenu<OneUiTextVariant>(
                      key: ValueKey('variant-${_variant.name}'),
                      label: const Text('variant'),
                      initialSelection: _variant,
                      dropdownMenuEntries: [
                        for (final v in kOneUiTextVariants)
                          DropdownMenuEntry(value: v, label: v.name),
                      ],
                      onSelected: (v) {
                        if (v != null) _onVariantChanged(v);
                      },
                    ),
                    DropdownMenu<String>(
                      label: const Text('size'),
                      initialSelection: _size,
                      dropdownMenuEntries: [
                        for (final s in _sizeOptions)
                          DropdownMenuEntry(value: s, label: s),
                      ],
                      onSelected: (v) {
                        if (v != null) setState(() => _size = v);
                      },
                    ),
                    SizedBox(
                      width: 360,
                      child: TextField(
                        controller: _contentController,
                        decoration: const InputDecoration(
                          labelText: 'children',
                          border: OutlineInputBorder(),
                        ),
                        onChanged: (_) => setState(() {}),
                      ),
                    ),
                    DropdownMenu<OneUiTextWeight>(
                      label: const Text('weight'),
                      initialSelection: _weight,
                      dropdownMenuEntries: [
                        for (final w in kOneUiTextWeights)
                          DropdownMenuEntry(value: w, label: w.name),
                      ],
                      onSelected: (v) {
                        if (v != null) setState(() => _weight = v);
                      },
                    ),
                    DropdownMenu<OneUiTextAttention>(
                      label: const Text('attention'),
                      initialSelection: _attention,
                      dropdownMenuEntries: [
                        for (final a in kOneUiTextAttentions)
                          DropdownMenuEntry(value: a, label: a.name),
                      ],
                      onSelected: (v) {
                        if (v != null) setState(() => _attention = v);
                      },
                    ),
                    DropdownMenu<String>(
                      label: const Text('appearance'),
                      initialSelection: _appearance,
                      dropdownMenuEntries: [
                        for (final a in kOneUiTextAppearances)
                          DropdownMenuEntry(value: a, label: a),
                      ],
                      onSelected: (v) {
                        if (v != null) setState(() => _appearance = v);
                      },
                    ),
                    DropdownMenu<OneUiTextLanguage>(
                      label: const Text('language'),
                      initialSelection: _language,
                      dropdownMenuEntries: [
                        for (final l in kOneUiTextLanguages)
                          DropdownMenuEntry(value: l, label: l.name),
                      ],
                      onSelected: (v) {
                        if (v != null) setState(() => _language = v);
                      },
                    ),
                    SizedBox(
                      width: 140,
                      child: TextField(
                        controller: _langController,
                        decoration: const InputDecoration(
                          labelText: 'lang',
                          hintText: 'hi',
                          border: OutlineInputBorder(),
                        ),
                        onChanged: (_) => setState(() {}),
                      ),
                    ),
                    DropdownMenu<String?>(
                      label: const Text('script'),
                      initialSelection: _script,
                      dropdownMenuEntries: [
                        const DropdownMenuEntry<String?>(
                          value: null,
                          label: '(auto)',
                        ),
                        for (final id in kOneUiTypographyScriptIds)
                          DropdownMenuEntry<String?>(value: id, label: id),
                      ],
                      onSelected: (v) => setState(() => _script = v),
                    ),
                    DropdownMenu<OneUiTextScriptMode>(
                      label: const Text('scriptMode'),
                      initialSelection: _scriptMode,
                      dropdownMenuEntries: [
                        for (final m in kOneUiTextScriptModes)
                          DropdownMenuEntry(value: m, label: m.name),
                      ],
                      onSelected: (v) {
                        if (v != null) setState(() => _scriptMode = v);
                      },
                    ),
                    FilterChip(
                      label: const Text('italic'),
                      selected: _italic,
                      onSelected: (v) => setState(() => _italic = v),
                    ),
                    FilterChip(
                      label: const Text('underline'),
                      selected: _underline,
                      onSelected: (v) => setState(() => _underline = v),
                    ),
                    FilterChip(
                      label: const Text('strikethrough'),
                      selected: _strikethrough,
                      onSelected: (v) => setState(() => _strikethrough = v),
                    ),
                    SegmentedButton<OneUiTextAlign?>(
                      segments: const [
                        ButtonSegment(value: null, label: Text('inherit')),
                        ButtonSegment(
                            value: OneUiTextAlign.left, label: Text('left')),
                        ButtonSegment(
                          value: OneUiTextAlign.center,
                          label: Text('center'),
                        ),
                        ButtonSegment(
                            value: OneUiTextAlign.right, label: Text('right')),
                      ],
                      selected: {_textAlign},
                      onSelectionChanged: (s) =>
                          setState(() => _textAlign = s.first),
                    ),
                    SizedBox(
                      width: 120,
                      child: TextField(
                        decoration: const InputDecoration(
                          labelText: 'maxLines',
                          border: OutlineInputBorder(),
                        ),
                        keyboardType: TextInputType.number,
                        onChanged: (v) {
                          setState(() {
                            final n = int.tryParse(v.trim());
                            _maxLines = n != null && n > 0 ? n : null;
                          });
                        },
                      ),
                    ),
                    SizedBox(
                      width: 200,
                      child: TextField(
                        controller: _hrefController,
                        decoration: const InputDecoration(
                          labelText: 'href',
                          hintText: 'https://…',
                          border: OutlineInputBorder(),
                        ),
                        onChanged: (_) => setState(() {}),
                      ),
                    ),
                    SizedBox(
                      width: 200,
                      child: TextField(
                        controller: _semanticsLabelController,
                        decoration: const InputDecoration(
                          labelText: 'aria-label',
                          border: OutlineInputBorder(),
                        ),
                        onChanged: (_) => setState(() {}),
                      ),
                    ),
                    SizedBox(
                      width: 200,
                      child: TextField(
                        controller: _semanticsHintController,
                        decoration: const InputDecoration(
                          labelText: 'accessibilityHint',
                          border: OutlineInputBorder(),
                        ),
                        onChanged: (_) => setState(() {}),
                      ),
                    ),
                    FilterChip(
                      label: const Text('aria-hidden'),
                      selected: _ariaHidden,
                      onSelected: (v) => setState(() => _ariaHidden = v),
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
