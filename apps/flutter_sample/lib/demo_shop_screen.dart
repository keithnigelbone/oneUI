import 'package:flutter/material.dart';
import 'package:ui_flutter/ui_flutter.dart';

import 'demo_product_catalog.dart';
import 'demo_product_image.dart';
import 'demo_responsive.dart';
import 'demo_store_config.dart';

double space(BuildContext context, String token) {
  final scope = OneUiScope.of(context);
  return getSpacingTokenPx(
    spacingName: token,
    platform: scope.platformId,
    density: scope.density,
    platformsConfig: scope.platformsFoundationConfig,
  );
}

/// Storefront demo — complete browse → cart → pay journey.
class DemoShopScreen extends StatefulWidget {
  const DemoShopScreen({
    required this.config,
    required this.accentAppearance,
    super.key,
  });

  final DemoStoreConfig config;
  final String accentAppearance;

  @override
  State<DemoShopScreen> createState() => _DemoShopScreenState();
}

class _DemoShopScreenState extends State<DemoShopScreen> {
  String _query = '';
  String _category = 'all';
  final Map<String, int> _cart = {};
  final Set<String> _favourites = {};
  String _activeTab = 'home';
  String _payment = 'upi';
  String _pincode = '400001';
  String? _pincodeError;
  bool _agree = false;
  String? _agreeError;
  bool _inStockOnly = false;
  bool _placing = false;
  bool _orderPlaced = false;
  bool _showPincodeField = false;
  bool _profileOpen = false;
  String _couponInput = '';
  String? _appliedCoupon;
  String? _couponMessage;
  String? _couponError;
  String _profileName = 'Swapnil Parab';
  String _profileEmail = '';
  String _profilePhone = '+91 98765 43210';
  String _profileAddress = 'Work · Andheri East, Mumbai';

  @override
  void initState() {
    super.initState();
    _profileEmail = widget.config.profileEmail;
  }

  @override
  void didUpdateWidget(DemoShopScreen oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.config.id != widget.config.id) {
      _profileEmail = widget.config.profileEmail;
      _cart.clear();
      _favourites.clear();
      _category = 'all';
      _query = '';
      _orderPlaced = false;
    }
  }

  String _appearance(String role) {
    if (OneUiSurfaceScope.isAppearanceConfigured(context, role)) return role;
    return widget.accentAppearance;
  }

  int get _cartCount => demoCartItemCount(_cart);

  List<DemoProduct> get _visibleProducts => widget.config.products.where((p) {
        final matchesQuery =
            p.name.toLowerCase().contains(_query.toLowerCase());
        final matchesCat = _category == 'all' || p.category == _category;
        final matchesStock = !_inStockOnly || p.inStock;
        final matchesFav =
            _category != 'favourites' || _favourites.contains(p.id);
        return matchesQuery && matchesCat && matchesStock && matchesFav;
      }).toList();

  int get _subtotal => demoCartSubtotalFor(widget.config.products, _cart);
  int get _mrpTotal => demoCartMrpTotalFor(widget.config.products, _cart);
  int get _discount => _mrpTotal - _subtotal;
  int get _couponDiscount => _appliedCoupon == null
      ? 0
      : (widget.config.coupons[_appliedCoupon]?.discount ?? 0);
  int get _deliveryFee =>
      _appliedCoupon == 'FREEDEL' ||
              _subtotal >= widget.config.freeDeliveryThreshold
          ? 0
          : 30;
  int get _payable => (_subtotal - _couponDiscount + _deliveryFee).clamp(0, 999999);

  int get _tabIndex => switch (_activeTab) {
        'home' => 0,
        'categories' => 1,
        'cart' => 2,
        'account' => 3,
        _ => 0,
      };

  /// Content width — simulates platform breakpoint (360 / 768 / 1440 …) on wide browsers.
  double _shopMaxWidth(BuildContext context) {
    final viewport = MediaQuery.sizeOf(context).width;
    final platform = OneUiScope.of(context).platformId;
    return shopContentMaxWidth(
      viewportWidth: viewport,
      platformId: platform,
    );
  }

  int _gridColumnCount(BuildContext context) {
    final platform = OneUiScope.of(context).platformId;
    final contentW = _shopMaxWidth(context) - space(context, '4') * 2;
    if (platform == 'S-360') return 2;
    if (platform == 'M-768') return 3;
    if (platform == 'M-1024') return 4;
    if (contentW >= space(context, '40') + space(context, '32')) return 5;
    return 4;
  }

  /// Footer block height for grid aspect-ratio math (image flexes inside the cell).
  double _productCardFooterHeight(BuildContext context) {
    final gap = space(context, '2');
    final platform = OneUiScope.of(context).platformId;
    final actionRow = space(context, '8') + space(context, '2');
    final buffer = platform == 'S-360'
        ? space(context, '2')
        : space(context, '4');
    return gap +
        space(context, '4') +
        space(context, '1') +
        space(context, '8') +
        gap +
        space(context, '6') +
        space(context, '1') +
        actionRow +
        buffer;
  }

  double _productCardHeight(BuildContext context, double cardWidth) {
    final gap = space(context, '2');
    final imageSide = cardWidth - gap * 2;
    return gap * 2 +
        imageSide +
        _productCardFooterHeight(context) +
        space(context, '3');
  }

  Widget _constrainedShop(Widget child) {
    if (isHandheldNativeDemo(context)) return child;

    final maxW = _shopMaxWidth(context);
    final viewport = MediaQuery.sizeOf(context).width;
    final platform = OneUiScope.of(context).platformId;
    final framed = showPhoneFramePreview(
      viewportWidth: viewport,
      platformId: platform,
      contentMaxWidth: maxW,
      frameGapPx: space(context, '16'),
    );

    Widget content = child;
    if (framed) {
      content = OneUiSurface(
        mode: 'elevated',
        borderRadius: BorderRadius.circular(space(context, '3')),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(space(context, '3')),
          child: child,
        ),
      );
    }

    return Align(
      alignment: Alignment.topCenter,
      child: ConstrainedBox(
        constraints: BoxConstraints(maxWidth: maxW),
        child: content,
      ),
    );
  }

  void _setQty(String productId, int qty) {
    setState(() {
      if (qty <= 0) {
        _cart.remove(productId);
      } else {
        _cart[productId] = qty;
      }
      _orderPlaced = false;
    });
  }

  void _toggleFavourite(String productId) {
    setState(() {
      if (_favourites.contains(productId)) {
        _favourites.remove(productId);
      } else {
        _favourites.add(productId);
      }
    });
  }

  void _applyCoupon() {
    final code = _couponInput.trim().toUpperCase();
    final coupon = widget.config.coupons[code];
    setState(() {
      if (coupon == null) {
        _couponError = 'Invalid coupon code';
        _appliedCoupon = null;
        _couponMessage = null;
      } else {
        _appliedCoupon = code;
        _couponMessage = coupon.message;
        _couponError = null;
      }
    });
  }

  Future<void> _placeOrder() async {
    if (_cart.isEmpty) {
      setState(() => _agreeError = 'Your cart is empty');
      return;
    }
    if (!_agree) {
      setState(() {
        _agreeError = 'Please accept the terms';
        _orderPlaced = false;
      });
      return;
    }
    setState(() {
      _agreeError = null;
      _placing = true;
      _orderPlaced = false;
    });
    await Future<void>.delayed(const Duration(milliseconds: 1400));
    if (!mounted) return;
    setState(() {
      _placing = false;
      _orderPlaced = true;
      _cart.clear();
      _appliedCoupon = null;
      _couponMessage = null;
      _couponInput = '';
    });
  }

  Widget _cartNavIcon() {
    return Stack(
      clipBehavior: Clip.none,
      children: [
        const OneUiIcon(
          icon: 'list',
          size: '5',
          excludeFromSemantics: true,
        ),
        if (_cartCount > 0)
          Positioned(
            top: -space(context, '1'),
            right: -space(context, '1'),
            child: OneUiCounterBadge(
              value: _cartCount,
              size: 'xs',
              appearance: 'negative',
              semanticsLabel: '$_cartCount items in cart',
            ),
          ),
      ],
    );
  }

  Widget _buildHeader({bool showSearch = true}) {
    final pad = space(context, '4');
    return Padding(
      padding: EdgeInsets.fromLTRB(pad, space(context, '2'), pad, space(context, '3')),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              OneUiBrandLogo(size: OneUiLogoSize.s, alt: widget.config.logoAlt),
              if (showSearch) ...[
                SizedBox(width: space(context, '2')),
                Expanded(
                  child: OneUiInput(
                    placeholder: widget.config.searchPlaceholder,
                    value: _query,
                    onChanged: (v) => setState(() => _query = v),
                    start: const OneUiIcon(
                      icon: 'search',
                      size: '4',
                      excludeFromSemantics: true,
                    ),
                    size: 10,
                    appearance: OneUiInputAppearance.auto,
                    shape: OneUiInputShape.pill,
                    ariaLabel: widget.config.searchPlaceholder,
                  ),
                ),
              ] else
                const Spacer(),
              SizedBox(width: space(context, '1')),
              OneUiIndicatorBadgeOverlay(
                hostSide: space(context, '10'),
                anchor: OneUiIndicatorBadgeOverlayAnchor.topEnd,
                indicatorSize: 's',
                host: OneUiIconButton(
                  icon: 'notification',
                  semanticsLabel: 'Notifications',
                  variant: OneUiIconButtonVariant.ghost,
                  size: 8,
                  onPressed: () {},
                ),
                indicator: const OneUiIndicatorBadge(
                  size: 's',
                  appearance: 'negative',
                  semanticsLabel: 'New notifications',
                ),
              ),
              OneUiIconButton(
                icon: 'user',
                semanticsLabel: 'Open profile',
                variant: OneUiIconButtonVariant.ghost,
                size: 8,
                onPressed: () => setState(() => _profileOpen = true),
              ),
            ],
          ),
          if (showSearch) ...[
            SizedBox(height: space(context, '3')),
            if (_showPincodeField)
              OneUiInputField(
                label: 'Delivery pincode',
                placeholder: '400001',
                value: _pincode,
                onChanged: (v) => setState(() {
                  _pincode = v;
                  _pincodeError =
                      v.length != 6 ? 'Enter a valid 6-digit pincode' : null;
                }),
                fullWidth: true,
                required: true,
                type: 'number',
                error: _pincodeError,
                start: const OneUiIcon(icon: 'location', size: '4'),
              )
            else
              OneUiInputDynamicText(
                content: 'Deliver to $_pincode',
                end: 'Change',
                size: 's',
                onEndClick: () => setState(() => _showPincodeField = true),
                endAriaLabel: 'Change delivery pincode',
              ),
          ],
        ],
      ),
    );
  }

  Widget _buildCategoryChips({bool includeFavourites = false}) {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      padding: EdgeInsets.symmetric(horizontal: space(context, '4')),
      child: OneUiChipGroup(
        value: [_category],
        multiple: false,
        onValueChange: (vals) => setState(
          () => _category = vals.isEmpty ? 'all' : vals.first,
        ),
        children: [
          for (final chip in widget.config.categoryChips)
            OneUiChip(value: chip.value, child: chip.label),
          if (includeFavourites)
            OneUiChip(
              value: 'favourites',
              child: 'Favourites (${_favourites.length})',
            ),
        ],
      ),
    );
  }

  Widget _buildProductImageFill(DemoProduct product) {
    return DemoProductImage(productId: product.id, alt: product.name);
  }

  Widget _buildProductCardFooter(DemoProduct product, int qty) {
    final gap = space(context, '2');
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      mainAxisSize: MainAxisSize.min,
      children: [
        OneUiText(
          text: product.packLabel,
          variant: OneUiTextVariant.label,
          size: 'xs',
          attention: OneUiTextAttention.medium,
          maxLines: 1,
        ),
        SizedBox(height: space(context, '1')),
        OneUiText(
          text: product.name,
          variant: OneUiTextVariant.body,
          size: 'xs',
          weight: OneUiTextWeight.medium,
          maxLines: 2,
        ),
        SizedBox(height: gap),
        Row(
          children: [
            Expanded(
              child: OneUiText(
                text: product.priceLabel,
                variant: OneUiTextVariant.label,
                size: 's',
                weight: OneUiTextWeight.high,
                maxLines: 1,
              ),
            ),
            SizedBox(width: space(context, '1')),
            OneUiText(
              text: product.mrpLabel,
              variant: OneUiTextVariant.label,
              size: 'xs',
              attention: OneUiTextAttention.low,
              maxLines: 1,
            ),
          ],
        ),
        SizedBox(height: space(context, '1')),
        Align(
          alignment: AlignmentDirectional.centerEnd,
          child: qty == 0
              ? _buildAddButton(product)
              : _buildQtyStepper(product, qty),
        ),
      ],
    );
  }

  Widget _buildAddButton(DemoProduct product) {
    return OneUiButton(
      label: 'Add',
      variant: OneUiButtonVariant.subtle,
      appearance: _appearance('primary'),
      size: 6,
      disabled: !product.inStock,
      onPressed: product.inStock ? () => _setQty(product.id, 1) : null,
    );
  }

  Widget _buildQtyStepper(DemoProduct product, int qty) {
    return OneUiSurface(
      mode: 'minimal',
      padding: EdgeInsets.symmetric(horizontal: space(context, '0-5')),
      borderRadius: BorderRadius.circular(space(context, '2')),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          OneUiIconButton(
            icon: 'remove',
            semanticsLabel: 'Decrease quantity',
            variant: OneUiIconButtonVariant.ghost,
            size: 6,
            onPressed: () => _setQty(product.id, qty - 1),
          ),
          Padding(
            padding: EdgeInsets.symmetric(horizontal: space(context, '0-5')),
            child: OneUiText(
              text: '$qty',
              variant: OneUiTextVariant.label,
              size: 'xs',
              weight: OneUiTextWeight.high,
            ),
          ),
          OneUiIconButton(
            icon: 'add',
            semanticsLabel: 'Increase quantity',
            variant: OneUiIconButtonVariant.ghost,
            size: 6,
            onPressed:
                product.inStock ? () => _setQty(product.id, qty + 1) : null,
          ),
        ],
      ),
    );
  }

  Widget _buildCompactProductCard(DemoProduct product) {
    final qty = _cart[product.id] ?? 0;
    final isFav = _favourites.contains(product.id);
    final gap = space(context, '2');
    final radius = space(context, '2');

    return SizedBox.expand(
      child: ClipRect(
        child: OneUiSurface(
          mode: 'elevated',
          padding: EdgeInsets.all(gap),
          borderRadius: BorderRadius.circular(radius),
          child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Expanded(
              child: OneUiSurface(
                mode: 'minimal',
                padding: EdgeInsets.zero,
                borderRadius: BorderRadius.circular(radius),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(radius),
                  child: Stack(
                    fit: StackFit.expand,
                    children: [
                      _buildProductImageFill(product),
                      Positioned(
                        top: space(context, '1'),
                        left: space(context, '1'),
                        child: OneUiIconButton(
                          icon: isFav ? 'heartFilled' : 'heart',
                          semanticsLabel:
                              isFav ? 'Remove favourite' : 'Add favourite',
                          variant: OneUiIconButtonVariant.ghost,
                          size: 8,
                          appearance: isFav ? 'negative' : 'neutral',
                          onPressed: () => _toggleFavourite(product.id),
                        ),
                      ),
                      if (product.bestseller)
                        Positioned(
                          top: space(context, '1'),
                          right: space(context, '1'),
                          child: OneUiBadge(
                            child: 'Best',
                            variant: 'subtle',
                            appearance: 'positive',
                            size: 'xs',
                            semanticsLabel: 'Bestseller',
                          ),
                        ),
                    ],
                  ),
                ),
              ),
            ),
            SizedBox(height: gap),
            _buildProductCardFooter(product, qty),
          ],
        ),
        ),
      ),
    );
  }

  Widget _buildProductGridSliver() {
    final products = _visibleProducts;
    final pad = space(context, '4');
    final shopW = _shopMaxWidth(context);
    final contentW = shopW - pad * 2;
    final cols = _gridColumnCount(context);
    final gap = space(context, '2');
    final cardW = (contentW - gap * (cols - 1)) / cols;
    final cardH = _productCardHeight(context, cardW);
    final aspectRatio = cardW / cardH;

    if (products.isEmpty) {
      return SliverToBoxAdapter(
        child: Padding(
          padding: EdgeInsets.all(space(context, '6')),
          child: OneUiText(
            text: 'No products match your filters',
            variant: OneUiTextVariant.body,
            size: 'm',
            attention: OneUiTextAttention.medium,
            textAlign: OneUiTextAlign.center,
          ),
        ),
      );
    }

    return SliverPadding(
      padding: EdgeInsets.symmetric(horizontal: pad),
      sliver: SliverGrid(
        gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: cols,
          crossAxisSpacing: gap,
          mainAxisSpacing: space(context, '3'),
          childAspectRatio: aspectRatio,
        ),
        delegate: SliverChildBuilderDelegate(
          (context, index) => _buildCompactProductCard(products[index]),
          childCount: products.length,
        ),
      ),
    );
  }

  Widget _buildCartLine(DemoProduct product, int qty) {
    return Padding(
      padding: EdgeInsets.only(bottom: space(context, '3')),
      child: OneUiSurface(
        mode: 'minimal',
        padding: EdgeInsets.all(space(context, '3')),
        borderRadius: BorderRadius.circular(space(context, '2')),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(space(context, '2')),
              child: SizedBox(
                width: space(context, '12'),
                height: space(context, '12'),
                child: DemoProductImage(
                  productId: product.id,
                  alt: product.name,
                ),
              ),
            ),
            SizedBox(width: space(context, '3')),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  OneUiText(
                    text: product.name,
                    variant: OneUiTextVariant.body,
                    size: 's',
                    weight: OneUiTextWeight.medium,
                    maxLines: 2,
                  ),
                  SizedBox(height: space(context, '1')),
                  Row(
                    children: [
                      OneUiText(
                        text: product.priceLabel,
                        variant: OneUiTextVariant.label,
                        size: 's',
                        weight: OneUiTextWeight.high,
                      ),
                      SizedBox(width: space(context, '2')),
                      OneUiText(
                        text: product.mrpLabel,
                        variant: OneUiTextVariant.label,
                        size: 'xs',
                        attention: OneUiTextAttention.low,
                      ),
                    ],
                  ),
                  SizedBox(height: space(context, '2')),
                  Row(
                    children: [
                      OneUiIconButton(
                        icon: 'remove',
                        semanticsLabel: 'Decrease quantity',
                        variant: OneUiIconButtonVariant.ghost,
                        size: 8,
                        onPressed: () => _setQty(product.id, qty - 1),
                      ),
                      OneUiText(
                        text: '$qty',
                        variant: OneUiTextVariant.title,
                        size: 's',
                        weight: OneUiTextWeight.high,
                      ),
                      OneUiIconButton(
                        icon: 'add',
                        semanticsLabel: 'Increase quantity',
                        variant: OneUiIconButtonVariant.ghost,
                        size: 8,
                        onPressed: () => _setQty(product.id, qty + 1),
                      ),
                      const Spacer(),
                      OneUiIconButton(
                        icon: 'delete',
                        semanticsLabel: 'Remove from cart',
                        variant: OneUiIconButtonVariant.ghost,
                        appearance: 'negative',
                        size: 8,
                        onPressed: () => _setQty(product.id, 0),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPaymentSummary() {
    return OneUiSurface(
      mode: 'subtle',
      padding: EdgeInsets.all(space(context, '4')),
      borderRadius: BorderRadius.circular(space(context, '3')),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          OneUiText(
            text: 'Payment details',
            variant: OneUiTextVariant.title,
            size: 's',
            weight: OneUiTextWeight.high,
          ),
          SizedBox(height: space(context, '3')),
          _summaryRow('MRP total', '₹$_mrpTotal'),
          if (_discount > 0)
            _summaryRow('Product discount', '-₹$_discount', positive: true),
          _summaryRow('Subtotal', '₹$_subtotal'),
          if (_couponDiscount > 0)
            _summaryRow('Coupon', '-₹$_couponDiscount', positive: true),
          _summaryRow(
            'Delivery fee',
            _deliveryFee == 0 ? 'FREE' : '₹$_deliveryFee',
            positive: _deliveryFee == 0,
          ),
          SizedBox(height: space(context, '2')),
          OneUiDivider(size: 's'),
          SizedBox(height: space(context, '2')),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              OneUiText(
                text: 'Total',
                variant: OneUiTextVariant.title,
                size: 'm',
                weight: OneUiTextWeight.high,
              ),
              OneUiText(
                text: '₹$_payable',
                variant: OneUiTextVariant.title,
                size: 'm',
                weight: OneUiTextWeight.high,
                appearance: _appearance('primary'),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _summaryRow(String label, String value, {bool positive = false}) {
    return Padding(
      padding: EdgeInsets.only(bottom: space(context, '2')),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          OneUiText(
            text: label,
            variant: OneUiTextVariant.body,
            size: 's',
            attention: OneUiTextAttention.medium,
          ),
          OneUiText(
            text: value,
            variant: OneUiTextVariant.body,
            size: 's',
            weight: OneUiTextWeight.medium,
            appearance: positive ? 'positive' : 'auto',
          ),
        ],
      ),
    );
  }

  Widget _buildCategoryCircles() {
    final categories = widget.config.categoryShortcuts;
    return Padding(
      padding: EdgeInsets.symmetric(
        horizontal: space(context, '4'),
        vertical: space(context, '3'),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          for (final shortcut in categories)
            Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                OneUiIconContained(
                  icon: shortcut.icon,
                  size: 'm',
                  appearance: _appearance('primary'),
                  attention: OneUiIconContainedAttention.medium,
                  semanticsLabel: shortcut.label,
                ),
                SizedBox(height: space(context, '1')),
                OneUiText(
                  text: shortcut.label,
                  variant: OneUiTextVariant.label,
                  size: 'xs',
                  weight: OneUiTextWeight.medium,
                ),
              ],
            ),
        ],
      ),
    );
  }

  Widget _buildHomeTab() {
    return CustomScrollView(
      slivers: [
        SliverToBoxAdapter(child: _buildHeader()),
        SliverToBoxAdapter(child: SizedBox(height: space(context, '2'))),
        SliverToBoxAdapter(child: _buildCategoryChips()),
        if (widget.config.promoBanner != null)
          SliverToBoxAdapter(
            child: Padding(
              padding: EdgeInsets.fromLTRB(
                space(context, '4'),
                0,
                space(context, '4'),
                space(context, '2'),
              ),
              child: OneUiSurface(
                mode: 'subtle',
                padding: EdgeInsets.all(space(context, '3')),
                borderRadius: BorderRadius.circular(space(context, '2')),
                child: Row(
                  children: [
                    OneUiIcon(
                      icon: 'starFilled',
                      size: '5',
                      appearance: _appearance('primary'),
                      excludeFromSemantics: true,
                    ),
                    SizedBox(width: space(context, '2')),
                    Expanded(
                      child: OneUiText(
                        text: widget.config.promoBanner!,
                        variant: OneUiTextVariant.label,
                        size: 's',
                        weight: OneUiTextWeight.medium,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        SliverToBoxAdapter(child: _buildCategoryCircles()),
        SliverToBoxAdapter(
          child: Padding(
            padding: EdgeInsets.fromLTRB(
              space(context, '4'),
              space(context, '3'),
              space(context, '4'),
              space(context, '2'),
            ),
            child: OneUiDivider(
              content: kOneUiDividerContentLabel,
              child: widget.config.gridSectionTitle,
            ),
          ),
        ),
        _buildProductGridSliver(),
        SliverToBoxAdapter(child: SizedBox(height: space(context, '4'))),
      ],
    );
  }

  Widget _buildCategoriesTab() {
    return CustomScrollView(
      slivers: [
        SliverToBoxAdapter(child: _buildHeader(showSearch: true)),
        SliverToBoxAdapter(child: SizedBox(height: space(context, '2'))),
        SliverToBoxAdapter(child: _buildCategoryChips(includeFavourites: true)),
        SliverToBoxAdapter(child: SizedBox(height: space(context, '3'))),
        _buildProductGridSliver(),
        SliverToBoxAdapter(child: SizedBox(height: space(context, '4'))),
      ],
    );
  }

  Widget _buildCartTab() {
    final lines = _cart.entries.toList();
    return ListView(
      padding: EdgeInsets.all(space(context, '4')),
      children: [
        Row(
          children: [
            OneUiText(
              text: 'Cart',
              variant: OneUiTextVariant.headline,
              size: 's',
              weight: OneUiTextWeight.high,
            ),
            SizedBox(width: space(context, '2')),
            if (_cartCount > 0)
              OneUiCounterBadge(
                value: _cartCount,
                appearance: 'negative',
                size: 's',
                semanticsLabel: '$_cartCount items in cart',
              ),
          ],
        ),
        SizedBox(height: space(context, '3')),
        if (_orderPlaced)
          OneUiInputFeedback(
            variant: OneUiInputFeedbackVariant.positive,
            attention: OneUiInputFeedbackAttention.high,
            feedbackMessage:
                'Order placed successfully! Payment via ${_payment.toUpperCase()} confirmed.',
          ),
        if (_cartCount == 0 && !_orderPlaced)
          OneUiText(
            text: 'Your cart is empty. Browse products on Home or Categories.',
            variant: OneUiTextVariant.body,
            size: 'm',
            attention: OneUiTextAttention.medium,
          ),
        if (lines.isNotEmpty) ...[
          OneUiDivider(
            content: kOneUiDividerContentLabel,
            child: '${widget.config.cartDividerLabel} ($_cartCount items)',
          ),
          SizedBox(height: space(context, '3')),
          for (final entry in lines)
            if (findDemoProduct(widget.config.products, entry.key) != null)
              _buildCartLine(
                findDemoProduct(widget.config.products, entry.key)!,
                entry.value,
              ),
          SizedBox(height: space(context, '4')),
          OneUiText(
            text: 'Coupons & offers',
            variant: OneUiTextVariant.title,
            size: 's',
            weight: OneUiTextWeight.high,
          ),
          SizedBox(height: space(context, '2')),
          Row(
            children: [
              Expanded(
                child: OneUiInput(
                  placeholder: widget.config.couponPlaceholder,
                  value: _couponInput,
                  onChanged: (v) => setState(() => _couponInput = v),
                  size: 10,
                  ariaLabel: 'Coupon code',
                ),
              ),
              SizedBox(width: space(context, '2')),
              OneUiButton(
                label: 'Apply',
                variant: OneUiButtonVariant.subtle,
                appearance: _appearance('primary'),
                size: 10,
                onPressed: _applyCoupon,
              ),
            ],
          ),
          if (_couponError != null) ...[
            SizedBox(height: space(context, '2')),
            OneUiInputFeedback(
              variant: OneUiInputFeedbackVariant.negative,
              attention: OneUiInputFeedbackAttention.low,
              feedbackMessage: _couponError,
            ),
          ],
          if (_couponMessage != null) ...[
            SizedBox(height: space(context, '2')),
            OneUiInputFeedback(
              variant: OneUiInputFeedbackVariant.positive,
              attention: OneUiInputFeedbackAttention.low,
              feedbackMessage: _couponMessage,
            ),
          ],
          SizedBox(height: space(context, '4')),
          _buildPaymentSummary(),
          SizedBox(height: space(context, '4')),
          OneUiRadioField(
            label: 'Payment method',
            fullWidth: true,
            defaultValue: _payment,
            onValueChange: (v) => setState(() => _payment = v),
            children: [
              OneUiRadio(label: 'UPI', value: 'upi'),
              OneUiRadio(label: 'Cash on delivery', value: 'cod'),
              OneUiRadio(label: 'Credit / Debit card', value: 'card'),
            ],
          ),
          SizedBox(height: space(context, '3')),
          OneUiCheckboxField(
            label: 'I agree to the Terms & Conditions',
            checked: _agree,
            onCheckedChange: (v) => setState(() {
              _agree = v;
              if (v) _agreeError = null;
            }),
            required: true,
            error: _agreeError,
          ),
          SizedBox(height: space(context, '3')),
          if (_placing)
            Center(
              child: OneUiCircularProgressIndicator(
                variant: 'indeterminate',
                size: 'M',
                appearance: _appearance('primary'),
                animate: true,
                semanticsLabel: 'Placing your order',
              ),
            ),
          if (_agreeError != null && !_placing && !_orderPlaced)
            OneUiInputFeedback(
              variant: OneUiInputFeedbackVariant.negative,
              attention: OneUiInputFeedbackAttention.low,
              feedbackMessage: _agreeError,
            ),
          SizedBox(height: space(context, '3')),
          OneUiButton(
            label: 'Pay now ₹$_payable',
            variant: OneUiButtonVariant.bold,
            appearance: _appearance('primary'),
            fullWidth: true,
            loading: _placing,
            onPressed: _placing ? null : _placeOrder,
          ),
        ],
      ],
    );
  }

  Widget _buildAccountTab() {
    return ListView(
      padding: EdgeInsets.all(space(context, '4')),
      children: [
        Row(
          children: [
            OneUiAvatar(
              content: OneUiAvatarContent.text,
              size: 'xl',
              appearance: 'auto',
              alt: _profileName.isNotEmpty ? _profileName.substring(0, 1) : 'U',
            ),
            SizedBox(width: space(context, '4')),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  OneUiText(
                    text: _profileName,
                    variant: OneUiTextVariant.title,
                    size: 'm',
                    weight: OneUiTextWeight.high,
                  ),
                  SizedBox(height: space(context, '1')),
                  OneUiText(
                    text: _profileEmail,
                    variant: OneUiTextVariant.body,
                    size: 's',
                    attention: OneUiTextAttention.medium,
                  ),
                ],
              ),
            ),
            OneUiIconButton(
              icon: 'edit',
              semanticsLabel: 'Edit profile',
              variant: OneUiIconButtonVariant.ghost,
              onPressed: () => setState(() => _profileOpen = true),
            ),
          ],
        ),
        SizedBox(height: space(context, '4')),
        OneUiDivider(content: kOneUiDividerContentLabel, child: 'Profile'),
        SizedBox(height: space(context, '3')),
        OneUiInputField(
          label: 'Full name',
          value: _profileName,
          onChanged: (v) => setState(() => _profileName = v),
          fullWidth: true,
        ),
        SizedBox(height: space(context, '3')),
        OneUiInputField(
          label: 'Email',
          value: _profileEmail,
          onChanged: (v) => setState(() => _profileEmail = v),
          fullWidth: true,
          type: 'email',
        ),
        SizedBox(height: space(context, '3')),
        OneUiInputField(
          label: 'Phone',
          value: _profilePhone,
          onChanged: (v) => setState(() => _profilePhone = v),
          fullWidth: true,
          type: 'tel',
        ),
        SizedBox(height: space(context, '3')),
        OneUiInputField(
          label: 'Saved address',
          value: _profileAddress,
          onChanged: (v) => setState(() => _profileAddress = v),
          fullWidth: true,
        ),
        SizedBox(height: space(context, '3')),
        OneUiCheckbox(
          label: 'In stock only when browsing',
          checked: _inStockOnly,
          onCheckedChange: (v) => setState(() => _inStockOnly = v),
          appearance: _appearance('primary'),
          size: 'm',
        ),
        SizedBox(height: space(context, '4')),
        OneUiText(
          text: 'Favourites: ${_favourites.length} products saved',
          variant: OneUiTextVariant.body,
          size: 's',
          attention: OneUiTextAttention.medium,
        ),
      ],
    );
  }

  Widget _buildProfileOverlay() {
    return Positioned.fill(
      child: OneUiSurface(
        mode: 'bold',
        padding: EdgeInsets.all(space(context, '4')),
        child: SafeArea(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Row(
                children: [
                  Expanded(
                    child: OneUiText(
                      text: 'My profile',
                      variant: OneUiTextVariant.headline,
                      size: 's',
                      weight: OneUiTextWeight.high,
                      appearance: 'auto',
                    ),
                  ),
                  OneUiIconButton(
                    icon: 'close',
                    semanticsLabel: 'Close profile',
                    variant: OneUiIconButtonVariant.ghost,
                    onPressed: () => setState(() => _profileOpen = false),
                  ),
                ],
              ),
              SizedBox(height: space(context, '4')),
              Center(
                child: OneUiAvatar(
                  content: OneUiAvatarContent.text,
                  size: '2xl',
                  appearance: 'auto',
                  alt: 'SP',
                ),
              ),
              SizedBox(height: space(context, '4')),
              OneUiInputField(
                label: 'Name',
                value: _profileName,
                onChanged: (v) => setState(() => _profileName = v),
                fullWidth: true,
              ),
              SizedBox(height: space(context, '3')),
              OneUiInputField(
                label: 'Email',
                value: _profileEmail,
                onChanged: (v) => setState(() => _profileEmail = v),
                fullWidth: true,
                type: 'email',
              ),
              SizedBox(height: space(context, '3')),
              OneUiInputField(
                label: 'Phone',
                value: _profilePhone,
                onChanged: (v) => setState(() => _profilePhone = v),
                fullWidth: true,
              ),
              SizedBox(height: space(context, '3')),
              OneUiInputField(
                label: 'Delivery address',
                value: _profileAddress,
                onChanged: (v) => setState(() => _profileAddress = v),
                fullWidth: true,
              ),
              SizedBox(height: space(context, '4')),
              OneUiButton(
                label: 'Save preferences',
                variant: OneUiButtonVariant.bold,
                appearance: 'auto',
                fullWidth: true,
                onPressed: () => setState(() => _profileOpen = false),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      fit: StackFit.expand,
      children: [
        Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Expanded(
              child: _constrainedShop(
                IndexedStack(
                  index: _tabIndex,
                  children: [
                    _buildHomeTab(),
                    _buildCategoriesTab(),
                    _buildCartTab(),
                    _buildAccountTab(),
                  ],
                ),
              ),
            ),
            _constrainedShop(
              OneUiBottomNavigation(
                semanticsLabel: 'Primary navigation',
                value: _activeTab,
                onValueChange: (v) => setState(() => _activeTab = v),
                appearance: _appearance('primary'),
                labelType: '1line',
                children: [
                  const OneUiBottomNavItem(
                    icon: 'home',
                    label: 'Home',
                    value: 'home',
                  ),
                  const OneUiBottomNavItem(
                    icon: 'grid',
                    label: 'Categories',
                    value: 'categories',
                  ),
                  OneUiBottomNavItem(
                    icon: _cartNavIcon(),
                    label: 'Cart',
                    value: 'cart',
                  ),
                  const OneUiBottomNavItem(
                    icon: 'user',
                    label: 'Account',
                    value: 'account',
                  ),
                ],
              ),
            ),
          ],
        ),
        if (_profileOpen) _buildProfileOverlay(),
      ],
    );
  }
}
