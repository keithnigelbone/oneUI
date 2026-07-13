/**
 * voiceSkills.ts
 *
 * Convex queries and mutations for Voice AI Skills.
 *
 * Skills earn their place only when output needs to be predictable,
 * auditable, or legally safe. Generic writing tasks (onboarding copy,
 * troubleshooting, proactive messages) are handled by the base voice rules
 * + context-aware compilation, not discrete skills.
 *
 * Current keepers (3):
 *   1. Plan Comparison — must be neutral, structured, never upsell
 *   2. Error Message Generator — consistent format, non-blame, legal safety
 *   3. Sensitive Situation Handler — death, financial distress, repeat complaints
 *
 * Removed (folded into voice rules or replaced by features):
 *   - troubleshooting-guide → formatting guidance in system prompt
 *   - proactive-message → covered by proactive rule section (#10)
 *   - onboarding-copy → generic copy rules in copy context
 *   - handoff-summary → handoff rule section (#12)
 *   - tone-rewriter → replaced by "Rewrite with Jio Voice" Sanity action
 */

import { query, mutation } from './_generated/server';
import { v } from 'convex/values';
import { requireBrandRole, requireBrandRoleForDoc, canReadBrand } from './lib/auth';

// ============================================
// Default skills — 3 keepers
// ============================================

const DEFAULT_SKILLS = [
  {
    skillId: 'error-message-generator',
    name: 'Error Message Generator',
    description: 'Generate user-facing error messages with consistent format, non-blame language, and legal safety.',
    category: 'service' as const,
    systemPromptTemplate:
      'You are {brand}\'s error message writer.\n\nTone: {tone}\n\nRules:\n{rules}\n\nGiven an error code and context, generate a clear, helpful error message that:\n- Explains what happened in plain language\n- Suggests what the user can do next\n- Avoids technical jargon\n- Never blames the user\n- Matches the brand voice',
    examples: [
      {
        input: 'Error: PAYMENT_DECLINED, context: insufficient balance on prepaid account',
        expectedOutput: 'Your payment didn\'t go through -- looks like your balance is a bit low. Top up your account and try again, or switch to a different payment method.',
        channel: 'app',
      },
    ],
    channelConfig: {
      sms: { maxLength: 160, formatting: 'none' },
      whatsapp: { maxLength: 280, formatting: 'minimal' },
      app: { maxLength: 500, formatting: 'structured' },
      ivr: { maxLength: 200, formatting: 'spoken' },
      email: { maxLength: 1000, formatting: 'light' },
    },
  },
  {
    skillId: 'plan-comparison',
    name: 'Plan Comparison',
    description: 'Compare 2-3 plans neutrally. Must be structured, never upsell. Regulatory risk if biased.',
    category: 'service' as const,
    systemPromptTemplate:
      'You are {brand}\'s plan comparison assistant.\n\nTone: {tone}\n\nRules:\n{rules}\n\nCompare the given plans neutrally and helpfully:\n- Present differences clearly without pushing one option\n- Highlight what matters for the user\'s stated needs\n- Use simple language, avoid marketing speak\n- Never upsell or steer toward a more expensive option\n- End with a question to help them decide',
    examples: [
      {
        input: 'Compare: Jio Freedom 299 (2GB/day, 28 days) vs Jio Freedom 549 (1.5GB/day, 84 days). User watches lots of video.',
        expectedOutput: 'Here\'s how these two compare:\n\n**Jio Freedom 299** -- 2GB/day for 28 days (56GB total, ~Rs 5.3/GB)\n**Jio Freedom 549** -- 1.5GB/day for 84 days (126GB total, ~Rs 4.4/GB)\n\nSince you watch a lot of video, the 299 gives you more daily data, but you\'d recharge 3x in the same period (Rs 897 total). The 549 costs less per GB overall.\n\nWhat matters more to you -- daily data or total value?',
        channel: 'app',
      },
    ],
    channelConfig: {
      sms: { maxLength: 160, formatting: 'none' },
      whatsapp: { maxLength: 500, formatting: 'minimal' },
      app: { maxLength: 800, formatting: 'structured' },
      email: { maxLength: 1500, formatting: 'light' },
    },
  },
  {
    skillId: 'sensitive-situation-handler',
    name: 'Sensitive Situation Handler',
    description: 'Handle bereavement, financial distress, repeat complaints, and other high-stakes emotional situations. Generic LLM defaults to hollow sympathy — this skill provides explicit rules because the reputational cost of getting it wrong is real.',
    category: 'service' as const,
    systemPromptTemplate:
      'You are {brand}\'s sensitive situation handler.\n\nTone: {tone}\n\nRules:\n{rules}\n\nYou are responding to a person in a difficult situation. Follow these principles:\n\n1. LEAD WITH PRESENCE, NOT PROCESS\n   - Acknowledge what happened before any practical step\n   - Use warm, unhurried language. No corporate script.\n   - Never open with policy, forms, or timelines\n\n2. MATCH THE WEIGHT OF THE MOMENT\n   - Bereavement: gentle, minimal, no cheerful language. Help with the specific request (number transfer, bill closure). Do not say "I\'m sorry for your loss" — it\'s scripted. Instead, show care through the quality and speed of help.\n   - Financial distress: non-judgemental, practical. Focus on what options exist. Never imply the person is at fault.\n   - Repeat complaints: accept frustration without defending. Own the failure. Give a concrete action with a specific timeline.\n\n3. KNOW WHEN TO STOP\n   - If the person needs something beyond your ability, say so and hand off to a human immediately.\n   - Never fill silence with filler. Short is better than padded.\n   - End by confirming the outcome and opening a clear next step.',
    examples: [
      {
        input: 'Customer\'s father passed away. The father\'s Jio number is still active and they need to close or transfer it.',
        expectedOutput: 'We\'ll take care of this for you.\n\nTo transfer or close your father\'s number, we need a copy of the death certificate and your ID. You can share them here, or visit any Jio store if that\'s easier.\n\nThere\'s no rush on timing. Take whatever time you need.',
        channel: 'app',
      },
      {
        input: 'Customer is in financial distress and cannot afford to recharge but needs the number active for job-seeking.',
        expectedOutput: 'Your number will stay active for incoming calls even without a recharge. If you need data for job applications, our smallest pack is Rs 19 for 1 day of data.\n\nWould that help for now? We can also check if there are any offers on your account.',
        channel: 'whatsapp',
      },
    ],
    channelConfig: {
      sms: { maxLength: 160, formatting: 'none' },
      whatsapp: { maxLength: 400, formatting: 'minimal' },
      app: { maxLength: 600, formatting: 'structured' },
      email: { maxLength: 1200, formatting: 'light' },
    },
  },
];

// ============================================
// Shared validators
// ============================================

const categoryValidator = v.union(
  v.literal('service'),
  v.literal('content'),
  v.literal('internal')
);

const channelConfigValidator = v.optional(v.object({
  sms: v.optional(v.object({ maxLength: v.number(), formatting: v.string() })),
  whatsapp: v.optional(v.object({ maxLength: v.number(), formatting: v.string() })),
  app: v.optional(v.object({ maxLength: v.number(), formatting: v.string() })),
  ivr: v.optional(v.object({ maxLength: v.number(), formatting: v.string() })),
  email: v.optional(v.object({ maxLength: v.number(), formatting: v.string() })),
}));

const exampleValidator = v.array(v.object({
  input: v.string(),
  expectedOutput: v.string(),
  channel: v.optional(v.string()),
}));

// ============================================
// Queries
// ============================================

/**
 * List all skills for a brand
 */
export const list = query({
  args: { brandId: v.id('brands') },
  handler: async (ctx, args) => {
    if (!(await canReadBrand(ctx, args.brandId))) return [];
    return await ctx.db
      .query('voiceSkills')
      .withIndex('by_brand', (q) => q.eq('brandId', args.brandId))
      .collect();
  },
});

/**
 * Get a specific skill by brand + skillId
 */
export const get = query({
  args: {
    brandId: v.id('brands'),
    skillId: v.string(),
  },
  handler: async (ctx, args) => {
    if (!(await canReadBrand(ctx, args.brandId))) return null;
    return await ctx.db
      .query('voiceSkills')
      .withIndex('by_brand_skill', (q) =>
        q.eq('brandId', args.brandId).eq('skillId', args.skillId)
      )
      .first();
  },
});

// ============================================
// Mutations
// ============================================

/**
 * Create a new skill for a brand
 */
export const create = mutation({
  args: {
    brandId: v.id('brands'),
    skillId: v.string(),
    name: v.string(),
    description: v.string(),
    category: categoryValidator,
    systemPromptTemplate: v.string(),
    inputSchema: v.optional(v.any()),
    outputSchema: v.optional(v.any()),
    channelConfig: channelConfigValidator,
    examples: exampleValidator,
  },
  handler: async (ctx, args) => {
    await requireBrandRole(ctx, args.brandId, 'editor');
    const existing = await ctx.db
      .query('voiceSkills')
      .withIndex('by_brand_skill', (q) =>
        q.eq('brandId', args.brandId).eq('skillId', args.skillId)
      )
      .first();

    if (existing) {
      throw new Error(`Skill "${args.skillId}" already exists for this brand`);
    }

    const now = Date.now();

    const id = await ctx.db.insert('voiceSkills', {
      brandId: args.brandId,
      skillId: args.skillId,
      name: args.name,
      description: args.description,
      category: args.category,
      systemPromptTemplate: args.systemPromptTemplate,
      inputSchema: args.inputSchema,
      outputSchema: args.outputSchema,
      channelConfig: args.channelConfig,
      examples: args.examples,
      isActive: true,
      version: 1,
      createdAt: now,
      updatedAt: now,
    });

    return id;
  },
});

/**
 * Update an existing skill (partial update)
 */
export const update = mutation({
  args: {
    id: v.id('voiceSkills'),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    category: v.optional(categoryValidator),
    systemPromptTemplate: v.optional(v.string()),
    inputSchema: v.optional(v.any()),
    outputSchema: v.optional(v.any()),
    channelConfig: channelConfigValidator,
    examples: v.optional(exampleValidator),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireBrandRoleForDoc(ctx, 'voiceSkills', args.id, 'editor');
    const skill = await ctx.db.get(args.id);
    if (!skill) {
      throw new Error('Skill not found');
    }

    const updates: Record<string, unknown> = {
      updatedAt: Date.now(),
      version: skill.version + 1,
    };

    if (args.name !== undefined) updates.name = args.name;
    if (args.description !== undefined) updates.description = args.description;
    if (args.category !== undefined) updates.category = args.category;
    if (args.systemPromptTemplate !== undefined) updates.systemPromptTemplate = args.systemPromptTemplate;
    if (args.inputSchema !== undefined) updates.inputSchema = args.inputSchema;
    if (args.outputSchema !== undefined) updates.outputSchema = args.outputSchema;
    if (args.channelConfig !== undefined) updates.channelConfig = args.channelConfig;
    if (args.examples !== undefined) updates.examples = args.examples;
    if (args.isActive !== undefined) updates.isActive = args.isActive;

    await ctx.db.patch(args.id, updates);

    return args.id;
  },
});

/**
 * Delete a skill
 */
export const remove = mutation({
  args: {
    id: v.id('voiceSkills'),
  },
  handler: async (ctx, args) => {
    await requireBrandRoleForDoc(ctx, 'voiceSkills', args.id, 'editor');
    const skill = await ctx.db.get(args.id);
    if (!skill) {
      throw new Error('Skill not found');
    }

    await ctx.db.delete(args.id);

    return args.id;
  },
});

/**
 * Seed default skills for a brand (skips existing)
 */
export const seedDefaults = mutation({
  args: {
    brandId: v.id('brands'),
  },
  handler: async (ctx, args) => {
    await requireBrandRole(ctx, args.brandId, 'editor');
    const now = Date.now();
    const seeded: string[] = [];

    for (const skill of DEFAULT_SKILLS) {
      const existing = await ctx.db
        .query('voiceSkills')
        .withIndex('by_brand_skill', (q) =>
          q.eq('brandId', args.brandId).eq('skillId', skill.skillId)
        )
        .first();

      if (existing) {
        continue;
      }

      await ctx.db.insert('voiceSkills', {
        brandId: args.brandId,
        skillId: skill.skillId,
        name: skill.name,
        description: skill.description,
        category: skill.category,
        systemPromptTemplate: skill.systemPromptTemplate,
        channelConfig: skill.channelConfig,
        examples: skill.examples,
        isActive: true,
        version: 1,
        createdAt: now,
        updatedAt: now,
      });

      seeded.push(skill.skillId);
    }

    return { seeded, skipped: DEFAULT_SKILLS.length - seeded.length };
  },
});

/**
 * Toggle skill active state
 */
export const toggleActive = mutation({
  args: {
    id: v.id('voiceSkills'),
  },
  handler: async (ctx, args) => {
    await requireBrandRoleForDoc(ctx, 'voiceSkills', args.id, 'editor');
    const skill = await ctx.db.get(args.id);
    if (!skill) {
      throw new Error('Skill not found');
    }

    await ctx.db.patch(args.id, {
      isActive: !skill.isActive,
      version: skill.version + 1,
      updatedAt: Date.now(),
    });

    return { id: args.id, isActive: !skill.isActive };
  },
});
