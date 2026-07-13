import 'package:flutter/material.dart';
import 'package:ui_flutter/ui_flutter.dart';

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

/// Account hub — Personal Details layout inspired by tirabeauty.com profile.
class DemoTiraAccountScreen extends StatelessWidget {
  const DemoTiraAccountScreen({
    required this.user,
    required this.gender,
    required this.section,
    required this.accentAppearance,
    required this.onSectionChanged,
    required this.onGenderChanged,
    required this.onBack,
    super.key,
  });

  final TiraDemoUser user;
  final String gender;
  final String section;
  final String accentAppearance;
  final ValueChanged<String> onSectionChanged;
  final ValueChanged<String> onGenderChanged;
  final VoidCallback onBack;

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
              semanticsLabel: 'Back to home',
              variant: OneUiIconButtonVariant.ghost,
              size: 8,
              onPressed: onBack,
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
        OneUiText(
          text: 'Hi, ${user.firstName} | Treats | ${user.treatsPoints} points',
          variant: OneUiTextVariant.label,
          size: 's',
          weight: OneUiTextWeight.high,
        ),
        SizedBox(height: gap),
        if (wide)
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(flex: 2, child: _sidebar(context)),
              SizedBox(width: gap),
              Expanded(flex: 3, child: _panel(context)),
            ],
          )
        else ...[
          _sidebar(context),
          SizedBox(height: gap),
          _panel(context),
        ],
      ],
    );
  }

  Widget _sidebar(BuildContext context) {
    final gap = _space(context, '2');
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        _navItem(
          context,
          id: 'personal',
          title: 'Personal Details',
          subtitle: 'Contact Details',
          icon: 'user',
        ),
        SizedBox(height: gap),
        _navItem(
          context,
          id: 'treats',
          title: 'tiraTreats',
          subtitle: 'You are a Fan',
          icon: 'starFilled',
        ),
        SizedBox(height: gap),
        _navItem(
          context,
          id: 'orders',
          title: 'Orders',
          subtitle: 'Check online & in store orders',
          icon: 'calendar',
        ),
        SizedBox(height: gap),
        _navItem(
          context,
          id: 'addresses',
          title: 'Addresses',
          subtitle: 'Manage delivery addresses',
          icon: 'location',
        ),
      ],
    );
  }

  Widget _navItem(
    BuildContext context, {
    required String id,
    required String title,
    required String subtitle,
    required String icon,
  }) {
    final gap = _space(context, '2');
    final selected = section == id;
    return OneUiSurface(
      mode: selected ? 'minimal' : 'ghost',
      padding: EdgeInsets.all(gap),
      borderRadius: BorderRadius.circular(_space(context, '2')),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              OneUiIconContained(
                icon: icon,
                size: 's',
                semanticsLabel: title,
              ),
              SizedBox(width: gap),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    OneUiText(
                      text: title,
                      variant: OneUiTextVariant.label,
                      size: 's',
                      weight: OneUiTextWeight.high,
                    ),
                    OneUiText(
                      text: subtitle,
                      variant: OneUiTextVariant.label,
                      size: 'xs',
                      attention: OneUiTextAttention.medium,
                    ),
                  ],
                ),
              ),
            ],
          ),
          SizedBox(height: gap),
          OneUiButton(
            label: selected ? 'Viewing' : 'Open',
            variant: selected
                ? OneUiButtonVariant.subtle
                : OneUiButtonVariant.ghost,
            appearance: accentAppearance,
            size: 6,
            fullWidth: true,
            onPressed: () => onSectionChanged(id),
          ),
        ],
      ),
    );
  }

  Widget _panel(BuildContext context) {
    return switch (section) {
      'treats' => _placeholderPanel(
          context,
          'tiraTreats',
          'You are a Fan — demo treats balance: ${user.treatsPoints} points',
        ),
      'orders' => _placeholderPanel(
          context,
          'Orders',
          'No orders yet. Start shopping to see order history here.',
        ),
      'addresses' => _addressesPanel(context),
      _ => _personalPanel(context),
    };
  }

  Widget _placeholderPanel(BuildContext context, String title, String body) {
    final gap = _space(context, '3');
    return OneUiSurface(
      mode: 'minimal',
      padding: EdgeInsets.all(gap),
      borderRadius: BorderRadius.circular(_space(context, '2')),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          OneUiText(
            text: title,
            variant: OneUiTextVariant.title,
            size: 'm',
            weight: OneUiTextWeight.high,
          ),
          SizedBox(height: gap),
          OneUiText(
            text: body,
            variant: OneUiTextVariant.body,
            size: 's',
            attention: OneUiTextAttention.medium,
          ),
        ],
      ),
    );
  }

  Widget _personalPanel(BuildContext context) {
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
              OneUiText(
                text: 'My Profile',
                variant: OneUiTextVariant.label,
                size: 'xs',
                attention: OneUiTextAttention.medium,
              ),
              OneUiText(
                text: '  >  Personal Details',
                variant: OneUiTextVariant.label,
                size: 'xs',
                weight: OneUiTextWeight.high,
              ),
            ],
          ),
          SizedBox(height: gap),
          Center(
            child: Stack(
              clipBehavior: Clip.none,
              children: [
                OneUiAvatar(
                  content: OneUiAvatarContent.text,
                  size: 'l',
                  alt: user.fullName,
                ),
                Positioned(
                  right: 0,
                  bottom: 0,
                  child: OneUiIconButton(
                    icon: 'image',
                    semanticsLabel: 'Change profile photo',
                    variant: OneUiIconButtonVariant.subtle,
                    size: 6,
                    onPressed: () {},
                  ),
                ),
              ],
            ),
          ),
          SizedBox(height: gap),
          OneUiText(
            text: 'Gender',
            variant: OneUiTextVariant.label,
            size: 's',
            weight: OneUiTextWeight.high,
          ),
          SizedBox(height: _space(context, '2')),
          OneUiChipGroup(
            value: [gender],
            onValueChange: (values) {
              if (values.isNotEmpty) onGenderChanged(values.first);
            },
            children: [
              OneUiChip(value: 'female', child: 'Female'),
              OneUiChip(value: 'male', child: 'Male'),
              OneUiChip(value: 'non-binary', child: 'Non Binary'),
            ],
          ),
          SizedBox(height: gap),
          Row(
            children: [
              Expanded(
                child: OneUiInputField(
                  label: 'First Name',
                  value: user.firstName,
                  readOnly: true,
                  fullWidth: true,
                  size: 10,
                ),
              ),
              SizedBox(width: gap),
              Expanded(
                child: OneUiInputField(
                  label: 'Last Name',
                  value: user.lastName,
                  readOnly: true,
                  fullWidth: true,
                  size: 10,
                ),
              ),
            ],
          ),
          SizedBox(height: gap),
          OneUiInputField(
            label: 'Email',
            value: user.email,
            readOnly: true,
            fullWidth: true,
            size: 10,
          ),
          SizedBox(height: gap),
          OneUiInputField(
            label: 'Mobile number',
            value: formatTiraPhoneDisplay(user.phone),
            readOnly: true,
            fullWidth: true,
            size: 10,
          ),
        ],
      ),
    );
  }

  Widget _addressesPanel(BuildContext context) {
    final gap = _space(context, '3');
    return OneUiSurface(
      mode: 'minimal',
      padding: EdgeInsets.all(gap),
      borderRadius: BorderRadius.circular(_space(context, '2')),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          OneUiText(
            text: 'Saved address',
            variant: OneUiTextVariant.title,
            size: 'm',
            weight: OneUiTextWeight.high,
          ),
          SizedBox(height: gap),
          OneUiInputField(
            label: 'Address line',
            value: user.addressLine,
            readOnly: true,
            fullWidth: true,
            size: 10,
          ),
          SizedBox(height: gap),
          Row(
            children: [
              Expanded(
                child: OneUiInputField(
                  label: 'City',
                  value: user.city,
                  readOnly: true,
                  fullWidth: true,
                  size: 10,
                ),
              ),
              SizedBox(width: gap),
              Expanded(
                child: OneUiInputField(
                  label: 'Pincode',
                  value: user.pincode,
                  readOnly: true,
                  fullWidth: true,
                  size: 10,
                ),
              ),
            ],
          ),
          SizedBox(height: gap),
          OneUiButton(
            label: 'Add new address',
            variant: OneUiButtonVariant.bold,
            appearance: accentAppearance,
            size: 8,
            fullWidth: true,
            onPressed: () {},
          ),
        ],
      ),
    );
  }
}
