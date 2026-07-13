import 'package:flutter/material.dart';
import 'package:ui_flutter/ui_flutter.dart';

double _layoutSpacing(BuildContext context, String token) {
  final scope = OneUiScope.of(context);
  return getSpacingTokenPx(
    spacingName: token,
    platform: scope.platformId,
    density: scope.density,
    platformsConfig: scope.platformsFoundationConfig,
  );
}

/// Login screen — One UI components only (no Material [Icons], colours, or [Text] labels).
class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  String _signInMethod = 'email';
  List<String> _accountTags = ['personal'];
  bool _rememberMe = false;
  String? _emailError;
  String? _signInMessage;

  void _onSignIn() {
    setState(() {
      _emailError = null;
      _signInMessage = 'Sign in tapped — wire your auth here.';
    });
  }

  @override
  Widget build(BuildContext context) {
    final h = _layoutSpacing(context, '6');
    final hSm = _layoutSpacing(context, '4');
    final hXs = _layoutSpacing(context, '2');
    final padH = _layoutSpacing(context, '6');
    final padTop = MediaQuery.paddingOf(context).top + _layoutSpacing(context, '2');

    return ListView(
      padding: EdgeInsets.fromLTRB(padH, padTop, padH, h),
      children: [
        Center(
          child: OneUiBrandLogo(
            size: OneUiLogoSize.l,
            alt: 'Jio',
          ),
        ),
        SizedBox(height: h),
        Row(
          children: [
            OneUiIndicatorBadgeOverlay(
              hostSide: 48,
              anchor: OneUiIndicatorBadgeOverlayAnchor.bottomEnd,
              indicatorSize: 's',
              host: const OneUiAvatar(
                content: OneUiAvatarContent.text,
                size: 'l',
                alt: 'AK',
              ),
              indicator: const OneUiIndicatorBadge(
                size: 's',
                appearance: 'positive',
                semanticsLabel: 'Online',
              ),
            ),
            SizedBox(width: hSm),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: OneUiText(
                          text: 'Welcome back',
                          variant: OneUiTextVariant.headline,
                          size: 'm',
                        ),
                      ),
                      OneUiBadge(
                        attention: 'high',
                        appearance: 'positive',
                        start: const OneUiIcon(
                          icon: 'checkCircle',
                          size: '3',
                          excludeFromSemantics: true,
                        ),
                        child: 'Verified',
                        semanticsLabel: 'Verified account',
                      ),
                    ],
                  ),
                  SizedBox(height: hXs),
                  OneUiText(
                    text: 'Sign in to continue to your account',
                    variant: OneUiTextVariant.body,
                    size: 's',
                  ),
                ],
              ),
            ),
          ],
        ),
        SizedBox(height: hSm),
        OneUiText(
          text: 'Account type',
          variant: OneUiTextVariant.label,
          size: 's',
        ),
        SizedBox(height: hXs),
        OneUiChipGroup(
          defaultValue: _accountTags,
          multiple: true,
          onValueChange: (value) => setState(() => _accountTags = value),
          children: [
            OneUiChip(value: 'personal', child: 'Personal'),
            OneUiChip(value: 'work', child: 'Work'),
            OneUiChip(value: 'guest', child: 'Guest'),
          ],
        ),
        SizedBox(height: h),
        OneUiDivider(
          content: kOneUiDividerContentLabel,
          child: 'or continue with email',
        ),
        SizedBox(height: h),
        OneUiRadioField(
          label: 'Sign-in method',
          fullWidth: true,
          defaultValue: _signInMethod,
          onValueChange: (value) => setState(() => _signInMethod = value),
          children: [
            OneUiRadio(label: 'Email', value: 'email'),
            OneUiRadio(label: 'Mobile number', value: 'mobile'),
          ],
        ),
        SizedBox(height: hSm),
        OneUiInputField(
          label: 'Email',
          placeholder: 'you@example.com',
          fullWidth: true,
          required: true,
          type: 'email',
          error: _emailError,
          start: const OneUiIcon(icon: 'search', size: '4'),
          autoComplete: 'email',
        ),
        SizedBox(height: hSm),
        OneUiInputField(
          label: 'Password',
          placeholder: 'Enter password',
          fullWidth: true,
          required: true,
          type: 'password',
          autoComplete: 'current-password',
        ),
        SizedBox(height: hSm),
        OneUiText(
          text: 'Referral code (raw Input)',
          variant: OneUiTextVariant.label,
          size: 's',
        ),
        SizedBox(height: hXs),
        SizedBox(
          width: double.infinity,
          child: OneUiInput(
            placeholder: 'Optional code',
            start: const OneUiIcon(icon: 'link', size: '4'),
          ),
        ),
        SizedBox(height: hSm),
        OneUiCheckboxField(
          label: 'Remember me on this device',
          checked: _rememberMe,
          onCheckedChange: (value) => setState(() => _rememberMe = value),
        ),
        SizedBox(height: hSm),
        Row(
          children: [
            const OneUiIcon(icon: 'info', size: '4'),
            SizedBox(width: hXs),
            Expanded(
              child: OneUiText(
                text: 'Need help? Contact support',
                variant: OneUiTextVariant.body,
                size: 's',
              ),
            ),
            OneUiIconButton(
              icon: 'settings',
              semanticsLabel: 'Settings',
              variant: OneUiIconButtonVariant.ghost,
              onPressed: () {},
            ),
          ],
        ),
        if (_signInMessage != null) ...[
          SizedBox(height: hSm),
          OneUiInputFeedback(
            variant: OneUiInputFeedbackVariant.informative,
            attention: OneUiInputFeedbackAttention.low,
            feedbackMessage: _signInMessage,
          ),
        ],
        SizedBox(height: h),
        OneUiButton(
          variant: OneUiButtonVariant.bold,
          fullWidth: true,
          label: 'Sign in',
          onPressed: _onSignIn,
        ),
        SizedBox(height: hXs),
        OneUiButton(
          variant: OneUiButtonVariant.ghost,
          fullWidth: true,
          label: 'Create an account',
          onPressed: () {},
        ),
      ],
    );
  }
}
