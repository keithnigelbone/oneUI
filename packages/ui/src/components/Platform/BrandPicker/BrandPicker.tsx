/**
 * BrandPicker.tsx
 *
 * Unified brand + sub-brand picker. Opens from a trigger (typically the
 * LeftNav logo) as a Popover containing a searchable, flat list.
 *
 * Uses project components: Input (search with icon), Divider (separators).
 * All styling via design tokens — no literals.
 *
 * Data-agnostic: caller passes `brands` + `subBrandConfigs` so this
 * component can live in @oneui/ui without a Convex dependency.
 */

'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Brand } from '@oneui/shared';
import { Popover, PopoverTrigger, PopoverPortal } from '../../Popover';
import { Input } from '../../Input/Input';
import { Divider } from '../../Divider/Divider';
import { Button } from '../../Button/Button';
import { Icon } from '../../../icons/Icon';
import { BrandPickerItem } from './BrandPickerItem';
import { BrandPickerVariant } from './BrandPickerVariant';
import styles from './BrandPicker.module.css';

export interface BrandPickerSubBrandConfig {
  id: string;
  parentBrandId: string;
  name: string;
  slug: string;
}

export interface BrandPickerSelection {
  brandId: string;
  subBrandId: string | null;
}

export interface BrandPickerProps {
  brands: Brand[];
  /** Map of parentBrandId → sub-brand configs for that brand */
  subBrandConfigs: Record<string, BrandPickerSubBrandConfig[]>;
  currentBrandId?: string;
  currentSubBrandId?: string | null;
  onChange: (selection: BrandPickerSelection) => void;
  /** The clickable trigger (e.g. a BrandLogo). Rendered inside Popover.Trigger's button. */
  trigger: React.ReactNode;
  /** Stable id for SSR/client hydration. Base UI's generated id can drift if render order changes. */
  triggerId?: string;
  defaultOpen?: boolean;
  /** Which side of the trigger to position the popover (default: 'right') */
  side?: 'top' | 'bottom' | 'left' | 'right';
  /**
   * Optional "+ New brand" footer action. When provided, renders a divider
   * + footer button at the bottom of the popover. The picker closes itself
   * before invoking the callback so the consumer can open a dialog.
   */
  onCreateNew?: () => void;
}

export interface BrandFamily {
  parent: Brand;
  children: Brand[];
}

export interface BrandGroups {
  system: Brand[];
  families: BrandFamily[];
  independent: Brand[];
}

/**
 * Pure helper. Groups brands into System / Families / Independent buckets
 * using the existing `baseBrand` schema field for parent-child relationships.
 */
export function groupBrands(brands: Brand[]): BrandGroups {
  const system = brands.filter((b) => b.isSystem);
  const nonSystem = brands.filter((b) => !b.isSystem);

  const parentIds = new Set<string>();
  for (const b of nonSystem) {
    if (b.baseBrand) parentIds.add(b.baseBrand);
  }

  const families: BrandFamily[] = [];
  const familyChildIds = new Set<string>();
  for (const candidate of nonSystem) {
    if (!parentIds.has(candidate.id)) continue;
    const children = nonSystem.filter((c) => c.baseBrand === candidate.id);
    families.push({ parent: candidate, children });
    for (const c of children) familyChildIds.add(c.id);
  }

  const familyParentIds = new Set(families.map((f) => f.parent.id));
  const independent = nonSystem.filter(
    (b) => !b.baseBrand && !familyParentIds.has(b.id) && !familyChildIds.has(b.id)
  );

  return { system, families, independent };
}

function matchesQuery(text: string, query: string): boolean {
  if (!query) return true;
  return text.toLowerCase().includes(query);
}

export const BrandPicker: React.FC<BrandPickerProps> = ({
  brands,
  subBrandConfigs,
  currentBrandId,
  currentSubBrandId,
  onChange,
  trigger,
  triggerId,
  defaultOpen = false,
  side = 'right',
  onCreateNew,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [query, setQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      const id = window.setTimeout(() => searchInputRef.current?.focus(), 0);
      return () => window.clearTimeout(id);
    }
    setQuery('');
    return undefined;
  }, [isOpen]);

  const groups = useMemo(() => groupBrands(brands), [brands]);
  const q = query.trim().toLowerCase();

  const handleSelectBrand = useCallback(
    (brandId: string) => {
      onChange({ brandId, subBrandId: null });
      setIsOpen(false);
    },
    [onChange]
  );

  const handleSelectVariant = useCallback(
    (brandId: string, subBrandId: string) => {
      onChange({ brandId, subBrandId });
      setIsOpen(false);
    },
    [onChange]
  );

  const isBrandMatch = useCallback(
    (b: Brand) => matchesQuery(b.name, q) || matchesQuery(b.slug, q),
    [q]
  );
  const isVariantMatch = useCallback(
    (v: BrandPickerSubBrandConfig) => matchesQuery(v.name, q) || matchesQuery(v.slug, q),
    [q]
  );

  // Visible system brands
  const visibleSystem = groups.system.filter(isBrandMatch);

  // Visible families
  const visibleFamilies = groups.families
    .map((family) => {
      const parentMatches = isBrandMatch(family.parent);
      const childRows = family.children
        .map((child) => {
          const variants = subBrandConfigs[child.id] ?? [];
          const childMatches = isBrandMatch(child);
          const matchingVariants = q ? variants.filter(isVariantMatch) : variants;
          const include = parentMatches || childMatches || matchingVariants.length > 0;
          return include ? { child, matchingVariants } : null;
        })
        .filter(
          (row): row is { child: Brand; matchingVariants: BrandPickerSubBrandConfig[] } =>
            row !== null
        );
      return (parentMatches || childRows.length > 0) ? { family, parentMatches, childRows } : null;
    })
    .filter(
      (row): row is {
        family: BrandFamily;
        parentMatches: boolean;
        childRows: Array<{ child: Brand; matchingVariants: BrandPickerSubBrandConfig[] }>;
      } => row !== null
    );

  // An independent brand stays visible when ITS SUB-BRANDS match the query too
  // (searching "things" must surface Jio → JioThings) — same rule the family
  // path already applies via matchingVariants.
  const visibleIndependent = groups.independent.filter(
    (b) => isBrandMatch(b) || (subBrandConfigs[b.id] ?? []).some(isVariantMatch)
  );

  const hasAnyResults =
    visibleSystem.length > 0 ||
    visibleFamilies.length > 0 ||
    visibleIndependent.length > 0;

  // Build flat sections with Divider between them
  const sections: React.ReactNode[] = [];

  // System section
  if (visibleSystem.length > 0) {
    sections.push(
      <div key="system" className={styles.section} role="group" aria-label="System">
        <span className={styles.sectionLabel}>System</span>
        {visibleSystem.map((brand) => (
          <BrandPickerItem
            key={brand.id}
            brand={brand}
            selected={currentBrandId === brand.id && !currentSubBrandId}
            onSelect={() => handleSelectBrand(brand.id)}
          />
        ))}
      </div>
    );
  }

  // Family sections — soft divider between each child brand (not between sub-brands)
  for (const { family, parentMatches, childRows } of visibleFamilies) {
    const familyRows: React.ReactNode[] = [];
    if (parentMatches) {
      familyRows.push(
        <BrandPickerItem
          key={family.parent.id}
          brand={family.parent}
          selected={currentBrandId === family.parent.id && !currentSubBrandId}
          onSelect={() => handleSelectBrand(family.parent.id)}
          isBaseBrand
        />
      );
    }
    childRows.forEach(({ child, matchingVariants }, i) => {
      // Soft divider between child brands (and after parent if present)
      if (i > 0 || parentMatches) {
        familyRows.push(
          <div key={`fam-div-${child.id}`} className={styles.softDividerWrap}>
            <Divider />
          </div>
        );
      }
      familyRows.push(
        <BrandPickerItem
          key={child.id}
          brand={child}
          selected={currentBrandId === child.id && !currentSubBrandId}
          onSelect={() => handleSelectBrand(child.id)}
        />
      );
      for (const variant of matchingVariants) {
        familyRows.push(
          <BrandPickerVariant
            key={variant.id}
            variant={variant}
            selected={currentBrandId === child.id && currentSubBrandId === variant.id}
            onSelect={() => handleSelectVariant(child.id, variant.id)}
          />
        );
      }
    });
    sections.push(
      <div key={`family-${family.parent.id}`} className={styles.section} role="group" aria-label={family.parent.name}>
        <span className={styles.sectionLabel}>{family.parent.name}</span>
        {familyRows}
      </div>
    );
  }

  // Independent brands section — soft divider between each major brand,
  // but NOT between a brand and its sub-brand variants (they cluster together).
  if (visibleIndependent.length > 0) {
    const brandRows: React.ReactNode[] = [];
    visibleIndependent.forEach((brand, i) => {
      const variants = subBrandConfigs[brand.id] ?? [];
      const matchingVariants = q ? variants.filter(isVariantMatch) : variants;
      // Soft divider between major brands (not before the first one)
      if (i > 0) {
        brandRows.push(
          <div key={`brand-div-${brand.id}`} className={styles.softDividerWrap}>
            <Divider />
          </div>
        );
      }
      brandRows.push(
        <BrandPickerItem
          key={brand.id}
          brand={brand}
          selected={currentBrandId === brand.id && !currentSubBrandId}
          onSelect={() => handleSelectBrand(brand.id)}
        />
      );
      // Sub-brand variants stay grouped under their parent — no divider
      for (const variant of matchingVariants) {
        brandRows.push(
          <BrandPickerVariant
            key={variant.id}
            variant={variant}
            selected={currentBrandId === brand.id && currentSubBrandId === variant.id}
            onSelect={() => handleSelectVariant(brand.id, variant.id)}
          />
        );
      }
    });
    sections.push(
      <div key="brands" className={styles.section} role="group" aria-label="Brands">
        <span className={styles.sectionLabel}>Brands</span>
        {brandRows}
      </div>
    );
  }

  // Interleave Dividers edge-to-edge between sections
  const body: React.ReactNode[] = [];
  for (let i = 0; i < sections.length; i++) {
    if (i > 0) {
      body.push(
        <div key={`divider-${i}`} className={styles.dividerWrap}>
          <Divider />
        </div>
      );
    }
    body.push(sections[i]);
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger
        id={triggerId}
        className={styles.triggerButton}
        aria-label="Select brand"
        aria-haspopup="dialog"
      >
        {trigger}
      </PopoverTrigger>
      <PopoverPortal side={side} align="start" arrow={false} sideOffset={12}>
        <div className={styles.pickerContent}>
          <div className={styles.searchContainer}>
            <Input
              ref={searchInputRef}
              type="search"
              size="m"
              shape="pill"
              placeholder="Search brands…"
              value={query}
              onChange={setQuery}
              start={<Icon name="search" size={16} />}
              onKeyDown={(e) => {
                if (e.key === 'Escape') setIsOpen(false);
              }}
            />
          </div>
          <Divider />
          <div
            className={styles.body}
            role="radiogroup"
            aria-label="Select brand and variant"
          >
            {body}

            {!hasAnyResults && (
              <div className={styles.noResults}>No brands found</div>
            )}
          </div>
          {onCreateNew && (
            <>
              <Divider />
              <div className={styles.footer}>
                <Button
                  attention="low"
                  appearance="neutral"
                  size="small"
                  start={<Icon name="add" size={16} />}
                  onPress={() => {
                    setIsOpen(false);
                    onCreateNew();
                  }}
                >
                  New brand
                </Button>
              </div>
            </>
          )}
        </div>
      </PopoverPortal>
    </Popover>
  );
};
