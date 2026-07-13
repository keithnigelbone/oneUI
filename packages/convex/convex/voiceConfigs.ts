/**
 * voiceConfigs.ts
 *
 * Convex queries and mutations for Voice & Tone configuration.
 * Manages brand AI voice profiles: identity, tone sliders, language,
 * communication style, emotional intelligence, and channel defaults.
 */

import { query, mutation } from './_generated/server';
import { v } from 'convex/values';
import { requireBrandRole, requireBrandRoleForDoc, requirePlatformOwner, canReadBrand } from './lib/auth';

// ============================================
// Default voice configuration (Jio defaults from Core Rules v5)
// ============================================

const DEFAULT_VOICE_CONFIG = {
  agentName: 'AI Assistant',
  personality: 'A warm, helpful digital assistant that guides and resolves.',

  // Two-dial tone profile. Migration formula from old 5-slider:
  // newWarmth = clamp(avg(old.warmth, 100-old.formality, old.enthusiasm, old.empathy), 0, 100)
  // newDirectness = old.directness
  // For Jio: avg(80, 70, 50, 75) = 68.75 → 69, directness = 70
  toneProfile: {
    warmth: 69,
    directness: 70,
  },

  language: {
    primary: 'en-IN',
    hindiSupport: true,
    hinglishSupport: true,
    regionalLanguages: [] as string[] | undefined,
    spellingConvention: 'british' as 'british' | 'american',
    numberFormat: 'indian' as 'indian' | 'international',
  },

  communicationStyle: {
    forbiddenWords: [
      // Corporate/call-centre language
      'kindly', 'hereby', 'as per', 'do the needful', 'same has been',
      'please note that', 'we would like to inform you', 'activated',
      'processed', 'updated', 'subscription validity', 'authenticate',
      'initiate', 'utilise', 'assistance', 'proceed', 'revert',
      'successful transaction', 'failed transaction', 'facilitate',
      'enable', 'execute', 'perform',
      // Padding and corporate filler
      'at the earliest', 'the same', 'henceforth', 'aforementioned',
      'duly noted', 'rest assured', 'valued customer',
      'we appreciate your patience', 'inconvenience caused',
      // Scripted sympathy
      'i understand how frustrating', 'i can see why',
      'i completely understand', 'i can imagine how',
      // Task-declaration openers
      'here is what you can do', 'here\'s what you can do',
      // Call-centre closings
      'is there anything else i can help you with',
      // Backend claims
      'i can see your account', 'looking at your account',
      // Scripted formal Hindi
      'kripaya', 'samasya', 'sunishchit karein', 'asuvdha ke liye khed hai',
    ],
    preferredPhrases: [] as string[] | undefined,
    maxResponseLength: undefined as number | undefined,
    useEmojis: true,
    allowedEmojis: ['✅', '⚠️', '🙂', '🎉'] as string[] | undefined,
    emojiFrequency: 50 as number | undefined,
    maxEmojisPerResponse: 1 as number | undefined,
  },

  emotionalIntelligence: {
    navarasa: true,
    sensitiveTopicHandling: 'gentle' as 'gentle' | 'direct' | 'redirect',
  },

  channelDefaults: {
    sms: { maxLength: 160, formatting: 'none' },
    whatsapp: { maxLength: 280, formatting: 'minimal' },
    app: { maxLength: 500, formatting: 'structured' },
    ivr: { maxLength: 200, formatting: 'spoken' },
    email: { maxLength: 1000, formatting: 'light' },
  },
};

// ============================================
// Shared validators
// ============================================

const toneProfileValidator = v.object({
  warmth: v.number(),
  directness: v.number(),
  // Deprecated — kept optional for backward compat with old data
  formality: v.optional(v.number()),
  enthusiasm: v.optional(v.number()),
  empathy: v.optional(v.number()),
});

const languageValidator = v.object({
  primary: v.string(),
  hindiSupport: v.boolean(),
  hinglishSupport: v.boolean(),
  regionalLanguages: v.optional(v.array(v.string())),
  spellingConvention: v.union(v.literal('british'), v.literal('american')),
  numberFormat: v.union(v.literal('indian'), v.literal('international')),
});

const communicationStyleValidator = v.object({
  forbiddenWords: v.array(v.string()),
  preferredPhrases: v.optional(v.array(v.string())),
  maxResponseLength: v.optional(v.number()),
  useEmojis: v.boolean(),
  allowedEmojis: v.optional(v.array(v.string())),
  emojiFrequency: v.optional(v.number()),
  maxEmojisPerResponse: v.optional(v.number()),
});

const emotionalIntelligenceValidator = v.object({
  navarasa: v.boolean(),
  sensitiveTopicHandling: v.union(
    v.literal('gentle'),
    v.literal('direct'),
    v.literal('redirect')
  ),
});

const channelConfigValidator = v.optional(v.object({
  sms: v.optional(v.object({ maxLength: v.number(), formatting: v.string() })),
  whatsapp: v.optional(v.object({ maxLength: v.number(), formatting: v.string() })),
  app: v.optional(v.object({ maxLength: v.number(), formatting: v.string() })),
  ivr: v.optional(v.object({ maxLength: v.number(), formatting: v.string() })),
  email: v.optional(v.object({ maxLength: v.number(), formatting: v.string() })),
}));

// ============================================
// Queries
// ============================================

/**
 * Get voice configuration for a brand
 */
export const get = query({
  args: { brandId: v.id('brands') },
  handler: async (ctx, args) => {
    if (!(await canReadBrand(ctx, args.brandId))) return null;
    return await ctx.db
      .query('voiceConfigs')
      .withIndex('by_brand', (q) => q.eq('brandId', args.brandId))
      .first();
  },
});

/**
 * Get default voice configuration (for reference/preview)
 */
export const getDefaults = query({
  args: {},
  handler: async () => {
    return DEFAULT_VOICE_CONFIG;
  },
});

// ============================================
// Mutations
// ============================================

/**
 * Create voice configuration with default values
 */
export const createDefaults = mutation({
  args: {
    brandId: v.id('brands'),
    agentName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireBrandRole(ctx, args.brandId, 'editor');
    const existing = await ctx.db
      .query('voiceConfigs')
      .withIndex('by_brand', (q) => q.eq('brandId', args.brandId))
      .first();

    if (existing) {
      throw new Error('Voice configuration already exists for this brand');
    }

    const now = Date.now();

    const id = await ctx.db.insert('voiceConfigs', {
      brandId: args.brandId,
      agentName: args.agentName ?? DEFAULT_VOICE_CONFIG.agentName,
      personality: DEFAULT_VOICE_CONFIG.personality,
      toneProfile: DEFAULT_VOICE_CONFIG.toneProfile,
      language: DEFAULT_VOICE_CONFIG.language,
      communicationStyle: DEFAULT_VOICE_CONFIG.communicationStyle,
      emotionalIntelligence: DEFAULT_VOICE_CONFIG.emotionalIntelligence,
      channelDefaults: DEFAULT_VOICE_CONFIG.channelDefaults,
      isActive: true,
      version: 1,
      createdAt: now,
      updatedAt: now,
    });

    return id;
  },
});

/**
 * Create voice configuration with custom values
 */
export const create = mutation({
  args: {
    brandId: v.id('brands'),
    agentName: v.string(),
    personality: v.optional(v.string()),
    toneProfile: toneProfileValidator,
    language: languageValidator,
    communicationStyle: communicationStyleValidator,
    emotionalIntelligence: emotionalIntelligenceValidator,
    channelDefaults: channelConfigValidator,
  },
  handler: async (ctx, args) => {
    await requireBrandRole(ctx, args.brandId, 'editor');
    const existing = await ctx.db
      .query('voiceConfigs')
      .withIndex('by_brand', (q) => q.eq('brandId', args.brandId))
      .first();

    if (existing) {
      throw new Error('Voice configuration already exists for this brand');
    }

    const now = Date.now();

    const id = await ctx.db.insert('voiceConfigs', {
      brandId: args.brandId,
      agentName: args.agentName,
      personality: args.personality,
      toneProfile: args.toneProfile,
      language: args.language,
      communicationStyle: args.communicationStyle,
      emotionalIntelligence: args.emotionalIntelligence,
      channelDefaults: args.channelDefaults,
      isActive: true,
      version: 1,
      createdAt: now,
      updatedAt: now,
    });

    return id;
  },
});

/**
 * Update voice configuration (partial update)
 */
export const update = mutation({
  args: {
    id: v.id('voiceConfigs'),
    agentName: v.optional(v.string()),
    personality: v.optional(v.string()),
    toneProfile: v.optional(toneProfileValidator),
    language: v.optional(languageValidator),
    communicationStyle: v.optional(communicationStyleValidator),
    emotionalIntelligence: v.optional(emotionalIntelligenceValidator),
    channelDefaults: channelConfigValidator,
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { doc: config } = await requireBrandRoleForDoc(ctx, 'voiceConfigs', args.id, 'editor');

    const updates: Record<string, unknown> = {
      updatedAt: Date.now(),
      version: config.version + 1,
    };

    if (args.agentName !== undefined) updates.agentName = args.agentName;
    if (args.personality !== undefined) updates.personality = args.personality;
    if (args.toneProfile !== undefined) updates.toneProfile = args.toneProfile;
    if (args.language !== undefined) updates.language = args.language;
    if (args.communicationStyle !== undefined) updates.communicationStyle = args.communicationStyle;
    if (args.emotionalIntelligence !== undefined) updates.emotionalIntelligence = args.emotionalIntelligence;
    if (args.channelDefaults !== undefined) updates.channelDefaults = args.channelDefaults;
    if (args.isActive !== undefined) updates.isActive = args.isActive;

    await ctx.db.patch(args.id, updates);

    return args.id;
  },
});

/**
 * Update tone profile only
 */
export const updateToneProfile = mutation({
  args: {
    brandId: v.id('brands'),
    toneProfile: toneProfileValidator,
  },
  handler: async (ctx, args) => {
    await requireBrandRole(ctx, args.brandId, 'editor');
    const config = await ctx.db
      .query('voiceConfigs')
      .withIndex('by_brand', (q) => q.eq('brandId', args.brandId))
      .first();

    if (!config) {
      throw new Error('Voice configuration not found for this brand');
    }

    await ctx.db.patch(config._id, {
      toneProfile: args.toneProfile,
      version: config.version + 1,
      updatedAt: Date.now(),
    });

    return config._id;
  },
});

/**
 * Update forbidden words list
 */
export const updateForbiddenWords = mutation({
  args: {
    brandId: v.id('brands'),
    forbiddenWords: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    await requireBrandRole(ctx, args.brandId, 'editor');
    const config = await ctx.db
      .query('voiceConfigs')
      .withIndex('by_brand', (q) => q.eq('brandId', args.brandId))
      .first();

    if (!config) {
      throw new Error('Voice configuration not found for this brand');
    }

    await ctx.db.patch(config._id, {
      communicationStyle: {
        ...config.communicationStyle,
        forbiddenWords: args.forbiddenWords,
      },
      version: config.version + 1,
      updatedAt: Date.now(),
    });

    return config._id;
  },
});

/**
 * Update verbosity setting
 */
export const updateVerbosity = mutation({
  args: {
    brandId: v.id('brands'),
    verbosity: v.number(),
  },
  handler: async (ctx, args) => {
    await requireBrandRole(ctx, args.brandId, 'editor');
    const config = await ctx.db
      .query('voiceConfigs')
      .withIndex('by_brand', (q) => q.eq('brandId', args.brandId))
      .first();

    if (!config) {
      throw new Error('Voice configuration not found for this brand');
    }

    await ctx.db.patch(config._id, {
      verbosity: args.verbosity,
      version: config.version + 1,
      updatedAt: Date.now(),
    });

    return config._id;
  },
});

/**
 * Update emoji settings (frequency and max per response)
 */
export const updateEmojiSettings = mutation({
  args: {
    brandId: v.id('brands'),
    emojiFrequency: v.optional(v.number()),
    maxEmojisPerResponse: v.optional(v.number()),
    useEmojis: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireBrandRole(ctx, args.brandId, 'editor');
    const config = await ctx.db
      .query('voiceConfigs')
      .withIndex('by_brand', (q) => q.eq('brandId', args.brandId))
      .first();

    if (!config) {
      throw new Error('Voice configuration not found for this brand');
    }

    const updates: Record<string, unknown> = {};
    if (args.emojiFrequency !== undefined) updates.emojiFrequency = args.emojiFrequency;
    if (args.maxEmojisPerResponse !== undefined) updates.maxEmojisPerResponse = args.maxEmojisPerResponse;
    if (args.useEmojis !== undefined) updates.useEmojis = args.useEmojis;

    await ctx.db.patch(config._id, {
      communicationStyle: {
        ...config.communicationStyle,
        ...updates,
      },
      version: config.version + 1,
      updatedAt: Date.now(),
    });

    return config._id;
  },
});

/**
 * Get or create voice configuration for a brand
 */
export const getOrCreate = mutation({
  args: {
    brandId: v.id('brands'),
  },
  handler: async (ctx, args) => {
    await requireBrandRole(ctx, args.brandId, 'editor');
    const existing = await ctx.db
      .query('voiceConfigs')
      .withIndex('by_brand', (q) => q.eq('brandId', args.brandId))
      .first();

    if (existing) {
      return existing;
    }

    const now = Date.now();

    const id = await ctx.db.insert('voiceConfigs', {
      brandId: args.brandId,
      agentName: DEFAULT_VOICE_CONFIG.agentName,
      personality: DEFAULT_VOICE_CONFIG.personality,
      toneProfile: DEFAULT_VOICE_CONFIG.toneProfile,
      language: DEFAULT_VOICE_CONFIG.language,
      communicationStyle: DEFAULT_VOICE_CONFIG.communicationStyle,
      emotionalIntelligence: DEFAULT_VOICE_CONFIG.emotionalIntelligence,
      channelDefaults: DEFAULT_VOICE_CONFIG.channelDefaults,
      isActive: true,
      version: 1,
      createdAt: now,
      updatedAt: now,
    });

    return await ctx.db.get(id);
  },
});

/**
 * Delete voice configuration for a brand
 */
export const remove = mutation({
  args: {
    brandId: v.id('brands'),
  },
  handler: async (ctx, args) => {
    await requireBrandRole(ctx, args.brandId, 'editor');
    const config = await ctx.db
      .query('voiceConfigs')
      .withIndex('by_brand', (q) => q.eq('brandId', args.brandId))
      .first();

    if (!config) {
      throw new Error('Voice configuration not found for this brand');
    }

    await ctx.db.delete(config._id);

    return config._id;
  },
});

/**
 * Migrate all voice configs from 5-slider to 2-dial tone profile.
 *
 * Formula: newWarmth = clamp(avg(warmth, 100-formality, enthusiasm, empathy), 0, 100)
 *          newDirectness = directness (unchanged)
 *
 * Old fields (formality, enthusiasm, empathy) are zeroed out after migration
 * so they don't confuse the UI. They remain in the schema as optional for
 * backward compat but no longer affect compiled output.
 *
 * Safe to run multiple times — skips configs that already have formality=undefined.
 */
export const migrateToneProfile = mutation({
  args: {},
  handler: async (ctx) => {
    await requirePlatformOwner(ctx);
    const allConfigs = await ctx.db.query('voiceConfigs').collect();
    const now = Date.now();

    // Build patches for configs that still have the old 5-field shape.
    const patches = allConfigs
      .filter((c) => c.toneProfile.formality !== undefined && c.toneProfile.formality !== null)
      .map((config) => {
        const tp = config.toneProfile;
        const newWarmth = Math.round(
          Math.min(100, Math.max(0,
            ((tp.warmth ?? 50) + (100 - (tp.formality ?? 50)) + (tp.enthusiasm ?? 50) + (tp.empathy ?? 50)) / 4,
          )),
        );
        return ctx.db.patch(config._id, {
          toneProfile: {
            warmth: newWarmth,
            directness: tp.directness ?? 50,
            formality: undefined,
            enthusiasm: undefined,
            empathy: undefined,
          },
          version: config.version + 1,
          updatedAt: now,
        });
      });

    await Promise.all(patches);

    return { migrated: patches.length, total: allConfigs.length };
  },
});
