import 'package:flutter/material.dart';
import 'package:ui_flutter/ui_flutter.dart';

import 'demo_product_catalog.dart';
import 'demo_product_image.dart';
import 'demo_responsive.dart';
import 'demo_tira_auth.dart';

double _space(BuildContext context, String token) {
  final scope = OneUiScope.of(context);
  return getSpacingTokenPx(
    spacingName: token,
    platform: scope.platformId,
    density: scope.density,
    platformsConfig: scope.platformsFoundationConfig,
  );
}

/// Checkout — Delivering To, estimated delivery, billing, Confirm & Pay.
class DemoTiraCheckoutScreen extends StatefulWidget {
  const DemoTiraCheckoutScreen({
    required this.user,
    required this.lines,
    required this.mrpTotal,
    required this.lineDiscount,
    required this.couponDiscount,
    required this.payable,
    required this.couponApplied,
    required this.accentAppearance,
    required this.onBack,
    required this.onConfirmPay,
    required this.onChangeAddress,
    super.key,
  });

  final TiraDemoUser user;
  final List<({DemoProduct product, int qty})> lines;
  final int mrpTotal;
  final int lineDiscount;
  final int couponDiscount;
  final int payable;
  final bool couponApplied;
  final String accentAppearance;
  final VoidCallback onBack;
  final VoidCallback onConfirmPay;
  final VoidCallback onChangeAddress;

  @override
  State<DemoTiraCheckoutScreen> createState() => _DemoTiraCheckoutScreenState();
}

class _DemoTiraCheckoutScreenState extends State<DemoTiraCheckoutScreen> {
  String _payment = 'upi';
  bool _giftWrap = false;
  bool _placing = false;
  String? _payError;

  int get _itemCount =>
      widget.lines.fold<int>(0, (sum, line) => sum + line.qty);

  int get _totalSavings => widget.lineDiscount + widget.couponDiscount;

  String get _deliveryEta {
    final eta = DateTime.now().add(const Duration(days: 4));
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    return 'By ${days[eta.weekday - 1]}, ${eta.day} ${months[eta.month - 1]}';
  }

  String get _paymentLabel => switch (_payment) {
        'cod' => 'Cash on Delivery',
        'card' => 'Credit / Debit card',
        _ => 'UPI',
      };

  Future<void> _handleConfirmPay() async {
    if (_payment.isEmpty) {
      setState(() => _payError = 'Select a payment method');
      return;
    }
    setState(() {
      _placing = true;
      _payError = null;
    });
    await Future<void>.delayed(const Duration(milliseconds: 1200));
    if (!mounted) return;
    widget.onConfirmPay();
  }

  @override
  Widget build(BuildContext context) {
    final pad = _space(context, '4');
    final gap = _space(context, '4');
    final wide = isWideCommerceLayout(OneUiScope.of(context).platformId);

    return ListView(
      padding: EdgeInsets.all(pad),
      children: [
        Row(
          children: [
            OneUiIconButton(
              icon: 'arrowLeft',
              semanticsLabel: 'Back to bag',
              variant: OneUiIconButtonVariant.ghost,
              size: 8,
              onPressed: widget.onBack,
            ),
            Expanded(
              child: Center(
                child: OneUiBrandLogo(
                  size: OneUiLogoSize.s,
                  alt: 'Tira',
                ),
              ),
            ),
            SizedBox(width: _space(context, '8')),
          ],
        ),
        SizedBox(height: gap),
        if (wide)
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(flex: 3, child: _mainColumn(context)),
              SizedBox(width: gap),
              Expanded(flex: 2, child: _summaryColumn(context)),
            ],
          )
        else ...[
          _mainColumn(context),
          SizedBox(height: gap),
          _summaryColumn(context),
        ],
      ],
    );
  }

  Widget _mainColumn(BuildContext context) {
    final gap = _space(context, '3');
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        _addressCard(context),
        SizedBox(height: gap),
        _deliveryCard(context),
      ],
    );
  }

  Widget _addressCard(BuildContext context) {
    final gap = _space(context, '3');
    return OneUiSurface(
      mode: 'minimal',
      padding: EdgeInsets.all(gap),
      borderRadius: BorderRadius.circular(_space(context, '2')),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Row(
                  children: [
                    Flexible(
                      child: OneUiText(
                        text: 'Delivering To ${widget.user.fullName}',
                        variant: OneUiTextVariant.label,
                        size: 's',
                        weight: OneUiTextWeight.high,
                        maxLines: 1,
                      ),
                    ),
                    SizedBox(width: _space(context, '1')),
                    OneUiBadge(
                      size: 's',
                      appearance: 'neutral',
                      child: 'HOME',
                    ),
                  ],
                ),
              ),
              SizedBox(width: _space(context, '1')),
              OneUiButton(
                label: 'Change >',
                variant: OneUiButtonVariant.ghost,
                size: 6,
                onPressed: widget.onChangeAddress,
              ),
            ],
          ),
          SizedBox(height: gap),
          OneUiText(
            text: widget.user.fullName,
            variant: OneUiTextVariant.body,
            size: 's',
            weight: OneUiTextWeight.high,
          ),
          OneUiText(
            text: widget.user.deliveryAddressBlock,
            variant: OneUiTextVariant.body,
            size: 's',
            attention: OneUiTextAttention.medium,
          ),
          OneUiText(
            text: 'Mobile - ${formatTiraPhoneDisplay(widget.user.phone)}',
            variant: OneUiTextVariant.label,
            size: 's',
            attention: OneUiTextAttention.medium,
          ),
        ],
      ),
    );
  }

  Widget _deliveryCard(BuildContext context) {
    final gap = _space(context, '3');
    final thumb = _space(context, '14');
    return OneUiSurface(
      mode: 'minimal',
      padding: EdgeInsets.all(gap),
      borderRadius: BorderRadius.circular(_space(context, '2')),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          OneUiText(
            text: 'Estimated Delivery',
            variant: OneUiTextVariant.title,
            size: 'm',
            weight: OneUiTextWeight.high,
          ),
          SizedBox(height: gap),
          Row(
            children: [
              Expanded(
                child: OneUiText(
                  text: _deliveryEta,
                  variant: OneUiTextVariant.label,
                  size: 's',
                  weight: OneUiTextWeight.high,
                ),
              ),
              OneUiText(
                text: '$_itemCount items',
                variant: OneUiTextVariant.label,
                size: 's',
                attention: OneUiTextAttention.medium,
              ),
            ],
          ),
          SizedBox(height: gap),
          SizedBox(
            height: thumb,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: widget.lines.length,
              separatorBuilder: (_, __) => SizedBox(width: _space(context, '2')),
              itemBuilder: (context, index) {
                final line = widget.lines[index];
                return SizedBox(
                  width: thumb,
                  height: thumb,
                  child: ClipRRect(
                    borderRadius:
                        BorderRadius.circular(_space(context, '1')),
                    child: DemoProductImage(
                      productId: line.product.id,
                      alt: line.product.name,
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _summaryColumn(BuildContext context) {
    final gap = _space(context, '3');
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
                  text: 'Payment Method',
                  variant: OneUiTextVariant.title,
                  size: 's',
                  weight: OneUiTextWeight.high,
                  maxLines: 1,
                ),
              ),
              SizedBox(width: _space(context, '2')),
              Flexible(
                child: OneUiText(
                  text: _paymentLabel,
                  variant: OneUiTextVariant.label,
                  size: 'xs',
                  attention: OneUiTextAttention.medium,
                  maxLines: 1,
                ),
              ),
            ],
          ),
          SizedBox(height: _space(context, '2')),
          OneUiRadioField(
            label: 'Select payment',
            fullWidth: true,
            defaultValue: _payment,
            onValueChange: (value) => setState(() {
              _payment = value;
              _payError = null;
            }),
            children: [
              OneUiRadio(label: 'UPI', value: 'upi'),
              OneUiRadio(label: 'Cash on delivery', value: 'cod'),
              OneUiRadio(label: 'Credit / Debit card', value: 'card'),
            ],
          ),
          SizedBox(height: gap),
          OneUiCheckbox(
            label: 'Gift wrap this order',
            checked: _giftWrap,
            onCheckedChange: (value) => setState(() => _giftWrap = value),
            appearance: widget.accentAppearance,
            size: 'm',
          ),
          SizedBox(height: gap),
          OneUiDivider(),
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
            '₹ ${formatInr(widget.mrpTotal)}',
          ),
          if (widget.lineDiscount > 0)
            _billingRow(
              context,
              'Discount',
              '- ₹ ${formatInr(widget.lineDiscount)}',
              valueAppearance: 'positive',
            ),
          if (widget.couponApplied && widget.couponDiscount > 0)
            _billingRow(
              context,
              'Coupon',
              '- ₹ ${formatInr(widget.couponDiscount)}',
              valueAppearance: 'positive',
            ),
          _billingRow(
            context,
            'Total',
            '₹ ${formatInr(widget.payable)}',
            bold: true,
          ),
          if (_totalSavings > 0) ...[
            SizedBox(height: gap),
            OneUiSurface(
              mode: 'subtle',
              padding: EdgeInsets.all(_space(context, '2')),
              borderRadius: BorderRadius.circular(_space(context, '1')),
              child: OneUiText(
                text:
                    'Woohoo! You save ₹${formatInr(_totalSavings)} on this order.',
                variant: OneUiTextVariant.label,
                size: 's',
                appearance: 'positive',
                weight: OneUiTextWeight.high,
              ),
            ),
          ],
          if (_placing)
            Center(
              child: OneUiCircularProgressIndicator(
                variant: 'indeterminate',
                size: 'M',
                appearance: widget.accentAppearance,
                animate: true,
                semanticsLabel: 'Processing payment',
              ),
            ),
          if (_payError != null) ...[
            SizedBox(height: _space(context, '2')),
            OneUiInputFeedback(
              variant: OneUiInputFeedbackVariant.negative,
              attention: OneUiInputFeedbackAttention.low,
              feedbackMessage: _payError,
            ),
          ],
          SizedBox(height: gap),
          OneUiButton(
            label: 'Confirm & Pay',
            variant: OneUiButtonVariant.bold,
            appearance: widget.accentAppearance,
            size: 10,
            fullWidth: true,
            loading: _placing,
            onPressed: _placing ? null : _handleConfirmPay,
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
              maxLines: 2,
            ),
          ),
          SizedBox(width: _space(context, '2')),
          OneUiText(
            text: value,
            variant: OneUiTextVariant.label,
            size: 's',
            weight: bold ? OneUiTextWeight.high : OneUiTextWeight.low,
            appearance: valueAppearance ?? 'auto',
            maxLines: 1,
          ),
        ],
      ),
    );
  }
}

/// Order placed confirmation after checkout.
class DemoTiraOrderPlacedScreen extends StatelessWidget {
  const DemoTiraOrderPlacedScreen({
    required this.orderId,
    required this.accentAppearance,
    required this.onContinueShopping,
    super.key,
  });

  final String orderId;
  final String accentAppearance;
  final VoidCallback onContinueShopping;

  @override
  Widget build(BuildContext context) {
    final pad = _space(context, '6');
    return Center(
      child: Padding(
        padding: EdgeInsets.all(pad),
        child: OneUiSurface(
          mode: 'minimal',
          padding: EdgeInsets.all(_space(context, '6')),
          borderRadius: BorderRadius.circular(_space(context, '2')),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              OneUiIconContained(
                icon: 'check',
                size: 'l',
                appearance: 'positive',
                semanticsLabel: 'Order confirmed',
              ),
              SizedBox(height: _space(context, '4')),
              OneUiText(
                text: 'Order placed!',
                variant: OneUiTextVariant.title,
                size: 'm',
                weight: OneUiTextWeight.high,
              ),
              SizedBox(height: _space(context, '2')),
              OneUiText(
                text: 'Order ID: $orderId',
                variant: OneUiTextVariant.body,
                size: 's',
                attention: OneUiTextAttention.medium,
              ),
              SizedBox(height: _space(context, '4')),
              OneUiButton(
                label: 'Continue shopping',
                variant: OneUiButtonVariant.bold,
                appearance: accentAppearance,
                size: 10,
                fullWidth: true,
                onPressed: onContinueShopping,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
