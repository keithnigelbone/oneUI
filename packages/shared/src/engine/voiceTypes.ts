/**
 * Voice Engine Types — Framework-Agnostic
 *
 * Type definitions for the voice & tone rules engine.
 * Used by: voice compiler, tone guard, eval scorer, Convex functions, UI.
 */

// ============================================
// Tone Profile
// ============================================

/**
 * Two-dial tone profile. Every brand voice is fundamentally two things:
 * how warm/approachable it is and how direct/concise it is. Previous
 * 5-slider model (warmth, formality, enthusiasm, empathy, directness)
 * caused interaction effects — formality and enthusiasm bled into warmth,
 * and 3 of the 5 sliders weren't independent axes.
 *
 * Migration: newWarmth = clamp(avg(old.warmth, 100 - old.formality,
 * old.enthusiasm, old.empathy), 0, 100). newDirectness = old.directness.
 */
export interface ToneProfile {
  /** 0 = crisp, professional, neutral → 100 = warm, friendly, approachable */
  warmth: number;
  /** 0 = exploratory, detailed, open-ended → 100 = concise, action-oriented, imperative */
  directness: number;

  // ── Legacy fields (deprecated, kept for migration) ──────────────────
  /** @deprecated Merged into `warmth`. Kept optional for backward compat with existing Convex data. */
  formality?: number;
  /** @deprecated Merged into `warmth`. */
  enthusiasm?: number;
  /** @deprecated Merged into `warmth`. */
  empathy?: number;
}

// ============================================
// Language Configuration
// ============================================

export interface LanguageConfig {
  /** Primary language code (e.g., "en-IN", "hi") */
  primary: string;
  /** Enable Hindi language support */
  hindiSupport: boolean;
  /** Enable Hinglish (Hindi-English mix) support */
  hinglishSupport: boolean;
  /** Additional regional language codes */
  regionalLanguages?: string[];
  /** British or American English */
  spellingConvention: 'british' | 'american';
  /** Indian (₹1,00,000) or international (₹100,000) number formatting */
  numberFormat: 'indian' | 'international';
}

// ============================================
// Communication Style
// ============================================

export interface CommunicationStyle {
  /** Words/phrases that must never appear in responses */
  forbiddenWords: string[];
  /** Preferred phrases to use when possible */
  preferredPhrases?: string[];
  /** Maximum response length in characters (per channel) */
  maxResponseLength?: number;
  /** Whether emojis are allowed */
  useEmojis: boolean;
  /** Specific emojis allowed (if useEmojis is true) */
  allowedEmojis?: string[];
  /** 0-100: How often to include emoji. 0 = never, 50 = occasionally, 100 = most responses. */
  emojiFrequency?: number;
  /** Maximum emojis per response. Default 1. */
  maxEmojisPerResponse?: number;
}

// ============================================
// Emotional Intelligence
// ============================================

/** Navarasa 9-state emotional framework from Indian aesthetic tradition */
export type NavarAsaState =
  | 'shringara'  // Delight, thanks, satisfaction
  | 'hasya'      // Playful, joking, casual
  | 'karuna'     // Sadness, disappointment, fatigue
  | 'raudra'     // Anger, frustration, escalation
  | 'vira'       // Ambition, business, productivity
  | 'bhayanaka'  // Fear, payment doubt, fraud concern
  | 'bibhatsa'   // Cancellation, opt-out, exit intent
  | 'adbhuta'    // Curiosity, exploration, browsing
  | 'shanta';    // Neutral, factual, transactional

export interface EmotionalIntelligenceConfig {
  /** Enable Navarasa 9-state emotional detection */
  navarasa: boolean;
  /** How to handle sensitive topics (bereavement, crisis, health) */
  sensitiveTopicHandling: 'gentle' | 'direct' | 'redirect';
}

// ============================================
// Channel Configuration
// ============================================

export type ChannelId = 'sms' | 'whatsapp' | 'app' | 'ivr' | 'email';

export interface ChannelConfig {
  maxLength: number;
  formatting: string;
}

export type ChannelDefaults = Partial<Record<ChannelId, ChannelConfig>>;

// ============================================
// Voice Context (surface mode)
// ============================================
//
// Contexts describe the SURFACE the words appear on, not the distribution
// channel. The same brand voice is expressed differently depending on whether
// it's a chat reply, marketing body copy, a button label, or an article.
//
// - conversational: chat, IVR, WhatsApp replies, in-app assistant, voice bot
//                   → turn-taking, openers/closers, empathy rituals, 1st-person
// - copy:           marketing body, brandbook paragraphs, product descriptions,
//                   landing pages, emails → no turn-taking, 2nd-person, scannable
// - microcopy:      buttons, labels, error states, headlines, tooltips,
//                   push notifications → fragments, imperatives, ≤8 words
// - editorial:      long-form articles, brand stories, case studies, guide
//                   pages → narrative flow, paragraphs, first-person plural "we"
//
// Orthogonal to `ChannelId`: a conversational voice may still be delivered
// via SMS, WhatsApp, IVR etc. Channel affects length/format; context affects
// persona framing, pronoun usage, and which rules apply.

export type VoiceContext = 'conversational' | 'copy' | 'microcopy' | 'editorial';

export const VOICE_CONTEXTS: readonly VoiceContext[] = [
  'conversational',
  'copy',
  'microcopy',
  'editorial',
] as const;

/**
 * Default context classification for the 22 Core Rules v5 sections.
 * Used by the compiler when a VoiceRule does not carry its own `contexts`
 * field — lets us ship context-aware compilation without forcing a manual
 * reclassification of every existing rule.
 *
 * `'all'` is a wildcard: the rule applies to every context.
 */
export const DEFAULT_SECTION_CONTEXTS: Record<string, readonly string[]> = {
  // Universal — the brand voice is the brand voice, everywhere
  'recommendations': ['all'],
  'ecosystem': ['all'],
  'safety': ['all'],
  'inclusivity': ['all'],
  'behaviour-limits': ['all'],
  'warmth': ['all'],
  'voice-tone': ['all'],
  'communication-style': ['all'],
  'sensitive': ['all'],
  'adaptation': ['all'],
  'hindi-regional': ['all'],

  // Conversation-specific — only apply to chat/voice/assistant surfaces
  'identity': ['conversational'],
  'conversation-modes': ['conversational'],
  'service-intents': ['conversational'],
  'conversation-flow': ['conversational'],
  'refusal': ['conversational'],
  'ambiguity': ['conversational'],
  'apology': ['conversational'],
  'proactive': ['conversational'],
  'context': ['conversational'],
  'handoff': ['conversational'],
  'emotional-intel': ['conversational'],
};

// ============================================
// Voice Configuration (complete brand profile)
// ============================================

export interface VoiceConfig {
  agentName: string;
  personality?: string;
  toneProfile: ToneProfile;
  language: LanguageConfig;
  communicationStyle: CommunicationStyle;
  emotionalIntelligence: EmotionalIntelligenceConfig;
  channelDefaults?: ChannelDefaults;
  /** 0-100: Response length preference. 0 = ultra-concise, 100 = thorough. Default 50. */
  verbosity?: number;
  isActive: boolean;
  version: number;
}

// ============================================
// Voice Rules
// ============================================

/** One of the 22 modular rule sections */
export interface VoiceRule {
  sectionId: string;
  title: string;
  content: string;
  priority: number;
  scope: 'base' | 'brand';
  isActive: boolean;
  version: number;
  /**
   * Contexts this rule applies to. If missing or empty, the compiler falls
   * back to DEFAULT_SECTION_CONTEXTS[sectionId]. Use `'all'` as a wildcard.
   *
   * Examples:
   *   ['all']                  → rule applies to every context
   *   ['conversational']       → rule only applies to chat/voice surfaces
   *   ['copy', 'editorial']    → rule applies to marketing copy and long-form
   */
  contexts?: string[];
}

/** Resolved rule with source indicator */
export interface ResolvedVoiceRule extends VoiceRule {
  source: 'base' | 'brand' | 'none';
}

// ============================================
// Voice Skills
// ============================================

export interface VoiceSkillExample {
  input: string;
  expectedOutput: string;
  channel?: string;
}

export interface VoiceSkill {
  skillId: string;
  name: string;
  description: string;
  category: 'service' | 'content' | 'internal';
  systemPromptTemplate: string;
  inputSchema?: Record<string, unknown>;
  outputSchema?: Record<string, unknown>;
  channelConfig?: ChannelDefaults;
  examples: VoiceSkillExample[];
  isActive: boolean;
  version: number;
}

// ============================================
// Tone Guard (post-generation validation)
// ============================================

export interface ToneGuardCheck {
  /** Check identifier */
  id: string;
  /** Human-readable check name */
  name: string;
  /** Whether the check passed */
  passed: boolean;
  /** Details about what was found/corrected */
  details?: string;
  /** Corrected text (if auto-fixable) */
  correction?: string;
}

export interface ToneGuardResult {
  /** Whether all checks passed */
  allPassed: boolean;
  /** Total score (0-100) */
  score: number;
  /** Individual check results */
  checks: ToneGuardCheck[];
  /** Auto-corrected response text (if corrections were applied) */
  correctedText?: string;
}

// ============================================
// Evaluation
// ============================================

export interface EvalRubric {
  emotionDetection?: number;
  forbiddenWords?: number;
  formatting?: number;
  warmth?: number;
  forwardMomentum?: number;
  apologyCorrectness?: number;
  responseLength?: number;
  benefitFraming?: number;
  ecosystemBalance?: number;
  inclusivity?: number;
  readability?: number;
}

export interface EvalScenario {
  scenarioId: string;
  category: string;
  title: string;
  description?: string;
  userMessage: string;
  expectedBehaviors: string[];
  forbiddenBehaviors: string[];
  rubric: EvalRubric;
  referenceAnswer?: string;
}

export interface EvalDimensionScore {
  dimension: string;
  score: number;
  weight: number;
  passed: boolean;
  feedback: string;
}

export interface EvalScenarioResult {
  scenarioId: string;
  score: number;
  passed: boolean;
  response: string;
  dimensionScores: EvalDimensionScore[];
  notes?: string;
}

// ============================================
// Compiled Prompt
// ============================================

export interface CompiledVoicePrompt {
  /** The assembled system prompt string */
  prompt: string;
  /** Size in characters */
  size: number;
  /** Which rule sections were included */
  includedSections: string[];
  /** Which channel this was compiled for */
  channel: string;
  /** Hash for cache invalidation */
  hash: string;
}

// ============================================
// Feedback
// ============================================

export type FeedbackSource = 'playground' | 'evaluation' | 'sdk' | 'tone-guard';
export type FeedbackRating = 'positive' | 'negative';
export type FeedbackStatus = 'open' | 'reviewed' | 'resolved' | 'dismissed';
export type FeedbackResolutionAction =
  | 'rule-updated'
  | 'scenario-added'
  | 'forbidden-word-added'
  | 'dismissed';

export interface VoiceFeedback {
  source: FeedbackSource;
  userMessage: string;
  aiResponse: string;
  channel?: string;
  annotation?: string;
  rating: FeedbackRating;
  relatedRuleSections?: string[];
  toneGuardCorrections?: ToneGuardResult;
  status: FeedbackStatus;
  resolution?: {
    action: FeedbackResolutionAction;
    details?: string;
    resolvedAt?: number;
  };
}
