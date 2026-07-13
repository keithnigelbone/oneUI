# JDS — Jio Design System: Overview (Detailed)

> **JDS (Jio Design System)** is the unified, multi-brand design system that powers Jio's digital
> surface area, providing a brand-identity foundation to build products across multiple platforms.

This document is the single reference for understanding JDS — what it is, what it gives you, how it
works, how to build with it, and how it is ready for AI-assisted development. It is written for
**product teams, decision-makers, designers, and AI coding assistants** who are evaluating or
building on top of JDS.

---

## Contents

1. [What is JDS?](#1-what-is-jds)
2. [JDS capabilities](#2-jds-capabilities) — multi-brand, responsiveness, accessibility
3. [Design foundations & logic](#3-design-foundations--logic)
4. [Develop using JDS](#4-develop-using-jds)
5. [AI readiness of JDS](#5-ai-readiness-of-jds)
6. [Resources](#6-resources)

---

## 1. What is JDS?

JDS is not a static stylesheet shipped per brand. It is a **dynamic theme engine** that cascades
high-level design decisions — brand identity, target platform, viewport, density, and theme — down
to the individual style properties of every component.

The core idea: **components never hard-code visual values.** Every colour, size, font, shadow, and
radius is resolved through unified **design tokens** that adapt on the fly to context. There are
**zero hard-coded literals** in the component library. This is what lets one codebase serve many
brands, many devices, and many languages without forking.

**The one-line pitch:**

> You install a set of ready-made components. You wrap your app in a brand. Every button, toggle,
> input, and layout instantly takes on that brand's colour, typography, shape, and spacing — adapts
> to the screen it's on — and meets accessibility standards out of the box. Switch the brand and the
> entire interface re-skins with **zero visible flash** and **no code changes**.

---

## 2. JDS capabilities

### 2.1 What you actually receive (the packed product)

JDS is delivered as a set of **installable packages**, published to Jio's private package feeds. You
consume them exactly like any other dependency — there is nothing to fork, vendor, or maintain. The
MCP aids in the installation, design definition, and building your product from the ground up or
migrating your current project to JDS.

| Package | What it gives you |
|---|---|
| **`@jds4/oneui-react`** | The full React (web) component library — buttons, inputs, cards, navigation, and the `<Surface>` system. Design tokens and theming are bundled in. |
| **`@oneui/ui-native`** | The same component vocabulary for React Native (iOS + Android), kept in parity with web. |
| **`@jds4/oneui-icons-jio` · `@oneui/icons-jio-native`** | The official Jio icon sets (web · native), tree-shakeable, used through a single `<Icon>` API. |
| **`@jds4/oneui-vite-plugin` · `@jds4/oneui-webpack-plugin` · `@jds4/oneui-next-plugin`** | Drop-in build integrations so the system "just works" with Vite, Webpack, or Next.js. |
| **`@jds4/oneui-init` · `create-oneui-native-app`** | Scaffolders that set up a new, correctly-wired JDS project in one command (web · native). |
| **`JDS-MCP`** | An AI assistant toolkit (Model Context Protocol) so coding agents can discover components, brands, and rules and generate compliant code directly. |

**How a team gets started (end-to-end):**

1. Connect to the private JDS feed (one-time `.npmrc` setup).
2. Scaffold the app, or add the library to an existing one.
3. Wrap the application root in a brand provider and pick a brand and theme.
4. Build screens from the component library. Brand, responsiveness, and accessibility are now
   automatic.

That's the entire integration surface. Everything below is what those four steps unlock.

### 2.2 Multi-brand scope

#### The business value

One product team can serve **the entire Jio brand portfolio** — Jio, Reliance, Swadesh, Tira, and
more — from one codebase. There is no per-brand fork, and no duplicated component work. A new brand
is a **data definition**, not an engineering project.

#### How broad is "multi-brand"?

A brand in JDS is far more than a primary colour. Each brand can define **several foundation
dimensions**, including:

- **Colour identity** — expressed in the **OkLCH perceptual colour space** as a brand hue and
  chroma, expanded automatically into **25-step colour scales** per role. OkLCH means colours stay
  perceptually even and predictable across the whole scale.
- **Multi-accent roles** — up to **9 semantic appearance roles** (primary, secondary, neutral,
  sparkle, brand-bg, positive, negative, warning, informative). A brand isn't one accent — it's a
  full palette of meanings.
- **Typography** — brand-customisable type scale and up to **4 font families** (primary, secondary,
  script, code). Under Jio, type resolves to JioType automatically.
- **Shape, spacing, surfaces, platforms, and more** — each tunable per brand.

#### The magic: one component, every brand

Components never hard-code a colour. They read **design tokens** (e.g. "primary, secondary"). When a
brand is active, JDS resolves those tokens to that brand's actual values. The result:

- **Re-skin with ease** — switching brands restyles the whole UI.
- **Surfaces adapt themselves** — JDS's surface system means a component placed on a dark hero, a
  tinted card, or a coloured banner automatically recolours its text, fills, and borders to stay
  legible and on-brand. Designers describe _intent_ ("this is a bold section"); the system computes
  the exact colours.
- **Guaranteed consistency** — because every brand flows through the same token contract, a brand
  can't accidentally ship an off-system colour or an unreadable combination.

**Net effect:** marketing can launch or evolve a brand's look centrally, and _every_ product built
on JDS inherits it — instantly and uniformly.

### 2.3 Responsiveness

#### The business value

**One build covers every screen** — phones, tablets, laptops, and large displays — and **multiple
platforms** (across web and mobile). Teams don't write separate "mobile" and "desktop" layouts or
maintain device-specific branches.

#### How it works

- **Per-platform, per-viewport adaptation.** JDS resolves sizing and spacing across **3 breakpoints**
  and adapts to platform context. The same component renders correctly whether it's on a small phone
  or a wide desktop — the values shift discretely and intentionally, not by guesswork.
- **A modular sizing scale.** Spacing and typography are driven by a single **modular scale**, so
  every size in the system relates to every other size. Layouts stay rhythmically consistent as they
  scale up or down.
- **Density modes.** The same UI can run **compact**, **default**, or **open** density — useful for
  data-dense dashboards versus relaxed consumer screens — without redesigning anything. Density is a
  setting, not a rebuild.
- **Cross-platform and device parity.** All platform libraries share the same component vocabulary
  and behaviour, so a feature designed once translates faithfully across platforms.

**Net effect:** responsiveness is a property of the system, not a task on every screen. Build the
content; the layout adapts.

### 2.4 Accessibility

#### The business value

Accessibility is **built in, not bolted on**. Products built on JDS start **WCAG 2.1 AA compliant**
by default — reducing legal risk, widening the addressable audience, and removing accessibility from
each team's manual to-do list.

#### What's guaranteed

- **Contrast is computed, not hoped for.** Because colours live in OkLCH and text/background pairs
  are resolved together, JDS produces **accessible colour combinations automatically** — even when a
  custom brand colour is introduced. Text on a brand surface stays readable by construction.
- **Visible, adaptive focus.** Every interactive component renders a clear two-layer focus indicator
  that **adapts to whatever surface it sits on**, so keyboard users never lose their place — on light
  pages, dark heroes, or tinted cards alike.
- **Proper touch and pointer targets.** Interactive elements meet minimum target sizes
  (**44×44px on mobile, 24×24px on desktop**), reducing mis-taps and meeting platform guidelines.
- **Screen-reader and keyboard support** is part of every component's behaviour, inherited
  automatically rather than re-implemented per product.
- **Multi-language support**, including right-to-left and complex scripts, is first-class —
  typography and layout are designed to flex across them.

#### Continuously verified

Components ship against accessibility quality gates (contrast, keyboard navigation, ARIA, and
zero-critical-violation checks). Accessibility isn't a one-time audit — it's a standing guarantee of
the system you're consuming.

**Net effect:** if you build with JDS components and follow the surface model, you inherit AA
accessibility for free.

### 2.5 Why this matters (summary for decision-makers)

| Capability | What JDS removes for your team | What you get instead |
|---|---|---|
| **Multi-brand** | Per-brand forks, brand-rollout engineering | One codebase that re-skins to any Jio brand |
| **Responsiveness** | Device-specific layouts, separate mobile/desktop branches | Components that adapt across 3 breakpoints, 3 densities, web & native |
| **Accessibility** | Manual contrast checks, focus/keyboard rework, per-product audits | WCAG 2.1 AA by default, computed contrast, multi-language support |

**The strategic point:** JDS turns brand, device, and accessibility — normally three sources of
recurring, per-team cost — into **properties of the platform you install**. You write product logic;
JDS handles look, fit, and inclusivity. Build once; ship everywhere, for everyone.

---

## 3. Design foundations & logic

Everything cascades from one source of truth through a strict hierarchy. Strategize in JDS, Design in JDS and implement in JDS, all in one place.

### 3.1 The cascade

JDS resolves every style value top-down:

```
Brand → Platform → Viewport → Density → Theme → Component reads a token
```

A brand's configuration (colour parameters, typography, platform settings, and the accents mapped to
the 9 semantic roles) feeds a compiler that produces the scale system, resolves surfaces, and emits
the final styling — injected as CSS custom properties on the web, and as a resolved theme object on
native. The component only ever reads a token; the cascade decides what that token means in context.

### 3.2 Colour foundation

- **Perceptually uniform colour.** Colour is generated in the **OkLCH** colour space, so a lightness
  step in green has the same perceived brightness and contrast as the same step in blue. This is what
  keeps brand palettes balanced and predictable.
- **25-step scales.** Each role gets a 25-step scale from darkest (step 100) to lightest (step 2500).
  Surfaces and content are chosen as positions on this scale rather than as fixed hex values.
- **Chroma lock.** To avoid oversaturated, unreadable extremes, generated colours never exceed the
  brand's base chroma. Colours stay rich near the brand's base and naturally desaturate as they
  approach pure white or black.

### 3.3 Surfaces & surface context

Surfaces are how JDS keeps UI readable on tinted backgrounds, nested cards, and hero sections —
**without hand-picking text colours.** The logic is the same across every JDS platform.

**A surface is an intent, not a hex colour.** You choose a `mode` (`subtle`, `bold`, …) and the
engine resolves that intent **relative to the parent surface's step** on the 25-step scale. The same
`minimal` on the page, inside a card, or inside a hero block produces _different_ colours because
each parent step is different. That is intentional.

**No background/foreground split.** There is one vocabulary. The same `bold` token can fill a hero
section or a primary button — usage differs, tokens do not.

**The seven surface modes:**

| `mode`     | What it means                                                                      |
| ---------- | ---------------------------------------------------------------------------------- |
| `default`  | Page canvas. Light: lightest step. Dark: dark step. Ignores parent.                |
| `ghost`    | Same step as parent — structural wrapper, no visible shift. Still remaps children. |
| `minimal`  | Smallest visible change from parent (one step toward contrast).                    |
| `subtle`   | Gentle containment — cards, tinted regions (two steps).                            |
| `moderate` | Stronger panel separation (three steps).                                           |
| `bold`     | High emphasis — heroes, strong fills. Anchored to the role's base step.            |
| `elevated` | Float above parent — menus, modals. Always one step lighter.                       |

**Content tokens** resolve text, icons, and strokes against whatever surface they sit on:

| Token                        | Role                                                  |
| ---------------------------- | ----------------------------------------------------- |
| `high`                       | Primary text/icons — maximum contrast.                |
| `medium`                     | Secondary text.                                       |
| `low`                        | De-emphasised text — solved for WCAG AA contrast.     |
| `tinted` / `tintedA11y`      | Role-tinted content (standard / accessible contrast). |
| `strokeMedium` / `strokeLow` | Borders and dividers.                                 |

**Contrast direction is fixed once per surface** and inherited downstream, so nested UI doesn't flip
contrast unpredictably at mid-tone backgrounds.

**Context boundaries.** Semantic status colours (a red error badge, a green success dot) should _not_
invert on a brand-bold hero. A **context boundary** resets those role tokens to their root values so
their meaning is preserved regardless of the surrounding surface.

> The rule for builders: whenever components sit on a non-default background, establish a surface
> boundary — painting a background colour alone does not establish context. See §4.4.

### 3.4 Dimensions, spacing & density

- **One modular scale.** Spacing, typography sizing, and border-radii all derive from a single
  modular step scale. Because everything relates back to the same scale, layouts stay rhythmically
  consistent at any size.
- **Legibility-based base size.** The base font size is derived from the **DIN 1450** legibility
  standard, which accounts for screen resolution and typical viewing distance — so a mobile screen
  held close and a desktop screen viewed further away each get an appropriate base size.
- **Discrete platform breakpoints.** Rather than fluid interpolation across every pixel width, JDS
  locks layouts to discrete breakpoint columns (3 breakpoints). This avoids the visual degradation
  that fluid scaling causes at awkward intermediate widths.
- **Density remapping.** Compact, default, and open density shift the mapping of spacing tokens up or
  down the scale system-wide — changing the feel of an entire layout without touching component code.

### 3.5 Themes & zero-flash brand switching

- **Light / dark themes** are resolved through HTML attributes; the same surface intents produce
  light-appropriate or dark-appropriate colours automatically.
- **Zero visible flash.** Switching theme or brand is engineered to update with no flash of unstyled
  content: styling is applied before first paint, the previous styling is retained during async
  loads, and transitions are briefly suppressed during the swap so colours change atomically. The
  user sees a clean switch, never a flicker.

### 3.6 Token taxonomy (the unified naming)

All tokens follow a clean, role-prefixed pattern, so a token name reads as its meaning:

| Category                | Pattern                      | Example                              |
| ----------------------- | ---------------------------- | ------------------------------------ |
| **Surface fills**       | `--{Role}-{Mode}`            | `--Primary-Bold`, `--Neutral-Subtle` |
| **Content (on-colour)** | `--{Role}-{Mode}-{OnColour}` | `--Primary-Bold-High`                |
| **State fills**         | `--{Role}-{Mode}-{State}`    | `--Primary-Bold-Hover`               |

- **Roles:** `Primary`, `Secondary`, `Neutral`, `Sparkle`, `Brand-Bg`, `Positive`, `Negative`,
  `Warning`, `Informative`.
- **Modes:** `Default`, `Ghost`, `Minimal`, `Subtle`, `Moderate`, `Bold`, `Elevated`.
- **On-colours:** `High`, `Medium`, `Low`, `Tinted`, `TintedA11y`, `Stroke-Medium`, `Stroke-Low`.

---

## 4. Develop using JDS

### 4.1 Platforms

JDS is a language-agnostic token taxonomy, so it can drive native libraries across ecosystems:

| Platform                               | Status         |
| -------------------------------------- | -------------- |
| **React (Web)**                        | ✅ Available   |
| **React Native (Mobile)**              | ✅ Available   |
| **Flutter (Cross-platform)**           | 🔜 Coming soon |
| **Android (Kotlin / Jetpack Compose)** | 🔜 Coming soon |
| **iOS**                                | 🔜 Coming soon |

> Android and iOS are planned as a shared KMP (Kotlin Multiplatform) library.

### 4.2 Web setup (`@jds4/oneui-react`)

Import the foundation styles once at your app entry, then compose from the component library inside a
brand provider:

```tsx
import '@jds4/oneui-react/styles';
import { BrandProvider, Surface, Button } from '@jds4/oneui-react';

export function App() {
  return (
    <BrandProvider brandId="…">
      <Surface mode="bold">
        <Button attention="high">Get started</Button>
        <Button attention="medium">Learn more</Button>
        <Button attention="low">Dismiss</Button>
      </Surface>
    </BrandProvider>
  );
}
```

- **Install:** `npm install @jds4/oneui-react` (icons: `npm install @jds4/oneui-icons-jio`).
- **Scaffold a new app:** `npx @jds4/oneui-init`.
- **Subpath imports:** `@jds4/oneui-react/components/<Name>` (same released allowlist).
- Icons are auto-registered by `BrandProvider` (default `iconSet="jio"`).

### 4.3 React Native setup (`@oneui/ui-native`)

Mount a brand provider at the app root; every component reads and adapts inside a `<Surface>`
boundary.

```tsx
import { OneUIBrandProvider, Surface, Card, Button, Text } from '@oneui/ui-native';

export default function App() {
  return (
    <OneUIBrandProvider brand="jio" mode="light">
      <Surface mode="bold">
        <Card>
          <Text role="title" size="m">
            Welcome
          </Text>
          <Button attention="high">Primary</Button>
          <Button attention="medium">Secondary</Button>
          <Button attention="low">Tertiary</Button>
        </Card>
      </Surface>
    </OneUIBrandProvider>
  );
}
```

- **Install:** `npm install @oneui/ui-native react-native-svg` (icons: `@oneui/icons-jio-native`).
- **Scaffold a new app:** `npx create-oneui-native-app@latest my-app` — wires the brand provider,
  registry credentials, and a brand config file for you.
- **Switch brands:** edit the brand config, re-run the prefetch step, and change the `brand` prop
  (e.g. `brand="tira"`); toggle `mode="light"` / `mode="dark"` for theme.
- Native packages live on a private Azure DevOps registry; the scaffolder writes the `.npmrc`
  credentials for you.

### 4.4 Using surfaces correctly

The single most important rule for builders: **whenever components sit on a coloured, dark, or tinted
area, wrap them in a `<Surface>`.** That is how tokens remap for context. Painting a background
colour on a plain `div`/`View` does **not** establish context — children keep parent-level tokens and
contrast can break.

```tsx
// Correct — enters the surface cascade; children remap.
<Surface mode="subtle">
  <Button attention="low">Cancel</Button>
</Surface>

// Wrong — colour only; children do NOT remap, contrast can break.
<div style={{ background: 'var(--Primary-Subtle)' }}>
  <Button attention="low">Cancel</Button>
</div>
```

Two common props pair with surfaces:

- **`appearance`** — selects which accent role paints a component (`primary`, `secondary`,
  `neutral`, `sparkle`, `brand-bg`, `positive`, `negative`, `warning`, `informative`, or `auto`).
- **`attention`** — fill emphasis on interactive controls: `high` (bold fill, primary CTA),
  `medium` (subtle fill, secondary action), `low` (ghost / transparent, tertiary).

Inside a boundary, use generic role tokens (`--Primary-High`, `--Primary-TintedA11y`,
`--Text-Medium`); the engine remaps them per surface. Avoid decorative borders on tinted fills — the
fill already defines the edge.

### 4.5 Component catalog

JDS ships **released components** (what you can install and import today) and has a broader set
**on the roadmap**.

#### Currently released

> Web ships from `@jds4/oneui-react` (38 public modules: 36 components + `BrandProvider` + `Surface`).
> Native ships from `@oneui/ui-native`. A row marked Web · RN is released on both.

| Category                | Components                                                                                                                                                                       |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Providers & layout**  | `BrandProvider` (web), `OneUIBrandProvider` / `OneUINativeThemeProvider` (RN), `Surface`, `Container`, `Divider`, `Card` (RN)                                                    |
| **Typography**          | `Text`                                                                                                                                                                           |
| **Inputs & forms**      | `Input`, `InputField`, `InputFeedback` (RN), `InputDynamicText` (RN), `Checkbox`, `CheckboxField`, `Radio`, `RadioField`, `Switch`, `Select` (RN), `Slider` (web), `TouchSlider` |
| **Buttons & actions**   | `Button`, `IconButton`, `IconContained`, `SelectableButton` (web), `SelectableIconButton` (web), `SelectableSingleTextButton` (web), `SingleTextButton` (web)                    |
| **Navigation**          | `BottomNavigation`, `BottomNavigationItem` (RN), `Tabs`, `Pagination` (web), `PaginationDots`, `Stepper` (web)                                                                   |
| **Data display**        | `Avatar`, `Badge`, `CounterBadge`, `IndicatorBadge`, `Chip`, `ChipGroup`, `Icon`, `Logo`, `Image`                                                                                |
| **Feedback & overlays** | `Modal`, `Tooltip`, `CircularProgressIndicator`, `Progress` (RN), `Scrim` (RN), `AgentPulse` (RN)                                                                                |

```tsx
// Web — root barrel (released components only)
import { Button, Surface, Tabs, BrandProvider } from '@jds4/oneui-react';

// React Native — root barrel
import { Button, Surface, Card, Select } from '@oneui/ui-native';
```

**Building without a released component:** compose released primitives with design tokens — `<Surface>`,
typography role tokens, `--Spacing-*`, `--Shape-*` (web) or `useSurfaceTokens` + `tokens.spacing`
(native). Avoid ad-hoc colours, raw backgrounds on tinted regions, or legacy t-shirt spacing names.

#### On the roadmap

Not yet on the public API: `LinkButton`, `Toggle` / `ToggleGroup`, `NumberField`, `Form`, `Fieldset`,
`Spinner`, `NavigationMenu`, `Menu`, `Accordion`, `Collapsible`, `Carousel`, `Toolbar`, `Separator`,
`Grid`, `ScrollArea`, and the AI/chat primitives `ChatSurface` and `ChatComposer`.

### 4.6 Designing in Figma (the OneUI plugin)

JDS provides a Figma plugin so designers apply tokens (theme, density, platform, interaction states,
materials, colours) directly onto OneUI components — without manually changing styles. It is the
bridge between the component library and the token system.

**Setup:**

1. **Enable libraries** — in **Assets → Libraries**, add **OneUI Components** and **OneUI
   Foundations**; remove unrelated libraries to avoid token conflicts.
2. **Open the plugin** — **Plugins → From Jio → OneUI Surfaces**, and **keep it open** while working.

**Working rules:**

- **Everything colour-related goes through the plugin** — do _not_ change variable modes natively in
  Figma. Apply surface fills, appearance, on-colours, materials, media modes, and interaction states
  via the plugin.
- **Apply surface fills** to frames, then nest frames; children adopt colours from their parent
  surface context (the same parent-relative model as code).
- **Appearance** — `auto` inherits the parent's appearance; an explicit role (e.g. `primary`) pins it.
- **On-colours** apply to content within a surface (text, icons, strokes), with fill vs stroke
  scoping rules.
- **Dimension tokens** (size, padding, gap, radius) are applied **natively in Figma**, not via the
  plugin.
- **Material** — `solid` (default) vs `transparent` (for elements over media).
- **Media modes** — make colours resolve correctly over images/video/dark backgrounds.
- **Interaction states** — library components have them built in; for custom elements use
  `stateLayer` overlays + `focusRing` effects.
- **Switchables (global modes)** — Platform, Density, Theme, Colour mode, Language, and Brand apply
  only at the **page / root-level container**, never to individual nested elements.

> The plugin exposes a couple of extra surface entries (`none`, `blend`, `stateLayer`) that map to
> the same underlying model used in code.

---

## 5. AI readiness of JDS

JDS is built so that **AI coding assistants can build correct, compliant UI on the first pass.**

**`JDS-MCP` — the agent toolkit.** A Model Context Protocol server lets a coding agent:

- **Discover** available components, brands, surfaces, and the system's rules.
- **Scaffold and migrate** — set up a new JDS project or migrate an existing one.
- **Generate compliant code** and **validate** it against the system's guarantees (no hard-coded
  literals, correct surface usage, released-components-only, token-routed fonts and icons).

**AI/agent UI primitives.** The component library includes building blocks for AI experiences —
e.g. `AgentPulse` (an animated indicator for agent activity, released on native), with `ChatSurface`
and `ChatComposer` on the roadmap — so chat and agent interfaces are first-class, on-brand, and
accessible like any other surface.

**The operating model for an AI building on JDS:**

1. **Compose from `@jds4/oneui-react` (web) or `@oneui/ui-native` (native)** — don't build
   primitives from scratch.
2. **Never hard-code visual values** (colours, font sizes, spacing). Use the system's tokens and
   component props — this is what makes brand, responsiveness, and accessibility work.
3. **Use `<Surface>` for any coloured, dark, or tinted area** — this is how components recolour
   themselves correctly. A plain `<div>` / `View` with a background bypasses the system.
4. **Use `JDS-MCP`** to discover available components, brands, surfaces, and rules, and to validate
   generated code against the system's guarantees.

Follow those four rules and the multi-brand, responsive, accessible behaviour described above is
inherited automatically.

---

## 6. Resources

- **Web library:** `@jds4/oneui-react` · icons `@jds4/oneui-icons-jio` · scaffolder `@jds4/oneui-init`
- **Native library:** `@oneui/ui-native` · icons `@oneui/icons-jio-native` · scaffolder
  `create-oneui-native-app`
- **Build integrations:** `@jds4/oneui-vite-plugin`, `@jds4/oneui-webpack-plugin`,
  `@jds4/oneui-next-plugin`
- **AI agent toolkit:** `JDS-MCP` (Model Context Protocol)
- **Figma plugin:** **Plugins → From Jio → OneUI Surfaces**, with the **OneUI Components** and
  **OneUI Foundations** libraries. Onboarding playground:
  [OneUI Plugin Onboarding](https://www.figma.com/design/MyhJvh96SAiaR9PIOdI6RT/%F0%9F%8E%93-Demo-%C2%B7-OneUI%E2%80%A8Plugin-Onboarding?node-id=2005-5414&m=dev)
