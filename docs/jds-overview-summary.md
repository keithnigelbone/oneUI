# JDS — Jio Design System: Overview

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
6. [Why this matters](#6-why-this-matters)

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

| Package                                                                                  | What it gives you                                                                                                                                  |
| ---------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`@jds4/oneui-react`**                                                                  | The full React (web) component library — buttons, inputs, cards, navigation, and the `<Surface>` system. Design tokens and theming are bundled in. |
| **`@oneui/ui-native`**                                                                   | The same component vocabulary for React Native (iOS + Android), kept in parity with web.                                                           |
| **`@jds4/oneui-icons-jio` · `@oneui/icons-jio-native`**                                  | The official Jio icon sets (web · native), tree-shakeable, used through a single `<Icon>` API.                                                     |
| **`@jds4/oneui-vite-plugin` · `@jds4/oneui-webpack-plugin` · `@jds4/oneui-next-plugin`** | Drop-in build integrations so the system "just works" with Vite, Webpack, or Next.js.                                                              |
| **`@jds4/oneui-init` · `create-oneui-native-app`**                                       | Scaffolders that set up a new, correctly-wired JDS project in one command (web · native).                                                          |
| **`JDS-MCP`**                                                                            | An AI assistant toolkit (Model Context Protocol) so coding agents can discover components, brands, and rules and generate compliant code directly. |

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

---

## 3. Design foundations & logic

Everything cascades from one source of truth through a strict hierarchy — **strategise in JDS, design
in JDS, and implement in JDS, all in one place.** Every style value resolves top-down:

```
Brand → Platform → Viewport → Density → Theme → Component reads a token
```

A component only ever reads a token; the cascade decides what that token *means* in context. The
foundations that make this work:

- **Colour** — generated in the **OkLCH** perceptual colour space as 25-step scales per role, so
  brand palettes stay balanced and predictable. A **chroma lock** keeps colours rich near the brand
  base and prevents oversaturated, unreadable extremes.
- **Surfaces** — a surface is an *intent* (`subtle`, `bold`, `elevated`…), not a hex colour. The
  engine resolves it **relative to its parent's step**, so the same intent yields different colours
  on the page, inside a card, or on a hero — and every child's text, icons, and borders auto-resolve
  for readability. There is **no background/foreground split**: the same token fills a hero or a
  button. *Status colours (error red, success green) are protected from inverting on bold surfaces.*
- **Dimensions, spacing & density** — all sizes derive from a single modular scale, so layouts stay
  rhythmically consistent. The base size is grounded in the **DIN 1450** legibility standard, layouts
  lock to **discrete breakpoints** (no awkward fluid scaling), and **density** (compact / default /
  open) reshapes the whole layout without touching component code.
- **Themes & zero-flash switching** — light/dark and brand switches apply before first paint with no
  flash of unstyled content; the user sees a clean switch, never a flicker.
- **Unified token naming** — every token reads as its meaning (`--{Role}-{Mode}-{OnColour}`, e.g.
  `--Primary-Bold-High`), spanning 9 roles, 7 surface modes, and a fixed set of on-colours and states.

---

## 4. Develop using JDS

**Platform availability** — JDS is a language-agnostic token taxonomy, so it drives native libraries
across ecosystems:

| Platform | Status |
| --- | --- |
| **React (Web)** | ✅ Available |
| **React Native (Mobile)** | ✅ Available |
| **Flutter (Cross-platform)** | 🔜 Coming soon |
| **Android (Kotlin / Jetpack Compose)** | 🔜 Coming soon |
| **iOS** | 🔜 Coming soon |

> Android and iOS are planned as a shared KMP (Kotlin Multiplatform) library.

**The build flow is the same everywhere:** install the library from the private feed (or use the
scaffolders — `@jds4/oneui-init` for web, `create-oneui-native-app` for native, which also wire
registry credentials for you), wrap your app root in a brand provider, pick a brand and theme, then
compose screens from the component library. Brand, responsiveness, and accessibility are automatic
from there.

**The one rule builders must follow:** whenever components sit on a coloured, dark, or tinted area,
wrap them in a `<Surface>`. That is how tokens remap for context — painting a background colour on a
plain element does *not* establish context, and contrast can break. Two props pair with surfaces:
`appearance` (which accent role paints a component) and `attention` (fill emphasis: high / medium /
low).

**Designing in Figma** — JDS provides a Figma plugin (**Plugins → From Jio → OneUI Surfaces**, with
the **OneUI Components** and **OneUI Foundations** libraries enabled) so designers apply the same
tokens — surfaces, appearance, on-colours, materials, media modes, interaction states, and global
switchables (platform, density, theme, colour mode, language, brand) — directly onto components. It
is the bridge between design and code: the same parent-relative surface model, the same token system,
no manual restyling.

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

## 6. Why this matters

| Capability         | What JDS removes for your team                                    | What you get instead                                                  |
| ------------------ | ----------------------------------------------------------------- | --------------------------------------------------------------------- |
| **Multi-brand**    | Per-brand forks, brand-rollout engineering                        | One codebase that re-skins to any Jio brand                           |
| **Responsiveness** | Device-specific layouts, separate mobile/desktop branches         | Components that adapt across 3 breakpoints, 3 densities, web & native |
| **Accessibility**  | Manual contrast checks, focus/keyboard rework, per-product audits | WCAG 2.1 AA by default, computed contrast, multi-language support     |

**The strategic point:** JDS turns brand, device, and accessibility — normally three sources of
recurring, per-team cost — into **properties of the platform you install**. You write product logic;
JDS handles look, fit, and inclusivity. Build once; ship everywhere, for everyone.
