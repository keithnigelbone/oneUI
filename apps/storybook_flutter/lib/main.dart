import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter/material.dart';
import 'package:ui_flutter/storybook.dart';

import 'convex_brands.dart';
import 'storybook_accessibility_sheet.dart';
import 'storybook_a11y_runner.dart';
import 'storybook_canvas_chrome.dart';
import 'storybook_convex_env.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  // Same Jio catalog as web Storybook (`jio-icons-data.json` + semantic → Ic* map).
  await JioIconCatalog.instance.ensureLoaded();
  final convexUrl = await resolveStorybookConvexUrl();
  runApp(StorybookApp(convexUrl: convexUrl));
}

/// Flutter Storybook — layout parity with web manager + foundations sidebar.
class StorybookApp extends StatefulWidget {
  const StorybookApp({super.key, required this.convexUrl});

  /// From `.env.local` / `dart-define` (see [resolveStorybookConvexUrl]).
  final String convexUrl;

  @override
  State<StorybookApp> createState() => _StorybookAppState();
}

class _StorybookAppState extends State<StorybookApp> {
  String _brandId = '';
  List<StorybookBrand> _brands = const [];
  bool _brandsLoading = true;
  BrandsListStatus _brandsListStatus = BrandsListStatus.ok;

  /// V2 platform id fed to [OneUiBrandScope.platformId] (story column width).
  String _v2PlatformForScope = 'L';

  StoryNav _nav = StoryNav.typAllRoles;
  ButtonFoundationStory _buttonStory = ButtonFoundationStory.docs;
  IconFoundationStory _iconStory = IconFoundationStory.docs;
  IconContainedFoundationStory _iconContainedStory = IconContainedFoundationStory.docs;
  IconButtonFoundationStory _iconButtonStory = IconButtonFoundationStory.docs;
  SelectableSingleTextButtonFoundationStory _selectableSingleTextButtonStory =
      SelectableSingleTextButtonFoundationStory.docs;
  SelectableIconButtonFoundationStory _selectableIconButtonStory =
      SelectableIconButtonFoundationStory.docs;
  SingleTextButtonFoundationStory _singleTextButtonStory =
      SingleTextButtonFoundationStory.docs;
  ChipFoundationStory _chipStory = ChipFoundationStory.docs;
  SelectableButtonFoundationStory _selectableButtonStory =
      SelectableButtonFoundationStory.docs;
  ChipGroupFoundationStory _chipGroupStory = ChipGroupFoundationStory.docs;
  AvatarFoundationStory _avatarStory = AvatarFoundationStory.docs;
  BadgeFoundationStory _badgeStory = BadgeFoundationStory.docs;
  CounterBadgeFoundationStory _counterBadgeStory = CounterBadgeFoundationStory.docs;
  IndicatorBadgeFoundationStory _indicatorBadgeStory = IndicatorBadgeFoundationStory.docs;
  TextFoundationStory _textStory = TextFoundationStory.docs;
  ImageFoundationStory _imageStory = ImageFoundationStory.docs;
  LogoFoundationStory _logoStory = LogoFoundationStory.docs;
  BottomNavigationFoundationStory _bottomNavigationStory =
      BottomNavigationFoundationStory.docs;
  DividerFoundationStory _dividerStory = DividerFoundationStory.docs;
  InputFoundationStory _inputStory = InputFoundationStory.docs;
  InputFieldFoundationStory _inputFieldStory = InputFieldFoundationStory.docs;
  RadioFoundationStory _radioStory = RadioFoundationStory.docs;
  RadioFieldFoundationStory _radioFieldStory = RadioFieldFoundationStory.docs;
  CheckboxFoundationStory _checkboxStory = CheckboxFoundationStory.docs;
  CheckboxFieldFoundationStory _checkboxFieldStory = CheckboxFieldFoundationStory.docs;
  /// Persists sidebar [ExpansionTile] open/closed across brand reloads and rebuilds.
  final Map<String, ExpansibleController> _navExpansionControllers = {};

  CircularProgressIndicatorFoundationStory _circularProgressIndicatorStory =
      CircularProgressIndicatorFoundationStory.docs;
  SliderFoundationStory _sliderStory = SliderFoundationStory.docs;
  TouchSliderFoundationStory _touchSliderStory = TouchSliderFoundationStory.docs;
  LinearProgressIndicatorFoundationStory _linearProgressIndicatorStory =
      LinearProgressIndicatorFoundationStory.docs;
  InputInternalsComponent? _inputInternalsComponent;
  InputDynamicTextFoundationStory _inputDynamicTextStory =
      InputDynamicTextFoundationStory.docs;
  InputFeedbackFoundationStory _inputFeedbackStory = InputFeedbackFoundationStory.docs;
  String _foundationPlatform = 'web';
  String _breakpoint = 'responsive';
  String _density = 'default';
  ThemeMode _themeMode = ThemeMode.light;
  /// Yellow **Semantics** overlay (TalkBack/VoiceOver tree) — Flutter equivalent of DOM inspection.
  bool _storybookSemanticsDebugger = false;

  /// Convex `nativeTheme:getNativeThemeSnapshot` `platform` (`mobile`|`tablet`|`desktop`).
  ///
  /// For **Responsive** canvases we set this **after layout** from the story column width
  /// (`viewportToV2PlatformId` → [nativeThemePlatformArgFromV2Id]) so the snapshot's
  /// `buildNativeTheme` platform matches [OneUiScope.platformId] — same idea as web
  /// Storybook matching `generateDimensionCSS` to the preview `[data-Breakpoint]`.
  ///
  /// When null + responsive, we fetch `desktop` once as a wide default until the first
  /// frame reports width (avoids permanently pinning `mobile` on wide layouts).
  String? _nativeConvexPlatformArg;

  @override
  void initState() {
    super.initState();
    fetchBrandsList(widget.convexUrl).then((result) {
      if (!mounted) return;
      setState(() {
        _brands = result.brands;
        _brandsListStatus = result.status;
        _brandsLoading = false;
        if (_brandId.isNotEmpty && !result.brands.any((b) => b.id == _brandId)) {
          _brandId = '';
        }
      });
    });
  }

  /// Engine `platform` for `nativeTheme:getNativeThemeSnapshot` (toolbar breakpoint → mobile/tablet/desktop).
  String _nativeSnapshotPlatformFromToolbar() {
    if (_breakpoint == 'responsive') {
      return _nativeConvexPlatformArg ?? 'desktop';
    }
    final w = int.tryParse(_breakpoint) ?? 360;
    return nativeThemePlatformArgFromV2Id(v2PlatformFromBreakpointWidth(w));
  }

  void _applyNativeConvexPlatformArg(String plat) {
    if (!mounted) return;
    if (_breakpoint != 'responsive') return;
    if (plat == _nativeConvexPlatformArg) return;
    setState(() => _nativeConvexPlatformArg = plat);
  }

  void _syncV2PlatformForScope(String v2) {
    if (_v2PlatformForScope == v2) return;
    setState(() => _v2PlatformForScope = v2);
  }

  void _setBrand(String? id) {
    setState(() {
      _brandId = id ?? '';
      if (_brandId.isEmpty || _breakpoint == 'responsive') {
        _nativeConvexPlatformArg = null;
      }
      if (_breakpoint != 'responsive') {
        _v2PlatformForScope = v2PlatformFromBreakpointWidth(
          int.tryParse(_breakpoint) ?? 360,
        );
      }
    });
  }

  String get _convexTheme => _themeMode == ThemeMode.dark ? 'dark' : 'light';

  bool _isDensityNav(StoryNav n) {
    switch (n) {
      case StoryNav.densitySpacingSideBySide:
      case StoryNav.densityTypographySideBySide:
      case StoryNav.densityFStepMatrix:
        return true;
      default:
        return false;
    }
  }

  bool _isTypographyNav(StoryNav n) {
    switch (n) {
      case StoryNav.typAllRoles:
      case StoryNav.typWeights:
      case StoryNav.typFontSlots:
        return true;
      default:
        return false;
    }
  }

  bool _isDimensionsNav(StoryNav n) {
    switch (n) {
      case StoryNav.dimFStep:
      case StoryNav.dimSpacing:
      case StoryNav.dimGrid:
      case StoryNav.dimPlatformMatrix:
        return true;
      default:
        return false;
    }
  }

  bool _isSurfacesNav(StoryNav n) {
    switch (n) {
      case StoryNav.surfacesAllModes:
      case StoryNav.surfacesNestedStacking:
      case StoryNav.surfacesOnBoldInversion:
        return true;
      default:
        return false;
    }
  }

  bool _isStrokesNav(StoryNav n) {
    switch (n) {
      case StoryNav.strokesStatic:
      case StoryNav.strokesDynamic:
      case StoryNav.strokesAll:
        return true;
      default:
        return false;
    }
  }

  bool _isAppearanceNav(StoryNav n) {
    switch (n) {
      case StoryNav.appearanceBackgroundGrid:
      case StoryNav.appearanceButtonsByRole:
        return true;
      default:
        return false;
    }
  }

  bool _isButtonNav(StoryNav n) => n == StoryNav.componentsButton;

  bool _isIconNav(StoryNav n) => n == StoryNav.componentsIcon;

  bool _isIconContainedNav(StoryNav n) => n == StoryNav.componentsIconContained;

  bool _isIconButtonNav(StoryNav n) => n == StoryNav.componentsIconButton;
  bool _isSingleTextButtonNav(StoryNav n) =>
      n == StoryNav.componentsSingleTextButton;

  bool _isSelectableIconButtonNav(StoryNav n) =>
      n == StoryNav.componentsSelectableIconButton;

  bool _isSelectableSingleTextButtonNav(StoryNav n) =>
      n == StoryNav.componentsSelectableSingleTextButton;

  bool _isChipNav(StoryNav n) => n == StoryNav.componentsChip;

  bool _isSelectableButtonNav(StoryNav n) =>
      n == StoryNav.componentsSelectableButton;

  bool _isChipGroupNav(StoryNav n) => n == StoryNav.componentsChipGroup;

  bool _isAvatarNav(StoryNav n) => n == StoryNav.componentsAvatar;

  bool _isBadgeNav(StoryNav n) => n == StoryNav.componentsBadge;

  bool _isCounterBadgeNav(StoryNav n) => n == StoryNav.componentsCounterBadge;

  bool _isIndicatorBadgeNav(StoryNav n) => n == StoryNav.componentsIndicatorBadge;

  bool _isTextNav(StoryNav n) => n == StoryNav.componentsText;

  bool _isImageNav(StoryNav n) => n == StoryNav.componentsImage;

  bool _isLogoNav(StoryNav n) => n == StoryNav.componentsLogo;

  bool _isBottomNavigationNav(StoryNav n) =>
      n == StoryNav.componentsBottomNavigation;

  bool _isDividerNav(StoryNav n) => n == StoryNav.componentsDivider;

  bool _isInputNav(StoryNav n) => n == StoryNav.componentsInput;

  bool _isInputFieldNav(StoryNav n) => n == StoryNav.componentsInputField;

  bool _isRadioNav(StoryNav n) => n == StoryNav.componentsRadio;
  bool _isRadioFieldNav(StoryNav n) => n == StoryNav.componentsRadioField;
  bool _isCheckboxNav(StoryNav n) => n == StoryNav.componentsCheckbox;
  bool _isCheckboxFieldNav(StoryNav n) => n == StoryNav.componentsCheckboxField;

  bool _isCircularProgressIndicatorNav(StoryNav n) =>
      n == StoryNav.componentsCircularProgressIndicator;

  bool _isSliderNav(StoryNav n) => n == StoryNav.componentsSlider;

  bool _isTouchSliderNav(StoryNav n) => n == StoryNav.componentsTouchSlider;

  bool _isLinearProgressIndicatorNav(StoryNav n) =>
      n == StoryNav.componentsLinearProgressIndicator;

  StorybookBrand? get _selectedBrand {
    for (final b in _brands) {
      if (b.id == _brandId) return b;
    }
    return null;
  }

  /// Effective V2 platform for the story canvas (inner pane width when responsive).
  String _effectiveV2Platform(double mainPaneWidth) {
    if (_breakpoint == 'responsive') {
      return viewportToV2PlatformId(mainPaneWidth);
    }
    return v2PlatformFromBreakpointWidth(int.tryParse(_breakpoint) ?? 360);
  }

  Widget _pageForNav(StoryNav nav) {
    switch (nav) {
      case StoryNav.typAllRoles:
        return const TypographyAllRolesPage();
      case StoryNav.typWeights:
        return const TypographyWeightsPage();
      case StoryNav.typFontSlots:
        return const TypographyFontSlotsPage();
      case StoryNav.densitySpacingSideBySide:
        return const DensitySpacingSideBySidePage();
      case StoryNav.densityTypographySideBySide:
        return const DensityTypographySideBySidePage();
      case StoryNav.densityFStepMatrix:
        return const DensityFStepMatrixPage();
      case StoryNav.dimFStep:
        return const DimensionsFStepScalePage();
      case StoryNav.dimSpacing:
        return const DimensionsSpacingTokensPage();
      case StoryNav.dimGrid:
        return const DimensionsGridTokensPage();
      case StoryNav.dimPlatformMatrix:
        return const DimensionsPlatformMatrixPage();
      case StoryNav.surfacesAllModes:
        return const SurfacesFoundationsPage(story: SurfacesFoundationStory.allModes);
      case StoryNav.surfacesNestedStacking:
        return const SurfacesFoundationsPage(story: SurfacesFoundationStory.nestedStacking);
      case StoryNav.surfacesOnBoldInversion:
        return const SurfacesFoundationsPage(story: SurfacesFoundationStory.onBoldInversion);
      case StoryNav.appearanceBackgroundGrid:
        return const AppearanceBackgroundGridPage();
      case StoryNav.appearanceButtonsByRole:
        return const AppearanceButtonsByRolePage();
      case StoryNav.strokesStatic:
        return const StrokesFoundationsPage(story: StrokesFoundationStory.staticStrokes);
      case StoryNav.strokesDynamic:
        return const StrokesFoundationsPage(story: StrokesFoundationStory.dynamicStrokes);
      case StoryNav.strokesAll:
        return const StrokesFoundationsPage(story: StrokesFoundationStory.allStrokes);
      case StoryNav.componentsButton:
        if (_buttonStory == ButtonFoundationStory.docs) {
          return const ButtonDocsPage();
        }
        if (_buttonStory == ButtonFoundationStory.defaultStory) {
          return const ButtonDefaultStoryPage();
        }
        return ButtonFoundationsPage(story: _buttonStory);
      case StoryNav.componentsIcon:
        if (_iconStory == IconFoundationStory.docs) {
          return const IconDocsPage();
        }
        if (_iconStory == IconFoundationStory.defaultStory) {
          return const IconDefaultStoryPage();
        }
        return IconFoundationsPage(story: _iconStory);
      case StoryNav.componentsIconContained:
        if (_iconContainedStory == IconContainedFoundationStory.docs) {
          return const IconContainedDocsPage();
        }
        if (_iconContainedStory == IconContainedFoundationStory.defaultStory ||
            _iconContainedStory == IconContainedFoundationStory.interactive) {
          return const IconContainedDefaultStoryPage();
        }
        return IconContainedFoundationsPage(story: _iconContainedStory);
      case StoryNav.componentsIconButton:
        if (_iconButtonStory == IconButtonFoundationStory.docs) {
          return const IconButtonDocsPage();
        }
        if (_iconButtonStory == IconButtonFoundationStory.defaultStory) {
          return const IconButtonDefaultStoryPage();
        }
        if (_iconButtonStory == IconButtonFoundationStory.interactive) {
          return const IconButtonDefaultStoryPage();
        }
        return IconButtonFoundationsPage(story: _iconButtonStory);
      case StoryNav.componentsSelectableSingleTextButton:
        if (_selectableSingleTextButtonStory ==
            SelectableSingleTextButtonFoundationStory.docs) {
          return const SelectableSingleTextButtonDocsPage();
        }
        if (_selectableSingleTextButtonStory ==
                SelectableSingleTextButtonFoundationStory.defaultStory ||
            _selectableSingleTextButtonStory ==
                SelectableSingleTextButtonFoundationStory.interactive) {
          return const SelectableSingleTextButtonDefaultStoryPage();
        }
        return SelectableSingleTextButtonFoundationsPage(
          story: _selectableSingleTextButtonStory,
        );
      case StoryNav.componentsSelectableIconButton:
        if (_selectableIconButtonStory ==
            SelectableIconButtonFoundationStory.docs) {
          return const SelectableIconButtonDocsPage();
        }
        if (_selectableIconButtonStory ==
                SelectableIconButtonFoundationStory.defaultStory ||
            _selectableIconButtonStory ==
                SelectableIconButtonFoundationStory.interactive) {
          return const SelectableIconButtonDefaultStoryPage();
        }
        return SelectableIconButtonFoundationsPage(
            story: _selectableIconButtonStory);
      case StoryNav.componentsSingleTextButton:
        if (_singleTextButtonStory == SingleTextButtonFoundationStory.docs) {
          return const SingleTextButtonDocsPage();
        }
        if (_singleTextButtonStory ==
                SingleTextButtonFoundationStory.defaultStory ||
            _singleTextButtonStory ==
                SingleTextButtonFoundationStory.interactive) {
          return const SingleTextButtonDefaultStoryPage();
        }
        return SingleTextButtonFoundationsPage(story: _singleTextButtonStory);
      case StoryNav.componentsChip:
        if (_chipStory == ChipFoundationStory.docs) {
          return const ChipDocsPage();
        }
        if (_chipStory == ChipFoundationStory.defaultStory ||
            _chipStory == ChipFoundationStory.interactive) {
          return const ChipDefaultStoryPage();
        }
        return ChipFoundationsPage(story: _chipStory);
      case StoryNav.componentsSelectableButton:
        if (_selectableButtonStory == SelectableButtonFoundationStory.docs) {
          return const SelectableButtonDocsPage();
        }
        if (_selectableButtonStory ==
                SelectableButtonFoundationStory.defaultStory ||
            _selectableButtonStory ==
                SelectableButtonFoundationStory.interactive) {
          return const SelectableButtonDefaultStoryPage();
        }
        return SelectableButtonFoundationsPage(story: _selectableButtonStory);
      case StoryNav.componentsChipGroup:
        if (_chipGroupStory == ChipGroupFoundationStory.docs) {
          return const ChipGroupDocsPage();
        }
        if (_chipGroupStory == ChipGroupFoundationStory.defaultStory) {
          return const ChipGroupDefaultStoryPage();
        }
        return ChipGroupFoundationsPage(story: _chipGroupStory);
      case StoryNav.componentsAvatar:
        if (_avatarStory == AvatarFoundationStory.docs) {
          return const AvatarDocsPage();
        }
        if (_avatarStory == AvatarFoundationStory.defaultStory ||
            _avatarStory == AvatarFoundationStory.interactive) {
          return const AvatarDefaultStoryPage();
        }
        return AvatarFoundationsPage(story: _avatarStory);
      case StoryNav.componentsBadge:
        if (_badgeStory == BadgeFoundationStory.docs) {
          return const BadgeDocsPage();
        }
        if (_badgeStory == BadgeFoundationStory.defaultStory ||
            _badgeStory == BadgeFoundationStory.interactive) {
          return const BadgeDefaultStoryPage();
        }
        return BadgeFoundationsPage(story: _badgeStory);
      case StoryNav.componentsCounterBadge:
        if (_counterBadgeStory == CounterBadgeFoundationStory.docs) {
          return const CounterBadgeDocsPage();
        }
        if (_counterBadgeStory == CounterBadgeFoundationStory.defaultStory ||
            _counterBadgeStory == CounterBadgeFoundationStory.interactive) {
          return const CounterBadgeDefaultStoryPage();
        }
        return CounterBadgeFoundationsPage(story: _counterBadgeStory);
      case StoryNav.componentsIndicatorBadge:
        if (_indicatorBadgeStory == IndicatorBadgeFoundationStory.docs) {
          return const IndicatorBadgeDocsPage();
        }
        if (_indicatorBadgeStory == IndicatorBadgeFoundationStory.defaultStory ||
            _indicatorBadgeStory == IndicatorBadgeFoundationStory.interactive) {
          return const IndicatorBadgeDefaultStoryPage();
        }
        return IndicatorBadgeFoundationsPage(story: _indicatorBadgeStory);
      case StoryNav.componentsText:
        if (_textStory == TextFoundationStory.docs) {
          return const TextDocsPage();
        }
        if (_textStory == TextFoundationStory.defaultStory) {
          return const TextDefaultStoryPage();
        }
        return TextFoundationsPage(story: _textStory);
      case StoryNav.componentsImage:
        if (_imageStory == ImageFoundationStory.docs) {
          return const ImageDocsPage();
        }
        if (_imageStory == ImageFoundationStory.defaultStory) {
          return const ImageDefaultStoryPage();
        }
        return ImageFoundationsPage(story: _imageStory);
      case StoryNav.componentsLogo:
        if (_logoStory == LogoFoundationStory.docs) {
          return const LogoDocsPage();
        }
        if (_logoStory == LogoFoundationStory.defaultStory) {
          return const LogoDefaultStoryPage();
        }
        if (_logoStory == LogoFoundationStory.interactive) {
          return const LogoInteractiveStoryPage();
        }
        return LogoFoundationsPage(story: _logoStory);
      case StoryNav.componentsBottomNavigation:
        if (_bottomNavigationStory == BottomNavigationFoundationStory.docs) {
          return const BottomNavigationDocsPage();
        }
        if (_bottomNavigationStory == BottomNavigationFoundationStory.defaultStory) {
          return const BottomNavigationDefaultStoryPage();
        }
        if (_bottomNavigationStory == BottomNavigationFoundationStory.interactive) {
          return const BottomNavigationInteractiveStoryPage();
        }
        return BottomNavigationFoundationsPage(story: _bottomNavigationStory);
      case StoryNav.componentsDivider:
        if (_dividerStory == DividerFoundationStory.docs) {
          return const DividerDocsPage();
        }
        if (_dividerStory == DividerFoundationStory.defaultStory) {
          return const DividerDefaultStoryPage();
        }
        if (_dividerStory == DividerFoundationStory.interactive) {
          return const DividerInteractiveStoryPage();
        }
        return DividerFoundationsPage(story: _dividerStory);
      case StoryNav.componentsInput:
        if (_inputInternalsComponent == InputInternalsComponent.dynamicText) {
          if (_inputDynamicTextStory == InputDynamicTextFoundationStory.docs) {
            return const InputDynamicTextDocsPage();
          }
          if (_inputDynamicTextStory == InputDynamicTextFoundationStory.defaultStory) {
            return const InputDynamicTextDefaultStoryPage();
          }
          return InputDynamicTextFoundationsPage(story: _inputDynamicTextStory);
        }
        if (_inputInternalsComponent == InputInternalsComponent.feedback) {
          if (_inputFeedbackStory == InputFeedbackFoundationStory.docs) {
            return const InputFeedbackDocsPage();
          }
          if (_inputFeedbackStory == InputFeedbackFoundationStory.defaultStory) {
            return const InputFeedbackDefaultStoryPage();
          }
          return InputFeedbackFoundationsPage(story: _inputFeedbackStory);
        }
        if (_inputStory == InputFoundationStory.docs) {
          return const InputDocsPage();
        }
        if (_inputStory == InputFoundationStory.defaultStory) {
          return const InputDefaultStoryPage(preset: InputStoryPreset.defaultStory);
        }
        if (_inputStory == InputFoundationStory.withLabelAndDescription) {
          return const InputDefaultStoryPage(preset: InputStoryPreset.withLabelAndDescription);
        }
        if (_inputStory == InputFoundationStory.withExternalLabel) {
          return const InputDefaultStoryPage(preset: InputStoryPreset.withExternalLabel);
        }
        return InputFoundationsPage(story: _inputStory);
      case StoryNav.componentsInputField:
        if (_inputFieldStory == InputFieldFoundationStory.docs) {
          return const InputFieldDocsPage();
        }
        if (_inputFieldStory == InputFieldFoundationStory.defaultStory) {
          return const InputFieldDefaultStoryPage();
        }
        return InputFieldFoundationsPage(story: _inputFieldStory);
      case StoryNav.componentsRadio:
        if (_radioStory == RadioFoundationStory.docs) {
          return const RadioDocsPage();
        }
        if (_radioStory == RadioFoundationStory.defaultStory) {
          return const RadioDefaultStoryPage();
        }
        if (_radioStory == RadioFoundationStory.interactive) {
          return const RadioInteractiveStoryPage();
        }
        if (_radioStory == RadioFoundationStory.motion) {
          return const RadioMotionStoryPage();
        }
        return RadioFoundationsPage(story: _radioStory);
      case StoryNav.componentsRadioField:
        if (_radioFieldStory == RadioFieldFoundationStory.docs) {
          return const RadioFieldDocsPage();
        }
        if (_radioFieldStory == RadioFieldFoundationStory.defaultStory) {
          return const RadioFieldDefaultStoryPage();
        }
        return RadioFieldFoundationsPage(story: _radioFieldStory);
      case StoryNav.componentsCheckbox:
        if (_checkboxStory == CheckboxFoundationStory.docs) {
          return const CheckboxDocsPage();
        }
        if (_checkboxStory == CheckboxFoundationStory.defaultStory) {
          return const CheckboxDefaultStoryPage();
        }
        if (_checkboxStory == CheckboxFoundationStory.interactive) {
          return const CheckboxInteractiveStoryPage();
        }
        if (_checkboxStory == CheckboxFoundationStory.motion) {
          return const CheckboxMotionStoryPage();
        }
        return CheckboxFoundationsPage(story: _checkboxStory);
      case StoryNav.componentsCheckboxField:
        if (_checkboxFieldStory == CheckboxFieldFoundationStory.docs) {
          return const CheckboxFieldDocsPage();
        }
        if (_checkboxFieldStory == CheckboxFieldFoundationStory.defaultStory) {
          return const CheckboxFieldDefaultStoryPage();
        }
        return CheckboxFieldFoundationsPage(story: _checkboxFieldStory);
      case StoryNav.componentsCircularProgressIndicator:
        if (_circularProgressIndicatorStory ==
            CircularProgressIndicatorFoundationStory.docs) {
          return const CircularProgressIndicatorDocsPage();
        }
        if (_circularProgressIndicatorStory ==
            CircularProgressIndicatorFoundationStory.defaultStory) {
          return const CircularProgressIndicatorDefaultStoryPage();
        }
        if (_circularProgressIndicatorStory ==
            CircularProgressIndicatorFoundationStory.interactive) {
          return const CircularProgressIndicatorInteractiveStoryPage();
        }
        if (_circularProgressIndicatorStory ==
            CircularProgressIndicatorFoundationStory.motion) {
          return const CircularProgressIndicatorMotionStoryPage();
        }
        return CircularProgressIndicatorFoundationsPage(
          story: _circularProgressIndicatorStory,
        );
      case StoryNav.componentsSlider:
        if (_sliderStory == SliderFoundationStory.docs) {
          return const SliderDocsPage();
        }
        if (_sliderStory == SliderFoundationStory.defaultStory) {
          return const SliderDefaultStoryPage();
        }
        if (_sliderStory == SliderFoundationStory.interactive) {
          return const SliderInteractiveStoryPage();
        }
        return SliderFoundationsPage(story: _sliderStory);
      case StoryNav.componentsTouchSlider:
        if (_touchSliderStory == TouchSliderFoundationStory.docs) {
          return const TouchSliderDocsPage();
        }
        if (_touchSliderStory == TouchSliderFoundationStory.defaultStory) {
          return const TouchSliderDefaultStoryPage();
        }
        if (_touchSliderStory == TouchSliderFoundationStory.interactive) {
          return const TouchSliderInteractiveStoryPage();
        }
        return TouchSliderFoundationsPage(story: _touchSliderStory);
      case StoryNav.componentsLinearProgressIndicator:
        if (_linearProgressIndicatorStory ==
            LinearProgressIndicatorFoundationStory.docs) {
          return const LinearProgressIndicatorDocsPage();
        }
        if (_linearProgressIndicatorStory ==
            LinearProgressIndicatorFoundationStory.defaultStory) {
          return const LinearProgressIndicatorDefaultStoryPage();
        }
        if (_linearProgressIndicatorStory ==
            LinearProgressIndicatorFoundationStory.interactive) {
          return const LinearProgressIndicatorInteractiveStoryPage();
        }
        return LinearProgressIndicatorFoundationsPage(
          story: _linearProgressIndicatorStory,
        );
    }
  }

  String _pageTitle(StoryNav nav) {
    switch (nav) {
      case StoryNav.typAllRoles:
        return 'All roles';
      case StoryNav.typWeights:
        return 'Font weights';
      case StoryNav.typFontSlots:
        return 'Font slots';
      case StoryNav.densitySpacingSideBySide:
        return 'Spacing Side By Side';
      case StoryNav.densityTypographySideBySide:
        return 'Typography Side By Side';
      case StoryNav.densityFStepMatrix:
        return 'F Step Matrix';
      case StoryNav.dimFStep:
        return 'F-step scale';
      case StoryNav.dimSpacing:
        return 'Spacing tokens';
      case StoryNav.dimGrid:
        return 'Grid tokens';
      case StoryNav.dimPlatformMatrix:
        return 'Platform matrix';
      case StoryNav.surfacesAllModes:
        return 'All modes';
      case StoryNav.surfacesNestedStacking:
        return 'Nested stacking';
      case StoryNav.surfacesOnBoldInversion:
        return 'On bold inversion';
      case StoryNav.appearanceBackgroundGrid:
        return 'Background grid';
      case StoryNav.appearanceButtonsByRole:
        return 'Buttons by role';
      case StoryNav.strokesStatic:
        return 'Static strokes';
      case StoryNav.strokesDynamic:
        return 'Dynamic strokes';
      case StoryNav.strokesAll:
        return 'All strokes';
      case StoryNav.componentsButton:
        return _buttonStory.title;
      case StoryNav.componentsIcon:
        return _iconStory.title;
      case StoryNav.componentsIconContained:
        return _iconContainedStory.title;
      case StoryNav.componentsIconButton:
        return _iconButtonStory.title;
      case StoryNav.componentsSelectableSingleTextButton:
        return _selectableSingleTextButtonStory.title;
      case StoryNav.componentsSelectableIconButton:
        return _selectableIconButtonStory.title;
      case StoryNav.componentsSingleTextButton:
        return _singleTextButtonStory.title;
      case StoryNav.componentsChip:
        return _chipStory.title;
      case StoryNav.componentsSelectableButton:
        return _selectableButtonStory.title;
      case StoryNav.componentsChipGroup:
        return _chipGroupStory.title;
      case StoryNav.componentsAvatar:
        return _avatarStory.title;
      case StoryNav.componentsBadge:
        return _badgeStory.title;
      case StoryNav.componentsCounterBadge:
        return _counterBadgeStory.title;
      case StoryNav.componentsIndicatorBadge:
        return _indicatorBadgeStory.title;
      case StoryNav.componentsText:
        return _textStory.title;
      case StoryNav.componentsImage:
        return _imageStory.title;
      case StoryNav.componentsLogo:
        return _logoStory.title;
      case StoryNav.componentsBottomNavigation:
        return _bottomNavigationStory.title;
      case StoryNav.componentsDivider:
        return _dividerStory.title;
      case StoryNav.componentsInput:
        if (_inputInternalsComponent == InputInternalsComponent.dynamicText) {
          return _inputDynamicTextStory.title;
        }
        if (_inputInternalsComponent == InputInternalsComponent.feedback) {
          return _inputFeedbackStory.title;
        }
        return _inputStory.title;
      case StoryNav.componentsInputField:
        return _inputFieldStory.title;
      case StoryNav.componentsRadio:
        return _radioStory.title;
      case StoryNav.componentsRadioField:
        return _radioFieldStory.title;
      case StoryNav.componentsCheckbox:
        return _checkboxStory.title;
      case StoryNav.componentsCheckboxField:
        return _checkboxFieldStory.sidebarTitle;
      case StoryNav.componentsCircularProgressIndicator:
        return _circularProgressIndicatorStory.title;
      case StoryNav.componentsSlider:
        return _sliderStory.title;
      case StoryNav.componentsTouchSlider:
        return _touchSliderStory.title;
      case StoryNav.componentsLinearProgressIndicator:
        return _linearProgressIndicatorStory.title;
    }
  }

  String _pageBreadcrumb(StoryNav nav) {
    switch (nav) {
      case StoryNav.typAllRoles:
      case StoryNav.typWeights:
      case StoryNav.typFontSlots:
        return 'Foundations / Typography / ${_pageTitle(nav)}';
      case StoryNav.dimFStep:
      case StoryNav.dimSpacing:
      case StoryNav.dimGrid:
      case StoryNav.dimPlatformMatrix:
        return 'Foundations / Dimensions / ${_pageTitle(nav)}';
      case StoryNav.surfacesAllModes:
      case StoryNav.surfacesNestedStacking:
      case StoryNav.surfacesOnBoldInversion:
        return 'Foundations / Surfaces / ${_pageTitle(nav)}';
      case StoryNav.appearanceBackgroundGrid:
      case StoryNav.appearanceButtonsByRole:
        return 'Foundations / Appearance / ${_pageTitle(nav)}';
      case StoryNav.densitySpacingSideBySide:
      case StoryNav.densityTypographySideBySide:
      case StoryNav.densityFStepMatrix:
        return 'Foundations / Density / ${_pageTitle(nav)}';
      case StoryNav.strokesStatic:
      case StoryNav.strokesDynamic:
      case StoryNav.strokesAll:
        return 'Foundations / Strokes / ${_pageTitle(nav)}';
      case StoryNav.componentsButton:
        return 'Components / Actions / Button / ${_buttonStory.title}';
      case StoryNav.componentsIcon:
        return 'Components / Media / Icon / ${_iconStory.title}';
      case StoryNav.componentsIconContained:
        return 'Components / Media / IconContained / ${_iconContainedStory.title}';
      case StoryNav.componentsIconButton:
        return 'Components / Actions / IconButton / ${_iconButtonStory.title}';
      case StoryNav.componentsSelectableSingleTextButton:
        return 'Components / Actions / SelectableSingleTextButton / '
            '${_selectableSingleTextButtonStory.title}';
      case StoryNav.componentsSelectableIconButton:
        return 'Components / Actions / SelectableIconButton / ${_selectableIconButtonStory.title}';
      case StoryNav.componentsSingleTextButton:
        return 'Components / Actions / SingleTextButton / ${_singleTextButtonStory.title}';
      case StoryNav.componentsChip:
        return 'Components / Actions / Chip / ${_chipStory.title}';
      case StoryNav.componentsSelectableButton:
        return 'Components / Actions / SelectableButton / ${_selectableButtonStory.title}';
      case StoryNav.componentsChipGroup:
        return 'Components / Actions / ChipGroup / ${_chipGroupStory.title}';
      case StoryNav.componentsAvatar:
        return 'Components / Data Display / Avatar / ${_avatarStory.title}';
      case StoryNav.componentsBadge:
        return 'Components / Display / Badge / ${_badgeStory.title}';
      case StoryNav.componentsCounterBadge:
        return 'Components / Display / CounterBadge / ${_counterBadgeStory.title}';
      case StoryNav.componentsIndicatorBadge:
        return 'Components / Display / IndicatorBadge / ${_indicatorBadgeStory.title}';
      case StoryNav.componentsText:
        return 'Components / Display / Text / ${_textStory.title}';
      case StoryNav.componentsImage:
        return 'Components / Media / Image / ${_imageStory.title}';
      case StoryNav.componentsLogo:
        return 'Components / Media / Logo / ${_logoStory.title}';
      case StoryNav.componentsBottomNavigation:
        return 'Components / Navigation / BottomNavigation / ${_bottomNavigationStory.title}';
      case StoryNav.componentsDivider:
        return 'Components / Layout / Divider / ${_dividerStory.title}';
      case StoryNav.componentsInput:
        if (_inputInternalsComponent == InputInternalsComponent.dynamicText) {
          return 'Components / Inputs / Input / Internals / InputDynamicText / '
              '${_inputDynamicTextStory.title}';
        }
        if (_inputInternalsComponent == InputInternalsComponent.feedback) {
          return 'Components / Inputs / Input / Internals / InputFeedback / '
              '${_inputFeedbackStory.title}';
        }
        return 'Components / Inputs / Input / ${_inputStory.title}';
      case StoryNav.componentsInputField:
        return 'Components / Inputs / InputField / ${_inputFieldStory.title}';
      case StoryNav.componentsRadio:
        return 'Components / Inputs / Radio / ${_radioStory.title}';
      case StoryNav.componentsRadioField:
        return 'Components / Inputs / RadioField / ${_radioFieldStory.title}';
      case StoryNav.componentsCheckbox:
        return 'Components / Inputs / Checkbox / ${_checkboxStory.title}';
      case StoryNav.componentsCheckboxField:
        return 'Components / Inputs / CheckboxField / ${_checkboxFieldStory.sidebarTitle}';
      case StoryNav.componentsCircularProgressIndicator:
        return 'Components / Feedback / CircularProgressIndicator / ${_circularProgressIndicatorStory.title}';
      case StoryNav.componentsSlider:
        return 'Components / Inputs / Slider / ${_sliderStory.title}';
      case StoryNav.componentsTouchSlider:
        return 'Components / Inputs / TouchSlider / ${_touchSliderStory.title}';
      case StoryNav.componentsLinearProgressIndicator:
        return 'Components / Feedback / LinearProgressIndicator / ${_linearProgressIndicatorStory.title}';
    }
  }

  Widget _canvasFrame({required String breakpoint, required Widget child}) {
    if (breakpoint == 'responsive') return child;
    final w = double.tryParse(breakpoint) ?? 360;
    return Align(
      alignment: Alignment.topCenter,
      child: ConstrainedBox(
        constraints: BoxConstraints(maxWidth: w),
        child: child,
      ),
    );
  }

  /// Indent [ExpansionTile] children so leaves read as nested under sections (not flush with titles).
  static const EdgeInsetsDirectional _navSectionChildrenInset =
      EdgeInsetsDirectional.only(start: 20, end: 8);

  static const EdgeInsetsDirectional _navComponentCategoryInset =
      EdgeInsetsDirectional.only(start: 16, end: 8);

  static const EdgeInsetsDirectional _navButtonTileInset =
      EdgeInsetsDirectional.only(start: 16);

  ExpansibleController _navExpansion(String key) =>
      _navExpansionControllers.putIfAbsent(key, ExpansibleController.new);

  ExpansionTile _storybookExpansionTile({
    required String expansionKey,
    required Widget title,
    required List<Widget> children,
    EdgeInsetsGeometry tilePadding = const EdgeInsets.symmetric(horizontal: 16),
    EdgeInsetsGeometry childrenPadding = _navSectionChildrenInset,
    void Function(bool expanded)? onExpansionChanged,
  }) {
    return ExpansionTile(
      controller: _navExpansion(expansionKey),
      tilePadding: tilePadding,
      childrenPadding: childrenPadding,
      title: title,
      onExpansionChanged: onExpansionChanged,
      children: children,
    );
  }

  Widget _buildSideNav(void Function()? onAfterTap) {
    void select(
      StoryNav n, {
      ButtonFoundationStory? buttonStory,
      IconFoundationStory? iconStory,
      IconContainedFoundationStory? iconContainedStory,
      IconButtonFoundationStory? iconButtonStory,
      SelectableSingleTextButtonFoundationStory? selectableSingleTextButtonStory,
      SelectableIconButtonFoundationStory? selectableIconButtonStory,
      SingleTextButtonFoundationStory? singleTextButtonStory,
      ChipFoundationStory? chipStory,
      SelectableButtonFoundationStory? selectableButtonStory,
      ChipGroupFoundationStory? chipGroupStory,
      AvatarFoundationStory? avatarStory,
      BadgeFoundationStory? badgeStory,
      CounterBadgeFoundationStory? counterBadgeStory,
      IndicatorBadgeFoundationStory? indicatorBadgeStory,
      TextFoundationStory? textStory,
      ImageFoundationStory? imageStory,
      LogoFoundationStory? logoStory,
      BottomNavigationFoundationStory? bottomNavigationStory,
      DividerFoundationStory? dividerStory,
      InputFoundationStory? inputStory,
      InputFieldFoundationStory? inputFieldStory,
      RadioFoundationStory? radioStory,
      RadioFieldFoundationStory? radioFieldStory,
      CheckboxFoundationStory? checkboxStory,
      CheckboxFieldFoundationStory? checkboxFieldStory,
      InputDynamicTextFoundationStory? inputDynamicTextStory,
      InputFeedbackFoundationStory? inputFeedbackStory,
      CircularProgressIndicatorFoundationStory? circularProgressIndicatorStory,
      SliderFoundationStory? sliderStory,
      TouchSliderFoundationStory? touchSliderStory,
      LinearProgressIndicatorFoundationStory? linearProgressIndicatorStory,
    }) {
      setState(() {
        _nav = n;
        if (buttonStory != null) _buttonStory = buttonStory;
        if (iconStory != null) _iconStory = iconStory;
        if (iconContainedStory != null) _iconContainedStory = iconContainedStory;
        if (iconButtonStory != null) _iconButtonStory = iconButtonStory;
        if (selectableSingleTextButtonStory != null) {
          _selectableSingleTextButtonStory = selectableSingleTextButtonStory;
        }
        if (selectableIconButtonStory != null) {
          _selectableIconButtonStory = selectableIconButtonStory;
        }
        if (singleTextButtonStory != null) {
          _singleTextButtonStory = singleTextButtonStory;
        }
        if (chipStory != null) _chipStory = chipStory;
        if (selectableButtonStory != null) {
          _selectableButtonStory = selectableButtonStory;
        }
        if (chipGroupStory != null) _chipGroupStory = chipGroupStory;
        if (avatarStory != null) _avatarStory = avatarStory;
        if (badgeStory != null) _badgeStory = badgeStory;
        if (counterBadgeStory != null) _counterBadgeStory = counterBadgeStory;
        if (indicatorBadgeStory != null) _indicatorBadgeStory = indicatorBadgeStory;
        if (textStory != null) _textStory = textStory;
        if (imageStory != null) _imageStory = imageStory;
        if (logoStory != null) _logoStory = logoStory;
        if (bottomNavigationStory != null) {
          _bottomNavigationStory = bottomNavigationStory;
        }
        if (dividerStory != null) _dividerStory = dividerStory;
        if (inputStory != null) {
          _inputStory = inputStory;
          _inputInternalsComponent = null;
        }
        if (inputFieldStory != null) _inputFieldStory = inputFieldStory;
        if (radioStory != null) _radioStory = radioStory;
        if (radioFieldStory != null) _radioFieldStory = radioFieldStory;
        if (checkboxStory != null) _checkboxStory = checkboxStory;
        if (checkboxFieldStory != null) _checkboxFieldStory = checkboxFieldStory;
        if (inputDynamicTextStory != null) {
          _inputDynamicTextStory = inputDynamicTextStory;
          _inputInternalsComponent = InputInternalsComponent.dynamicText;
        }
        if (inputFeedbackStory != null) {
          _inputFeedbackStory = inputFeedbackStory;
          _inputInternalsComponent = InputInternalsComponent.feedback;
        }
        if (circularProgressIndicatorStory != null) {
          _circularProgressIndicatorStory = circularProgressIndicatorStory;
        }
        if (sliderStory != null) _sliderStory = sliderStory;
        if (touchSliderStory != null) _touchSliderStory = touchSliderStory;
        if (linearProgressIndicatorStory != null) {
          _linearProgressIndicatorStory = linearProgressIndicatorStory;
        }
      });
      onAfterTap?.call();
    }

    void selectButton(ButtonFoundationStory story) {
      select(StoryNav.componentsButton, buttonStory: story);
    }

    void selectIcon(IconFoundationStory story) {
      select(StoryNav.componentsIcon, iconStory: story);
    }

    void selectIconContained(IconContainedFoundationStory story) {
      select(StoryNav.componentsIconContained, iconContainedStory: story);
    }

    void selectIconButton(IconButtonFoundationStory story) {
      select(StoryNav.componentsIconButton, iconButtonStory: story);
    }

    void selectSelectableSingleTextButton(
        SelectableSingleTextButtonFoundationStory story) {
      select(StoryNav.componentsSelectableSingleTextButton,
          selectableSingleTextButtonStory: story);
    }

    void selectSelectableIconButton(SelectableIconButtonFoundationStory story) {
      select(StoryNav.componentsSelectableIconButton,
          selectableIconButtonStory: story);
    }

    void selectSingleTextButton(SingleTextButtonFoundationStory story) {
      select(StoryNav.componentsSingleTextButton,
          singleTextButtonStory: story);
    }

    void selectChip(ChipFoundationStory story) {
      select(StoryNav.componentsChip, chipStory: story);
    }

    void selectSelectableButton(SelectableButtonFoundationStory story) {
      select(StoryNav.componentsSelectableButton,
          selectableButtonStory: story);
    }

    void selectChipGroup(ChipGroupFoundationStory story) {
      select(StoryNav.componentsChipGroup, chipGroupStory: story);
    }

    void selectAvatar(AvatarFoundationStory story) {
      select(StoryNav.componentsAvatar, avatarStory: story);
    }

    void selectBadge(BadgeFoundationStory story) {
      select(StoryNav.componentsBadge, badgeStory: story);
    }

    void selectCounterBadge(CounterBadgeFoundationStory story) {
      select(StoryNav.componentsCounterBadge, counterBadgeStory: story);
    }

    void selectIndicatorBadge(IndicatorBadgeFoundationStory story) {
      select(StoryNav.componentsIndicatorBadge, indicatorBadgeStory: story);
    }

    void selectText(TextFoundationStory story) {
      select(StoryNav.componentsText, textStory: story);
    }

    void selectImage(ImageFoundationStory story) {
      select(StoryNav.componentsImage, imageStory: story);
    }

    void selectLogo(LogoFoundationStory story) {
      select(StoryNav.componentsLogo, logoStory: story);
    }

    void selectBottomNavigation(BottomNavigationFoundationStory story) {
      select(StoryNav.componentsBottomNavigation, bottomNavigationStory: story);
    }

    void selectDivider(DividerFoundationStory story) {
      select(StoryNav.componentsDivider, dividerStory: story);
    }

    void selectInput(InputFoundationStory story) {
      select(StoryNav.componentsInput, inputStory: story);
    }

    void selectInputField(InputFieldFoundationStory story) {
      select(StoryNav.componentsInputField, inputFieldStory: story);
    }

    void selectRadio(RadioFoundationStory story) {
      select(StoryNav.componentsRadio, radioStory: story);
    }

    void selectRadioField(RadioFieldFoundationStory story) {
      select(StoryNav.componentsRadioField, radioFieldStory: story);
    }

    void selectCheckbox(CheckboxFoundationStory story) {
      select(StoryNav.componentsCheckbox, checkboxStory: story);
    }

    void selectCheckboxField(CheckboxFieldFoundationStory story) {
      select(StoryNav.componentsCheckboxField, checkboxFieldStory: story);
    }

    void selectCircularProgressIndicator(CircularProgressIndicatorFoundationStory story) {
      select(
        StoryNav.componentsCircularProgressIndicator,
        circularProgressIndicatorStory: story,
      );
    }

    void selectSlider(SliderFoundationStory story) {
      select(StoryNav.componentsSlider, sliderStory: story);
    }

    void selectTouchSlider(TouchSliderFoundationStory story) {
      select(StoryNav.componentsTouchSlider, touchSliderStory: story);
    }

    void selectLinearProgressIndicator(LinearProgressIndicatorFoundationStory story) {
      select(
        StoryNav.componentsLinearProgressIndicator,
        linearProgressIndicatorStory: story,
      );
    }

    void selectInputDynamicText(InputDynamicTextFoundationStory story) {
      select(StoryNav.componentsInput, inputDynamicTextStory: story);
    }

    void selectInputFeedback(InputFeedbackFoundationStory story) {
      select(StoryNav.componentsInput, inputFeedbackStory: story);
    }

    bool inputDynamicTextSelected(InputDynamicTextFoundationStory story) =>
        _nav == StoryNav.componentsInput &&
        _inputInternalsComponent == InputInternalsComponent.dynamicText &&
        _inputDynamicTextStory == story;

    bool inputFeedbackSelected(InputFeedbackFoundationStory story) =>
        _nav == StoryNav.componentsInput &&
        _inputInternalsComponent == InputInternalsComponent.feedback &&
        _inputFeedbackStory == story;

    Widget componentsCategoryTile(
      String label, {
      required String expansionKey,
      required List<Widget> children,
    }) {
      return _storybookExpansionTile(
        expansionKey: expansionKey,
        tilePadding: const EdgeInsets.symmetric(horizontal: 16),
        childrenPadding: _navComponentCategoryInset,
        title: Text(label, style: const TextStyle(fontWeight: FontWeight.w600)),
        children: children,
      );
    }

    return ListView(
      padding: const EdgeInsets.symmetric(vertical: 8),
      children: [
        const Padding(
          padding: EdgeInsets.fromLTRB(16, 8, 16, 4),
          child: Text(
            'FOUNDATIONS',
            style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, letterSpacing: 0.6),
          ),
        ),
        _storybookExpansionTile(
          expansionKey: 'foundations-typography',
          title: const Text('Typography'),
          onExpansionChanged: (expanded) {
            if (expanded && !_isTypographyNav(_nav)) {
              setState(() => _nav = StoryNav.typAllRoles);
            }
          },
          children: [
            _NavLeaf(
              label: 'All roles',
              selected: _nav == StoryNav.typAllRoles,
              dense: true,
              onTap: () => select(StoryNav.typAllRoles),
            ),
            _NavLeaf(
              label: 'Font weights',
              selected: _nav == StoryNav.typWeights,
              dense: true,
              onTap: () => select(StoryNav.typWeights),
            ),
            _NavLeaf(
              label: 'Font slots',
              selected: _nav == StoryNav.typFontSlots,
              dense: true,
              onTap: () => select(StoryNav.typFontSlots),
            ),
          ],
        ),
        _storybookExpansionTile(
          expansionKey: 'foundations-density',
          title: const Text('Density'),
          onExpansionChanged: (expanded) {
            if (expanded && !_isDensityNav(_nav)) {
              setState(() => _nav = StoryNav.densitySpacingSideBySide);
            }
          },
          children: [
            _NavLeaf(
              label: 'Spacing Side By Side',
              selected: _nav == StoryNav.densitySpacingSideBySide,
              dense: true,
              onTap: () => select(StoryNav.densitySpacingSideBySide),
            ),
            _NavLeaf(
              label: 'Typography Side By Side',
              selected: _nav == StoryNav.densityTypographySideBySide,
              dense: true,
              onTap: () => select(StoryNav.densityTypographySideBySide),
            ),
            _NavLeaf(
              label: 'F Step Matrix',
              selected: _nav == StoryNav.densityFStepMatrix,
              dense: true,
              onTap: () => select(StoryNav.densityFStepMatrix),
            ),
          ],
        ),
        _storybookExpansionTile(
          expansionKey: 'foundations-dimensions',
          title: const Text('Dimensions'),
          onExpansionChanged: (expanded) {
            if (expanded && !_isDimensionsNav(_nav)) {
              setState(() => _nav = StoryNav.dimFStep);
            }
          },
          children: [
            _NavLeaf(
              label: 'F-step scale',
              selected: _nav == StoryNav.dimFStep,
              dense: true,
              onTap: () => select(StoryNav.dimFStep),
            ),
            _NavLeaf(
              label: 'Spacing tokens',
              selected: _nav == StoryNav.dimSpacing,
              dense: true,
              onTap: () => select(StoryNav.dimSpacing),
            ),
            _NavLeaf(
              label: 'Grid tokens',
              selected: _nav == StoryNav.dimGrid,
              dense: true,
              onTap: () => select(StoryNav.dimGrid),
            ),
            _NavLeaf(
              label: 'Platform matrix',
              selected: _nav == StoryNav.dimPlatformMatrix,
              dense: true,
              onTap: () => select(StoryNav.dimPlatformMatrix),
            ),
          ],
        ),
        _storybookExpansionTile(
          expansionKey: 'foundations-surfaces',
          title: const Text('Surfaces'),
          onExpansionChanged: (expanded) {
            if (expanded && !_isSurfacesNav(_nav)) {
              setState(() => _nav = StoryNav.surfacesAllModes);
            }
          },
          children: [
            _NavLeaf(
              label: 'All modes',
              selected: _nav == StoryNav.surfacesAllModes,
              dense: true,
              onTap: () => select(StoryNav.surfacesAllModes),
            ),
            _NavLeaf(
              label: 'Nested stacking',
              selected: _nav == StoryNav.surfacesNestedStacking,
              dense: true,
              onTap: () => select(StoryNav.surfacesNestedStacking),
            ),
            _NavLeaf(
              label: 'On bold inversion',
              selected: _nav == StoryNav.surfacesOnBoldInversion,
              dense: true,
              onTap: () => select(StoryNav.surfacesOnBoldInversion),
            ),
          ],
        ),
        _storybookExpansionTile(
          expansionKey: 'foundations-appearance',
          title: const Text('Appearance'),
          onExpansionChanged: (expanded) {
            if (expanded && !_isAppearanceNav(_nav)) {
              setState(() => _nav = StoryNav.appearanceBackgroundGrid);
            }
          },
          children: [
            _NavLeaf(
              label: 'Background grid',
              selected: _nav == StoryNav.appearanceBackgroundGrid,
              dense: true,
              onTap: () => select(StoryNav.appearanceBackgroundGrid),
            ),
            _NavLeaf(
              label: 'Buttons by role',
              selected: _nav == StoryNav.appearanceButtonsByRole,
              dense: true,
              onTap: () => select(StoryNav.appearanceButtonsByRole),
            ),
          ],
        ),
        _storybookExpansionTile(
          expansionKey: 'foundations-strokes',
          title: const Text('Strokes'),
          onExpansionChanged: (expanded) {
            if (expanded && !_isStrokesNav(_nav)) {
              setState(() => _nav = StoryNav.strokesStatic);
            }
          },
          children: [
            _NavLeaf(
              label: 'Static strokes',
              selected: _nav == StoryNav.strokesStatic,
              dense: true,
              onTap: () => select(StoryNav.strokesStatic),
            ),
            _NavLeaf(
              label: 'Dynamic strokes',
              selected: _nav == StoryNav.strokesDynamic,
              dense: true,
              onTap: () => select(StoryNav.strokesDynamic),
            ),
            _NavLeaf(
              label: 'All strokes',
              selected: _nav == StoryNav.strokesAll,
              dense: true,
              onTap: () => select(StoryNav.strokesAll),
            ),
          ],
        ),
        const Padding(
          padding: EdgeInsets.fromLTRB(16, 16, 16, 4),
          child: Text(
            'COMPONENTS',
            style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, letterSpacing: 0.6),
          ),
        ),
        componentsCategoryTile(
          'Feedback',
          expansionKey: 'components-feedback',
          children: [
            Padding(
              padding: _navButtonTileInset,
              child: _storybookExpansionTile(
                expansionKey: 'components-feedback-cpi',
                tilePadding: const EdgeInsets.symmetric(horizontal: 8),
                childrenPadding: const EdgeInsetsDirectional.only(start: 12, end: 8),
                title: const Text(
                  'CircularProgressIndicator',
                  style: TextStyle(fontWeight: FontWeight.w500),
                ),
                onExpansionChanged: (expanded) {
                  if (expanded && !_isCircularProgressIndicatorNav(_nav)) {
                    selectCircularProgressIndicator(
                      CircularProgressIndicatorFoundationStory.docs,
                    );
                  }
                },
                children: [
                  for (final story in kCircularProgressIndicatorStoryNavOrder)
                    _NavLeaf(
                      label: story.title,
                      selected: _nav == StoryNav.componentsCircularProgressIndicator &&
                          _circularProgressIndicatorStory == story,
                      dense: true,
                      onTap: () => selectCircularProgressIndicator(story),
                    ),
                ],
              ),
            ),
            Padding(
              padding: _navButtonTileInset,
              child: _storybookExpansionTile(
                expansionKey: 'components-feedback-lpi',
                tilePadding: const EdgeInsets.symmetric(horizontal: 8),
                childrenPadding: const EdgeInsetsDirectional.only(start: 12, end: 8),
                title: const Text(
                  'LinearProgressIndicator',
                  style: TextStyle(fontWeight: FontWeight.w500),
                ),
                onExpansionChanged: (expanded) {
                  if (expanded && !_isLinearProgressIndicatorNav(_nav)) {
                    selectLinearProgressIndicator(
                      LinearProgressIndicatorFoundationStory.docs,
                    );
                  }
                },
                children: [
                  for (final story in kLinearProgressIndicatorStoryNavOrder)
                    _NavLeaf(
                      label: story.title,
                      selected: _nav == StoryNav.componentsLinearProgressIndicator &&
                          _linearProgressIndicatorStory == story,
                      dense: true,
                      onTap: () => selectLinearProgressIndicator(story),
                    ),
                ],
              ),
            ),
          ],
        ),
        componentsCategoryTile(
          'Data Display',
          expansionKey: 'components-data-display',
          children: [
            Padding(
              padding: _navButtonTileInset,
              child: _storybookExpansionTile(
                expansionKey: 'components-data-display-avatar',
                tilePadding: const EdgeInsets.symmetric(horizontal: 8),
                childrenPadding: const EdgeInsetsDirectional.only(start: 12, end: 8),
                title: const Text('Avatar', style: TextStyle(fontWeight: FontWeight.w500)),
                onExpansionChanged: (expanded) {
                  if (expanded && !_isAvatarNav(_nav)) {
                    selectAvatar(AvatarFoundationStory.docs);
                  }
                },
                children: [
                  for (final story in kAvatarStoryNavOrder)
                    _NavLeaf(
                      label: story.title,
                      selected: _nav == StoryNav.componentsAvatar && _avatarStory == story,
                      dense: true,
                      onTap: () => selectAvatar(story),
                    ),
                ],
              ),
            ),
          ],
        ),
        componentsCategoryTile(
          'Display',
          expansionKey: 'components-display',
          children: [
            Padding(
              padding: _navButtonTileInset,
              child: _storybookExpansionTile(
                expansionKey: 'components-display-badge',
                tilePadding: const EdgeInsets.symmetric(horizontal: 8),
                childrenPadding: const EdgeInsetsDirectional.only(start: 12, end: 8),
                title: const Text('Badge', style: TextStyle(fontWeight: FontWeight.w500)),
                onExpansionChanged: (expanded) {
                  if (expanded && !_isBadgeNav(_nav)) {
                    selectBadge(BadgeFoundationStory.docs);
                  }
                },
                children: [
                  for (final story in kBadgeStoryNavOrder)
                    _NavLeaf(
                      label: story.title,
                      selected: _nav == StoryNav.componentsBadge && _badgeStory == story,
                      dense: true,
                      onTap: () => selectBadge(story),
                    ),
                ],
              ),
            ),
            Padding(
              padding: _navButtonTileInset,
              child: _storybookExpansionTile(
                expansionKey: 'components-display-counter-badge',
                tilePadding: const EdgeInsets.symmetric(horizontal: 8),
                childrenPadding: const EdgeInsetsDirectional.only(start: 12, end: 8),
                title: const Text('CounterBadge', style: TextStyle(fontWeight: FontWeight.w500)),
                onExpansionChanged: (expanded) {
                  if (expanded && !_isCounterBadgeNav(_nav)) {
                    selectCounterBadge(CounterBadgeFoundationStory.docs);
                  }
                },
                children: [
                  for (final story in kCounterBadgeStoryNavOrder)
                    _NavLeaf(
                      label: story.title,
                      selected: _nav == StoryNav.componentsCounterBadge &&
                          _counterBadgeStory == story,
                      dense: true,
                      onTap: () => selectCounterBadge(story),
                    ),
                ],
              ),
            ),
            Padding(
              padding: _navButtonTileInset,
              child: _storybookExpansionTile(
                expansionKey: 'components-display-indicator-badge',
                tilePadding: const EdgeInsets.symmetric(horizontal: 8),
                childrenPadding: const EdgeInsetsDirectional.only(start: 12, end: 8),
                title: const Text('IndicatorBadge', style: TextStyle(fontWeight: FontWeight.w500)),
                onExpansionChanged: (expanded) {
                  if (expanded && !_isIndicatorBadgeNav(_nav)) {
                    selectIndicatorBadge(IndicatorBadgeFoundationStory.docs);
                  }
                },
                children: [
                  for (final story in kIndicatorBadgeStoryNavOrder)
                    _NavLeaf(
                      label: story.title,
                      selected: _nav == StoryNav.componentsIndicatorBadge &&
                          _indicatorBadgeStory == story,
                      dense: true,
                      onTap: () => selectIndicatorBadge(story),
                    ),
                ],
              ),
            ),
            Padding(
              padding: _navButtonTileInset,
              child: _storybookExpansionTile(
                expansionKey: 'components-display-text',
                tilePadding: const EdgeInsets.symmetric(horizontal: 8),
                childrenPadding: const EdgeInsetsDirectional.only(start: 12, end: 8),
                title: const Text('Text', style: TextStyle(fontWeight: FontWeight.w500)),
                onExpansionChanged: (expanded) {
                  if (expanded && !_isTextNav(_nav)) {
                    selectText(TextFoundationStory.docs);
                  }
                },
                children: [
                  for (final story in kTextStoryNavOrder)
                    _NavLeaf(
                      label: story.title,
                      selected: _nav == StoryNav.componentsText && _textStory == story,
                      dense: true,
                      onTap: () => selectText(story),
                    ),
                ],
              ),
            ),
          ],
        ),
        componentsCategoryTile(
          'Navigation',
          expansionKey: 'components-navigation',
          children: [
            Padding(
              padding: _navButtonTileInset,
              child: _storybookExpansionTile(
                expansionKey: 'components-navigation-bottom-navigation',
                tilePadding: const EdgeInsets.symmetric(horizontal: 8),
                childrenPadding: const EdgeInsetsDirectional.only(start: 12, end: 8),
                title: const Text(
                  'BottomNavigation',
                  style: TextStyle(fontWeight: FontWeight.w500),
                ),
                onExpansionChanged: (expanded) {
                  if (expanded && !_isBottomNavigationNav(_nav)) {
                    selectBottomNavigation(BottomNavigationFoundationStory.docs);
                  }
                },
                children: [
                  for (final story in kBottomNavigationStoryNavOrder)
                    _NavLeaf(
                      label: story.title,
                      selected: _nav == StoryNav.componentsBottomNavigation &&
                          _bottomNavigationStory == story,
                      dense: true,
                      onTap: () => selectBottomNavigation(story),
                    ),
                ],
              ),
            ),
          ],
        ),
        componentsCategoryTile(
          'Actions',
          expansionKey: 'components-actions',
          children: [
            Padding(
              padding: _navButtonTileInset,
              child: _storybookExpansionTile(
                expansionKey: 'components-actions-button',
                tilePadding: const EdgeInsets.symmetric(horizontal: 8),
                childrenPadding: const EdgeInsetsDirectional.only(start: 12, end: 8),
                title: const Text('Button', style: TextStyle(fontWeight: FontWeight.w500)),
                onExpansionChanged: (expanded) {
                  if (expanded && !_isButtonNav(_nav)) {
                    selectButton(ButtonFoundationStory.docs);
                  }
                },
                children: [
                  for (final story in kButtonStoryNavOrder)
                    _NavLeaf(
                      label: story.title,
                      selected: _nav == StoryNav.componentsButton && _buttonStory == story,
                      dense: true,
                      onTap: () => selectButton(story),
                    ),
                ],
              ),
            ),
            Padding(
              padding: _navButtonTileInset,
              child: _storybookExpansionTile(
                expansionKey: 'components-actions-icon-button',
                tilePadding: const EdgeInsets.symmetric(horizontal: 8),
                childrenPadding: const EdgeInsetsDirectional.only(start: 12, end: 8),
                title: const Text('IconButton', style: TextStyle(fontWeight: FontWeight.w500)),
                onExpansionChanged: (expanded) {
                  if (expanded && !_isIconButtonNav(_nav)) {
                    selectIconButton(IconButtonFoundationStory.docs);
                  }
                },
                children: [
                  for (final story in kIconButtonStoryNavOrder)
                    _NavLeaf(
                      label: story.title,
                      selected:
                          _nav == StoryNav.componentsIconButton && _iconButtonStory == story,
                      dense: true,
                      onTap: () => selectIconButton(story),
                    ),
                ],
              ),
            ),
            Padding(
              padding: _navButtonTileInset,
              child: _storybookExpansionTile(
                expansionKey: 'components-actions-selectable-single-text-button',
                tilePadding: const EdgeInsets.symmetric(horizontal: 8),
                childrenPadding:
                    const EdgeInsetsDirectional.only(start: 12, end: 8),
                title: const Text('SelectableSingleTextButton',
                    style: TextStyle(fontWeight: FontWeight.w500)),
                onExpansionChanged: (expanded) {
                  if (expanded && !_isSelectableSingleTextButtonNav(_nav)) {
                    selectSelectableSingleTextButton(
                        SelectableSingleTextButtonFoundationStory.docs);
                  }
                },
                children: [
                  for (final story in kSelectableSingleTextButtonStoryNavOrder)
                    _NavLeaf(
                      label: story.title,
                      selected: _nav ==
                              StoryNav.componentsSelectableSingleTextButton &&
                          _selectableSingleTextButtonStory == story,
                      dense: true,
                      onTap: () => selectSelectableSingleTextButton(story),
                    ),
                ],
              ),
            ),
            Padding(
              padding: _navButtonTileInset,
              child: _storybookExpansionTile(
                expansionKey: 'components-actions-selectable-icon-button',
                tilePadding: const EdgeInsets.symmetric(horizontal: 8),
                childrenPadding: const EdgeInsetsDirectional.only(start: 12, end: 8),
                title: const Text('SelectableIconButton',
                    style: TextStyle(fontWeight: FontWeight.w500)),
                onExpansionChanged: (expanded) {
                  if (expanded && !_isSelectableIconButtonNav(_nav)) {
                    selectSelectableIconButton(
                        SelectableIconButtonFoundationStory.docs);
                  }
                },
                children: [
                  for (final story in kSelectableIconButtonStoryNavOrder)
                    _NavLeaf(
                      label: story.title,
                      selected: _nav == StoryNav.componentsSelectableIconButton &&
                          _selectableIconButtonStory == story,
                      dense: true,
                      onTap: () => selectSelectableIconButton(story),
                    ),
                ],
              ),
            ),
            Padding(
              padding: _navButtonTileInset,
              child: _storybookExpansionTile(
                expansionKey: 'components-actions-single-text-button',
                tilePadding: const EdgeInsets.symmetric(horizontal: 8),
                childrenPadding:
                    const EdgeInsetsDirectional.only(start: 12, end: 8),
                title: const Text('SingleTextButton',
                    style: TextStyle(fontWeight: FontWeight.w500)),
                onExpansionChanged: (expanded) {
                  if (expanded && !_isSingleTextButtonNav(_nav)) {
                    selectSingleTextButton(SingleTextButtonFoundationStory.docs);
                  }
                },
                children: [
                  for (final story in kSingleTextButtonStoryNavOrder)
                    _NavLeaf(
                      label: story.title,
                      selected: _nav == StoryNav.componentsSingleTextButton &&
                          _singleTextButtonStory == story,
                      dense: true,
                      onTap: () => selectSingleTextButton(story),
                    ),
                ],
              ),
            ),
            Padding(
              padding: _navButtonTileInset,
              child: _storybookExpansionTile(
                expansionKey: 'components-actions-chip',
                tilePadding: const EdgeInsets.symmetric(horizontal: 8),
                childrenPadding: const EdgeInsetsDirectional.only(start: 12, end: 8),
                title: const Text('Chip', style: TextStyle(fontWeight: FontWeight.w500)),
                onExpansionChanged: (expanded) {
                  if (expanded && !_isChipNav(_nav)) {
                    selectChip(ChipFoundationStory.docs);
                  }
                },
                children: [
                  for (final story in kChipStoryNavOrder)
                    _NavLeaf(
                      label: story.title,
                      selected: _nav == StoryNav.componentsChip && _chipStory == story,
                      dense: true,
                      onTap: () => selectChip(story),
                    ),
                ],
              ),
            ),
            Padding(
              padding: _navButtonTileInset,
              child: _storybookExpansionTile(
                expansionKey: 'components-actions-selectable-button',
                tilePadding: const EdgeInsets.symmetric(horizontal: 8),
                childrenPadding:
                    const EdgeInsetsDirectional.only(start: 12, end: 8),
                title: const Text('SelectableButton',
                    style: TextStyle(fontWeight: FontWeight.w500)),
                onExpansionChanged: (expanded) {
                  if (expanded && !_isSelectableButtonNav(_nav)) {
                    selectSelectableButton(SelectableButtonFoundationStory.docs);
                  }
                },
                children: [
                  for (final story in kSelectableButtonStoryNavOrder)
                    _NavLeaf(
                      label: story.title,
                      selected: _nav == StoryNav.componentsSelectableButton &&
                          _selectableButtonStory == story,
                      dense: true,
                      onTap: () => selectSelectableButton(story),
                    ),
                ],
              ),
            ),
            Padding(
              padding: _navButtonTileInset,
              child: _storybookExpansionTile(
                expansionKey: 'components-actions-chip-group',
                tilePadding: const EdgeInsets.symmetric(horizontal: 8),
                childrenPadding: const EdgeInsetsDirectional.only(start: 12, end: 8),
                title: const Text('ChipGroup', style: TextStyle(fontWeight: FontWeight.w500)),
                onExpansionChanged: (expanded) {
                  if (expanded && !_isChipGroupNav(_nav)) {
                    selectChipGroup(ChipGroupFoundationStory.docs);
                  }
                },
                children: [
                  for (final story in kChipGroupStoryNavOrder)
                    _NavLeaf(
                      label: story.title,
                      selected:
                          _nav == StoryNav.componentsChipGroup && _chipGroupStory == story,
                      dense: true,
                      onTap: () => selectChipGroup(story),
                    ),
                ],
              ),
            ),
          ],
        ),
        componentsCategoryTile(
          'Inputs',
          expansionKey: 'components-inputs',
          children: [
            Padding(
              padding: _navButtonTileInset,
              child: _storybookExpansionTile(
                expansionKey: 'components-inputs-input',
                tilePadding: const EdgeInsets.symmetric(horizontal: 8),
                childrenPadding: const EdgeInsetsDirectional.only(start: 12, end: 8),
                title: const Text('Input', style: TextStyle(fontWeight: FontWeight.w500)),
                onExpansionChanged: (expanded) {
                  if (expanded && !_isInputNav(_nav)) {
                    selectInput(InputFoundationStory.docs);
                  }
                },
                children: [
                  for (final story in kInputStoryNavOrder)
                    _NavLeaf(
                      label: story.title,
                      selected: _nav == StoryNav.componentsInput &&
                          _inputInternalsComponent == null &&
                          _inputStory == story,
                      dense: true,
                      onTap: () => selectInput(story),
                    ),
                  Padding(
                    padding: const EdgeInsetsDirectional.only(start: 4),
                    child: _storybookExpansionTile(
                      expansionKey: 'components-inputs-input-internals',
                      tilePadding: const EdgeInsets.symmetric(horizontal: 8),
                      childrenPadding: const EdgeInsetsDirectional.only(start: 12, end: 8),
                      title: const Text('Internals', style: TextStyle(fontWeight: FontWeight.w500)),
                      onExpansionChanged: (expanded) {
                        if (expanded &&
                            (_inputInternalsComponent == null ||
                                !_isInputNav(_nav))) {
                          selectInputDynamicText(InputDynamicTextFoundationStory.docs);
                        }
                      },
                      children: [
                        Padding(
                          padding: const EdgeInsetsDirectional.only(start: 4),
                          child: _storybookExpansionTile(
                            expansionKey: 'components-inputs-input-dynamic-text',
                            tilePadding: const EdgeInsets.symmetric(horizontal: 8),
                            childrenPadding:
                                const EdgeInsetsDirectional.only(start: 12, end: 8),
                            title: const Text(
                              'InputDynamicText',
                              style: TextStyle(fontWeight: FontWeight.w500),
                            ),
                            onExpansionChanged: (expanded) {
                              if (expanded && !inputDynamicTextSelected(
                                    InputDynamicTextFoundationStory.docs,
                                  )) {
                                selectInputDynamicText(InputDynamicTextFoundationStory.docs);
                              }
                            },
                            children: [
                              for (final story in kInputDynamicTextStoryNavOrder)
                                _NavLeaf(
                                  label: story.title,
                                  selected: inputDynamicTextSelected(story),
                                  dense: true,
                                  onTap: () => selectInputDynamicText(story),
                                ),
                            ],
                          ),
                        ),
                        Padding(
                          padding: const EdgeInsetsDirectional.only(start: 4),
                          child: _storybookExpansionTile(
                            expansionKey: 'components-inputs-input-feedback',
                            tilePadding: const EdgeInsets.symmetric(horizontal: 8),
                            childrenPadding:
                                const EdgeInsetsDirectional.only(start: 12, end: 8),
                            title: const Text(
                              'InputFeedback',
                              style: TextStyle(fontWeight: FontWeight.w500),
                            ),
                            onExpansionChanged: (expanded) {
                              if (expanded &&
                                  !inputFeedbackSelected(InputFeedbackFoundationStory.docs)) {
                                selectInputFeedback(InputFeedbackFoundationStory.docs);
                              }
                            },
                            children: [
                              for (final story in kInputFeedbackStoryNavOrder)
                                _NavLeaf(
                                  label: story.title,
                                  selected: inputFeedbackSelected(story),
                                  dense: true,
                                  onTap: () => selectInputFeedback(story),
                                ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            Padding(
              padding: _navButtonTileInset,
              child: _storybookExpansionTile(
                expansionKey: 'components-inputs-input-field',
                tilePadding: const EdgeInsets.symmetric(horizontal: 8),
                childrenPadding: const EdgeInsetsDirectional.only(start: 12, end: 8),
                title: const Text('InputField', style: TextStyle(fontWeight: FontWeight.w500)),
                onExpansionChanged: (expanded) {
                  if (expanded && !_isInputFieldNav(_nav)) {
                    selectInputField(InputFieldFoundationStory.docs);
                  }
                },
                children: [
                  for (final story in kInputFieldStoryNavOrder)
                    _NavLeaf(
                      label: story.title,
                      selected:
                          _nav == StoryNav.componentsInputField && _inputFieldStory == story,
                      dense: true,
                      onTap: () => selectInputField(story),
                    ),
                ],
              ),
            ),
            Padding(
              padding: _navButtonTileInset,
              child: _storybookExpansionTile(
                expansionKey: 'components-inputs-radio',
                tilePadding: const EdgeInsets.symmetric(horizontal: 8),
                childrenPadding: const EdgeInsetsDirectional.only(start: 12, end: 8),
                title: const Text('Radio', style: TextStyle(fontWeight: FontWeight.w500)),
                onExpansionChanged: (expanded) {
                  if (expanded && !_isRadioNav(_nav)) {
                    selectRadio(RadioFoundationStory.docs);
                  }
                },
                children: [
                  for (final story in kRadioStoryNavOrder)
                    _NavLeaf(
                      label: story.title,
                      selected: _nav == StoryNav.componentsRadio && _radioStory == story,
                      dense: true,
                      onTap: () => selectRadio(story),
                    ),
                ],
              ),
            ),
            Padding(
              padding: _navButtonTileInset,
              child: _storybookExpansionTile(
                expansionKey: 'components-inputs-radio-field',
                tilePadding: const EdgeInsets.symmetric(horizontal: 8),
                childrenPadding: const EdgeInsetsDirectional.only(start: 12, end: 8),
                title: const Text('RadioField', style: TextStyle(fontWeight: FontWeight.w500)),
                onExpansionChanged: (expanded) {
                  if (expanded && !_isRadioFieldNav(_nav)) {
                    selectRadioField(RadioFieldFoundationStory.docs);
                  }
                },
                children: [
                  for (final story in kRadioFieldStoryNavOrder)
                    _NavLeaf(
                      label: story.title,
                      selected:
                          _nav == StoryNav.componentsRadioField && _radioFieldStory == story,
                      dense: true,
                      onTap: () => selectRadioField(story),
                    ),
                ],
              ),
            ),
            Padding(
              padding: _navButtonTileInset,
              child: _storybookExpansionTile(
                expansionKey: 'components-inputs-checkbox',
                tilePadding: const EdgeInsets.symmetric(horizontal: 8),
                childrenPadding: const EdgeInsetsDirectional.only(start: 12, end: 8),
                title: const Text('Checkbox', style: TextStyle(fontWeight: FontWeight.w500)),
                onExpansionChanged: (expanded) {
                  if (expanded && !_isCheckboxNav(_nav)) {
                    selectCheckbox(CheckboxFoundationStory.docs);
                  }
                },
                children: [
                  for (final story in kCheckboxStoryNavOrder)
                    _NavLeaf(
                      label: story.title,
                      selected:
                          _nav == StoryNav.componentsCheckbox && _checkboxStory == story,
                      dense: true,
                      onTap: () => selectCheckbox(story),
                    ),
                ],
              ),
            ),
            Padding(
              padding: _navButtonTileInset,
              child: _storybookExpansionTile(
                expansionKey: 'components-inputs-checkbox-field',
                tilePadding: const EdgeInsets.symmetric(horizontal: 8),
                childrenPadding: const EdgeInsetsDirectional.only(start: 12, end: 8),
                title: const Text('CheckboxField', style: TextStyle(fontWeight: FontWeight.w500)),
                onExpansionChanged: (expanded) {
                  if (expanded && !_isCheckboxFieldNav(_nav)) {
                    selectCheckboxField(CheckboxFieldFoundationStory.docs);
                  }
                },
                children: [
                  for (final story in kCheckboxFieldStoryNavOrder)
                    _NavLeaf(
                      label: story.sidebarTitle,
                      selected: _nav == StoryNav.componentsCheckboxField &&
                          _checkboxFieldStory == story,
                      dense: true,
                      onTap: () => selectCheckboxField(story),
                    ),
                ],
              ),
            ),
            Padding(
              padding: _navButtonTileInset,
              child: _storybookExpansionTile(
                expansionKey: 'components-inputs-slider',
                tilePadding: const EdgeInsets.symmetric(horizontal: 8),
                childrenPadding: const EdgeInsetsDirectional.only(start: 12, end: 8),
                title: const Text('Slider', style: TextStyle(fontWeight: FontWeight.w500)),
                onExpansionChanged: (expanded) {
                  if (expanded && !_isSliderNav(_nav)) {
                    selectSlider(SliderFoundationStory.docs);
                  }
                },
                children: [
                  for (final story in kSliderStoryNavOrder)
                    _NavLeaf(
                      label: story.title,
                      selected:
                          _nav == StoryNav.componentsSlider && _sliderStory == story,
                      dense: true,
                      onTap: () => selectSlider(story),
                    ),
                ],
              ),
            ),
            Padding(
              padding: _navButtonTileInset,
              child: _storybookExpansionTile(
                expansionKey: 'components-inputs-touch-slider',
                tilePadding: const EdgeInsets.symmetric(horizontal: 8),
                childrenPadding: const EdgeInsetsDirectional.only(start: 12, end: 8),
                title: const Text('TouchSlider', style: TextStyle(fontWeight: FontWeight.w500)),
                onExpansionChanged: (expanded) {
                  if (expanded && !_isTouchSliderNav(_nav)) {
                    selectTouchSlider(TouchSliderFoundationStory.docs);
                  }
                },
                children: [
                  for (final story in kTouchSliderStoryNavOrder)
                    _NavLeaf(
                      label: story.title,
                      selected: _nav == StoryNav.componentsTouchSlider &&
                          _touchSliderStory == story,
                      dense: true,
                      onTap: () => selectTouchSlider(story),
                    ),
                ],
              ),
            ),
          ],
        ),
        componentsCategoryTile(
          'Layout',
          expansionKey: 'components-layout',
          children: [
            Padding(
              padding: _navButtonTileInset,
              child: _storybookExpansionTile(
                expansionKey: 'components-layout-divider',
                tilePadding: const EdgeInsets.symmetric(horizontal: 8),
                childrenPadding: const EdgeInsetsDirectional.only(start: 12, end: 8),
                title: const Text('Divider', style: TextStyle(fontWeight: FontWeight.w500)),
                onExpansionChanged: (expanded) {
                  if (expanded && !_isDividerNav(_nav)) {
                    selectDivider(DividerFoundationStory.docs);
                  }
                },
                children: [
                  for (final story in kDividerStoryNavOrder)
                    _NavLeaf(
                      label: story.title,
                      selected: _nav == StoryNav.componentsDivider && _dividerStory == story,
                      dense: true,
                      onTap: () => selectDivider(story),
                    ),
                ],
              ),
            ),
          ],
        ),
        componentsCategoryTile(
          'Media',
          expansionKey: 'components-media',
          children: [
            Padding(
              padding: _navButtonTileInset,
              child: _storybookExpansionTile(
                expansionKey: 'components-media-icon',
                tilePadding: const EdgeInsets.symmetric(horizontal: 8),
                childrenPadding: const EdgeInsetsDirectional.only(start: 12, end: 8),
                title: const Text('Icon', style: TextStyle(fontWeight: FontWeight.w500)),
                onExpansionChanged: (expanded) {
                  if (expanded && !_isIconNav(_nav)) {
                    selectIcon(IconFoundationStory.docs);
                  }
                },
                children: [
                  for (final story in kIconStoryNavOrder)
                    _NavLeaf(
                      label: story.title,
                      selected: _nav == StoryNav.componentsIcon && _iconStory == story,
                      dense: true,
                      onTap: () => selectIcon(story),
                    ),
                ],
              ),
            ),
            Padding(
              padding: _navButtonTileInset,
              child: _storybookExpansionTile(
                expansionKey: 'components-media-icon-contained',
                tilePadding: const EdgeInsets.symmetric(horizontal: 8),
                childrenPadding: const EdgeInsetsDirectional.only(start: 12, end: 8),
                title: const Text('IconContained', style: TextStyle(fontWeight: FontWeight.w500)),
                onExpansionChanged: (expanded) {
                  if (expanded && !_isIconContainedNav(_nav)) {
                    selectIconContained(IconContainedFoundationStory.docs);
                  }
                },
                children: [
                  for (final story in kIconContainedStoryNavOrder)
                    _NavLeaf(
                      label: story.title,
                      selected:
                          _nav == StoryNav.componentsIconContained && _iconContainedStory == story,
                      dense: true,
                      onTap: () => selectIconContained(story),
                    ),
                ],
              ),
            ),
            Padding(
              padding: _navButtonTileInset,
              child: _storybookExpansionTile(
                expansionKey: 'components-media-image',
                tilePadding: const EdgeInsets.symmetric(horizontal: 8),
                childrenPadding: const EdgeInsetsDirectional.only(start: 12, end: 8),
                title: const Text('Image', style: TextStyle(fontWeight: FontWeight.w500)),
                onExpansionChanged: (expanded) {
                  if (expanded && !_isImageNav(_nav)) {
                    selectImage(ImageFoundationStory.docs);
                  }
                },
                children: [
                  for (final story in kImageStoryNavOrder)
                    _NavLeaf(
                      label: story.title,
                      selected: _nav == StoryNav.componentsImage && _imageStory == story,
                      dense: true,
                      onTap: () => selectImage(story),
                    ),
                ],
              ),
            ),
            Padding(
              padding: _navButtonTileInset,
              child: _storybookExpansionTile(
                expansionKey: 'components-media-logo',
                tilePadding: const EdgeInsets.symmetric(horizontal: 8),
                childrenPadding: const EdgeInsetsDirectional.only(start: 12, end: 8),
                title: const Text('Logo', style: TextStyle(fontWeight: FontWeight.w500)),
                onExpansionChanged: (expanded) {
                  if (expanded && !_isLogoNav(_nav)) {
                    selectLogo(LogoFoundationStory.docs);
                  }
                },
                children: [
                  for (final story in kLogoStoryNavOrder)
                    _NavLeaf(
                      label: story.sidebarTitle,
                      selected: _nav == StoryNav.componentsLogo && _logoStory == story,
                      dense: true,
                      onTap: () => selectLogo(story),
                    ),
                ],
              ),
            ),
          ],
        ),
        componentsCategoryTile(
          'Overlays',
          expansionKey: 'components-overlays',
          children: const [_NavPlaceholder()],
        ),
        componentsCategoryTile(
          'Containers',
          expansionKey: 'components-containers',
          children: const [_NavPlaceholder()],
        ),
      ],
    );
  }

  Widget _toolbar(ColorScheme scheme) {
    String? brandDropdownValue;
    if (_brandId.isEmpty) {
      brandDropdownValue = '';
    } else if (_brandsLoading) {
      brandDropdownValue = _brandId;
    } else if (_brands.any((b) => b.id == _brandId)) {
      brandDropdownValue = _brandId;
    }

    String? emptyBrandsHint;
    if (!_brandsLoading && _brands.isEmpty) {
      if (widget.convexUrl.isEmpty) {
        emptyBrandsHint = kIsWeb
            ? 'No Convex URL in build. Run: pnpm storybook:flutter:web (injects repo .env.local), or flutter run -d chrome --dart-define-from-file=../../.env.local — web cannot read .env from disk.'
            : 'No Convex URL. Add CONVEX_URL or STORYBOOK_CONVEX_URL to repo `.env.local`, or pass --dart-define-from-file=../../.env.local when launching from apps/storybook_flutter.';
      } else {
        emptyBrandsHint = _brandsListStatus == BrandsListStatus.error
            ? 'Could not load brands (network or Convex error — see debug console)'
            : '`brands` table is empty — run mutation `brands:seedDefaultBrands` in Convex (dashboard or CLI)';
      }
    }
    final brandItems = <DropdownMenuItem<String>>[
      const DropdownMenuItem<String>(value: '', child: Text('No brand')),
      if (emptyBrandsHint != null)
        DropdownMenuItem<String>(
          value: '__offline__',
          enabled: false,
          child: Text(emptyBrandsHint, maxLines: 3),
        ),
      ..._brands.map(
        (b) => DropdownMenuItem<String>(value: b.id, child: Text(b.name)),
      ),
    ];

    final brandControl = _brandsLoading
        ? Padding(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
            child: Text(
              'Loading brands…',
              style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: scheme.onSurface),
            ),
          )
        : DropdownButton<String>(
            value: brandDropdownValue,
            hint: const Text('Brand'),
            underline: const SizedBox.shrink(),
            isDense: true,
            items: brandItems,
            onChanged: (v) {
              if (v == null || v == '__offline__') return;
              _setBrand(v);
            },
          );

    return Material(
      color: scheme.surfaceContainerHighest.withValues(alpha: 0.35),
      child: SafeArea(
        top: false,
        bottom: false,
        child: SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
          child: Row(
            children: [
              Container(
                width: 8,
                height: 8,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: (brandDropdownValue != null && brandDropdownValue.isNotEmpty)
                      ? scheme.error
                      : scheme.outline,
                ),
              ),
              const SizedBox(width: 6),
              brandControl,
              _tbDivider(scheme),
              DropdownButton<String>(
                value: _foundationPlatform,
                underline: const SizedBox.shrink(),
                isDense: true,
                items: const [
                  DropdownMenuItem(value: 'web', child: Text('Web')),
                ],
                onChanged: (v) {
                  if (v != null) setState(() => _foundationPlatform = v);
                },
              ),
              _tbDivider(scheme),
              DropdownButton<String>(
                value: kStorybookBreakpointValues.contains(_breakpoint) ? _breakpoint : 'responsive',
                underline: const SizedBox.shrink(),
                isDense: true,
                items: [
                  for (final v in kStorybookBreakpointValues)
                    DropdownMenuItem(
                      value: v,
                      child: Text(breakpointMenuLabel(v)),
                    ),
                ],
                onChanged: (v) {
                  if (v != null) {
                    setState(() {
                      _breakpoint = v;
                      if (v == 'responsive') {
                        _nativeConvexPlatformArg = null;
                      } else {
                        _v2PlatformForScope = v2PlatformFromBreakpointWidth(
                          int.tryParse(v) ?? 360,
                        );
                      }
                    });
                  }
                },
              ),
              _tbDivider(scheme),
              DropdownButton<String>(
                value: densityIds.contains(_density) ? _density : 'default',
                underline: const SizedBox.shrink(),
                isDense: true,
                items: [
                  for (final d in densityIds)
                    DropdownMenuItem(
                      value: d,
                      child: Text(
                        d == 'default' ? 'Default' : d[0].toUpperCase() + d.substring(1),
                      ),
                    ),
                ],
                onChanged: (v) {
                  if (v != null) setState(() => _density = v);
                },
              ),
              _tbDivider(scheme),
              IconButton(
                tooltip:
                    _storybookSemanticsDebugger ? 'Hide Semantics Debugger' : 'Show Semantics Debugger',
                icon: Icon(_storybookSemanticsDebugger ? Icons.article : Icons.article_outlined),
                onPressed: () {
                  setState(() => _storybookSemanticsDebugger = !_storybookSemanticsDebugger);
                },
              ),
              IconButton(
                tooltip: 'Accessibility (WCAG — axe on web, semantics on all platforms)',
                icon: const Icon(Icons.accessibility_new),
                onPressed: () {
                  showStorybookAccessibilitySheet(
                    context,
                    runAudit: runStorybookAccessibilityAudit,
                  );
                },
              ),
              IconButton(
                tooltip: _themeMode == ThemeMode.dark ? 'Light theme' : 'Dark theme',
                icon: Icon(_themeMode == ThemeMode.dark ? Icons.light_mode_outlined : Icons.dark_mode_outlined),
                onPressed: () {
                  setState(() {
                    _themeMode = _themeMode == ThemeMode.dark ? ThemeMode.light : ThemeMode.dark;
                  });
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _tbDivider(ColorScheme scheme) {
    return Container(
      width: 1,
      height: 18,
      margin: const EdgeInsets.symmetric(horizontal: 6),
      color: scheme.outline.withValues(alpha: 0.25),
    );
  }

  @override
  Widget build(BuildContext context) {
    const seed = Color(0xFF0A59F7);
    final selected = _selectedBrand;

    return OneUiBrandScope(
      convexUrl: widget.convexUrl,
      brandId: _brandId,
      theme: _convexTheme,
      density: _density,
      platformId: _v2PlatformForScope,
      nativeThemePlatform: _nativeSnapshotPlatformFromToolbar(),
      brandSlug: selected?.slug,
      brandName: selected?.name,
      primaryHue: selected?.primaryHue,
      primaryChroma: selected?.primaryChroma,
      applyTiraCapsulePatch: true,
      child: Builder(
        builder: (context) {
          final snap = OneUiBrandLoadState.maybeOf(context)?.snapshot;
          final typographyFont = NativeTypographySnapshot.tryParse(snap?.typography)
                  ?.fontFamilyPrimaryOrBundled ??
              kJioTypeVariableFontFamily;

          return MaterialApp(
            title: 'Storybook',
            theme: ThemeData(
              colorScheme: ColorScheme.fromSeed(seedColor: seed),
              useMaterial3: true,
              fontFamily: typographyFont,
            ),
            darkTheme: ThemeData(
              colorScheme: ColorScheme.fromSeed(seedColor: seed, brightness: Brightness.dark),
              useMaterial3: true,
              fontFamily: typographyFont,
            ),
            themeMode: _themeMode,
            showSemanticsDebugger: _storybookSemanticsDebugger,
            home: LayoutBuilder(
        builder: (context, constraints) {
          final wide = constraints.maxWidth >= 880;
          final scheme = Theme.of(context).colorScheme;
          return Scaffold(
            appBar: AppBar(
              automaticallyImplyLeading: !wide,
              title: const Text('Storybook'),
            ),
            drawer: wide
                ? null
                : Drawer(
                    child: SafeArea(
                      child: _buildSideNav(() => Navigator.of(context).pop()),
                    ),
                  ),
            body: Row(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                if (wide)
                  SizedBox(
                    width: 272,
                    child: Material(
                      elevation: 0.5,
                      color: scheme.surfaceContainerLow,
                      child: _buildSideNav(null),
                    ),
                  ),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      _toolbar(scheme),
                      const Divider(height: 1),
                                Expanded(
                                  child: LayoutBuilder(
                                    builder: (context, inner) {
                                      final v2 = _effectiveV2Platform(inner.maxWidth);
                                      if (_breakpoint == 'responsive' &&
                                          _brandId.isNotEmpty &&
                                          widget.convexUrl.isNotEmpty &&
                                          inner.maxWidth.isFinite &&
                                          inner.maxWidth > 0) {
                                        final plat = nativeThemePlatformArgFromV2Id(
                                          viewportToV2PlatformId(inner.maxWidth),
                                        );
                                        if (plat != _nativeConvexPlatformArg) {
                                          WidgetsBinding.instance
                                              .addPostFrameCallback((_) => _applyNativeConvexPlatformArg(plat));
                                        }
                                      }
                                      if (v2 != _v2PlatformForScope) {
                                        WidgetsBinding.instance.addPostFrameCallback(
                                          (_) => _syncV2PlatformForScope(v2),
                                        );
                                      }
                                      final canvasPx = inner.maxWidth.round();
                                      final brandLabel = _brandId.isEmpty
                                          ? 'No brand'
                                          : (_selectedBrand?.name ?? 'Unknown');
                                      final brandLoading =
                                          OneUiBrandLoadState.maybeOf(context)?.loading == true &&
                                              _brandId.isNotEmpty;
                                      return Column(
                                        crossAxisAlignment: CrossAxisAlignment.stretch,
                                        children: [
                                          StorybookCanvasChrome(
                                            breadcrumb: _pageBreadcrumb(_nav),
                                            title: _pageTitle(_nav),
                                            v2PlatformId: v2,
                                            canvasWidthPx: canvasPx,
                                            density: _density,
                                            brandLabel: brandLabel,
                                            breakpointLabel: breakpointMenuLabel(_breakpoint),
                                            brandId: _brandId,
                                            breakpointStorageValue: _breakpoint,
                                          ),
                                          Expanded(
                                            child: Stack(
                                              fit: StackFit.expand,
                                              children: [
                                                _canvasFrame(
                                                  breakpoint: _breakpoint,
                                                  child: _pageForNav(_nav),
                                                ),
                                                if (brandLoading)
                                                  Positioned.fill(
                                                    child: ColoredBox(
                                                      color: scheme.surface.withValues(alpha: 0.72),
                                                      child: const Center(
                                                        child: OneUiCircularProgressIndicator(
                                                          variant: 'indeterminate',
                                                          size: 'M',
                                                          appearance: 'primary',
                                                          ariaHidden: true,
                                                        ),
                                                      ),
                                                    ),
                                                  ),
                                              ],
                                            ),
                                          ),
                                        ],
                                      );
                                    },
                                  ),
                                ),
                      if (!((_isButtonNav(_nav) && _buttonStory == ButtonFoundationStory.defaultStory) ||
                          (_isIconButtonNav(_nav) &&
                              (_iconButtonStory == IconButtonFoundationStory.defaultStory ||
                                  _iconButtonStory == IconButtonFoundationStory.interactive)) ||
                          (_isSelectableSingleTextButtonNav(_nav) &&
                              (_selectableSingleTextButtonStory ==
                                      SelectableSingleTextButtonFoundationStory
                                          .defaultStory ||
                                  _selectableSingleTextButtonStory ==
                                      SelectableSingleTextButtonFoundationStory
                                          .interactive)) ||
                          (_isSelectableIconButtonNav(_nav) &&
                              (_selectableIconButtonStory ==
                                      SelectableIconButtonFoundationStory.defaultStory ||
                                  _selectableIconButtonStory ==
                                      SelectableIconButtonFoundationStory.interactive)) ||
                          (_isSingleTextButtonNav(_nav) &&
                              (_singleTextButtonStory ==
                                      SingleTextButtonFoundationStory
                                          .defaultStory ||
                                  _singleTextButtonStory ==
                                      SingleTextButtonFoundationStory
                                          .interactive)) ||
                          (_isChipNav(_nav) &&
                              (_chipStory == ChipFoundationStory.defaultStory ||
                                  _chipStory == ChipFoundationStory.interactive)) ||
                          (_isRadioNav(_nav) &&
                              (_radioStory == RadioFoundationStory.defaultStory ||
                                  _radioStory == RadioFoundationStory.interactive ||
                                  _radioStory == RadioFoundationStory.motion)) ||
                          (_isCheckboxNav(_nav) &&
                              (_checkboxStory == CheckboxFoundationStory.defaultStory ||
                                  _checkboxStory == CheckboxFoundationStory.interactive ||
                                  _checkboxStory == CheckboxFoundationStory.motion)) ||
                          (_isAvatarNav(_nav) &&
                              (_avatarStory == AvatarFoundationStory.defaultStory ||
                                  _avatarStory == AvatarFoundationStory.interactive)) ||
                          (_isBadgeNav(_nav) &&
                              (_badgeStory == BadgeFoundationStory.defaultStory ||
                                  _badgeStory == BadgeFoundationStory.interactive)) ||
                          (_isCounterBadgeNav(_nav) &&
                              (_counterBadgeStory == CounterBadgeFoundationStory.defaultStory ||
                                  _counterBadgeStory == CounterBadgeFoundationStory.interactive)) ||
                          (_isIndicatorBadgeNav(_nav) &&
                              (_indicatorBadgeStory == IndicatorBadgeFoundationStory.defaultStory ||
                                  _indicatorBadgeStory == IndicatorBadgeFoundationStory.interactive)) ||
                          (_isTextNav(_nav) && _textStory == TextFoundationStory.defaultStory) ||
                          (_isLogoNav(_nav) &&
                              _logoStory == LogoFoundationStory.interactive) ||
                          (_isBottomNavigationNav(_nav) &&
                              (_bottomNavigationStory ==
                                      BottomNavigationFoundationStory.defaultStory ||
                                  _bottomNavigationStory ==
                                      BottomNavigationFoundationStory.interactive)) ||
                          (_isDividerNav(_nav) &&
                              (_dividerStory == DividerFoundationStory.defaultStory ||
                                  _dividerStory == DividerFoundationStory.interactive))))
                        Material(
                          color: scheme.surfaceContainerHighest.withValues(alpha: 0.4),
                          child: Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                            child: Text(
                              _isButtonNav(_nav)
                                  ? 'Default story: use toolbar **Accessibility** for the React Storybook-style panel (violations / passes / inconclusive). **Semantics Debugger** (article icon) overlays labels on mobile + web. Web also runs **axe-core** (same WCAG tags as `test-utils/a11y.ts`).'
                                  : 'Toolbar **Accessibility** mirrors `@storybook/addon-a11y` (axe on Flutter web + semantics checks on all targets).',
                              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                    color: scheme.onSurfaceVariant,
                                  ),
                            ),
                          ),
                        ),
                    ],
                  ),
                ),
              ],
            ),
          );
        },
      ),
          );
        },
      ),
    );
  }
}

enum StoryNav {
  typAllRoles,
  typWeights,
  typFontSlots,
  densitySpacingSideBySide,
  densityTypographySideBySide,
  densityFStepMatrix,
  dimFStep,
  dimSpacing,
  dimGrid,
  dimPlatformMatrix,
  surfacesAllModes,
  surfacesNestedStacking,
  surfacesOnBoldInversion,
  appearanceBackgroundGrid,
  appearanceButtonsByRole,
  strokesStatic,
  strokesDynamic,
  strokesAll,
  componentsButton,
  componentsIcon,
  componentsIconContained,
  componentsIconButton,
  componentsSelectableSingleTextButton,
  componentsSelectableIconButton,
  componentsSingleTextButton,
  componentsChip,
  componentsSelectableButton,
  componentsChipGroup,
  componentsAvatar,
  componentsBadge,
  componentsCounterBadge,
  componentsIndicatorBadge,
  componentsText,
  componentsImage,
  componentsLogo,
  componentsBottomNavigation,
  componentsDivider,
  componentsInput,
  componentsInputField,
  componentsRadio,
  componentsRadioField,
  componentsCheckbox,
  componentsCheckboxField,
  componentsCircularProgressIndicator,
  componentsSlider,
  componentsTouchSlider,
  componentsLinearProgressIndicator,
}

class _NavLeaf extends StatelessWidget {
  static const double _leadingIndent = 6;

  const _NavLeaf({
    required this.label,
    required this.selected,
    required this.onTap,
    this.dense = false,
  });

  final String label;
  final bool selected;
  final VoidCallback? onTap;
  final bool dense;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final titleStyle = Theme.of(context).textTheme.bodyMedium?.copyWith(
          color: onTap == null ? Theme.of(context).disabledColor : null,
          fontWeight: selected ? FontWeight.w600 : FontWeight.normal,
        );
    return Padding(
      padding: const EdgeInsetsDirectional.only(start: _leadingIndent),
      child: Material(
        color: selected ? scheme.secondaryContainer.withValues(alpha: 0.55) : Colors.transparent,
        child: ListTile(
          dense: dense,
          selected: selected,
          selectedTileColor: Colors.transparent,
          enabled: onTap != null,
          horizontalTitleGap: 8,
          title: Text(label, style: titleStyle),
          onTap: onTap,
        ),
      ),
    );
  }
}

/// Placeholder for component categories not yet ported to Flutter Storybook.
class _NavPlaceholder extends StatelessWidget {
  const _NavPlaceholder();

  @override
  Widget build(BuildContext context) {
    return const _NavLeaf(
      label: 'Coming soon',
      selected: false,
      dense: true,
      onTap: null,
    );
  }
}

