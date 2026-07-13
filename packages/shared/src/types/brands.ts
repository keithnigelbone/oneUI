/**
 * Brand Configuration Types
 */

export type BrandStatus = 'active' | 'draft' | 'deprecated';

export interface Brand {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  logoSvg?: string; // SVG logo content
  primaryHue: number; // 0-360
  primaryChroma: number; // 0-0.4
  secondaryHue: number; // 0-360
  secondaryChroma: number; // 0-0.4
  status: BrandStatus;
  isSystem?: boolean; // True for platform-managed brands (e.g., One UI Theme)
  baseBrand?: string; // Inheritance parent
  team?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TokenOverride {
  brandId: string;
  tokenName: string;
  mode: 'light' | 'dark';
  value: string;
  createdAt: Date;
  updatedAt: Date;
}
