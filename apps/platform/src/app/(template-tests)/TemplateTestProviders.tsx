'use client';

import { Suspense, useEffect, useMemo } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@oneui/convex';
import type { Brand } from '@oneui/shared';
import { IconProvider } from '@oneui/ui/icons/IconContext';
import { FoundationStyleBridge } from '@/components/FoundationStyleProvider';
import { JioIconsInit } from '@/components/JioIconsInit';
import { PlatformProvider, usePlatformContext } from '@/contexts/PlatformContext';
import { UserPreferencesProvider } from '@/contexts/UserPreferencesContext';

function mapBrand(rawBrand: {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  logoSvg?: string;
  status: Brand['status'];
  isSystem?: boolean;
  primaryHue: number;
  primaryChroma: number;
  secondaryHue: number;
  secondaryChroma: number;
  baseBrand?: string;
  createdAt?: number;
  updatedAt?: number;
}): Brand {
  return {
    id: rawBrand._id,
    name: rawBrand.name,
    slug: rawBrand.slug,
    description: rawBrand.description,
    icon: rawBrand.icon,
    logoSvg: rawBrand.logoSvg,
    status: rawBrand.status,
    isSystem: rawBrand.isSystem ?? false,
    primaryHue: rawBrand.primaryHue,
    primaryChroma: rawBrand.primaryChroma,
    secondaryHue: rawBrand.secondaryHue,
    secondaryChroma: rawBrand.secondaryChroma,
    baseBrand: rawBrand.baseBrand,
    createdAt: rawBrand.createdAt ? new Date(rawBrand.createdAt) : new Date(),
    updatedAt: rawBrand.updatedAt ? new Date(rawBrand.updatedAt) : new Date(),
  };
}

function TemplateBrandBootstrap({ children }: { children: React.ReactNode }) {
  const brands = useQuery(api.brands.list);
  const { currentBrand, setBrand, platformBrandId, setPlatformBrandId } = usePlatformContext();

  const availableBrands = useMemo(() => {
    if (!brands) return [];
    return brands.map(mapBrand);
  }, [brands]);

  useEffect(() => {
    if (!availableBrands.length) return;

    const systemBrand = availableBrands.find((brand) => brand.isSystem);
    const myJioBrand = availableBrands.find((brand) => {
      const key = `${brand.name} ${brand.slug}`.toLowerCase();
      return key.includes('myjio') || key.includes('my-jio') || key.includes('jio');
    });
    const targetBrand = myJioBrand ?? systemBrand ?? availableBrands[0];

    if (systemBrand && platformBrandId !== systemBrand.id) {
      setPlatformBrandId(systemBrand.id);
    }

    if (!currentBrand && targetBrand) {
      setBrand(targetBrand);
    }
  }, [availableBrands, currentBrand, platformBrandId, setBrand, setPlatformBrandId]);

  useEffect(() => {
    if (!currentBrand?.logoSvg) return;
    try {
      localStorage.setItem('oneui-studio:brand-logo-svg', currentBrand.logoSvg);
    } catch {
      /* localStorage unavailable */
    }
  }, [currentBrand?.logoSvg]);

  return <>{children}</>;
}

function TemplateIconProvider({ children }: { children: React.ReactNode }) {
  const { iconSet } = usePlatformContext();

  return (
    <IconProvider iconSet={iconSet} defaultSize="md">
      <JioIconsInit />
      {children}
    </IconProvider>
  );
}

export function TemplateTestProviders({ children }: { children: React.ReactNode }) {
  return (
    <UserPreferencesProvider>
      <PlatformProvider defaultBrand={null}>
        <TemplateIconProvider>
          <Suspense>
            <TemplateBrandBootstrap>
              <FoundationStyleBridge>{children}</FoundationStyleBridge>
            </TemplateBrandBootstrap>
          </Suspense>
        </TemplateIconProvider>
      </PlatformProvider>
    </UserPreferencesProvider>
  );
}
