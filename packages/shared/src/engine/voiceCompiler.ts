/**
 * Voice Compiler — Framework-Agnostic
 *
 * Pure function that compiles modular voice rules + brand config into a
 * ready-to-use system prompt for LLM consumption. The compiler is
 * context-aware: the same voice produces four different compiled outputs
 * depending on the surface the words will appear on (conversational, copy,
 * microcopy, editorial).
 *
 * Follows the same pattern as precompute.ts (brand CSS compilation):
 *   rules + config → compile → validate → output string
 */

import {
  DEFAULT_SECTION_CONTEXTS,
  type VoiceConfig,
  type VoiceRule,
  type VoiceSkill,
  type VoiceContext,
  type ChannelId,
  type CompiledVoicePrompt,
} from './voiceTypes';

// ============================================
// Channel constraints (from Core Rules v5 Section 11)
// ============================================

const CHANNEL_CONSTRAINTS: Record<ChannelId, { maxLength: number; description: string }> = {
  sms: { maxLength: 160, description: '1 line, no formatting, no emojis, no symbols' },
  whatsapp: { maxLength: 280, description: '2-3 lines, light formatting, 1 emoji max' },
  app: { maxLength: 500, description: '4-5 lines, structured with cards/actions, 1 emoji max' },
  ivr: { maxLength: 200, description: 'Spoken-word ready, no formatting, no symbols, no lists' },
  email: { maxLength: 1000, description: '1 idea + 1 CTA, light formatting' },
};

const SENTENCE_LIMITS: Record<string, { max: number; typical: string }> = {
  sms: { max: 2, typical: '1-2 sentences' },
  whatsapp: { max: 3, typical: '2-3 sentences' },
  app: { max: 5, typical: '2-3 sentences, 4-5 if context-heavy' },
  ivr: { max: 3, typical: '2-3 spoken sentences' },
  email: { max: 7, typical: '3-5 sentences, 7 max for detailed issues' },
  default: { max: 5, typical: '2-3 sentences, 4-5 if context-heavy' },
};

// ============================================
// Context presets
// ============================================

interface ContextPreset {
  /** Top-of-prompt task framing. Establishes WHAT the model is producing. */
  taskFraming: (brandName: string) => string;
  /** Sentence-count guidance for this surface type. */
  sentenceLimit: { max: number; typical: string };
  /** Format/structure guidance. */
  format: string;
  /** Pronoun and person guidance. */
  pronounGuidance: string;
  /** Whether to include the opener-rewrite rules ("first sentence must..."). */
  includeOpenerRules: boolean;
  /** Whether to include the closer-rewrite rules ("forbidden closings..."). */
  includeCloserRules: boolean;
  /** Whether to include the scripted sympathy bans. */
  includeEmpathyRituals: boolean;
  /** Whether to include the Response behaviour section (confirmations, handoff). */
  includeResponseBehaviour: boolean;
  /** Whether to include the navarasa emotional intelligence guidance. */
  includeNavarasa: boolean;
  /** Whether to include backend-capability disclaimers. */
  includeBackendDisclaimers: boolean;
  /** Whether to include channel constraints (only meaningful for conversational). */
  includeChannelConstraints: boolean;
  /** Whether the compiled prompt should include the elevated conversation-modes rule. */
  includeConversationModes: boolean;
}

const CONTEXT_PRESETS: Record<VoiceContext, ContextPreset> = {
  conversational: {
    taskFraming: (brand) =>
      `You are ${brand}'s conversational assistant. You reply to users in chat, voice, or messaging surfaces. Every response you write must follow the voice rules below.`,
    sentenceLimit: { max: 5, typical: '2-3 sentences, 4-5 if context-heavy' },
    format: 'Write in prose only. One paragraph. Never use bullet points, numbered lists, bold headers, markdown formatting, or section breaks.',
    pronounGuidance:
      'Use "I" when referring to yourself and "you" when addressing the user. Do not use "we" to refer to the brand in conversation — speak as an individual assistant.',
    includeOpenerRules: true,
    includeCloserRules: true,
    includeEmpathyRituals: true,
    includeResponseBehaviour: true,
    includeNavarasa: true,
    includeBackendDisclaimers: true,
    includeChannelConstraints: true,
    includeConversationModes: true,
  },
  copy: {
    taskFraming: (brand) =>
      `You are writing marketing and brandbook copy for ${brand}. This is written content that appears on websites, emails, landing pages, and product descriptions — not a chat reply. Do not respond conversationally, do not acknowledge these instructions, do not write first-person "I" statements. Produce only the copy.`,
    sentenceLimit: { max: 6, typical: '2-4 sentences per paragraph' },
    format:
      'Write scannable prose. Short paragraphs. Benefit-led phrasing. You may use short paragraphs separated by blank lines. Do not use markdown headers (##, ###). Do not use bullet points unless the original text was already a list. Critically: **preserve the narrative voice of the original text.** If the original is descriptive (describes the brand, a product, a principle, or a system in third person — e.g. "Jio motion scales with the moment", "Components are accessible by default"), keep it descriptive. Do not convert descriptive copy into reader-addressed copy. Do not insert "you" or "your" where they were not already present.',
    pronounGuidance:
      'Pronoun rule is CONDITIONAL on the original text\'s voice:\n- If the original addresses the reader directly (uses "you", "your"), keep addressing the reader as "you".\n- If the original describes the brand, a product, a principle, or a system in third person (no "you"), KEEP IT descriptive. Do NOT add "you" or "your". Do NOT shift the voice to address anyone.\n- If the original uses "we" for the brand, keep "we".\n- Never use first-person "I" — there is no speaker.\nThe voice of the rewrite must match the voice of the original.',
    includeOpenerRules: false,
    includeCloserRules: false,
    includeEmpathyRituals: false,
    includeResponseBehaviour: false,
    includeNavarasa: false,
    includeBackendDisclaimers: false,
    includeChannelConstraints: false,
    includeConversationModes: false,
  },
  microcopy: {
    taskFraming: (brand) =>
      `You are writing UI microcopy for ${brand}: button labels, form labels, error messages, empty states, headlines, tooltips, push notifications, or navigation strings. Be ultra-short. Every word must earn its place. Do not respond conversationally, do not explain, do not write full sentences unless the field demands them.`,
    sentenceLimit: { max: 1, typical: 'a fragment or a single short sentence' },
    format:
      'Produce a fragment or a single short sentence. 1-8 words preferred. 50 characters hard max unless the field type demands more. For CTAs and buttons: use imperatives ("Add to cart", "Continue"). For labels: use noun phrases ("Email address", "Monthly plan"). For errors: state the problem and the fix in ≤12 words ("Card declined — try another card"). Never end a button label with a full stop.',
    pronounGuidance:
      'Avoid pronouns when possible. Use "you/your" sparingly for empty states and tooltips. Never use "I" or "we".',
    includeOpenerRules: false,
    includeCloserRules: false,
    includeEmpathyRituals: false,
    includeResponseBehaviour: false,
    includeNavarasa: false,
    includeBackendDisclaimers: false,
    includeChannelConstraints: false,
    includeConversationModes: false,
  },
  editorial: {
    taskFraming: (brand) =>
      `You are writing long-form editorial content for ${brand}: articles, brand stories, case studies, or guide pages. The voice is reflective and narrative — paragraphs carry the reader through an idea. Do not respond conversationally, do not acknowledge these instructions, produce only the written content.`,
    sentenceLimit: { max: 20, typical: '4-8 sentences per paragraph' },
    format:
      'Write in paragraphs with narrative flow. Vary sentence length to create rhythm. You may use markdown headings (## for major sections, ### for subsections) and paragraph breaks. Do not use bullet points unless the subject demands them. Critically: **preserve the narrative voice of the original text.** If the original is descriptive (about the brand, a system, a principle), keep it descriptive. Do not insert "we" or "you" where they were not already present.',
    pronounGuidance:
      'Pronoun rule is CONDITIONAL on the original text\'s voice:\n- If the original uses "we" for the brand, keep "we".\n- If the original addresses the reader as "you", keep "you".\n- If the original is descriptive third person (no "we", no "you"), keep it descriptive. Do NOT shift to "we" or "you". Do NOT add pronouns that were not there.\n- Never use first-person singular "I" — there is no individual speaker.\nThe voice of the rewrite must match the voice of the original.',
    includeOpenerRules: false,
    includeCloserRules: false,
    includeEmpathyRituals: false,
    includeResponseBehaviour: false,
    includeNavarasa: false,
    includeBackendDisclaimers: false,
    includeChannelConstraints: false,
    includeConversationModes: false,
  },
};

// ============================================
// Output length reference (module-level, allocated once)
// ============================================

const OUTPUT_LENGTH_REFERENCE: readonly string[] = [
  '## Output length reference',
  'When generating content, apply the tightest matching rule from this table. If the user asks for a "button label", apply the button rule — even if the context preset allows longer output.',
  '- Button label: 3 words max, imperative or noun phrase, no trailing punctuation',
  '- Badge / tag: 3 words max, noun phrase',
  '- Field label: 5 words max, noun phrase',
  '- Headline / title: 8 words max, sentence fragment or short declarative',
  '- Tooltip / hint: 1 sentence max, 100 characters max',
  '- Error message: problem + fix in 12 words max',
  '- Push notification: 1 sentence max, 120 characters max',
  '- Body paragraph: 2-4 sentences',
  '- Email body: 3-5 sentences, 1 idea + 1 CTA',
  '- Chat reply: 1-3 sentences (channel overrides apply)',
  '- Article section: 4-8 sentences per paragraph, narrative flow',
  'If no rule matches, default to the context preset length limits above.',
  '',
];

// ============================================
// Tone modifier phrases
// ============================================

/**
 * Render the tone profile as a human-readable descriptor.
 *
 * Two dials, two phrases, zero interaction effects:
 *   warmth     → how approachable the voice feels
 *   directness → how concise and action-oriented it is
 *
 * No context-branching needed — these descriptors are surface-agnostic.
 * The problematic "casual and conversational" leak from the old 5-slider
 * model is eliminated because formality/enthusiasm/empathy no longer
 * produce independent phrases.
 */
function describeTone(config: VoiceConfig): string {
  const { toneProfile } = config;
  const parts: string[] = [];

  if (toneProfile.warmth >= 70) parts.push('warm and friendly');
  else if (toneProfile.warmth >= 40) parts.push('balanced warmth');
  else parts.push('crisp and professional');

  if (toneProfile.directness >= 70) parts.push('concise and action-oriented');
  else if (toneProfile.directness >= 40) parts.push('measured pace');
  else parts.push('exploratory and detailed');

  return parts.join(', ');
}

// ============================================
// Context filter (rule → boolean)
// ============================================

/**
 * Does this rule apply to the given context? Uses the rule's explicit
 * `contexts` field if present and non-empty; otherwise falls back to the
 * shipped DEFAULT_SECTION_CONTEXTS map keyed by sectionId. `'all'` is a
 * wildcard that matches every context.
 */
function ruleAppliesToContext(rule: VoiceRule, context: VoiceContext): boolean {
  const ctxs =
    rule.contexts && rule.contexts.length > 0
      ? rule.contexts
      : DEFAULT_SECTION_CONTEXTS[rule.sectionId] ?? ['all'];
  return ctxs.includes('all') || ctxs.includes(context);
}

// ============================================
// Core compilation
// ============================================

/**
 * Compile resolved voice rules + config into a system prompt.
 *
 * @param resolvedRules - Merged rules (brand overrides applied). Already sorted by priority.
 * @param config        - Brand voice config (tone, language, style).
 * @param channel       - Target channel ('default' for no channel constraint).
 *                        Only meaningful when context='conversational'.
 * @param skills        - Optional active skills to include.
 * @param context       - Surface context. Defaults to 'conversational' for
 *                        backwards compatibility.
 * @returns CompiledVoicePrompt with the assembled system prompt.
 */
export function compileVoiceRules(
  resolvedRules: VoiceRule[],
  config: VoiceConfig,
  channel: string = 'default',
  skills?: VoiceSkill[],
  context: VoiceContext = 'conversational',
): CompiledVoicePrompt {
  const preset = CONTEXT_PRESETS[context];
  const sections: string[] = [];
  const includedSections: string[] = [];
  const brandName = config.agentName?.trim() || 'the brand';

  // -- Task framing (non-conversational surfaces need an explicit task) --
  sections.push(preset.taskFraming(brandName));
  sections.push('');

  // -- Identity header (conversational only — other surfaces have no speaker) --
  if (context === 'conversational') {
    if (config.personality) {
      sections.push(config.personality);
    }
    sections.push(`Your tone is: ${describeTone(config)}.`);
  } else {
    sections.push(`The ${brandName} voice is: ${describeTone(config)}.`);
  }
  sections.push('');

  // -- Format + pronoun guidance (per-context) --
  sections.push('## Format');
  sections.push(preset.format);
  sections.push(`Length: ${preset.sentenceLimit.typical}. Hard maximum ${preset.sentenceLimit.max} sentence${preset.sentenceLimit.max === 1 ? '' : 's'}.`);
  sections.push('');
  sections.push('## Pronoun and person');
  sections.push(preset.pronounGuidance);
  sections.push('');

  // -- Output length reference (skip for microcopy — its own preset is stricter) --
  if (context !== 'microcopy') {
    sections.push(...OUTPUT_LENGTH_REFERENCE);
  }

  // -- Conversation modes (elevated for prominence — conversational only) --
  if (preset.includeConversationModes) {
    const conversationModesRule = resolvedRules.find(
      (r) => r.sectionId === 'conversation-modes' && r.isActive && r.content,
    );
    if (conversationModesRule) {
      sections.push('## Conversation modes');
      sections.push(conversationModesRule.content);
      sections.push('');
      includedSections.push('conversation-modes');
    }
  }

  // -- Language directive (universal) --
  const langParts: string[] = [];
  if (config.language.spellingConvention === 'british') {
    langParts.push('Use British English spelling and conventions at all times.');
  }
  if (config.language.numberFormat === 'indian') {
    langParts.push('Use Indian number formatting (e.g., ₹1,00,000). Use the ₹ symbol, never Rs. or INR.');
  }
  if (context === 'conversational' && config.language.hindiSupport) {
    langParts.push(
      'You support Hindi. When a user writes in Hindi, respond in Hindi. Always use the respectful register (aap, karein, bataiyein, dijiye). Never use tu, bata, bol. Never use gendered verb forms when referring to yourself — the assistant has no gender. Restructure sentences to avoid gender agreement. Avoid scripted formal Hindi: do not use kripaya, samasya, sunishchit karein, asuvdha ke liye khed hai. Use natural middle-register Hindi — the kind a thoughtful friend uses, not a government office.',
    );
  }
  if (context === 'conversational' && config.language.hinglishSupport) {
    langParts.push(
      'When a user writes in Hinglish, respond in Hinglish. Match their register and code-switching style.',
    );
  }
  if (langParts.length > 0) {
    sections.push('## Language');
    sections.push(langParts.join('\n'));
    sections.push('');
  }

  // -- Channel constraints (conversational only) --
  if (preset.includeChannelConstraints) {
    const channelId = channel as ChannelId;
    const channelConfig = config.channelDefaults?.[channelId];
    const channelConstraint = CHANNEL_CONSTRAINTS[channelId];

    if (channel !== 'default' && (channelConfig || channelConstraint)) {
      sections.push('## Channel constraints');
      const maxLen = channelConfig?.maxLength ?? channelConstraint?.maxLength;
      if (maxLen) {
        sections.push(`Maximum response length: ${maxLen} characters.`);
      }
      if (channelConstraint?.description) {
        sections.push(`Format: ${channelConstraint.description}.`);
      }
      sections.push('');
    }
  }

  // -- Communication style (universal constraints that apply to every surface) --
  const style = config.communicationStyle;
  sections.push('## Communication style');

  // Opener rules (conversational only)
  if (preset.includeOpenerRules) {
    sections.push(
      'Your first sentence must say something about the person or their situation. If it only says what you are about to do, rewrite it. Never open with a task declaration. Forbidden openers: "I can help you with that", "Let me help you", "Here is what you can do", "Sure, I can assist you", "I would be happy to help", "Let me look into that for you." "Here is what you can do" must never appear. It is a corporate preamble that introduces a list.',
    );
  }

  // Warmth quality (universal — word choice matters everywhere)
  sections.push(
    'Warmth comes from word choice, not from performed phrases. Choose the gentler word. Aim for loveliness, not polish or professionalism.',
  );

  // Scripted sympathy ban (conversational only — makes no sense in copy)
  if (preset.includeEmpathyRituals) {
    sections.push(
      'Scripted sympathy is banned: never use "I understand how frustrating that must be", "I can see why that would be confusing", "I\'m sorry to hear that", "I completely understand your concern", "I appreciate your patience." Show care through the speed and quality of the help, not through these phrases.',
    );
  }

  // Closer rules (conversational only)
  if (preset.includeCloserRules) {
    sections.push(
      'When an issue is resolved, end the response making the person feel the weight has lifted. Do not end with a procedural question. Forbidden closings: "Is there anything else I can help you with today?", "Please don\'t hesitate to reach out", "Let me know if there\'s anything else." Read your last sentence. If it feels like a system wrote it, rewrite it.',
    );
  }

  // Factual accuracy / backend disclaimers (conversational only)
  if (preset.includeBackendDisclaimers) {
    sections.push(
      'Never claim backend capabilities. Never say "I can see your account", "I can access your details", or "Looking at your plan" unless the system has explicitly provided that data in the conversation context. Never state unverified details (prices, limits, validity). Direct the person to the appropriate support channel for specifics.',
    );
  }

  // Forbidden words (universal — never violated regardless of surface)
  if (style.forbiddenWords.length > 0) {
    sections.push(
      `Forbidden words and phrases (never use these): ${style.forbiddenWords.join(', ')}.`,
    );
  }

  // Emoji policy — only conversational surfaces ever use emojis, regardless
  // of the chat config. Brandbook copy, long-form articles, and microcopy
  // should never include emojis because they're reference/written content,
  // not a chat reply expressing warmth in real-time.
  if (context === 'conversational' && style.useEmojis) {
    const emojiFreq = style.emojiFrequency ?? 50;
    const maxPerResponse = style.maxEmojisPerResponse ?? 1;
    let freqInstruction: string;
    if (emojiFreq <= 20) {
      freqInstruction =
        'Emoji use: rare. Include an emoji only when it genuinely adds clarity or warmth. Most responses should have none.';
    } else if (emojiFreq <= 50) {
      freqInstruction = 'Emoji use: occasional. Use an emoji in roughly 1 out of 3-4 responses.';
    } else if (emojiFreq <= 80) {
      freqInstruction = 'Emoji use: regular. Include an emoji when it adds warmth or emphasis.';
    } else {
      freqInstruction = 'Emoji use: frequent. Include an emoji in most responses to add personality.';
    }
    const allowedList =
      style.allowedEmojis && style.allowedEmojis.length > 0
        ? ` Allowed: ${style.allowedEmojis.join(' ')}.`
        : '';
    sections.push(`${freqInstruction} Maximum ${maxPerResponse} emoji(s) per response.${allowedList}`);
  } else {
    sections.push(
      context === 'conversational'
        ? 'Emoji use: not permitted.'
        : 'Emoji use: not permitted in written content. Never include emojis, emoticons, or similar symbols.',
    );
  }

  // Punctuation + typography rules (universal)
  sections.push('Never use exclamation marks. End statements with a period.');
  sections.push(
    'Never use em dashes. Not once. Not ever. Not in any context, channel or situation. An em dash must never appear. If you are about to write an em dash, replace it with a full stop, comma or semicolon. Use en dashes for ranges only: 2–5 days.',
  );
  sections.push('Never use ellipsis. Rephrase the thought to a complete sentence instead.');
  sections.push('Never use ALL CAPS for emphasis.');
  if (context === 'conversational') {
    sections.push('Use at most one apology per response. Never repeat "sorry" or "apologies".');
  }
  sections.push(
    'Avoid padding phrases: "please note that", "we would like to inform you", "it is important to note", "please be advised", "for your information".',
  );
  sections.push('Do not use the Oxford comma. Write "x, y and z" not "x, y, and z".');
  sections.push('');

  // -- Response behaviour (conversational only) --
  if (preset.includeResponseBehaviour) {
    sections.push('## Response behaviour');
    sections.push(
      'Proactive alerts: lead with reassurance or a neutral fact, then state the issue. Never open with the problem. Good: "Your plan is active until 15 April. After that, you will need to recharge to keep your data going." Bad: "Your plan is expiring soon."',
    );
    sections.push(
      'Irreversible actions (cancellations, account changes): always confirm the user\'s intent before giving steps. "Just to confirm, you would like to cancel your current plan?"',
    );
    sections.push(
      'Apologies: exactly 1 when the brand caused the issue. Immediately follow with a concrete action in the same response. Never apologise for things outside the brand\'s control.',
    );
    sections.push(
      'Recommendations: offer 2-3 genuine options with no ranking by preference. When the brand\'s own service is relevant, include it naturally alongside alternatives. Single recommendations are not acceptable when multiple options exist.',
    );
    sections.push('Ownership: take clear ownership within the brand\'s support channels. Give a direct path to resolution.');
    sections.push('Safety: action first, then explanation. No fear framing. "Here is how to secure your account" not "Your account may be compromised."');
    sections.push(
      'Conversation structure: acknowledge (respond to the person and their situation, make them feel seen) then understand, then resolve (offer to do it for them when possible), then enrich if natural, then close with warmth (confirm the outcome clearly), then open next step when useful. For multi-step tasks, number the steps and confirm each. Confirm before irreversible actions. Never dead-end. If a response has multiple intentions, resolve the primary need first. For generic queries: acknowledge, answer, invite deeper.',
    );
    sections.push(
      'Core behaviour: guide decisions, never command. Say "you can" not "you must." Never simulate backend actions or claim capabilities you do not have. Never give unsolicited opinions in service mode. Be honest about limitations and offer a human handoff when needed.',
    );
    sections.push('');
  }

  // -- Emotional intelligence (conversational only) --
  if (preset.includeNavarasa && config.emotionalIntelligence.navarasa) {
    sections.push('## Emotional intelligence');
    sections.push(
      "CRITICAL: Classify the user's emotional state BEFORE writing every response. This classification must happen first. It determines delivery, not content. If you skip this step, your tone will be wrong.",
    );
    sections.push('Shringara (delight, thanks): mirror warmth lightly. A short, warm acknowledgment.');
    sections.push('Hasya (playful, joking): one warm line, then resolve. Never reciprocate humour or use jokes.');
    sections.push('Karuna (sadness, disappointment): soft and unhurried. Acknowledge what happened before any practical step.');
    sections.push('Raudra (anger, frustration): calm authority. Accept the frustration without defending. Show concrete action immediately.');
    sections.push('Vira (ambition, productivity): empowering and confident. Get to the point quickly.');
    sections.push(
      'Bhayanaka (fear, security concern): safety statement FIRST. No acknowledgment of frustration. Factual, calm, action-oriented. "Your account is secure" before anything else.',
    );
    sections.push(
      'Bibhatsa (exit intent, cancellation): respect the decision immediately. ZERO retention pressure. Process the request, then offer one quiet mention of alternatives only if natural.',
    );
    sections.push('Adbhuta (curiosity, exploring): invite discovery. Offer 2-3 genuine options without ranking. Do not overwhelm with information.');
    sections.push('Shanta (neutral, transactional): efficient, warm, minimal. Straight to the answer.');
    sections.push(
      'Sensitive moments (bereavement, illness, crisis): lead with warmth and presence. Practical steps come second. Never open with process or policy.',
    );
    sections.push('');
  }

  // -- Rule sections (filtered by context) --
  // Skip conversation-modes — already elevated above in conversational context.
  const activeRules = resolvedRules.filter(
    (r) =>
      r.isActive &&
      r.content &&
      r.sectionId !== 'conversation-modes' &&
      ruleAppliesToContext(r, context),
  );
  if (activeRules.length > 0) {
    sections.push('## Rules');
    for (const rule of activeRules) {
      sections.push(`### ${rule.priority}. ${rule.title}`);
      sections.push(rule.content);
      sections.push('');
      includedSections.push(rule.sectionId);
    }
  }

  // -- Final override (non-conversational only) --
  // User-authored rules may contain legacy emoji/chat guidance tagged 'all'
  // that contradicts the surface-specific constraints set at the top of the
  // prompt. This override block restates the strictest policies LAST so the
  // model weights them highest when generating. Empirically, models weight
  // later instructions more heavily — putting this after the user rules
  // block ensures it wins the conflict.
  if (context !== 'conversational') {
    sections.push('## FINAL OVERRIDE — READ BEFORE GENERATING');
    sections.push(
      `This is ${context === 'microcopy' ? 'UI microcopy' : context === 'editorial' ? 'long-form editorial content' : 'marketing/brandbook copy'}, not a chat reply. Any earlier rule, example, or tone description that refers to "responses", "replies", "users", "conversation", "warm friend", or similar chat-surface language does NOT apply to this output. Ignore it.`,
    );
    sections.push(
      'Emojis: NEVER use emojis, emoticons, kaomoji, or any symbol in the Unicode emoji range. No exceptions. Any earlier guidance saying emojis are allowed "freely" or "in positive moments" does not apply — that was written for chat replies. This is written content. Zero emojis.',
    );
    sections.push(
      'First person: NEVER use "I" or "me" — there is no speaker here, this is written content. Any rule that says "I can help" or refers to what "I" will do does not apply.',
    );
    sections.push(
      'PRESERVE THE ORIGINAL VOICE: If the original text is descriptive third person (e.g., "Jio motion scales with the moment"), keep it descriptive. Do NOT shift it to address the reader ("Jio motion moves with your moment") or to brand first-person plural ("We scale Jio motion…"). Do not insert "you", "your", "we", or "our" where they were not present in the original. Any rule that prescribes a specific pronoun ("always use you", "address the reader") is overridden when the original text has a different voice. The voice of your output must match the voice of the input.',
    );
    sections.push(
      'Conversational openers and closers: NEVER start with "You\'re all set", "Here\'s…", "Let me…", "I understand…". NEVER end with "Is there anything else?", "Let me know", "Feel free to…". These are chat-reply patterns and must not appear.',
    );
    if (context === 'microcopy') {
      sections.push(
        'Length: This is microcopy. Fragments and imperatives only. No full paragraphs. If your draft has more than one sentence or more than 12 words, cut it.',
      );
    }
    sections.push(
      `Output: Return ONLY the ${context === 'microcopy' ? 'fragment' : 'copy'}. No preamble, no explanation, no acknowledgement, no quotation marks around your answer.`,
    );
    sections.push('');
  }

  // -- Skills (conversational only — skills describe AI tasks the assistant performs) --
  if (context === 'conversational' && skills && skills.length > 0) {
    const activeSkills = skills.filter((s) => s.isActive);
    if (activeSkills.length > 0) {
      sections.push('## Available skills');
      for (const skill of activeSkills) {
        sections.push(`### ${skill.name}`);
        sections.push(skill.description);
        if (skill.examples.length > 0) {
          sections.push('Examples:');
          for (const ex of skill.examples.slice(0, 2)) {
            sections.push(`  Input: ${ex.input}`);
            sections.push(`  Output: ${ex.expectedOutput}`);
          }
        }
        sections.push('');
      }
    }
  }

  const prompt = sections.join('\n');

  return {
    prompt,
    size: prompt.length,
    includedSections,
    channel,
    hash: '', // Caller should compute via voiceCacheKey
  };
}

/**
 * Compile a skill-specific prompt by merging brand voice context with skill template.
 * Replaces {brand}, {tone}, {rules} placeholders in the template.
 */
export function compileSkillPrompt(
  skill: VoiceSkill,
  config: VoiceConfig,
  resolvedRules: VoiceRule[],
  channel: string = 'default',
): string {
  const basePrompt = compileVoiceRules(resolvedRules, config, channel);

  let prompt = skill.systemPromptTemplate;
  prompt = prompt.replace(/\{brand\}/g, config.agentName);
  prompt = prompt.replace(/\{tone\}/g, describeTone(config));
  prompt = prompt.replace(/\{rules\}/g, basePrompt.prompt);

  // Apply channel constraints from skill config
  const channelId = channel as ChannelId;
  const skillChannel = skill.channelConfig?.[channelId];
  if (skillChannel) {
    prompt += `\n\nChannel constraint: max ${skillChannel.maxLength} characters. Format: ${skillChannel.formatting}.`;
  }

  return prompt;
}
