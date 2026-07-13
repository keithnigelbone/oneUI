# Build Spec — Functional JioMart-style Demo App (Flutter, OneUI components ONLY)

> **Audience:** an implementing model/engineer who must produce a single, fully-functional
> Flutter screen. This document is **self-contained**. Do not invent APIs — every prop below
> is taken from the real `package:ui_flutter` source. If a prop is not listed here, do not use it.
>
> **Visual reference:** https://www.jiomart.com (grocery / e-commerce storefront).
> Recreate the *spirit* (search, categories, product cards, offers, cart, checkout, bottom nav),
> not a pixel-perfect clone.

---

## 1. Mission

Create **one functional Flutter page** (`StatefulWidget`) named `DemoShopScreen` that mimics a JioMart
storefront and **uses ALL 24 OneUI Flutter components at least once**. The page must be *interactive*:
search filters, category chips switch the product list, "Add to cart" updates a live cart counter,
checkout shows a loading spinner then a success feedback message, bottom navigation switches tabs.

It must look and behave like a real mini-app — not a component gallery.

---

## 2. NON-NEGOTIABLE RULES

1. **ONLY the 24 OneUI components may render visible UI.** They are:
   `OneUiAvatar`, `OneUiBadge`, `OneUiBottomNavigation`, `OneUiBottomNavItem`, `OneUiButton`,
   `OneUiCheckbox`, `OneUiCheckboxField`, `OneUiChip`, `OneUiChipGroup`,
   `OneUiCircularProgressIndicator`, `OneUiCounterBadge`, `OneUiDivider`, `OneUiIcon`,
   `OneUiIconButton`, `OneUiIconContained`, `OneUiImage`, `OneUiIndicatorBadge`, `OneUiInput`,
   `OneUiInputDynamicText`, `OneUiInputFeedback`, `OneUiInputField`, `OneUiLogo` (or `OneUiBrandLogo`),
   `OneUiRadio` / `OneUiRadioField`, `OneUiText`.
2. **No Material content widgets** for visible content. ❌ Do NOT use `Text`, `Icon`, `Image`,
   `TextField`, `ElevatedButton`, `Card`, `Chip`, `CircularProgressIndicator`, `Divider`,
   `BottomNavigationBar`, `AppBar`, `ListTile`, etc.
   - **Allowed** layout-only Flutter primitives: `Scaffold` (transparent), `Column`, `Row`, `Wrap`,
     `Stack`, `Expanded`, `Flexible`, `Padding`, `SizedBox`, `Center`, `Align`, `ListView`,
     `SingleChildScrollView`, `GridView`, `Container` **(only for layout/spacing — never for a
     background colour, border, or text)**, `IndexedStack`, `SafeArea`.
   - Every piece of **text** must be `OneUiText`. Every **icon** must be `OneUiIcon`/`OneUiIconButton`/
     `OneUiIconContained`. Every **image** must be `OneUiImage`.
3. **Zero hard-coded visual values.** No literal hex colours, no literal font sizes/weights,
   no manual `BoxDecoration(color: ...)`. Colour, type, and shape come from the components and
   from token-resolved spacing (see §4). Spacing/sizing **must** come from `getSpacingTokenPx(...)`
   — never raw pixel literals like `16.0`.
4. **Surfaces, not coloured divs.** Any tinted / dark / "card" background MUST be an `OneUiSurface`
   (`mode: 'subtle' | 'moderate' | 'bold' | 'elevated' | 'minimal' | 'ghost' | 'default'`).
   Never paint a background on a `Container`.
5. **No forked behaviour.** Use the component props as documented. Don't reimplement a chip,
   a checkbox, etc. with raw widgets.
6. **Accessibility is mandatory.** Every icon-only control needs `semanticsLabel`. Every
   `OneUiIndicatorBadge` / `OneUiIconButton` / `OneUiBottomNavigation` requires its label prop.
7. The file must **compile and run** with no analyzer errors.

> If you cannot accomplish something with a OneUI component, leave a `// TODO:` comment — do **not**
> reach for a Material widget.

---

## 3. Project setup / scaffold

The app already exists under `apps/flutter_sample`. Add the new screen there, or follow this exact
bootstrap if creating fresh. The single required import is:

```dart
import 'package:flutter/material.dart'; // layout primitives + Scaffold ONLY
import 'package:ui_flutter/ui_flutter.dart';
```

**`main()` must initialise the brand + icons before `runApp`:**

```dart
Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await JioIconCatalog.instance.ensureLoaded();          // loads semantic icons
  await ensureOneUiBrandDefaultsLoaded(loadCdnManifest: true); // loads Jio brand tokens
  runApp(const DemoApp());
}
```

**Wrap the whole app in `OneUiBrandProvider` → `OneUiSurface(mode: 'default')`:**

```dart
class DemoApp extends StatelessWidget {
  const DemoApp({super.key});
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'OneUI JioMart Demo',
      theme: ThemeData(
        useMaterial3: true,
        scaffoldBackgroundColor: Colors.transparent,
        canvasColor: Colors.transparent,
      ),
      home: const OneUiBrandProvider(
        brand: 'jio',
        theme: 'jiomart',     // JioMart sub-theme; use null for base Jio
        mode: 'light',        // 'light' | 'dark'
        platformId: 'S-360',  // mobile breakpoint
        density: 'default',   // 'compact' | 'default' | 'open'
        child: Scaffold(
          backgroundColor: Colors.transparent,
          body: OneUiSurface(mode: 'default', child: DemoShopScreen()),
        ),
      ),
    );
  }
}
```

> `OneUiBrandProvider` named params: `brand` (String slug e.g. `'jio'`), `theme` (sub-brand slug,
> nullable), `mode` (`'light'`/`'dark'`), `platformId` (e.g. `'S-360'`), `density`
> (`'compact'`/`'default'`/`'open'`), `child` (required).

**Token-resolved spacing helper** — use this for ALL gaps/padding instead of pixel literals:

```dart
double space(BuildContext context, String token) {
  final scope = OneUiScope.of(context);
  return getSpacingTokenPx(
    spacingName: token,                 // '1','2','3','4','5','6','8' ... (see CLAUDE.md Spacing list)
    platform: scope.platformId,
    density: scope.density,
    platformsConfig: scope.platformsFoundationConfig,
  );
}
// usage: SizedBox(height: space(context, '4'))  or  EdgeInsets.all(space(context, '6'))
```

---

## 4. Page layout (JioMart-inspired) & where each component goes

The screen is an `IndexedStack` of 4 tabs driven by `OneUiBottomNavigation`. **Home** is the rich tab;
the other three can be simpler but must still use OneUI components only.

```
┌──────────────────────────────────────────────┐
│ HEADER (Row)                                   │
│  [Logo] [Search Input..............] [🔔•] [👤]│  ← Logo, Input, IconButton+IndicatorBadge, Avatar
├──────────────────────────────────────────────┤
│ Delivery row: 📍 InputField (pincode) + Change │  ← InputField + InputDynamicText
├──────────────────────────────────────────────┤
│ ChipGroup: All · Grocery · Fresh · Electronics │  ← ChipGroup + Chip  (filters product list)
├──────────────────────────────────────────────┤
│ Category circles: IconContained × 4 + Text      │  ← IconContained
├──────────────────────────────────────────────┤
│ Divider  "Top deals"                            │  ← Divider (content: label)
├──────────────────────────────────────────────┤
│ PRODUCT GRID (GridView, OneUiSurface cards)     │
│  ┌─ Surface(elevated) ─┐  ┌──────────────────┐  │
│  │ Image               │  │  Badge "Bestsell"│  │  ← Image, Badge
│  │ Text name / price   │  │  Button Add+     │  │  ← Text, Button
│  └─────────────────────┘  └──────────────────┘  │
├──────────────────────────────────────────────┤
│ Checkout panel (Surface subtle)                 │
│  RadioField: payment method                     │  ← RadioField + Radio
│  CheckboxField: agree to terms                  │  ← CheckboxField (+ Checkbox in filters)
│  CircularProgressIndicator while "placing"      │  ← CircularProgressIndicator
│  InputFeedback success/error                    │  ← InputFeedback
│  Button "Place order"  (CounterBadge on cart)   │  ← Button, CounterBadge
└──────────────────────────────────────────────┤
│ BOTTOM NAV: Home · Categories · Cart(•3) · Acct │  ← BottomNavigation + BottomNavItem (+ CounterBadge)
└──────────────────────────────────────────────┘
```

### Required functional behaviours
- **Search** (`OneUiInput`): typing filters the product grid by name (case-insensitive `contains`).
- **Category chips** (`OneUiChipGroup`, single-select): selecting a chip filters products by category.
- **Add to cart** (`OneUiButton` on each card): increments `int _cartCount`; the cart `CounterBadge`
  in both the bottom nav and checkout panel updates live via `setState`.
- **Quantity stepper**: an `OneUiIconButton` (`icon: 'remove'`) + `OneUiText` count + `OneUiIconButton`
  (`icon: 'add'`) demonstrates `OneUiIconButton`.
- **Place order** (`OneUiButton`): sets `_placing = true` → show `OneUiCircularProgressIndicator`
  (indeterminate) for a short simulated delay (`Future.delayed`) → set `_orderPlaced = true` →
  render `OneUiInputFeedback(variant: positive, "Order placed!")`. If terms checkbox is unchecked,
  block and show `OneUiInputFeedback(variant: negative, "Please accept terms")`.
- **Bottom nav**: switches the active tab index (`IndexedStack`).
- **Pincode field** (`OneUiInputField`) with an `OneUiInputDynamicText` "Change" trailing affordance.

---

## 5. Component API reference (authoritative — use exactly these props)

> Convention: most "variant/size/appearance/attention" props are **String typedefs** (pass a raw
> string like `'subtle'`), a few are real Dart `enum`s (pass `OneUiXxx.value`). Both are noted.
> `appearance` roles (where supported): `auto | neutral | primary | secondary | sparkle | positive |
> negative | warning | informative | brand-bg`.

### 5.1 OneUiText  *(all text on screen)*
```dart
OneUiText(
  text: 'Welcome to JioMart',
  variant: OneUiTextVariant.headline, // enum: body|label|title|headline|display|code
  size: 'M',          // body/label: 3XS..2XL ; display/headline/title: L|M|S ; code: M|S|XS
  weight: OneUiTextWeight.high,       // enum: high|medium|low
  attention: OneUiTextAttention.none, // enum: none|high|medium|low|tintedA11y
  appearance: 'auto',
  maxLines: 2,
  textAlign: OneUiTextAlign.left,     // enum?: left|center|right
)
```
Pass content via `text:` (String) **or** `child:` (Widget). Never use Material `Text`.

### 5.2 OneUiButton
```dart
OneUiButton(
  label: 'Add to cart',               // OR child:
  variant: OneUiButtonVariant.bold,   // enum: bold|subtle|ghost
  appearance: 'primary',
  size: 10,                           // int f-step: 6|8|10|12  (or sizeAlias: 's'|'m'|'l')
  fullWidth: false,
  loading: false,
  disabled: false,
  startSemanticIcon: 'add',           // String icon name (see §6)
  onPressed: () { /* ... */ },
)
```

### 5.3 OneUiIconButton  *(icon-only action)*
```dart
OneUiIconButton(
  icon: 'notification',               // required: String name OR Widget
  semanticsLabel: 'Notifications',    // REQUIRED
  variant: OneUiIconButtonVariant.ghost, // enum?: bold|subtle|ghost
  appearance: 'neutral',
  size: 10,                           // int: 4|6|8|10|12|14
  onPressed: () {},
)
```

### 5.4 OneUiIconContained  *(category circle)*
```dart
OneUiIconContained(
  icon: 'home',                       // required
  size: 'l',                          // String: xs|s|m|l|xl
  appearance: 'primary',              // String?: primary|secondary|neutral|sparkle|brand-bg|positive|...
  attention: OneUiIconContainedAttention.medium, // enum: high|medium
  semanticsLabel: 'Groceries',
)
```

### 5.5 OneUiIcon  *(decorative / inline glyph)*
```dart
OneUiIcon(
  icon: 'search',                     // required: String name | URL | Widget
  size: '5',                          // String f-step: 2|2.5|3|3.5|4|4.5|5|6|7|8|9|10|12|14|16|18|20|24|32|40
  appearance: 'neutral',              // String?
  emphasis: OneUiIconEmphasis.high,   // enum: high|medium|low|tinted|tintedA11y
  excludeFromSemantics: true,         // when purely decorative
)
```

### 5.6 OneUiInput  *(raw search field)*
```dart
OneUiInput(
  placeholder: 'Search for products',
  value: _query,
  onChanged: (v) => setState(() => _query = v),
  start: const OneUiIcon(icon: 'search', size: '4', excludeFromSemantics: true),
  size: 10,                           // int 6|8|10|12 OR String 'xs'|'s'|'m'|'l'
  appearance: OneUiInputAppearance.auto,   // enum: auto|primary|secondary|neutral|sparkle|positive|negative|warning|informative
  shape: OneUiInputShape.pill,             // enum: defaultShape|pill
  ariaLabel: 'Search products',
)
```
Wrap in `SizedBox(width: double.infinity)` or `Expanded` to set width.

### 5.7 OneUiInputField  *(labelled field w/ helper)*
```dart
OneUiInputField(
  label: 'Delivery pincode',
  placeholder: '400001',
  value: _pincode,
  onChanged: (v) => setState(() => _pincode = v),
  fullWidth: true,
  required: true,
  type: 'number',
  error: _pincodeError,               // String? -> shows error state
  start: const OneUiIcon(icon: 'location', size: '4'),
)
```

### 5.8 OneUiInputDynamicText  *("Change" / counter line)*
```dart
OneUiInputDynamicText(
  content: 'Deliver to 400001',
  end: 'Change',                      // trailing actionable text
  size: 's',                          // 's'|'m'|'l'
  onEndClick: () { /* open pincode editor */ },
  endAriaLabel: 'Change delivery pincode',
)
```

### 5.9 OneUiInputFeedback  *(form result message)*
```dart
OneUiInputFeedback(
  variant: OneUiInputFeedbackVariant.positive,  // enum: negative|positive|warning|informative
  attention: OneUiInputFeedbackAttention.low,   // enum: low|medium|high
  feedbackMessage: 'Order placed successfully!',
)
```

### 5.10 OneUiChipGroup + OneUiChip  *(category filter)*
```dart
OneUiChipGroup(
  defaultValue: const ['all'],        // List<String>
  multiple: false,                    // single-select for category filter
  onValueChange: (vals) => setState(() => _category = vals.isEmpty ? 'all' : vals.first),
  children: const [
    OneUiChip(value: 'all',         child: 'All'),
    OneUiChip(value: 'grocery',     child: 'Grocery'),
    OneUiChip(value: 'fresh',       child: 'Fresh'),
    OneUiChip(value: 'electronics', child: 'Electronics'),
  ],
)
```
`OneUiChip` `child:` is `Object?` (String OK). Chip `appearance` excludes `sparkle`/`brand-bg`.

### 5.11 OneUiCheckboxField + OneUiCheckbox
```dart
// Field wrapper (single control with label/error/feedback):
OneUiCheckboxField(
  label: 'I agree to the Terms & Conditions',
  checked: _agree,
  onCheckedChange: (v) => setState(() => _agree = v),
  required: true,
  error: _agreeError,                 // String?
)

// Bare checkbox (e.g. an "in stock only" filter):
OneUiCheckbox(
  label: 'In stock only',
  checked: _inStockOnly,
  onCheckedChange: (v) => setState(() => _inStockOnly = v),
  appearance: 'primary',              // String
  size: 'm',                          // 's'|'m'|'l'
)
```

### 5.12 OneUiRadioField + OneUiRadio  *(payment method)*
```dart
OneUiRadioField(
  label: 'Payment method',
  fullWidth: true,
  defaultValue: 'upi',
  onValueChange: (v) => setState(() => _payment = v),
  children: const [
    OneUiRadio(label: 'UPI',                 value: 'upi'),
    OneUiRadio(label: 'Cash on delivery',    value: 'cod'),
    OneUiRadio(label: 'Credit / Debit card', value: 'card'),
  ],
)
```
`OneUiRadio` size/appearance are Strings (`'m'`, `'primary'`, …).

### 5.13 OneUiCircularProgressIndicator  *(checkout spinner)*
```dart
OneUiCircularProgressIndicator(
  variant: 'indeterminate',           // String: 'determinate'|'indeterminate'
  size: 'M',                          // String: 2XS..5XL
  appearance: 'primary',
  animate: true,
  semanticsLabel: 'Placing your order',
)
```

### 5.14 OneUiDivider  *(section separators)*
```dart
// plain rule:
OneUiDivider(size: 'm')              // size 's'|'m'|'l', orientation 'horizontal'|'vertical'
// labelled:
OneUiDivider(content: kOneUiDividerContentLabel, child: 'Top deals')
```

### 5.15 OneUiImage  *(product photos)*
```dart
OneUiImage(
  src: 'https://www.jiomart.com/images/product/.../image.jpg', // required
  alt: 'Fortune Sunlite Oil 1L',      // required
  aspectRatio: OneUiImageAspectRatio.r1x1, // enum
  fit: OneUiImageObjectFit.cover,     // enum
  borderRadiusToken: '--Shape-3',
  fallbackSrc: '...',                 // optional placeholder
)
```
Use real JioMart-style placeholder URLs or any reachable image; rely on `fallback`/`fallbackSrc`.

### 5.16 OneUiAvatar  *(user profile in header)*
```dart
OneUiAvatar(
  content: OneUiAvatarContent.text,   // enum: image|icon|text
  size: 'm',                          // String: 2xs|xs|s|m|l|xl|2xl
  appearance: 'primary',
  alt: 'SP',                          // initials when content==text
  // for image: content: image, src: '...'
)
```

### 5.17 OneUiBadge  *(product tag, e.g. "Bestseller")*
```dart
OneUiBadge(
  child: 'Bestseller',                // Object? (stringified)
  variant: 'subtle',                  // String?: bold|subtle|ghost
  appearance: 'positive',
  size: 's',                          // xs|s|m|l|xl
  start: const OneUiIcon(icon: 'starFilled', size: '3', excludeFromSemantics: true),
  semanticsLabel: 'Bestseller',
)
```

### 5.18 OneUiCounterBadge  *(cart item count)*
```dart
OneUiCounterBadge(
  value: _cartCount,                  // required int
  max: 99,
  appearance: 'negative',
  size: 's',
  semanticsLabel: '$_cartCount items in cart',
)
```

### 5.19 OneUiIndicatorBadge (+ overlay)  *(dot on the bell icon)*
```dart
OneUiIndicatorBadgeOverlay(
  hostSide: 40,
  anchor: OneUiIndicatorBadgeOverlayAnchor.topEnd,  // enum: topEnd|bottomEnd
  indicatorSize: 's',                               // String
  host: OneUiIconButton(icon: 'notification', semanticsLabel: 'Notifications', onPressed: () {}),
  indicator: const OneUiIndicatorBadge(
    size: 's', appearance: 'negative', semanticsLabel: 'New notifications',
  ),
)
```
`OneUiIndicatorBadge` requires `semanticsLabel`.

### 5.20 OneUiLogo / OneUiBrandLogo  *(header brand mark)*
```dart
OneUiBrandLogo(size: OneUiLogoSize.m, alt: 'JioMart')  // uses active brand logo
// or generic:
OneUiLogo(alt: 'JioMart', variant: OneUiLogoVariant.full, size: OneUiLogoSize.m)
```

### 5.21 OneUiBottomNavigation + OneUiBottomNavItem
```dart
OneUiBottomNavigation(
  semanticsLabel: 'Primary navigation',   // REQUIRED
  defaultValue: 'home',
  onValueChange: (v) => setState(() => _activeTab = v),
  appearance: 'primary',
  labelType: '1line',                      // 'none'|'1line'|'2line'
  children: const [
    OneUiBottomNavItem(icon: 'home',     label: 'Home',       value: 'home'),
    OneUiBottomNavItem(icon: 'grid',     label: 'Categories', value: 'categories'),
    OneUiBottomNavItem(icon: 'list',     label: 'Cart',       value: 'cart'),
    OneUiBottomNavItem(icon: 'user',     label: 'Account',    value: 'account'),
  ],
)
```
Min 2, max 5 items. `icon`/`activeIcon` accept a String name or a Widget. Place a `OneUiCounterBadge`
near the Cart label (e.g. wrap label area) to show cart count.

### 5.22 OneUiSurface  *(every card / tinted region)*
```dart
OneUiSurface(
  mode: 'elevated',   // 'default'|'ghost'|'minimal'|'subtle'|'moderate'|'bold'|'elevated'
  appearance: 'auto',
  padding: EdgeInsets.all(space(context, '4')),
  borderRadius: BorderRadius.circular(space(context, '3')),
  child: /* card content */,
)
```
Wrap each product card and the checkout panel in a `OneUiSurface`. **No coloured `Container`s.**

---

## 6. Valid semantic icon names

Use ONLY these string names for `icon:` props (representative set — all exist in the catalog):

```
add remove close edit delete copy save refresh download upload share link unlink
menu search home settings arrowLeft arrowRight arrowUp arrowDown
chevronLeft chevronRight chevronUp chevronDown externalLink back next
check checkCircle warning error info help loading play pause stop
volumeOn volumeOff microphone image video user users userAdd userRemove
eye eyeOff lock unlock star starFilled heart heartFilled bookmark bookmarkFilled
filter sort grid list moreHorizontal mail phone chat notification
file folder document calendar clock location sun moon palette layers
globe smartphone tablet monitor tv printer bus
```
Suggested mapping for this app: search→`search`, cart→`list` (or `bookmark`), wishlist→`heart`,
account→`user`, notifications→`notification`, location→`location`, categories→`grid`,
add-to-cart→`add`, decrement→`remove`, deals→`starFilled`, secure→`lock`.

---

## 7. State model (put in `_DemoShopScreenState`)

```dart
String _query = '';
String _category = 'all';
int _cartCount = 0;
String _activeTab = 'home';
String _payment = 'upi';
String _pincode = '400001';
String? _pincodeError;
bool _agree = false;
String? _agreeError;
bool _inStockOnly = false;
bool _placing = false;
bool _orderPlaced = false;

List<_Product> get _visibleProducts => _allProducts.where((p) {
  final matchesQuery = p.name.toLowerCase().contains(_query.toLowerCase());
  final matchesCat = _category == 'all' || p.category == _category;
  final matchesStock = !_inStockOnly || p.inStock;
  return matchesQuery && matchesCat && matchesStock;
}).toList();

Future<void> _placeOrder() async {
  if (!_agree) { setState(() => _agreeError = 'Please accept the terms'); return; }
  setState(() { _agreeError = null; _placing = true; _orderPlaced = false; });
  await Future.delayed(const Duration(milliseconds: 1200));
  if (!mounted) return;
  setState(() { _placing = false; _orderPlaced = true; });
}
```

Define a small `_Product` model (`name`, `price`, `category`, `imageUrl`, `inStock`, `bestseller`)
and a hard-coded `_allProducts` list (~6–8 items across categories) to drive the grid.

---

## 8. Acceptance checklist (the implementer must verify ALL)

- [ ] App boots via `OneUiBrandProvider` → `OneUiSurface(mode:'default')`; `main()` calls
      `JioIconCatalog.instance.ensureLoaded()` and `ensureOneUiBrandDefaultsLoaded(...)`.
- [ ] **All 24 components present** and rendering (tick each): Avatar, Badge, BottomNavigation,
      BottomNavItem, Button, Checkbox, CheckboxField, Chip, ChipGroup, CircularProgressIndicator,
      CounterBadge, Divider, Icon, IconButton, IconContained, Image, IndicatorBadge, Input,
      InputDynamicText, InputFeedback, InputField, Logo, Radio/RadioField, Text.
- [ ] Search filters the grid live.
- [ ] Category chip selection filters the grid.
- [ ] "Add to cart" increments `_cartCount`; CounterBadge(s) update.
- [ ] "Place order" without agreeing → negative `OneUiInputFeedback`.
- [ ] "Place order" agreed → spinner (`OneUiCircularProgressIndicator`) → positive
      `OneUiInputFeedback`.
- [ ] Bottom nav switches tabs (IndexedStack).
- [ ] **Zero Material content widgets** (`Text`/`Icon`/`Image`/`TextField`/`Card`/`Chip`/`Divider`/
      `BottomNavigationBar`/buttons). Only layout primitives + `Scaffold`.
- [ ] **Zero literal colours, font sizes, font weights**; all spacing via `space(context, token)`.
- [ ] Every icon-only control and badge has a `semanticsLabel`.
- [ ] `flutter analyze` passes with no errors; `flutter run` shows a working storefront.

---

## 9. Reference files (read for exact, current props if unsure)

- Working example screen using these components:
  `apps/flutter_sample/lib/login_screen.dart`
- App bootstrap: `apps/flutter_sample/lib/main.dart`
- Public API barrel (every export): `packages/ui_flutter/lib/ui_flutter.dart`
- Component sources: `packages/ui_flutter/lib/widgets/one_ui_*.dart`
  (and matching `*_types.dart` for enums/typedefs)
- Project rules (tokens, surfaces, typography, shape): `CLAUDE.md`

> **Golden rule:** if a prop or icon name is not in this spec or the reference files, do not use it.
> Prefer leaving a `// TODO` over importing a Material widget or hard-coding a value.
