# One UI Studio — Experience Builder AI PRD

> **Version**: 1.0.0  
> **Last Updated**: January 2026  
> **Status**: Draft  
> **Parent**: [Platform Overview PRD](./PRD-01-PLATFORM-OVERVIEW.md)

---

## Overview

The Experience Builder AI enables designers and developers to generate UI patterns, micro-interactions, and complete layouts using natural language prompts. It leverages the configured design tokens and component library to produce design-system-compliant outputs that can be exported as production-ready code.

### User Stories

- As a **Designer**, I want to describe a UI pattern in plain language and get a working prototype
- As a **Developer**, I want to generate component compositions without manually assembling them
- As a **Product Manager**, I want to quickly visualize a feature idea before design resources are available
- As a **Design System Lead**, I want all AI-generated outputs to comply with our token system

### Key Differentiators

- **Token-aware generation**: All outputs use design system tokens, never hardcoded values
- **Component-first approach**: Composes from the existing component library
- **Cultural relevance**: Generates designs appropriate for the Indian market
- **Multi-platform**: Outputs work for both React and React Native

---

## Navigation Structure

```
Experience Builder
├── Create            ← Main AI generation interface
├── Patterns          ← Pre-built pattern library
├── Templates         ← Full-page templates
├── History           ← Previous generations
└── Saved             ← Bookmarked designs
```

---

## F1: AI Generation Interface

### F1.1 Main Interface Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  Experience Builder AI                            [? Help]      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  💬 Describe what you want to build...                  │   │
│  │                                                          │   │
│  │  "Create a subscription card with pricing, features     │   │
│  │   list, and a CTA button. Use the bold variant for      │   │
│  │   premium tier highlighting."                            │   │
│  │                                                          │   │
│  │                                          [Generate ✨]   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Context: JioCinema • Light Mode • Mobile                       │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─ Generated Output ───────────────────────────────────────┐  │
│  │                                                           │  │
│  │  ┌─────────────────────────────────────────────────────┐ │  │
│  │  │                                                      │ │  │
│  │  │              [Live Preview]                          │ │  │
│  │  │                                                      │ │  │
│  │  │         Subscription Card Component                  │ │  │
│  │  │                                                      │ │  │
│  │  │                                                      │ │  │
│  │  └─────────────────────────────────────────────────────┘ │  │
│  │                                                           │  │
│  │  [👍] [👎] [🔄 Regenerate] [✏️ Refine] [💾 Save] [📋 Code]│  │
│  │                                                           │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### F1.2 Prompt Input

```typescript
interface PromptInput {
  text: string;
  context: {
    brand: string;
    theme: 'light' | 'dark' | 'dim';
    platform: 'mobile' | 'tablet' | 'desktop';
    density: 'compact' | 'default' | 'open';
  };
  constraints?: {
    components?: string[];      // Limit to specific components
    maxComplexity?: 'simple' | 'medium' | 'complex';
    includeAnimation?: boolean;
  };
  references?: {
    imageUrl?: string;          // Reference image
    figmaUrl?: string;          // Figma frame reference
    patternId?: string;         // Existing pattern to extend
  };
}
```

### F1.3 Prompt Suggestions

```
┌─────────────────────────────────────────────────────────────────┐
│  Suggestions based on your context:                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  📦 Patterns                                                    │
│  • "Create a hero section with headline and CTA"               │
│  • "Build a feature comparison table"                          │
│  • "Design a user profile card"                                │
│                                                                 │
│  🎯 For JioCinema specifically:                                 │
│  • "Create a movie details card with rating and watch button"  │
│  • "Build a horizontal content carousel"                       │
│  • "Design a subscription upsell banner"                       │
│                                                                 │
│  🔥 Trending prompts:                                           │
│  • "Pricing card with toggle between monthly/yearly"           │
│  • "Empty state with illustration placeholder"                 │
│  • "Settings toggle group with descriptions"                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## F2: Generation Engine

### F2.1 AI Pipeline

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   Prompt     →    Component     →    Token       →   Output     │
│   Analysis        Selection          Resolution      Generation │
│                                                                 │
│   "What is      "Which Base UI    "Map semantic    "Generate    │
│    needed?"      components?"      to brand tokens"  code"       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### F2.2 Generation Rules

**CRITICAL CONSTRAINTS**:

```typescript
interface GenerationRules {
  // Token compliance
  noLiterals: true;                    // NEVER hardcode values
  useTokensOnly: true;                 // All styling via tokens
  
  // Shape rules
  interactiveShape: 'Shape-Pill';      // Buttons, inputs = 999px
  containerShape: 'Shape-4' | 'Shape-4-5' | 'Shape-5';
  
  // Component rules
  baseUIOnly: true;                    // Only use Base UI primitives
  noCustomComponents: true;            // Don't invent new components
  
  // Accessibility
  wcagAA: true;                        // Minimum contrast level
  touchTargets: 44;                    // Minimum 44px on mobile
  
  // Cultural
  ltrLayout: true;                     // Left-to-right (Hindi uses LTR)
  indianMarketRelevant: true;          // Avoid Western-centric patterns
}
```

### F2.3 Component Selection Logic

```typescript
interface ComponentMapping {
  // User intent → Component selection
  "button": "Button",
  "action": "Button",
  "click": "Button",
  "submit": "Button",
  
  "input": "TextField",
  "text field": "TextField",
  "form": "TextField",
  "search": "TextField",
  
  "card": "Card",
  "container": "Card",
  "box": "Card",
  
  "list": "List",
  "items": "List",
  "menu": "Menu",
  
  "modal": "Dialog",
  "popup": "Dialog",
  "overlay": "Dialog",
  
  "toggle": "Switch",
  "switch": "Switch",
  "checkbox": "Checkbox",
  
  "tabs": "Tabs",
  "navigation": "Tabs",
}
```

---

## F3: Output Panel

### F3.1 Live Preview

```
┌─────────────────────────────────────────────────────────────────┐
│  Preview                           [Mobile ●] [Tablet] [Desktop]│
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Theme: [Light ●] [Dark] [Dim]    Zoom: [100% ▼]               │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  ╔══════════════════════════════════════════════════════╗│  │
│  │  ║                                                      ║│  │
│  │  ║                   Premium Plan                       ║│  │
│  │  ║                     ₹999/mo                          ║│  │
│  │  ║                                                      ║│  │
│  │  ║  ✓ Unlimited streaming                               ║│  │
│  │  ║  ✓ 4K HDR quality                                    ║│  │
│  │  ║  ✓ Watch on 4 devices                                ║│  │
│  │  ║  ✓ Download for offline                              ║│  │
│  │  ║                                                      ║│  │
│  │  ║           [  Subscribe Now  ]                        ║│  │
│  │  ║                                                      ║│  │
│  │  ╚══════════════════════════════════════════════════════╝│  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  Components used: Card, Typography, List, Button               │
│  Tokens applied: 12 surface, 4 text, 6 spacing                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### F3.2 Code Output

```
┌─────────────────────────────────────────────────────────────────┐
│  Code                              [React ●] [React Native]     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  import { Card, Typography, Button } from '@oneui/...   │   │
│  │  import styles from './SubscriptionCard.module.css';    │   │
│  │                                                          │   │
│  │  export function SubscriptionCard({                      │   │
│  │    plan,                                                 │   │
│  │    price,                                                │   │
│  │    features,                                             │   │
│  │    onSubscribe,                                          │   │
│  │  }) {                                                    │   │
│  │    return (                                              │   │
│  │      <Card className={styles.card} elevation={2}>       │   │
│  │        <Typography variant="headline" size="m">         │   │
│  │          {plan}                                          │   │
│  │        </Typography>                                     │   │
│  │        <Typography variant="display" size="l">          │   │
│  │          ₹{price}/mo                                     │   │
│  │        </Typography>                                     │   │
│  │        <ul className={styles.features}>                  │   │
│  │          {features.map((feature) => (                    │   │
│  │            <li key={feature}>{feature}</li>             │   │
│  │          ))}                                             │   │
│  │        </ul>                                              │   │
│  │        <Button                                           │   │
│  │          variant="bold"                                  │   │
│  │          size="large"                                    │   │
│  │          fullWidth                                       │   │
│  │          onPress={onSubscribe}                          │   │
│  │        >                                                 │   │
│  │          Subscribe Now                                   │   │
│  │        </Button>                                         │   │
│  │      </Card>                                             │   │
│  │    );                                                    │   │
│  │  }                                                       │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  [Copy Code]  [Download]  [Open in Editor]                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### F3.3 CSS Output

```css
/* SubscriptionCard.module.css (AI-generated, token-only) */
.card {
  padding: var(--Spacing-5);
  border-radius: var(--Shape-4-5);  /* Non-interactive container */
  background-color: var(--Surface-Subtle);
  text-align: center;
}

.features {
  list-style: none;
  padding: 0;
  margin: var(--Spacing-4-5) 0;
  text-align: left;
}

.features li {
  display: flex;
  align-items: center;
  gap: var(--Spacing-3-5);
  padding: var(--Spacing-3) 0;
  color: var(--Text-High);
  font-size: var(--Typography-Body-M);
}

.features li::before {
  content: "✓";
  color: var(--Status-Success);
}
```

---

## F4: Refinement Interface

### F4.1 Iterative Refinement

```
┌─────────────────────────────────────────────────────────────────┐
│  Refine Generation                                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Current output displayed above                                 │
│                                                                 │
│  Refinement prompt:                                             │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  "Make the price larger and add a 'Most Popular' badge  │   │
│  │   at the top"                                            │   │
│  │                                              [Apply ✨]   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Quick refinements:                                             │
│  [+ Add badge]  [+ Add icon]  [↔ Change layout]  [🎨 Variant]  │
│                                                                 │
│  History:                                                       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  v3 (current) — Added badge                              │  │
│  │  v2 — Made price larger                                   │  │
│  │  v1 — Initial generation                                  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  [Undo]  [Reset to v1]                                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### F4.2 Direct Manipulation

Allow clicking on preview elements to refine:

```
┌─────────────────────────────────────────────────────────────────┐
│  Click to Edit                                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Selected: Button "Subscribe Now"                               │
│                                                                 │
│  ┌─ Quick edits ────────────────────────────────────────────┐  │
│  │                                                           │  │
│  │  Variant:  [Bold ●] [Subtle] [Ghost] [Outline]           │  │
│  │  Size:     [Small] [Medium] [Large ●]                    │  │
│  │  Text:     [Subscribe Now________________]               │  │
│  │  Icon:     [None ▼]                                      │  │
│  │                                                           │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  [Apply Changes]                                                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## F5: Pattern Library

### F5.1 Pre-built Patterns

```
┌─────────────────────────────────────────────────────────────────┐
│  Patterns                                          [+ Create]   │
│  🔍 Search patterns...                                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Categories: [All] [Cards] [Forms] [Navigation] [Content] ...  │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  [Preview]   │  │  [Preview]   │  │  [Preview]   │          │
│  │              │  │              │  │              │          │
│  │  Hero        │  │  Pricing     │  │  Feature     │          │
│  │  Section     │  │  Card        │  │  Grid        │          │
│  │              │  │              │  │              │          │
│  │  [Use]       │  │  [Use]       │  │  [Use]       │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  [Preview]   │  │  [Preview]   │  │  [Preview]   │          │
│  │              │  │              │  │              │          │
│  │  Login       │  │  Settings    │  │  Profile     │          │
│  │  Form        │  │  Panel       │  │  Card        │          │
│  │              │  │              │  │              │          │
│  │  [Use]       │  │  [Use]       │  │  [Use]       │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### F5.2 Pattern Detail

```
┌─────────────────────────────────────────────────────────────────┐
│  ← Back to Patterns                                             │
│                                                                 │
│  Pricing Card                                                   │
│  A subscription pricing card with plan details and CTA          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────┬───────────────────────────────┐  │
│  │                          │                                │  │
│  │     [Preview across      │    Variants                    │  │
│  │      light/dark/dim]     │    ○ Basic                     │  │
│  │                          │    ● Premium (highlighted)     │  │
│  │                          │    ○ Enterprise                │  │
│  │                          │                                │  │
│  │                          │    Customization               │  │
│  │                          │    ☑ Show badge                │  │
│  │                          │    ☑ Show features list        │  │
│  │                          │    ☐ Show comparison           │  │
│  │                          │                                │  │
│  └──────────────────────────┴───────────────────────────────┘  │
│                                                                 │
│  Components: Card, Typography (3), List, Button, Badge          │
│  Tokens: 18 total                                              │
│                                                                 │
│  [Customize & Use]  [View Code]  [Add to Saved]                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## F6: Templates

### F6.1 Full-Page Templates

```
┌─────────────────────────────────────────────────────────────────┐
│  Templates                                                      │
│  Full-page layouts for common screens                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ ┌──────────┐ │  │ ┌──────────┐ │  │ ┌──────────┐ │          │
│  │ │  ══════  │ │  │ │   🔐     │ │  │ │  ⚙️      │ │          │
│  │ │  ══════  │ │  │ │ [    ]   │ │  │ │ ───────  │ │          │
│  │ │  [BTN]   │ │  │ │ [    ]   │ │  │ │ ○  ───   │ │          │
│  │ │          │ │  │ │ [Login]  │ │  │ │ ○  ───   │ │          │
│  │ └──────────┘ │  │ └──────────┘ │  │ └──────────┘ │          │
│  │              │  │              │  │              │          │
│  │  Landing     │  │  Login       │  │  Settings    │          │
│  │  Page        │  │  Screen      │  │  Page        │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ ┌──────────┐ │  │ ┌──────────┐ │  │ ┌──────────┐ │          │
│  │ │  📦 📦   │ │  │ │  👤      │ │  │ │   📊     │ │          │
│  │ │  📦 📦   │ │  │ │  ════    │ │  │ │  ╔═══╗   │ │          │
│  │ │  📦 📦   │ │  │ │  ════    │ │  │ │  ║   ║   │ │          │
│  │ │          │ │  │ │  [Edit]  │ │  │ │  ╚═══╝   │ │          │
│  │ └──────────┘ │  │ └──────────┘ │  │ └──────────┘ │          │
│  │              │  │              │  │              │          │
│  │  Product     │  │  Profile     │  │  Dashboard   │          │
│  │  Grid        │  │  Page        │  │              │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## F7: History & Saved

### F7.1 Generation History

```
┌─────────────────────────────────────────────────────────────────┐
│  History                                          [Clear All]   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Today                                                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  [Thumb] "Subscription card with pricing..."    2:30 PM  │  │
│  │          JioCinema • Mobile • Light                      │  │
│  │          [Open] [Delete]                                  │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │  [Thumb] "Create a user profile header..."      11:15 AM │  │
│  │          JioMart • Desktop • Dark                        │  │
│  │          [Open] [Delete]                                  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  Yesterday                                                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  [Thumb] "Build a movie carousel with..."      4:45 PM   │  │
│  │          JioCinema • Mobile • Dim                        │  │
│  │          [Open] [Delete]                                  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### F7.2 Saved Generations

```
┌─────────────────────────────────────────────────────────────────┐
│  Saved                                           [+ New Folder] │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  📁 Subscription Flow (4 items)                                 │
│  ├── Pricing Card                                               │
│  ├── Plan Comparison                                            │
│  ├── Checkout Form                                              │
│  └── Success Screen                                             │
│                                                                 │
│  📁 Onboarding (3 items)                                        │
│  ├── Welcome Screen                                             │
│  ├── Feature Tour                                               │
│  └── Account Setup                                              │
│                                                                 │
│  📁 Uncategorized (2 items)                                     │
│  ├── Quick test card                                            │
│  └── Profile experiment                                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## F8: Attention Level System

### F8.1 Visual Hierarchy Guidance

The AI uses the 70-20-10 attention distribution rule:

```
┌─────────────────────────────────────────────────────────────────┐
│  Attention Analysis                                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Your generated layout:                                         │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                                                           │  │
│  │  [HIGH] ████  "Premium Plan"     ← Only 1 high allowed   │  │
│  │  [HIGH] ████  "₹999/mo"          ⚠️ VIOLATION             │  │
│  │  [LOW]  ██    Feature list                                │  │
│  │  [MED]  ███   Subscribe Button                            │  │
│  │                                                           │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ⚠️ Issue: Two high-attention elements detected.                │
│     Recommendation: Reduce price to MEDIUM attention.          │
│                                                                 │
│  Distribution:                                                  │
│  High (10%):   ██████████████████████  22% ← Too much          │
│  Medium (20%): ████████████            12% ← Too little        │
│  Low (70%):    ████████████████████████████████████  66% ✓     │
│                                                                 │
│  [Auto-fix Attention] [Ignore]                                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### F8.2 Attention Level Tokens

```typescript
interface AttentionLevel {
  level: 'high' | 'medium' | 'low';
  targetPercentage: number;
  appliedTokens: {
    surface: string;      // Surface-Bold, Surface-Subtle, Surface-Ghost
    text: string;         // Text-High, Text-Medium, Text-Low
    size: string;         // Display, Headline, Body
    weight: string;       // 900, 700, 500, 400
  };
}

const attentionMapping = {
  high: {
    targetPercentage: 10,
    maxPerViewport: 1,
    tokens: {
      surface: 'Surface-Bold',
      text: 'Text-OnBold-High',
      typography: 'Display',
      weight: 900,
    },
  },
  medium: {
    targetPercentage: 20,
    tokens: {
      surface: 'Surface-Subtle',
      text: 'Text-High',
      typography: 'Headline',
      weight: 700,
    },
  },
  low: {
    targetPercentage: 70,
    tokens: {
      surface: 'Surface-Ghost',
      text: 'Text-Medium',
      typography: 'Body',
      weight: 400,
    },
  },
};
```

---

## Data Model

### Convex Schema (Experience Builder)

```typescript
// AI generations
generations: defineTable({
  userId: v.id('users'),
  prompt: v.string(),
  context: v.object({
    brand: v.string(),
    theme: v.string(),
    platform: v.string(),
    density: v.string(),
  }),
  output: v.object({
    jsx: v.string(),
    css: v.string(),
    components: v.array(v.string()),
    tokens: v.array(v.string()),
  }),
  iterations: v.array(v.object({
    prompt: v.string(),
    output: v.any(),
    timestamp: v.number(),
  })),
  feedback: v.optional(v.union(v.literal('positive'), v.literal('negative'))),
  savedToFolder: v.optional(v.string()),
  createdAt: v.number(),
})
  .index('by_user', ['userId'])
  .index('by_created', ['createdAt']),

// Patterns
patterns: defineTable({
  name: v.string(),
  description: v.string(),
  category: v.string(),
  thumbnail: v.string(),
  code: v.object({
    jsx: v.string(),
    css: v.string(),
  }),
  variants: v.array(v.object({
    name: v.string(),
    code: v.object({
      jsx: v.string(),
      css: v.string(),
    }),
  })),
  components: v.array(v.string()),
  tokens: v.array(v.string()),
  usageCount: v.number(),
  createdBy: v.optional(v.id('users')),
  isSystem: v.boolean(),
})
  .index('by_category', ['category'])
  .searchIndex('search_patterns', {
    searchField: 'name',
    filterFields: ['category'],
  }),

// User folders for saved generations
folders: defineTable({
  userId: v.id('users'),
  name: v.string(),
  generationIds: v.array(v.id('generations')),
  createdAt: v.number(),
}),
```

---

## AI Prompting Strategy

### System Prompt for Generation

```
You are an AI assistant specialized in generating UI components for the One UI Design System.

CRITICAL RULES:
1. NEVER use hardcoded values. Always use design tokens.
2. Interactive elements (buttons, inputs, chips) MUST use Shape-Pill (999px border-radius).
3. Only compose from existing Base UI components: Button, Card, TextField, etc.
4. All outputs must pass WCAG AA accessibility requirements.
5. Follow the 70-20-10 attention distribution rule.
6. Generate culturally appropriate designs for the Indian market.

AVAILABLE TOKENS:
- Surface: Surface-Bold, Surface-Subtle, Surface-Ghost, Surface-Default
- Text: Text-High, Text-Medium, Text-Low, Text-OnBold-High
- Spacing: Spacing-1 through Spacing-9
- Shape: Shape-Pill (interactive only), Shape-0-5 through Shape-9
- Typography: Display, Headline, Title, Label, Body (each with L/M/S sizes)

CURRENT CONTEXT:
- Brand: {brand}
- Theme: {theme}
- Platform: {platform}
- Density: {density}

Generate a React component that:
1. Uses only design tokens for all visual properties
2. Composes from Base UI primitives
3. Is fully accessible
4. Includes proper TypeScript types
5. Has corresponding CSS Module styles using only token variables
```

---

## Success Criteria

1. **Generation quality**: 80% of outputs usable without modification
2. **Token compliance**: 100% of outputs use tokens only (no literals)
3. **Speed**: Initial generation in < 3 seconds
4. **Refinement**: Iterative refinements in < 2 seconds
5. **User satisfaction**: Positive feedback on 70%+ of generations

---

## Open Questions

1. How do we handle edge cases where no existing component fits?
2. Should we allow users to train the AI on their specific patterns?
3. What's the feedback loop for improving generation quality?
4. How do we handle multi-language content in generations?
