import 'package:flutter/material.dart';
import 'package:ui_flutter/ui_flutter.dart';

import 'demo_product_catalog.dart';
import 'demo_product_image.dart';
import 'demo_responsive.dart';
import 'demo_store_config.dart';
import 'demo_tira_account.dart';
import 'demo_tira_auth.dart';
import 'demo_tira_checkout.dart';
import 'demo_tira_catalog.dart';

double _space(BuildContext context, String token) {
  final scope = OneUiScope.of(context);
  return getSpacingTokenPx(
    spacingName: token,
    platform: scope.platformId,
    density: scope.density,
    platformsConfig: scope.platformsFoundationConfig,
  );
}

enum _TiraRoute {
  home,
  shop,
  cart,
  login,
  otp,
  account,
  checkout,
  orderSuccess,
}

/// Tira Beauty storefront — home carousels, PLP grid, bag, and OTP login.
class DemoTiraFlow extends StatefulWidget {
  const DemoTiraFlow({
    required this.config,
    required this.accentAppearance,
    super.key,
  });

  final DemoStoreConfig config;
  final String accentAppearance;

  @override
  State<DemoTiraFlow> createState() => _DemoTiraFlowState();
}

class _DemoTiraFlowState extends State<DemoTiraFlow> {
  _TiraRoute _route = _TiraRoute.home;
  final Map<String, int> _cart = {};
  final Set<String> _wishlist = {};
  String _query = '';
  String _sortBy = 'relevance';
  String _shopCategory = 'all';
  bool _termsAccepted = false;
  String _phone = '';
  String? _phoneError;
  String? _otpError;
  final List<String> _otpDigits = ['', '', '', ''];
  bool _isLoggedIn = false;
  TiraDemoUser? _user;
  String _gender = 'male';
  String _accountSection = 'personal';
  bool _couponApplied = false;
  String _pincode = '400001';
  bool _showPincodeField = false;
  String? _orderId;

  bool get _phoneValid => isValidTiraPhone(_phone);
  String get _otp => _otpDigits.join();
  bool get _otpValid => _otp.length == 4;
  int get _couponDiscount =>
      _couponApplied && _isLoggedIn ? (_subtotal * 0.33).round() : 0;
  int get _payable => (_subtotal - _couponDiscount).clamp(0, 999999);

  String _appearance(String role) {
    if (OneUiSurfaceScope.isAppearanceConfigured(context, role)) return role;
    return widget.accentAppearance;
  }

  int get _cartCount => demoCartItemCount(_cart);
  int get _subtotal => demoCartSubtotalFor(widget.config.products, _cart);
  int get _mrpTotal => demoCartMrpTotalFor(widget.config.products, _cart);
  int get _discount => _mrpTotal - _subtotal;

  List<({DemoProduct product, int qty})> get _cartLines {
    final lines = <({DemoProduct product, int qty})>[];
    for (final entry in _cart.entries) {
      final product = findDemoProduct(widget.config.products, entry.key);
      if (product != null) {
        lines.add((product: product, qty: entry.value));
      }
    }
    return lines;
  }

  double _contentMaxWidth(BuildContext context) {
    final viewport = MediaQuery.sizeOf(context).width;
    return shopContentMaxWidth(
      viewportWidth: viewport,
      platformId: OneUiScope.of(context).platformId,
    );
  }

  /// Tira login/OTP card width — wide enough for phone field + 4 OTP boxes.
  double _authModalWidth(BuildContext context) {
    final viewport = MediaQuery.sizeOf(context).width;
    final frame = _contentMaxWidth(context);
    final outerPad = _space(context, '4') * 2;
    final available = (viewport < frame ? viewport : frame) - outerPad;
    final ideal = _space(context, '40') +
        _space(context, '40') +
        _space(context, '24');
    if (available < ideal) return available;
    return ideal;
  }

  Widget _framed(Widget child) {
    if (isHandheldNativeDemo(context)) return child;

    final maxW = _contentMaxWidth(context);
    final viewport = MediaQuery.sizeOf(context).width;
    final gap = _space(context, '8');
    final framed = showPhoneFramePreview(
      viewportWidth: viewport,
      platformId: OneUiScope.of(context).platformId,
      contentMaxWidth: maxW,
      frameGapPx: gap,
    );
    if (!framed) {
      return Align(
        alignment: Alignment.topCenter,
        child: ConstrainedBox(
          constraints: BoxConstraints(maxWidth: maxW),
          child: child,
        ),
      );
    }
    return Center(
      child: ConstrainedBox(
        constraints: BoxConstraints(maxWidth: maxW),
        child: OneUiSurface(
          mode: 'elevated',
          borderRadius: BorderRadius.circular(_space(context, '3')),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(_space(context, '3')),
            child: child,
          ),
        ),
      ),
    );
  }

  void _go(_TiraRoute route) => setState(() => _route = route);

  void _setQty(String productId, int qty) {
    setState(() {
      if (qty <= 0) {
        _cart.remove(productId);
      } else {
        _cart[productId] = qty;
      }
    });
  }

  void _toggleWishlist(String productId) {
    setState(() {
      if (_wishlist.contains(productId)) {
        _wishlist.remove(productId);
      } else {
        _wishlist.add(productId);
      }
    });
  }

  void _sendOtp() {
    if (!_termsAccepted) {
      setState(
        () => _phoneError = 'Please accept Terms of Use and Privacy Policy',
      );
      return;
    }
    if (!_phoneValid) {
      setState(
        () => _phoneError = 'Enter a valid 10-digit mobile number',
      );
      return;
    }
    setState(() {
      _phoneError = null;
      _otpError = null;
      _otpDigits.fillRange(0, 4, '');
      _route = _TiraRoute.otp;
    });
  }

  void _verifyOtp() {
    if (_otp != kTiraStaticOtp) {
      setState(
        () => _otpError = 'Incorrect OTP. Demo OTP is $kTiraStaticOtp',
      );
      return;
    }
    final profile = randomTiraUserProfile(_phone);
    setState(() {
      _otpError = null;
      _isLoggedIn = true;
      _user = profile;
      _gender = profile.gender;
      _accountSection = 'personal';
      _route = _TiraRoute.cart;
    });
  }

  void _onOtpDigit(int index, String value) {
    final digit = sanitiseTiraPhone(value);
    final next = digit.isEmpty ? '' : digit[digit.length - 1];
    setState(() {
      _otpDigits[index] = next;
      _otpError = null;
    });
  }

  void _openCheckout() {
    if (!_isLoggedIn) {
      _openLogin();
      return;
    }
    if (_cartCount == 0) return;
    setState(() => _route = _TiraRoute.checkout);
  }

  void _confirmPay() {
    setState(() {
      _orderId =
          'TIRA${DateTime.now().millisecondsSinceEpoch.remainder(1000000)}';
      _cart.clear();
      _couponApplied = false;
      _route = _TiraRoute.orderSuccess;
    });
  }

  void _finishOrder() {
    setState(() {
      _orderId = null;
      _route = _TiraRoute.home;
    });
  }

  void _openLogin() {
    if (_isLoggedIn) return;
    setState(() => _route = _TiraRoute.login);
  }

  void _openAccount({String section = 'personal'}) {
    if (!_isLoggedIn) {
      _openLogin();
      return;
    }
    setState(() {
      _accountSection = section;
      _route = _TiraRoute.account;
    });
  }

  String get _sortLabel => switch (_sortBy) {
        'rating' => 'Top rated',
        'price_low' => 'Price: Low to High',
        'price_high' => 'Price: High to Low',
        _ => 'Relevance',
      };

  void _cycleSort() {
    setState(() {
      _sortBy = switch (_sortBy) {
        'relevance' => 'rating',
        'rating' => 'price_low',
        'price_high' => 'relevance',
        _ => 'price_high',
      };
    });
  }

  List<DemoProduct> get _sortedProducts {
    final items = widget.config.products.where((p) {
      if (_shopCategory != 'all' && p.category != _shopCategory) return false;
      if (_query.isEmpty) return true;
      final q = _query.toLowerCase();
      return p.name.toLowerCase().contains(q) ||
          p.displayBrand.toLowerCase().contains(q);
    }).toList();
    switch (_sortBy) {
      case 'price_low':
        items.sort((a, b) => a.price.compareTo(b.price));
      case 'price_high':
        items.sort((a, b) => b.price.compareTo(a.price));
      case 'rating':
        items.sort(
          (a, b) => (b.rating ?? 0).compareTo(a.rating ?? 0),
        );
      default:
        break;
    }
    return items;
  }

  bool get _showsBottomNav => switch (_route) {
        _TiraRoute.login ||
        _TiraRoute.otp ||
        _TiraRoute.checkout ||
        _TiraRoute.orderSuccess =>
          false,
        _ => true,
      };

  String get _bottomNavValue => switch (_route) {
        _TiraRoute.shop => 'shop',
        _TiraRoute.cart => 'cart',
        _TiraRoute.account => 'account',
        _ => 'home',
      };

  @override
  Widget build(BuildContext context) {
    return _framed(
      OneUiSurface(
        mode: 'default',
        child: Column(
          children: [
            Expanded(child: _buildRouteBody(context)),
            if (_showsBottomNav) _buildBottomNav(context),
          ],
        ),
      ),
    );
  }

  Widget _buildRouteBody(BuildContext context) {
    return switch (_route) {
      _TiraRoute.home => _buildHome(context),
      _TiraRoute.shop => _buildShop(context),
      _TiraRoute.cart => _buildCart(context),
      _TiraRoute.login => _buildLogin(context),
      _TiraRoute.otp => _buildOtp(context),
      _TiraRoute.account => _buildAccount(context),
      _TiraRoute.checkout => _buildCheckout(context),
      _TiraRoute.orderSuccess => _buildOrderSuccess(context),
    };
  }

  Widget _cartNavIcon() {
    return Stack(
      clipBehavior: Clip.none,
      children: [
        const OneUiIcon(
          icon: 'bookmark',
          size: '5',
          excludeFromSemantics: true,
        ),
        if (_cartCount > 0)
          Positioned(
            top: -_space(context, '1'),
            right: -_space(context, '1'),
            child: OneUiCounterBadge(
              value: _cartCount,
              size: 'xs',
              appearance: _appearance('primary'),
              semanticsLabel: '$_cartCount items in bag',
            ),
          ),
      ],
    );
  }

  Widget _buildBottomNav(BuildContext context) {
    return OneUiBottomNavigation(
      semanticsLabel: 'Tira primary navigation',
      value: _bottomNavValue,
      onValueChange: (value) {
        switch (value) {
          case 'shop':
            _go(_TiraRoute.shop);
          case 'cart':
            _go(_TiraRoute.cart);
          case 'account':
            if (_isLoggedIn) {
              _openAccount();
            } else {
              _go(_TiraRoute.account);
            }
          default:
            _go(_TiraRoute.home);
        }
      },
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
          label: 'Shop',
          value: 'shop',
        ),
        OneUiBottomNavItem(
          icon: _cartNavIcon(),
          label: 'Bag',
          value: 'cart',
        ),
        const OneUiBottomNavItem(
          icon: 'user',
          label: 'Account',
          value: 'account',
        ),
      ],
    );
  }

  Widget _buildHome(BuildContext context) {
    final pad = _space(context, '4');
    return CustomScrollView(
      slivers: [
        SliverToBoxAdapter(child: _buildUtilityBar(context)),
        SliverToBoxAdapter(child: _buildMainHeader(context)),
        SliverToBoxAdapter(child: _buildCategoryStrip(context)),
        SliverPadding(
          padding: EdgeInsets.fromLTRB(pad, pad, pad, 0),
          sliver: SliverToBoxAdapter(
            child: _buildCarouselSection(
              context,
              title: 'Just Dropped',
              products: kTiraJustDropped,
              onViewAll: () => _go(_TiraRoute.shop),
            ),
          ),
        ),
        SliverPadding(
          padding: EdgeInsets.fromLTRB(pad, pad, pad, pad),
          sliver: SliverToBoxAdapter(
            child: _buildCarouselSection(
              context,
              title: 'Dermat recommended must haves',
              products: kTiraDermPicks,
              onViewAll: () => _go(_TiraRoute.shop),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildUtilityBar(BuildContext context) {
    final padH = _space(context, '4');
    final padV = _space(context, '1');
    return Padding(
      padding: EdgeInsets.fromLTRB(padH, padV, padH, 0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.end,
        children: [
          OneUiButton(
            label: 'Track Order',
            variant: OneUiButtonVariant.ghost,
            size: 6,
            onPressed: () {},
          ),
          SizedBox(width: _space(context, '3')),
          OneUiButton(
            label: 'Help Centre',
            variant: OneUiButtonVariant.ghost,
            size: 6,
            onPressed: () {},
          ),
        ],
      ),
    );
  }

  Widget _buildMainHeader(BuildContext context) {
    final pad = _space(context, '4');
    final gap = _space(context, '2');
    return Padding(
      padding: EdgeInsets.all(pad),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              OneUiBrandLogo(
                size: OneUiLogoSize.m,
                alt: widget.config.logoAlt,
              ),
              SizedBox(width: gap),
              Expanded(
                child: _isLoggedIn && _user != null
                    ? OneUiButton(
                        label:
                            'Hi, ${_user!.firstName} | Treats | ${_user!.treatsPoints} points  >',
                        variant: OneUiButtonVariant.ghost,
                        size: 6,
                        onPressed: () => _openAccount(),
                      )
                    : OneUiButton(
                        label: 'Welcome  Login/Sign Up  >',
                        variant: OneUiButtonVariant.ghost,
                        size: 6,
                        onPressed: _openLogin,
                      ),
              ),
              _bagButton(context),
              SizedBox(width: gap),
              OneUiIndicatorBadgeOverlay(
                hostSide: _space(context, '10'),
                anchor: OneUiIndicatorBadgeOverlayAnchor.topEnd,
                indicatorSize: 's',
                host: OneUiIconButton(
                  icon: 'notification',
                  semanticsLabel: 'Beauty offers',
                  variant: OneUiIconButtonVariant.ghost,
                  size: 8,
                  onPressed: () {},
                ),
                indicator: const OneUiIndicatorBadge(
                  size: 's',
                  appearance: 'negative',
                  semanticsLabel: 'New beauty offers',
                ),
              ),
              SizedBox(width: gap),
              if (_isLoggedIn && _user != null) ...[
                OneUiAvatar(
                  content: OneUiAvatarContent.text,
                  size: 's',
                  appearance: 'auto',
                  alt: _user!.firstName.isNotEmpty
                      ? _user!.firstName.substring(0, 1)
                      : 'T',
                ),
                SizedBox(width: gap),
              ],
              OneUiIconButton(
                icon: 'user',
                semanticsLabel: _isLoggedIn ? 'Account' : 'Log in',
                variant: OneUiIconButtonVariant.ghost,
                size: 8,
                onPressed: _isLoggedIn ? () => _openAccount() : _openLogin,
              ),
            ],
          ),
          SizedBox(height: gap),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: [
                for (final label in kTiraHeaderNav) ...[
                  OneUiButton(
                    label: label,
                    variant: OneUiButtonVariant.ghost,
                    size: 6,
                    onPressed: () {},
                  ),
                  SizedBox(width: _space(context, '1')),
                ],
              ],
            ),
          ),
          SizedBox(height: gap),
          OneUiInput(
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
        ],
      ),
    );
  }

  Widget _bagButton(BuildContext context) {
    final host = OneUiIconButton(
      icon: 'bookmark',
      semanticsLabel: 'My bag',
      variant: OneUiIconButtonVariant.ghost,
      size: 8,
      onPressed: () => _go(_TiraRoute.cart),
    );
    if (_cartCount == 0) return host;
    return Stack(
      clipBehavior: Clip.none,
      children: [
        host,
        Positioned(
          top: -_space(context, '1'),
          right: -_space(context, '1'),
          child: OneUiCounterBadge(
            value: _cartCount,
            size: 'xs',
            appearance: _appearance('primary'),
            semanticsLabel: '$_cartCount items in bag',
          ),
        ),
      ],
    );
  }

  Widget _buildCategoryStrip(BuildContext context) {
    return OneUiSurface(
      mode: 'minimal',
      child: SizedBox(
        height: _space(context, '10'),
        child: ListView.separated(
          scrollDirection: Axis.horizontal,
          padding: EdgeInsets.symmetric(horizontal: _space(context, '4')),
          itemCount: kTiraCategoryNav.length,
          separatorBuilder: (_, __) => SizedBox(width: _space(context, '4')),
          itemBuilder: (context, index) {
            final label = kTiraCategoryNav[index];
            return Center(
              child: OneUiButton(
                label: label,
                variant: OneUiButtonVariant.ghost,
                size: 6,
                onPressed: () => _go(_TiraRoute.shop),
              ),
            );
          },
        ),
      ),
    );
  }

  Widget _buildCarouselSection(
    BuildContext context, {
    required String title,
    required List<DemoProduct> products,
    required VoidCallback onViewAll,
  }) {
    final gap = _space(context, '3');
    final cardW = _space(context, '40') + _space(context, '8');
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Row(
          children: [
            Expanded(
              child: OneUiText(
                text: title,
                variant: OneUiTextVariant.title,
                size: 'm',
                weight: OneUiTextWeight.high,
              ),
            ),
            OneUiButton(
              label: 'View All  >',
              variant: OneUiButtonVariant.ghost,
              size: 6,
              onPressed: onViewAll,
            ),
          ],
        ),
        SizedBox(height: gap),
        SizedBox(
          height: _space(context, '40') + _space(context, '32'),
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            itemCount: products.length,
            separatorBuilder: (_, __) => SizedBox(width: gap),
            itemBuilder: (context, index) => SizedBox(
              width: cardW,
              child: _carouselCard(context, products[index]),
            ),
          ),
        ),
      ],
    );
  }

  Widget _productImageArea(
    BuildContext context,
    DemoProduct product, {
    bool showRating = false,
  }) {
    final gap = _space(context, '2');
    final radius = _space(context, '2');
    final wished = _wishlist.contains(product.id);
    final qty = _cart[product.id] ?? 0;
    return _TiraHoverProductImage(
      product: product,
      gap: gap,
      radius: radius,
      wished: wished,
      qty: qty,
      showRating: showRating,
      accentAppearance: _appearance('primary'),
      onWishlist: () => _toggleWishlist(product.id),
      onAdd: product.inStock ? () => _setQty(product.id, 1) : null,
      onDecrease: () => _setQty(product.id, qty - 1),
      onIncrease: product.inStock ? () => _setQty(product.id, qty + 1) : null,
    );
  }

  Widget _carouselCard(BuildContext context, DemoProduct product) {
    final gap = _space(context, '2');
    final radius = _space(context, '2');
    return OneUiSurface(
      mode: 'default',
      padding: EdgeInsets.all(gap),
      borderRadius: BorderRadius.circular(radius),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Expanded(
            child: _productImageArea(context, product),
          ),
          SizedBox(height: gap),
          OneUiText(
            text: product.displayBrand,
            variant: OneUiTextVariant.label,
            size: 'xs',
            attention: OneUiTextAttention.medium,
          ),
          OneUiText(
            text: product.name,
            variant: OneUiTextVariant.body,
            size: 's',
            weight: OneUiTextWeight.high,
            maxLines: 2,
          ),
          if (product.rating != null) ...[
            SizedBox(height: _space(context, '0-5')),
            OneUiText(
              text:
                  '${product.rating} ★  |  ${product.formatReviewCount()}',
              variant: OneUiTextVariant.label,
              size: 'xs',
              attention: OneUiTextAttention.medium,
            ),
          ],
          SizedBox(height: _space(context, '0-5')),
          Wrap(
            spacing: _space(context, '1'),
            runSpacing: _space(context, '0-5'),
            crossAxisAlignment: WrapCrossAlignment.center,
            children: [
              OneUiText(
                text: product.priceLabel,
                variant: OneUiTextVariant.label,
                size: 's',
                weight: OneUiTextWeight.high,
              ),
              if (product.mrp > product.price)
                OneUiText(
                  text: product.mrpLabel,
                  variant: OneUiTextVariant.label,
                  size: 'xs',
                  attention: OneUiTextAttention.low,
                  strikethrough: true,
                ),
              if (product.discountPercent > 0)
                OneUiText(
                  text: '(${product.discountPercent}% Off)',
                  variant: OneUiTextVariant.label,
                  size: 'xs',
                  attention: OneUiTextAttention.medium,
                ),
            ],
          ),
          if (product.offerLabel != null) ...[
            SizedBox(height: _space(context, '0-5')),
            OneUiText(
              text: product.offerLabel!,
              variant: OneUiTextVariant.label,
              size: 'xs',
              attention: OneUiTextAttention.medium,
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildShop(BuildContext context) {
    final pad = _space(context, '4');
    final gap = _space(context, '3');
    final cols = OneUiScope.of(context).platformId == 'S-360' ? 2 : 3;
    return CustomScrollView(
      slivers: [
        SliverToBoxAdapter(
          child: Padding(
            padding: EdgeInsets.all(pad),
            child: Row(
              children: [
                OneUiIconButton(
                  icon: 'arrowLeft',
                  semanticsLabel: 'Back to home',
                  variant: OneUiIconButtonVariant.ghost,
                  size: 8,
                  onPressed: () => _go(_TiraRoute.home),
                ),
                Expanded(
                  child: OneUiText(
                    text: 'All products',
                    variant: OneUiTextVariant.title,
                    size: 's',
                    weight: OneUiTextWeight.high,
                  ),
                ),
                _bagButton(context),
              ],
            ),
          ),
        ),
        SliverToBoxAdapter(
          child: Padding(
            padding: EdgeInsets.fromLTRB(pad, 0, pad, gap),
            child: OneUiChipGroup(
              value: [_shopCategory],
              multiple: false,
              onValueChange: (values) => setState(
                () => _shopCategory = values.isEmpty ? 'all' : values.first,
              ),
              children: [
                OneUiChip(value: 'all', child: 'All'),
                OneUiChip(value: 'makeup', child: 'Makeup'),
                OneUiChip(value: 'skin', child: 'Skin'),
                OneUiChip(value: 'fragrance', child: 'Fragrance'),
              ],
            ),
          ),
        ),
        SliverToBoxAdapter(
          child: Padding(
            padding: EdgeInsets.fromLTRB(pad, 0, pad, gap),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                OneUiText(
                  text: 'Sort by:',
                  variant: OneUiTextVariant.label,
                  size: 's',
                  attention: OneUiTextAttention.medium,
                ),
                SizedBox(width: _space(context, '1')),
                OneUiButton(
                  label: _sortLabel,
                  variant: OneUiButtonVariant.ghost,
                  size: 6,
                  end: OneUiIcon(icon: 'chevronDown', size: '3'),
                  onPressed: _cycleSort,
                ),
              ],
            ),
          ),
        ),
        SliverPadding(
          padding: EdgeInsets.symmetric(horizontal: pad),
          sliver: SliverGrid(
            gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: cols,
              mainAxisSpacing: gap,
              crossAxisSpacing: gap,
              childAspectRatio: 0.46,
            ),
            delegate: SliverChildBuilderDelegate(
              (context, index) => _gridCard(context, _sortedProducts[index]),
              childCount: _sortedProducts.length,
            ),
          ),
        ),
        SliverToBoxAdapter(child: SizedBox(height: pad)),
      ],
    );
  }

  Widget _gridCard(BuildContext context, DemoProduct product) {
    final gap = _space(context, '2');
    final radius = _space(context, '2');
    return OneUiSurface(
      mode: 'default',
      padding: EdgeInsets.all(gap),
      borderRadius: BorderRadius.circular(radius),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Expanded(
            flex: 3,
            child: _productImageArea(context, product, showRating: true),
          ),
          SizedBox(height: gap),
          OneUiText(
            text: product.displayBrand,
            variant: OneUiTextVariant.label,
            size: 'xs',
            attention: OneUiTextAttention.medium,
          ),
          OneUiText(
            text: product.name,
            variant: OneUiTextVariant.body,
            size: 's',
            weight: OneUiTextWeight.high,
            maxLines: 2,
          ),
          SizedBox(height: _space(context, '0-5')),
          OneUiText(
            text: product.priceLabel,
            variant: OneUiTextVariant.label,
            size: 's',
            weight: OneUiTextWeight.high,
          ),
          if (product.offerLabel != null) ...[
            SizedBox(height: _space(context, '0-5')),
            OneUiBadge(
              size: 's',
              appearance: 'neutral',
              child: product.offerLabel!,
            ),
          ],
          SizedBox(height: _space(context, '1')),
          OneUiChip(
            child: product.packLabel,
            size: 's',
          ),
        ],
      ),
    );
  }

  Widget _qtyStepper(BuildContext context, DemoProduct product, int qty) {
    return OneUiSurface(
      mode: 'minimal',
      padding: EdgeInsets.symmetric(horizontal: _space(context, '0-5')),
      borderRadius: BorderRadius.circular(_space(context, '2')),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          OneUiIconButton(
            icon: 'remove',
            semanticsLabel: 'Decrease quantity',
            variant: OneUiIconButtonVariant.ghost,
            size: 6,
            onPressed: () => _setQty(product.id, qty - 1),
          ),
          Padding(
            padding: EdgeInsets.symmetric(horizontal: _space(context, '2')),
            child: OneUiText(
              text: '$qty',
              variant: OneUiTextVariant.label,
              size: 's',
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

  Widget _buildCart(BuildContext context) {
    final pad = _space(context, '4');
    final gap = _space(context, '4');
    final lines = <DemoProduct>[];
    for (final entry in _cart.entries) {
      final p = findDemoProduct(widget.config.products, entry.key);
      if (p != null) lines.add(p);
    }
    final wide = isWideCommerceLayout(OneUiScope.of(context).platformId);

    Widget mainColumn = Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        _samplesBanner(context),
        SizedBox(height: gap),
        OneUiText(
          text: 'My Bag (${_cartCount} items)',
          variant: OneUiTextVariant.title,
          size: 'm',
          weight: OneUiTextWeight.high,
        ),
        SizedBox(height: gap),
        if (lines.isEmpty)
          OneUiText(
            text: 'Your bag is empty — browse products to add items.',
            variant: OneUiTextVariant.body,
            size: 's',
            attention: OneUiTextAttention.medium,
          )
        else
          for (final product in lines) ...[
            _cartLine(context, product, _cart[product.id] ?? 0),
            OneUiDivider(),
          ],
      ],
    );

    final summary = _billingSummary(context);

    return ListView(
      padding: EdgeInsets.all(pad),
      children: [
        Row(
          children: [
            OneUiIconButton(
              icon: 'arrowLeft',
              semanticsLabel: 'Back',
              variant: OneUiIconButtonVariant.ghost,
              size: 8,
              onPressed: () => _go(_TiraRoute.home),
            ),
            Expanded(
              child: OneUiBrandLogo(
                size: OneUiLogoSize.s,
                alt: widget.config.logoAlt,
              ),
            ),
            _bagButton(context),
          ],
        ),
        SizedBox(height: gap),
        if (wide)
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(flex: 2, child: mainColumn),
              SizedBox(width: gap),
              Expanded(child: summary),
            ],
          )
        else ...[
          mainColumn,
          SizedBox(height: gap),
          summary,
        ],
      ],
    );
  }

  Widget _samplesBanner(BuildContext context) {
    return OneUiSurface(
      mode: 'subtle',
      padding: EdgeInsets.all(_space(context, '3')),
      borderRadius: BorderRadius.circular(_space(context, '2')),
      child: Row(
        children: [
          OneUiIcon(icon: 'edit', size: '4'),
          SizedBox(width: _space(context, '2')),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                OneUiText(
                  text: 'Pick your free samples',
                  variant: OneUiTextVariant.label,
                  size: 's',
                  weight: OneUiTextWeight.high,
                ),
                OneUiText(
                  text: _isLoggedIn
                      ? 'Pick your free samples now (0/5)'
                      : 'Log in to explore free samples.',
                  variant: OneUiTextVariant.label,
                  size: 'xs',
                  attention: OneUiTextAttention.medium,
                ),
              ],
            ),
          ),
          if (_isLoggedIn)
            OneUiButton(
              label: '+4  >',
              variant: OneUiButtonVariant.ghost,
              size: 6,
              onPressed: () {},
            )
          else
            OneUiButton(
              label: '+4  >',
              variant: OneUiButtonVariant.ghost,
              size: 6,
              onPressed: _openLogin,
            ),
        ],
      ),
    );
  }

  Widget _cartLine(BuildContext context, DemoProduct product, int qty) {
    final gap = _space(context, '3');
    final isMobile = OneUiScope.of(context).platformId == 'S-360';
    final imageSide =
        isMobile ? _space(context, '12') : _space(context, '16');
    return Padding(
      padding: EdgeInsets.symmetric(vertical: gap),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: imageSide,
            height: imageSide,
            child: ClipRRect(
              borderRadius: BorderRadius.circular(_space(context, '1')),
              child: DemoProductImage(
                productId: product.id,
                alt: product.name,
              ),
            ),
          ),
          SizedBox(width: gap),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                OneUiText(
                  text: product.name,
                  variant: OneUiTextVariant.body,
                  size: 's',
                  weight: OneUiTextWeight.high,
                  maxLines: 2,
                ),
                OneUiText(
                  text: product.packLabel,
                  variant: OneUiTextVariant.label,
                  size: 'xs',
                  attention: OneUiTextAttention.medium,
                ),
                SizedBox(height: _space(context, '1')),
                Wrap(
                  spacing: _space(context, '1'),
                  runSpacing: _space(context, '0-5'),
                  crossAxisAlignment: WrapCrossAlignment.center,
                  children: [
                    OneUiText(
                      text: product.priceLabel,
                      variant: OneUiTextVariant.label,
                      size: 's',
                      weight: OneUiTextWeight.high,
                    ),
                    if (product.mrp > product.price) ...[
                      OneUiText(
                        text: product.mrpLabel,
                        variant: OneUiTextVariant.label,
                        size: 'xs',
                        attention: OneUiTextAttention.low,
                        strikethrough: true,
                      ),
                      OneUiText(
                        text: '(${product.discountPercent}% OFF)',
                        variant: OneUiTextVariant.label,
                        size: 'xs',
                        appearance: _appearance('positive'),
                      ),
                    ],
                  ],
                ),
                if (isMobile) ...[
                  SizedBox(height: _space(context, '2')),
                  Align(
                    alignment: AlignmentDirectional.centerStart,
                    child: _qtyStepper(context, product, qty),
                  ),
                ],
              ],
            ),
          ),
          if (!isMobile) _qtyStepper(context, product, qty),
        ],
      ),
    );
  }

  Widget _billingSummary(BuildContext context) {
    final gap = _space(context, '3');
    final totalDiscount = _discount + _couponDiscount;
  return OneUiSurface(
      mode: 'minimal',
      padding: EdgeInsets.all(gap),
      borderRadius: BorderRadius.circular(_space(context, '2')),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              Expanded(
                child: OneUiText(
                  text: 'Coupons & Offers',
                  variant: OneUiTextVariant.title,
                  size: 's',
                  weight: OneUiTextWeight.high,
                ),
              ),
              if (_isLoggedIn)
                OneUiIcon(icon: 'arrowRight', size: '4'),
            ],
          ),
          if (!_isLoggedIn)
            OneUiText(
              text: 'Login to Apply Coupons & Offers',
              variant: OneUiTextVariant.label,
              size: 'xs',
              attention: OneUiTextAttention.medium,
            )
          else if (!_couponApplied) ...[
            SizedBox(height: _space(context, '2')),
            OneUiSurface(
              mode: 'subtle',
              padding: EdgeInsets.all(_space(context, '2')),
              borderRadius: BorderRadius.circular(_space(context, '1')),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        OneUiText(
                          text: 'Save ₹865 with TIRATUE',
                          variant: OneUiTextVariant.label,
                          size: 's',
                          weight: OneUiTextWeight.high,
                        ),
                        OneUiText(
                          text: 'You are saving 33% with this coupon',
                          variant: OneUiTextVariant.label,
                          size: 'xs',
                          attention: OneUiTextAttention.medium,
                        ),
                      ],
                    ),
                  ),
                  SizedBox(width: _space(context, '2')),
                  OneUiButton(
                    label: 'Apply',
                    variant: OneUiButtonVariant.bold,
                    appearance: _appearance('neutral'),
                    size: 6,
                    onPressed: () => setState(() => _couponApplied = true),
                  ),
                ],
              ),
            ),
          ] else
            OneUiText(
              text: 'TIRATUE coupon applied',
              variant: OneUiTextVariant.label,
              size: 'xs',
              appearance: _appearance('positive'),
            ),
          if (_isLoggedIn) ...[
            SizedBox(height: gap),
            if (_showPincodeField)
              OneUiInputField(
                label: 'Delivery pincode',
                placeholder: '400001',
                value: _pincode,
                onChanged: (v) => setState(() {
                  _pincode = v;
                  if (v.length == 6) _showPincodeField = false;
                }),
                fullWidth: true,
                type: 'number',
                maxLength: 6,
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
          SizedBox(height: gap),
          OneUiText(
            text: 'Billing Details',
            variant: OneUiTextVariant.title,
            size: 's',
            weight: OneUiTextWeight.high,
          ),
          SizedBox(height: _space(context, '2')),
          _billingRow(
            context,
            'Bag Total (Incl. of all Taxes)',
            '₹ ${formatInr(_mrpTotal)}',
          ),
          _billingRow(
            context,
            'Discount',
            '- ₹ ${formatInr(totalDiscount)}',
            valueAppearance: _appearance('positive'),
          ),
          _billingRow(
            context,
            'Total',
            '₹ ${formatInr(_payable)}',
            bold: true,
          ),
          if (totalDiscount > 0) ...[
            SizedBox(height: gap),
            OneUiSurface(
              mode: 'subtle',
              padding: EdgeInsets.all(_space(context, '2')),
              borderRadius: BorderRadius.circular(_space(context, '1')),
              child: OneUiText(
                text:
                    'You save ₹${formatInr(totalDiscount)}.00 with this order!',
                variant: OneUiTextVariant.label,
                size: 's',
                appearance: _appearance('positive'),
                weight: OneUiTextWeight.high,
              ),
            ),
          ],
          SizedBox(height: gap),
          OneUiButton(
            label: _isLoggedIn ? 'Checkout' : 'Login to continue',
            variant: OneUiButtonVariant.bold,
            appearance: _appearance('neutral'),
            size: 10,
            fullWidth: true,
            disabled: _isLoggedIn && _cartCount == 0,
            onPressed: _isLoggedIn ? _openCheckout : _openLogin,
          ),
        ],
      ),
    );
  }

  Widget _billingRow(
    BuildContext context,
    String label,
    String value, {
    bool bold = false,
    String? valueAppearance,
  }) {
    return Padding(
      padding: EdgeInsets.only(bottom: _space(context, '1')),
      child: Row(
        children: [
          Expanded(
            child: OneUiText(
              text: label,
              variant: OneUiTextVariant.label,
              size: 's',
              weight: bold ? OneUiTextWeight.high : OneUiTextWeight.low,
            ),
          ),
          OneUiText(
            text: value,
            variant: OneUiTextVariant.label,
            size: 's',
            weight: bold ? OneUiTextWeight.high : OneUiTextWeight.low,
            appearance: valueAppearance ?? 'auto',
          ),
        ],
      ),
    );
  }

  Widget _buildAccount(BuildContext context) {
    final user = _user;
    if (user == null) {
      return Center(
        child: OneUiButton(
          label: 'Log in to view account',
          variant: OneUiButtonVariant.bold,
          appearance: _appearance('primary'),
          size: 8,
          onPressed: _openLogin,
        ),
      );
    }
    return DemoTiraAccountScreen(
      user: user,
      gender: _gender,
      section: _accountSection,
      accentAppearance: _appearance('primary'),
      onSectionChanged: (section) => setState(() => _accountSection = section),
      onGenderChanged: (value) => setState(() => _gender = value),
      onBack: () => _go(_TiraRoute.home),
    );
  }

  Widget _buildCheckout(BuildContext context) {
    final user = _user;
    if (user == null || _cartLines.isEmpty) {
      return Center(
        child: OneUiButton(
          label: 'Back to bag',
          variant: OneUiButtonVariant.bold,
          appearance: _appearance('primary'),
          size: 8,
          onPressed: () => _go(_TiraRoute.cart),
        ),
      );
    }
    return DemoTiraCheckoutScreen(
      user: user,
      lines: _cartLines,
      mrpTotal: _mrpTotal,
      lineDiscount: _discount,
      couponDiscount: _couponDiscount,
      payable: _payable,
      couponApplied: _couponApplied,
      accentAppearance: _appearance('neutral'),
      onBack: () => _go(_TiraRoute.cart),
      onConfirmPay: _confirmPay,
      onChangeAddress: () => _openAccount(section: 'addresses'),
    );
  }

  Widget _buildOrderSuccess(BuildContext context) {
    return DemoTiraOrderPlacedScreen(
      orderId: _orderId ?? 'TIRA000000',
      accentAppearance: _appearance('neutral'),
      onContinueShopping: _finishOrder,
    );
  }

  Widget _authModalShell({
    required BuildContext context,
    required VoidCallback onClose,
    required Widget header,
    required Widget body,
  }) {
    final radius = _space(context, '2');
    final modalW = _authModalWidth(context);
    return LayoutBuilder(
      builder: (context, constraints) {
        return SingleChildScrollView(
          padding: EdgeInsets.symmetric(
            horizontal: _space(context, '4'),
            vertical: _space(context, '6'),
          ),
          child: ConstrainedBox(
            constraints: BoxConstraints(
              minHeight: constraints.maxHeight - _space(context, '12'),
            ),
            child: Center(
              child: SizedBox(
                width: modalW,
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(radius),
                  child: OneUiSurface(
                    mode: 'default',
                    child: Stack(
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            header,
                            OneUiSurface(
                              mode: 'default',
                              child: body,
                            ),
                          ],
                        ),
                        Positioned(
                          top: _space(context, '2'),
                          right: _space(context, '2'),
                          child: OneUiIconButton(
                            icon: 'close',
                            semanticsLabel: 'Close',
                            variant: OneUiIconButtonVariant.ghost,
                            size: 8,
                            onPressed: onClose,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _authHeader(BuildContext context, {required String tagline}) {
    return OneUiSurface(
      mode: 'subtle',
      padding: EdgeInsets.fromLTRB(
        _space(context, '4'),
        _space(context, '8'),
        _space(context, '4'),
        _space(context, '6'),
      ),
      child: Column(
        children: [
          OneUiBrandLogo(
            size: OneUiLogoSize.l,
            alt: widget.config.logoAlt,
          ),
          SizedBox(height: _space(context, '3')),
          OneUiText(
            text: tagline,
            variant: OneUiTextVariant.body,
            size: 's',
            weight: OneUiTextWeight.high,
            textAlign: OneUiTextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildLogin(BuildContext context) {
    final canSend = _termsAccepted && _phoneValid;
    return _authModalShell(
      context: context,
      onClose: () => _go(_TiraRoute.home),
      header: _authHeader(
        context,
        tagline: 'Personalised beauty recommendations',
      ),
      body: Padding(
        padding: EdgeInsets.fromLTRB(
          _space(context, '4'),
          _space(context, '2'),
          _space(context, '4'),
          _space(context, '4'),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            OneUiText(
              text: 'Log In Or Sign Up',
              variant: OneUiTextVariant.title,
              size: 'm',
              weight: OneUiTextWeight.high,
            ),
            SizedBox(height: _space(context, '4')),
            OneUiInputField(
              fullWidth: true,
              placeholder: 'Enter Phone Number',
              value: _phone,
              maxLength: 10,
              onChanged: (v) => setState(() {
                _phone = sanitiseTiraPhone(v);
                _phoneError = null;
              }),
              type: 'tel',
              start2: OneUiText(
                text: '+91  |',
                variant: OneUiTextVariant.label,
                size: 's',
                weight: OneUiTextWeight.high,
              ),
              size: 10,
            ),
            if (_phoneError != null) ...[
              SizedBox(height: _space(context, '2')),
              OneUiInputFeedback(
                variant: OneUiInputFeedbackVariant.negative,
                attention: OneUiInputFeedbackAttention.low,
                feedbackMessage: _phoneError,
              ),
            ],
            SizedBox(height: _space(context, '3')),
            OneUiCheckboxField(
              label:
                  "By continuing, you agree to Tira's Terms of Use and Privacy Policy.",
              checked: _termsAccepted,
              onCheckedChange: (v) => setState(() => _termsAccepted = v),
              size: 's',
            ),
            SizedBox(height: _space(context, '4')),
            OneUiButton(
              label: 'Send OTP',
              variant: OneUiButtonVariant.bold,
              appearance: _appearance('primary'),
              size: 10,
              fullWidth: true,
              disabled: !canSend,
              onPressed: canSend ? _sendOtp : null,
            ),
          ],
        ),
      ),
    );
  }

  Widget _otpSlot(BuildContext context, int index) {
    return OneUiInputField(
      value: _otpDigits[index],
      maxLength: 1,
      type: 'tel',
      onChanged: (v) => _onOtpDigit(index, v),
      size: 10,
    );
  }

  Widget _buildOtp(BuildContext context) {
    final gap = _space(context, '3');
    return _authModalShell(
      context: context,
      onClose: () => _go(_TiraRoute.home),
      header: _authHeader(
        context,
        tagline: 'Free shipping on every order, T&C apply',
      ),
      body: Padding(
        padding: EdgeInsets.fromLTRB(
          _space(context, '4'),
          _space(context, '2'),
          _space(context, '4'),
          _space(context, '4'),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            OneUiText(
              text: 'OTP verification',
              variant: OneUiTextVariant.title,
              size: 'm',
              weight: OneUiTextWeight.high,
            ),
            SizedBox(height: gap),
            Wrap(
              crossAxisAlignment: WrapCrossAlignment.center,
              spacing: _space(context, '1'),
              runSpacing: _space(context, '1'),
              children: [
                OneUiText(
                  text: "We've sent a verification code on",
                  variant: OneUiTextVariant.label,
                  size: 's',
                  attention: OneUiTextAttention.medium,
                ),
                OneUiText(
                  text: _phone,
                  variant: OneUiTextVariant.label,
                  size: 's',
                  weight: OneUiTextWeight.high,
                ),
                OneUiIconButton(
                  icon: 'edit',
                  semanticsLabel: 'Edit phone number',
                  variant: OneUiIconButtonVariant.ghost,
                  size: 6,
                  onPressed: () => _go(_TiraRoute.login),
                ),
              ],
            ),
            SizedBox(height: gap),
            Row(
              children: [
                for (var i = 0; i < 4; i++) ...[
                  if (i > 0) SizedBox(width: _space(context, '2')),
                  Expanded(child: _otpSlot(context, i)),
                ],
              ],
            ),
            if (_otpError != null) ...[
              SizedBox(height: _space(context, '2')),
              OneUiInputFeedback(
                variant: OneUiInputFeedbackVariant.negative,
                attention: OneUiInputFeedbackAttention.low,
                feedbackMessage: _otpError,
              ),
            ],
            SizedBox(height: _space(context, '2')),
            Align(
              alignment: AlignmentDirectional.centerEnd,
              child: OneUiText(
                text: 'Resend OTP in 20 seconds',
                variant: OneUiTextVariant.label,
                size: 'xs',
                attention: OneUiTextAttention.low,
              ),
            ),
            SizedBox(height: gap),
            OneUiButton(
              label: 'Verify OTP',
              variant: OneUiButtonVariant.bold,
              appearance: _appearance('neutral'),
              size: 10,
              fullWidth: true,
              disabled: !_otpValid,
              onPressed: _otpValid ? _verifyOtp : null,
            ),
            SizedBox(height: _space(context, '2')),
            Center(
              child: OneUiText(
                text: 'Demo OTP: $kTiraStaticOtp',
                variant: OneUiTextVariant.label,
                size: 'xs',
                attention: OneUiTextAttention.medium,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// Product image with hover-reveal Add to cart — matches [tirabeauty.com](https://www.tirabeauty.com/).
class _TiraHoverProductImage extends StatefulWidget {
  const _TiraHoverProductImage({
    required this.product,
    required this.gap,
    required this.radius,
    required this.wished,
    required this.qty,
    required this.showRating,
    required this.accentAppearance,
    required this.onWishlist,
    required this.onAdd,
    required this.onDecrease,
    required this.onIncrease,
  });

  final DemoProduct product;
  final double gap;
  final double radius;
  final bool wished;
  final int qty;
  final bool showRating;
  final String accentAppearance;
  final VoidCallback onWishlist;
  final VoidCallback? onAdd;
  final VoidCallback onDecrease;
  final VoidCallback? onIncrease;

  @override
  State<_TiraHoverProductImage> createState() => _TiraHoverProductImageState();
}

class _TiraHoverProductImageState extends State<_TiraHoverProductImage> {
  bool _hovering = false;

  @override
  Widget build(BuildContext context) {
    final isMobile = OneUiScope.of(context).platformId == 'S-360';
    final showAction = widget.qty > 0 || _hovering || isMobile;
    final padXs = getSpacingTokenPx(
      spacingName: '0-5',
      platform: OneUiScope.of(context).platformId,
      density: OneUiScope.of(context).density,
      platformsConfig: OneUiScope.of(context).platformsFoundationConfig,
    );
    return GestureDetector(
      onTap: isMobile && widget.qty == 0
          ? () => setState(() => _hovering = !_hovering)
          : null,
      child: MouseRegion(
      onEnter: (_) => setState(() => _hovering = true),
      onExit: (_) => setState(() => _hovering = false),
      child: Stack(
        fit: StackFit.expand,
        children: [
          ClipRRect(
            borderRadius: BorderRadius.circular(widget.radius),
            child: DemoProductImage(
              productId: widget.product.id,
              alt: widget.product.name,
            ),
          ),
          if (widget.product.badgeLabel != null)
            Positioned(
              top: widget.gap,
              left: widget.gap,
              child: OneUiBadge(
                size: 's',
                appearance: 'neutral',
                child: widget.product.badgeLabel!,
              ),
            ),
          Positioned(
            top: 0,
            right: 0,
            child: OneUiIconButton(
              icon: widget.wished ? 'heartFilled' : 'heart',
              semanticsLabel: widget.wished
                  ? 'Remove from wishlist'
                  : 'Add to wishlist',
              variant: OneUiIconButtonVariant.ghost,
              size: 6,
              onPressed: widget.onWishlist,
            ),
          ),
          if (widget.showRating && widget.product.rating != null)
            Positioned(
              bottom: widget.gap,
              right: widget.gap,
              child: OneUiSurface(
                mode: 'elevated',
                padding: EdgeInsets.symmetric(
                  horizontal: padXs,
                  vertical: padXs,
                ),
                borderRadius: BorderRadius.circular(padXs),
                child: OneUiText(
                  text:
                      '${widget.product.rating} ★  |  ${widget.product.formatReviewCount()}',
                  variant: OneUiTextVariant.label,
                  size: 'xs',
                  attention: OneUiTextAttention.medium,
                ),
              ),
            ),
          if (showAction)
            Positioned(
              left: widget.gap,
              right: widget.gap,
              bottom: widget.gap,
              child: widget.qty > 0
                  ? OneUiSurface(
                      mode: 'elevated',
                      padding: EdgeInsets.symmetric(
                        horizontal: padXs,
                      ),
                      borderRadius:
                          BorderRadius.circular(widget.gap),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          OneUiIconButton(
                            icon: 'remove',
                            semanticsLabel: 'Decrease quantity',
                            variant: OneUiIconButtonVariant.ghost,
                            size: 6,
                            onPressed: widget.onDecrease,
                          ),
                          Padding(
                            padding: EdgeInsets.symmetric(
                              horizontal: widget.gap,
                            ),
                            child: OneUiText(
                              text: '${widget.qty}',
                              variant: OneUiTextVariant.label,
                              size: 's',
                              weight: OneUiTextWeight.high,
                            ),
                          ),
                          OneUiIconButton(
                            icon: 'add',
                            semanticsLabel: 'Increase quantity',
                            variant: OneUiIconButtonVariant.ghost,
                            size: 6,
                            onPressed: widget.onIncrease,
                          ),
                        ],
                      ),
                    )
                  : OneUiButton(
                      label: 'Add to cart',
                      variant: OneUiButtonVariant.bold,
                      appearance: widget.accentAppearance,
                      size: 8,
                      fullWidth: true,
                      disabled: widget.onAdd == null,
                      onPressed: widget.onAdd,
                    ),
            ),
        ],
      ),
    ),
    );
  }
}
