/**
 * AIGenerateButton.tsx
 *
 * Sparkle icon button that triggers AI documentation generation
 * for a specific section or all sections.
 */

'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from '@oneui/ui/components/Button';
import type {
  DocumentationSectionKey,
  ComponentTokenManifest,
  ComponentRecipeDefinition,
} from '@oneui/shared';
import { useComponentDocEditor } from '@/contexts/ComponentDocEditorContext';
import { usePlatformContext } from '@/contexts/PlatformContext';
import { AIStreamingPreview } from './AIStreamingPreview';

interface AIGenerateButtonProps {
  section?: DocumentationSectionKey;
  label?: string;
  tokenManifest?: ComponentTokenManifest;
  recipeDefinition?: ComponentRecipeDefinition;
}

export function AIGenerateButton({
  section,
  label = 'Generate with AI',
  tokenManifest,
  recipeDefinition,
}: AIGenerateButtonProps) {
  const { resolvedSpec } = useComponentDocEditor();
  const { currentBrand, theme } = usePlatformContext();
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamedContent, setStreamedContent] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => () => { abortRef.current?.abort(); }, []);

  const handleGenerate = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsGenerating(true);
    setStreamedContent('');
    setShowPreview(true);

    try {
      const response = await fetch('/api/component-docs/generate', {
        method: 'POST',
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          componentName: resolvedSpec.componentName,
          section,
          currentSpec: resolvedSpec,
          componentContext: {
            propsInterface: resolvedSpec.props,
            tokenManifest: tokenManifest ?? null,
            recipeDefinition: recipeDefinition ?? null,
            slotDefinitions: resolvedSpec.slots,
          },
          brandContext: currentBrand
            ? { brandName: currentBrand.name, theme }
            : undefined,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error('Generation failed');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setStreamedContent(accumulated);
      }
    } catch (err) {
      console.error('AI generation error:', err);
      setStreamedContent('');
      setShowPreview(false);
    } finally {
      setIsGenerating(false);
    }
  }, [resolvedSpec, section, tokenManifest, recipeDefinition, currentBrand, theme]);

  const handleDismiss = useCallback(() => {
    setShowPreview(false);
    setStreamedContent('');
  }, []);

  return (
    <>
      <Button
        attention="low"
        size="small"
        onPress={handleGenerate}
        loading={isGenerating}
        disabled={isGenerating}
      >
        {label}
      </Button>
      {showPreview && streamedContent && (
        <AIStreamingPreview
          content={streamedContent}
          section={section}
          isStreaming={isGenerating}
          onDismiss={handleDismiss}
        />
      )}
    </>
  );
}
