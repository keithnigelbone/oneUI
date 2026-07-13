import 'dart:ui' show FontFeature, FontVariation;

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// Loads a [TextStyle] from Google Fonts for the Storybook foundations preview.
///
/// Without this, bare `fontFamily:` family name strings resolve to the platform
/// default sans font — slots, code, and weights collapse visually.
///
/// Uploaded fonts use [uploadedFamilyName] (Convex `familyName`).
/// `jiotype-var` is bundled in the `ui_flutter` package (`pubspec.yaml` → `fonts:`) as
/// **JioType Variable** (same family name as web + shared `fonts.ts`).
///
/// When [omitFontWeight] is true (static per-weight font cuts on Android), the
/// returned style omits `fontWeight` — parity with RN `weightViaFontFamily`.
TextStyle storybookLoadedTextStyle({
  required String fontId,
  String? uploadedFamilyName,
  required double fontSize,
  required double lineHeightPx,
  FontWeight? fontWeight,
  Color? color,
  double? letterSpacing,
  List<FontVariation>? fontVariations,
  List<FontFeature>? fontFeatures,
  bool omitFontWeight = false,
}) {
  final height = lineHeightPx / fontSize;
  final weight = fontWeight ?? FontWeight.w400;

  TextStyle withExtras(TextStyle style) => style.copyWith(
        letterSpacing: letterSpacing ?? style.letterSpacing,
        fontVariations: fontVariations ?? style.fontVariations,
        fontFeatures: fontFeatures ?? style.fontFeatures,
      );

  TextStyle familyStyle(String fontFamily) {
    if (omitFontWeight) {
      return TextStyle(
        fontFamily: fontFamily,
        fontSize: fontSize,
        height: height,
        color: color,
        letterSpacing: letterSpacing,
        fontVariations: fontVariations,
        fontFeatures: fontFeatures,
      );
    }
    return TextStyle(
      fontFamily: fontFamily,
      fontSize: fontSize,
      height: height,
      fontWeight: weight,
      color: color,
      letterSpacing: letterSpacing,
      fontVariations: fontVariations,
      fontFeatures: fontFeatures,
    );
  }

  TextStyle google(TextStyle Function() loaded) => withExtras(loaded());

  if (uploadedFamilyName != null && uploadedFamilyName.trim().isNotEmpty) {
    return familyStyle(uploadedFamilyName.trim());
  }

  switch (fontId) {
    case 'jiotype-var':
      return familyStyle('JioType Variable');
    case 'inter':
      return google(() => omitFontWeight
          ? GoogleFonts.inter(fontSize: fontSize, height: height, color: color)
          : GoogleFonts.inter(
              fontSize: fontSize,
              fontWeight: weight,
              height: height,
              color: color));
    case 'roboto-flex':
      return google(() => omitFontWeight
          ? GoogleFonts.robotoFlex(
              fontSize: fontSize, height: height, color: color)
          : GoogleFonts.robotoFlex(
              fontSize: fontSize,
              fontWeight: weight,
              height: height,
              color: color));
    case 'roboto':
      return google(() => omitFontWeight
          ? GoogleFonts.roboto(fontSize: fontSize, height: height, color: color)
          : GoogleFonts.roboto(
              fontSize: fontSize,
              fontWeight: weight,
              height: height,
              color: color));
    case 'open-sans':
      return google(() => omitFontWeight
          ? GoogleFonts.openSans(
              fontSize: fontSize, height: height, color: color)
          : GoogleFonts.openSans(
              fontSize: fontSize,
              fontWeight: weight,
              height: height,
              color: color));
    case 'lato':
      return google(() => omitFontWeight
          ? GoogleFonts.lato(fontSize: fontSize, height: height, color: color)
          : GoogleFonts.lato(
              fontSize: fontSize,
              fontWeight: weight,
              height: height,
              color: color));
    case 'poppins':
      return google(() => omitFontWeight
          ? GoogleFonts.poppins(
              fontSize: fontSize, height: height, color: color)
          : GoogleFonts.poppins(
              fontSize: fontSize,
              fontWeight: weight,
              height: height,
              color: color));
    case 'montserrat':
      return google(() => omitFontWeight
          ? GoogleFonts.montserrat(
              fontSize: fontSize, height: height, color: color)
          : GoogleFonts.montserrat(
              fontSize: fontSize,
              fontWeight: weight,
              height: height,
              color: color));
    case 'playfair-display':
      return google(() => omitFontWeight
          ? GoogleFonts.playfairDisplay(
              fontSize: fontSize, height: height, color: color)
          : GoogleFonts.playfairDisplay(
              fontSize: fontSize,
              fontWeight: weight,
              height: height,
              color: color));
    case 'merriweather':
      return google(() => omitFontWeight
          ? GoogleFonts.merriweather(
              fontSize: fontSize, height: height, color: color)
          : GoogleFonts.merriweather(
              fontSize: fontSize,
              fontWeight: weight,
              height: height,
              color: color));
    case 'lora':
      return google(() => omitFontWeight
          ? GoogleFonts.lora(fontSize: fontSize, height: height, color: color)
          : GoogleFonts.lora(
              fontSize: fontSize,
              fontWeight: weight,
              height: height,
              color: color));
    case 'source-serif':
      return google(() => omitFontWeight
          ? GoogleFonts.sourceSerif4(
              fontSize: fontSize, height: height, color: color)
          : GoogleFonts.sourceSerif4(
              fontSize: fontSize,
              fontWeight: weight,
              height: height,
              color: color));
    case 'jetbrains-mono':
      return google(() => omitFontWeight
          ? GoogleFonts.jetBrainsMono(
              fontSize: fontSize, height: height, color: color)
          : GoogleFonts.jetBrainsMono(
              fontSize: fontSize,
              fontWeight: weight,
              height: height,
              color: color));
    case 'fira-code':
      return google(() => omitFontWeight
          ? GoogleFonts.firaCode(
              fontSize: fontSize, height: height, color: color)
          : GoogleFonts.firaCode(
              fontSize: fontSize,
              fontWeight: weight,
              height: height,
              color: color));
    case 'source-code-pro':
      return google(() => omitFontWeight
          ? GoogleFonts.sourceCodePro(
              fontSize: fontSize, height: height, color: color)
          : GoogleFonts.sourceCodePro(
              fontSize: fontSize,
              fontWeight: weight,
              height: height,
              color: color));
    case 'noto-sans':
      return google(() => omitFontWeight
          ? GoogleFonts.notoSans(
              fontSize: fontSize, height: height, color: color)
          : GoogleFonts.notoSans(
              fontSize: fontSize,
              fontWeight: weight,
              height: height,
              color: color));
    case 'noto-sans-devanagari':
      return google(() => omitFontWeight
          ? GoogleFonts.notoSansDevanagari(
              fontSize: fontSize, height: height, color: color)
          : GoogleFonts.notoSansDevanagari(
              fontSize: fontSize,
              fontWeight: weight,
              height: height,
              color: color));
    case 'noto-sans-tamil':
      return google(() => omitFontWeight
          ? GoogleFonts.notoSansTamil(
              fontSize: fontSize, height: height, color: color)
          : GoogleFonts.notoSansTamil(
              fontSize: fontSize,
              fontWeight: weight,
              height: height,
              color: color));
    case 'noto-sans-telugu':
      return google(() => omitFontWeight
          ? GoogleFonts.notoSansTelugu(
              fontSize: fontSize, height: height, color: color)
          : GoogleFonts.notoSansTelugu(
              fontSize: fontSize,
              fontWeight: weight,
              height: height,
              color: color));
    case 'noto-sans-bengali':
      return google(() => omitFontWeight
          ? GoogleFonts.notoSansBengali(
              fontSize: fontSize, height: height, color: color)
          : GoogleFonts.notoSansBengali(
              fontSize: fontSize,
              fontWeight: weight,
              height: height,
              color: color));
    case 'noto-sans-gujarati':
      return google(() => omitFontWeight
          ? GoogleFonts.notoSansGujarati(
              fontSize: fontSize, height: height, color: color)
          : GoogleFonts.notoSansGujarati(
              fontSize: fontSize,
              fontWeight: weight,
              height: height,
              color: color));
    case 'noto-sans-kannada':
      return google(() => omitFontWeight
          ? GoogleFonts.notoSansKannada(
              fontSize: fontSize, height: height, color: color)
          : GoogleFonts.notoSansKannada(
              fontSize: fontSize,
              fontWeight: weight,
              height: height,
              color: color));
    case 'noto-sans-malayalam':
      return google(() => omitFontWeight
          ? GoogleFonts.notoSansMalayalam(
              fontSize: fontSize, height: height, color: color)
          : GoogleFonts.notoSansMalayalam(
              fontSize: fontSize,
              fontWeight: weight,
              height: height,
              color: color));
    case 'noto-sans-arabic':
      return google(() => omitFontWeight
          ? GoogleFonts.notoSansArabic(
              fontSize: fontSize, height: height, color: color)
          : GoogleFonts.notoSansArabic(
              fontSize: fontSize,
              fontWeight: weight,
              height: height,
              color: color));
    case 'noto-sans-hebrew':
      return google(() => omitFontWeight
          ? GoogleFonts.notoSansHebrew(
              fontSize: fontSize, height: height, color: color)
          : GoogleFonts.notoSansHebrew(
              fontSize: fontSize,
              fontWeight: weight,
              height: height,
              color: color));
    case 'noto-sans-thai':
      return google(() => omitFontWeight
          ? GoogleFonts.notoSansThai(
              fontSize: fontSize, height: height, color: color)
          : GoogleFonts.notoSansThai(
              fontSize: fontSize,
              fontWeight: weight,
              height: height,
              color: color));
    default:
      return google(() => omitFontWeight
          ? GoogleFonts.notoSans(
              fontSize: fontSize, height: height, color: color)
          : GoogleFonts.notoSans(
              fontSize: fontSize,
              fontWeight: weight,
              height: height,
              color: color));
  }
}
