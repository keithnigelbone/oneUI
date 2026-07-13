/**
 * ProjectWorkspace — Core workspace for a project.
 * Refactored from ExperienceContent with Convex persistence.
 *
 * Key changes from ExperienceContent:
 * - Project + assets loaded from Convex (real-time)
 * - Chat history persisted via useCreateChatPersistence
 * - Asset mutations write to Convex
 * - Project header reads from Convex
 * - Settings panel for editing project metadata
 */

'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, generateId, type UIMessage } from 'ai';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@oneui/convex';
import type { Id } from '@oneui/convex/_generated/dataModel';
import { migrateLegacyPlatformsConfig, type PlatformsFoundationConfig } from '@oneui/shared';
import { usePlatformContext } from '@/contexts/PlatformContext';
import { useRouter } from 'next/navigation';
import { CreateChatPanel } from '../../components/CreateChatPanel';
import { CreateChatActionsContext } from '../../components/CreateChatContext';
import { PreviewPanel } from '../../components/PreviewPanel';
import { AssetDetailPanel } from '../../components/AssetDetailPanel';
import { CreateCanvasEditor } from '../../components/CreateCanvasEditor';
import { ProjectSettingsPanel } from '../../components/ProjectSettingsPanel';
import { ContentBlockRenderer } from '../../components/ContentBlockRenderer';
import { RibbonRenderer } from '../../components/RibbonRenderer';
import { isJioRibbon } from '../../lib/ribbon-schema';
import type { RibbonDataV1 } from '../../lib/ribbon-schema';
import { Button } from '@oneui/ui/components/Button';
import { IconButton } from '@oneui/ui/components/IconButton';
import { generateTypographyCSS } from '@oneui/ui/utils/foundationCSS';
import { useFoundationData } from '@/components/FoundationStyleProvider';
import { useProjectData } from '../../hooks/useProjectData';
import { useCreateChatPersistence } from '../../hooks/useCreateChatPersistence';
import { useTokenExtraction } from '../../hooks/useTokenExtraction';
import { useCanvasCapture } from '../../hooks/useCanvasCapture';
import { CREATE_ARTBOARD_PRESETS } from '../../lib/createArtboardPresets';
import { getDimensionByName, getDimensionsForPlatform } from '../../lib/social-platforms';
import { PLATFORMS } from '../../lib/social-platforms';
import {
  checkCreateChatApiAvailable,
  createInitialOfflineWizardState,
  getOfflineWizardBootstrapMessages,
  processOfflineWizardTurn,
  type OfflineWizardContext,
} from '../../lib/offline-wizard-engine';
import type { BrandContext, CampaignAsset, SocialPlatform } from '../../lib/types';
import {
  ExperienceCanvas,
  extractScreens,
  type ArtboardSubBrandOption,
} from '@/design-tools/ExperienceCanvas';
import { buildContentBlockProps } from '../../lib/offline-templates';
import styles from './ProjectWorkspace.module.css';

/** Build contextual suggested prompts based on project data */
function getSuggestedPrompts(projectName: string, platforms: SocialPlatform[]): string[] {
  const platformNames = platforms.map(
    (pid) => PLATFORMS.find((p) => p.id === pid)?.label ?? pid
  );
  const prompts: string[] = [];

  if (projectName.trim()) {
    prompts.push(`Create a hero visual aligned with “${projectName}”`);
  }
  if (platforms.includes('instagram')) {
    prompts.push('Create a hero Instagram post for this project');
  }
  if (platforms.some((p) => ['instagram', 'facebook', 'tiktok'].includes(p))) {
    prompts.push('Generate story and post formats');
  }
  prompts.push('Design a product launch visual');
  if (platforms.length > 1) {
    prompts.push(`Make assets for all platforms: ${platformNames.join(', ')}`);
  }
  if (prompts.length < 4) {
    prompts.push('Create a bold, scroll-stopping hero visual');
  }
  return prompts.slice(0, 4);
}

/** Extract tool name from a part type */
function getToolNameFromPartType(type: string): string | null {
  if (type.startsWith('tool-')) return type.slice(5);
  return null;
}

interface ProjectWorkspaceProps {
  projectId: string;
}

export default function ProjectWorkspace({ projectId }: ProjectWorkspaceProps) {
  const { currentBrand, theme, platform, density } = usePlatformContext();

  const subBrandsForCreate = useQuery(
    api.subBrandConfigs.getByParentBrand,
    currentBrand?.id ? { parentBrandId: currentBrand.id as Id<'brands'> } : 'skip',
  );

  const artboardSubBrandOptions: ArtboardSubBrandOption[] = useMemo(() => {
    if (!subBrandsForCreate?.length) return [];
    return subBrandsForCreate.map((s) => ({
      id: s._id,
      name: s.name,
      slug: s.slug,
      parentBrandId: s.parentBrandId,
      primary: s.primary,
      secondary: s.secondary,
      sparkle: s.sparkle,
      brandBg: s.brandBg,
    }));
  }, [subBrandsForCreate]);
  const router = useRouter();
  const typedProjectId = projectId as Id<'createProjects'>;

  // Convex data
  const { project, assets: convexAssets, isLoading } = useProjectData(typedProjectId);
  const { initialMessages, saveMessages, isLoaded: chatLoaded } = useCreateChatPersistence(typedProjectId);

  // Convex mutations
  const createAsset = useMutation(api.createProjects.createAsset);
  const updateAssetMutation = useMutation(api.createProjects.updateAsset);
  const updateProject = useMutation(api.createProjects.update);
  const removeAssetMutation = useMutation(api.createProjects.removeAsset);
  const generateUploadUrlMutation = useMutation(api.createProjects.generateUploadUrl);

  // Token extraction — scrapes live CSS custom properties from the document.
  // When injection mode is 'none' (default), brand tokens aren't in the DOM,
  // so we supplement with typography CSS generated directly from foundation data.
  const brandKey = `${currentBrand?.id ?? 'none'}-${theme}`;
  const baseTokenCSS = useTokenExtraction(brandKey);
  const foundationData = useFoundationData();

  const platformOverview = useQuery(
    api.foundations.getBrandOverviewData,
    currentBrand?.id ? { brandId: currentBrand.id as Id<'brands'> } : 'skip',
  );

  const foundationPlatformEntries = useMemo(() => {
    const raw = platformOverview?.platforms?.config as PlatformsFoundationConfig | undefined;
    if (!raw) return [];
    const cfg = migrateLegacyPlatformsConfig(raw);
    return cfg.platforms;
  }, [platformOverview]);

  // Generate token CSS scoped to .asset-render so brand tokens don't leak into the editor UI.
  // Uses full generateTypographyCSS (includes size scale + weights + families) since
  // it's scoped to .asset-render and won't affect the platform UI.
  const tokenCSS = useMemo(() => {
    const typographyConfig = foundationData?.typography?.config;
    const customFonts = foundationData?.customFonts;
    const typographyCSS = generateTypographyCSS(typographyConfig, customFonts);

    // Re-scope baseTokenCSS from :root to .asset-render
    const scopedBaseCSS = baseTokenCSS
      ? baseTokenCSS.replace(/:root\s*\{/g, '.asset-render {')
      : '';

    if (!typographyCSS) return scopedBaseCSS;

    // Append brand typography declarations scoped to .asset-render
    const brandDeclarations = `.asset-render {\n  ${typographyCSS}\n}`;
    return scopedBaseCSS ? `${scopedBaseCSS}\n\n${brandDeclarations}` : brandDeclarations;
  }, [baseTokenCSS, foundationData]);

  const {
    onCaptureEditorReady,
    captureLayoutToPngAndSnapshot,
    recaptureFromStoredSnapshot,
  } = useCanvasCapture();

  // Track processed tool calls
  const processedToolCalls = useRef<Set<string>>(new Set());

  // Track latest ContentBlock props from generate_content_block tool calls.
  // Used to pass to the capture pipeline so the canvas renders ContentBlock overlays.
  const latestContentBlockProps = useRef<Record<string, unknown> | null>(null);

  /** Chat API reachability — offline uses the Banner Builder–style wizard only. */
  const apiModeRef = useRef<'unknown' | 'online' | 'offline'>('unknown');
  const offlineWizardStateRef = useRef(createInitialOfflineWizardState());
  const [isOffline, setIsOffline] = useState(false);
  const isOfflineRef = useRef(false);
  isOfflineRef.current = isOffline;

  // UI state
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [editingAssetId, setEditingAssetId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [activePlatformFilter, setActivePlatformFilter] = useState<SocialPlatform | 'all'>('all');

  const captureChain = useRef<Promise<void>>(Promise.resolve());

  const enqueueCapture = useCallback((fn: () => Promise<void>) => {
    captureChain.current = captureChain.current.then(fn).catch((e) => {
      console.error('[ProjectWorkspace] capture queue', e);
    });
  }, []);

  // Map Convex assets to CampaignAsset type for existing components
  const localAssets: CampaignAsset[] = useMemo(
    () =>
      convexAssets.map((a) => ({
        id: a._id,
        name: a.name,
        dimension: {
          name: a.dimensionName,
          width: a.width,
          height: a.height,
          platform: a.platform,
          category: a.category as CampaignAsset['dimension']['category'],
        },
        html: a.html,
        css: a.css,
        imageSlots: a.imageSlots as CampaignAsset['imageSlots'],
        capturedImageUrl: a.capturedImageUrl,
        status: a.status,
        error: a.error,
        createdAt: a.createdAt,
        updatedAt: a.updatedAt,
        contentBlockData: a.contentBlockData,
        ribbonData: a.ribbonData,
        tldrawSnapshot: a.tldrawSnapshot,
      })),
    [convexAssets]
  );

  // Filtered assets
  const filteredAssets = useMemo(
    () =>
      activePlatformFilter === 'all'
        ? localAssets
        : localAssets.filter((a) => a.dimension.platform === activePlatformFilter),
    [localAssets, activePlatformFilter]
  );

  // Brand context for the API — includes resolved font names for the prompt
  const brandContext: BrandContext = useMemo(() => {
    const typographyConfig = foundationData?.typography?.config as
      | { fontFamily?: string; fontSelection?: { primaryFontId?: string; secondaryFontId?: string } }
      | undefined;
    const customFonts = foundationData?.customFonts as
      | Array<{ _id: string; name: string }> | undefined;

    // Resolve a font ID to its display name
    const resolveFontName = (fontId: string): string => {
      if (fontId.startsWith('uploaded-') && customFonts) {
        const convexId = fontId.replace('uploaded-', '');
        const cf = customFonts.find(f => f._id === convexId);
        if (cf) return cf.name;
      }
      return fontId;
    };

    let primaryFont: string | undefined;
    let secondaryFont: string | undefined;
    // fontSelection (structured) takes precedence over legacy fontFamily (string)
    if (typographyConfig?.fontSelection?.primaryFontId) {
      primaryFont = resolveFontName(typographyConfig.fontSelection.primaryFontId);
    } else if (typographyConfig?.fontFamily) {
      primaryFont = typographyConfig.fontFamily;
    }
    if (typographyConfig?.fontSelection?.secondaryFontId) {
      secondaryFont = resolveFontName(typographyConfig.fontSelection.secondaryFontId);
    }
    return {
      brandName: currentBrand?.name ?? 'Default Brand',
      theme,
      tokenFamilies: [],
      primaryFont,
      secondaryFont,
    };
  }, [currentBrand?.name, theme, foundationData]);

  // Project context for the AI — avoids re-asking info from wizard
  const projectContext = useMemo(() => {
    if (!project) return undefined;
    return {
      name: project.name,
      description: project.description,
      platforms: project.platforms ?? [],
      audience: project.audience,
      tone: project.tone,
      brief: project.brief,
      assetType: project.assetType,
      projectType: project.type,
    };
  }, [project]);

  // Refs for dynamic body values — the transport body function reads these at call time
  // so the latest project context and assets are always sent with each request.
  const brandContextRef = useRef(brandContext);
  brandContextRef.current = brandContext;
  const tokenCSSRef = useRef(tokenCSS);
  tokenCSSRef.current = tokenCSS;
  const projectContextRef = useRef(projectContext);
  projectContextRef.current = projectContext;
  const localAssetsRef = useRef(localAssets);
  localAssetsRef.current = localAssets;

  // Transport for useChat — uses a body function (Resolvable) that reads refs
  // at request time, ensuring the latest project context and assets are always sent.
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: '/api/create/chat',
        body: () => ({
          brandContext: brandContextRef.current,
          tokenCSS: tokenCSSRef.current,
          projectContext: projectContextRef.current,
          existingAssets: localAssetsRef.current.length > 0
            ? localAssetsRef.current.map((a) => ({
                id: a.id,
                name: a.name,
                dimension: `${a.dimension.width}x${a.dimension.height}`,
                platform: a.dimension.platform,
                status: a.status,
                hasImage: a.imageSlots.some((s) => s.status === 'ready'),
              }))
            : undefined,
        }),
      }),
    [] // Stable transport — body function reads refs dynamically
  );

  // Chat
  const { messages, sendMessage, setMessages, status, error, clearError } = useChat({
    transport,
    messages: initialMessages.length > 0 ? initialMessages : undefined,
    onError: (err) => {
      console.error('Chat error:', err);
      apiModeRef.current = 'offline';
      setIsOffline(true);
      setErrorMessage(
        `${err.message || 'Chat request failed.'} Offline guided mode is active — continue in chat.`
      );
    },
  });

  useEffect(() => {
    offlineWizardStateRef.current = createInitialOfflineWizardState();
    apiModeRef.current = 'unknown';
    setIsOffline(false);
  }, [projectId]);

  // Persist messages when they change
  useEffect(() => {
    if (messages.length > 0) {
      saveMessages(messages);
    }
  }, [messages, saveMessages]);

  const offlineWizardContext = useMemo((): OfflineWizardContext | null => {
    if (!project) return null;
    return {
      projectName: project.name,
      projectDescription: project.description,
      projectType: project.type,
      projectPlatforms: (project.platforms ?? []) as SocialPlatform[],
    };
  }, [project]);

  const appendOfflineExchange = useCallback(
    (text: string, attachments?: { name: string; type: string; dataUrl: string }[]) => {
      const ctx = offlineWizardContext;
      if (!ctx) return;
      const parts: UIMessage['parts'] = [];
      if (attachments?.length) {
        for (const a of attachments) {
          parts.push({ type: 'file' as const, url: a.dataUrl, mediaType: a.type });
        }
      }
      const t = text.trim();
      if (t) parts.push({ type: 'text' as const, text: t });
      if (parts.length === 0) return;

      setMessages((prev) => {
        const userMsg: UIMessage = {
          id: generateId(),
          role: 'user',
          metadata: { offline: true },
          parts,
        };
        const withUser = [...prev, userMsg];
        const hadNoMessages = prev.length === 0;
        if (hadNoMessages) {
          if (t) {
            offlineWizardStateRef.current = {
              ...offlineWizardStateRef.current,
              initialUserPrompt: t,
            };
          }
          return [...withUser, ...getOfflineWizardBootstrapMessages(ctx, t)];
        }
        const { nextState, assistantMessages } = processOfflineWizardTurn(
          offlineWizardStateRef.current,
          text,
          ctx
        );
        offlineWizardStateRef.current = nextState;
        return [...withUser, ...assistantMessages];
      });
    },
    [offlineWizardContext, setMessages]
  );

  const routeUserChatTurn = useCallback(
    async (text: string, attachments?: { name: string; type: string; dataUrl: string }[]) => {
      if (isOffline || apiModeRef.current === 'offline') {
        appendOfflineExchange(text, attachments);
        return;
      }
      if (apiModeRef.current === 'online') {
        if (attachments && attachments.length > 0) {
          sendMessage({
            text,
            files: attachments.map((a) => ({
              type: 'file' as const,
              url: a.dataUrl,
              mediaType: a.type,
            })),
          });
        } else {
          sendMessage({ text });
        }
        return;
      }
      const ok = await checkCreateChatApiAvailable();
      if (!ok) {
        apiModeRef.current = 'offline';
        setIsOffline(true);
        appendOfflineExchange(text, attachments);
        return;
      }
      apiModeRef.current = 'online';
      if (attachments && attachments.length > 0) {
        sendMessage({
          text,
          files: attachments.map((a) => ({
            type: 'file' as const,
            url: a.dataUrl,
            mediaType: a.type,
          })),
        });
      } else {
        sendMessage({ text });
      }
    },
    [appendOfflineExchange, isOffline, sendMessage]
  );

  // Auto-send reference images from wizard as the first message
  const sentRefImages = useRef(false);
  useEffect(() => {
    if (sentRefImages.current) return;
    if (status !== 'ready') return;
    if (messages.length > 0 || initialMessages.length > 0) return;

    const key = `create-ref-images:${projectId}`;
    try {
      const stored = sessionStorage.getItem(key);
      if (!stored) return;
      sessionStorage.removeItem(key);
      sentRefImages.current = true;
      const images = JSON.parse(stored) as { name: string; type: string; dataUrl: string }[];
      if (images.length > 0) {
        void routeUserChatTurn(
          `Here are reference images for this project. Use them as visual inspiration and reference for the design style, mood, and imagery.`,
          images.map((img) => ({ name: img.name, type: img.type, dataUrl: img.dataUrl }))
        );
      }
    } catch { /* parse error — skip */ }
  }, [projectId, status, messages.length, initialMessages.length, routeUserChatTurn]);

  // First message from landing (create project → navigate with pending payload)
  const pendingFirstMessageSent = useRef(false);
  useEffect(() => {
    if (pendingFirstMessageSent.current) return;
    if (status !== 'ready' || !chatLoaded) return;
    if (messages.length > 0 || initialMessages.length > 0) return;

    const key = `create-pending-message:${projectId}`;
    try {
      const raw = sessionStorage.getItem(key);
      if (!raw) return;
      sessionStorage.removeItem(key);
      pendingFirstMessageSent.current = true;
      const payload = JSON.parse(raw) as {
        text: string;
        attachments?: { name: string; type: string; dataUrl: string }[];
      };
      if (payload.attachments && payload.attachments.length > 0) {
        void routeUserChatTurn(payload.text, payload.attachments);
      } else if (payload.text?.trim()) {
        void routeUserChatTurn(payload.text);
      }
    } catch {
      /* ignore */
    }
  }, [projectId, status, chatLoaded, messages.length, initialMessages.length, routeUserChatTurn]);

  // Restore offline wizard conversation from Start Here page
  const startHereRestored = useRef(false);
  useEffect(() => {
    if (startHereRestored.current) return;
    if (!chatLoaded) return;
    if (messages.length > 0 || initialMessages.length > 0) return;

    const key = `create-start-here-messages:${projectId}`;
    try {
      const raw = sessionStorage.getItem(key);
      if (!raw) return;
      sessionStorage.removeItem(key);
      startHereRestored.current = true;
      const restored = JSON.parse(raw) as UIMessage[];
      if (restored.length > 0) {
        apiModeRef.current = 'offline';
        setIsOffline(true);
        // Replay wizard state from the messages (wizard is already complete)
        offlineWizardStateRef.current = { ...offlineWizardStateRef.current, internalStep: 'complete' };
        setMessages(restored);
      }
    } catch { /* ignore */ }
  }, [projectId, chatLoaded, messages.length, initialMessages.length, setMessages]);

  const uploadPngAndUpdateAsset = useCallback(
    async (assetId: Id<'createAssets'>, blob: Blob, tldrawSnapshot: string) => {
      const uploadUrl = await generateUploadUrlMutation();
      const uploadRes = await fetch(uploadUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'image/png' },
        body: blob,
      });
      const { storageId } = await uploadRes.json();
      await updateAssetMutation({
        assetId,
        status: 'ready',
        capturedImageStorageId: storageId,
        tldrawSnapshot,
      });
    },
    [generateUploadUrlMutation, updateAssetMutation]
  );

  const astHasJioRibbon = useCallback((ast: unknown) => {
    const screens = extractScreens(ast);
    return screens.some((s) => s.components.some((c) => c.type === 'JioRibbon'));
  }, []);

  const jioRibbonOptionsForBrand = useCallback(
    (ast: unknown, ribbonFromConvex?: unknown) => {
      const isJioBrand = currentBrand?.name?.toLowerCase().includes('jio') ?? false;
      if (!isJioBrand || astHasJioRibbon(ast)) return undefined;
      if (isJioRibbon(ribbonFromConvex)) {
        return {
          jioRibbon: true as const,
          ribbonProps: {
            variant: ribbonFromConvex.variant,
            orientation: ribbonFromConvex.orientation,
            placement: ribbonFromConvex.placement,
            symbolPosition: ribbonFromConvex.symbolPosition,
            color1: ribbonFromConvex.color1,
            color2: ribbonFromConvex.color2,
            color3: ribbonFromConvex.color3,
          },
        };
      }
      return { jioRibbon: true as const, ribbonProps: { variant: 'dots-with-symbol' as const } };
    },
    [astHasJioRibbon, currentBrand?.name]
  );

  // ---- Process tool calls reactively from messages ----
  useEffect(() => {
    for (const msg of messages) {
      if (msg.role !== 'assistant' || !msg.parts) continue;

      for (const part of msg.parts) {
        const partAny = part as {
          type: string;
          toolCallId?: string;
          state?: string;
          input?: Record<string, unknown>;
          output?: unknown;
        };
        if (!partAny.type) continue;

        const toolName = getToolNameFromPartType(partAny.type);
        if (!toolName) continue;
        if (partAny.state !== 'output-available') continue;

        const key = partAny.toolCallId || `${msg.id}-${partAny.type}`;
        if (processedToolCalls.current.has(key)) continue;
        processedToolCalls.current.add(key);

        const input = partAny.input ?? {};

        if (toolName === 'set_project_metadata') {
          const { name, description, platforms, projectType } = input as {
            name: string;
            description: string;
            platforms: SocialPlatform[];
            projectType?: 'single' | 'campaign';
          };
          updateProject({
            projectId: typedProjectId,
            name,
            description,
            platforms,
            ...(projectType ? { type: projectType } : {}),
            status: 'active',
          });
        }

        if (toolName === 'generate_content_block') {
          const { layout } = input as { layout: unknown };
          // Store ContentBlock props for the capture pipeline
          if (layout && typeof layout === 'object') {
            latestContentBlockProps.current = layout as Record<string, unknown>;
          }
          const sorted = [...localAssets].sort((a, b) => b.updatedAt - a.updatedAt);
          const latest = sorted[0];
          if (latest?.id.length > 10) {
            updateAssetMutation({
              assetId: latest.id as Id<'createAssets'>,
              contentBlockData: layout,
            });
          }
        }

        if (toolName === 'generate_ribbon') {
          const { ribbon } = input as { ribbon: unknown };
          const sorted = [...localAssets].sort((a, b) => b.updatedAt - a.updatedAt);
          const latest = sorted[0];
          if (latest?.id.length > 10) {
            const snap = latest.tldrawSnapshot;
            const latestId = latest.id as Id<'createAssets'>;
            const dim = latest.dimension;
            void updateAssetMutation({
              assetId: latestId,
              ribbonData: ribbon,
            }).then(() => {
              if (snap && isJioRibbon(ribbon)) {
                enqueueCapture(async () => {
                  await updateAssetMutation({ assetId: latestId, status: 'capturing' });
                  try {
                    const { blob, snapshot } = await recaptureFromStoredSnapshot(snap, dim, {
                      jioRibbon: true,
                      ribbonProps: {
                        variant: ribbon.variant,
                        orientation: ribbon.orientation,
                        placement: ribbon.placement,
                        symbolPosition: ribbon.symbolPosition,
                        color1: ribbon.color1,
                        color2: ribbon.color2,
                        color3: ribbon.color3,
                      },
                    });
                    await uploadPngAndUpdateAsset(latestId, blob, snapshot);
                  } catch (e) {
                    await updateAssetMutation({
                      assetId: latestId,
                      status: 'error',
                      error: e instanceof Error ? e.message : 'Ribbon capture failed',
                    });
                  }
                });
              }
            });
          }
        }

        if (toolName === 'generate_asset_layout') {
          const { assetName, ast } = input as { assetName: string; ast: unknown };

          const dimension = getDimensionByName(assetName);
          if (!dimension) continue;

          const brandId = currentBrand?.id as Id<'brands'>;
          const isJioBrand = currentBrand?.name?.toLowerCase().includes('jio') ?? false;
          const autoRibbon: RibbonDataV1 | undefined = isJioBrand
            ? { version: 1, type: 'jio-dot-pattern', variant: 'dots-with-symbol' }
            : undefined;

          const ribbonOpts = jioRibbonOptionsForBrand(ast, autoRibbon);

          // Build ContentBlock capture options.
          // If the AST already has a ContentBlock component, the capture pipeline
          // detects it and places it directly. Otherwise, use stored props or
          // build default props from the dimension.
          const astScreens = extractScreens(ast);
          const astHasContentBlock = astScreens.some(
            (s) => s.components.some((c) => c.type === 'ContentBlock')
          );
          const contentBlockOpts = astHasContentBlock
            ? undefined
            : latestContentBlockProps.current
              ? {
                  contentBlock: true as const,
                  contentBlockProps: {
                    ...latestContentBlockProps.current,
                    canvasWidth: dimension.width,
                    canvasHeight: dimension.height,
                  },
                }
              : undefined;

          const captureOpts = {
            ...ribbonOpts,
            ...contentBlockOpts,
            foundationPlatformEntries,
          };

          const storedContentBlockData = latestContentBlockProps.current ?? undefined;

          if (brandId) {
            void createAsset({
              projectId: typedProjectId,
              brandId,
              name: assetName,
              platform: dimension.platform,
              dimensionName: dimension.name,
              width: dimension.width,
              height: dimension.height,
              category: dimension.category,
              html: '',
              css: '',
              imageSlots: [],
              status: 'rendering',
            }).then((assetId) => {
              const typedId = assetId as Id<'createAssets'>;
              if (autoRibbon) {
                void updateAssetMutation({ assetId: typedId, ribbonData: autoRibbon });
              }
              if (storedContentBlockData) {
                void updateAssetMutation({
                  assetId: typedId,
                  contentBlockData: storedContentBlockData,
                });
              }
              enqueueCapture(async () => {
                await updateAssetMutation({ assetId: typedId, status: 'capturing' });
                try {
                  const { blob, snapshot } = await captureLayoutToPngAndSnapshot(
                    ast,
                    { width: dimension.width, height: dimension.height, name: dimension.name },
                    captureOpts
                  );
                  await uploadPngAndUpdateAsset(typedId, blob, snapshot);
                } catch (e) {
                  await updateAssetMutation({
                    assetId: typedId,
                    status: 'error',
                    error: e instanceof Error ? e.message : 'Canvas capture failed',
                  });
                }
              });
            });
          }
        }

        if (toolName === 'modify_asset_layout') {
          const { assetId, ast } = input as { assetId: string; ast: unknown };
          const existing = localAssets.find((a) => a.id === assetId);
          if (!existing || existing.id.length < 10) continue;
          const typedId = existing.id as Id<'createAssets'>;
          const ribbonOpts = jioRibbonOptionsForBrand(ast, existing.ribbonData);

          void updateAssetMutation({ assetId: typedId, status: 'capturing' }).then(() => {
            enqueueCapture(async () => {
              try {
                const { blob, snapshot } = await captureLayoutToPngAndSnapshot(
                  ast,
                  {
                    width: existing.dimension.width,
                    height: existing.dimension.height,
                    name: existing.dimension.name,
                  },
                  { ...ribbonOpts, foundationPlatformEntries },
                );
                await uploadPngAndUpdateAsset(typedId, blob, snapshot);
              } catch (e) {
                await updateAssetMutation({
                  assetId: typedId,
                  status: 'error',
                  error: e instanceof Error ? e.message : 'Canvas capture failed',
                });
              }
            });
          });
        }

        if (toolName === 'adapt_design_layout') {
          const { masterAssetId, targetDimensionName, ast } = input as {
            masterAssetId: string;
            targetDimensionName: string;
            ast: unknown;
          };

          const dimension = getDimensionByName(targetDimensionName);
          if (!dimension) continue;

          let resolvedMasterId: string | undefined;
          if (masterAssetId.includes(' ') || masterAssetId.length < 10) {
            resolvedMasterId = localAssets.find(
              (a) => a.name === masterAssetId || a.dimension.name === masterAssetId
            )?.id;
          } else {
            resolvedMasterId = masterAssetId;
          }

          const masterAsset = resolvedMasterId
            ? localAssets.find((a) => a.id === resolvedMasterId)
            : undefined;

          const brandId = currentBrand?.id as Id<'brands'>;
          const isJioBrandAdapt = currentBrand?.name?.toLowerCase().includes('jio') ?? false;
          const inheritedRibbon =
            masterAsset?.ribbonData ??
            (isJioBrandAdapt
              ? ({ version: 1, type: 'jio-dot-pattern', variant: 'dots-with-symbol' } satisfies RibbonDataV1)
              : undefined);
          const ribbonOpts = jioRibbonOptionsForBrand(ast, inheritedRibbon);

          // Inherit ContentBlock data from master, adapting dimensions
          const inheritedContentBlock = masterAsset?.contentBlockData ?? latestContentBlockProps.current;
          const adaptedContentBlockOpts = inheritedContentBlock
            ? {
                contentBlock: true as const,
                contentBlockProps: {
                  ...(inheritedContentBlock as Record<string, unknown>),
                  canvasWidth: dimension.width,
                  canvasHeight: dimension.height,
                },
              }
            : undefined;

          const captureOpts = {
            ...ribbonOpts,
            ...adaptedContentBlockOpts,
            foundationPlatformEntries,
          };

          if (brandId) {
            void createAsset({
              projectId: typedProjectId,
              brandId,
              name: targetDimensionName,
              masterAssetId:
                resolvedMasterId && resolvedMasterId.length > 10
                  ? (resolvedMasterId as Id<'createAssets'>)
                  : undefined,
              platform: dimension.platform,
              dimensionName: dimension.name,
              width: dimension.width,
              height: dimension.height,
              category: dimension.category,
              html: '',
              css: '',
              imageSlots: [],
              contentBlockData: inheritedContentBlock ?? undefined,
              ribbonData: inheritedRibbon,
              status: 'rendering',
            }).then((assetId) => {
              const typedId = assetId as Id<'createAssets'>;
              enqueueCapture(async () => {
                await updateAssetMutation({ assetId: typedId, status: 'capturing' });
                try {
                  const { blob, snapshot } = await captureLayoutToPngAndSnapshot(
                    ast,
                    { width: dimension.width, height: dimension.height, name: dimension.name },
                    captureOpts
                  );
                  await uploadPngAndUpdateAsset(typedId, blob, snapshot);
                } catch (e) {
                  await updateAssetMutation({
                    assetId: typedId,
                    status: 'error',
                    error: e instanceof Error ? e.message : 'Canvas capture failed',
                  });
                }
              });
            });
          }
        }
      }
    }
  }, [
    messages,
    createAsset,
    updateAssetMutation,
    updateProject,
    enqueueCapture,
    captureLayoutToPngAndSnapshot,
    recaptureFromStoredSnapshot,
    uploadPngAndUpdateAsset,
    jioRibbonOptionsForBrand,
    currentBrand?.id,
    currentBrand?.name,
    typedProjectId,
    localAssets,
    foundationPlatformEntries,
  ]);

  // ---- Handlers ----
  const handleClarificationSubmit = useCallback(
    (answers: Record<string, string>) => {
      const lines = Object.entries(answers)
        .map(([k, v]) => `${k}: ${v}`)
        .join('\n');
      setErrorMessage(null);
      clearError();
      void routeUserChatTurn(`Here are my answers:\n${lines}`);
    },
    [routeUserChatTurn, clearError]
  );

  const handleSendMessage = useCallback(
    (text: string, attachments?: { name: string; type: string; dataUrl: string }[]) => {
      setErrorMessage(null);
      clearError();
      void routeUserChatTurn(text, attachments);
    },
    [routeUserChatTurn, clearError]
  );

  const handleHintClick = useCallback(
    (hint: string) => {
      setErrorMessage(null);
      clearError();
      void routeUserChatTurn(hint);
    },
    [routeUserChatTurn, clearError]
  );

  const handleEditDesign = useCallback((assetId: string) => {
    setSelectedAssetId(null);
    setEditingAssetId(assetId);
  }, []);

  const handleCanvasEditorSave = useCallback(
    async (assetId: string, snapshot: string, pngBlob: Blob) => {
      const typedId = assetId as Id<'createAssets'>;
      try {
        await updateAssetMutation({ assetId: typedId, status: 'capturing' });
        const uploadUrl = await generateUploadUrlMutation();
        const uploadRes = await fetch(uploadUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'image/png' },
          body: pngBlob,
        });
        const { storageId } = await uploadRes.json();
        await updateAssetMutation({
          assetId: typedId,
          status: 'ready',
          capturedImageStorageId: storageId,
          tldrawSnapshot: snapshot,
        });
      } catch (e) {
        await updateAssetMutation({
          assetId: typedId,
          status: 'error',
          error: e instanceof Error ? e.message : 'Save failed',
        });
      } finally {
        setEditingAssetId(null);
      }
    },
    [updateAssetMutation, generateUploadUrlMutation]
  );

  const handleDownload = useCallback((asset: CampaignAsset) => {
    if (!asset.capturedImageUrl) return;
    const a = document.createElement('a');
    a.href = asset.capturedImageUrl;
    a.download = `${asset.name.replace(/\s+/g, '-').toLowerCase()}-${asset.dimension.width}x${asset.dimension.height}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, []);

  /** Update ribbon positioning on a specific asset and trigger a re-capture. */
  const handleRibbonUpdate = useCallback(
    (asset: CampaignAsset, ribbonData: RibbonDataV1) => {
      const typedId = asset.id as Id<'createAssets'>;
      void updateAssetMutation({ assetId: typedId, ribbonData }).then(() => {
        const snap = asset.tldrawSnapshot;
        if (!snap) return;
        enqueueCapture(async () => {
          await updateAssetMutation({ assetId: typedId, status: 'capturing' });
          try {
            const { blob, snapshot } = await recaptureFromStoredSnapshot(
              snap,
              asset.dimension,
              {
                jioRibbon: true,
                ribbonProps: {
                  variant: ribbonData.variant,
                  orientation: ribbonData.orientation,
                  placement: ribbonData.placement,
                  symbolPosition: ribbonData.symbolPosition,
                  color1: ribbonData.color1,
                  color2: ribbonData.color2,
                  color3: ribbonData.color3,
                },
              },
            );
            await uploadPngAndUpdateAsset(typedId, blob, snapshot);
          } catch (e) {
            await updateAssetMutation({
              assetId: typedId,
              status: 'error',
              error: e instanceof Error ? e.message : 'Ribbon update failed',
            });
          }
        });
      });
    },
    [updateAssetMutation, enqueueCapture, recaptureFromStoredSnapshot, uploadPngAndUpdateAsset],
  );

  const handleExportAll = useCallback(() => {
    const readyAssets = localAssets.filter((a) => a.status === 'ready' && a.capturedImageUrl);
    for (const asset of readyAssets) handleDownload(asset);
  }, [localAssets, handleDownload]);

  /** Generate all remaining sizes for the project's platforms */
  const handleGenerateAllSizes = useCallback(() => {
    if (!project || status !== 'ready') return;
    if (isOffline) {
      setErrorMessage('Generate all sizes needs the AI service. In offline mode, pick multiple sizes in the guided wizard.');
      return;
    }
    if (project.type === 'single') {
      setErrorMessage('Switch this project to “Campaign” in settings to generate multiple sizes.');
      return;
    }

    // Find the first ready asset as the master
    const masterAsset = localAssets.find((a) => a.status === 'ready') ?? localAssets[0];
    if (!masterAsset) return;

    // Get all dimensions for project platforms
    const projectPlatforms = (project.platforms ?? []) as SocialPlatform[];
    const allDimensions = projectPlatforms.flatMap((p) => getDimensionsForPlatform(p));

    // Filter out dimensions that already have assets
    const existingDimensionNames = new Set(localAssets.map((a) => a.dimension.name));
    const missingDimensions = allDimensions.filter((d) => !existingDimensionNames.has(d.name));

    if (missingDimensions.length === 0) {
      setErrorMessage('All sizes have already been generated for the selected platforms.');
      return;
    }

    const dimensionList = missingDimensions
      .map((d) => `${d.name} (${d.width}x${d.height})`)
      .join(', ');

    sendMessage({
      text: `Adapt the current design "${masterAsset.name}" (asset ID: ${masterAsset.id}) to all remaining sizes: ${dimensionList}. Keep the same visual style and text content — output a new component AST per size with layout adjusted for each aspect ratio (use adapt_design_layout).`,
    });
  }, [project, status, localAssets, sendMessage, isOffline]);

  const handleDeleteAsset = useCallback(
    async (asset: CampaignAsset) => {
      if (asset.id.length > 10) {
        await removeAssetMutation({ assetId: asset.id as Id<'createAssets'> });
      }
      // Clear selection if the deleted asset was selected
      if (selectedAssetId === asset.id) setSelectedAssetId(null);
      if (editingAssetId === asset.id) setEditingAssetId(null);
    },
    [removeAssetMutation, selectedAssetId, editingAssetId]
  );

  const handleDismissError = useCallback(() => {
    setErrorMessage(null);
    clearError();
  }, [clearError]);

  // Loading state
  if (isLoading || !chatLoaded) {
    return (
      <div className={styles.page}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div style={{ width: 200, height: 24, background: 'var(--Surface-Subtle)', borderRadius: 'var(--Shape-3-5)' }} />
          </div>
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--Text-Low)' }}>
          Loading workspace...
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className={styles.page}>
        <div className={styles.emptyState}>
          <div className={styles.emptyStateTitle}>Project not found</div>
          <div className={styles.emptyStateDescription}>
            This project may have been deleted.
          </div>
        </div>
      </div>
    );
  }

  const hasAssets = localAssets.length > 0;
  const hasMessages = messages.length > 0;
  const displayError = errorMessage || error?.message;
  const selectedAsset = selectedAssetId ? localAssets.find((a) => a.id === selectedAssetId) ?? null : null;
  const readyCount = localAssets.filter((a) => a.status === 'ready').length;

  return (
    <div className={styles.page}>
      {/* Project Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <IconButton
            icon={<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 4l-6 6 6 6" /></svg>}
            attention="low"
            appearance="neutral"
            size="medium"
            aria-label="Back to projects"
            onPress={() => router.push('/create/projects')}
          />
          <h2 className={styles.campaignName}>{project.name}</h2>
          {isOffline ? (
            <span className={styles.offlineBadge} title="Guided wizard — AI chat API unavailable">
              Offline
            </span>
          ) : null}
          <div className={styles.badges}>
            <span className={styles.badge}>
              {project.type === 'single' ? 'Single asset' : 'Campaign'}
            </span>
            {(project.platforms ?? []).map((pid) => {
              const platform = PLATFORMS.find((p) => p.id === pid);
              return platform ? (
                <span key={pid} className={styles.badge}>{platform.label}</span>
              ) : null;
            })}
          </div>
        </div>
        <div className={styles.headerRight}>
          <IconButton
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>}
            attention="low"
            appearance="neutral"
            size="medium"
            aria-label="Project settings"
            onPress={() => setShowSettings(true)}
          />
          {localAssets.length > 0 && project.type === 'campaign' && (
            <Button
              attention="medium"
              appearance="neutral"
              disabled={status !== 'ready'}
              onPress={handleGenerateAllSizes}
            >
              Generate All Sizes
            </Button>
          )}
          {readyCount > 0 && (
            <Button attention="high" onPress={handleExportAll}>
              Export All ({readyCount})
            </Button>
          )}
        </div>
      </div>

      {/* Error banner */}
      {displayError && (
        <div className={styles.errorBanner}>
          <span>{displayError}</span>
          <Button attention="low" appearance="negative" onPress={handleDismissError}>Dismiss</Button>
        </div>
      )}

      {/* Main content */}
      {hasAssets || hasMessages ? (
        <div className={styles.splitLayout}>
          <CreateChatActionsContext.Provider
            value={{ onClarificationSubmit: handleClarificationSubmit }}
          >
            <CreateChatPanel
              messages={messages}
              status={status}
              onSendMessage={handleSendMessage}
              isOffline={isOffline}
            />
          </CreateChatActionsContext.Provider>
          <PreviewPanel
            assets={filteredAssets}
            allAssets={localAssets}
            activePlatform={activePlatformFilter}
            onPlatformFilter={setActivePlatformFilter}
            onDownload={handleDownload}
            onAssetClick={(asset) => setSelectedAssetId(asset.id)}
            onEditAsset={(asset) => handleEditDesign(asset.id)}
            onDeleteAsset={handleDeleteAsset}
          />
        </div>
      ) : (
        <div className={styles.emptyState}>
          <div className={styles.emptyStateContent}>
            <div className={styles.emptyStateTitle}>Start creating</div>
            <div className={styles.emptyStateDescription}>
              Describe what you want and AI will generate on-brand assets for {project.name}.
            </div>
            <div className={styles.emptyStateHints}>
              {getSuggestedPrompts(project.name, project.platforms ?? []).map((hint) => (
                <Button key={hint} attention="low" appearance="neutral" onPress={() => handleHintClick(hint)}>
                  {hint}
                </Button>
              ))}
            </div>
          </div>
          <CreateChatActionsContext.Provider
            value={{ onClarificationSubmit: handleClarificationSubmit }}
          >
            <CreateChatPanel
              messages={messages}
              status={status}
              onSendMessage={handleSendMessage}
              isOffline={isOffline}
              compact
            />
          </CreateChatActionsContext.Provider>
        </div>
      )}

      {/* Asset detail panel */}
      {selectedAsset && (
        <>
          <AssetDetailPanel
            asset={selectedAsset}
            onClose={() => setSelectedAssetId(null)}
            onDownload={handleDownload}
            onEditDesign={handleEditDesign}
            onRibbonUpdate={(data) => handleRibbonUpdate(selectedAsset, data)}
          />
          {(selectedAsset.contentBlockData != null ||
            (selectedAsset.ribbonData != null && !isJioRibbon(selectedAsset.ribbonData))) && (
            <div className={styles.structuralPreview}>
              {selectedAsset.ribbonData != null && !isJioRibbon(selectedAsset.ribbonData) ? (
                <RibbonRenderer
                  data={selectedAsset.ribbonData}
                  canvasWidth={selectedAsset.dimension.width}
                  canvasHeight={selectedAsset.dimension.height}
                />
              ) : null}
              {selectedAsset.contentBlockData != null ? (
                <ContentBlockRenderer data={selectedAsset.contentBlockData} />
              ) : null}
            </div>
          )}
        </>
      )}

      {/* Visual editor */}
      {editingAssetId &&
        (() => {
          const editingAsset = localAssets.find((a) => a.id === editingAssetId);
          const typoConfig = foundationData?.typography?.config as
            | { baseSize?: number; scaleFactor?: number; styles?: { name: string; fontSize: number }[] }
            | undefined;
          const scaleInfo = typoConfig?.baseSize
            ? `Base ${typoConfig.baseSize}px / ${typoConfig.scaleFactor}x`
            : typoConfig?.styles?.length
              ? `${typoConfig.styles.length} styles`
              : 'defaults';
          const contextInfo = `${currentBrand?.name ?? 'No brand'} | ${platform} | ${density} | Type: ${scaleInfo}`;
          return editingAsset ? (
            <CreateCanvasEditor
              asset={editingAsset}
              artboardPresets={CREATE_ARTBOARD_PRESETS}
              foundationPlatforms={foundationPlatformEntries}
              availableSubBrands={artboardSubBrandOptions}
              brandFoundationDataForSubBrands={
                platformOverview as Record<string, unknown> | null | undefined
              }
              theme={theme}
              contextInfo={contextInfo}
              onSave={handleCanvasEditorSave}
              onCancel={() => setEditingAssetId(null)}
            />
          ) : null;
        })()}

      {/* Project settings panel */}
      {showSettings && project && (
        <ProjectSettingsPanel
          project={project}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* Hidden tldraw capture surface (thumbnail pipeline) */}
      <div className={styles.hiddenCaptureCanvas} aria-hidden="true">
        <ExperienceCanvas
          artboardPresets={CREATE_ARTBOARD_PRESETS}
          foundationPlatforms={foundationPlatformEntries}
          availableSubBrands={artboardSubBrandOptions}
          brandFoundationDataForSubBrands={
            platformOverview as Record<string, unknown> | null | undefined
          }
          mode={theme}
          onEditorReady={onCaptureEditorReady}
          canvasBackground="neutral"
        />
      </div>
    </div>
  );
}
