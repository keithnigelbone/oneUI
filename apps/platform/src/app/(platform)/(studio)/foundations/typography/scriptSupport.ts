import {
  type TypographyConfigV2,
  type TypographyScriptConfig,
  type TypographyScriptKey,
  type TypographyScriptPreset,
  resolveTypographyScriptSupport,
  sanitizeTypographyScriptCssName,
} from '@oneui/shared';

export function setTypographyScriptPreset(
  prev: TypographyConfigV2,
  preset: TypographyScriptPreset,
): TypographyConfigV2 {
  if (preset === 'india-core-v1') {
    return {
      ...prev,
      scriptSupport: { preset },
    };
  }

  const resolvedScripts = resolveTypographyScriptSupport(prev.scriptSupport);
  return {
    ...prev,
    scriptSupport: {
      preset,
      scripts: Object.fromEntries(
        resolvedScripts.map((script) => {
          const config: TypographyScriptConfig = {
            label: script.label,
            cssName: script.cssName,
            enabled: script.enabled,
            uiFontId: script.uiFontId,
            readingFontId: script.readingFontId,
            lineHeightMode: script.lineHeightMode,
            langTags: [...script.langTags],
            sampleText: script.sample,
          };
          if (script.lineHeightMode === 'custom') {
            config.lineHeightDeltas = script.lineHeightDeltas;
          }
          return [script.id, config];
        }),
      ),
    },
  };
}

export function applyTypographyScriptPatch(
  prev: TypographyConfigV2,
  scriptId: TypographyScriptKey,
  patch: Partial<TypographyScriptConfig>,
): TypographyConfigV2 {
  const current = prev.scriptSupport?.scripts?.[scriptId] ?? {};
  const next: TypographyScriptConfig = { ...current, ...patch };
  if (patch.lineHeightMode && patch.lineHeightMode !== 'custom') {
    delete next.lineHeightDeltas;
  }

  return {
    ...prev,
    scriptSupport: {
      ...prev.scriptSupport,
      preset: 'custom',
      scripts: {
        ...prev.scriptSupport?.scripts,
        [scriptId]: next,
      },
    },
  };
}

export function addTypographyScriptRow(
  prev: TypographyConfigV2,
  scriptId: string,
): TypographyConfigV2 {
  const label = 'Custom Script';
  return {
    ...prev,
    scriptSupport: {
      ...prev.scriptSupport,
      preset: 'custom',
      scripts: {
        ...prev.scriptSupport?.scripts,
        [scriptId]: {
          label,
          cssName: sanitizeTypographyScriptCssName(label),
          enabled: true,
          uiFontId: 'noto-sans',
          readingFontId: 'noto-sans',
          lineHeightMode: 'ui',
          langTags: [],
          sampleText: label,
        },
      },
    },
  };
}

export function removeTypographyScriptRow(
  prev: TypographyConfigV2,
  scriptId: string,
): TypographyConfigV2 {
  if (!prev.scriptSupport?.scripts?.[scriptId]) return prev;
  const { [scriptId]: _removed, ...remainingScripts } = prev.scriptSupport.scripts;
  return {
    ...prev,
    scriptSupport: {
      ...prev.scriptSupport,
      preset: 'custom',
      scripts: remainingScripts,
    },
  };
}
