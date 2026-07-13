/**
 * Voice Tone Guard — Deterministic Post-Generation Validation
 *
 * Pure function that validates an AI response against brand voice rules.
 * Runs regex-based and dictionary-based checks — no LLM call needed.
 * Catches the 10-20% of violations that prompt engineering alone misses.
 *
 * Based on Core Rules v5 Section 18 (Communication Style).
 */

import type { VoiceConfig, ToneGuardCheck, ToneGuardResult } from './voiceTypes';

// ============================================
// Check: Forbidden words
// ============================================

function checkForbiddenWords(text: string, forbiddenWords: string[]): ToneGuardCheck {
  const lower = text.toLowerCase();
  const found: string[] = [];

  for (const word of forbiddenWords) {
    // Match whole word or phrase
    const pattern = new RegExp(`\\b${escapeRegex(word)}\\b`, 'gi');
    if (pattern.test(lower)) {
      found.push(word);
    }
  }

  return {
    id: 'forbidden-words',
    name: 'Forbidden words',
    passed: found.length === 0,
    details: found.length > 0 ? `Found: ${found.join(', ')}` : undefined,
  };
}

// ============================================
// Check: Exclamation marks (Section 18)
// ============================================

function checkExclamationMarks(text: string): ToneGuardCheck {
  const count = (text.match(/!/g) || []).length;
  return {
    id: 'exclamation-marks',
    name: 'No exclamation marks',
    passed: count === 0,
    details: count > 0 ? `Found ${count} exclamation mark(s)` : undefined,
    correction: count > 0 ? text.replace(/!/g, '.') : undefined,
  };
}

// ============================================
// Check: Em dashes (Section 18 — never use)
// ============================================

function checkEmDashes(text: string): ToneGuardCheck {
  const hasEmDash = text.includes('—') || text.includes('\u2014');
  return {
    id: 'em-dashes',
    name: 'No em dashes',
    passed: !hasEmDash,
    details: hasEmDash ? 'Found em dash(es). Replace with full stop, comma or semicolon' : undefined,
    correction: hasEmDash ? text.replace(/\s*—\s*/g, ', ') : undefined,
  };
}

// ============================================
// Check: Ellipsis (Section 18)
// ============================================

function checkEllipsis(text: string): ToneGuardCheck {
  const hasEllipsis = text.includes('...') || text.includes('…');
  return {
    id: 'ellipsis',
    name: 'No ellipsis',
    passed: !hasEllipsis,
    details: hasEllipsis ? 'Found ellipsis — rephrase or remove' : undefined,
  };
}

// ============================================
// Check: ALL CAPS (Section 18)
// ============================================

function checkAllCaps(text: string): ToneGuardCheck {
  // Match words of 3+ chars that are all uppercase (excluding acronyms like SMS, IVR)
  const allCapsWords = text.match(/\b[A-Z]{4,}\b/g) || [];
  // Filter out common acceptable acronyms
  const acceptable = new Set(['HTTP', 'HTTPS', 'HTML', 'CSS', 'JSON', 'API', 'URL', 'WCAG', 'OKHSL', 'OKLCH']);
  const violations = allCapsWords.filter((w) => !acceptable.has(w));

  return {
    id: 'all-caps',
    name: 'No ALL CAPS for emphasis',
    passed: violations.length === 0,
    details: violations.length > 0 ? `Found: ${violations.join(', ')}` : undefined,
  };
}

// ============================================
// Check: Apology count (Section 7 — max 1)
// ============================================

function checkApologyCount(text: string): ToneGuardCheck {
  const lower = text.toLowerCase();
  const apologyPatterns = [
    /\bsorry\b/g,
    /\bapologi[sz]e\b/g,
    /\bapologies\b/g,
    /\bregret\b/g,
    /\bour apolog/g,
  ];

  let count = 0;
  for (const pattern of apologyPatterns) {
    const matches = lower.match(pattern);
    if (matches) count += matches.length;
  }

  return {
    id: 'apology-count',
    name: 'Max 1 apology per response',
    passed: count <= 1,
    details: count > 1 ? `Found ${count} apologies — should be max 1` : undefined,
  };
}

// ============================================
// Check: Padding phrases (Section 18)
// ============================================

function checkPaddingPhrases(text: string): ToneGuardCheck {
  const lower = text.toLowerCase();
  const paddingPhrases = [
    'please note that',
    'we would like to inform you',
    'i would like to inform you',
    'it is important to note',
    'please be advised',
    'for your information',
    'we wish to inform',
  ];

  const found = paddingPhrases.filter((p) => lower.includes(p));

  return {
    id: 'padding-phrases',
    name: 'No padding phrases',
    passed: found.length === 0,
    details: found.length > 0 ? `Found: "${found.join('", "')}"` : undefined,
  };
}

// ============================================
// Check: Emoji policy (Section 18)
// ============================================

function checkEmojiPolicy(
  text: string,
  useEmojis: boolean,
  allowedEmojis?: string[],
  maxEmojisPerResponse?: number
): ToneGuardCheck {
  // Match emoji characters (simplified — covers most common)
  const emojiPattern = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F000}-\u{1F02F}\u{1F0A0}-\u{1F0FF}\u{200D}\u{20E3}\u{FE0F}\u{E0020}-\u{E007F}]|[✅⚠️🙂🎉❌✨🔥💡👋🎯]/gu;
  const foundEmojis = text.match(emojiPattern) || [];
  const maxAllowed = maxEmojisPerResponse ?? 1;

  if (!useEmojis && foundEmojis.length > 0) {
    return {
      id: 'emoji-policy',
      name: 'Emoji policy',
      passed: false,
      details: `Emojis not allowed for this brand. Found: ${foundEmojis.join(' ')}`,
    };
  }

  if (useEmojis && foundEmojis.length > maxAllowed) {
    return {
      id: 'emoji-policy',
      name: `Emoji policy (max ${maxAllowed})`,
      passed: false,
      details: `Max ${maxAllowed} emoji allowed. Found ${foundEmojis.length}: ${foundEmojis.join(' ')}`,
    };
  }

  if (useEmojis && allowedEmojis && allowedEmojis.length > 0 && foundEmojis.length > 0) {
    const disallowed = foundEmojis.filter((e) => !allowedEmojis.includes(e));
    if (disallowed.length > 0) {
      return {
        id: 'emoji-policy',
        name: 'Emoji policy (allowed list)',
        passed: false,
        details: `Disallowed emoji: ${disallowed.join(' ')}. Allowed: ${allowedEmojis.join(' ')}`,
      };
    }
  }

  return {
    id: 'emoji-policy',
    name: 'Emoji policy',
    passed: true,
  };
}

// ============================================
// Check: American spelling (common catches)
// ============================================

function checkAmericanSpelling(text: string, convention: string): ToneGuardCheck {
  if (convention !== 'british') {
    return { id: 'spelling-convention', name: 'Spelling convention', passed: true };
  }

  const americanToBritish: Record<string, string> = {
    'color': 'colour',
    'favor': 'favour',
    'honor': 'honour',
    'neighbor': 'neighbour',
    'organize': 'organise',
    'recognize': 'recognise',
    'realize': 'realise',
    'customize': 'customise',
    'apologize': 'apologise',
    'center': 'centre',
    'meter': 'metre',
    'fiber': 'fibre',
    'canceled': 'cancelled',
    'traveled': 'travelled',
    'catalog': 'catalogue',
    'dialog': 'dialogue',
    'defense': 'defence',
    'offense': 'offence',
    'license': 'licence',
    'practice': 'practise',
  };

  const lower = text.toLowerCase();
  const found: Array<{ american: string; british: string }> = [];

  for (const [american, british] of Object.entries(americanToBritish)) {
    const pattern = new RegExp(`\\b${american}\\b`, 'gi');
    if (pattern.test(lower)) {
      found.push({ american, british });
    }
  }

  return {
    id: 'spelling-convention',
    name: 'British English spelling',
    passed: found.length === 0,
    details: found.length > 0
      ? `American spellings found: ${found.map((f) => `${f.american} → ${f.british}`).join(', ')}`
      : undefined,
  };
}

// ============================================
// Check: Oxford comma (Section 18 — no Oxford comma)
// ============================================

function checkOxfordComma(text: string): ToneGuardCheck {
  // True Oxford comma only occurs in lists of 3+ items: "item1, item2, and item3"
  // Require a prior comma before the final ", and/or" to confirm a list context.
  // This avoids false positives from compound sentences like "right, and three times".
  const oxfordPattern = /\b[^,\n]+,\s+[^,\n]+,\s+(and|or)\s+\w/gi;
  const suspicious = oxfordPattern.test(text);

  return {
    id: 'oxford-comma',
    name: 'No Oxford comma',
    passed: true, // Heuristic only — don't hard-fail, just warn
    details: suspicious ? 'Possible Oxford comma detected — review list formatting' : undefined,
  };
}

// ============================================
// Check: Formatting structure (prose only — no bullets, lists, headers)
// ============================================

function checkFormattingStructure(text: string): ToneGuardCheck {
  const violations: string[] = [];
  if (/^\s*[-*]\s/m.test(text)) violations.push('bullet points');
  if (/^\s*\d+\.\s/m.test(text)) violations.push('numbered list');
  if (/^#{1,6}\s/m.test(text)) violations.push('markdown headers');
  if (/\*\*[^*]+\*\*/m.test(text)) violations.push('bold markdown');
  if (/__[^_]+__/m.test(text)) violations.push('bold markdown (underscore)');

  return {
    id: 'formatting-structure',
    name: 'Prose only (no bullets, lists, headers or bold)',
    passed: violations.length === 0,
    details: violations.length > 0 ? `Found: ${violations.join(', ')}` : undefined,
  };
}

// ============================================
// Check: Opening phrases (no task declarations)
// ============================================

function checkOpeningPhrases(text: string): ToneGuardCheck {
  const firstSentence = (text.split(/[.!?]\s/)[0] ?? '').toLowerCase();
  const forbidden = [
    'i can help you with that',
    'let me help you',
    'here is what you can do',
    'here\'s what you can do',
    'sure, i can',
    'i would be happy to help',
    'i\'d be happy to help',
    'let me assist you',
    'let me look into that',
    'i can certainly help',
    'absolutely, let me',
  ];

  const found = forbidden.filter((p) => firstSentence.includes(p));

  return {
    id: 'opening-phrases',
    name: 'No task-declaration openings',
    passed: found.length === 0,
    details: found.length > 0 ? `Opening uses: "${found[0]}"` : undefined,
  };
}

// ============================================
// Check: Scripted sympathy phrases
// ============================================

function checkScriptedSympathy(text: string): ToneGuardCheck {
  const lower = text.toLowerCase();
  const scripted = [
    'i understand how frustrating',
    'i can see why that',
    'i\'m sorry to hear that',
    'i completely understand',
    'i can imagine how',
    'that must be really',
    'i understand your frustration',
    'i can understand how',
    'i know how frustrating',
    'i appreciate your patience',
  ];

  const found = scripted.filter((p) => lower.includes(p));

  return {
    id: 'scripted-sympathy',
    name: 'No scripted sympathy phrases',
    passed: found.length === 0,
    details: found.length > 0 ? `Found: "${found.join('", "')}"` : undefined,
  };
}

// ============================================
// Check: Call-centre closing phrases
// ============================================

function checkClosingPhrases(text: string): ToneGuardCheck {
  const lower = text.toLowerCase();
  const forbidden = [
    'is there anything else i can help you with',
    'don\'t hesitate to reach out',
    'do not hesitate to reach out',
    'feel free to reach out',
    'please don\'t hesitate',
    'let me know if there\'s anything else',
    'let me know if there is anything else',
    'if you have any further questions',
    'if you need any further assistance',
    'happy to help with anything else',
    'we\'re always here to help',
  ];

  const found = forbidden.filter((p) => lower.includes(p));

  return {
    id: 'closing-phrases',
    name: 'No call-centre closings',
    passed: found.length === 0,
    details: found.length > 0 ? `Found: "${found[0]}"` : undefined,
  };
}

// ============================================
// Check: Jio product names (must use single inverted commas)
// ============================================

const JIO_PRODUCTS = [
  'MyJio', 'JioFiber', 'JioHotstar', 'JioCinema', 'JioSaavn',
  'JioCloud', 'JioMart', 'JioPhone', 'JioTV', 'JioMeet',
  'JioPages', 'JioSwitch', 'JioSecurity',
];

function checkProductNames(text: string): ToneGuardCheck {
  const unquoted: string[] = [];

  for (const product of JIO_PRODUCTS) {
    // Match product name NOT surrounded by single quotes
    const pattern = new RegExp(`(?<!')\\b${product}\\b(?!')`, 'g');
    if (pattern.test(text)) {
      unquoted.push(product);
    }
  }

  let corrected: string | undefined;
  if (unquoted.length > 0) {
    corrected = text;
    for (const product of unquoted) {
      corrected = corrected.replace(
        new RegExp(`(?<!')\\b${product}\\b(?!')`, 'g'),
        `'${product}'`
      );
    }
  }

  return {
    id: 'product-names',
    name: 'Jio product names in single quotes',
    passed: unquoted.length === 0,
    details: unquoted.length > 0 ? `Unquoted: ${unquoted.join(', ')}` : undefined,
    correction: corrected,
  };
}

// ============================================
// Check: Sentence count (per channel)
// ============================================

const SENTENCE_LIMITS: Record<string, number> = {
  sms: 2,
  whatsapp: 3,
  app: 5,
  ivr: 3,
  email: 7,
  default: 5,
};

function checkSentenceCount(text: string, channel?: string, verbosity?: number): ToneGuardCheck {
  const sentences = text
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 10);

  const channelMax = SENTENCE_LIMITS[channel ?? 'default'] ?? 5;
  // Scale sentence limit by verbosity: at 0 = 1 sentence, at 100 = full channel max
  const v = verbosity ?? 50;
  const maxSentences = Math.max(1, Math.round(channelMax * Math.max(0.2, v / 100)));

  return {
    id: 'sentence-count',
    name: `Sentence count (max ${maxSentences})`,
    passed: sentences.length <= maxSentences,
    details: `${sentences.length} sentences (max ${maxSentences})`,
  };
}

// ============================================
// Check: Backend capability claims
// ============================================

function checkBackendClaims(text: string): ToneGuardCheck {
  const lower = text.toLowerCase();
  const claims = [
    'i can see your account',
    'i can see your',
    'i can access your',
    'looking at your account',
    'looking at your plan',
    'i can check your',
    'i see that your',
    'i see your account',
    'checking your account',
    'based on your account',
    'your account shows',
    'according to your records',
  ];

  const found = claims.filter((p) => lower.includes(p));

  return {
    id: 'backend-claims',
    name: 'No unverified backend claims',
    passed: found.length === 0,
    details: found.length > 0 ? `Found: "${found[0]}"` : undefined,
  };
}

// ============================================
// Check: Response length
// ============================================

function checkResponseLength(text: string, maxLength?: number): ToneGuardCheck {
  if (!maxLength) {
    return { id: 'response-length', name: 'Response length', passed: true };
  }

  const length = text.length;
  return {
    id: 'response-length',
    name: 'Response length',
    passed: length <= maxLength,
    details: length > maxLength
      ? `Response is ${length} chars, max is ${maxLength}`
      : `${length}/${maxLength} chars`,
  };
}

// ============================================
// Main entry point
// ============================================

/**
 * Run all deterministic tone guard checks on a response.
 * These are fast (regex/dictionary), run in parallel, and catch
 * the violations that prompt engineering alone misses.
 */
export function runToneGuard(
  response: string,
  config: VoiceConfig,
  channel?: string
): ToneGuardResult {
  const channelConfig = channel
    ? config.channelDefaults?.[channel as keyof typeof config.channelDefaults]
    : undefined;
  const maxLength = channelConfig?.maxLength ?? config.communicationStyle.maxResponseLength;

  const checks: ToneGuardCheck[] = [
    checkForbiddenWords(response, config.communicationStyle.forbiddenWords),
    checkExclamationMarks(response),
    checkEmDashes(response),
    checkEllipsis(response),
    checkAllCaps(response),
    checkApologyCount(response),
    checkPaddingPhrases(response),
    checkEmojiPolicy(
      response,
      config.communicationStyle.useEmojis,
      config.communicationStyle.allowedEmojis,
      config.communicationStyle.maxEmojisPerResponse
    ),
    checkAmericanSpelling(response, config.language.spellingConvention),
    checkOxfordComma(response),
    checkResponseLength(response, maxLength),
    // New checks (feedback review)
    checkFormattingStructure(response),
    checkOpeningPhrases(response),
    checkScriptedSympathy(response),
    checkClosingPhrases(response),
    checkProductNames(response),
    checkSentenceCount(response, channel, config.verbosity),
    checkBackendClaims(response),
  ];

  const failedChecks = checks.filter((c) => !c.passed);
  const totalChecks = checks.length;
  const passedChecks = totalChecks - failedChecks.length;
  const score = Math.round((passedChecks / totalChecks) * 100);

  // Build auto-corrected text by applying deterministic fixes sequentially.
  // Each fix operates on the accumulated result, not the original response.
  let correctedText: string | undefined;
  const corrections = checks.filter((c) => c.correction);
  if (corrections.length > 0) {
    correctedText = response;
    for (const check of corrections) {
      if (check.id === 'exclamation-marks') {
        correctedText = correctedText.replace(/!/g, '.');
      }
      if (check.id === 'em-dashes') {
        correctedText = correctedText.replace(/\s*—\s*/g, ', ');
      }
      if (check.id === 'product-names') {
        // Apply product name quoting on the accumulated text, not check.correction
        for (const product of JIO_PRODUCTS) {
          const pattern = new RegExp(`(?<!')\\b${product}\\b(?!')`, 'g');
          correctedText = correctedText.replace(pattern, `'${product}'`);
        }
      }
    }
  }

  return {
    allPassed: failedChecks.length === 0,
    score,
    checks,
    correctedText,
  };
}

// ============================================
// Utility
// ============================================

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
