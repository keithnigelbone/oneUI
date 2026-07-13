/**
 * Create section — Type Definitions
 */

// ============================================================================
// Social Platforms
// ============================================================================

export type SocialPlatform =
  | 'instagram'
  | 'facebook'
  | 'youtube'
  | 'tiktok'
  | 'linkedin'
  | 'twitter';

export type AssetType = 'social-post' | 'ad-banner' | 'story-reel';

export interface AssetDimension {
  name: string;
  width: number;
  height: number;
  platform: SocialPlatform;
  category: 'post' | 'story' | 'cover' | 'ad' | 'profile' | 'banner' | 'thumbnail' | 'video';
}

// ============================================================================
// Campaign
// ============================================================================

export interface CampaignMetadata {
  name: string;
  description: string;
  platforms: SocialPlatform[];
  assetTypes: string[];
}

// ============================================================================
// Assets
// ============================================================================

export type AssetStatus = 'generating' | 'rendering' | 'capturing' | 'ready' | 'error';

export interface ImageSlot {
  id: string;
  prompt: string;
  imageBase64?: string;
  storageId?: string;
  imageUrl?: string;
  mimeType?: string;
  status: 'pending' | 'generating' | 'ready' | 'error';
  error?: string;
}

export interface CampaignAsset {
  id: string;
  name: string;
  dimension: AssetDimension;
  html: string;
  css: string;
  imageSlots: ImageSlot[];
  capturedImageUrl?: string;
  status: AssetStatus;
  error?: string;
  createdAt: number;
  updatedAt: number;
  contentBlockData?: unknown;
  ribbonData?: unknown;
  tldrawSnapshot?: string;
}

// ============================================================================
// Campaign State
// ============================================================================

export interface CampaignState {
  metadata: CampaignMetadata | null;
  assets: CampaignAsset[];
  activePlatformFilter: SocialPlatform | 'all';
}

export type CampaignAction =
  | { type: 'SET_METADATA'; payload: CampaignMetadata }
  | { type: 'ADD_ASSET'; payload: CampaignAsset }
  | { type: 'UPDATE_ASSET'; payload: { id: string; updates: Partial<CampaignAsset> } }
  | { type: 'REMOVE_ASSET'; payload: string }
  | { type: 'SET_PLATFORM_FILTER'; payload: SocialPlatform | 'all' }
  | { type: 'SET_IMAGE_SLOT'; payload: { assetId: string; slotId: string; updates: Partial<ImageSlot> } }
  | { type: 'RESET' };

// ============================================================================
// Brand Context (passed to API)
// ============================================================================

export interface BrandContext {
  brandName: string;
  theme: 'light' | 'dark';
  tokenFamilies: string[];
  primaryFont?: string;
  secondaryFont?: string;
  /** Compiled voice system prompt section (from voice rules engine) */
  voicePrompt?: string;
  /** Compiled composition system prompt section (from composition rules engine) */
  compositionPrompt?: string;
}

// ============================================================================
// Project Context
// ============================================================================

export interface CreateProjectContext {
  name: string;
  description?: string;
  platforms: SocialPlatform[];
  audience?: string;
  tone?: string;
  brief?: string;
  assetType?: AssetType;
  projectType?: 'single' | 'campaign';
}
