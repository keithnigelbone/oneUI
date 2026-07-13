'use client';

/**
 * Mounts the `<Shell>` + `<TopBar>` + `<LeftNav>` + `<SecondaryNav>` render
 * tree for the platform route group. The shell layout itself doesn't own
 * any brand/foundation state — every dynamic value is passed in by
 * `(platform)/layout.tsx`. Extracted out of `layout.tsx` only to keep
 * the orchestrator under the fallow complexity ceiling.
 */

import React from 'react';
import {
  Shell,
  LeftNav,
  SecondaryNav,
  TopBar,
  ModeNav,
  BrandPicker,
  type PlatformModeId,
  type BrandPickerSubBrandConfig,
  type NavigationItem,
} from '@oneui/ui/components/Platform';
import type { Brand } from '@oneui/shared';
import type { VisibleMetallicPresetName } from '@oneui/shared/engine';
import { PageLoader } from '@/components/PageLoader';
import { ComponentTopBarControls, ComponentModeToggle } from '@/components/ComponentTopBarControls';
import { VoicePlaygroundMoreMenu } from '@/components/VoicePlaygroundMoreMenu';
import { MODE_NAV_ITEMS } from '@/config/navigation';
import { BrandLogo } from './BrandLogo';
import { FocusModeToggle } from './FocusModeToggle';

interface SecondaryNavTab {
  id: string;
  label: string;
}

interface PlatformShellProps {
  // Brand state
  currentBrand: Brand | null;
  availableBrands: Brand[];
  currentSubBrand: { id: string } | null;
  allSubBrandConfigs: Record<string, BrandPickerSubBrandConfig[]>;
  sidebarLogoColor: string | undefined;
  sidebarLogoMaterial: VisibleMetallicPresetName | undefined;
  onBrandChange: (brandId: string) => void;
  onPickerChange: (sel: { brandId: string; subBrandId: string | null }) => void;
  /** Called when the user clicks "+ New brand" in the brand picker footer */
  onCreateNewBrand?: () => void;

  // Theme + platform + density
  theme: 'light' | 'dark';
  platform: Parameters<typeof TopBar>[0]['currentPlatform'];
  availablePlatforms: Parameters<typeof TopBar>[0]['availablePlatforms'];
  density: Parameters<typeof TopBar>[0]['density'];
  onThemeChange: Parameters<typeof TopBar>[0]['onThemeChange'];
  onPlatformChange: Parameters<typeof TopBar>[0]['onPlatformChange'];
  onDensityChange: Parameters<typeof TopBar>[0]['onDensityChange'];

  // Navigation
  activeMode: PlatformModeId;
  onModeChange: (mode: PlatformModeId) => void;
  modeItems: NavigationItem[];
  displayedPath: string;
  onNavigate: (path: string) => void;
  isNavigating: boolean;
  isEditorRoute: boolean;

  // Secondary nav
  showSecondaryNav: boolean;
  secondaryNavTabs: SecondaryNavTab[];
  activeSecondaryTab: string;
  onSecondaryTabChange: (tabId: string) => void;

  // Top bar trailing
  isCreateSection: boolean;
  isComponentsSection: boolean;
  isVoicePlayground: boolean;
  focusMode: boolean;
  onToggleFocusMode: () => void;

  // User
  user: { name: string; initials: string; email?: string; avatar?: string };
  onSettingsClick: () => void;
  onHelpClick: () => void;
  onProfileClick?: () => void;
  /** Wraps the LeftNav avatar in a profile menu (see LeftNavProps.renderProfileMenu). */
  renderProfileMenu?: (trigger: React.ReactElement) => React.ReactNode;

  children: React.ReactNode;
}

export function PlatformShell({
  currentBrand,
  availableBrands,
  currentSubBrand,
  allSubBrandConfigs,
  sidebarLogoColor,
  sidebarLogoMaterial,
  onBrandChange,
  onPickerChange,
  onCreateNewBrand,
  theme,
  platform,
  availablePlatforms,
  density,
  onThemeChange,
  onPlatformChange,
  onDensityChange,
  activeMode,
  onModeChange,
  modeItems,
  displayedPath,
  onNavigate,
  isNavigating,
  isEditorRoute,
  showSecondaryNav,
  secondaryNavTabs,
  activeSecondaryTab,
  onSecondaryTabChange,
  isCreateSection,
  isComponentsSection,
  isVoicePlayground,
  focusMode,
  onToggleFocusMode,
  user,
  onSettingsClick,
  onHelpClick,
  onProfileClick,
  renderProfileMenu,
  children,
}: PlatformShellProps): React.ReactElement {
  const trailing = isCreateSection ? (
    <FocusModeToggle focusMode={focusMode} onToggle={onToggleFocusMode} />
  ) : isComponentsSection ? (
    <>
      <ComponentModeToggle />
      <ComponentTopBarControls />
    </>
  ) : isVoicePlayground ? (
    <VoicePlaygroundMoreMenu />
  ) : undefined;

  return (
    <Shell
      focusMode={focusMode}
      topBar={
        <TopBar
          currentBrand={currentBrand}
          availableBrands={availableBrands}
          currentTheme={theme}
          currentPlatform={platform}
          availablePlatforms={availablePlatforms ?? undefined}
          density={density}
          onBrandChange={onBrandChange}
          onThemeChange={onThemeChange}
          onPlatformChange={onPlatformChange}
          onDensityChange={onDensityChange}
          center={
            <ModeNav items={MODE_NAV_ITEMS} activeMode={activeMode} onModeChange={onModeChange} />
          }
          trailing={trailing}
        />
      }
      leftNav={
        <LeftNav
          logo={
            <BrandPicker
              brands={availableBrands}
              subBrandConfigs={allSubBrandConfigs}
              currentBrandId={currentBrand?.id}
              currentSubBrandId={currentSubBrand?.id ?? null}
              onChange={onPickerChange}
              onCreateNew={onCreateNewBrand}
              triggerId="oneui-shell-brand-picker-trigger"
              trigger={
                <BrandLogo
                  logoSvg={currentBrand?.logoSvg}
                  primaryColor={sidebarLogoColor}
                  material={sidebarLogoMaterial}
                />
              }
            />
          }
          items={modeItems}
          currentPath={displayedPath}
          onNavigate={onNavigate}
          currentTheme={theme}
          onThemeChange={onThemeChange}
          user={user}
          onSettingsClick={onSettingsClick}
          onHelpClick={onHelpClick}
          onProfileClick={onProfileClick}
          renderProfileMenu={renderProfileMenu}
          focusMode={focusMode}
        />
      }
      secondaryNav={
        showSecondaryNav ? (
          <SecondaryNav
            tabs={secondaryNavTabs}
            activeTab={activeSecondaryTab}
            onTabChange={onSecondaryTabChange}
            searchable={isComponentsSection}
            searchPlaceholder="Search"
          />
        ) : undefined
      }
    >
      <div
        {...(isEditorRoute ? { 'data-full-bleed': true } : {})}
        style={{
          width: '100%',
          minWidth: 0,
          ...(isEditorRoute ? { maxWidth: 'none', alignSelf: 'stretch' } : {}),
        }}
      >
        {isNavigating ? <PageLoader /> : children}
      </div>
    </Shell>
  );
}
