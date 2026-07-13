# Native typography languages

Native apps do not get document-wide `:lang()` CSS like web. Instead, **`OneUIBrandProvider`** exposes a `language` prop (Layers RN `TokenProvider` `values.language` parity) that flows through **`TypographyLanguageProvider`** into `useTypographyTokens` and **`Text`**.

## Canonical locale list

Twelve India-core codes (aligned with Layers `Locale` / catalog):

| Code | Label | Script (`getScriptIdsFromLang`) |
| ---- | ----- | ------------------------------- |
| `en` | English | _(none — primary / static weights)_ |
| `hi` | Hindi | `devanagari` |
| `mr` | Marathi | `devanagari` |
| `bn` | Bengali | `bengali` |
| `as` | Assamese | `bengali` |
| `gu` | Gujarati | `gujarati` |
| `kn` | Kannada | `kannada` |
| `ml` | Malayalam | `malayalam` |
| `or` | Odia | `oriya` |
| `pa` | Punjabi | `gurmukhi` |
| `ta` | Tamil | `tamil` |
| `te` | Telugu | `telugu` |

Exported from `@oneui/shared`:

- `SUPPORTED_TYPOGRAPHY_LOCALES`
- `TypographyLocale`, `isTypographyLocale`
- `resolveTypographyLanguage`, `TYPOGRAPHY_LOCALE_LABELS`

**OneUI extras** (not in the Layers 12): `ar`, `ur`, `fa`, `ks` → `arabic` script via `typography-scripts.ts` `langTags`.

## Layers RN parity

| Layers | OneUI native |
| ------ | ------------- |
| `TokenProvider values={{ language: 'hi' }}` | `<OneUIBrandProvider language="hi" />` |
| `resolvedLanguage` on theme context | `useTypographyLanguage().locale` |
| Font map in `transforms.ts` (10 Noto bases) | `buildNativeTypography` → `scriptVariants` + Convex `customFonts` |
| Non-`en` line-height `140` | Script `lineHeightMode` / `reading` vs `ui` on brand config |
| `as` → English fonts in engine | `as` → **Bengali** script (correct for Assamese); load Noto Sans Bengali |

### Layers font base → Convex

Layers hard-codes Noto family **base names** per locale. OneUI resolves fonts from brand **typography → script support** and **`customFonts`** entries whose `familyName` must match `buildNativeTypography` output.

| Locale | Layers RN `fontFamily` base | Typical Convex / Expo `familyName` |
| ------ | --------------------------- | ----------------------------------- |
| `en` | `JioTypeVar` | JioType static cuts (`JioTypeUI-*`) |
| `hi`, `mr` | `NotoSans` / `NotoSansDevanagari` | Brand `uiFontId` for `devanagari` (e.g. `Noto Sans Devanagari`) |
| `bn`, `as` | `NotoSansBengali` | `Noto Sans Bengali` |
| `gu` | `NotoSansGujarati` | `Noto Sans Gujarati` |
| `kn` | `NotoSansKannada` | `Noto Sans Kannada` |
| `ml` | `NotoSansMalayalam` | `Noto Sans Malayalam` |
| `or` | `NotoSansOriya` | `Noto Sans Oriya` |
| `pa` | `NotoSansGurmukhi` | `Noto Sans Gurmukhi` |
| `ta` | `NotoSansTamil` | `Noto Sans Tamil` |
| `te` | `NotoSansTelugu` | `Noto Sans Telugu` |

**Assamese (`as`):** Layers RN engine does not map `as`; register Bengali/Noto Sans Bengali in Convex for Assamese UI.

**Hindi vs Marathi:** Layers uses different Noto bases for `hi` vs `mr`; OneUI uses one **devanagari** profile per brand `scriptSupport` — prefer brand configuration over duplicating the Layers split.

## Usage

```tsx
<OneUIBrandProvider
  foundationData={foundationData}
  componentData={componentData}
  themeMode="light"
  language="hi"
  scriptMode="ui"
>
  <Text variant="body">नमस्ते — uses devanagari from context</Text>
  <Text variant="body" lang="ta">வணக்கம் — explicit override</Text>
</OneUIBrandProvider>
```

- **`useTypographyLanguage()`** — current locale, `scriptId`, `scriptMode`.
- **`useTypographyTokens('body', 'M')`** — picks `script` / `scriptMode` from context when omitted.
- **`Text`** — `lang` defaults from context; `language="others"` infers script from context (deprecated; use `lang` / `script`).
- **`useBrandFonts`** — loads `theme.typography.customFonts` via `expo-font`; provider waits for `fonts.ready` when descriptors exist.

## Font loading requirements

1. Enable scripts in brand typography foundation (`scriptSupport.scripts.*.enabled`).
2. Upload font files to Convex; ensure `customFonts[].familyName` matches emitted `fontFamily` strings.
3. For offline demos, bundle `.ttf` in the sample app and register with Expo — see `apps/native-components-sample` (optional).

## Out of scope (v1)

- String catalogs (months, numerals) from `layers-dependency` i18n
- RTL layout (`I18nManager`) for Arabic/Urdu
- Platform studio language switcher (web uses injected `:lang()` CSS)

## Related

- [`packages/shared/src/data/typography-locales.ts`](../packages/shared/src/data/typography-locales.ts)
- [`packages/ui-native/src/theme/TypographyLanguageContext.tsx`](../packages/ui-native/src/theme/TypographyLanguageContext.tsx)
- [`docs/native-component-build-playbook.md`](./native-component-build-playbook.md)
