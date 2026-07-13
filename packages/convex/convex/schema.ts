import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';
import { metallicConfigValidator } from './materialValidators';

const materialAssignmentsValidator = v.record(v.string(), v.string());

const appearanceMaterialsValidator = v.optional(v.object({
  materialAssignments: v.optional(materialAssignmentsValidator),
}));

export default defineSchema({
  // Brand configurations
  brands: defineTable({
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    icon: v.optional(v.string()),
    logoSvg: v.optional(v.string()), // SVG logo content
    primaryHue: v.number(),
    primaryChroma: v.number(),
    secondaryHue: v.number(),
    secondaryChroma: v.number(),
    status: v.union(v.literal('active'), v.literal('draft'), v.literal('deprecated')),
    isSystem: v.optional(v.boolean()), // True for platform-managed brands (e.g., One UI Theme)
    baseBrand: v.optional(v.id('brands')),
    team: v.optional(v.array(v.string())),
    createdBy: v.optional(v.id('users')), // RBAC: brand owner (the editor who created it). Optional for back-compat.
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_slug', ['slug'])
    .index('by_status', ['status']),

  // ─── RBAC: real auth + per-brand roles ─────────────────────────────────
  // Identity comes from Better Auth (convex/auth.ts). These tables hold
  // AUTHORIZATION. `users` mirrors the Better Auth user (on first authenticated
  // call) so brandMembers can reference it and store a global platformRole.
  // Enforced server-side in convex/lib/auth.ts (requireBrandRole / requirePlatformOwner).
  users: defineTable({
    // Stable Better Auth user id — authComponent.getAuthUser(ctx)._id.
    authUserId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    // Platform tier. 'owner' = super-admin (bypasses all per-brand checks);
    // 'creator' = may create their own brands (becomes their admin); 'member' =
    // viewer-only default for self-registration (no create, access by invitation).
    platformRole: v.union(v.literal('owner'), v.literal('creator'), v.literal('member')),
    createdAt: v.number(),
  })
    .index('by_authUserId', ['authUserId'])
    .index('by_email', ['email']),

  // Per-brand role grants. A user may hold different roles across brands.
  brandMembers: defineTable({
    brandId: v.id('brands'),
    userId: v.id('users'),
    role: v.union(v.literal('admin'), v.literal('editor'), v.literal('viewer')),
    invitedBy: v.optional(v.id('users')),
    createdAt: v.number(),
  })
    .index('by_brand', ['brandId'])
    .index('by_user', ['userId'])
    .index('by_brand_and_user', ['brandId', 'userId']),

  // Pending email invitations to a brand with a role. Accepting creates a brandMembers row.
  brandInvites: defineTable({
    brandId: v.id('brands'),
    email: v.string(),
    role: v.union(v.literal('admin'), v.literal('editor'), v.literal('viewer')),
    token: v.string(),
    invitedBy: v.id('users'),
    expiresAt: v.number(),
    createdAt: v.number(),
  })
    .index('by_token', ['token'])
    .index('by_brand', ['brandId'])
    .index('by_email', ['email']),

  // Pending email invitations to the PLATFORM at a global tier. Distinct from
  // brandInvites (per-brand access): accepting sets the accepting user's
  // `users.platformRole` to the invited tier. Owner-issued, delivered in-app
  // (no email provider) — the invitee signs in with this email and accepts.
  platformInvites: defineTable({
    email: v.string(),
    role: v.union(v.literal('owner'), v.literal('creator'), v.literal('member')),
    token: v.string(),
    invitedBy: v.id('users'),
    expiresAt: v.number(),
    createdAt: v.number(),
  })
    .index('by_token', ['token'])
    .index('by_email', ['email']),

  // Design tokens
  tokens: defineTable({
    name: v.string(),
    category: v.string(),
    value: v.string(),
    mode: v.union(v.literal('light'), v.literal('dark'), v.literal('dim')),
    brandId: v.id('brands'),
    description: v.optional(v.string()),
    deprecated: v.optional(v.boolean()),
    figmaId: v.optional(v.string()), // Figma variable ID for sync tracking
    figmaKey: v.optional(v.string()), // Figma variable key
    source: v.optional(v.union(v.literal('figma'), v.literal('foundation'), v.literal('manual'))), // Token origin
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_brand', ['brandId'])
    .index('by_brand_mode', ['brandId', 'mode']) // Compound index for filtering by brand + mode
    .index('by_brand_category', ['brandId', 'category']) // Compound index for filtering by brand + category
    .index('by_brand_category_mode', ['brandId', 'category', 'mode']) // Compound index for filtering by all three
    .index('by_category', ['category'])
    .index('by_name_mode', ['name', 'mode'])
    .index('by_figma_id', ['figmaId'])
    .index('by_source', ['brandId', 'source']),

  // Token overrides (brand-specific)
  tokenOverrides: defineTable({
    brandId: v.id('brands'),
    componentName: v.optional(v.string()), // e.g., 'Button', 'IconButton' - for Component Token Editor
    tokenName: v.string(),
    mode: v.string(),
    value: v.string(),
    scope: v.optional(v.string()), // 'global' | 'state' | 'variant' | combined scopes — omitted means 'global'
    target: v.optional(v.object({
      variant: v.optional(v.string()),
      state: v.optional(v.string()),
      size: v.optional(v.string()),
      mediaContext: v.optional(v.string()),
    })),
    channel: v.optional(v.string()), // fill | stroke | text | underline
    valueKind: v.optional(v.string()), // token | material | transparent | none
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_brand', ['brandId'])
    .index('by_token', ['tokenName'])
    .index('by_brand_token_mode', ['brandId', 'tokenName', 'mode'])
    .index('by_brand_component', ['brandId', 'componentName']),

  // Sync history
  syncHistory: defineTable({
    brandId: v.id('brands'),
    source: v.string(),
    sourceDetails: v.optional(
      v.object({
        fileKey: v.string(),
        fileName: v.optional(v.string()),
        collectionsProcessed: v.optional(v.array(v.string())),
      })
    ),
    tokensAdded: v.number(),
    tokensUpdated: v.number(),
    tokensRemoved: v.number(),
    tokenDetails: v.optional(
      v.object({
        addedNames: v.array(v.string()),
        updatedNames: v.array(v.string()),
        removedNames: v.array(v.string()),
      })
    ),
    status: v.union(v.literal('success'), v.literal('failed'), v.literal('partial')),
    errorMessage: v.optional(v.string()),
    syncedBy: v.optional(v.string()),
    durationMs: v.optional(v.number()),
    syncedAt: v.number(),
  }).index('by_brand', ['brandId']),

  // Audit logs
  auditLogs: defineTable({
    action: v.string(),
    resourceType: v.string(),
    resourceId: v.string(),
    changes: v.optional(v.any()),
    createdAt: v.number(),
    createdBy: v.optional(v.string()),
  })
    .index('by_resource', ['resourceType', 'resourceId'])
    .index('by_action', ['action']),

  // Figma connections for OAuth tokens
  figmaConnections: defineTable({
    brandId: v.id('brands'),
    userId: v.string(),
    encryptedAccessToken: v.string(),
    encryptedRefreshToken: v.string(),
    tokenExpiresAt: v.number(),
    fileKey: v.string(),
    fileName: v.optional(v.string()),
    lastSyncedAt: v.optional(v.number()),
    status: v.union(
      v.literal('active'),
      v.literal('expired'),
      v.literal('revoked')
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_brand', ['brandId'])
    .index('by_status', ['status']),

  // ============================================
  // FOUNDATIONS - Multi-brand design system configs
  // ============================================

  // Foundation master configurations
  foundations: defineTable({
    brandId: v.id('brands'),
    type: v.union(
      v.literal('color'),
      v.literal('surfaces'),
      v.literal('typography'),
      v.literal('spacing'), // Legacy - use 'dimension' for new implementations
      v.literal('dimension'),
      v.literal('shape'),
      v.literal('elevation'),
      v.literal('motion'),
      v.literal('icons'),
      v.literal('materials'),
      v.literal('platforms'),
      v.literal('voice'),
      v.literal('grid'),
      v.literal('gradients')
    ),
    config: v.any(), // Type-specific JSON configuration
    version: v.number(),
    algorithmVersion: v.optional(v.number()), // 2 = V4 (current and only supported)
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_brand', ['brandId'])
    .index('by_brand_type', ['brandId', 'type'])
    .index('by_brand_active', ['brandId', 'isActive']),

  // Color scales (25-step OkLCH scales: 100-2500)
  colorScales: defineTable({
    brandId: v.id('brands'),
    name: v.string(), // "primary", "secondary", "neutral", "success", etc.
    baseColor: v.string(), // Original hex color input (e.g., "#FF5500")
    hue: v.number(), // 0-360 (extracted from baseColor)
    chroma: v.number(), // 0-0.4 (scale chroma cap - no non-base step exceeds this)
    baseStep: v.number(), // Auto-detected from lightness (100-2500)
    baseLightness: v.number(), // 0-100 (extracted from baseColor)
    // When true, the base step's {l, c, h, hex} is pinned to `lockedBaseOklch`
    // and will not drift when the user moves the Chroma or Hue sliders. See
    // the "lock base color" feature in packages/shared/src/utils/colorScale.
    lockBase: v.optional(v.boolean()),
    lockedBaseOklch: v.optional(
      v.object({
        l: v.number(), // 0-100
        c: v.number(), // 0-0.4
        h: v.number(), // 0-360
      }),
    ),
    steps: v.array(
      v.object({
        step: v.number(), // 100, 200, 300... 2500 (25 steps)
        lightness: v.number(), // 0-100
        chroma: v.number(), // Computed chroma at this step (never exceeds base)
        hue: v.number(), // 0-360 (with minimal shift for perceptual consistency)
        oklch: v.string(), // "oklch(50% 0.18 340)"
        hex: v.string(), // "#FF5500"
        isBase: v.boolean(), // True for the base step position
      })
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_brand', ['brandId'])
    .index('by_brand_name', ['brandId', 'name']),

  // Sub-brand configurations (theme variants of a parent brand)
  // Each sub-brand defines 4 locked color roles: primary, secondary, sparkle, brand-bg.
  // Stored separately from brands — sub-brands inherit all other foundations from the parent.
  subBrandConfigs: defineTable({
    parentBrandId: v.id('brands'),
    name: v.string(),
    slug: v.string(),
    primary:    v.object({ scaleName: v.string(), baseStep: v.number() }),
    secondary:  v.object({ scaleName: v.string(), baseStep: v.number() }),
    sparkle:    v.object({ scaleName: v.string(), baseStep: v.number() }),
    brandBg: v.object({
      scaleName: v.string(),
      backgroundStep: v.object({ light: v.number(), dark: v.number() }),
    }),
    materials: appearanceMaterialsValidator,
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index('by_parent_brand', ['parentBrandId']),

  // Supabase sync metadata for published library themes → sub-brands
  supabaseSyncMeta: defineTable({
    parentBrandId: v.id('brands'),
    supabaseThemeId: v.string(), // UUID from Supabase `themes.id`
    subBrandConfigId: v.id('subBrandConfigs'),
    supabaseProjectName: v.string(), // e.g. "JioTV"
    lastSyncedAt: v.number(),
  })
    .index('by_parent_brand', ['parentBrandId'])
    .index('by_supabase_theme', ['supabaseThemeId']),

  // Appearance configuration (multi-accent theme color mapping)
  // Defines which color scales map to accent roles and how backgrounds work per mode
  appearanceConfigs: defineTable({
    brandId: v.id('brands'),
    accentCount: v.number(), // 1 | 2 | 3 | 4
    background: v.object({
      scaleName: v.string(),
      backgroundStep: v.object({
        light: v.number(),
        dark: v.number(),
        dim: v.optional(v.number()), // V4 dropped dim — kept optional for backward compat
      }),
    }),
    accents: v.array(v.object({
      role: v.string(),        // "primary" | "secondary" | "sparkle" | "brand-bg" | "neutral" | "positive" | "negative" | "warning" | "informative"
      label: v.string(),       // Display name (customizable)
      scaleName: v.string(),   // Color scale name from brand's color foundation
      baseStep: v.number(),    // Bold surface step (200-2500)
    })),
    // Optional logo color override — when set, drives --Logo-color in brand CSS.
    // When absent, logo falls back to --Primary-FG-Bold via the Logo component's CSS.
    logo: v.optional(v.object({
      scaleName: v.string(),
      baseStep: v.number(),
    })),
    materials: appearanceMaterialsValidator,
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index('by_brand', ['brandId']),

  // Surface token mappings (semantic color mappings per mode)
  // Token names follow pattern: {Appearance}-{SurfaceLevel}
  // - Appearances: Primary, Secondary, Sparkle, Background
  // - Surface levels: Ghost, Subtle, Default, Bold (except Background which is single)
  surfaceTokenMappings: defineTable({
    brandId: v.id('brands'),
    tokenName: v.string(), // "Primary-Bold", "Secondary-Subtle", "Background", etc.
    lightModeStep: v.string(), // e.g., "Primary-1300" or "Neutral-2500"
    darkModeStep: v.string(),
    dimModeStep: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index('by_brand', ['brandId']),

  // Text token mappings
  textTokenMappings: defineTable({
    brandId: v.id('brands'),
    tokenName: v.string(), // "Text-High", "Text-Medium", "Text-Low", "Text-OnBold-High"
    lightModeStep: v.string(),
    darkModeStep: v.string(),
    dimModeStep: v.string(),
    contrastRatio: v.optional(v.number()), // WCAG contrast ratio
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index('by_brand', ['brandId']),

  // Typography lives entirely on `foundations` (type='typography').
  // The legacy `typographyConfigs` and `typographyV2Configs` tables were
  // removed on 2026-05-05 — V2 data is stored at
  // `foundations.config.typographyV2`. See docs/typography-token-map.md.

  // Spacing configurations (per density) - LEGACY
  // Prefer dimensionConfigs for new implementations
  spacingConfigs: defineTable({
    brandId: v.id('brands'),
    density: v.string(), // "compact", "default", "open"
    baseValue: v.number(), // M value in px (default 16)
    scale: v.array(
      v.object({
        token: v.string(), // legacy spacing token id; normalized to numeric tokens at API boundaries
        value: v.number(), // px value
        responsive: v.optional(
          v.object({
            min: v.number(), // min viewport value
            max: v.number(), // max viewport value
          })
        ),
      })
    ),
    viewportMin: v.number(), // 360
    viewportMax: v.number(), // 1920
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_brand', ['brandId'])
    .index('by_brand_density', ['brandId', 'density']),

  // Dimension configurations (unified f-scale system)
  // Replaces separate spacing/typography scale configs with unified DIN 1450-based system
  // The f-scale (f-8 to f16, plus f2-5) is the single source of truth for all dimension tokens
  dimensionConfigs: defineTable({
    brandId: v.id('brands'),
    density: v.string(), // "compact", "default", "open"

    // Mobile platform configuration
    mobile: v.object({
      viewingDistance: v.number(), // cm (default 30)
      ppi: v.number(), // pixels per inch (default 458)
      pixelDensity: v.number(), // @1x, @2x, @3x (default 3)
      baseSize: v.number(), // Calculated or override base size in px
      scaleFactor: v.number(), // Scale multiplier (e.g., 1.125)
    }),

    // Desktop platform configuration
    desktop: v.object({
      viewingDistance: v.number(), // cm (default 50)
      ppi: v.number(), // pixels per inch (default 100)
      pixelDensity: v.number(), // @1x, @2x, @3x (default 1)
      baseSize: v.number(), // Calculated or override base size in px
      scaleFactor: v.number(), // Scale multiplier (e.g., 1.185)
    }),

    // Generated f-scale values (cached for performance)
    fScale: v.optional(
      v.array(
        v.object({
          step: v.string(), // "f-8" to "f16", plus "f2-5"
          mobileValue: v.number(), // px value at mobile
          desktopValue: v.number(), // px value at desktop
          isResponsive: v.boolean(), // Whether this step uses clamp()
          spacingToken: v.optional(v.string()), // Mapped spacing token name if applicable
        })
      )
    ),

    // Viewport range for responsive interpolation
    viewportMin: v.number(), // 360
    viewportMax: v.number(), // 1920

    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_brand', ['brandId'])
    .index('by_brand_density', ['brandId', 'density']),

  // Shape configurations
  // DEPRECATED (2026-06): no reads or writes remain — shape t-shirt sizes derive
  // from dimension f-steps and Shape-Pill is a fixed constant; brand shape intent
  // lives in componentThemeSelections (shapeLanguage decisions). Table kept one
  // deploy cycle for existing data; drop in a follow-up schema migration.
  shapeConfigs: defineTable({
    brandId: v.id('brands'),
    interactiveShape: v.number(), // 9999 (Pill) - locked for interactive elements
    scale: v.array(
      v.object({
        token: v.string(), // "6XS", "5XS", "4XS", "3XS", "2XS", "XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL", "6XL"
        value: v.number(), // border-radius in px (deprecated — shapes now use f-step refs)
      })
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index('by_brand', ['brandId']),

  // Elevation configurations
  elevationConfigs: defineTable({
    brandId: v.id('brands'),
    levels: v.array(
      v.object({
        level: v.number(), // 0-5
        keyLight: v.object({
          yOffset: v.number(),
          blur: v.number(),
          opacity: v.number(),
        }),
        ambientLight: v.object({
          yOffset: v.number(),
          blur: v.number(),
          opacity: v.number(),
        }),
        darkModeStroke: v.optional(
          v.object({
            color: v.string(),
            opacity: v.number(),
          })
        ),
      })
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index('by_brand', ['brandId']),

  // Motion configurations
  // Stores ONE base duration (Moderate L) — all 37 tokens are computed from it.
  // Easings are stored per type; brands can customise values within type rules.
  //
  // BREAKING CHANGE (2026-04-03): Schema replaced the legacy Discreet/Expressive
  // model with the Jio specification. Any deployment that held pre-2026-04-03
  // rows must wipe the motionConfigs table before the new schema can validate.
  // Rerun brand createDefaults (or brands.ts seedBrands) to repopulate.
  motionConfigs: defineTable({
    brandId: v.id('brands'),
    // The Moderate L duration (ms). All other duration/offset steps are derived
    // via a fixed 1.5x ratio. Jio default: 300ms.
    baseDuration: v.number(),
    easings: v.object({
      entrance: v.object({ moderate: v.string(), subtle: v.string() }),
      exit: v.object({ moderate: v.string(), subtle: v.string() }),
      transition: v.object({ moderate: v.string(), subtle: v.string() }),
      bounce: v.object({ moderate: v.string(), subtle: v.string() }),
      linear: v.string(), // always 'linear'
    }),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index('by_brand', ['brandId']),

  // Material configurations (translucent, frosted, glass, metallic)
  materialConfigs: defineTable({
    brandId: v.id('brands'),

    // Translucent material settings (opacity values 0-1)
    translucent: v.object({
      light: v.object({
        minimal: v.number(), // 0.10
        subtle: v.number(), // 0.25
        moderate: v.number(), // 0.50
        heavy: v.number(), // 0.75
      }),
      dark: v.object({
        minimal: v.number(), // 0.10
        subtle: v.number(), // 0.25
        moderate: v.number(), // 0.50
        heavy: v.number(), // 0.75
      }),
    }),

    // Frosted material settings
    frosted: v.object({
      blur: v.object({
        ultraThin: v.number(), // 4px
        thin: v.number(), // 8px
        regular: v.number(), // 16px
        thick: v.number(), // 24px
        ultraThick: v.number(), // 32px
      }),
      backgroundOpacity: v.object({
        ultraThin: v.number(), // 0.30
        thin: v.number(), // 0.50
        regular: v.number(), // 0.65
        thick: v.number(), // 0.75
        ultraThick: v.number(), // 0.85
      }),
    }),

    // Glass material settings (Liquid Glass inspired)
    glass: v.object({
      blur: v.object({
        regular: v.number(), // 20px
        clear: v.number(), // 12px
      }),
      saturation: v.object({
        regular: v.number(), // 180
        clear: v.number(), // 150
      }),
      highlightIntensity: v.object({
        minimal: v.number(), // 0.12
        moderate: v.number(), // 0.25
        strong: v.number(), // 0.40
      }),
      tintOpacity: v.object({
        light: v.number(), // 0.45
        dark: v.number(), // 0.45
      }),
    }),

    // Metallic presets (gradient color stops + direction)
    metallic: metallicConfigValidator,

    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index('by_brand', ['brandId']),

  // ============================================
  // BRAND ORNAMENTS & COMPONENT DECORATIONS
  // ============================================

  // Ornament assets uploaded by brand creators (decorative SVG elements)
  brandOrnaments: defineTable({
    brandId: v.id('brands'),
    name: v.string(),
    svgContent: v.string(),
    aspectRatio: v.number(),
    category: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index('by_brand', ['brandId']),

  // Which ornament is assigned to which component for a brand
  componentDecorations: defineTable({
    brandId: v.id('brands'),
    componentName: v.string(),
    ornamentId: v.id('brandOrnaments'),
    placement: v.string(),
    mirror: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index('by_brand_component', ['brandId', 'componentName']),

  // ============================================
  // COMPONENT RECIPE SELECTIONS
  // ============================================

  componentRecipeSelections: defineTable({
    brandId: v.id('brands'),
    componentName: v.string(),
    selections: v.any(), // Record<string, string> — decision ID -> selected option
    updatedAt: v.number(),
  }).index('by_brand_component', ['brandId', 'componentName']),

  // ============================================
  // COMPONENT THEME SELECTIONS
  // ============================================

  componentThemeSelections: defineTable({
    brandId: v.id('brands'),
    familyId: v.string(),
    selections: v.any(), // Record<string, string> — family decision ID -> selected option
    updatedAt: v.number(),
  }).index('by_brand_family', ['brandId', 'familyId']),

  // Machine-readable component documentation overrides.
  // Stores partial overrides so authored baseline in repo remains the source of truth.
  componentDocOverrides: defineTable({
    brandId: v.id('brands'),
    componentName: v.string(),
    override: v.any(), // Partial<ComponentDocumentationSpec>
    updatedAt: v.number(),
    updatedBy: v.optional(v.string()),
  }).index('by_brand_component', ['brandId', 'componentName']),

  // ============================================
  // BRAND CSS CACHE - Pre-computed brand CSS
  // ============================================

  // Cached pre-computed brand CSS for fast injection.
  // Computed server-side when foundations or appearance configs change.
  // Client uses cached CSS as fast path (no recomputation), falls back to client-side.
  brandCSSCache: defineTable({
    brandId: v.id('brands'),
    theme: v.union(v.literal('light'), v.literal('dark')),
    /** Raw CSS declarations (without selector wrapper) */
    rawCSS: v.string(),
    /** Surface context CSS — [data-surface] blocks (new algorithm only) */
    contextCSS: v.optional(v.string()),
    /** CSS size in bytes */
    cssSize: v.number(),
    /** Token count in the CSS */
    tokenCount: v.number(),
    /** Algorithm version used to generate this CSS */
    algorithmVersion: v.number(),
    /** Hash of input data (color config + appearance config) for cache invalidation */
    inputHash: v.string(),
    /** Validation result at time of caching */
    isValid: v.boolean(),
    computedAt: v.number(),
  })
    .index('by_brand_theme', ['brandId', 'theme'])
    .index('by_brand', ['brandId']),

  // ============================================
  // BRAND PUBLICATIONS - Published brand CSS snapshots
  // ============================================
  brandPublications: defineTable({
    brandId: v.id('brands'),
    /** Semantic version (e.g. "1.0.0") */
    version: v.string(),
    /** Light theme CSS (full, with @layer brand wrapper) */
    lightCSS: v.string(),
    /** Dark theme CSS (full, with @layer brand wrapper) */
    darkCSS: v.string(),
    /** Algorithm version at time of publication */
    algorithmVersion: v.number(),
    /** Input hash for change detection */
    inputHash: v.string(),
    /** Token count in light CSS */
    tokenCount: v.number(),
    /** Total CSS size (light + dark) in bytes */
    cssSize: v.number(),
    /** Publication timestamp */
    publishedAt: v.number(),
    /** Optional release notes */
    notes: v.optional(v.string()),
  })
    .index('by_brand', ['brandId'])
    .index('by_brand_version', ['brandId', 'version']),

  // ============================================
  // PRESET COLOR SCALES - System-wide color palettes
  // ============================================

  // Preset color scale collections (uploaded via JSON)
  // These are read-only system-level scales that brands can select from
  presetColorScaleCollections: defineTable({
    name: v.string(), // Collection name, e.g., "Jio Default", "Material Design"
    description: v.optional(v.string()),
    version: v.string(), // e.g., "v1010"
    isDefault: v.boolean(), // Whether this is the default collection
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_name', ['name'])
    .index('by_default', ['isDefault']),

  // Individual preset color scales within a collection
  // Each scale has 25 fixed steps (100-2500) in OkLCH format
  presetColorScales: defineTable({
    collectionId: v.id('presetColorScaleCollections'),
    name: v.string(), // Scale name, e.g., "sand", "yellow", "gold", "red"
    baseStep: v.string(), // The step where base color sits, e.g., "1700", "2100"
    steps: v.array(
      v.object({
        step: v.string(), // "100", "200", ..., "2500"
        oklch: v.string(), // "oklch(50% 0.18 340)" format
      })
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_collection', ['collectionId'])
    .index('by_collection_name', ['collectionId', 'name']),

  // Brand's selected preset scales
  // Links brands to specific preset scales they've chosen to use
  brandPresetScaleSelections: defineTable({
    brandId: v.id('brands'),
    collectionId: v.id('presetColorScaleCollections'),
    selectedScales: v.array(v.string()), // Array of scale names from the collection
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_brand', ['brandId'])
    .index('by_collection', ['collectionId']),

  // ============================================
  // SAVED LIGHTNESS SCALES - User-saved custom scales
  // ============================================

  // User-saved lightness scale presets
  // Custom lightness distributions that users can save and reuse
  savedLightnessScales: defineTable({
    name: v.string(), // User-defined name, e.g., "High Contrast", "Soft Fade"
    description: v.optional(v.string()),
    // Record of step (100-2500) to lightness value (0-100)
    // Using v.any() because keys are numeric strings
    values: v.any(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_name', ['name']),

  // ============================================
  // CUSTOM FONTS - User-uploaded fonts (global)
  // ============================================

  // ============================================
  // EXPERIENCE BUILDER — Campaign Management
  // ============================================

  // Campaign projects (containers for assets)
  campaigns: defineTable({
    brandId: v.id('brands'),
    name: v.string(),
    description: v.optional(v.string()),
    type: v.union(
      v.literal('campaign'),
      v.literal('app'),
      v.literal('outdoor'),
      v.literal('print')
    ),
    status: v.union(
      v.literal('draft'),
      v.literal('active'),
      v.literal('completed'),
      v.literal('archived')
    ),
    platforms: v.array(
      v.union(
        v.literal('instagram'),
        v.literal('facebook'),
        v.literal('youtube'),
        v.literal('tiktok'),
        v.literal('linkedin'),
        v.literal('twitter')
      )
    ),
    // Progressive disclosure fields (optional)
    audience: v.optional(v.string()),
    tone: v.optional(v.string()),
    objectives: v.optional(v.array(v.string())),
    brief: v.optional(v.string()),
    assetType: v.optional(v.union(v.literal('social-post'), v.literal('ad-banner'), v.literal('story-reel'))),
    setupComplete: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_brand', ['brandId'])
    .index('by_brand_status', ['brandId', 'status'])
    .index('by_brand_type', ['brandId', 'type']),

  // Generated design assets
  campaignAssets: defineTable({
    campaignId: v.id('campaigns'),
    brandId: v.id('brands'),
    name: v.string(),
    masterAssetId: v.optional(v.id('campaignAssets')),
    platform: v.union(
      v.literal('instagram'),
      v.literal('facebook'),
      v.literal('youtube'),
      v.literal('tiktok'),
      v.literal('linkedin'),
      v.literal('twitter')
    ),
    dimensionName: v.string(),
    width: v.number(),
    height: v.number(),
    category: v.string(),
    html: v.string(),
    css: v.string(),
    imageSlots: v.array(
      v.object({
        id: v.string(),
        prompt: v.string(),
        storageId: v.optional(v.id('_storage')),
        imageUrl: v.optional(v.string()),
        mimeType: v.optional(v.string()),
        status: v.union(
          v.literal('pending'),
          v.literal('generating'),
          v.literal('ready'),
          v.literal('error')
        ),
        error: v.optional(v.string()),
      })
    ),
    capturedImageStorageId: v.optional(v.id('_storage')),
    capturedImageUrl: v.optional(v.string()),
    status: v.union(
      v.literal('generating'),
      v.literal('rendering'),
      v.literal('capturing'),
      v.literal('ready'),
      v.literal('error')
    ),
    error: v.optional(v.string()),
    caption: v.optional(v.string()),
    hashtags: v.optional(v.string()),
    scheduledAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_campaign', ['campaignId'])
    .index('by_brand', ['brandId'])
    .index('by_master', ['masterAssetId']),

  // Uploaded reference images (product shots, logos, textures)
  campaignMedia: defineTable({
    campaignId: v.id('campaigns'),
    brandId: v.id('brands'),
    name: v.string(),
    storageId: v.id('_storage'),
    url: v.string(),
    mimeType: v.string(),
    fileSize: v.number(),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
    source: v.union(v.literal('upload'), v.literal('generated')),
    generationPrompt: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_campaign', ['campaignId'])
    .index('by_brand', ['brandId']),

  // Persistent chat history
  chatMessages: defineTable({
    campaignId: v.id('campaigns'),
    role: v.union(v.literal('user'), v.literal('assistant'), v.literal('system')),
    content: v.string(),
    parts: v.optional(v.any()),
    createdAt: v.number(),
  }).index('by_campaign', ['campaignId']),

  // ============================================
  // CREATE — Marketing asset projects (design-system-native)
  // ============================================

  createProjects: defineTable({
    brandId: v.id('brands'),
    name: v.string(),
    description: v.optional(v.string()),
    type: v.union(v.literal('single'), v.literal('campaign')),
    status: v.union(
      v.literal('draft'),
      v.literal('active'),
      v.literal('completed'),
      v.literal('archived')
    ),
    platforms: v.array(
      v.union(
        v.literal('instagram'),
        v.literal('facebook'),
        v.literal('youtube'),
        v.literal('tiktok'),
        v.literal('linkedin'),
        v.literal('twitter')
      )
    ),
    audience: v.optional(v.string()),
    tone: v.optional(v.string()),
    objectives: v.optional(v.array(v.string())),
    brief: v.optional(v.string()),
    assetType: v.optional(v.union(v.literal('social-post'), v.literal('ad-banner'), v.literal('story-reel'))),
    setupComplete: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_brand', ['brandId'])
    .index('by_brand_status', ['brandId', 'status'])
    .index('by_brand_type', ['brandId', 'type']),

  createAssets: defineTable({
    projectId: v.id('createProjects'),
    brandId: v.id('brands'),
    name: v.string(),
    masterAssetId: v.optional(v.id('createAssets')),
    platform: v.union(
      v.literal('instagram'),
      v.literal('facebook'),
      v.literal('youtube'),
      v.literal('tiktok'),
      v.literal('linkedin'),
      v.literal('twitter')
    ),
    dimensionName: v.string(),
    width: v.number(),
    height: v.number(),
    category: v.string(),
    html: v.string(),
    css: v.string(),
    contentBlockData: v.optional(v.any()),
    ribbonData: v.optional(v.any()),
    imageSlots: v.array(
      v.object({
        id: v.string(),
        prompt: v.string(),
        storageId: v.optional(v.id('_storage')),
        imageUrl: v.optional(v.string()),
        mimeType: v.optional(v.string()),
        status: v.union(
          v.literal('pending'),
          v.literal('generating'),
          v.literal('ready'),
          v.literal('error')
        ),
        error: v.optional(v.string()),
      })
    ),
    capturedImageStorageId: v.optional(v.id('_storage')),
    capturedImageUrl: v.optional(v.string()),
    tldrawSnapshot: v.optional(v.string()),
    status: v.union(
      v.literal('generating'),
      v.literal('rendering'),
      v.literal('capturing'),
      v.literal('ready'),
      v.literal('error')
    ),
    error: v.optional(v.string()),
    caption: v.optional(v.string()),
    hashtags: v.optional(v.string()),
    scheduledAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_project', ['projectId'])
    .index('by_brand', ['brandId'])
    .index('by_master', ['masterAssetId']),

  createMedia: defineTable({
    projectId: v.id('createProjects'),
    brandId: v.id('brands'),
    name: v.string(),
    storageId: v.id('_storage'),
    url: v.string(),
    mimeType: v.string(),
    fileSize: v.number(),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
    source: v.union(v.literal('upload'), v.literal('generated')),
    generationPrompt: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_project', ['projectId'])
    .index('by_brand', ['brandId']),

  createChatMessages: defineTable({
    projectId: v.id('createProjects'),
    role: v.union(v.literal('user'), v.literal('assistant'), v.literal('system')),
    content: v.string(),
    parts: v.optional(v.any()),
    createdAt: v.number(),
  }).index('by_project', ['projectId']),

  // ============================================
  // EXPERIENCE BUILDER — Component Compositions
  // ============================================

  // Saved canvas compositions (tldraw state + AST)
  compositions: defineTable({
    brandId: v.id('brands'),
    name: v.string(),
    description: v.optional(v.string()),
    /** Serialized AST root (JSON) */
    ast: v.string(),
    /** tldraw document snapshot (JSON) — for restoring canvas state */
    tldrawSnapshot: v.optional(v.string()),
    /** Generated JSX code (cached for quick display) */
    generatedCode: v.optional(v.string()),
    status: v.union(
      v.literal('draft'),
      v.literal('published')
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_brand', ['brandId'])
    .index('by_brand_status', ['brandId', 'status']),

  // ============================================
  // CUSTOM FONTS - User-uploaded fonts (global)
  // ============================================

  // Custom fonts uploaded by users
  // Stored in Convex file storage, available across all brands
  customFonts: defineTable({
    name: v.string(), // Display name (editable by user)
    familyName: v.string(), // CSS font-family name (extracted from font)
    fileId: v.id('_storage'), // Convex file storage ID
    fileUrl: v.string(), // Permanent URL for loading
    fileName: v.string(), // Original filename
    fileFormat: v.union(
      v.literal('ttf'),
      v.literal('otf'),
      v.literal('woff'),
      v.literal('woff2')
    ),
    fileSize: v.number(), // File size in bytes
    category: v.union(
      v.literal('variable'),
      v.literal('sans-serif'),
      v.literal('serif'),
      v.literal('mono'),
      v.literal('script')
    ),
    weights: v.array(v.number()), // Available weights [400] or [100, 200, ..., 900]
    isVariable: v.boolean(), // True if variable font with weight axis
    variableAxes: v.optional(
      v.array(
        v.object({
          tag: v.string(), // e.g., "wght", "wdth", "ital"
          minValue: v.number(),
          maxValue: v.number(),
          defaultValue: v.number(),
        })
      )
    ),
    // One entry per uploaded weight file. Static families can hold several
    // (Regular + Bold + …); a variable family holds a single file covering
    // its whole weight range. Optional for backward compatibility — legacy
    // records predate this field and are synthesised from the top-level
    // fileId/fileUrl/weights at read time. The top-level file* fields always
    // mirror the "primary" (lowest-weight) file so old readers keep working.
    files: v.optional(
      v.array(
        v.object({
          fileId: v.id('_storage'),
          fileUrl: v.string(),
          fileName: v.string(),
          fileFormat: v.union(
            v.literal('ttf'),
            v.literal('otf'),
            v.literal('woff'),
            v.literal('woff2')
          ),
          fileSize: v.number(),
          weight: v.number(),
        })
      )
    ),
    fallback: v.string(), // CSS fallback, e.g., "sans-serif"
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_name', ['name'])
    .index('by_family_name', ['familyName']),

  // ============================================
  // FIGMA PARITY — Token alignment tracking
  // ============================================

  // Persistent Figma↔OneUI name associations
  parityMappings: defineTable({
    brandId: v.id('brands'),
    figmaVariableName: v.string(),
    figmaVariableId: v.optional(v.string()),
    cssTokenName: v.string(),
    componentName: v.optional(v.string()),
    category: v.string(),
    mappingSource: v.union(v.literal('auto'), v.literal('manual'), v.literal('codeSyntax')),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_brand', ['brandId'])
    .index('by_brand_component', ['brandId', 'componentName'])
    .index('by_brand_category', ['brandId', 'category'])
    .index('by_figma_name', ['brandId', 'figmaVariableName']),

  // Point-in-time parity check results
  paritySnapshots: defineTable({
    brandId: v.id('brands'),
    componentName: v.optional(v.string()),
    source: v.union(v.literal('convex'), v.literal('mcp')),
    summary: v.object({
      matched: v.number(),
      mismatched: v.number(),
      missingInFigma: v.number(),
      missingInTool: v.number(),
      unmapped: v.number(),
      total: v.number(),
    }),
    entries: v.array(v.object({
      figmaVariableName: v.optional(v.string()),
      cssTokenName: v.optional(v.string()),
      category: v.string(),
      status: v.union(
        v.literal('matched'),
        v.literal('mismatched'),
        v.literal('missing-in-figma'),
        v.literal('missing-in-tool'),
        v.literal('unmapped')
      ),
      figmaValue: v.optional(v.string()),
      toolValue: v.optional(v.string()),
      tokenProperty: v.optional(v.string()),
      size: v.optional(v.string()),
      variant: v.optional(v.string()),
      slot: v.optional(v.string()),
    })),
    checkedAt: v.number(),
  })
    .index('by_brand', ['brandId'])
    .index('by_brand_component', ['brandId', 'componentName']),

  // ============================================
  // VOICE & TONE — AI Agent Rules Engine
  // ============================================

  // Brand voice profile (identity, tone sliders, language, channel defaults)
  voiceConfigs: defineTable({
    brandId: v.id('brands'),
    agentName: v.string(),
    personality: v.optional(v.string()),

    // Tone profile — two-dial model (warmth + directness).
    // formality, enthusiasm, empathy are deprecated (merged into warmth)
    // but kept optional for backward compat with existing rows.
    toneProfile: v.object({
      warmth: v.number(),
      directness: v.number(),
      formality: v.optional(v.number()),
      enthusiasm: v.optional(v.number()),
      empathy: v.optional(v.number()),
    }),

    // Language settings
    language: v.object({
      primary: v.string(),                // "en-IN", "hi", etc.
      hindiSupport: v.boolean(),
      hinglishSupport: v.boolean(),
      regionalLanguages: v.optional(v.array(v.string())),
      spellingConvention: v.union(v.literal('british'), v.literal('american')),
      numberFormat: v.union(v.literal('indian'), v.literal('international')),
    }),

    // Communication style
    communicationStyle: v.object({
      forbiddenWords: v.array(v.string()),
      preferredPhrases: v.optional(v.array(v.string())),
      maxResponseLength: v.optional(v.number()),
      useEmojis: v.boolean(),
      allowedEmojis: v.optional(v.array(v.string())),
      emojiFrequency: v.optional(v.number()),         // 0-100: how often to use emoji
      maxEmojisPerResponse: v.optional(v.number()),    // max emoji count per response
    }),

    // Emotional intelligence
    emotionalIntelligence: v.object({
      navarasa: v.boolean(),              // Enable 9-state Navarasa framework
      sensitiveTopicHandling: v.union(
        v.literal('gentle'),
        v.literal('direct'),
        v.literal('redirect')
      ),
    }),

    // Channel defaults (max length + formatting per channel)
    channelDefaults: v.optional(v.object({
      sms: v.optional(v.object({ maxLength: v.number(), formatting: v.string() })),
      whatsapp: v.optional(v.object({ maxLength: v.number(), formatting: v.string() })),
      app: v.optional(v.object({ maxLength: v.number(), formatting: v.string() })),
      ivr: v.optional(v.object({ maxLength: v.number(), formatting: v.string() })),
      email: v.optional(v.object({ maxLength: v.number(), formatting: v.string() })),
    })),

    // Response length preference (0-100)
    verbosity: v.optional(v.number()),

    isActive: v.boolean(),
    version: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_brand', ['brandId']),

  // Modular voice rule sections (22 sections from Core Rules v5)
  // Supports inheritance: scope='base' on system brand, scope='brand' for overrides
  voiceRules: defineTable({
    brandId: v.id('brands'),
    sectionId: v.string(),                // "identity", "conversation-modes", etc.
    scope: v.union(
      v.literal('base'),                  // Global default (shared across brands)
      v.literal('brand'),                 // Brand-specific override
    ),
    title: v.string(),
    content: v.string(),                  // Markdown rule content
    priority: v.number(),                 // Sort order (1-22)
    isActive: v.boolean(),
    version: v.number(),
    // Contexts this rule applies to. If missing or empty, the compiler falls
    // back to DEFAULT_SECTION_CONTEXTS[sectionId] in @oneui/shared. Values:
    // 'conversational' | 'copy' | 'microcopy' | 'editorial' | 'all'
    contexts: v.optional(v.array(v.string())),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_brand', ['brandId'])
    .index('by_brand_section', ['brandId', 'sectionId'])
    .index('by_scope', ['scope']),

  // Per-brand AI skills (error messages, troubleshooting, plan comparison, etc.)
  voiceSkills: defineTable({
    brandId: v.id('brands'),
    skillId: v.string(),
    name: v.string(),
    description: v.string(),
    category: v.union(
      v.literal('service'),
      v.literal('content'),
      v.literal('internal')
    ),

    // Skill configuration
    systemPromptTemplate: v.string(),     // Template with {brand}, {tone}, {rules} placeholders
    inputSchema: v.optional(v.any()),     // JSON Schema for skill inputs
    outputSchema: v.optional(v.any()),    // JSON Schema for expected outputs

    // Channel adaptation (per-channel output constraints)
    channelConfig: v.optional(v.object({
      sms: v.optional(v.object({ maxLength: v.number(), formatting: v.string() })),
      whatsapp: v.optional(v.object({ maxLength: v.number(), formatting: v.string() })),
      app: v.optional(v.object({ maxLength: v.number(), formatting: v.string() })),
      ivr: v.optional(v.object({ maxLength: v.number(), formatting: v.string() })),
      email: v.optional(v.object({ maxLength: v.number(), formatting: v.string() })),
    })),

    // Example input/output pairs
    examples: v.array(v.object({
      input: v.string(),
      expectedOutput: v.string(),
      channel: v.optional(v.string()),
    })),

    isActive: v.boolean(),
    version: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_brand', ['brandId'])
    .index('by_brand_skill', ['brandId', 'skillId']),

  // QnA evaluation scenarios (per-brand test bank)
  voiceEvalScenarios: defineTable({
    brandId: v.id('brands'),
    scenarioId: v.string(),
    category: v.string(),                 // "emotion", "service", "safety", "language", "tone"
    title: v.string(),
    description: v.optional(v.string()),

    // Test case
    userMessage: v.string(),
    expectedBehaviors: v.array(v.string()),
    forbiddenBehaviors: v.array(v.string()),

    // Scoring rubric (weights 0-10 per dimension)
    rubric: v.object({
      emotionDetection: v.optional(v.number()),
      forbiddenWords: v.optional(v.number()),
      formatting: v.optional(v.number()),
      warmth: v.optional(v.number()),
      forwardMomentum: v.optional(v.number()),
      apologyCorrectness: v.optional(v.number()),
      responseLength: v.optional(v.number()),
      benefitFraming: v.optional(v.number()),
      ecosystemBalance: v.optional(v.number()),
      inclusivity: v.optional(v.number()),
      readability: v.optional(v.number()),
    }),

    // Gold-standard reference answer
    referenceAnswer: v.optional(v.string()),

    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_brand', ['brandId'])
    .index('by_brand_category', ['brandId', 'category']),

  // Evaluation run results
  voiceEvalRuns: defineTable({
    brandId: v.id('brands'),
    name: v.optional(v.string()),
    rulesVersion: v.number(),

    // Aggregate scores
    totalScenarios: v.number(),
    passCount: v.number(),
    failCount: v.number(),
    averageScore: v.number(),
    scoreBreakdown: v.optional(v.any()), // Per-dimension aggregate scores

    // Individual results
    results: v.array(v.object({
      scenarioId: v.string(),
      score: v.number(),
      passed: v.boolean(),
      response: v.string(),
      dimensionScores: v.optional(v.any()),
      notes: v.optional(v.string()),
    })),

    status: v.union(
      v.literal('running'),
      v.literal('completed'),
      v.literal('failed'),
    ),
    startedAt: v.number(),
    completedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_brand', ['brandId']),

  // Published voice configuration snapshots (immutable, for SDK consumption)
  voicePublications: defineTable({
    brandId: v.id('brands'),
    version: v.string(),
    // All prompt keys are optional — a publication should carry at least one
    // compiled prompt. Context-keyed (conversational/copy/microcopy/editorial)
    // supersedes the legacy `default` key; per-channel keys (sms/whatsapp/...)
    // are retained for conversational × channel variants.
    compiledPrompts: v.object({
      default: v.optional(v.string()),
      conversational: v.optional(v.string()),
      copy: v.optional(v.string()),
      microcopy: v.optional(v.string()),
      editorial: v.optional(v.string()),
      sms: v.optional(v.string()),
      whatsapp: v.optional(v.string()),
      app: v.optional(v.string()),
      ivr: v.optional(v.string()),
      email: v.optional(v.string()),
    }),
    skills: v.array(v.object({
      skillId: v.string(),
      name: v.string(),
      systemPromptTemplate: v.string(),
      inputSchema: v.optional(v.any()),
      outputSchema: v.optional(v.any()),
    })),
    voiceConfigSnapshot: v.any(),
    toneGuardRules: v.object({
      forbiddenWords: v.array(v.string()),
      spellingConvention: v.string(),
      useEmojis: v.boolean(),
      allowedEmojis: v.optional(v.array(v.string())),
    }),
    rulesHash: v.string(),
    notes: v.optional(v.string()),
    publishedAt: v.number(),
  })
    .index('by_brand', ['brandId'])
    .index('by_brand_version', ['brandId', 'version']),

  // Feedback on AI responses (for continuous rule improvement)
  voiceFeedback: defineTable({
    brandId: v.id('brands'),
    source: v.union(
      v.literal('playground'),
      v.literal('evaluation'),
      v.literal('sdk'),
      v.literal('tone-guard')
    ),
    userMessage: v.string(),
    aiResponse: v.string(),
    channel: v.optional(v.string()),
    annotation: v.optional(v.string()),
    rating: v.union(v.literal('positive'), v.literal('negative')),
    relatedRuleSections: v.optional(v.array(v.string())),
    toneGuardCorrections: v.optional(v.any()),
    status: v.union(
      v.literal('open'),
      v.literal('reviewed'),
      v.literal('resolved'),
      v.literal('dismissed')
    ),
    resolution: v.optional(v.object({
      action: v.union(
        v.literal('rule-updated'),
        v.literal('scenario-added'),
        v.literal('forbidden-word-added'),
        v.literal('dismissed')
      ),
      details: v.optional(v.string()),
      resolvedAt: v.optional(v.number()),
    })),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_brand', ['brandId'])
    .index('by_brand_status', ['brandId', 'status'])
    .index('by_source', ['source']),

  // ============================================
  // DESIGN COMPOSITION AGENT — Composition Rules Engine
  // ============================================

  // Brand-level composition configuration (layout personality, vertical, defaults)
  compositionConfigs: defineTable({
    brandId: v.id('brands'),

    // Brand vertical (drives vertical-specific rule filtering)
    vertical: v.union(
      v.literal('entertainment'),
      v.literal('e-commerce'),
      v.literal('finance'),
      v.literal('governance'),
      v.literal('farm'),
      v.literal('iot'),
      v.literal('telecom'),
      v.literal('general')
    ),

    // Layout personality — two-dial model (density + expressiveness)
    layoutPersonality: v.object({
      density: v.number(),          // 0 = spacious → 100 = compact
      expressiveness: v.number(),   // 0 = minimal → 100 = bold/immersive
    }),

    // Default composition context for this brand
    defaultContext: v.union(
      v.literal('mobile-app'),
      v.literal('web-app'),
      v.literal('marketing-page'),
      v.literal('social-post'),
      v.literal('print'),
      v.literal('outdoor')
    ),

    // Optional guidance
    maxComponentsPerScreen: v.optional(v.number()),
    preferBoldHeros: v.optional(v.boolean()),
    preferMinimalContainers: v.optional(v.boolean()),

    isActive: v.boolean(),
    version: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_brand', ['brandId']),

  // Modular composition rule sections (12 sections)
  // Supports inheritance: scope='base' on system brand, scope='brand' for overrides
  compositionRules: defineTable({
    brandId: v.id('brands'),
    sectionId: v.string(),                // "layout-structure", "spacing-rhythm", etc.
    scope: v.union(
      v.literal('base'),                  // Global default (shared across brands)
      v.literal('brand'),                 // Brand-specific override
    ),
    title: v.string(),
    content: v.string(),                  // Markdown rule content
    priority: v.number(),                 // Sort order (1-12)
    isActive: v.boolean(),
    version: v.number(),
    // Contexts this rule applies to. If missing or empty, the compiler falls
    // back to DEFAULT_COMPOSITION_CONTEXTS[sectionId] in @oneui/shared. Values:
    // 'mobile-app' | 'web-app' | 'marketing-page' | 'social-post' | 'all'
    contexts: v.optional(v.array(v.string())),
    // Optional vertical tag for cross-brand vertical patterns
    vertical: v.optional(v.string()),
    // Hybrid RAG (RFC 0002): 1536-dim embedding of `title + content`. Optional
    // so legacy rows remain valid; rows without an embedding are invisible
    // to retrieval and served by the deterministic compile path.
    embedding: v.optional(v.array(v.float64())),
    embeddingHash: v.optional(v.string()),  // hash(title + content) — idempotent re-embed
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_brand', ['brandId'])
    .index('by_brand_section', ['brandId', 'sectionId'])
    .index('by_scope', ['scope'])
    .vectorIndex('by_embedding', {
      vectorField: 'embedding',
      dimensions: 1536,
      filterFields: ['brandId', 'vertical', 'scope', 'isActive'],
    }),

  // Reusable composition skills (screen archetypes, layout patterns, flows)
  compositionSkills: defineTable({
    brandId: v.id('brands'),
    skillId: v.string(),
    name: v.string(),
    description: v.string(),
    category: v.union(
      v.literal('screen'),                // Full screen archetype (login, settings, dashboard)
      v.literal('pattern'),               // Reusable micro-pattern (card, hero, form)
      v.literal('flow')                   // Multi-screen flow (onboarding, checkout)
    ),

    // Skill configuration
    systemPromptTemplate: v.string(),     // Template with {brand}, {vertical}, {components}, {tokens} placeholders
    applicableContexts: v.array(v.string()), // Which composition contexts this skill works in

    // --- Skill Pack fields (Step B) ------------------------------------
    // A skill is a bundle: rules + references + archetype + do/don'ts are
    // what external LLMs actually need, not just a loose prompt snippet.
    /** Archetype slug this skill produces ("product-grid", "hero", …). */
    archetype: v.optional(v.string()),
    /** Vertical tag — drives resolver scoring when the skill is served. */
    vertical: v.optional(v.string()),
    /** Rule sectionIds linked to this skill (subset of the 12 rule sections). */
    linkedRuleSectionIds: v.optional(v.array(v.string())),
    /** Reference screen ids curated for this pack. */
    linkedReferenceScreenIds: v.optional(v.array(v.id('referenceScreens'))),
    /** Short do/don't bullets, OneUI-worded. */
    dosDonts: v.optional(v.array(v.string())),
    /** High-level attention pattern recipe. Single sentence. */
    attentionPattern: v.optional(v.string()),
    /**
     * Count of positive playground feedbacks referencing this skill. Drives
     * `getTopRated` ranking for the Skill Writer's few-shot selection.
     * Optional so existing rows continue to read as falsy until rated.
     */
    positiveRatings: v.optional(v.number()),
    // -------------------------------------------------------------------

    // Example prompt/AST pairs
    examples: v.array(v.object({
      prompt: v.string(),
      expectedAST: v.string(),            // JSON string of ASTRoot
      context: v.optional(v.string()),
    })),

    isActive: v.boolean(),
    version: v.number(),
    // Hybrid RAG (RFC 0002): 1536-dim embedding of
    // `name + description + attentionPattern + dosDonts`.
    embedding: v.optional(v.array(v.float64())),
    embeddingHash: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_brand', ['brandId'])
    .index('by_brand_skill', ['brandId', 'skillId'])
    .index('by_brand_vertical', ['brandId', 'vertical'])
    .index('by_brand_archetype', ['brandId', 'archetype'])
    .vectorIndex('by_embedding', {
      vectorField: 'embedding',
      dimensions: 1536,
      filterFields: ['brandId', 'vertical', 'archetype', 'isActive'],
    }),

  // Context-pack cache — external agents (Claude Code, Cursor, MCP) hit
  // /api/agent/context-pack with (brand, vertical, archetype, context).
  // Key = djb2(brandId, vertical, archetype, context, rulesHash, refsHash).
  contextPackCache: defineTable({
    key: v.string(),
    brandId: v.id('brands'),
    vertical: v.optional(v.string()),
    archetype: v.optional(v.string()),
    context: v.string(),
    compiledPrompt: v.string(),
    referenceScreenIds: v.array(v.id('referenceScreens')),
    skillIds: v.array(v.string()),
    citedTokens: v.optional(v.array(v.string())),
    promptSize: v.number(),
    rulesHash: v.string(),
    refsHash: v.string(),
    builtAt: v.number(),
  })
    .index('by_key', ['key'])
    .index('by_brand', ['brandId']),

  // Composition evaluation scenarios (per-brand test bank for quality regression)
  compositionEvalScenarios: defineTable({
    brandId: v.id('brands'),
    scenarioId: v.string(),
    category: v.string(),                 // "layout", "surface", "typography", "attention", "accessibility"
    title: v.string(),
    description: v.optional(v.string()),

    // Test case
    prompt: v.string(),
    context: v.string(),                  // composition context (mobile-app, web-app, etc.)
    expectedBehaviors: v.array(v.string()),
    forbiddenBehaviors: v.array(v.string()),

    // Scoring rubric (weights 0-10 per dimension)
    rubric: v.object({
      tokenCompliance: v.optional(v.number()),
      attentionHierarchy: v.optional(v.number()),
      spacingConsistency: v.optional(v.number()),
      surfaceCorrectness: v.optional(v.number()),
      componentSelection: v.optional(v.number()),
      brandConsistency: v.optional(v.number()),
      accessibility: v.optional(v.number()),
      layoutQuality: v.optional(v.number()),
    }),

    // Gold-standard reference AST (JSON string)
    referenceAST: v.optional(v.string()),

    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_brand', ['brandId'])
    .index('by_brand_category', ['brandId', 'category']),

  // Composition evaluation run results
  compositionEvalRuns: defineTable({
    brandId: v.id('brands'),
    name: v.optional(v.string()),
    rulesVersion: v.number(),

    // Aggregate scores
    totalScenarios: v.number(),
    passCount: v.number(),
    failCount: v.number(),
    averageScore: v.number(),
    scoreBreakdown: v.optional(v.any()),

    // Individual results
    results: v.array(v.object({
      scenarioId: v.string(),
      score: v.number(),
      passed: v.boolean(),
      generatedAST: v.string(),           // JSON string of generated AST
      dimensionScores: v.optional(v.any()),
      notes: v.optional(v.string()),
    })),

    status: v.union(
      v.literal('running'),
      v.literal('completed'),
      v.literal('failed'),
    ),
    startedAt: v.number(),
    completedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_brand', ['brandId']),

  // Feedback on composition outputs (for continuous rule improvement)
  compositionFeedback: defineTable({
    brandId: v.id('brands'),
    source: v.union(
      v.literal('playground'),
      v.literal('evaluation'),
      v.literal('canvas'),
      v.literal('experience-builder'),
      v.literal('visual-verification')
    ),
    prompt: v.string(),
    generatedAST: v.string(),             // Full AST JSON for visual review
    context: v.string(),                  // composition context used
    annotation: v.optional(v.string()),
    rating: v.union(v.literal('positive'), v.literal('negative')),
    relatedRuleSections: v.optional(v.array(v.string())),
    validationResult: v.optional(v.any()),
    /**
     * Optional skill the composition was generated from. Increments the
     * skill's `positiveRatings` counter on insert when rating is positive.
     */
    skillId: v.optional(v.string()),
    status: v.union(
      v.literal('open'),
      v.literal('reviewed'),
      v.literal('resolved'),
      v.literal('dismissed')
    ),
    resolution: v.optional(v.object({
      action: v.union(
        v.literal('rule-updated'),
        v.literal('scenario-added'),
        v.literal('skill-added'),
        v.literal('reference-added'),
        v.literal('dismissed')
      ),
      details: v.optional(v.string()),
      resolvedAt: v.optional(v.number()),
    })),
    // Optional link to a rendered screenshot / visual verification result
    renderedScreenshotId: v.optional(v.id('renderedScreenshots')),
    visualAlignmentScore: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_brand', ['brandId'])
    .index('by_brand_status', ['brandId', 'status'])
    .index('by_source', ['source']),

  // ============================================
  // REFERENCE UI LIBRARY — visual catalog that grounds composition
  // ============================================
  // Designers upload golden Jio ecosystem screens (JioMart, JioCinema, MyJio…)
  // tagged by vertical + context + archetype. The engine resolves top-k
  // matches for a generation prompt, sends the PNGs as vision content blocks
  // to Claude, and lets the LLM ground its output in real visual precedent.

  /** A named collection of reference screens (typically one Jio app / surface). */
  referenceCollections: defineTable({
    name: v.string(),                           // e.g. "JioCinema — Mobile", "JioMart — Web"
    description: v.optional(v.string()),
    vertical: v.union(
      v.literal('entertainment'),
      v.literal('e-commerce'),
      v.literal('finance'),
      v.literal('governance'),
      v.literal('farm'),
      v.literal('iot'),
      v.literal('telecom'),
      v.literal('mobility'),
      v.literal('health'),
      v.literal('general')
    ),
    platform: v.union(
      v.literal('mobile'),
      v.literal('web'),
      v.literal('tablet'),
      v.literal('tv'),
      v.literal('print'),
      v.literal('outdoor')
    ),
    brandId: v.optional(v.id('brands')),        // null = global / built-in seed
    isBuiltIn: v.boolean(),                     // seeded Jio ecosystem collections
    isArchived: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_vertical', ['vertical'])
    .index('by_brand', ['brandId'])
    .index('by_vertical_platform', ['vertical', 'platform']),

  /** A single catalogued screen — one image + its semantic metadata. */
  referenceScreens: defineTable({
    collectionId: v.id('referenceCollections'),
    storageId: v.id('_storage'),                // PNG/JPG in Convex file storage
    thumbnailStorageId: v.optional(v.id('_storage')),
    mimeType: v.string(),
    fileSize: v.number(),
    width: v.optional(v.number()),
    height: v.optional(v.number()),

    name: v.string(),                           // "Movie detail", "Product grid"
    archetype: v.string(),                      // product-grid | hero | player | settings | detail | onboarding | list
    context: v.union(
      v.literal('mobile-app'),
      v.literal('web-app'),
      v.literal('marketing-page'),
      v.literal('social-post'),
      v.literal('print'),
      v.literal('outdoor')
    ),
    description: v.optional(v.string()),

    // Designer-authored notes used as text context alongside the image
    tokensObserved: v.optional(v.array(v.string())),  // e.g. ["bold", "Display-M", "Spacing-5"]
    attentionNotes: v.optional(v.string()),
    dosDonts: v.optional(v.array(v.string())),

    tags: v.optional(v.array(v.string())),
    status: v.union(
      v.literal('draft'),
      v.literal('approved'),
      v.literal('archived')
    ),
    version: v.number(),
    addedBy: v.optional(v.string()),            // deviceId or userId
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_collection', ['collectionId'])
    .index('by_archetype', ['archetype'])
    .index('by_context_archetype', ['context', 'archetype'])
    .index('by_status', ['status']),

  /** LLM vision-extracted structural readout for a screen. Cached by inputHash
   *  so analysis is pay-once-per-(image, model, prompt-version). */
  referenceAnalyses: defineTable({
    screenId: v.id('referenceScreens'),
    inputHash: v.string(),                      // hash(storageId + modelVersion + promptVersion)
    modelVersion: v.string(),                   // "claude-sonnet-4-6"
    promptVersion: v.string(),                  // bumps invalidate cache

    // Structured extraction
    extractedPalette: v.optional(v.array(v.string())),        // dominant colours
    extractedHierarchy: v.optional(v.string()),               // summary of attention flow
    extractedComposition: v.optional(v.string()),             // spacing, grid, density notes
    extractedTypography: v.optional(v.string()),
    extractedSurfaces: v.optional(v.string()),                // surface modes observed
    extractedComponents: v.optional(v.array(v.string())),     // component archetypes spotted

    // Full analysis document (markdown) — richest form for prompt injection
    summary: v.string(),

    // Hybrid RAG (RFC 0002): 1536-dim embedding of
    // `summary + extractedHierarchy + extractedComposition`.
    // Denormalised `archetype` and `vertical` (copied from parent screen /
    // collection at embed time) so the vector index can filter without a
    // join — required by Convex vector search filterFields.
    embedding: v.optional(v.array(v.float64())),
    embeddingHash: v.optional(v.string()),
    archetype: v.optional(v.string()),
    vertical: v.optional(v.string()),
    context: v.optional(v.string()),

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_screen', ['screenId'])
    .index('by_inputHash', ['inputHash'])
    .vectorIndex('by_embedding', {
      vectorField: 'embedding',
      dimensions: 1536,
      filterFields: ['archetype', 'vertical', 'context'],
    }),

  /** Link table: a reference screen can inform rules, skills, or eval scenarios. */
  referenceLinks: defineTable({
    screenId: v.id('referenceScreens'),
    targetType: v.union(
      v.literal('rule'),
      v.literal('skill'),
      v.literal('scenario'),
      v.literal('feedback')
    ),
    targetId: v.string(),                       // foreign id as string (cross-table)
    weight: v.number(),                         // 0..1 relevance
    note: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index('by_screen', ['screenId'])
    .index('by_target', ['targetType', 'targetId']),

  /** Screenshots captured by the headless renderer after a composition is
   *  generated. Used by the visual-verification loop to ask Claude vision to
   *  score a generated layout against its reference pair. */
  renderedScreenshots: defineTable({
    brandId: v.optional(v.id('brands')),
    astHash: v.string(),                        // djb2(JSON.stringify(ast))
    storageId: v.id('_storage'),
    viewport: v.string(),                       // "mobile" | "desktop" | "390x844" etc.
    context: v.string(),                        // composition context
    referenceScreenIds: v.optional(v.array(v.id('referenceScreens'))),
    // Claude vision's structured alignment judgment
    visualAlignment: v.optional(v.object({
      overall: v.number(),
      dimensions: v.any(),
      notes: v.optional(v.string()),
    })),
    createdAt: v.number(),
  })
    .index('by_astHash', ['astHash'])
    .index('by_brand', ['brandId']),

  // Published composition configuration snapshots (immutable, for SDK consumption)
  compositionPublications: defineTable({
    brandId: v.id('brands'),
    version: v.string(),
    compiledPrompts: v.object({
      mobileApp: v.optional(v.string()),
      webApp: v.optional(v.string()),
      marketingPage: v.optional(v.string()),
      socialPost: v.optional(v.string()),
      print: v.optional(v.string()),
      outdoor: v.optional(v.string()),
    }),
    skills: v.array(v.object({
      skillId: v.string(),
      name: v.string(),
      systemPromptTemplate: v.string(),
      applicableContexts: v.array(v.string()),
    })),
    configSnapshot: v.any(),
    validatorVersion: v.string(),         // validator version for compatibility
    rulesHash: v.string(),
    notes: v.optional(v.string()),
    publishedAt: v.number(),
  })
    .index('by_brand', ['brandId'])
    .index('by_brand_version', ['brandId', 'version']),

  /*
   * Knowledge base for the Experience Builder chat RAG layer.
   * Ingested from docs/*, CLAUDE.md, and .claude/skills/* by scripts/ingest-knowledge.ts.
   * Queried at runtime via the search_design_system tool (see create/lib/tools.ts).
   */
  knowledgeDocs: defineTable({
    source: v.string(),
    heading: v.string(),
    headingPath: v.array(v.string()),
    content: v.string(),
    contentHash: v.string(),
    embedding: v.array(v.float64()),
    tokens: v.number(),
    tags: v.array(v.string()),
    ingestedAt: v.number(),
  })
    .index('by_source_hash', ['source', 'contentHash'])
    .index('by_source', ['source'])
    .vectorIndex('by_embedding', {
      vectorField: 'embedding',
      dimensions: 1536,
      filterFields: ['tags', 'source'],
    }),

  /* Observability for every search_design_system call. */
  knowledgeQueries: defineTable({
    query: v.string(),
    tags: v.optional(v.array(v.string())),
    resultIds: v.array(v.id('knowledgeDocs')),
    createdAt: v.number(),
  }).index('by_createdAt', ['createdAt']),

  // ============================================
  // GLOBAL AGENT — home chat + future sub-agent threads
  // ============================================

  /*
   * Conversations with the One UI Studio global agent. Each thread is owned
   * by a user (placeholder string until OAuth lands) and optionally pinned to
   * a brand so we can re-send the right foundation summary on resume.
   *
   * `mode` is a closed union matching `PlatformModeId` in the UI package.
   * Adding a new agent surface requires adding a literal here — deliberate
   * because it catches typos and accidental writes at storage time.
   */
  agentThreads: defineTable({
    userId: v.string(),
    title: v.string(),
    mode: v.union(
      v.literal('home'),
      v.literal('build'),
      v.literal('system'),
      v.literal('agents'),
    ),
    brandId: v.optional(v.id('brands')),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_user', ['userId'])
    .index('by_user_updated', ['userId', 'updatedAt']),

  /*
   * Persisted messages for an agent thread. `parts` holds the raw
   * UIMessage.parts array from the AI SDK so tool calls round-trip
   * losslessly (text + tool invocations + future attachments). Ordered
   * by `_creationTime` via Convex default.
   */
  agentMessages: defineTable({
    threadId: v.id('agentThreads'),
    role: v.union(v.literal('user'), v.literal('assistant'), v.literal('system')),
    parts: v.array(v.any()),
    createdAt: v.number(),
  }).index('by_thread', ['threadId']),

  /*
   * Per-device user preferences. Keyed by a deviceId uuid persisted in
   * localStorage (`oneui-studio:user-id`). This is the single source of
   * truth for brand/sub-brand defaults, last-opened session state, and
   * appearance settings — hydration reads it once on mount, setters
   * update it via partial upserts. When real auth arrives, replace
   * deviceId with userId and migrate existing rows.
   */
  userPreferences: defineTable({
    // `deviceId` is kept for back-compat with existing client code, but is
    // ignored server-side. New rows are keyed by `userId` (Better Auth _id).
    deviceId: v.optional(v.string()),
    // Stable Better Auth user id — the real server-side key. Optional so
    // pre-migration rows remain valid.
    userId: v.optional(v.string()),
    defaultBrandId: v.optional(v.id('brands')),
    defaultSubBrandId: v.optional(v.string()),
    lastOpenedBrandId: v.optional(v.id('brands')),
    lastOpenedSubBrandId: v.optional(v.string()),
    platformBrandId: v.optional(v.id('brands')),
    themeScope: v.optional(
      v.union(v.literal('global'), v.literal('scoped'), v.literal('preview'))
    ),
    density: v.optional(
      v.union(v.literal('compact'), v.literal('default'), v.literal('open'))
    ),
    theme: v.optional(v.union(v.literal('light'), v.literal('dark'))),
    iconSet: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_deviceId', ['deviceId'])
    .index('by_user', ['userId']),

  // ===========================================================================
  // Data Visualization palettes (source: enterprise/datavis-integration)
  // Brought in to keep local Convex a superset so deploys never drop these
  // functions. See convex/dataVisPalettes.ts + convex/colorUtils.ts.
  // ===========================================================================
  dataVisPaletteCollections: defineTable({
    name: v.string(), // e.g., "Jio Data Vis v1"
    description: v.optional(v.string()),
    version: v.string(), // e.g., "v1.0.0"
    isDefault: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_name', ['name'])
    .index('by_default', ['isDefault']),

  dataVisPalettes: defineTable({
    collectionId: v.id('dataVisPaletteCollections'),
    themeName: v.string(), // e.g., "MyJio", "JioCinema"
    mode: v.union(v.literal('light'), v.literal('dark')),
    paletteType: v.union(
      v.literal('categorical'),
      v.literal('monochromatic'),
      v.literal('sequential'),
      v.literal('divergingSemantic'),
      v.literal('divergingBrand'),
      v.literal('core'),
      v.literal('neutral'),
      v.literal('semantic'),
    ),
    name: v.string(), // e.g., "bold", "category1", "negative5"
    colors: v.array(
      v.object({
        index: v.string(), // "1", "2", ... or named keys like "negative5"
        valueOKLCH: v.string(), // "oklch(69.8% 0.2003 41.49)"
        valueHEX: v.string(), // "#ff671f"
        token: v.string(), // "saffron/1500"
      })
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_collection', ['collectionId'])
    .index('by_collection_theme_mode', ['collectionId', 'themeName', 'mode'])
    .index('by_collection_theme_mode_type', ['collectionId', 'themeName', 'mode', 'paletteType']),

  brandDataVisPaletteSelections: defineTable({
    brandId: v.id('brands'),
    collectionId: v.id('dataVisPaletteCollections'),
    themeName: v.string(), // Which theme within the collection this brand uses
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_brand', ['brandId'])
    .index('by_collection', ['collectionId']),

  // ===========================================================================
  // Create templates + Imagine (source: enterprise/platform-ameya)
  // Brought in to keep local Convex a superset so deploys never drop these
  // functions. See convex/createTemplates.ts + convex/imagine.ts.
  // ===========================================================================
  createTemplates: defineTable({
    brandId: v.id('brands'),
    name: v.string(),
    description: v.optional(v.string()),
    /** Intent hints the LLM uses to match a template to a user ask. */
    tags: v.optional(v.array(v.string())),
    platform: v.union(
      v.literal('instagram'),
      v.literal('facebook'),
      v.literal('youtube'),
      v.literal('tiktok'),
      v.literal('linkedin'),
      v.literal('twitter')
    ),
    dimensionName: v.string(),
    width: v.number(),
    height: v.number(),
    category: v.string(),
    /** OneUI Component AST — what the LLM clones. */
    ast: v.optional(v.any()),
    /** Serialized tldraw store — what the canvas re-hydrates. */
    tldrawSnapshot: v.optional(v.string()),
    contentBlockData: v.optional(v.any()),
    ribbonData: v.optional(v.any()),
    capturedImageStorageId: v.optional(v.id('_storage')),
    status: v.union(
      v.literal('draft'),
      v.literal('capturing'),
      v.literal('ready'),
      v.literal('error')
    ),
    error: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_brand', ['brandId'])
    .index('by_brand_platform', ['brandId', 'platform'])
    .index('by_brand_dimension', ['brandId', 'dimensionName']),

  imagineThreads: defineTable({
    userId: v.string(),
    title: v.string(),
    brandId: v.optional(v.id('brands')),
    // tldraw store snapshot, JSON.stringify'd. Restored on thread load.
    canvasState: v.optional(v.string()),
    // Canvas thumbnail (data URL) for the thread list.
    thumbnailUrl: v.optional(v.string()),
    // Denormalised history-card metadata, recomputed in replaceMessages.
    assetCount: v.optional(v.number()),
    assetTypes: v.optional(v.array(v.string())),
    brandName: v.optional(v.string()),
    // Generation-level rollback points (distinct from tldraw undo/redo).
    checkpoints: v.optional(
      v.array(
        v.object({
          label: v.string(),
          canvasState: v.string(),
          assetIds: v.array(v.string()),
          createdAt: v.number(),
        }),
      ),
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_user', ['userId'])
    .index('by_user_updated', ['userId', 'updatedAt']),

  imagineMessages: defineTable({
    threadId: v.id('imagineThreads'),
    role: v.union(v.literal('user'), v.literal('assistant')),
    parts: v.array(v.any()),
    assetIds: v.optional(v.array(v.id('imagineAssets'))),
    createdAt: v.number(),
  }).index('by_thread', ['threadId']),

  imagineAssets: defineTable({
    threadId: v.id('imagineThreads'),
    messageId: v.id('imagineMessages'),
    type: v.union(
      v.literal('mobile-screen'),
      v.literal('web-screen'),
      v.literal('social-post'),
      v.literal('campaign-banner'),
      v.literal('brand-doc'),
      v.literal('ui-flow-screen'),
      // Phase 2/3 asset kinds — image (Recraft/Ideogram/gpt-image-2) and video (Runway).
      v.literal('image'),
      v.literal('video'),
    ),
    title: v.string(),
    // UI screen assets
    code: v.optional(v.string()),
    // json-render component tree (source of truth; Phase 2). Stringified JSON.
    jsonRenderTree: v.optional(v.string()),
    // Image assets (Phase 3)
    imageUrl: v.optional(v.string()),
    imageStorageId: v.optional(v.id('_storage')),
    imageProvider: v.optional(
      v.union(
        v.literal('recraft'),
        v.literal('ideogram'),
        v.literal('gpt-image-2'),
      ),
    ),
    // Video assets (Phase 3)
    videoUrl: v.optional(v.string()),
    videoProvider: v.optional(v.literal('runway')),
    // Brand doc assets
    docHtml: v.optional(v.string()),
    tldrawFrameId: v.string(),
    groupId: v.optional(v.string()),
    groupLabel: v.optional(v.string()),
    // For variant clusters: which variant index the user promoted.
    chosenVariantIndex: v.optional(v.number()),
    validationScore: v.optional(v.number()),
    designGateScore: v.optional(v.number()),
    canvasX: v.number(),
    canvasY: v.number(),
    canvasW: v.number(),
    canvasH: v.number(),
    // e.g. 'instagram-story' — used by image/video sizing (Phase 3).
    platformSize: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index('by_thread', ['threadId'])
    .index('by_message', ['messageId'])
    .index('by_group', ['groupId'])
    .index('by_frame', ['tldrawFrameId']),

  imagineShareLinks: defineTable({
    threadId: v.id('imagineThreads'),
    token: v.string(),
    createdBy: v.string(),
    expiresAt: v.optional(v.number()),
    createdAt: v.number(),
  }).index('by_token', ['token']),

  // Experience Builder Lab persistence (VER-03 / D-08)
  experienceRuns: defineTable({
    brandId: v.id('brands'),
    request: v.object({
      artifactType: v.string(),
      outputProfile: v.string(),
      theme: v.optional(v.string()),
      prompt: v.optional(v.string()),
      subBrandConfigId: v.optional(v.string()),
      parentVersionId: v.optional(v.string()),
      canvasDocumentId: v.optional(v.string()),
      conversationThreadId: v.optional(v.string()),
      requestedComponents: v.optional(v.array(v.string())),
      strictStorybook: v.optional(v.boolean()),
      storybookMcpUrl: v.optional(v.string()),
    }),
    events: v.array(v.any()),
    status: v.union(
      v.literal('queued'),
      v.literal('running'),
      v.literal('suspended'),
      v.literal('artifact'),
      v.literal('gap'),
      v.literal('error'),
      v.literal('cancelled'),
    ),
    validation: v.optional(v.any()),
    previewUrl: v.optional(v.string()),
    modelUsage: v.optional(v.array(v.any())),
    toolCalls: v.optional(v.array(v.any())),
    error: v.optional(v.string()),
    completedAt: v.optional(v.number()),
    campaignPlan: v.optional(v.any()),
    artifactId: v.optional(v.id('experienceArtifacts')),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index('by_brand', ['brandId']),

  experienceArtifacts: defineTable({
    brandId: v.id('brands'),
    artifactType: v.string(),
    outputProfile: v.string(),
    originRunId: v.id('experienceRuns'),
    variantGroupId: v.optional(v.string()),
    orderIndex: v.optional(v.number()),
    currentVersionId: v.optional(v.id('experienceArtifactVersions')),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_brand', ['brandId'])
    .index('by_variant_group', ['variantGroupId']),

  experienceArtifactVersions: defineTable({
    artifactId: v.id('experienceArtifacts'),
    runId: v.id('experienceRuns'),
    ir: v.any(),
    compositionSpec: v.optional(v.any()),
    validation: v.optional(v.any()),
    parentVersionId: v.optional(v.id('experienceArtifactVersions')),
    compiledBundle: v.optional(v.object({
      code: v.string(),
      meta: v.optional(v.any()),
    })),
    previewState: v.optional(v.any()),
    thumbnail: v.optional(v.id('_storage')),
    evaluation: v.optional(v.any()),
    originRunId: v.optional(v.id('experienceRuns')),
    agentTrace: v.optional(v.any()),
    createdAt: v.number(),
  }).index('by_artifact', ['artifactId']),

  experienceExports: defineTable({
    versionId: v.id('experienceArtifactVersions'),
    brandId: v.id('brands'),
    kind: v.string(),
    storageId: v.id('_storage'),
    contentType: v.string(),
    createdAt: v.number(),
  })
    .index('by_version', ['versionId'])
    .index('by_brand', ['brandId']),
});
