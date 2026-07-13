/// One UI Flutter — consumer API (components, theme, offline brand loading).
///
/// - **Production apps:** [OneUiBrandProvider] + [ensureOneUiBrandDefaultsLoaded]
/// - **One UI Studio / live Convex:** `package:ui_flutter/oneui_convex.dart`
/// - **Internal gallery:** `package:ui_flutter/storybook.dart`
library ui_flutter;

// Brand (offline / CDN — no Convex)
export 'brand/brand_scope_mount.dart';
export 'brand/cdn_brand_cache.dart';
export 'brand/oneui_brands_catalog.dart';
export 'brand/default_jio_brand_logo.dart';
export 'brand/default_jio_brand_snapshot.dart';
export 'brand/one_ui_brand_data.dart';
export 'brand/one_ui_brand_provider.dart';
export 'brand/brand_overview_parse.dart';
export 'brand/default_component_properties_map.dart';
export 'brand/default_design_system.dart';
export 'brand/design_system_normalize.dart';
export 'brand/native_snapshot_brand_match.dart';
export 'brand/resolve_brand_canvas.dart';

// CDN prefetch (pure Dart — same URLs as @oneui/native-cdn)
export 'cdn/oneui_cdn_urls.dart';
export 'cdn/oneui_cdn_prefetch.dart';

// Theme + surfaces
export 'theme/one_ui_scope.dart';
export 'theme/surface_scope.dart';
export 'theme/one_ui_root_surface_scope.dart';

// Engine types (snapshots, surface resolution, component token resolution)
export 'engine/color_math.dart'
    show
        ColorPalette,
        RgbPalette,
        hexToRgbTuple,
        rgbToHex,
        preParseRGBPalette,
        getContrastRatioRgb,
        blendWithAlphaRgb,
        solveOpacity,
        getDynamicContrastDirectionRgb,
        rgbBlack,
        rgbWhite,
        rgbGray;
export 'engine/surface_engine.dart';
export 'engine/native_theme_snapshot.dart';
export 'engine/native_typography_snapshot.dart';
export 'engine/native_design_system_payload.dart';
export 'engine/button_color_resolve.dart';
export 'engine/nested_surface_component_resolve.dart';
export 'engine/button_decoration.dart';
export 'engine/focus_ring_resolve.dart';
export 'engine/motion_resolve.dart';
export 'engine/fallback_native_typography_build.dart';
export 'engine/one_ui_text_script.dart';
export 'engine/badge_slot_padding.dart';
export 'engine/icon_size_resolve.dart';
export 'engine/icon_color_resolve.dart';
export 'engine/icon_contained_size_resolve.dart';
export 'engine/icon_contained_color_resolve.dart';
export 'engine/icon_button_color_resolve.dart';
export 'engine/icon_button_size_resolve.dart';
export 'engine/avatar_color_resolve.dart';
export 'engine/avatar_size_resolve.dart';
export 'engine/text_color_resolve.dart';
export 'engine/text_style_resolve.dart';
export 'engine/badge_color_resolve.dart';
export 'engine/badge_size_resolve.dart';
export 'engine/badge_slot_context.dart';
export 'engine/counter_badge_color_resolve.dart';
export 'engine/counter_badge_size_resolve.dart';
export 'engine/indicator_badge_color_resolve.dart';
export 'engine/indicator_badge_size_resolve.dart';
export 'engine/cpi_color_resolve.dart';
export 'engine/cpi_size_resolve.dart';
export 'engine/cpi_motion_resolve.dart';
export 'engine/lpi_color_resolve.dart';
export 'engine/lpi_size_resolve.dart';
export 'engine/lpi_motion_resolve.dart';
export 'engine/chip_color_resolve.dart';
export 'engine/chip_size_resolve.dart';
export 'engine/selectable_single_text_button_color_resolve.dart';
export 'engine/selectable_single_text_button_size_resolve.dart';
export 'engine/chip_slot_kind.dart';
export 'engine/selectable_button_color_resolve.dart';
export 'engine/selectable_button_size_resolve.dart';
export 'engine/radio_color_resolve.dart';
export 'engine/radio_size_resolve.dart';
export 'engine/checkbox_color_resolve.dart';
export 'engine/checkbox_size_resolve.dart';

export 'foundations/surface_palettes.dart'
    show
        buildGreyscalePalette,
        buildColoredPalette,
        buildStorybookDemoThemeConfig;

// Tokens (read-only scale tables)
export 'tokens/platform_foundation_config.dart';
export 'tokens/jio_type_font.dart'
    show
        applyJioVariableFontFallback,
        isJioTypeFamilyName,
        kJioTypeVariableFontFamily,
        kJioTypeVariableFontId,
        normalizeJioTypeFamilyName;
export 'tokens/dimension_scale.dart'
    show
        fSteps,
        platformIds,
        densityIds,
        spacingTokenNames,
        getDimensionValue,
        getSpacingTokenPx,
        fStepAliasForSpacingName,
        fStepAliasForPrimitivesNumericShape,
        gridLayout,
        getGridSpacing,
        getGridMargin,
        getGridGutter;
export 'tokens/typography_scale.dart'
    show
        typographyRoles,
        typographySizes,
        defaultFStepAssignments,
        defaultLineHeightOffsets,
        TypographyEntry,
        typographyTokenName,
        getAllTypographyEntries,
        getTypographyEntriesForBrand,
        resolveTypographyEntryPx,
        resolveFontSlots,
        ResolvedFontSlots,
        resolveFontSlotIds,
        ResolvedFontSlotIds,
        curatedFontIdForTypographyRole,
        roleUsesHeadingFontSlot,
        uploadedFamilyForFontId,
        fontFamilyForTypographyRole,
        resolveBrandFontDisplayName;

// Utils
export 'utils/viewport_to_platform.dart';
export 'utils/brand_dimension_bar_color.dart'
    show
        resolveDimensionBarAccentColor,
        primaryBoldFromRootRoles,
        parseHexColor;
export 'utils/one_ui_hex_color.dart' show oneUiHexColor;

// Icons
export 'icons/jio_semantic_mapping.dart';
export 'icons/jio_icon_catalog.dart';

// Components
export 'widgets/badge_slot_utils.dart';
export 'widgets/badge_surface_immune_scope.dart';
export 'widgets/one_ui_surface.dart';
export 'widgets/convex_gap_card.dart';
export 'widgets/one_ui_focus_interactive.dart';
export 'widgets/semantic_icon_material.dart';
export 'widgets/one_ui_icon_types.dart';
export 'widgets/one_ui_icon_a11y.dart';
export 'widgets/one_ui_slot_parent_appearance.dart';
export 'widgets/one_ui_icon.dart';
export 'widgets/one_ui_button_types.dart';
export 'widgets/one_ui_button.dart';
export 'widgets/one_ui_icon_contained_types.dart';
export 'widgets/one_ui_icon_contained_a11y.dart';
export 'widgets/one_ui_icon_contained.dart';
export 'widgets/one_ui_icon_button_types.dart';
export 'widgets/one_ui_icon_button.dart';
export 'widgets/one_ui_selectable_single_text_button.dart';
export 'widgets/one_ui_selectable_icon_button.dart';
export 'widgets/one_ui_single_text_button_types.dart';
export 'widgets/one_ui_single_text_button.dart';
export 'widgets/one_ui_avatar_types.dart';
export 'widgets/one_ui_avatar_a11y.dart';
export 'widgets/one_ui_avatar_glyphs.dart';
export 'widgets/one_ui_avatar.dart';
export 'widgets/one_ui_text_types.dart';
export 'widgets/one_ui_text_a11y.dart';
export 'widgets/one_ui_text.dart';
export 'widgets/one_ui_badge_types.dart';
export 'widgets/one_ui_badge_a11y.dart';
export 'widgets/one_ui_badge.dart';
export 'widgets/one_ui_counter_badge_types.dart';
export 'widgets/one_ui_counter_badge_a11y.dart';
export 'widgets/one_ui_counter_badge.dart';
export 'widgets/one_ui_indicator_badge_types.dart';
export 'widgets/one_ui_indicator_badge_a11y.dart';
export 'widgets/one_ui_indicator_badge.dart';
export 'widgets/one_ui_indicator_badge_overlay.dart';
export 'widgets/one_ui_chip.dart';
export 'widgets/one_ui_chip_a11y.dart';
export 'widgets/one_ui_selectable_button.dart';
export 'widgets/one_ui_chip_group.dart';
export 'widgets/one_ui_radio.dart';
export 'widgets/one_ui_radio_group.dart';
export 'widgets/one_ui_circular_progress_indicator.dart';
export 'widgets/one_ui_circular_progress_indicator_a11y.dart';
export 'widgets/one_ui_linear_progress_indicator.dart';
export 'widgets/one_ui_linear_progress_indicator_a11y.dart';
export 'widgets/one_ui_loading_spinner.dart';
export 'engine/image_style_resolve.dart';
export 'widgets/one_ui_image_types.dart';
export 'widgets/one_ui_image_a11y.dart';
export 'engine/input_size_resolve.dart';
export 'engine/input_color_resolve.dart';
export 'engine/input_dynamic_text_resolve.dart';
export 'engine/input_feedback_resolve.dart';
export 'widgets/one_ui_input_types.dart';
export 'widgets/one_ui_aria_described_by.dart';
export 'widgets/one_ui_input_a11y.dart';
export 'widgets/one_ui_web_aria_described_by.dart';
export 'widgets/one_ui_input_autofill.dart';
export 'widgets/one_ui_input.dart';
export 'widgets/one_ui_input_dynamic_text_types.dart';
export 'widgets/one_ui_input_dynamic_text_a11y.dart';
export 'widgets/one_ui_input_dynamic_text.dart';
export 'widgets/one_ui_input_feedback_types.dart';
export 'widgets/one_ui_input_feedback_a11y.dart';
export 'widgets/one_ui_input_feedback.dart';
export 'widgets/one_ui_input_field_types.dart';
export 'widgets/one_ui_input_field_a11y.dart';
export 'widgets/one_ui_input_field.dart';
export 'widgets/one_ui_radio_field.dart';
export 'widgets/one_ui_checkbox.dart';
export 'widgets/one_ui_checkbox_group.dart';
export 'widgets/one_ui_checkbox_field.dart';
export 'widgets/one_ui_slider.dart';
export 'widgets/one_ui_touch_slider.dart';
export 'engine/slider_color_resolve.dart';
export 'engine/slider_size_resolve.dart';
export 'engine/slider_motion_resolve.dart';
export 'engine/slider_value_math.dart';
export 'engine/slider_active_track_geometry.dart';
export 'engine/touch_slider_color_resolve.dart';
export 'engine/touch_slider_size_resolve.dart';
export 'engine/touch_slider_motion_resolve.dart';
export 'engine/touch_slider_cap_ratio.dart';
export 'foundations/input_field_brand_bind.dart';
export 'engine/logo_size_resolve.dart';
export 'engine/logo_color_resolve.dart';
export 'engine/logo_material_resolve.dart';
export 'engine/logo_svg_material.dart';
export 'widgets/one_ui_logo_types.dart';
export 'widgets/one_ui_logo_a11y.dart';
export 'widgets/one_ui_logo.dart';
export 'widgets/one_ui_brand_logo.dart';
export 'foundations/logo_brand_bind.dart';
export 'engine/bottom_navigation_color_resolve.dart';
export 'engine/bottom_navigation_size_resolve.dart';
export 'brand/divider_brand_bind.dart';
export 'engine/divider_color_resolve.dart';
export 'engine/divider_size_resolve.dart';
export 'widgets/one_ui_bottom_navigation_types.dart';
export 'widgets/one_ui_bottom_navigation_scope.dart';
export 'widgets/one_ui_bottom_navigation.dart';
export 'widgets/one_ui_divider_types.dart';
export 'widgets/one_ui_divider_a11y.dart';
export 'widgets/one_ui_divider.dart';
