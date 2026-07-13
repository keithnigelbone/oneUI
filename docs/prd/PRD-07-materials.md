# Materials System PRD
## One UI Studio Design System

**Version**: 1.0.0  
**Status**: Draft  
**Author**: Design System Team  
**Last Updated**: January 2026

---

## 1. Executive Summary

The Materials System extends One UI Studio's foundation layer to provide sophisticated visual treatments that simulate real-world material properties through CSS. Materials create depth, hierarchy, and visual interest while maintaining accessibility and performance across all Jio brands and platforms.

Materials serve three primary purposes:
- **Depth perception**: Creating spatial relationships between UI layers
- **Brand expression**: Enabling premium, luxurious, or contextual visual treatments
- **Content enhancement**: Improving media presentation with overlays and effects

---

## 2. Problem Statement

### Current Gaps
- No standardized approach to glass/blur effects across Jio brands
- Inconsistent transparency treatments on media overlays
- Lack of premium material options (metallic, glass) for brand differentiation
- Missing token-based system for material properties
- No guidance for accessibility compliance with translucent surfaces

### User Needs
- Brands like JioCinema need premium glass effects for media overlays
- JioMart requires metallic treatments for premium product highlighting
- All brands need consistent transparency for media scrim overlays
- Multi-brand support requires configurable material properties

---

## 3. Core Principles

### 3.1 Material Hierarchy

```javascript
MaterialHierarchy = {
  foundation: "Solid surfaces (existing)",
  translucent: "Simple transparency overlays",
  frosted: "Blur-based glass effects",
  glass: "Advanced glass with refraction simulation",
  metallic: "Gradient-based material simulation",
  RULE: "Materials layer ON TOP of existing surface system"
}
```

### 3.2 Integration with Surface System

Materials work IN CONJUNCTION with the existing surface emphasis system:

```
Surface Emphasis (from colour_surfaces.md):
├── Minimal (+1 step)
├── Subtle (+2 steps)
├── Moderate (+3 steps)
└── Bold (variable, color-dependent)

Materials Layer (NEW):
├── Translucent (opacity-based)
├── Frosted (blur + opacity)
├── Glass (blur + opacity + effects)
└── Metallic (gradient-based)
```

### 3.3 CSS-First Approach

All materials MUST be achievable via CSS without JavaScript runtime calculations:

```css
/* Allowed techniques */
- backdrop-filter: blur()
- background: linear-gradient() / radial-gradient()
- opacity / rgba() / hsla()
- box-shadow (for glow effects)
- filter: drop-shadow()
- mix-blend-mode (sparingly)

/* NOT allowed */
- Canvas/WebGL (except as progressive enhancement)
- SVG filters for primary implementation (browser inconsistency)
- JavaScript-computed values at runtime
```

---

## 4. Material Categories

### 4.1 Translucent Materials

Simple opacity-based overlays for content on media.

```yaml
translucent:
  purpose: "Media overlays, content scrims, subtle backgrounds"
  technique: "Background color with alpha channel"
  
  variants:
    light:
      minimal: "rgba(255, 255, 255, 0.10)"  # 10%
      subtle: "rgba(255, 255, 255, 0.25)"   # 25%
      moderate: "rgba(255, 255, 255, 0.50)" # 50%
      heavy: "rgba(255, 255, 255, 0.75)"    # 75%
    
    dark:
      minimal: "rgba(0, 0, 0, 0.10)"        # 10%
      subtle: "rgba(0, 0, 0, 0.25)"         # 25%
      moderate: "rgba(0, 0, 0, 0.50)"       # 50%
      heavy: "rgba(0, 0, 0, 0.75)"          # 75%
    
    tinted:
      description: "Uses brand color with alpha"
      formula: "{brand-color} at {opacity-level}"
```

**Token Structure**:
```json
{
  "material": {
    "translucent": {
      "light": {
        "minimal": { "value": "rgba(255, 255, 255, 0.10)" },
        "subtle": { "value": "rgba(255, 255, 255, 0.25)" },
        "moderate": { "value": "rgba(255, 255, 255, 0.50)" },
        "heavy": { "value": "rgba(255, 255, 255, 0.75)" }
      },
      "dark": {
        "minimal": { "value": "rgba(0, 0, 0, 0.10)" },
        "subtle": { "value": "rgba(0, 0, 0, 0.25)" },
        "moderate": { "value": "rgba(0, 0, 0, 0.50)" },
        "heavy": { "value": "rgba(0, 0, 0, 0.75)" }
      }
    }
  }
}
```

---

### 4.2 Frosted Glass Materials

Blur-based glass effects inspired by Apple's pre-Liquid Glass materials.

```yaml
frosted:
  purpose: "Navigation bars, toolbars, modal backgrounds, cards"
  technique: "backdrop-filter: blur() + background with alpha"
  
  variants:
    ultra-thin:
      blur: "4px"
      background: "rgba(255, 255, 255, 0.30)"  # Light mode
      background-dark: "rgba(0, 0, 0, 0.30)"   # Dark mode
      use-case: "Subtle separation, maintains content visibility"
    
    thin:
      blur: "8px"
      background: "rgba(255, 255, 255, 0.50)"
      background-dark: "rgba(0, 0, 0, 0.50)"
      use-case: "Toolbars, navigation elements"
    
    regular:
      blur: "16px"
      background: "rgba(255, 255, 255, 0.65)"
      background-dark: "rgba(0, 0, 0, 0.65)"
      use-case: "Cards, panels, default glass"
    
    thick:
      blur: "24px"
      background: "rgba(255, 255, 255, 0.75)"
      background-dark: "rgba(0, 0, 0, 0.75)"
      use-case: "Modals, high-contrast surfaces"
    
    ultra-thick:
      blur: "32px"
      background: "rgba(255, 255, 255, 0.85)"
      background-dark: "rgba(0, 0, 0, 0.85)"
      use-case: "Maximum obscuring, near-solid"
```

**CSS Implementation**:
```css
/* Frosted Glass - Regular variant */
.material-frosted-regular {
  /* Required for backdrop-filter */
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  
  /* Background with transparency */
  background: rgba(255, 255, 255, 0.65);
  
  /* Subtle border for edge definition */
  border: 1px solid rgba(255, 255, 255, 0.20);
  
  /* Fallback for unsupported browsers */
  @supports not (backdrop-filter: blur(16px)) {
    background: rgba(255, 255, 255, 0.92);
  }
}

/* Dark mode adjustment */
.dark .material-frosted-regular {
  background: rgba(0, 0, 0, 0.65);
  border: 1px solid rgba(255, 255, 255, 0.10);
}
```

---

### 4.3 Glass Materials (Liquid Glass Inspired)

Advanced glass effects with highlight, shadow, and illumination layers.

```yaml
glass:
  purpose: "Premium UI elements, hero sections, feature highlights"
  technique: "Layered approach: backdrop-blur + gradient highlights + shadows"
  
  CRITICAL: "Based on Apple's Liquid Glass principles but CSS-achievable"
  
  layers:
    1_backdrop:
      description: "Base blur and tint"
      blur: "12-24px"
      tint: "Contextual color at 40-60% opacity"
    
    2_highlight:
      description: "Simulates light reflection"
      technique: "Radial gradient at top edge"
      color: "rgba(255, 255, 255, 0.15-0.40)"
    
    3_shadow:
      description: "Creates depth separation"
      technique: "box-shadow or pseudo-element"
      values: "Follows elevation formula"
    
    4_border:
      description: "Edge definition and refraction hint"
      technique: "Semi-transparent border"
      light: "rgba(255, 255, 255, 0.20)"
      dark: "rgba(255, 255, 255, 0.10)"
  
  variants:
    regular:
      description: "Most versatile, adaptive to content"
      highlight-intensity: "moderate"
      use-case: "Navigation, cards, buttons"
    
    clear:
      description: "Maximum content visibility"
      highlight-intensity: "minimal"
      use-case: "Over media, photo overlays"
    
    tinted:
      description: "Brand-colored glass"
      highlight-intensity: "moderate"
      tint-source: "Brand primary/secondary color"
      use-case: "Brand expression, feature cards"
```

**CSS Implementation - Regular Glass**:
```css
.material-glass-regular {
  /* Layer 1: Backdrop blur */
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  
  /* Layer 2: Base tint + highlight gradient */
  background: 
    /* Highlight layer - top edge light reflection */
    radial-gradient(
      ellipse 100% 50% at 50% 0%,
      rgba(255, 255, 255, 0.25) 0%,
      transparent 70%
    ),
    /* Base tint */
    rgba(255, 255, 255, 0.45);
  
  /* Layer 3: Border for edge definition */
  border: 1px solid rgba(255, 255, 255, 0.25);
  
  /* Layer 4: Shadow for depth (Level 2 from elevation system) */
  box-shadow: 
    0 3px 6px rgba(0, 0, 0, 0.08),
    0 1.5px 12px rgba(0, 0, 0, 0.08);
  
  /* Smooth rounded corners per shape system */
  border-radius: var(--radius-container);
}

/* Hover state - increased highlight */
.material-glass-regular:hover {
  background: 
    radial-gradient(
      ellipse 100% 50% at 50% 0%,
      rgba(255, 255, 255, 0.35) 0%,
      transparent 70%
    ),
    rgba(255, 255, 255, 0.50);
}

/* Dark mode */
.dark .material-glass-regular {
  background: 
    radial-gradient(
      ellipse 100% 50% at 50% 0%,
      rgba(255, 255, 255, 0.15) 0%,
      transparent 70%
    ),
    rgba(0, 0, 0, 0.45);
  
  border: 1px solid rgba(255, 255, 255, 0.10);
}
```

**CSS Implementation - Clear Glass**:
```css
.material-glass-clear {
  backdrop-filter: blur(12px) saturate(150%);
  -webkit-backdrop-filter: blur(12px) saturate(150%);
  
  background: 
    radial-gradient(
      ellipse 100% 40% at 50% 0%,
      rgba(255, 255, 255, 0.12) 0%,
      transparent 60%
    ),
    rgba(255, 255, 255, 0.20);
  
  border: 1px solid rgba(255, 255, 255, 0.15);
  
  /* Lighter shadow for less separation */
  box-shadow: 
    0 2px 4px rgba(0, 0, 0, 0.04),
    0 1px 8px rgba(0, 0, 0, 0.04);
}
```

---

### 4.4 Metallic Materials

Gradient-based materials simulating precious metals.

```yaml
metallic:
  purpose: "Premium badges, awards, special features, brand luxury"
  technique: "Multi-stop linear gradients with strategic highlight placement"
  
  PRINCIPLE: "Metallic gradients simulate light reflection on curved surfaces"
  
  formula:
    structure: |
      linear-gradient(
        {angle}deg,
        {shadow-color} 0%,
        {base-light} 15%,
        {highlight} 30%,
        {base} 50%,
        {base-dark} 70%,
        {highlight} 85%,
        {shadow-color} 100%
      )
  
  presets:
    gold:
      shadow: "#462523"
      base-dark: "#9a7b2d"
      base: "#cb9b51"
      base-light: "#f6e27a"
      highlight: "#f6f2c0"
      
    silver:
      shadow: "#3d3d3d"
      base-dark: "#6a6a6a"
      base: "#8c8c8c"
      base-light: "#c0c0c0"
      highlight: "#f0f0f0"
      
    bronze:
      shadow: "#3d2314"
      base-dark: "#7a4a2a"
      base: "#a97142"
      base-light: "#cd9355"
      highlight: "#e8c896"
      
    platinum:
      shadow: "#2a2a2a"
      base-dark: "#5a5a5a"
      base: "#a0a0a0"
      base-light: "#d0d0d0"
      highlight: "#ffffff"
      
    rose-gold:
      shadow: "#4a2020"
      base-dark: "#b76e79"
      base: "#e8a39e"
      base-light: "#f4c4bf"
      highlight: "#fff0ed"
```

**CSS Implementation - Gold**:
```css
.material-metallic-gold {
  background: linear-gradient(
    135deg,
    #462523 0%,
    #cb9b51 15%,
    #f6e27a 30%,
    #f6f2c0 45%,
    #f6e27a 55%,
    #cb9b51 70%,
    #f6e27a 85%,
    #462523 100%
  );
  
  /* Text on metallic surfaces */
  color: #462523;
  
  /* Subtle inner shadow for depth */
  box-shadow: 
    inset 0 1px 0 rgba(255, 255, 255, 0.4),
    inset 0 -1px 0 rgba(0, 0, 0, 0.2);
  
  /* Border for definition */
  border: 1px solid #9a7b2d;
}

/* Animated shine effect (optional enhancement) */
.material-metallic-gold.with-shine {
  position: relative;
  overflow: hidden;
}

.material-metallic-gold.with-shine::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.3) 50%,
    transparent 100%
  );
  animation: metallic-shine 3s ease-in-out infinite;
}

@keyframes metallic-shine {
  0% { left: -100%; }
  50%, 100% { left: 100%; }
}
```

**CSS Implementation - Silver**:
```css
.material-metallic-silver {
  background: linear-gradient(
    135deg,
    #3d3d3d 0%,
    #8c8c8c 15%,
    #c0c0c0 30%,
    #f0f0f0 45%,
    #c0c0c0 55%,
    #8c8c8c 70%,
    #c0c0c0 85%,
    #3d3d3d 100%
  );
  
  color: #2a2a2a;
  
  box-shadow: 
    inset 0 1px 0 rgba(255, 255, 255, 0.5),
    inset 0 -1px 0 rgba(0, 0, 0, 0.15);
  
  border: 1px solid #6a6a6a;
}
```

---

## 5. Token Architecture

### 5.1 Material Token Structure

```json
{
  "material": {
    "translucent": {
      "light": {
        "minimal": { "value": "rgba(255, 255, 255, 0.10)", "type": "color" },
        "subtle": { "value": "rgba(255, 255, 255, 0.25)", "type": "color" },
        "moderate": { "value": "rgba(255, 255, 255, 0.50)", "type": "color" },
        "heavy": { "value": "rgba(255, 255, 255, 0.75)", "type": "color" }
      },
      "dark": {
        "minimal": { "value": "rgba(0, 0, 0, 0.10)", "type": "color" },
        "subtle": { "value": "rgba(0, 0, 0, 0.25)", "type": "color" },
        "moderate": { "value": "rgba(0, 0, 0, 0.50)", "type": "color" },
        "heavy": { "value": "rgba(0, 0, 0, 0.75)", "type": "color" }
      }
    },
    
    "frosted": {
      "blur": {
        "ultra-thin": { "value": "4px", "type": "dimension" },
        "thin": { "value": "8px", "type": "dimension" },
        "regular": { "value": "16px", "type": "dimension" },
        "thick": { "value": "24px", "type": "dimension" },
        "ultra-thick": { "value": "32px", "type": "dimension" }
      },
      "background": {
        "light": {
          "ultra-thin": { "value": "rgba(255, 255, 255, 0.30)", "type": "color" },
          "thin": { "value": "rgba(255, 255, 255, 0.50)", "type": "color" },
          "regular": { "value": "rgba(255, 255, 255, 0.65)", "type": "color" },
          "thick": { "value": "rgba(255, 255, 255, 0.75)", "type": "color" },
          "ultra-thick": { "value": "rgba(255, 255, 255, 0.85)", "type": "color" }
        },
        "dark": {
          "ultra-thin": { "value": "rgba(0, 0, 0, 0.30)", "type": "color" },
          "thin": { "value": "rgba(0, 0, 0, 0.50)", "type": "color" },
          "regular": { "value": "rgba(0, 0, 0, 0.65)", "type": "color" },
          "thick": { "value": "rgba(0, 0, 0, 0.75)", "type": "color" },
          "ultra-thick": { "value": "rgba(0, 0, 0, 0.85)", "type": "color" }
        }
      }
    },
    
    "glass": {
      "blur": {
        "regular": { "value": "20px", "type": "dimension" },
        "clear": { "value": "12px", "type": "dimension" }
      },
      "saturation": {
        "regular": { "value": "180%", "type": "percentage" },
        "clear": { "value": "150%", "type": "percentage" }
      },
      "highlight": {
        "intensity": {
          "minimal": { "value": "0.12", "type": "number" },
          "moderate": { "value": "0.25", "type": "number" },
          "strong": { "value": "0.40", "type": "number" }
        }
      }
    },
    
    "metallic": {
      "gold": {
        "shadow": { "value": "#462523", "type": "color" },
        "base-dark": { "value": "#9a7b2d", "type": "color" },
        "base": { "value": "#cb9b51", "type": "color" },
        "base-light": { "value": "#f6e27a", "type": "color" },
        "highlight": { "value": "#f6f2c0", "type": "color" }
      },
      "silver": {
        "shadow": { "value": "#3d3d3d", "type": "color" },
        "base-dark": { "value": "#6a6a6a", "type": "color" },
        "base": { "value": "#8c8c8c", "type": "color" },
        "base-light": { "value": "#c0c0c0", "type": "color" },
        "highlight": { "value": "#f0f0f0", "type": "color" }
      },
      "bronze": {
        "shadow": { "value": "#3d2314", "type": "color" },
        "base-dark": { "value": "#7a4a2a", "type": "color" },
        "base": { "value": "#a97142", "type": "color" },
        "base-light": { "value": "#cd9355", "type": "color" },
        "highlight": { "value": "#e8c896", "type": "color" }
      },
      "platinum": {
        "shadow": { "value": "#2a2a2a", "type": "color" },
        "base-dark": { "value": "#5a5a5a", "type": "color" },
        "base": { "value": "#a0a0a0", "type": "color" },
        "base-light": { "value": "#d0d0d0", "type": "color" },
        "highlight": { "value": "#ffffff", "type": "color" }
      },
      "rose-gold": {
        "shadow": { "value": "#4a2020", "type": "color" },
        "base-dark": { "value": "#b76e79", "type": "color" },
        "base": { "value": "#e8a39e", "type": "color" },
        "base-light": { "value": "#f4c4bf", "type": "color" },
        "highlight": { "value": "#fff0ed", "type": "color" }
      }
    }
  }
}
```

---

## 6. Accessibility Requirements

### 6.1 Contrast on Materials

```yaml
accessibility:
  WCAG_LEVEL: "AA minimum, AAA recommended for text"
  
  translucent:
    rule: "Text on translucent MUST meet 4.5:1 contrast"
    technique: "Use moderate or heavy opacity for text areas"
    
  frosted:
    rule: "Thick or ultra-thick variants for text content"
    fallback: "Provide solid background alternative"
    
  glass:
    rule: "Avoid text directly on glass if possible"
    technique: "Place text on solid surface within glass container"
    exception: "Labels on glass require heavy opacity + thick blur"
    
  metallic:
    rule: "Use shadow color for text on metallic gradients"
    contrast_check: "Test at multiple gradient positions"
```

### 6.2 Motion Sensitivity

```yaml
reduced_motion:
  rule: "Respect prefers-reduced-motion"
  
  affected_features:
    - metallic_shine_animation: "Disable entirely"
    - glass_highlight_transitions: "Reduce to instant"
    - blur_transitions: "Reduce duration to 0ms"
  
  implementation: |
    @media (prefers-reduced-motion: reduce) {
      .material-metallic-gold.with-shine::after {
        animation: none;
      }
      
      .material-glass-regular {
        transition: none;
      }
    }
```

### 6.3 Fallbacks for Unsupported Browsers

```css
/* backdrop-filter fallback */
.material-frosted-regular {
  /* Fallback: solid with high opacity */
  background: rgba(255, 255, 255, 0.92);
}

@supports (backdrop-filter: blur(16px)) {
  .material-frosted-regular {
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    background: rgba(255, 255, 255, 0.65);
  }
}
```

---

## 7. Platform Implementation

### 7.1 React Web Component

```typescript
interface MaterialProps {
  variant: 'translucent' | 'frosted' | 'glass' | 'metallic';
  intensity?: 'ultra-thin' | 'thin' | 'regular' | 'thick' | 'ultra-thick';
  metalType?: 'gold' | 'silver' | 'bronze' | 'platinum' | 'rose-gold';
  tint?: string; // Brand color for tinted variants
  withShine?: boolean; // For metallic animated shine
  className?: string;
  children: React.ReactNode;
}

// Usage
<Material variant="glass" intensity="regular">
  <Card>Content here</Card>
</Material>

<Material variant="metallic" metalType="gold" withShine>
  <Badge>Premium</Badge>
</Material>
```

### 7.2 React Native Implementation

```typescript
// React Native uses different techniques:

// Translucent: Direct RGBA backgrounds
// Frosted: expo-blur or @react-native-community/blur
// Glass: Combination of blur + gradients
// Metallic: LinearGradient from expo-linear-gradient

import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

// Frosted example
<BlurView intensity={50} tint="light">
  <View style={styles.content}>
    {children}
  </View>
</BlurView>

// Metallic example
<LinearGradient
  colors={['#462523', '#cb9b51', '#f6e27a', '#f6f2c0', '#f6e27a', '#cb9b51', '#462523']}
  locations={[0, 0.15, 0.30, 0.45, 0.55, 0.70, 1]}
  start={{ x: 0, y: 0 }}
  end={{ x: 1, y: 1 }}
>
  {children}
</LinearGradient>
```

---

## 8. Use Case Guidelines

### 8.1 When to Use Each Material

| Use Case | Recommended Material | Rationale |
|----------|---------------------|-----------|
| Media scrim overlay | Translucent dark moderate | Readable text, visible media |
| Navigation bar | Frosted thin/regular | Context preservation |
| Modal background | Frosted thick | Focus on modal content |
| Hero card | Glass regular | Premium feel |
| Video controls | Glass clear | See video, clear controls |
| Premium badge | Metallic gold | Luxury signifier |
| Achievement indicator | Metallic silver/bronze | Gamification |
| Brand feature highlight | Glass tinted | Brand expression |

### 8.2 What NOT to Do

```yaml
anti_patterns:
  - "Glass on glass (no stacking glass materials)"
  - "Text directly on thin frosted without contrast check"
  - "Metallic on non-flat surfaces (designed for flat elements)"
  - "Glass effects on rapidly changing backgrounds"
  - "Heavy blur on performance-constrained devices"
```

---

## 9. Performance Considerations

### 9.1 Performance Impact

| Material | GPU Impact | Recommendation |
|----------|-----------|----------------|
| Translucent | Minimal | Use freely |
| Frosted (thin) | Low | Good for mobile |
| Frosted (thick) | Moderate | Limit quantity |
| Glass | Moderate-High | 1-2 per viewport |
| Metallic | Low | Gradient only, performant |

### 9.2 Optimization Rules

```yaml
optimization:
  max_blur_elements: 3  # Per viewport
  
  mobile_restrictions:
    max_blur: "16px"      # Avoid thick/ultra-thick
    avoid_saturation: true # Skip saturate() filter
    
  animation_budget:
    metallic_shine: "Only on hover/interaction"
    glass_transitions: "300ms maximum"
    
  lazy_application:
    rule: "Apply blur only when element is in viewport"
    technique: "Intersection Observer + CSS class toggle"
```

---

## 10. Multi-Brand Configuration

### 10.1 Brand Material Overrides

```json
{
  "brand": {
    "jiocinema": {
      "material": {
        "glass": {
          "tint": {
            "default": "var(--color-brand-primary)",
            "opacity": 0.35
          }
        },
        "preferred": "glass"
      }
    },
    
    "jiomart": {
      "material": {
        "metallic": {
          "premium-tier": "gold",
          "standard-tier": "silver"
        },
        "preferred": "frosted"
      }
    },
    
    "jiohotstar": {
      "material": {
        "glass": {
          "tint": {
            "default": "var(--color-brand-secondary)",
            "opacity": 0.40
          }
        },
        "preferred": "glass"
      }
    }
  }
}
```

---

## 11. Future Enhancements

### Phase 2: Advanced Effects
- **Refraction simulation**: SVG displacement maps for edge distortion (progressive enhancement)
- **Chromatic aberration**: Color fringing on glass edges
- **Depth-reactive materials**: Materials that respond to scroll/parallax

### Phase 3: Dynamic Materials
- **Environment-responsive**: Materials that adapt to device light sensor
- **Time-based**: Materials that shift with time of day
- **Content-aware tinting**: Glass that samples dominant color from background

---

## 12. Validation Checklist

```yaml
quality_gates:
  tokens:
    - "All material values defined as tokens"
    - "No hard-coded colors or dimensions"
    - "Tokens follow naming convention"
  
  accessibility:
    - "Contrast ratios validated"
    - "Reduced motion respected"
    - "Fallbacks provided"
  
  performance:
    - "Blur count per viewport ≤ 3"
    - "Mobile blur ≤ 16px"
    - "Animation budget respected"
  
  platform_parity:
    - "Web CSS matches React Native visual"
    - "API consistent across platforms"
  
  browser_support:
    - "Fallbacks for no backdrop-filter"
    - "Tested in Safari, Chrome, Firefox"
```

---

## 13. Implementation Roadmap

| Phase | Scope | Timeline |
|-------|-------|----------|
| 1.0 | Translucent + Frosted | Week 1-2 |
| 1.1 | Metallic presets | Week 3 |
| 1.2 | Glass (regular, clear) | Week 4-5 |
| 1.3 | Glass tinted + brand config | Week 6 |
| 2.0 | Advanced effects (optional) | Future |

---

## 14. References

- Apple Human Interface Guidelines: Materials
- Apple Liquid Glass Documentation (iOS 26)
- CSS-Tricks: Getting Clarity on Apple's Liquid Glass
- LogRocket: How to Create Liquid Glass Effects with CSS and SVG
- One UI Studio: Elevations Documentation
- One UI Studio: Colour Surfaces Documentation

---

**Document Status**: Ready for Review  
**Next Steps**: Token definition in Figma, Component implementation, Storybook documentation
