import 'package:flutter/material.dart';
import 'package:ui_flutter/ui_flutter.dart';
import 'package:ui_flutter/widgets/one_ui_image.dart';

import 'product_image_urls.dart';

/// Product tile — network [OneUiImage] with bundled asset fallback on mobile.
class DemoProductImage extends StatelessWidget {
  const DemoProductImage({
    required this.productId,
    required this.alt,
    super.key,
  });

  final String productId;
  final String alt;

  Widget _assetFallback() {
    return Image.asset(
      demoProductImageAsset(productId),
      fit: BoxFit.cover,
      width: double.infinity,
      height: double.infinity,
      semanticLabel: alt,
      errorBuilder: (_, __, ___) => Image.asset(
        kDemoProductImageAssetFallback,
        fit: BoxFit.cover,
        width: double.infinity,
        height: double.infinity,
        semanticLabel: alt,
        errorBuilder: (_, __, ___) => OneUiSurface(
          mode: 'minimal',
          child: Center(
            child: OneUiIcon(
              icon: 'image',
              size: '6',
              excludeFromSemantics: true,
            ),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return SizedBox.expand(
      child: OneUiImage(
        src: demoProductImageUrl(productId),
        alt: alt,
        aspectRatio: OneUiImageAspectRatio.auto,
        fit: OneUiImageObjectFit.cover,
        borderRadiusToken: '--Shape-3',
        fallbackSrc: kDemoProductImageFallback,
        fallback: _assetFallback(),
        loading: OneUiImageLoadingStrategy.lazy,
      ),
    );
  }
}
