/**
 * seed.ts
 *
 * Development seed data for local testing
 * Run with: npx convex run convex/seed:seedDatabase
 *
 * Includes ALL tokens from primitives.css for comprehensive Token Explorer
 */

import { mutation } from './_generated/server';
import { STROKE_SCALE_TOKENS } from '@oneui/shared';
import { requirePlatformOwner } from './lib/auth';

/**
 * All primitive tokens from primitives.css
 * Organized by category for the Token Explorer
 */
const ALL_TOKENS = [
  // ========================================
  // SHAPE TOKENS
  // ========================================
  { name: 'Shape-Pill', category: 'shape', value: '9999px', description: 'Fully rounded for circular elements (avatars, dots, spinners)' },
  { name: 'Shape-0-5', category: 'shape', value: 'var(--Dimension-f-7)', description: 'Shape 6XS — derived from dimension f-7' },
  { name: 'Shape-1', category: 'shape', value: 'var(--Dimension-f-6)', description: 'Shape 5XS — derived from dimension f-6' },
  { name: 'Shape-1-5', category: 'shape', value: 'var(--Dimension-f-5)', description: 'Shape 4XS — derived from dimension f-5' },
  { name: 'Shape-2', category: 'shape', value: 'var(--Dimension-f-4)', description: 'Shape 3XS — derived from dimension f-4' },
  { name: 'Shape-2-5', category: 'shape', value: 'var(--Dimension-f-3)', description: 'Shape 2XS — derived from dimension f-3' },
  { name: 'Shape-3', category: 'shape', value: 'var(--Dimension-f-2)', description: 'Shape XS — derived from dimension f-2' },
  { name: 'Shape-3-5', category: 'shape', value: 'var(--Dimension-f-1)', description: 'Shape S — derived from dimension f-1' },
  { name: 'Shape-4', category: 'shape', value: 'var(--Dimension-f0)', description: 'Shape M — derived from dimension f0' },
  { name: 'Shape-4-5', category: 'shape', value: 'var(--Dimension-f1)', description: 'Shape L — derived from dimension f1' },
  { name: 'Shape-5', category: 'shape', value: 'var(--Dimension-f2)', description: 'Shape XL — derived from dimension f2' },
  { name: 'Shape-6', category: 'shape', value: 'var(--Dimension-f3)', description: 'Shape 2XL — derived from dimension f3' },
  { name: 'Shape-7', category: 'shape', value: 'var(--Dimension-f4)', description: 'Shape 3XL — derived from dimension f4' },
  { name: 'Shape-8', category: 'shape', value: 'var(--Dimension-f5)', description: 'Shape 4XL — derived from dimension f5' },
  { name: 'Shape-9', category: 'shape', value: 'var(--Dimension-f6)', description: 'Shape 5XL — derived from dimension f6' },
  { name: 'Shape-10', category: 'shape', value: 'var(--Dimension-f7)', description: 'Shape 6XL — derived from dimension f7' },

  // ========================================
  // DIMENSION TOKENS (f-steps)
  // ========================================
  { name: 'Dimension-f-8', category: 'dimension', value: '0px', description: 'Micro step -8 (zero)' },
  { name: 'Dimension-f-7', category: 'dimension', value: '2px', description: 'Micro step -7' },
  { name: 'Dimension-f-6', category: 'dimension', value: '4px', description: 'Micro step -6' },
  { name: 'Dimension-f-5', category: 'dimension', value: '6px', description: 'Micro step -5' },
  { name: 'Dimension-f-4', category: 'dimension', value: '8px', description: 'Micro step -4' },
  { name: 'Dimension-f-3', category: 'dimension', value: '10px', description: 'Micro step -3' },
  { name: 'Dimension-f-2', category: 'dimension', value: '12px', description: 'Micro step -2' },
  { name: 'Dimension-f-1', category: 'dimension', value: '14px', description: 'Micro step -1' },
  { name: 'Dimension-f0', category: 'dimension', value: '16px', description: 'Base size (f0) - Mobile base' },
  { name: 'Dimension-f1', category: 'dimension', value: '18px', description: 'Step 1 above base' },
  { name: 'Dimension-f2', category: 'dimension', value: '20px', description: 'Step 2 above base' },
  { name: 'Dimension-f2-5', category: 'dimension', value: '22px', description: 'Midpoint between f2 and f3' },
  { name: 'Dimension-f3', category: 'dimension', value: '24px', description: 'Step 3 above base' },
  { name: 'Dimension-f4', category: 'dimension', value: '28px', description: 'Step 4 above base' },
  { name: 'Dimension-f5', category: 'dimension', value: '32px', description: 'Step 5 above base' },
  { name: 'Dimension-f6', category: 'dimension', value: '36px', description: 'Step 6 above base' },
  { name: 'Dimension-f7', category: 'dimension', value: '40px', description: 'Step 7 above base' },
  { name: 'Dimension-f8', category: 'dimension', value: '48px', description: 'Step 8 above base' },
  { name: 'Dimension-f9', category: 'dimension', value: '56px', description: 'Step 9 above base' },
  { name: 'Dimension-f10', category: 'dimension', value: '64px', description: 'Step 10 above base' },
  { name: 'Dimension-f11', category: 'dimension', value: '72px', description: 'Step 11 above base' },
  { name: 'Dimension-f12', category: 'dimension', value: '80px', description: 'Step 12 above base' },
  { name: 'Dimension-f13', category: 'dimension', value: '96px', description: 'Step 13 above base' },
  { name: 'Dimension-f14', category: 'dimension', value: '112px', description: 'Step 14 above base' },
  { name: 'Dimension-f15', category: 'dimension', value: '128px', description: 'Step 15 above base' },
  { name: 'Dimension-f16', category: 'dimension', value: '160px', description: 'Step 16 above base' },

  // ========================================
  // SPACING TOKENS
  // ========================================
  { name: 'Spacing-0', category: 'spacing', value: 'var(--Dimension-f-8)', description: 'Spacing 0 (0px)' },
  { name: 'Spacing-0-5', category: 'spacing', value: 'var(--Dimension-f-7)', description: 'Spacing 0.5 (2px)' },
  { name: 'Spacing-1', category: 'spacing', value: 'var(--Dimension-f-6)', description: 'Spacing 1 (4px)' },
  { name: 'Spacing-1-5', category: 'spacing', value: 'var(--Dimension-f-5)', description: 'Spacing 1.5 (6px)' },
  { name: 'Spacing-2', category: 'spacing', value: 'var(--Dimension-f-4)', description: 'Spacing 2 (8px)' },
  { name: 'Spacing-2-5', category: 'spacing', value: 'var(--Dimension-f-3)', description: 'Spacing 2.5 (10px)' },
  { name: 'Spacing-3', category: 'spacing', value: 'var(--Dimension-f-2)', description: 'Spacing 3 (12px)' },
  { name: 'Spacing-3-5', category: 'spacing', value: 'var(--Dimension-f-1)', description: 'Spacing 3.5 (14px)' },
  { name: 'Spacing-4', category: 'spacing', value: 'var(--Dimension-f0)', description: 'Spacing 4 (16px)' },
  { name: 'Spacing-4-5', category: 'spacing', value: 'var(--Dimension-f1)', description: 'Spacing 4.5 (18px)' },
  { name: 'Spacing-5', category: 'spacing', value: 'var(--Dimension-f2)', description: 'Spacing 5 (20px)' },
  { name: 'Spacing-5-5', category: 'spacing', value: 'var(--Dimension-f2-5)', description: 'Spacing 5.5 (22px)' },
  { name: 'Spacing-6', category: 'spacing', value: 'var(--Dimension-f3)', description: 'Spacing 6 (24px)' },
  { name: 'Spacing-7', category: 'spacing', value: 'var(--Dimension-f4)', description: 'Spacing 7 (28px)' },
  { name: 'Spacing-8', category: 'spacing', value: 'var(--Dimension-f5)', description: 'Spacing 8 (32px)' },
  { name: 'Spacing-9', category: 'spacing', value: 'var(--Dimension-f6)', description: 'Spacing 9 (36px)' },
  { name: 'Spacing-10', category: 'spacing', value: 'var(--Dimension-f7)', description: 'Spacing 10 (40px)' },
  { name: 'Spacing-12', category: 'spacing', value: 'var(--Dimension-f8)', description: 'Spacing 12 (48px)' },
  { name: 'Spacing-14', category: 'spacing', value: 'var(--Dimension-f9)', description: 'Spacing 14 (56px)' },
  { name: 'Spacing-16', category: 'spacing', value: 'var(--Dimension-f10)', description: 'Spacing 16 (64px)' },
  { name: 'Spacing-18', category: 'spacing', value: 'var(--Dimension-f11)', description: 'Spacing 18 (72px)' },
  { name: 'Spacing-20', category: 'spacing', value: 'var(--Dimension-f12)', description: 'Spacing 20 (80px)' },
  { name: 'Spacing-24', category: 'spacing', value: 'var(--Dimension-f13)', description: 'Spacing 24 (96px)' },
  { name: 'Spacing-28', category: 'spacing', value: 'var(--Dimension-f14)', description: 'Spacing 28 (112px)' },
  { name: 'Spacing-32', category: 'spacing', value: 'var(--Dimension-f15)', description: 'Spacing 32 (128px)' },
  { name: 'Spacing-40', category: 'spacing', value: 'var(--Dimension-f16)', description: 'Spacing 40 (160px)' },
  { name: 'Spacing-Margin', category: 'spacing', value: 'var(--Grid-Margin)', description: 'Grid margin spacing alias' },
  { name: 'Spacing-Gutter', category: 'spacing', value: 'var(--Grid-Gutter)', description: 'Grid gutter spacing alias' },

  // ========================================
  // MOTION TOKENS - Duration (Jio system, 37 tokens computed from 300ms base × 1.5 ratio)
  // ========================================
  // Moderate durations (default)
  { name: 'Motion-Duration-2XS', category: 'motion/duration', value: '60ms', description: 'Moderate 2XS duration' },
  { name: 'Motion-Duration-XS', category: 'motion/duration', value: '90ms', description: 'Moderate XS duration' },
  { name: 'Motion-Duration-S', category: 'motion/duration', value: '135ms', description: 'Moderate S duration' },
  { name: 'Motion-Duration-M', category: 'motion/duration', value: '200ms', description: 'Moderate M duration' },
  { name: 'Motion-Duration-L', category: 'motion/duration', value: '300ms', description: 'Moderate L duration (default)' },
  { name: 'Motion-Duration-XL', category: 'motion/duration', value: '450ms', description: 'Moderate XL duration' },
  { name: 'Motion-Duration-2XL', category: 'motion/duration', value: '675ms', description: 'Moderate 2XL duration' },
  { name: 'Motion-Duration-3XL', category: 'motion/duration', value: '1015ms', description: 'Moderate 3XL duration' },
  // Subtle durations (reduced-motion variants)
  { name: 'Motion-Duration-Subtle-2XS', category: 'motion/duration', value: '40ms', description: 'Subtle 2XS duration' },
  { name: 'Motion-Duration-Subtle-XS', category: 'motion/duration', value: '60ms', description: 'Subtle XS duration' },
  { name: 'Motion-Duration-Subtle-S', category: 'motion/duration', value: '90ms', description: 'Subtle S duration' },
  { name: 'Motion-Duration-Subtle-M', category: 'motion/duration', value: '135ms', description: 'Subtle M duration' },
  { name: 'Motion-Duration-Subtle-L', category: 'motion/duration', value: '200ms', description: 'Subtle L duration' },
  { name: 'Motion-Duration-Subtle-XL', category: 'motion/duration', value: '300ms', description: 'Subtle XL duration' },
  { name: 'Motion-Duration-Subtle-2XL', category: 'motion/duration', value: '450ms', description: 'Subtle 2XL duration' },
  { name: 'Motion-Duration-Subtle-3XL', category: 'motion/duration', value: '675ms', description: 'Subtle 3XL duration' },

  // ========================================
  // MOTION TOKENS - Easing (Jio system, per-type Moderate/Subtle variants)
  // ========================================
  { name: 'Motion-Easing-Entrance-Moderate', category: 'motion/easing', value: 'cubic-bezier(0.25, 0.8, 0.5, 1)', description: 'Entrance easing — Moderate (ease-out)' },
  { name: 'Motion-Easing-Entrance-Subtle', category: 'motion/easing', value: 'cubic-bezier(0.2, 0.3, 0.5, 0.9)', description: 'Entrance easing — Subtle' },
  { name: 'Motion-Easing-Exit-Moderate', category: 'motion/easing', value: 'cubic-bezier(0.7, 0.1, 0.9, 0.7)', description: 'Exit easing — Moderate (ease-in)' },
  { name: 'Motion-Easing-Exit-Subtle', category: 'motion/easing', value: 'cubic-bezier(0.5, 0.1, 1, 1)', description: 'Exit easing — Subtle' },
  { name: 'Motion-Easing-Transition-Moderate', category: 'motion/easing', value: 'cubic-bezier(0.5, 0, 0.3, 1)', description: 'Transition easing — Moderate (ease-in-out)' },
  { name: 'Motion-Easing-Transition-Subtle', category: 'motion/easing', value: 'cubic-bezier(0.4, 0, 0.5, 1)', description: 'Transition easing — Subtle' },
  { name: 'Motion-Easing-Bounce-Moderate', category: 'motion/easing', value: 'cubic-bezier(0.2, 1.4, 0.3, 1)', description: 'Bounce easing — Moderate (overshoot)' },
  { name: 'Motion-Easing-Bounce-Subtle', category: 'motion/easing', value: 'cubic-bezier(0.4, 0, 0.5, 1)', description: 'Bounce easing — Subtle' },
  { name: 'Motion-Easing-Linear', category: 'motion/easing', value: 'linear', description: 'Linear — continuous animations' },

  // ========================================
  // TYPOGRAPHY TOKENS - Font
  // ========================================
  { name: 'Typography-Font-Primary', category: 'typography/font', value: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", description: 'Primary font family' },
  { name: 'Typography-Font-Mono', category: 'typography/font', value: "'JetBrains Mono', 'Fira Code', 'SF Mono', Consolas, monospace", description: 'Monospace font family' },

  // ========================================
  // TYPOGRAPHY TOKENS - Weight
  // ========================================
  { name: 'Typography-Weight-Regular', category: 'typography/weight', value: '400', description: 'Regular font weight' },
  { name: 'Typography-Weight-Medium', category: 'typography/weight', value: '500', description: 'Medium font weight' },
  { name: 'Typography-Weight-Semibold', category: 'typography/weight', value: '600', description: 'Semibold font weight' },
  { name: 'Typography-Weight-Bold', category: 'typography/weight', value: '700', description: 'Bold font weight' },
  { name: 'Typography-Weight-Extrabold', category: 'typography/weight', value: '900', description: 'Extra bold font weight' },

  // ========================================
  // TYPOGRAPHY TOKENS - Size
  // ========================================
  { name: 'Typography-Size-3XS', category: 'typography/size', value: '0.5625rem', description: '3X small text size (9px)' },
  { name: 'Typography-Size-2XS', category: 'typography/size', value: '0.625rem', description: '2X small text size (10px)' },
  { name: 'Typography-Size-XS', category: 'typography/size', value: '0.6875rem', description: 'Extra small text size (11px)' },
  { name: 'Typography-Size-S', category: 'typography/size', value: '0.75rem', description: 'Small text size (12px)' },
  { name: 'Typography-Size-M', category: 'typography/size', value: '0.8125rem', description: 'Medium text size (13px)' },
  { name: 'Typography-Size-L', category: 'typography/size', value: '0.875rem', description: 'Large text size (14px)' },
  { name: 'Typography-Size-XL', category: 'typography/size', value: '1rem', description: 'Extra large text size (16px)' },
  { name: 'Typography-Size-2XL', category: 'typography/size', value: '1.125rem', description: '2X large text size (18px)' },
  { name: 'Typography-Size-3XL', category: 'typography/size', value: '1.25rem', description: '3X large text size (20px)' },
  { name: 'Typography-Size-4XL', category: 'typography/size', value: '1.5rem', description: '4X large text size (24px)' },
  { name: 'Typography-Size-5XL', category: 'typography/size', value: '1.75rem', description: '5X large text size (28px)' },

  // ========================================
  // TYPOGRAPHY TOKENS - Line Height
  // ========================================
  { name: 'Typography-LineHeight-Tight', category: 'typography/lineheight', value: '1.2', description: 'Tight line height' },
  { name: 'Typography-LineHeight-Normal', category: 'typography/lineheight', value: '1.5', description: 'Normal line height' },
  { name: 'Typography-LineHeight-Relaxed', category: 'typography/lineheight', value: '1.625', description: 'Relaxed line height' },

  // ========================================
  // TYPOGRAPHY TOKENS - Letter Spacing
  // ========================================
  { name: 'Typography-LetterSpacing-Tight', category: 'typography/letterspacing', value: '-0.02em', description: 'Tight letter spacing' },
  { name: 'Typography-LetterSpacing-Normal', category: 'typography/letterspacing', value: '0', description: 'Normal letter spacing' },
  { name: 'Typography-LetterSpacing-Wide', category: 'typography/letterspacing', value: '0.025em', description: 'Wide letter spacing' },
  { name: 'Typography-LetterSpacing-Wider', category: 'typography/letterspacing', value: '0.05em', description: 'Wider letter spacing' },

  // ========================================
  // ELEVATION TOKENS
  // ========================================
  { name: 'Elevation-0', category: 'elevation', value: 'none', description: 'No elevation (flat)' },
  { name: 'Elevation-1', category: 'elevation', value: '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06)', description: 'Level 1 elevation - Cards, list items' },
  { name: 'Elevation-2', category: 'elevation', value: '0 3px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)', description: 'Level 2 elevation - Raised buttons' },
  { name: 'Elevation-3', category: 'elevation', value: '0 10px 20px rgba(0, 0, 0, 0.12), 0 3px 6px rgba(0, 0, 0, 0.08)', description: 'Level 3 elevation - Navigation bars' },
  { name: 'Elevation-4', category: 'elevation', value: '0 15px 25px rgba(0, 0, 0, 0.15), 0 5px 10px rgba(0, 0, 0, 0.08)', description: 'Level 4 elevation - Modal dialogs' },
  { name: 'Elevation-5', category: 'elevation', value: '0 20px 40px rgba(0, 0, 0, 0.2), 0 8px 16px rgba(0, 0, 0, 0.1)', description: 'Level 5 elevation - Popovers, tooltips' },
  { name: 'Shadow-Subtle', category: 'elevation', value: '0 2px 8px rgba(0, 0, 0, 0.1)', description: 'Subtle shadow for cards' },

  // ========================================
  // COMPONENT TOKENS
  // ========================================
  { name: 'Component-Height-TopBar', category: 'component', value: '52px', description: 'Top bar height' },
  { name: 'Component-Width-LeftNav', category: 'component', value: '240px', description: 'Left nav width (expanded)' },
  { name: 'Component-Width-LeftNav-Collapsed', category: 'component', value: '60px', description: 'Left nav width (collapsed)' },
  { name: 'Component-Max-Height-Dialog', category: 'component', value: '300px', description: 'Dialog max height' },
  { name: 'Dialog-Height-Medium', category: 'component', value: '600px', description: 'Medium dialog height' },
  { name: 'Dialog-Height-Large', category: 'component', value: '1000px', description: 'Large dialog height' },
  { name: 'Touch-Target-Min', category: 'component', value: '40px', description: 'Minimum touch target size' },

  // ========================================
  // STROKE TOKENS
  // ========================================
  ...STROKE_SCALE_TOKENS.map((stroke) => ({
    name: stroke.token,
    category: 'stroke',
    value: stroke.value,
    description: stroke.description,
  })),

  // ========================================
  // MATERIAL TOKENS - Translucent
  // ========================================
  { name: 'Material-Translucent-Light-Minimal', category: 'material/translucent', value: 'rgba(255, 255, 255, 0.10)', description: 'Minimal light translucent overlay' },
  { name: 'Material-Translucent-Light-Subtle', category: 'material/translucent', value: 'rgba(255, 255, 255, 0.25)', description: 'Subtle light translucent overlay' },
  { name: 'Material-Translucent-Light-Moderate', category: 'material/translucent', value: 'rgba(255, 255, 255, 0.50)', description: 'Moderate light translucent overlay' },
  { name: 'Material-Translucent-Light-Heavy', category: 'material/translucent', value: 'rgba(255, 255, 255, 0.75)', description: 'Heavy light translucent overlay' },
  { name: 'Material-Translucent-Dark-Minimal', category: 'material/translucent', value: 'rgba(0, 0, 0, 0.10)', description: 'Minimal dark translucent overlay' },
  { name: 'Material-Translucent-Dark-Subtle', category: 'material/translucent', value: 'rgba(0, 0, 0, 0.25)', description: 'Subtle dark translucent overlay' },
  { name: 'Material-Translucent-Dark-Moderate', category: 'material/translucent', value: 'rgba(0, 0, 0, 0.50)', description: 'Moderate dark translucent overlay' },
  { name: 'Material-Translucent-Dark-Heavy', category: 'material/translucent', value: 'rgba(0, 0, 0, 0.75)', description: 'Heavy dark translucent overlay' },

  // ========================================
  // MATERIAL TOKENS - Frosted Blur
  // ========================================
  { name: 'Material-Frosted-Blur-UltraThin', category: 'material/frosted', value: '4px', description: 'Ultra thin frosted blur' },
  { name: 'Material-Frosted-Blur-Thin', category: 'material/frosted', value: '8px', description: 'Thin frosted blur' },
  { name: 'Material-Frosted-Blur-Regular', category: 'material/frosted', value: '16px', description: 'Regular frosted blur' },
  { name: 'Material-Frosted-Blur-Thick', category: 'material/frosted', value: '24px', description: 'Thick frosted blur' },
  { name: 'Material-Frosted-Blur-UltraThick', category: 'material/frosted', value: '32px', description: 'Ultra thick frosted blur' },

  // ========================================
  // MATERIAL TOKENS - Frosted Background
  // ========================================
  { name: 'Material-Frosted-Background-UltraThin', category: 'material/frosted', value: 'rgba(255, 255, 255, 0.30)', description: 'Ultra thin frosted background' },
  { name: 'Material-Frosted-Background-Thin', category: 'material/frosted', value: 'rgba(255, 255, 255, 0.50)', description: 'Thin frosted background' },
  { name: 'Material-Frosted-Background-Regular', category: 'material/frosted', value: 'rgba(255, 255, 255, 0.65)', description: 'Regular frosted background' },
  { name: 'Material-Frosted-Background-Thick', category: 'material/frosted', value: 'rgba(255, 255, 255, 0.75)', description: 'Thick frosted background' },
  { name: 'Material-Frosted-Background-UltraThick', category: 'material/frosted', value: 'rgba(255, 255, 255, 0.85)', description: 'Ultra thick frosted background' },
  { name: 'Material-Frosted-Border', category: 'material/frosted', value: 'rgba(255, 255, 255, 0.20)', description: 'Frosted border' },

  // ========================================
  // MATERIAL TOKENS - Glass
  // ========================================
  { name: 'Material-Glass-Blur-Regular', category: 'material/glass', value: '20px', description: 'Regular glass blur' },
  { name: 'Material-Glass-Blur-Clear', category: 'material/glass', value: '12px', description: 'Clear glass blur' },
  { name: 'Material-Glass-Saturation-Regular', category: 'material/glass', value: '180%', description: 'Regular glass saturation' },
  { name: 'Material-Glass-Saturation-Clear', category: 'material/glass', value: '150%', description: 'Clear glass saturation' },
  { name: 'Material-Glass-Highlight-Minimal', category: 'material/glass', value: '0.12', description: 'Minimal glass highlight' },
  { name: 'Material-Glass-Highlight-Moderate', category: 'material/glass', value: '0.25', description: 'Moderate glass highlight' },
  { name: 'Material-Glass-Highlight-Strong', category: 'material/glass', value: '0.40', description: 'Strong glass highlight' },
  { name: 'Material-Glass-Tint-Light', category: 'material/glass', value: 'rgba(255, 255, 255, 0.45)', description: 'Light glass tint' },
  { name: 'Material-Glass-Tint-Dark', category: 'material/glass', value: 'rgba(0, 0, 0, 0.45)', description: 'Dark glass tint' },
  { name: 'Material-Glass-Border-Light', category: 'material/glass', value: 'rgba(255, 255, 255, 0.25)', description: 'Light glass border' },
  { name: 'Material-Glass-Border-Dark', category: 'material/glass', value: 'rgba(255, 255, 255, 0.10)', description: 'Dark glass border' },

  // ========================================
  // MATERIAL TOKENS - Metallic Gold
  // ========================================
  { name: 'Material-Metallic-Gold-Shadow', category: 'material/metallic', value: '#462523', description: 'Gold shadow color' },
  { name: 'Material-Metallic-Gold-BaseDark', category: 'material/metallic', value: '#9a7b2d', description: 'Gold dark base' },
  { name: 'Material-Metallic-Gold-Base', category: 'material/metallic', value: '#cb9b51', description: 'Gold base color' },
  { name: 'Material-Metallic-Gold-BaseLight', category: 'material/metallic', value: '#f6e27a', description: 'Gold light base' },
  { name: 'Material-Metallic-Gold-Highlight', category: 'material/metallic', value: '#f6f2c0', description: 'Gold highlight' },
  { name: 'Material-Metallic-Gold-Text', category: 'material/metallic', value: '#462523', description: 'Gold text color' },

  // ========================================
  // MATERIAL TOKENS - Metallic Silver
  // ========================================
  { name: 'Material-Metallic-Silver-Shadow', category: 'material/metallic', value: '#3d3d3d', description: 'Silver shadow color' },
  { name: 'Material-Metallic-Silver-BaseDark', category: 'material/metallic', value: '#6a6a6a', description: 'Silver dark base' },
  { name: 'Material-Metallic-Silver-Base', category: 'material/metallic', value: '#8c8c8c', description: 'Silver base color' },
  { name: 'Material-Metallic-Silver-BaseLight', category: 'material/metallic', value: '#c0c0c0', description: 'Silver light base' },
  { name: 'Material-Metallic-Silver-Highlight', category: 'material/metallic', value: '#f0f0f0', description: 'Silver highlight' },
  { name: 'Material-Metallic-Silver-Text', category: 'material/metallic', value: '#2a2a2a', description: 'Silver text color' },

  // ========================================
  // MATERIAL TOKENS - Metallic Bronze
  // ========================================
  { name: 'Material-Metallic-Bronze-Shadow', category: 'material/metallic', value: '#3d2314', description: 'Bronze shadow color' },
  { name: 'Material-Metallic-Bronze-BaseDark', category: 'material/metallic', value: '#7a4a2a', description: 'Bronze dark base' },
  { name: 'Material-Metallic-Bronze-Base', category: 'material/metallic', value: '#a97142', description: 'Bronze base color' },
  { name: 'Material-Metallic-Bronze-BaseLight', category: 'material/metallic', value: '#cd9355', description: 'Bronze light base' },
  { name: 'Material-Metallic-Bronze-Highlight', category: 'material/metallic', value: '#e8c896', description: 'Bronze highlight' },
  { name: 'Material-Metallic-Bronze-Text', category: 'material/metallic', value: '#3d2314', description: 'Bronze text color' },

  // ========================================
  // MATERIAL TOKENS - Metallic Platinum
  // ========================================
  { name: 'Material-Metallic-Platinum-Shadow', category: 'material/metallic', value: '#2a2a2a', description: 'Platinum shadow color' },
  { name: 'Material-Metallic-Platinum-BaseDark', category: 'material/metallic', value: '#5a5a5a', description: 'Platinum dark base' },
  { name: 'Material-Metallic-Platinum-Base', category: 'material/metallic', value: '#a0a0a0', description: 'Platinum base color' },
  { name: 'Material-Metallic-Platinum-BaseLight', category: 'material/metallic', value: '#d0d0d0', description: 'Platinum light base' },
  { name: 'Material-Metallic-Platinum-Highlight', category: 'material/metallic', value: '#ffffff', description: 'Platinum highlight' },
  { name: 'Material-Metallic-Platinum-Text', category: 'material/metallic', value: '#2a2a2a', description: 'Platinum text color' },

  // ========================================
  // MATERIAL TOKENS - Metallic Rose Gold
  // ========================================
  { name: 'Material-Metallic-RoseGold-Shadow', category: 'material/metallic', value: '#4a2020', description: 'Rose Gold shadow color' },
  { name: 'Material-Metallic-RoseGold-BaseDark', category: 'material/metallic', value: '#b76e79', description: 'Rose Gold dark base' },
  { name: 'Material-Metallic-RoseGold-Base', category: 'material/metallic', value: '#e8a39e', description: 'Rose Gold base color' },
  { name: 'Material-Metallic-RoseGold-BaseLight', category: 'material/metallic', value: '#f4c4bf', description: 'Rose Gold light base' },
  { name: 'Material-Metallic-RoseGold-Highlight', category: 'material/metallic', value: '#fff0ed', description: 'Rose Gold highlight' },
  { name: 'Material-Metallic-RoseGold-Text', category: 'material/metallic', value: '#4a2020', description: 'Rose Gold text color' },
];

/**
 * Color tokens that need mode variations (light/dark/dim)
 */
const COLOR_TOKENS_BY_MODE = {
  light: [
    { name: 'Surface-Default', category: 'color/surface', value: 'oklch(100% 0 0)', description: 'Default surface (white in light mode)' },
    { name: 'Surface-Minimal', category: 'color/surface', value: 'oklch(97% 0.005 280)', description: 'Minimal surface (+1 step from background)' },
    { name: 'Surface-Subtle', category: 'color/surface', value: 'oklch(94% 0.008 280)', description: 'Subtle surface (+2 steps from background)' },
    { name: 'Surface-Bold', category: 'color/surface', value: 'oklch(25% 0.02 280)', description: 'Bold surface (high contrast emphasis)' },
    { name: 'Surface-Elevated', category: 'color/surface', value: 'oklch(100% 0 0)', description: 'Elevated surface (default + elevation)' },
    { name: 'Text-High', category: 'color/text', value: 'oklch(15% 0 0)', description: 'High contrast text' },
    { name: 'Text-Medium', category: 'color/text', value: 'oklch(45% 0 0)', description: 'Medium contrast text' },
    { name: 'Text-Low', category: 'color/text', value: 'oklch(65% 0 0)', description: 'Low contrast text' },
    { name: 'Text-OnBold-High', category: 'color/text', value: 'oklch(98% 0 0)', description: 'High contrast text on bold surfaces' },
  ],
  dark: [
    { name: 'Surface-Default', category: 'color/surface', value: 'oklch(12% 0 0)', description: 'Default surface (very dark in dark mode)' },
    { name: 'Surface-Minimal', category: 'color/surface', value: 'oklch(15% 0.005 280)', description: 'Minimal surface (+1 step from background)' },
    { name: 'Surface-Subtle', category: 'color/surface', value: 'oklch(18% 0.008 280)', description: 'Subtle surface (+2 steps from background)' },
    { name: 'Surface-Bold', category: 'color/surface', value: 'oklch(85% 0.02 280)', description: 'Bold surface (high contrast emphasis)' },
    { name: 'Surface-Elevated', category: 'color/surface', value: 'oklch(15% 0 0)', description: 'Elevated surface (default + elevation)' },
    { name: 'Text-High', category: 'color/text', value: 'oklch(95% 0 0)', description: 'High contrast text' },
    { name: 'Text-Medium', category: 'color/text', value: 'oklch(70% 0 0)', description: 'Medium contrast text' },
    { name: 'Text-Low', category: 'color/text', value: 'oklch(50% 0 0)', description: 'Low contrast text' },
    { name: 'Text-OnBold-High', category: 'color/text', value: 'oklch(12% 0 0)', description: 'High contrast text on bold surfaces' },
  ],
  dim: [
    { name: 'Surface-Default', category: 'color/surface', value: 'oklch(18% 0 0)', description: 'Default surface (dim mode)' },
    { name: 'Surface-Minimal', category: 'color/surface', value: 'oklch(21% 0.005 280)', description: 'Minimal surface (+1 step from background)' },
    { name: 'Surface-Subtle', category: 'color/surface', value: 'oklch(24% 0.008 280)', description: 'Subtle surface (+2 steps from background)' },
    { name: 'Surface-Bold', category: 'color/surface', value: 'oklch(80% 0.02 280)', description: 'Bold surface (high contrast emphasis)' },
    { name: 'Surface-Elevated', category: 'color/surface', value: 'oklch(21% 0 0)', description: 'Elevated surface (default + elevation)' },
    { name: 'Text-High', category: 'color/text', value: 'oklch(92% 0 0)', description: 'High contrast text' },
    { name: 'Text-Medium', category: 'color/text', value: 'oklch(68% 0 0)', description: 'Medium contrast text' },
    { name: 'Text-Low', category: 'color/text', value: 'oklch(48% 0 0)', description: 'Low contrast text' },
    { name: 'Text-OnBold-High', category: 'color/text', value: 'oklch(15% 0 0)', description: 'High contrast text on bold surfaces' },
  ],
};

export const seedDatabase = mutation({
  args: {},
  handler: async (ctx) => {
  await requirePlatformOwner(ctx);
  // Clear existing data
  const existingBrands = await ctx.db.query('brands').collect();
  for (const brand of existingBrands) {
    await ctx.db.delete(brand._id);
  }

  const existingTokens = await ctx.db.query('tokens').collect();
  for (const token of existingTokens) {
    await ctx.db.delete(token._id);
  }

  const existingOverrides = await ctx.db.query('tokenOverrides').collect();
  for (const override of existingOverrides) {
    await ctx.db.delete(override._id);
  }

  const now = Date.now();

  // Create base brand: jio-default
  const baseBrandId = await ctx.db.insert('brands', {
    name: 'Jio Default',
    slug: 'jio-default',
    description: 'Base brand for all Jio products',
    primaryHue: 340,
    primaryChroma: 0.15,
    secondaryHue: 45,
    secondaryChroma: 0.15,
    status: 'active',
    createdAt: now,
    updatedAt: now,
  });

  // Create example brands
  const jioCinemaId = await ctx.db.insert('brands', {
    name: 'JioCinema',
    slug: 'jiocinema',
    description: 'Entertainment streaming platform',
    baseBrand: baseBrandId,
    primaryHue: 340,
    primaryChroma: 0.18,
    secondaryHue: 45,
    secondaryChroma: 0.15,
    status: 'active',
    createdAt: now,
    updatedAt: now,
  });

  const jioMartId = await ctx.db.insert('brands', {
    name: 'JioMart',
    slug: 'jiomart',
    description: 'E-commerce platform',
    baseBrand: baseBrandId,
    primaryHue: 145,
    primaryChroma: 0.17,
    secondaryHue: 45,
    secondaryChroma: 0.15,
    status: 'active',
    createdAt: now,
    updatedAt: now,
  });

  const jioHotstarId = await ctx.db.insert('brands', {
    name: 'JioHotStar',
    slug: 'jiohotstar',
    description: 'Sports and entertainment streaming',
    baseBrand: baseBrandId,
    primaryHue: 45,
    primaryChroma: 0.16,
    secondaryHue: 340,
    secondaryChroma: 0.15,
    status: 'active',
    createdAt: now,
    updatedAt: now,
  });

  let tokenCount = 0;

  // Insert all non-color tokens (mode-independent)
  for (const token of ALL_TOKENS) {
    await ctx.db.insert('tokens', {
      name: token.name,
      category: token.category,
      value: token.value,
      mode: 'light' as const, // These are mode-independent, but we need a mode value
      description: token.description,
      brandId: baseBrandId,
      deprecated: false,
      source: 'foundation',
      createdAt: now,
      updatedAt: now,
    });
    tokenCount++;
  }

  // Insert color tokens for each mode
  for (const [mode, tokens] of Object.entries(COLOR_TOKENS_BY_MODE)) {
    for (const token of tokens) {
      await ctx.db.insert('tokens', {
        name: token.name,
        category: token.category,
        value: token.value,
        mode: mode as 'light' | 'dark' | 'dim',
        description: token.description,
        brandId: baseBrandId,
        deprecated: false,
        source: 'foundation',
        createdAt: now,
        updatedAt: now,
      });
      tokenCount++;
    }
  }

  // Create overrides for JioCinema
  await ctx.db.insert('tokenOverrides', {
    brandId: jioCinemaId,
    tokenName: 'Surface-Bold',
    mode: 'light',
    value: 'oklch(52% 0.16 340)',
    createdAt: now,
    updatedAt: now,
  });

  await ctx.db.insert('tokenOverrides', {
    brandId: jioCinemaId,
    tokenName: 'Surface-Bold',
    mode: 'dark',
    value: 'oklch(48% 0.15 340)',
    createdAt: now,
    updatedAt: now,
  });

  // Log results
  return {
    message: 'Database seeded successfully with ALL tokens from primitives.css',
    brands: {
      baseBrand: baseBrandId,
      jioCinema: jioCinemaId,
      jioMart: jioMartId,
      jioHotStar: jioHotstarId,
    },
    tokenCount,
    overrideCount: 2,
    categories: [
      'shape',
      'dimension',
      'spacing',
      'motion/duration',
      'motion/easing',
      'typography/font',
      'typography/weight',
      'typography/size',
      'typography/lineheight',
      'typography/letterspacing',
      'elevation',
      'component',
      'border',
      'material/translucent',
      'material/frosted',
      'material/glass',
      'material/metallic',
      'color/surface',
      'color/text',
    ],
  };
  },
});
