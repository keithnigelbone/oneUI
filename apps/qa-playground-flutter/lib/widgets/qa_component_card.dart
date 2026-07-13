import 'package:flutter/material.dart';
import 'package:ui_flutter/widgets/one_ui_focus_interactive.dart';
import 'package:ui_flutter/widgets/one_ui_icon.dart';
import 'package:ui_flutter/widgets/one_ui_icon_types.dart';
import 'package:ui_flutter/widgets/one_ui_surface.dart';
import 'package:ui_flutter/widgets/one_ui_text.dart';
import 'package:ui_flutter/widgets/one_ui_text_types.dart';

import '../catalog/qa_catalog.dart';
import '../qa/component_test_stability.dart';
import 'qa_catalog_tokens.dart';
import 'qa_component_preview.dart';
import 'qa_stability_badge.dart';

/// Component catalog card — React `catalog.module.css` card parity.
class QaComponentCard extends StatelessWidget {
  const QaComponentCard({
    required this.entry,
    required this.onTap,
    this.stability,
    super.key,
  });

  final QaCatalogEntry entry;
  final VoidCallback onTap;
  final QaComponentTestStability? stability;

  @override
  Widget build(BuildContext context) {
    final tokens = QaCatalogTokens.of(context);
    final radius = BorderRadius.circular(tokens.f('f5'));
    final resolvedStability =
        stability ?? QaComponentTestStability.underDevelopment;

    return OneUiFocusInteractive(
      semanticsLabel: 'Open ${entry.name} component',
      enabled: true,
      onPressed: onTap,
      borderRadius: radius,
      child: OneUiSurface(
        mode: 'elevated',
        borderRadius: radius,
        clipBehavior: Clip.antiAlias,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Stack(
              clipBehavior: Clip.hardEdge,
              children: [
                OneUiSurface(
                  mode: 'minimal',
                  borderRadius: BorderRadius.zero,
                  padding: EdgeInsets.all(tokens.spacing('4')),
                  child: SizedBox(
                    height: tokens.f('f13'),
                    width: double.infinity,
                    child: ClipRect(
                      child: Center(
                        child: QaComponentPreview(slug: entry.slug),
                      ),
                    ),
                  ),
                ),
                Positioned(
                  top: tokens.spacing('3-5'),
                  right: tokens.spacing('3-5'),
                  child: QaStabilityBadge(stability: resolvedStability, compact: true),
                ),
              ],
            ),
            OneUiSurface(
              mode: 'elevated',
              borderRadius: BorderRadius.zero,
              padding: EdgeInsets.symmetric(
                horizontal: tokens.spacing('4-5'),
                vertical: tokens.spacing('4'),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  Expanded(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        OneUiText(
                          text: entry.name,
                          variant: OneUiTextVariant.label,
                          size: 's',
                          weight: OneUiTextWeight.medium,
                          maxLines: 2,
                        ),
                        SizedBox(height: tokens.spacing('1')),
                        OneUiText(
                          text: entry.slug,
                          variant: OneUiTextVariant.code,
                          size: 's',
                          weight: OneUiTextWeight.low,
                          attention: OneUiTextAttention.low,
                          maxLines: 1,
                        ),
                      ],
                    ),
                  ),
                  SizedBox(width: tokens.spacing('3')),
                  OneUiSurface(
                    mode: 'minimal',
                    padding: EdgeInsets.all(tokens.spacing('2')),
                    child: const OneUiIcon(
                      icon: 'chevronRight',
                      size: '4',
                      emphasis: OneUiIconEmphasis.low,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
