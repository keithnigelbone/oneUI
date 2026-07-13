/**
 * compositionSkills.ts
 *
 * Convex queries and mutations for reusable composition skills.
 * Skills are screen archetypes, layout patterns, and multi-screen flows
 * that the composition agent can invoke.
 *
 * Mirrors voiceSkills.ts pattern.
 */

import { query, mutation } from './_generated/server';
import { v } from 'convex/values';
import { internal } from './_generated/api';
import { requireBrandRole, requireBrandRoleForDoc, canReadBrand } from './lib/auth';

// ============================================
// Default composition skills
// ============================================

export const DEFAULT_SKILLS = [
  {
    skillId: 'login-screen',
    name: 'Login / Sign In Screen',
    description: 'Authentication screen with hero, form fields, primary CTA, and secondary actions.',
    category: 'screen' as const,
    systemPromptTemplate: `Generate a {vertical} login screen for {brand}. Required structure:

1. Brand mark (top) — text span with the brand name in Headline-M or Display-S
   typography, coloured with var(--Primary-Default-Accent). DO NOT invent a
   Logo component. DO NOT split "BrandName" across components.
2. Welcome heading ("Welcome back" or similar) — Headline-L, Text-High.
3. Subtitle ("Sign in to continue") — Body-M using
   var(--Primary-Default-Medium-Text). NEVER use Text-Low for this; it makes
   the subtitle unreadable on a white card.
4. Email field — Input with label "Email address".
5. Password field — Input type password with label.
6. "Keep me signed in" checkbox (optional).
7. **PRIMARY Sign In button — MANDATORY**. Placed immediately after the form
   fields. Full-width. Button with attention="high" appearance="primary".
   This is the ONE high-attention CTA on the screen.
8. "Forgot password?" link (Button contained={false}, low attention).
9. Optional SSO section — only AFTER the primary CTA, separated by a
   divider labelled "or continue with". SSO buttons use
   attention="medium" appearance="neutral" variant="subtle".
10. "Don't have an account? Sign up" link (low attention) at bottom.

Rules:
- Primary CTA MUST come before SSO. Never lead with Google/OTP.
- Use default surface throughout. Single primary CTA per screen.
- Mobile-first (390px).`,
    applicableContexts: ['mobile-app', 'web-app'] as string[],
    examples: [
      {
        prompt: 'Create a login screen for JioCinema',
        expectedAST: '{"version":1,"name":"Login","root":{"id":"root","kind":"element","tag":"div","props":{"style":{"display":"flex","flexDirection":"column","gap":"var(--Spacing-4-5)"}},"children":[]}}',
        context: 'mobile-app',
      },
    ],
  },
  {
    skillId: 'settings-page',
    name: 'Settings Page',
    description: 'Settings screen with toggle rows, grouped sections, and a save action.',
    category: 'screen' as const,
    systemPromptTemplate: `Generate a {vertical} settings page for {brand}. Structure:
1. Page title (Headline-L)
2. Grouped setting sections with section titles (Title-M)
3. Each setting: label + Switch in a space-between row
4. Save button at bottom (medium attention, primary)

Keep it clean and functional. Default surface. Neutral appearance for settings switches.`,
    applicableContexts: ['mobile-app', 'web-app'] as string[],
    examples: [],
  },
  {
    skillId: 'product-card',
    name: 'Product Card',
    description: 'E-commerce product card with image, title, price, and add-to-cart CTA.',
    category: 'pattern' as const,
    systemPromptTemplate: `Generate a {vertical} product card for {brand}. Structure:
1. Product image (16:9 or 1:1 aspect ratio)
2. Product title (Title-S)
3. Price text (Body-M, medium emphasis)
4. Optional: rating or badge
5. Add to Cart button (high attention, primary)

Default surface. Content is the hero — the card background never competes with the image.`,
    applicableContexts: ['mobile-app', 'web-app', 'marketing-page'] as string[],
    examples: [],
  },
  {
    skillId: 'hero-section',
    name: 'Hero Section',
    description: 'Full-width hero with bold surface, headline, description, and CTA.',
    category: 'pattern' as const,
    systemPromptTemplate: `Generate a {vertical} hero section for {brand}. Structure:
1. Surface mode="bold" wrapper (brand-colored background)
2. Display-L headline (hero text, high impact)
3. Body-M description (1-2 sentences)
4. Primary CTA button (bold, fullWidth on mobile)
5. Optional: secondary ghost button

Use bold surface for brand impact. Children automatically adapt via surface context.`,
    applicableContexts: ['mobile-app', 'web-app', 'marketing-page', 'social-post'] as string[],
    examples: [],
  },
  {
    skillId: 'onboarding-flow',
    name: 'Onboarding Flow',
    description: 'Multi-screen onboarding with image, feature description, and progress CTA.',
    category: 'flow' as const,
    systemPromptTemplate: `Generate a {vertical} onboarding flow for {brand} with 3 screens. Each screen:
1. Large image (top 50% of screen, 16:9)
2. Feature title (Headline-M)
3. Feature description (Body-M, 1-2 sentences)
4. Continue button (high attention, primary, fullWidth)
5. Skip link (low attention)

Use data-screen attribute to separate screens. Default surface throughout.
Progressive brand disclosure: screens get slightly more branded as user progresses.`,
    applicableContexts: ['mobile-app'] as string[],
    examples: [],
  },
  {
    skillId: 'dashboard-grid',
    name: 'Dashboard Grid',
    description: 'Data dashboard with metric cards, status indicators, and quick actions.',
    category: 'screen' as const,
    systemPromptTemplate: `Generate a {vertical} dashboard for {brand}. Structure:
1. Page title with greeting (Headline-L)
2. Summary metric cards (2-4, in a grid/row)
   - Each card: metric label (Label-S), value (Headline-M), optional trend indicator
3. Recent activity section (Title-M heading + list rows)
4. Quick actions row (2-3 buttons, medium/low attention)

Compact density appropriate. Default surface with <Surface mode="minimal"> for metric cards.`,
    applicableContexts: ['web-app', 'mobile-app'] as string[],
    examples: [],
  },

  // ── Vertical-specific skills ──────────────────────────────────────────

  {
    skillId: 'ecommerce-product-grid',
    name: 'E-Commerce Product Grid',
    description: 'Product listing with filter chips, image-first cards, price display, and add-to-cart CTAs. Covers surface application (default bg, no card fills), attention levels (one CTA per card), and spacing rules for grid layouts.',
    category: 'pattern' as const,
    systemPromptTemplate: `Generate an e-commerce product grid for {brand}.

Surface rules:
- Page background: default (white). Products are the visual content.
- Cards: default background — never add card fills that compete with product images.
- Filter chips: secondary appearance, ghost variant for unselected, bold for selected.

Attention hierarchy:
- One primary CTA per card ("Add to Cart" — bold, primary, size s).
- Price: Body-M with medium emphasis weight.
- Product title: Title-S.

Layout:
- Grid: repeat(auto-fill, minmax(160px, 1fr)) with gap var(--Spacing-4).
- Filter bar: horizontal scroll, gap var(--Spacing-2).
- Page header: Headline-L.

Typography: JioType Var via --Typography-Font-Primary on all text.
Spacing: var(--Spacing-4) grid gap, var(--Spacing-Margin) page margins.`,
    applicableContexts: ['mobile-app', 'web-app'] as string[],
    examples: [],
  },
  {
    skillId: 'entertainment-media-card',
    name: 'Entertainment Media Card',
    description: 'Immersive media cards with edge-to-edge thumbnails, overlay text, minimal chrome. Covers bold surface usage for hero moments, progressive brand disclosure, and dark mode preference.',
    category: 'pattern' as const,
    systemPromptTemplate: `Generate entertainment media cards for {brand}.

Surface rules:
- Prefer dark/bold surfaces for hero areas. Content thumbnails dominate.
- Use Surface mode="bold" for featured content hero.
- Minimal chrome — content IS the interface.

Attention:
- Featured item: bold surface with Display-L title overlay.
- Regular items: thumbnail + Title-S, no explicit CTA — the card itself is tappable.
- Progress indicators: subtle, neutral appearance.

Layout:
- Horizontal scroll rows for content categories.
- Full-width hero for featured content (16:9 aspect ratio).
- Category title: Title-M, left-aligned.
- Generous vertical spacing (var(--Spacing-6)) between category rows.

Do's: Edge-to-edge imagery, dark backgrounds, immersive feel.
Don'ts: Dense text, multiple CTAs per card, bright backgrounds competing with thumbnails.`,
    applicableContexts: ['mobile-app', 'web-app'] as string[],
    examples: [],
  },
  {
    skillId: 'finance-data-table',
    name: 'Finance Data Table',
    description: 'Data-dense financial layout with tables, trust signals, numerical emphasis, and conservative spacing. Covers form patterns, data visualisation, and accessibility for financial data.',
    category: 'pattern' as const,
    systemPromptTemplate: `Generate a financial data layout for {brand}.

Surface rules:
- Default surface throughout. Trust and clarity over visual flair.
- <Surface mode="minimal"> for alternating table rows (subtle differentiation).
- Never use bold surfaces for data containers — data readability is paramount.

Attention:
- Primary CTA: one per section (e.g., "Make Payment", "Transfer").
- Secondary actions: subtle variant.
- Numerical data: Headline-M with tabular-nums font-variant.

Typography:
- Table headers: Label-S, medium weight.
- Data cells: Body-M, tabular-nums.
- Section totals: Title-S, high weight.
- Form labels: Label-S.

Layout:
- Conservative spacing — var(--Spacing-4) between rows.
- Clear column alignment.
- Trust signals (security badges, verified icons) prominent but not competing with data.

Do's: Tabular number formatting, clear hierarchy, accessible contrast.
Don'ts: Bold surfaces behind data, decorative elements competing with numbers, playful typography.`,
    applicableContexts: ['web-app', 'mobile-app'] as string[],
    examples: [],
  },
  {
    skillId: 'iot-status-dashboard',
    name: 'IoT Status Dashboard',
    description: 'Real-time device dashboard with status cards, colour-coded indicators, compact density, and grid-of-widgets layout. Covers state communication via semantic roles and compact spacing.',
    category: 'screen' as const,
    systemPromptTemplate: `Generate an IoT status dashboard for {brand}.

Surface rules:
- Default background. Status cards use <Surface mode="minimal"> for grouping.
- Colour-coded states via semantic appearances:
  - Online/healthy: positive
  - Warning/maintenance: warning
  - Offline/error: negative
  - Informational/pending: informative

Attention:
- Device name: Title-S.
- Status indicator: Badge with semantic appearance.
- Quick actions: IconButton, low attention, neutral.

Layout:
- Grid of widget cards: repeat(auto-fill, minmax(240px, 1fr)).
- Compact density appropriate — var(--Spacing-3-5) between cards.
- Each card: device name + status badge + last reading + mini chart area.
- Summary bar at top: total devices, online count, offline count.

Typography:
- Reading values: Headline-S with tabular-nums.
- Labels: Label-XS.
- Timestamps: Body-XS, low emphasis, Text-Low color.`,
    applicableContexts: ['web-app'] as string[],
    examples: [],
  },
  {
    skillId: 'governance-document-layout',
    name: 'Governance Document Layout',
    description: 'Formal, structured document layout with high readability, sequential headings, accessibility-first design, conservative colour. Covers multilingual support patterns and form accessibility.',
    category: 'screen' as const,
    systemPromptTemplate: `Generate a governance/official document layout for {brand}.

Surface rules:
- Default background exclusively. No bold surfaces, no decorative elements.
- <Surface mode="subtle"> for callout boxes and important notices only.
- Maximum readability — this is an official document interface.

Attention:
- Primary action: one per page ("Submit Application", "Download PDF").
- All other actions: ghost or subtle, neutral appearance.
- Never use sparkle or celebration elements.

Typography:
- Page title: Headline-L.
- Section headings: Title-L, sequential hierarchy (h2 → h3 → h4).
- Body text: Body-M, low weight, max line length 65ch.
- Form labels: Label-S, medium weight.
- Legal text: Body-S, Text-Low colour.

Layout:
- Single column, max-width 720px for readability.
- Generous margins: var(--Spacing-Margin).
- Section gap: var(--Spacing-7).
- Form fields: full-width, stacked vertically.

Accessibility:
- Sequential heading hierarchy mandatory.
- All form fields must have visible labels.
- Focus indicators must be visible.
- Minimum contrast: WCAG AA (4.5:1).

Do's: Clear structure, high readability, accessible forms, multilingual support.
Don'ts: Decorative elements, bold surfaces, playful components, crowded layouts.`,
    applicableContexts: ['web-app', 'mobile-app'] as string[],
    examples: [],
  },
  {
    skillId: 'telecom-plan-comparison',
    name: 'Telecom Plan Comparison',
    description: 'Plan comparison cards with pricing, features, usage meters, and promotional hero section. Covers attention hierarchy for upsell, numerical display, and CTA placement.',
    category: 'pattern' as const,
    systemPromptTemplate: `Generate a telecom plan comparison for {brand}.

Surface rules:
- Default background for the comparison grid.
- Recommended plan: <Surface mode="subtle"> or elevated for emphasis.
- Optional hero section above: Surface mode="bold" for promotional message.

Attention:
- Recommended plan CTA: high attention, primary ("Choose Plan").
- Other plan CTAs: medium attention, primary.
- Current plan indicator: Badge with positive appearance.
- Price: Headline-M, high weight.

Layout:
- 2-3 plan cards side by side (horizontal scroll on mobile).
- Each card: plan name (Title-M) → price (Headline-M) → features list → CTA.
- Features: checkmarks (positive) / crosses (neutral) for included/excluded.
- Usage meter: progress bar pattern for data/minutes used.

Typography:
- Plan name: Title-M.
- Price: Headline-M with tabular-nums.
- Features: Body-S.
- Fine print: Label-XS, Text-Low.

Do's: Clear price comparison, feature differentiation, one recommended plan highlighted.
Don'ts: More than one high-attention CTA visible simultaneously, hidden fees.`,
    applicableContexts: ['mobile-app', 'web-app'] as string[],
    examples: [],
  },
  {
    skillId: 'print-brochure',
    name: 'Print Brochure Layout',
    description: 'Print-ready brochure cover or page with physical dimensions, bleed margins, CMYK-safe colours, and high-resolution image placeholders.',
    category: 'screen' as const,
    systemPromptTemplate: `Generate a print brochure layout for {brand}.

Physical constraints:
- Include data-print metadata: width, height (in mm), DPI (300 minimum).
- Include data-bleed="3mm" on the root element.
- All colours must be CMYK-reproducible — avoid pure RGB blues and neon greens.

Layout:
- Clear visual hierarchy: hero image (top 40%), headline, body text, contact/CTA.
- Safe zone: keep critical content 10mm from trim edges.
- Bleed: extend background images/colours 3mm beyond trim.

Typography:
- Headline: Display-L (minimum 24pt equivalent at print size).
- Body: Body-M (minimum 9pt — never smaller for print).
- Always specify font-family for print font embedding.

Surface rules:
- Static medium — no interactive components.
- Use Image elements for all visual content.
- High contrast between text and background.

Do's: High-resolution images, clear hierarchy, generous margins, CMYK-safe colours.
Don'ts: Interactive components, transparency effects, thin hairlines (below 0.25pt).`,
    applicableContexts: ['print'] as string[],
    examples: [],
  },
  {
    skillId: 'outdoor-billboard',
    name: 'Outdoor Billboard',
    description: 'Billboard/hoarding layout with maximum 7-word headline, bold minimal design, distance-readable typography, and physical size metadata.',
    category: 'screen' as const,
    systemPromptTemplate: `Generate an outdoor billboard layout for {brand}.

Physical constraints:
- Include data-outdoor metadata with physical dimensions.
- Common sizes: 48-sheet (6096×3048mm), 6-sheet (1200×1800mm).
- Must be readable in 3-5 seconds at distance.

Layout:
- Maximum 3 elements: hero image/product, headline, optional logo/tagline.
- 7 words maximum in headline.
- Center or left-aligned only.
- Massive clear zones — background is as important as content.

Typography:
- Display-L exclusively for headlines (scaled to physical size).
- Never use anything smaller than Headline-M.
- Sans-serif only (--Typography-Font-Primary).
- Maximum 2 type sizes per composition.
- Ultra-high contrast.

Surface rules:
- Bold surfaces encouraged — this IS a brand moment.
- Surface mode="bold" for brand-coloured backgrounds.
- Non-interactive only: Image + text elements.

Do's: Bold, minimal, immediately comprehensible, brand-forward.
Don'ts: Body text, fine detail, multiple messages, subtle typography.`,
    applicableContexts: ['outdoor'] as string[],
    examples: [],
  },

  // ── Density-inversion archetype ────────────────────────────────────────
  // Triggered when the screen's purpose is data, intelligence, monitoring,
  // inferred state, or copilot-style assistance. Inverts the usual 5/10/25/60
  // attention pyramid: signal-density beats restraint when intelligence is
  // the product. NOT a license to add decoration — meaningful density only.
  {
    skillId: 'high-density-data-screen',
    name: 'High-Density Data Screen',
    description:
      'Data-dense screen archetype for dashboards, copilots, monitors, health apps, finance trackers, IoT status. Inverts the attention pyramid: multiple medium-attention pivots replace a single hero. Forbids decorative icons; demands ≥3 differentiation data points per region.',
    category: 'screen' as const,
    systemPromptTemplate: `Generate a high-density data screen for {brand} ({vertical}).

When to apply this archetype:
- The screen's purpose is data, intelligence, monitoring, inferred state, or copilot-style assistance
- The user comes to *learn* or *decide*, not to *act on a single CTA*
- Examples: portfolio dashboards, IoT device status, health metrics, fleet monitors, copilot/assistant panels, alert centres

Density inversion (this is the core rule):
- Minimum 3 differentiation data points per visible region: number, reasoning snippet, inferred state, context link
- The conventional 5/10/25/60 attention pyramid does NOT apply here
- Multiple medium-attention pivots are correct — having one "hero" makes the screen feel under-informed
- DO NOT collapse stats into a single hero number when 3 dimensions exist
- DO NOT add a hero CTA at the top of a dashboard — the data IS the hero

Surface rules:
- Page surface: default. Data clusters use Surface mode="subtle" or mode="minimal" to group related metrics.
- NEVER use bold surfaces for data containers — readability is paramount.
- NEVER add a stroke on a tinted Surface — the tint already groups the cluster.

Component selection (in priority order):
- Stat tile: Card with Label-S (metric name) + Headline-M (value) + Body-S (inferred reason or trend snippet)
- Status row: Icon (functional, paired with text) + Label + Body-S inferred state
- Mini-trend: small chart or sparkline with Title-S header
- Inline reasoning: Body-S text in --Text-Medium colour explaining the *why* behind a number

Typography:
- Numbers: Headline-M or Display-S — the eye should land on the number first
- Labels: Label-S in --Text-Medium so they recede behind the value
- Reasoning text: Body-S in --Text-Medium — present but secondary
- Use --Typography-Font-Primary throughout

Attention pattern:
- 4-6 stat tiles arranged in a grid: var(--Spacing-3-5) gap on mobile, var(--Spacing-4) on web
- Each tile: medium attention internally — bold value, subtle frame
- Quick-action buttons (if any): variant="subtle" or "ghost" — never bold; data is the hero

Do's:
- DO stack 3+ data points per stat tile (number + label + reason or trend)
- DO use Surface mode="subtle" to group related metrics into clusters
- DO show inferred state inline ("up 12% vs last week", "device offline 2h ago")
- DO repeat similar tiles — repetition aids scanning

Don'ts:
- DON'T add a hero CTA at the top of a dashboard
- DON'T collapse multi-dimensional data into a single big number
- DON'T add decorative icons — every icon must pair with text and carry meaning
- DON'T add strokes around tinted Surface clusters
- DON'T use bold variant buttons; secondary actions stay subtle/ghost`,
    applicableContexts: ['mobile-app', 'web-app'] as string[],
    examples: [],
  },
];

// ============================================
// Queries
// ============================================

/**
 * List all composition skills for a brand
 */
export const list = query({
  args: { brandId: v.id('brands') },
  handler: async (ctx, args) => {
    if (!(await canReadBrand(ctx, args.brandId))) return [];
    return await ctx.db
      .query('compositionSkills')
      .withIndex('by_brand', (q) => q.eq('brandId', args.brandId))
      .collect();
  },
});

/**
 * Get a skill by Convex id. Used by the auto-link agent route.
 */
export const get = query({
  args: { id: v.id('compositionSkills') },
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args.id);
    if (!doc) return null;
    // Read-scoped: authenticated non-members get null (anonymous tooling passes).
    if (!(await canReadBrand(ctx, doc.brandId))) return null;
    return doc;
  },
});

/**
 * Get a specific skill by brand + skillId
 */
export const getBySkillId = query({
  args: {
    brandId: v.id('brands'),
    skillId: v.string(),
  },
  handler: async (ctx, args) => {
    if (!(await canReadBrand(ctx, args.brandId))) return null;
    return await ctx.db
      .query('compositionSkills')
      .withIndex('by_brand_skill', (q) =>
        q.eq('brandId', args.brandId).eq('skillId', args.skillId))
      .first();
  },
});

/**
 * Assert that the caller may edit a composition skill without mutating it.
 * Server API routes use this before doing expensive external work.
 */
export const assertCanUpdate = mutation({
  args: { id: v.id('compositionSkills') },
  handler: async (ctx, args) => {
    await requireBrandRoleForDoc(ctx, 'compositionSkills', args.id, 'editor');
    return true;
  },
});

/**
 * Get default skills (for reference)
 */
export const getDefaults = query({
  args: {},
  handler: async () => {
    return DEFAULT_SKILLS;
  },
});

/**
 * Get the top-rated active skills for a brand, ordered by `positiveRatings`
 * descending. Used by the Skill Writer (Phase F) as the primary few-shot
 * source. Cold-start brands (no positive feedback yet) return an empty or
 * sparse list — callers supplement with `DEFAULT_SKILLS` to reach 5 examples.
 */
export const getTopRated = query({
  args: {
    brandId: v.id('brands'),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    if (!(await canReadBrand(ctx, args.brandId))) return [];
    const all = await ctx.db
      .query('compositionSkills')
      .withIndex('by_brand', (q) => q.eq('brandId', args.brandId))
      .collect();
    const active = all.filter((s) => s.isActive !== false);
    active.sort((a, b) => (b.positiveRatings ?? 0) - (a.positiveRatings ?? 0));
    return active.slice(0, args.limit ?? 5);
  },
});

// ============================================
// Mutations
// ============================================

/**
 * Seed default composition skills for a brand
 */
export const seedDefaults = mutation({
  args: { brandId: v.id('brands') },
  handler: async (ctx, args) => {
    await requireBrandRole(ctx, args.brandId, 'editor');
    const existing = await ctx.db
      .query('compositionSkills')
      .withIndex('by_brand', (q) => q.eq('brandId', args.brandId))
      .collect();

    if (existing.length > 0) {
      throw new Error('Composition skills already exist for this brand');
    }

    const now = Date.now();
    const ids = [];

    for (const skill of DEFAULT_SKILLS) {
      const id = await ctx.db.insert('compositionSkills', {
        brandId: args.brandId,
        skillId: skill.skillId,
        name: skill.name,
        description: skill.description,
        category: skill.category,
        systemPromptTemplate: skill.systemPromptTemplate,
        applicableContexts: skill.applicableContexts,
        examples: skill.examples,
        isActive: true,
        version: 1,
        createdAt: now,
        updatedAt: now,
      });
      ids.push(id);
      // Hybrid RAG (RFC 0002): auto-embed newly seeded skills.
      await ctx.scheduler.runAfter(0, internal.compositionEmbeddings.autoEmbedSkill, { id });
    }

    return ids;
  },
});

/**
 * Create a new composition skill (pack)
 */
export const create = mutation({
  args: {
    brandId: v.id('brands'),
    skillId: v.string(),
    name: v.string(),
    description: v.string(),
    category: v.union(v.literal('screen'), v.literal('pattern'), v.literal('flow')),
    systemPromptTemplate: v.string(),
    applicableContexts: v.array(v.string()),
    // Pack fields
    archetype: v.optional(v.string()),
    vertical: v.optional(v.string()),
    linkedRuleSectionIds: v.optional(v.array(v.string())),
    linkedReferenceScreenIds: v.optional(v.array(v.id('referenceScreens'))),
    dosDonts: v.optional(v.array(v.string())),
    attentionPattern: v.optional(v.string()),
    examples: v.optional(v.array(v.object({
      prompt: v.string(),
      expectedAST: v.string(),
      context: v.optional(v.string()),
    }))),
  },
  handler: async (ctx, args) => {
    await requireBrandRole(ctx, args.brandId, 'editor');
    const existing = await ctx.db
      .query('compositionSkills')
      .withIndex('by_brand_skill', (q) =>
        q.eq('brandId', args.brandId).eq('skillId', args.skillId))
      .first();

    if (existing) {
      throw new Error(`Skill "${args.skillId}" already exists for this brand`);
    }

    const now = Date.now();

    const newId = await ctx.db.insert('compositionSkills', {
      brandId: args.brandId,
      skillId: args.skillId,
      name: args.name,
      description: args.description,
      category: args.category,
      systemPromptTemplate: args.systemPromptTemplate,
      applicableContexts: args.applicableContexts,
      archetype: args.archetype,
      vertical: args.vertical,
      linkedRuleSectionIds: args.linkedRuleSectionIds,
      linkedReferenceScreenIds: args.linkedReferenceScreenIds,
      dosDonts: args.dosDonts,
      attentionPattern: args.attentionPattern,
      examples: args.examples ?? [],
      isActive: true,
      version: 1,
      createdAt: now,
      updatedAt: now,
    });
    await ctx.scheduler.runAfter(0, internal.compositionEmbeddings.autoEmbedSkill, {
      id: newId,
    });
    return newId;
  },
});

/**
 * Update a composition skill (pack)
 */
export const update = mutation({
  args: {
    id: v.id('compositionSkills'),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    category: v.optional(v.union(v.literal('screen'), v.literal('pattern'), v.literal('flow'))),
    systemPromptTemplate: v.optional(v.string()),
    applicableContexts: v.optional(v.array(v.string())),
    isActive: v.optional(v.boolean()),
    archetype: v.optional(v.string()),
    vertical: v.optional(v.string()),
    linkedRuleSectionIds: v.optional(v.array(v.string())),
    linkedReferenceScreenIds: v.optional(v.array(v.id('referenceScreens'))),
    dosDonts: v.optional(v.array(v.string())),
    attentionPattern: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireBrandRoleForDoc(ctx, 'compositionSkills', args.id, 'editor');
    const skill = await ctx.db.get(args.id);
    if (!skill) throw new Error('Composition skill not found');

    const updates: Record<string, unknown> = {
      updatedAt: Date.now(),
      version: skill.version + 1,
    };

    for (const key of [
      'name',
      'description',
      'category',
      'systemPromptTemplate',
      'applicableContexts',
      'isActive',
      'archetype',
      'vertical',
      'linkedRuleSectionIds',
      'linkedReferenceScreenIds',
      'dosDonts',
      'attentionPattern',
    ] as const) {
      if (args[key] !== undefined) updates[key] = args[key];
    }

    await ctx.db.patch(args.id, updates);
    // Schedule re-embed when any embed-influencing field changed.
    const embedSensitiveKeys = [
      'name',
      'description',
      'systemPromptTemplate',
      'archetype',
      'vertical',
      'attentionPattern',
      'dosDonts',
    ] as const;
    const embedDirty = embedSensitiveKeys.some((k) => args[k] !== undefined);
    if (embedDirty) {
      await ctx.scheduler.runAfter(0, internal.compositionEmbeddings.autoEmbedSkill, {
        id: args.id,
      });
    }
    return args.id;
  },
});

/**
 * Resolve a skill pack — skill + its linked rules + linked references (with
 * latest analyses) in one call. This is what the context-pack endpoint
 * assembles when an external tool asks for a vertical/archetype bundle.
 */
export const getPack = query({
  args: {
    brandId: v.id('brands'),
    skillId: v.string(),
  },
  handler: async (ctx, args) => {
    if (!(await canReadBrand(ctx, args.brandId))) return null;
    const skill = await ctx.db
      .query('compositionSkills')
      .withIndex('by_brand_skill', (q) =>
        q.eq('brandId', args.brandId).eq('skillId', args.skillId))
      .first();
    if (!skill) return null;

    // Resolve linked rules from the same brand's compositionRules.
    const allRules = await ctx.db
      .query('compositionRules')
      .withIndex('by_brand', (q) => q.eq('brandId', args.brandId))
      .collect();
    const linkedRules = (skill.linkedRuleSectionIds ?? []).length > 0
      ? allRules.filter((r) => skill.linkedRuleSectionIds!.includes(r.sectionId))
      : allRules; // empty link list = pack includes every rule

    // Resolve linked references with their latest analysis summary.
    const references = await Promise.all(
      (skill.linkedReferenceScreenIds ?? []).map(async (id) => {
        const screen = await ctx.db.get(id);
        if (!screen) return null;
        const analyses = await ctx.db
          .query('referenceAnalyses')
          .withIndex('by_screen', (q) => q.eq('screenId', id))
          .collect();
        const latest = analyses.sort((a, b) => b.updatedAt - a.updatedAt)[0] ?? null;
        return { screen, analysis: latest };
      }),
    );

    return {
      skill,
      linkedRules,
      references: references.filter((r): r is NonNullable<typeof r> => Boolean(r)),
    };
  },
});

/** List packs (skills) by vertical — external tools can discover what's
 *  available for a given vertical when the archetype is unknown. */
export const listByVertical = query({
  args: {
    brandId: v.id('brands'),
    vertical: v.string(),
  },
  handler: async (ctx, args) => {
    if (!(await canReadBrand(ctx, args.brandId))) return [];
    return ctx.db
      .query('compositionSkills')
      .withIndex('by_brand_vertical', (q) =>
        q.eq('brandId', args.brandId).eq('vertical', args.vertical))
      .collect();
  },
});

/**
 * Toggle a skill active/inactive
 */
export const toggleActive = mutation({
  args: {
    id: v.id('compositionSkills'),
  },
  handler: async (ctx, args) => {
    await requireBrandRoleForDoc(ctx, 'compositionSkills', args.id, 'editor');
    const skill = await ctx.db.get(args.id);
    if (!skill) throw new Error('Composition skill not found');

    await ctx.db.patch(args.id, {
      isActive: !skill.isActive,
      updatedAt: Date.now(),
    });
  },
});
