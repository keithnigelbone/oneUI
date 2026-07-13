# JDS — Capabilities Overview

> **JDS (Jio Design System)** — is the unified, multi-brand design system that powers Jio's digital surface area, providing a brand identity foundation to build products across multiple platforms.

This document is written for **product teams, decision-makers, and AI coding assistants** who are
evaluating or building on top of JDS.

---

## 1. The one-line pitch

You install a set of ready-made components. You wrap your app in a brand. Every button, toggle, input,
and layout instantly takes on that brand's colour, typography, shape, and spacing — adapts to the
screen it's on — and meets accessibility standards out of the box. Switch the brand and
the entire interface re-skins with **zero visible flash** and **no code changes**.

---

## 2. What you actually receive (the packed product)

JDS is delivered as a set of **installable packages**, published to Jio's private package feed under
the **`@jds4/*`** scope. You consume them exactly like any other dependency — there is nothing to
fork, vendor, or maintain. The MCP aids in the installation, design definition and building your product from ground up or migrating your current project to JDS.

| Package                                                                                  | What it gives you                                                                                                                                  |
| ---------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`@jds4/oneui-react`**                                                                  | The full React (web) component library — buttons, inputs, cards, navigation, and the `<Surface>` system. Design tokens and theming are bundled in. |
| **`@jds4/oneui-react-native`**                                                           | The same component vocabulary for React Native (iOS + Android), kept in parity with web.                                                           |
| **`@jds4/oneui-icons-jio`**                                                              | The official Jio icon set, tree-shakeable, used through a single `<Icon>` API.                                                                     |
| **`@jds4/oneui-vite-plugin` · `@jds4/oneui-webpack-plugin` · `@jds4/oneui-next-plugin`** | Drop-in build integrations so the system "just works" with Vite, Webpack, or Next.js.                                                              |
| **`@jds4/oneui-init`**                                                                   | A scaffolder that sets up a new, correctly-wired JDS project in one command.                                                                       |
| **`JDS-MCP`**                                                                            | An AI assistant toolkit (Model Context Protocol) so coding agents can discover components, brands, and rules and generate compliant code directly. |

**How a team gets started (end-to-end):**

1. Connect to the private JDS feed (one-time `.npmrc` setup).
2. `@jds4/oneui-init` scaffolds the app, or add `@jds4/oneui-react` to an existing one.
3. Wrap the application root in a brand provider and pick a brand and theme.
4. Build screens from the component library. Brand, responsiveness, and accessibility are now
   automatic.

That's the entire integration surface. Everything below is what those four steps unlock.

---

## 3. Multi-brand scope

### The business value

One product team can serve **the entire Jio brand portfolio** — Jio, Reliance, Swadesh, Tira, and
more — from one codebase. There is no per-brand fork, and no duplicated component work. A new brand is a **data definition**, not an engineering project.

### How broad is "multi-brand"?

A brand in JDS is far more than a primary colour. Each brand can define **several foundation
dimensions**, including:

- **Colour identity** — expressed in the **OkLCH perceptual colour space** as a brand hue and
  chroma, expanded automatically into **25-step colour scales** per role. OkLCH means colours stay
  perceptually even and predictable across the whole scale.
- **Multi-accent roles** — up to **9 semantic appearance roles** (primary, secondary, neutral,
  sparkle, brand-bg, positive, negative, warning, informative). A brand isn't one accent — it's a
  full palette of meanings.
- **Typography** — brand-customisable type scale and up to **4 font families** (primary, secondary, script, code). Under Jio, type resolves to JioType automatically.
- **Shape, spacing, surfaces, platforms, and more** — each tunable per brand.

### The magic: one component, every brand

Components never hard-code a colour. They read **design tokens** (e.g. "primary, secondary"). When a brand is active, JDS resolves those tokens to that brand's actual values. The result:

- **Re-skin with ease** — switching brands restyles the whole UI.
- **Surfaces adapt themselves** — JDS's surface system means a component placed on a dark hero, a
  tinted card, or a coloured banner automatically recolours its text, fills, and borders to stay
  legible and on-brand. Designers describe _intent_ ("this is a bold section"); the system computes the exact colours.
- **Guaranteed consistency** — because every brand flows through the same token contract, a brand
  can't accidentally ship an off-system colour or an unreadable combination.

**Net effect:** marketing can launch or evolve a brand's look centrally, and _every_ product built
on JDS inherits it — instantly and uniformly.

---

## 4. Responsiveness

### The business value

**One build covers every screen** — phones, tablets, laptops, and large displays — and **multiple
platforms** (across web and mobile). Teams don't write separate "mobile" and "desktop" layouts or
maintain device-specific branches.

### How it works

- **Per-platform, per-viewport adaptation.** JDS resolves sizing and spacing across **3 breakpoints**
  and adapts to platform context. The same component renders correctly whether it's on a small
  phone or a wide desktop — the values shift discretely and intentionally, not by guesswork.
- **A modular sizing scale.** Spacing and typography are driven by a single **modular scale**, so
  every size in the system relates to every other size. Layouts stay rhythmically consistent as they
  scale up or down.
- **Density modes.** The same UI can run **compact**, **default**, or **open** density — useful for
  data-dense dashboards versus relaxed consumer screens — without redesigning anything. Density is a
  setting, not a rebuild.
- **Cross platform and device parity.** All platform libraries share the same component vocabulary
  and behaviour, so a feature designed once translates faithfully across platforms.

**Net effect:** responsiveness is a property of the system, not a task on every screen. Build the
content; the layout adapts.

---

## 5. Accessibility

### The business value

Accessibility is **built in, not bolted on**. Products built on JDS start **WCAG 2.1 AA compliant**
by default — reducing legal risk, widening the addressable audience, and removing accessibility from each team's manual to-do list.

### What's guaranteed

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
- **Multi-languages support**, including right-to-left and complex scripts, are first-class — typography and layout are designed to flex across them.

### Continuously verified

Components ship against accessibility quality gates (contrast, keyboard navigation, ARIA, and
zero-critical-violation checks). Accessibility isn't a one-time audit — it's a standing guarantee of the system you're consuming.

**Net effect:** if you build with JDS components and follow the surface model, you inherit AA
accessibility for free.

---

## 6. Why this matters (summary for decision-makers)

| Capability         | What JDS removes for your team                                    | What you get instead                                                  |
| ------------------ | ----------------------------------------------------------------- | --------------------------------------------------------------------- |
| **Multi-brand**    | Per-brand forks, brand-rollout engineering                        | One codebase that re-skins to any Jio brand                           |
| **Responsiveness** | Device-specific layouts, separate mobile/desktop branches         | Components that adapt across 3 breakpoints, 3 densities, web & native |
| **Accessibility**  | Manual contrast checks, focus/keyboard rework, per-product audits | WCAG 2.1 AA by default, computed contrast, multi-language support     |

**The strategic point:** JDS turns brand, device, and accessibility — normally three sources of
recurring, per-team cost — into **properties of the platform you install**. You write product logic;
JDS handles look, fit, and inclusivity. Build once; ship everywhere, for everyone.

---

## 7. For AI coding assistants

If you are an AI building on JDS, the operating model is:

1. **Compose from `@jds4/oneui-react` (or `@jds4/oneui-react-native`)** components (currently available) — don't build primitives from scratch.
2. **Never hard-code visual values** (colours, font sizes, spacing). Use the system's tokens and
   component props; this is what makes brand, responsiveness, and accessibility work.
3. **Use `<Surface>` for any coloured, dark, or tinted area** — this is how components recolour
   themselves correctly. A plain `<div>` with a background bypasses the system.
4. **Use `JDS-MCP plugin`** to discover available components, brands, surfaces, and rules, and to
   validate generated code against the system's guarantees.

Follow those four rules and the multi-brand, responsive, accessible behaviour described above is
inherited automatically.
