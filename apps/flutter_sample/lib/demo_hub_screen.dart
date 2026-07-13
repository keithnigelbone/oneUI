import 'package:flutter/material.dart';
import 'package:ui_flutter/ui_flutter.dart';

import 'demo_store_config.dart';

double _hubSpace(BuildContext context, String token) {
  final scope = OneUiScope.of(context);
  return getSpacingTokenPx(
    spacingName: token,
    platform: scope.platformId,
    density: scope.density,
    platformsConfig: scope.platformsFoundationConfig,
  );
}

/// Landing screen — pick a sample storefront demo.
class DemoHubScreen extends StatelessWidget {
  const DemoHubScreen({
    required this.onOpenStore,
    super.key,
  });

  final ValueChanged<DemoStoreConfig> onOpenStore;

  @override
  Widget build(BuildContext context) {
    final pad = _hubSpace(context, '4');
    final gap = _hubSpace(context, '4');

    return CustomScrollView(
      slivers: [
        SliverToBoxAdapter(
          child: Padding(
            padding: EdgeInsets.fromLTRB(pad, _hubSpace(context, '6'), pad, gap),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                OneUiText(
                  text: 'OneUI Sample Demos',
                  variant: OneUiTextVariant.headline,
                  size: 'm',
                  weight: OneUiTextWeight.high,
                ),
                SizedBox(height: _hubSpace(context, '2')),
                OneUiText(
                  text:
                      'Explore full storefront experiences built with Flutter OneUI components.',
                  variant: OneUiTextVariant.body,
                  size: 'm',
                  attention: OneUiTextAttention.medium,
                ),
              ],
            ),
          ),
        ),
        SliverPadding(
          padding: EdgeInsets.symmetric(horizontal: pad),
          sliver: SliverList(
            delegate: SliverChildBuilderDelegate(
              (context, index) {
                final store = kDemoStoreConfigs[index];
                return Padding(
                  padding: EdgeInsets.only(bottom: gap),
                  child: _DemoHubCard(
                    store: store,
                    onOpen: () => onOpenStore(store),
                  ),
                );
              },
              childCount: kDemoStoreConfigs.length,
            ),
          ),
        ),
        SliverToBoxAdapter(child: SizedBox(height: gap)),
      ],
    );
  }
}

class _DemoHubCard extends StatelessWidget {
  const _DemoHubCard({
    required this.store,
    required this.onOpen,
  });

  final DemoStoreConfig store;
  final VoidCallback onOpen;

  @override
  Widget build(BuildContext context) {
    final pad = _hubSpace(context, '4');
    final radius = _hubSpace(context, '3');

    return OneUiSurface(
      mode: 'elevated',
      padding: EdgeInsets.all(pad),
      borderRadius: BorderRadius.circular(radius),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              OneUiIconContained(
                icon: switch (store.id) {
                  'tira' => 'heart',
                  'peoplefirst' => 'user',
                  _ => 'home',
                },
                size: 'l',
                appearance: 'primary',
                attention: OneUiIconContainedAttention.medium,
                semanticsLabel: store.hubTitle,
              ),
              SizedBox(width: _hubSpace(context, '3')),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    OneUiText(
                      text: store.hubTitle,
                      variant: OneUiTextVariant.title,
                      size: 'm',
                      weight: OneUiTextWeight.high,
                    ),
                    SizedBox(height: _hubSpace(context, '1')),
                    OneUiText(
                      text: store.hubDescription,
                      variant: OneUiTextVariant.body,
                      size: 's',
                      attention: OneUiTextAttention.medium,
                      maxLines: 3,
                    ),
                  ],
                ),
              ),
            ],
          ),
          SizedBox(height: _hubSpace(context, '4')),
          Align(
            alignment: AlignmentDirectional.centerStart,
            child: OneUiButton(
              label: 'Open demo',
              variant: OneUiButtonVariant.bold,
              appearance: 'primary',
              size: 10,
              onPressed: onOpen,
            ),
          ),
        ],
      ),
    );
  }
}
