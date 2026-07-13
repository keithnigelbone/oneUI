import 'package:flutter/material.dart';
import 'package:ui_flutter/widgets/one_ui_avatar.dart';
import 'package:ui_flutter/widgets/one_ui_badge.dart';
import 'package:ui_flutter/widgets/one_ui_button.dart';
import 'package:ui_flutter/widgets/one_ui_checkbox.dart';
import 'package:ui_flutter/widgets/one_ui_chip.dart';
import 'package:ui_flutter/widgets/one_ui_circular_progress_indicator.dart';
import 'package:ui_flutter/widgets/one_ui_linear_progress_indicator.dart';
import 'package:ui_flutter/widgets/one_ui_icon.dart';
import 'package:ui_flutter/widgets/one_ui_icon_button.dart';
import 'package:ui_flutter/widgets/one_ui_icon_contained.dart';
import 'package:ui_flutter/widgets/one_ui_avatar_types.dart';
import 'package:ui_flutter/widgets/one_ui_input.dart';
import 'package:ui_flutter/widgets/one_ui_radio.dart';
import 'package:ui_flutter/widgets/one_ui_slider.dart';
import 'package:ui_flutter/widgets/one_ui_text.dart';
import 'package:ui_flutter/widgets/one_ui_touch_slider.dart';

import '../catalog/qa_catalog.dart';

/// Mini live preview strip for catalog cards — uses real OneUI widgets.
class QaComponentPreview extends StatelessWidget {
  const QaComponentPreview({required this.slug, super.key});

  final String slug;

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        return FittedBox(
          fit: BoxFit.scaleDown,
          alignment: Alignment.center,
          child: ConstrainedBox(
            constraints: BoxConstraints(
              maxWidth: constraints.maxWidth,
              maxHeight: constraints.maxHeight,
            ),
            child: _previewForSlug(slug),
          ),
        );
      },
    );
  }

  Widget _previewForSlug(String slug) {
    switch (slug) {
      case 'checkbox':
        return OneUiCheckbox(checked: true, label: 'Option', readOnly: true);
      case 'checkbox-field':
        return OneUiCheckbox(checked: true, label: 'Field option', readOnly: true);
      case 'input':
        return const SizedBox(
          width: 160,
          child: OneUiInput(value: 'Sample', readOnly: true, size: 8),
        );
      case 'input-field':
      case 'input-dynamic-text':
      case 'input-feedback':
        return const SizedBox(
          width: 160,
          child: OneUiInput(value: 'Field', readOnly: true, size: 8),
        );
      case 'radio':
      case 'radio-field':
        return OneUiRadio(checked: true, label: 'Selected', readOnly: true);
      case 'badge':
        return const OneUiBadge(semanticsLabel: 'preview', child: 'New');
      case 'counter-badge':
        return const OneUiCounterBadge(value: 3, semanticsLabel: '3');
      case 'indicator-badge':
        return const OneUiIndicatorBadge(semanticsLabel: 'dot');
      case 'avatar':
        return const OneUiAvatar(
          content: OneUiAvatarContent.icon,
          alt: 'User',
          size: 's',
        );
      case 'text':
        return const OneUiText(text: 'Body text');
      case 'image':
        return const OneUiIcon(icon: 'image', semanticsLabel: 'Image');
      case 'button':
        return const OneUiButton(label: 'Button', sizeAlias: 's');
      case 'chip':
        return OneUiChip(child: 'Chip', selected: true);
      case 'chip-group':
        return Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            OneUiChip(child: 'A', selected: true),
            const SizedBox(width: 6),
            OneUiChip(child: 'B'),
          ],
        );
      case 'icon':
        return const OneUiIcon(icon: 'add', semanticsLabel: 'Add');
      case 'icon-contained':
        return const OneUiIconContained(icon: 'star', semanticsLabel: 'Star');
      case 'icon-button':
        return const OneUiIconButton(icon: 'add', semanticsLabel: 'Add', sizeAlias: 'm');
      case 'circular-progress-indicator':
        return const OneUiCircularProgressIndicator(
          variant: 'indeterminate',
          semanticsLabel: 'Loading',
          size: 'S',
        );
      case 'slider':
        return const SizedBox(
          width: double.infinity,
          child: OneUiSlider(
            defaultValue: 50,
            showTooltip: 'false',
            appearance: 'primary',
            knobStyle: 'outside',
            readOnly: true,
            ariaLabel: 'Preview',
          ),
        );
      case 'touch-slider':
        return const SizedBox(
          width: double.infinity,
          child: OneUiTouchSlider(
            defaultValue: 40,
            appearance: 'secondary',
            progressStyle: 'rounded',
            start: OneUiIcon(icon: 'volumeOn', size: '5'),
            readOnly: true,
            ariaLabel: 'Preview',
          ),
        );
      case 'linear-progress-indicator':
        return const OneUiLinearProgressIndicator(
          type: 'determinate',
          appearance: 'primary',
          size: 'M',
          value: 60,
          semanticsLabel: 'Task progress',
        );
      default:
        final entry = qaCatalogEntryForSlug(slug);
        return OneUiText(
          text: entry?.name ?? 'Component',
          size: 's',
        );
    }
  }
}
