import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:ui_flutter/ui_flutter.dart';
import 'package:ui_flutter/widgets/one_ui_image.dart';

import 'demo_peoplefirst_data.dart';
import 'demo_responsive.dart';
import 'demo_store_config.dart';

double _space(BuildContext context, String token) {
  final scope = OneUiScope.of(context);
  return getSpacingTokenPx(
    spacingName: token,
    platform: scope.platformId,
    density: scope.density,
    platformsConfig: scope.platformsFoundationConfig,
  );
}

bool _isNarrowContent(BuildContext context) =>
    MediaQuery.sizeOf(context).width < _space(context, '40');

bool _isCompactPortalLayout(BuildContext context) {
  final platform = OneUiScope.of(context).platformId;
  if (platform.startsWith('S-')) return true;
  return _isNarrowContent(context);
}

bool _isWideDashboard(BuildContext context) =>
    MediaQuery.sizeOf(context).width >=
    _space(context, '40') + _space(context, '32');

double _sidebarExpandedWidth(BuildContext context) =>
    _space(context, '40') + _space(context, '32');

double _sidebarCollapsedWidth(BuildContext context) =>
    _space(context, '12');

enum _PfRoute { home, profile, benefits }

/// PeopleFirst employee portal — home, profile, and benefits (all 25 OneUI widgets).
class DemoPeopleFirstFlow extends StatefulWidget {
  const DemoPeopleFirstFlow({
    required this.config,
    required this.accentAppearance,
    super.key,
  });

  final DemoStoreConfig config;
  final String accentAppearance;

  @override
  State<DemoPeopleFirstFlow> createState() => _DemoPeopleFirstFlowState();
}

class _DemoPeopleFirstFlowState extends State<DemoPeopleFirstFlow> {
  final _scaffoldKey = GlobalKey<ScaffoldState>();

  _PfRoute _route = _PfRoute.home;
  String _search = '';
  String? _searchError;
  String _birthdayTab = 'today';
  String _benefitPlan = 'health';
  bool _sidebarOpen = true;
  bool _emailAlerts = true;
  bool _smsAlerts = false;
  bool _loadingNews = false;
  int _newsSlideIndex = 0;
  String _profileNote = '';
  String _benefitFilter = 'all';
  bool _includeInactiveBenefits = false;

  String _appearance(String role) {
    if (OneUiSurfaceScope.isAppearanceConfigured(context, role)) return role;
    return widget.accentAppearance;
  }

  bool _useSidebar(BuildContext context) {
    if (isHandheldNativeDemo(context)) return false;
    final platform = OneUiScope.of(context).platformId;
    if (platform.startsWith('S-')) return false;
    return MediaQuery.sizeOf(context).width >= _space(context, '40');
  }

  void _go(_PfRoute route) => setState(() => _route = route);

  bool _hasHomeRightRail(BuildContext context) =>
      _useSidebar(context) && _isWideDashboard(context);

  void _closeDrawerIfOpen() {
    final state = _scaffoldKey.currentState;
    if (state?.isDrawerOpen ?? false) {
      state!.closeDrawer();
    }
  }

  void _onNavTap(String id) {
    _closeDrawerIfOpen();
    switch (id) {
      case 'home':
        setState(() => _searchError = null);
        _go(_PfRoute.home);
      case 'profile':
        setState(() => _searchError = null);
        _go(_PfRoute.profile);
      case 'benefits':
        setState(() => _searchError = null);
        _go(_PfRoute.benefits);
      default:
        final label = kPeopleFirstNavItems
            .where((item) => item.id == id)
            .map((item) => item.label)
            .firstOrNull;
        setState(
          () => _searchError =
              'Demo: ${label ?? id} is not implemented yet',
        );
    }
  }

  String get _routeNavId => switch (_route) {
        _PfRoute.home => 'home',
        _PfRoute.profile => 'profile',
        _PfRoute.benefits => 'benefits',
      };

  @override
  Widget build(BuildContext context) {
    final sidebar = _useSidebar(context);
    final pad = _space(context, '4');

    return Scaffold(
      key: _scaffoldKey,
      backgroundColor: Colors.transparent,
      drawer: sidebar ? null : _mobileDrawer(context),
      body: Stack(
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              _header(context, compact: !sidebar),
              if (_searchError != null) _feedbackBanner(context),
              Expanded(
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    if (sidebar) _sidebar(context),
                    Expanded(child: _body(context)),
                  ],
                ),
              ),
              if (!sidebar) _mobileNav(context),
            ],
          ),
          Positioned(
            right: pad,
            bottom: sidebar ? pad : pad + _space(context, '16'),
            child: OneUiIconButton(
              icon: 'chat',
              semanticsLabel: 'Open chat support',
              variant: OneUiIconButtonVariant.bold,
              appearance: _appearance('informative'),
              size: 10,
              onPressed: () {
                setState(
                  () => _searchError =
                      'Demo: HR chat support is not connected in this sample',
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _feedbackBanner(BuildContext context) {
    return Padding(
      padding: EdgeInsets.fromLTRB(
        _space(context, '4'),
        _space(context, '2'),
        _space(context, '4'),
        0,
      ),
      child: OneUiInputFeedback(
        variant: OneUiInputFeedbackVariant.informative,
        attention: OneUiInputFeedbackAttention.low,
        feedbackMessage: _searchError,
      ),
    );
  }

  Widget _mobileDrawer(BuildContext context) {
    return Drawer(
      backgroundColor: Colors.transparent,
      child: OneUiSurface(
        mode: 'default',
        child: SafeArea(
          child: ListView(
            padding: EdgeInsets.symmetric(vertical: _space(context, '2')),
            children: [
              Padding(
                padding: EdgeInsets.all(_space(context, '3')),
                child: OneUiText(
                  text: 'PeopleFirst',
                  variant: OneUiTextVariant.title,
                  size: 'm',
                  weight: OneUiTextWeight.high,
                ),
              ),
              OneUiDivider(),
              for (final item in kPeopleFirstNavItems)
                _sidebarItem(context, item, collapsed: false),
            ],
          ),
        ),
      ),
    );
  }

  Widget _mobileSearch(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        OneUiInput(
          placeholder: widget.config.searchPlaceholder,
          value: _search,
          onChanged: (v) => setState(() {
            _search = v;
            _searchError = null;
          }),
          start: const OneUiIcon(
            icon: 'search',
            size: '4',
            excludeFromSemantics: true,
          ),
          size: 10,
          shape: OneUiInputShape.pill,
          ariaLabel: 'Search',
        ),
        if (_search.isNotEmpty) ...[
          SizedBox(height: _space(context, '1')),
          OneUiText(
            text: 'Searching "$_search" (demo only)',
            variant: OneUiTextVariant.label,
            size: 'xs',
            attention: OneUiTextAttention.medium,
          ),
        ],
      ],
    );
  }

  Widget _header(BuildContext context, {required bool compact}) {
    final padH = compact ? _space(context, '3') : _space(context, '4');
    final padV = _space(context, '2');
    return OneUiSurface(
      mode: 'bold',
      appearance: _appearance('informative'),
      padding: EdgeInsets.fromLTRB(padH, padV, padH, padV),
      child: SafeArea(
        bottom: false,
        child: Row(
          children: [
            if (compact)
              OneUiIconButton(
                icon: 'menu',
                semanticsLabel: 'Open menu',
                variant: OneUiIconButtonVariant.ghost,
                size: 8,
                onPressed: () => _scaffoldKey.currentState?.openDrawer(),
              ),
            OneUiLogo(
              alt: 'PeopleFirst',
              size: OneUiLogoSize.s,
              child: OneUiIconContained(
                icon: 'user',
                size: 's',
                appearance: _appearance('informative'),
                attention: OneUiIconContainedAttention.high,
                semanticsLabel: 'PeopleFirst',
              ),
            ),
            if (!compact) ...[
              SizedBox(width: _space(context, '2')),
              OneUiText(
                text: 'PeopleFirst',
                variant: OneUiTextVariant.title,
                size: 's',
                weight: OneUiTextWeight.high,
                appearance: _appearance('informative'),
                maxLines: 1,
              ),
            ],
            if (compact) const Spacer(),
            if (!compact) ...[
              SizedBox(width: _space(context, '8')),
              Expanded(
                child: OneUiInputField(
                  placeholder: widget.config.searchPlaceholder,
                  value: _search,
                  onChanged: (v) => setState(() {
                    _search = v;
                    _searchError = null;
                  }),
                  start: const OneUiIcon(
                    icon: 'search',
                    size: '4',
                    excludeFromSemantics: true,
                  ),
                  size: 10,
                  shape: OneUiInputShape.pill,
                  appearance: OneUiInputAppearance.auto,
                  ariaLabel: 'Search PeopleFirst',
                  fullWidth: true,
                ),
              ),
              SizedBox(width: _space(context, '8')),
            ],
            OneUiIndicatorBadgeOverlay(
              hostSide: _space(context, '10'),
              anchor: OneUiIndicatorBadgeOverlayAnchor.topEnd,
              indicatorSize: 's',
              host: OneUiIconButton(
                icon: 'notification',
                semanticsLabel: 'Notifications',
                variant: OneUiIconButtonVariant.ghost,
                size: 8,
                onPressed: () {
                  setState(
                    () => _searchError = 'Demo: 8 unread notifications',
                  );
                },
              ),
              indicator: OneUiCounterBadge(
                value: 8,
                size: 'xs',
                appearance: 'negative',
                semanticsLabel: '8 notifications',
              ),
            ),
            SizedBox(width: _space(context, '2')),
            OneUiAvatar(
              content: OneUiAvatarContent.text,
              size: 'm',
              appearance: 'auto',
              alt: 'SP',
            ),
          ],
        ),
      ),
    );
  }

  Widget _sidebar(BuildContext context) {
    final collapsed = !_sidebarOpen;
    final w = collapsed
        ? _sidebarCollapsedWidth(context)
        : _sidebarExpandedWidth(context);
    return SizedBox(
      width: w,
      child: OneUiSurface(
        mode: 'minimal',
        child: ListView(
          padding: EdgeInsets.symmetric(vertical: _space(context, '2')),
          children: [
            Padding(
              padding: EdgeInsets.symmetric(
                horizontal: _space(context, '2'),
                vertical: _space(context, '1'),
              ),
              child: Align(
                alignment: AlignmentDirectional.centerStart,
                child: OneUiIconButton(
                  icon: 'menu',
                  semanticsLabel: 'Toggle sidebar',
                  variant: OneUiIconButtonVariant.ghost,
                  size: 8,
                  onPressed: () => setState(() => _sidebarOpen = !_sidebarOpen),
                ),
              ),
            ),
            OneUiDivider(),
            SizedBox(height: _space(context, '1')),
            for (final item in kPeopleFirstNavItems)
              _sidebarItem(context, item, collapsed: collapsed),
          ],
        ),
      ),
    );
  }

  Widget _sidebarItem(
    BuildContext context,
    PfNavItem item, {
    required bool collapsed,
  }) {
    final selected = _routeNavId == item.id;
    final padH = collapsed ? _space(context, '1') : _space(context, '2');
    final accentBar = selected
        ? OneUiSurface(
            mode: 'bold',
            appearance: _appearance('informative'),
            padding: EdgeInsets.zero,
            borderRadius: BorderRadius.zero,
            child: SizedBox(
              width: _space(context, '0-5'),
              height: _space(context, '6'),
            ),
          )
        : SizedBox(width: _space(context, '0-5'));

    return Padding(
      padding: EdgeInsets.symmetric(
        horizontal: padH,
        vertical: _space(context, '0-5'),
      ),
      child: OneUiSurface(
        mode: selected ? 'subtle' : 'ghost',
        padding: EdgeInsets.zero,
        borderRadius: BorderRadius.circular(_space(context, '1')),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            accentBar,
            Expanded(
              child: OneUiButton(
                label: collapsed ? null : item.label,
                semanticsLabel: item.label,
                variant: OneUiButtonVariant.ghost,
                appearance: selected
                    ? _appearance('informative')
                    : _appearance('neutral'),
                size: 8,
                fullWidth: !collapsed,
                start: collapsed
                    ? null
                    : OneUiIcon(
                        icon: item.icon,
                        size: '4',
                        excludeFromSemantics: true,
                      ),
                child: collapsed
                    ? OneUiIcon(
                        icon: item.icon,
                        size: '4',
                        excludeFromSemantics: true,
                      )
                    : null,
                onPressed: item.enabled ? () => _onNavTap(item.id) : null,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _mobileNav(BuildContext context) {
    final value = switch (_route) {
      _PfRoute.home => 'home',
      _PfRoute.profile => 'profile',
      _PfRoute.benefits => 'benefits',
    };
    return OneUiBottomNavigation(
      semanticsLabel: 'PeopleFirst navigation',
      value: value,
      onValueChange: (v) {
        switch (v) {
          case 'profile':
            _go(_PfRoute.profile);
          case 'benefits':
            _go(_PfRoute.benefits);
          default:
            _go(_PfRoute.home);
        }
      },
      appearance: _appearance('informative'),
      labelType: '1line',
      children: const [
        OneUiBottomNavItem(icon: 'home', label: 'Home', value: 'home'),
        OneUiBottomNavItem(icon: 'user', label: 'Profile', value: 'profile'),
        OneUiBottomNavItem(icon: 'heart', label: 'Benefits', value: 'benefits'),
      ],
    );
  }

  Widget _body(BuildContext context) {
    return switch (_route) {
      _PfRoute.home => _home(context),
      _PfRoute.profile => _profile(context),
      _PfRoute.benefits => _benefits(context),
    };
  }

  Widget _homeSectionTitle(BuildContext context, String title) {
    return OneUiText(
      text: title,
      variant: OneUiTextVariant.title,
      size: 's',
      weight: OneUiTextWeight.high,
    );
  }

  Widget _homeSection(
    BuildContext context, {
    required String title,
    required Widget child,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        _homeSectionTitle(context, title),
        SizedBox(height: _space(context, '2')),
        child,
      ],
    );
  }

  Widget _calendarBirthdaysRow(BuildContext context) {
    final gap = _space(context, '3');
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Expanded(child: _calendarSection(context)),
        SizedBox(width: gap),
        Expanded(child: _birthdaysSection(context)),
      ],
    );
  }

  Widget _calendarSection(BuildContext context) {
    return _homeSection(
      context,
      title: 'Calendar',
      child: _calendarCard(context),
    );
  }

  Widget _birthdaysSection(BuildContext context) {
    return _homeSection(
      context,
      title: 'Birthdays & Work Anniversaries',
      child: _birthdaysCard(context),
    );
  }

  Widget _quickLinksSection(BuildContext context) {
    return _homeSection(
      context,
      title: 'Quick Links',
      child: _quickLinksCard(context),
    );
  }

  Widget _home(BuildContext context) {
    final pad = _space(context, '4');
    final gap = _space(context, '3');
    final rightRail = _hasHomeRightRail(context);

    final mainColumn = Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        if (!_useSidebar(context)) ...[
          _mobileSearch(context),
          SizedBox(height: gap),
        ],
        _welcomeBanner(context),
        SizedBox(height: gap),
        if (!_isCompactPortalLayout(context))
          _calendarBirthdaysRow(context)
        else ...[
          _calendarSection(context),
          SizedBox(height: gap),
          _birthdaysSection(context),
        ],
        SizedBox(height: gap),
        _quickLinksSection(context),
        if (!rightRail) ...[
          SizedBox(height: gap),
          _newsCard(context),
          SizedBox(height: gap),
          _announcements(context, compactHeader: _isCompactPortalLayout(context)),
          SizedBox(height: gap),
          _callRefersCard(context, compactHeader: _isCompactPortalLayout(context)),
        ],
        SizedBox(height: _space(context, '16')),
      ],
    );

    if (rightRail) {
      final railW = _space(context, '40');
      return Row(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Expanded(
            child: ListView(
              padding: EdgeInsets.all(pad),
              children: [mainColumn],
            ),
          ),
          OneUiSurface(
            mode: 'minimal',
            appearance: _appearance('informative'),
            child: SizedBox(
              width: railW,
              child: ListView(
                padding: EdgeInsets.fromLTRB(
                  _space(context, '2'),
                  pad,
                  pad,
                  pad,
                ),
                children: [
                  _newsCard(context),
                  SizedBox(height: gap),
                  _announcements(context, compactHeader: true),
                  SizedBox(height: gap),
                  _callRefersCard(context, compactHeader: true),
                  SizedBox(height: _space(context, '16')),
                ],
              ),
            ),
          ),
        ],
      );
    }

    return ListView(
      padding: EdgeInsets.all(pad),
      children: [mainColumn],
    );
  }

  Widget _welcomeBanner(BuildContext context) {
    final gap = _space(context, '3');
    final radius = BorderRadius.circular(_space(context, '2'));
    final stackLayout = _isCompactPortalLayout(context);

    if (stackLayout) {
      return OneUiSurface(
        mode: 'elevated',
        padding: EdgeInsets.all(gap),
        borderRadius: radius,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            _bannerHeroSide(context, stackImage: true),
            SizedBox(height: gap),
            _punchStatsPanel(context),
          ],
        ),
      );
    }

    return OneUiSurface(
      mode: 'elevated',
      padding: EdgeInsets.zero,
      borderRadius: radius,
      child: ClipRRect(
        borderRadius: radius,
        child: IntrinsicHeight(
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Expanded(flex: 2, child: _bannerHeroSide(context)),
              OneUiDivider(orientation: kOneUiDividerVertical),
              Expanded(flex: 1, child: _punchStatsPanel(context)),
            ],
          ),
        ),
      ),
    );
  }

  Widget _bannerImage(BuildContext context) {
    return OneUiImage(
      src: kPeopleFirstBannerImageUrl,
      alt: 'PeopleFirst welcome banner',
      aspectRatio: OneUiImageAspectRatio.auto,
      fit: OneUiImageObjectFit.cover,
      objectFit: OneUiImageObjectFit.cover,
      objectPosition: 'right center',
      loading: OneUiImageLoadingStrategy.eager,
      fallback: SvgPicture.asset(
        kPeopleFirstBannerAssetPath,
        fit: BoxFit.cover,
        alignment: Alignment.centerRight,
        width: double.infinity,
        height: double.infinity,
        excludeFromSemantics: true,
      ),
    );
  }

  Widget _bannerHeroSide(BuildContext context, {bool stackImage = false}) {
    final gap = _space(context, '3');
    final heroHeight = stackImage ? _space(context, '20') : _space(context, '24');
    final radius = BorderRadius.circular(_space(context, '2'));

    final greeting = Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisAlignment: MainAxisAlignment.center,
      mainAxisSize: MainAxisSize.min,
      children: [
        OneUiText(
          text: 'Hello, ${kPeopleFirstUserName}',
          variant: OneUiTextVariant.headline,
          size: 'm',
          weight: OneUiTextWeight.high,
        ),
        SizedBox(height: _space(context, '1')),
        OneUiText(
          text: 'Have a great day!',
          variant: OneUiTextVariant.body,
          size: 'm',
        ),
      ],
    );

    final heroBody = OneUiSurface(
      mode: 'bold',
      appearance: _appearance('informative'),
      padding: EdgeInsets.zero,
      child: SizedBox(
        height: heroHeight,
        width: double.infinity,
        child: Stack(
          fit: StackFit.expand,
          children: [
            _bannerImage(context),
            Padding(
              padding: EdgeInsets.all(gap),
              child: Align(
                alignment: AlignmentDirectional.centerStart,
                child: ConstrainedBox(
                  constraints: BoxConstraints(
                    maxWidth: stackImage
                        ? double.infinity
                        : _space(context, '32'),
                  ),
                  child: greeting,
                ),
              ),
            ),
          ],
        ),
      ),
    );

    if (stackImage) {
      return ClipRRect(borderRadius: radius, child: heroBody);
    }
    return heroBody;
  }

  Widget _punchStatsPanel(BuildContext context) {
    final gap = _space(context, '2');
    return OneUiSurface(
      mode: 'default',
      padding: EdgeInsets.all(_space(context, '3')),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        mainAxisSize: MainAxisSize.min,
        children: [
          for (var i = 0; i < kPeopleFirstAttendanceStats.length; i++) ...[
            if (i > 0) ...[
              SizedBox(height: gap),
              OneUiDivider(),
              SizedBox(height: gap),
            ],
            _attendanceStatRow(context, kPeopleFirstAttendanceStats[i]),
          ],
        ],
      ),
    );
  }

  Widget _attendanceStatRow(BuildContext context, PfAttendanceStat stat) {
    final compact = _isCompactPortalLayout(context);

    if (compact) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          OneUiText(
            text: stat.label,
            variant: OneUiTextVariant.label,
            size: 'xs',
            weight: OneUiTextWeight.medium,
          ),
          OneUiText(
            text: stat.value,
            variant: OneUiTextVariant.label,
            size: 'xs',
            weight: OneUiTextWeight.high,
          ),
        ],
      );
    }

    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Expanded(
          flex: 3,
          child: OneUiText(
            text: stat.label,
            variant: OneUiTextVariant.label,
            size: 'xs',
            weight: OneUiTextWeight.medium,
          ),
        ),
        Expanded(
          flex: 2,
          child: OneUiText(
            text: stat.value,
            variant: OneUiTextVariant.label,
            size: 'xs',
            weight: OneUiTextWeight.high,
            textAlign: OneUiTextAlign.right,
          ),
        ),
      ],
    );
  }

  Widget _calendarDayCell(BuildContext context, int day) {
    final isToday = day == kPeopleFirstCalendarToday;
    final isPresent = kPeopleFirstCalendarPresentDays.contains(day);
    final isMarked = kPeopleFirstCalendarMarkedDays.contains(day);
    final isInactive = kPeopleFirstCalendarInactiveDays.contains(day);
    final isFuturePlain = kPeopleFirstCalendarFuturePlainDays.contains(day);
    final pill = BorderRadius.circular(_space(context, '6'));
    final label = isMarked ? '$day*' : '$day';

    Widget circleCell({
      required String mode,
      required String appearance,
      String? textAppearance,
    }) {
      return AspectRatio(
        aspectRatio: 1,
        child: OneUiSurface(
          mode: mode,
          appearance: appearance,
          padding: EdgeInsets.zero,
          borderRadius: pill,
          child: Center(
            child: OneUiText(
              text: label,
              variant: OneUiTextVariant.label,
              size: 'xs',
              weight: OneUiTextWeight.high,
              appearance: textAppearance ?? appearance,
              textAlign: OneUiTextAlign.center,
            ),
          ),
        ),
      );
    }

    if (isToday) {
      return circleCell(
        mode: 'bold',
        appearance: 'neutral',
      );
    }

    if (isPresent) {
      return circleCell(
        mode: 'bold',
        appearance: 'positive',
        textAppearance: 'positive',
      );
    }

    if (isInactive) {
      return AspectRatio(
        aspectRatio: 1,
        child: OneUiSurface(
          mode: 'ghost',
          appearance: 'neutral',
          padding: EdgeInsets.zero,
          borderRadius: pill,
          child: Center(
            child: OneUiText(
              text: label,
              variant: OneUiTextVariant.label,
              size: 'xs',
              weight: OneUiTextWeight.medium,
              attention: OneUiTextAttention.low,
              textAlign: OneUiTextAlign.center,
            ),
          ),
        ),
      );
    }

    if (isFuturePlain) {
      return AspectRatio(
        aspectRatio: 1,
        child: Center(
          child: OneUiText(
            text: label,
            variant: OneUiTextVariant.label,
            size: 'xs',
            weight: OneUiTextWeight.medium,
            appearance: _appearance('informative'),
            textAlign: OneUiTextAlign.center,
          ),
        ),
      );
    }

    return AspectRatio(
      aspectRatio: 1,
      child: Center(
        child: OneUiText(
          text: label,
          variant: OneUiTextVariant.label,
          size: 'xs',
          weight: OneUiTextWeight.medium,
          attention: OneUiTextAttention.medium,
          textAlign: OneUiTextAlign.center,
        ),
      ),
    );
  }

  Widget _calendarCard(BuildContext context) {
    final gap = _space(context, '2');
    final cells = <Widget>[
      for (var i = 0; i < kPeopleFirstCalendarLeadingBlanks; i++)
        const SizedBox.shrink(),
      for (var day = 1; day <= kPeopleFirstCalendarDaysInMonth; day++)
        _calendarDayCell(context, day),
    ];

    return OneUiSurface(
      mode: 'elevated',
      padding: EdgeInsets.all(_space(context, '3')),
      borderRadius: BorderRadius.circular(_space(context, '2')),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          OneUiText(
            text: kPeopleFirstCalendarMonthLabel,
            variant: OneUiTextVariant.title,
            size: 'xs',
            weight: OneUiTextWeight.high,
            textAlign: OneUiTextAlign.center,
          ),
          SizedBox(height: gap),
          Row(
            children: [
              for (final weekday in kPeopleFirstCalendarWeekdays)
                Expanded(
                  child: OneUiText(
                    text: weekday,
                    variant: OneUiTextVariant.label,
                    size: '2xs',
                    attention: OneUiTextAttention.low,
                    textAlign: OneUiTextAlign.center,
                  ),
                ),
            ],
          ),
          SizedBox(height: gap),
          GridView.count(
            crossAxisCount: kPeopleFirstCalendarWeekdays.length,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            mainAxisSpacing: gap,
            crossAxisSpacing: gap,
            children: cells,
          ),
        ],
      ),
    );
  }

  Widget _birthdayTabBar(BuildContext context) {
    final gap = _space(context, '0-5');
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Row(
          children: [
            for (final tab in const [
              ('today', 'Today'),
              ('upcoming', 'Upcoming'),
            ])
              Expanded(
                child: OneUiButton(
                  label: tab.$2,
                  semanticsLabel: tab.$2,
                  variant: OneUiButtonVariant.ghost,
                  appearance: _birthdayTab == tab.$1
                      ? _appearance('informative')
                      : _appearance('neutral'),
                  size: 8,
                  fullWidth: true,
                  onPressed: () => setState(() => _birthdayTab = tab.$1),
                ),
              ),
          ],
        ),
        SizedBox(height: gap),
        Row(
          children: [
            for (final tab in const ['today', 'upcoming'])
              Expanded(
                child: OneUiSurface(
                  mode: _birthdayTab == tab ? 'bold' : 'ghost',
                  appearance: _appearance('informative'),
                  padding: EdgeInsets.zero,
                  borderRadius: BorderRadius.zero,
                  child: SizedBox(height: _space(context, '0-5')),
                ),
              ),
          ],
        ),
        OneUiDivider(),
      ],
    );
  }

  Widget _birthdaysCard(BuildContext context) {
    final emptyTitle = _birthdayTab == 'today'
        ? kPeopleFirstBirthdayEmptyTitle
        : kPeopleFirstBirthdayUpcomingTitle;
    final emptySubtitle = _birthdayTab == 'today'
        ? kPeopleFirstBirthdayEmptySubtitle
        : kPeopleFirstBirthdayUpcomingSubtitle;

    return OneUiSurface(
      mode: 'elevated',
      padding: EdgeInsets.all(_space(context, '3')),
      borderRadius: BorderRadius.circular(_space(context, '2')),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          _birthdayTabBar(context),
          SizedBox(height: _space(context, '3')),
          Center(
            child: OneUiIconContained(
              icon: 'sparkles',
              size: 'xl',
              appearance: _appearance('informative'),
              attention: OneUiIconContainedAttention.medium,
              semanticsLabel: 'No events',
            ),
          ),
          SizedBox(height: _space(context, '2')),
          OneUiText(
            text: emptyTitle,
            variant: OneUiTextVariant.body,
            size: 's',
            weight: OneUiTextWeight.high,
            textAlign: OneUiTextAlign.center,
          ),
          SizedBox(height: _space(context, '1')),
          OneUiText(
            text: emptySubtitle,
            variant: OneUiTextVariant.body,
            size: 's',
            attention: OneUiTextAttention.medium,
            textAlign: OneUiTextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _newsCard(BuildContext context) {
    final slide = kPeopleFirstNewsSlides[_newsSlideIndex];
    return OneUiSurface(
      mode: 'elevated',
      padding: EdgeInsets.all(_space(context, '3')),
      borderRadius: BorderRadius.circular(_space(context, '2')),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              Expanded(
                child: OneUiText(
                  text: 'News & Updates',
                  variant: OneUiTextVariant.title,
                  size: 's',
                  weight: OneUiTextWeight.high,
                ),
              ),
              if (_loadingNews)
                OneUiCircularProgressIndicator(
                  variant: 'indeterminate',
                  size: 'S',
                  appearance: _appearance('informative'),
                  animate: true,
                  semanticsLabel: 'Loading news',
                )
              else
                OneUiIconButton(
                  icon: 'refresh',
                  semanticsLabel: 'Refresh news',
                  variant: OneUiIconButtonVariant.ghost,
                  size: 6,
                  onPressed: () {
                    setState(() => _loadingNews = true);
                    Future<void>.delayed(const Duration(milliseconds: 800), () {
                      if (mounted) setState(() => _loadingNews = false);
                    });
                  },
                ),
            ],
          ),
          SizedBox(height: _space(context, '2')),
          ClipRRect(
            borderRadius: BorderRadius.circular(_space(context, '1')),
            child: AspectRatio(
              aspectRatio: 16 / 9,
              child: OneUiImage(
                src: slide.imageUrl,
                alt: slide.alt,
                aspectRatio: OneUiImageAspectRatio.r16x9,
                fit: OneUiImageObjectFit.cover,
                borderRadiusToken: '--Shape-2',
                loading: OneUiImageLoadingStrategy.lazy,
              ),
            ),
          ),
          SizedBox(height: _space(context, '2')),
          OneUiText(
            text: slide.title,
            variant: OneUiTextVariant.body,
            size: 's',
            weight: OneUiTextWeight.medium,
            maxLines: 2,
          ),
          SizedBox(height: _space(context, '2')),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              for (var i = 0; i < kPeopleFirstNewsSlides.length; i++) ...[
                if (i > 0) SizedBox(width: _space(context, '2')),
                Semantics(
                  button: true,
                  label: 'News slide ${i + 1}',
                  child: GestureDetector(
                    onTap: () => setState(() => _newsSlideIndex = i),
                    child: OneUiIndicatorBadge(
                      size: i == _newsSlideIndex ? 's' : 'xs',
                      appearance: i == _newsSlideIndex
                          ? _appearance('informative')
                          : 'neutral',
                      semanticsLabel: 'News slide ${i + 1}',
                    ),
                  ),
                ),
              ],
            ],
          ),
        ],
      ),
    );
  }

  Widget _quickLinksCard(BuildContext context) {
    final spreadEvenly = !_isCompactPortalLayout(context);

    Widget linkTile(PfQuickLink link) {
      return Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          OneUiIconContained(
            icon: link.icon,
            size: 'l',
            appearance: _appearance('informative'),
            attention: OneUiIconContainedAttention.medium,
            semanticsLabel: link.label,
          ),
          SizedBox(height: _space(context, '1')),
          OneUiText(
            text: link.label,
            variant: OneUiTextVariant.label,
            size: '2xs',
            weight: OneUiTextWeight.medium,
            maxLines: 2,
            textAlign: OneUiTextAlign.center,
          ),
          if (link.subtitle != null) ...[
            SizedBox(height: _space(context, '0-5')),
            OneUiText(
              text: link.subtitle!,
              variant: OneUiTextVariant.label,
              size: '2xs',
              attention: OneUiTextAttention.medium,
              maxLines: 2,
              textAlign: OneUiTextAlign.center,
            ),
          ],
        ],
      );
    }

    return OneUiSurface(
      mode: 'elevated',
      padding: EdgeInsets.all(_space(context, '3')),
      borderRadius: BorderRadius.circular(_space(context, '2')),
      child: spreadEvenly
          ? Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                for (final link in kPeopleFirstQuickLinks)
                  Expanded(child: linkTile(link)),
              ],
            )
          : SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: [
                  for (final link in kPeopleFirstQuickLinks) ...[
                    SizedBox(
                      width: _space(context, '18'),
                      child: linkTile(link),
                    ),
                    SizedBox(width: _space(context, '3')),
                  ],
                ],
              ),
            ),
    );
  }

  Widget _announcements(BuildContext context, {bool compactHeader = false}) {
    return OneUiSurface(
      mode: 'elevated',
      padding: EdgeInsets.all(_space(context, '3')),
      borderRadius: BorderRadius.circular(_space(context, '2')),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          if (compactHeader)
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                OneUiText(
                  text: 'Announcements',
                  variant: OneUiTextVariant.title,
                  size: 's',
                  weight: OneUiTextWeight.high,
                ),
                SizedBox(height: _space(context, '1')),
                OneUiBadge(
                  size: 's',
                  appearance: 'informative',
                  child: 'NEW',
                ),
              ],
            )
          else
            Row(
              children: [
                Expanded(
                  child: OneUiText(
                    text: 'Announcements',
                    variant: OneUiTextVariant.title,
                    size: 's',
                    weight: OneUiTextWeight.high,
                  ),
                ),
                OneUiBadge(
                  size: 's',
                  appearance: 'informative',
                  child: 'NEW',
                ),
              ],
            ),
          SizedBox(height: _space(context, '2')),
          OneUiDivider(),
          SizedBox(height: _space(context, '2')),
          OneUiText(
            text: 'Calendar for 2026',
            variant: OneUiTextVariant.body,
            size: 's',
            weight: OneUiTextWeight.medium,
          ),
          OneUiText(
            text: kPeopleFirstAnnouncementDate,
            variant: OneUiTextVariant.label,
            size: 'xs',
            attention: OneUiTextAttention.medium,
          ),
        ],
      ),
    );
  }

  Widget _callRefersCard(BuildContext context, {bool compactHeader = false}) {
    return OneUiSurface(
      mode: 'elevated',
      padding: EdgeInsets.all(_space(context, '3')),
      borderRadius: BorderRadius.circular(_space(context, '2')),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          if (compactHeader)
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                OneUiIconContained(
                  icon: 'phone',
                  size: 'm',
                  appearance: _appearance('informative'),
                  semanticsLabel: 'Call REFERS',
                ),
                SizedBox(height: _space(context, '2')),
                OneUiText(
                  text: 'Call REFERS',
                  variant: OneUiTextVariant.title,
                  size: 's',
                  weight: OneUiTextWeight.high,
                ),
              ],
            )
          else
            Row(
              children: [
                OneUiIconContained(
                  icon: 'phone',
                  size: 'm',
                  appearance: _appearance('informative'),
                  semanticsLabel: 'Call REFERS',
                ),
                SizedBox(width: _space(context, '2')),
                Expanded(
                  child: OneUiText(
                    text: 'Call REFERS',
                    variant: OneUiTextVariant.title,
                    size: 's',
                    weight: OneUiTextWeight.high,
                  ),
                ),
              ],
            ),
          SizedBox(height: _space(context, '2')),
          OneUiDivider(),
          SizedBox(height: _space(context, '2')),
          OneUiText(
            text: kPeopleFirstCallRefersHeadline,
            variant: OneUiTextVariant.body,
            size: 's',
            weight: OneUiTextWeight.high,
          ),
          SizedBox(height: _space(context, '2')),
          for (final line in kPeopleFirstCallRefersLines) ...[
            OneUiText(
              text: line,
              variant: OneUiTextVariant.body,
              size: 's',
              attention: OneUiTextAttention.medium,
            ),
            SizedBox(height: _space(context, '1')),
          ],
          OneUiButton(
            label: 'Call now',
            variant: OneUiButtonVariant.bold,
            appearance: _appearance('informative'),
            size: 8,
            fullWidth: _isCompactPortalLayout(context),
            start: const OneUiIcon(
              icon: 'phone',
              size: '4',
              excludeFromSemantics: true,
            ),
            onPressed: () {
              setState(
                () => _searchError = 'Demo: REFERS helpline would open dialler',
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _profile(BuildContext context) {
    final pad = _space(context, '4');
    final narrow = _isCompactPortalLayout(context);
    final avatar = OneUiIndicatorBadgeOverlay(
      hostSide: _space(context, '16'),
      anchor: OneUiIndicatorBadgeOverlayAnchor.bottomEnd,
      indicatorSize: 's',
      host: OneUiAvatar(
        content: OneUiAvatarContent.text,
        size: '2xl',
        appearance: 'auto',
        alt: 'SP',
      ),
      indicator: const OneUiIndicatorBadge(
        size: 's',
        appearance: 'positive',
        semanticsLabel: 'Profile verified',
      ),
    );
    final basicInfo = Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Row(
          children: [
            Expanded(
              child: OneUiText(
                text: 'Basic Info',
                variant: OneUiTextVariant.title,
                size: 'm',
                weight: OneUiTextWeight.high,
              ),
            ),
            OneUiIconButton(
              icon: 'create',
              semanticsLabel: 'Edit basic info',
              variant: OneUiIconButtonVariant.ghost,
              size: 8,
              onPressed: () {
                setState(
                  () => _searchError = 'Demo: profile edit is not connected',
                );
              },
            ),
          ],
        ),
        SizedBox(height: _space(context, '2')),
        Row(
          children: [
            const OneUiIcon(
              icon: 'location',
              size: '4',
              excludeFromSemantics: true,
            ),
            SizedBox(width: _space(context, '1')),
            Expanded(
              child: OneUiText(
                text: kPeopleFirstLocation,
                variant: OneUiTextVariant.body,
                size: 's',
              ),
            ),
          ],
        ),
        SizedBox(height: _space(context, '3')),
        OneUiInputDynamicText(content: kPeopleFirstEmail),
        OneUiInputDynamicText(content: kPeopleFirstPhone),
        SizedBox(height: _space(context, '3')),
        OneUiInputField(
          label: 'Employee ID',
          value: kPeopleFirstEmployeeId,
          readOnly: true,
          size: 10,
          fullWidth: true,
        ),
        SizedBox(height: _space(context, '3')),
        OneUiCheckboxField(
          label: 'Email me payslip notifications',
          checked: _emailAlerts,
          onCheckedChange: (v) => setState(() => _emailAlerts = v),
        ),
        OneUiCheckboxField(
          label: 'SMS alerts for leave approvals',
          checked: _smsAlerts,
          onCheckedChange: (v) => setState(() => _smsAlerts = v),
        ),
      ],
    );

    return ListView(
      padding: EdgeInsets.all(pad),
      children: [
        if (!_useSidebar(context)) ...[
          _mobileSearch(context),
          SizedBox(height: _space(context, '3')),
        ],
        Row(
          children: [
            Expanded(
              child: OneUiText(
                text: 'My Profile',
                variant: OneUiTextVariant.headline,
                size: 's',
                weight: OneUiTextWeight.high,
              ),
            ),
            OneUiIconButton(
              icon: 'download',
              semanticsLabel: 'Download profile',
              variant: OneUiIconButtonVariant.ghost,
              size: 8,
              onPressed: () {
                setState(
                  () => _searchError = 'Demo: profile download started',
                );
              },
            ),
          ],
        ),
        SizedBox(height: _space(context, '3')),
        OneUiSurface(
          mode: 'elevated',
          padding: EdgeInsets.all(_space(context, '4')),
          borderRadius: BorderRadius.circular(_space(context, '2')),
          child: narrow
              ? Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Center(child: avatar),
                    SizedBox(height: _space(context, '4')),
                    basicInfo,
                  ],
                )
              : Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    avatar,
                    SizedBox(width: _space(context, '4')),
                    Expanded(child: basicInfo),
                  ],
                ),
        ),
        SizedBox(height: _space(context, '3')),
        OneUiInputField(
          label: 'Profile note',
          placeholder: 'Add a short bio',
          value: _profileNote,
          onChanged: (v) => setState(() => _profileNote = v),
          dynamicText: '${_profileNote.length}/120 characters',
          size: 10,
          fullWidth: true,
        ),
        SizedBox(height: _space(context, '16')),
      ],
    );
  }

  Widget _benefits(BuildContext context) {
    final pad = _space(context, '4');
    final gap = _space(context, '3');
    return ListView(
      padding: EdgeInsets.all(pad),
      children: [
        if (!_useSidebar(context)) ...[
          _mobileSearch(context),
          SizedBox(height: gap),
        ],
        OneUiText(
          text: 'Home  >  Benefits',
          variant: OneUiTextVariant.label,
          size: 'xs',
          attention: OneUiTextAttention.medium,
        ),
        SizedBox(height: _space(context, '2')),
        OneUiText(
          text: 'Benefits',
          variant: OneUiTextVariant.headline,
          size: 's',
          weight: OneUiTextWeight.high,
        ),
        SizedBox(height: gap),
        OneUiChipGroup(
          size: 'xs',
          containerType: 'inline',
          value: [_benefitFilter],
          onValueChange: (v) => setState(
            () => _benefitFilter = v.isEmpty ? 'all' : v.first,
          ),
          children: [
            OneUiChip(value: 'all', child: 'All'),
            OneUiChip(value: 'health', child: 'Health'),
            OneUiChip(value: 'insurance', child: 'Insurance'),
            OneUiChip(value: 'wellness', child: 'Wellness'),
          ],
        ),
        SizedBox(height: _space(context, '2')),
        OneUiCheckbox(
          label: 'Include inactive benefit plans',
          checked: _includeInactiveBenefits,
          onCheckedChange: (v) => setState(() => _includeInactiveBenefits = v),
          appearance: _appearance('informative'),
          size: 's',
        ),
        SizedBox(height: gap),
        _benefitTiles(context),
        SizedBox(height: gap),
        OneUiRadioField(
          label: 'Primary benefit plan',
          fullWidth: true,
          defaultValue: _benefitPlan,
          onValueChange: (v) => setState(() => _benefitPlan = v),
          children: [
            OneUiRadio(label: 'Health & Wellness', value: 'health'),
            OneUiRadio(label: 'Vehicle allowance', value: 'vehicle'),
            OneUiRadio(label: 'Mobile reimbursement', value: 'mobile'),
          ],
        ),
        SizedBox(height: gap),
        _benefitDetailCard(
          context,
          title: 'Retiral Benefits',
          body:
              'To check your PF balance, please visit the EPFO portal. PeopleFirst does not store retiral balances.',
          actionLabel: 'View Retirals Benefits Details',
        ),
        SizedBox(height: gap),
        _benefitDetailCard(
          context,
          title: 'Insurance Coverage, Claims and PME',
          body:
              'GHP and MMP: ₹ 5,00,000.00 · GTLI: ₹ 20,00,000.00 · GPA: ₹ 10,00,000.00',
          actionLabel: 'Claim',
        ),
        SizedBox(height: gap),
        _benefitDetailCard(
          context,
          title: 'MediBuddy',
          body:
              'Insurance support: 022-4936-9999 · Mobile: 022-4936-9999 · Email: insurance@ril.com',
          actionLabel: 'View Hospitals List',
        ),
        SizedBox(height: _space(context, '16')),
      ],
    );
  }

  Widget _benefitTiles(BuildContext context) {
    final gap = _space(context, '3');
    final tileW = _isCompactPortalLayout(context)
        ? _space(context, '32')
        : _space(context, '28');

    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          for (final tile in kPeopleFirstBenefitTiles) ...[
            SizedBox(
              width: tileW,
              child: _benefitTile(context, tile),
            ),
            SizedBox(width: gap),
          ],
        ],
      ),
    );
  }

  Widget _benefitTile(BuildContext context, PfBenefitTile tile) {
    return OneUiSurface(
      mode: 'bold',
      padding: EdgeInsets.all(_space(context, '3')),
      borderRadius: BorderRadius.circular(_space(context, '2')),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          OneUiText(
            text: tile.title,
            variant: OneUiTextVariant.title,
            size: 'xs',
            weight: OneUiTextWeight.high,
            appearance: tile.appearance,
            maxLines: 2,
          ),
          if (tile.amount != null) ...[
            SizedBox(height: _space(context, '2')),
            OneUiText(
              text: tile.amount!,
              variant: OneUiTextVariant.headline,
              size: 's',
              weight: OneUiTextWeight.high,
              appearance: tile.appearance,
            ),
          ],
          if (tile.subtitle != null) ...[
            SizedBox(height: _space(context, '2')),
            OneUiText(
              text: tile.subtitle!,
              variant: OneUiTextVariant.body,
              size: '2xs',
              appearance: tile.appearance,
              maxLines: 4,
            ),
          ],
          SizedBox(height: _space(context, '3')),
          Align(
            alignment: AlignmentDirectional.bottomEnd,
            child: OneUiIconContained(
              icon: tile.icon,
              size: 'm',
              appearance: tile.appearance,
              semanticsLabel: tile.title,
            ),
          ),
        ],
      ),
    );
  }

  Widget _benefitDetailCard(
    BuildContext context, {
    required String title,
    required String body,
    required String actionLabel,
  }) {
    final compact = _isCompactPortalLayout(context);
    return OneUiSurface(
      mode: 'elevated',
      padding: EdgeInsets.all(_space(context, '3')),
      borderRadius: BorderRadius.circular(_space(context, '2')),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          OneUiSurface(
            mode: 'bold',
            padding: EdgeInsets.all(_space(context, '2')),
            borderRadius: BorderRadius.circular(_space(context, '1')),
            child: OneUiText(
              text: title,
              variant: OneUiTextVariant.title,
              size: 's',
              weight: OneUiTextWeight.high,
              appearance: _appearance('informative'),
            ),
          ),
          SizedBox(height: _space(context, '2')),
          OneUiText(
            text: body,
            variant: OneUiTextVariant.body,
            size: 's',
            attention: OneUiTextAttention.medium,
          ),
          SizedBox(height: _space(context, '3')),
          OneUiButton(
            label: actionLabel,
            variant: OneUiButtonVariant.bold,
            appearance: _appearance('informative'),
            size: 8,
            fullWidth: compact,
            onPressed: () {
              setState(
                () => _searchError = 'Demo: $actionLabel tapped',
              );
            },
          ),
        ],
      ),
    );
  }
}
