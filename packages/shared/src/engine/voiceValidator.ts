/**
 * Voice Validator — Structural validation for voice configs.
 *
 * Validates voice configuration integrity before compilation.
 * Follows the same pattern as validateBrandCSS.ts.
 */

import type { VoiceConfig } from './voiceTypes';

export interface VoiceValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate a voice configuration for structural integrity.
 */
export function validateVoiceConfig(config: VoiceConfig): VoiceValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required fields
  if (!config.agentName || config.agentName.trim().length === 0) {
    errors.push('Agent name is required');
  }

  // Tone profile ranges (only warmth + directness are required; deprecated fields are optional)
  const toneFields = ['warmth', 'directness'] as const;
  for (const field of toneFields) {
    const value = config.toneProfile[field];
    if (value < 0 || value > 100) {
      errors.push(`Tone profile ${field} must be 0-100, got ${value}`);
    }
  }

  // Language
  if (!config.language.primary || config.language.primary.trim().length === 0) {
    errors.push('Primary language is required');
  }

  // Forbidden words
  if (config.communicationStyle.forbiddenWords.length === 0) {
    warnings.push('No forbidden words configured — tone guard checks will be less effective');
  }

  // Emoji consistency
  if (config.communicationStyle.useEmojis && (!config.communicationStyle.allowedEmojis || config.communicationStyle.allowedEmojis.length === 0)) {
    warnings.push('Emojis are enabled but no allowed emojis are specified — any emoji will be permitted');
  }

  // Channel defaults
  if (config.channelDefaults) {
    const channels = ['sms', 'whatsapp', 'app', 'ivr', 'email'] as const;
    for (const ch of channels) {
      const chConfig = config.channelDefaults[ch];
      if (chConfig && chConfig.maxLength <= 0) {
        errors.push(`Channel ${ch} maxLength must be positive, got ${chConfig.maxLength}`);
      }
    }
  }

  // Version
  if (config.version < 1) {
    warnings.push('Version should be >= 1');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}
