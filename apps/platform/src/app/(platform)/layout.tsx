/**
 * (platform)/layout.tsx
 *
 * Thin platform-shell orchestrator. Wires the route group's providers and
 * delegates render + side-effects to the hooks/components in `_layout/`.
 *
 * FOUC-sensitive — see `CLAUDE.md` § FOUC / Brand Switch Flash Prevention.
 * In particular: do not change the order of providers, the Suspense
 * fallback, or the `<style id="oneui-foundation-tokens">` lifecycle
 * (owned by `useBrandCSS`, mounted via FoundationStyleBridge).
 */

'use client';

import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@oneui/convex';
import type { Id } from '@oneui/convex/_generated/dataModel';
import type { PlatformModeId } from '@oneui/ui/components/Platform';
import { LOCAL_USER_ID } from '@/components/HomeChat';
import { ConvexClientProvider } from '@/providers/ConvexClientProvider';
import { authClient } from '@/lib/auth-client';
import { IconProvider } from '@oneui/ui/icons/IconContext';
import { PlatformProvider, usePlatformContext } from '@/contexts/PlatformContext';
import {
  PlatformNavigationProvider,
  usePlatformNavigation,
} from '@/contexts/PlatformNavigationContext';
import { UserPreferencesProvider, useUserPreferencesContext } from '@/contexts/UserPreferencesContext';
import { ComponentControlsProvider } from '@/contexts/ComponentControlsContext';
import { VoicePlaygroundProvider } from '@/contexts/VoicePlaygroundContext';
import { PageLoader } from '@/components/PageLoader';
import { ToastProvider } from '@/components/Toast/Toaster';
import { InviteToasts } from '@/components/Toast/InviteToasts';
import { ProfileMenu } from '@/components/account/ProfileMenu';
import { AccountModal } from '@/components/account/AccountModal';
import {
  InvitePeopleDialog,
  type InviteRoleValue,
} from '@/components/access/InvitePeopleDialog';
import { useBrandRole } from '@/hooks/useBrandRole';
import { NAVIGATION_MODES, resolveModeFromPath } from '@/config/navigation';
import { JioIconsInit } from '@/components/JioIconsInit';
import { FoundationStyleBridge, useFoundationData } from '@/components/FoundationStyleProvider';
import { useSurfaceTokenVarsNew as useSurfaceTokenVars } from '@oneui/ui/hooks/useSurfaceTokenVarsNew';
import { useSupabaseThemeSync } from '@/hooks/useSupabaseThemeSync';

import { useBrandSwitching } from './_layout/BrandSwitching';
import { useSidebarLogoColor, useSidebarLogoMaterial, useSecondaryNav } from './_layout/Sidebar';
import {
  PlatformBrandCreateDialog,
  usePlatformBrandCreateDialog,
} from './_layout/BrandCreateDialog';
import { AppReadyPreloader } from './_layout/AppReadyPreloader';
import { useBrandsCatalog, useAvailableScalesForSync } from './_layout/useBrandsCatalog';
import { usePlatformRole } from '@/hooks/usePlatformRole';
import { useSubBrandsCatalog } from './_layout/useSubBrandsCatalog';
import { useIconSetSync } from './_layout/useIconSetSync';
import { PlatformSettingsModal } from './_layout/PlatformSettingsModal';
import { PlatformShell } from './_layout/PlatformShell';
import { useFocusMode } from './_layout/useFocusMode';

const LayoutSkeleton = () => <PageLoader />;

function PlatformLayoutContent({ children }: { children: React.ReactNode }) {
  const {
    currentBrand,
    theme,
    platform,
    density,
    setBrand,
    setTheme,
    setPlatform,
    setDensity,
    iconSet,
    setIconSet,
    iconVariant,
    setIconVariant,
    materialStyle,
    setMaterialStyle,
    platformBrandId,
    setPlatformBrandId,
    currentSubBrand,
    setSubBrand,
  } = usePlatformContext();

  const { prefs, updatePref, isLoading: prefsLoading } = useUserPreferencesContext();
  const foundationData = useFoundationData();

  // Sub-brand id to restore after the startup brand selection — written by
  // useBrandsCatalog (before setBrand clears the pref), consumed by
  // useBrandSwitching once the brand's sub-brands load.
  const pendingSubBrandIdRef = useRef<string | null>(null);

  // Sidebar brand-mark colour — editing brand's --Primary-Bold, with the
  // brand's explicit Logo override taking precedence when configured.
  const themeKey: 'light' | 'dark' = theme === 'dark' ? 'dark' : 'light';
  const { surfaceVars: editingSurfaceVars } = useSurfaceTokenVars({
    foundationData,
    theme: themeKey,
  });
  const sidebarLogoColor = useSidebarLogoColor(
    foundationData,
    editingSurfaceVars['--Primary-Bold'] || undefined,
  );
  const sidebarLogoMaterial = useSidebarLogoMaterial(foundationData);

  const availableScalesForSync = useAvailableScalesForSync(foundationData);
  useSupabaseThemeSync(currentBrand?.id, availableScalesForSync);

  useIconSetSync({
    foundationData,
    currentBrandId: currentBrand?.id,
    iconSet,
    setIconSet,
    iconVariant,
    setIconVariant,
    materialStyle,
    setMaterialStyle,
  });

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const { brands, availableBrands } = useBrandsCatalog({
    currentBrand,
    setBrand,
    platformBrandId,
    setPlatformBrandId,
    prefs,
    prefsLoading,
    pendingSubBrandIdRef,
  });
  const { subBrands, allSubBrandConfigs } = useSubBrandsCatalog({
    currentBrandId: currentBrand?.id,
  });

  const nav = usePlatformNavigation();
  const {
    displayedPath,
    isNavigating,
    currentSection,
    currentSubSection,
    thirdPart,
    isEditorRoute,
    isComponentsSection,
    isCreateSection,
    isVoicePlayground,
    showSecondaryNav,
    handleNavigate,
    handleSecondaryTabChange,
    handleModeChange,
  } = nav;

  const { handleBrandChange, handleSubBrandChange, handlePickerChange } = useBrandSwitching({
    availableBrands,
    subBrands,
    currentBrand,
    currentSubBrand,
    setBrand,
    setSubBrand,
    pendingSubBrandIdRef,
  });

  const createBrandDialog = usePlatformBrandCreateDialog();
  const { focusMode, toggleFocusMode } = useFocusMode({ isCreateSection });

  // Only platform owners/creators may create brands — gate the "+ New brand"
  // action in the BrandPicker footer. Passing `undefined` hides the button.
  const { canCreateBrands, isOwner: isPlatformOwner } = usePlatformRole();
  const handleCreateNewBrand = canCreateBrands ? createBrandDialog.openDialog : undefined;

  const activeMode: PlatformModeId = useMemo(
    () => resolveModeFromPath(displayedPath),
    [displayedPath],
  );

  // Recent agent threads — only fetched in Home mode, and deferred until the
  // app-ready handshake so the query never competes with shell-critical data.
  const [appReady, setAppReady] = useState(false);
  useEffect(() => {
    const onReady = () => setAppReady(true);
    if (document.documentElement.getAttribute('data-brand-ready') === 'true') {
      setAppReady(true);
      return;
    }
    window.addEventListener('oneui:app-ready', onReady, { once: true });
    return () => window.removeEventListener('oneui:app-ready', onReady);
  }, []);
  const listThreadsArgs = useMemo(
    () =>
      activeMode === 'home' && appReady
        ? { userId: LOCAL_USER_ID, limit: 5 }
        : ('skip' as const),
    [activeMode, appReady],
  );
  const recentThreads = useQuery(api.agentChat.listThreads, listThreadsArgs);

  const { tabs: secondaryNavTabs, activeTab: activeSecondaryTab } = useSecondaryNav({
    currentSection,
    currentSubSection,
    thirdPart,
    recentThreads,
  });

  const modeItems = useMemo(() => NAVIGATION_MODES[activeMode].items, [activeMode]);

  const { data: sessionData } = authClient.useSession();
  const user = useMemo(() => {
    const displayName = sessionData?.user?.name || sessionData?.user?.email || 'User';
    const initials =
      displayName
        .split(/\s+/)
        .map((part) => part.charAt(0))
        .join('')
        .slice(0, 2)
        .toUpperCase() || 'U';
    return {
      name: displayName,
      initials,
      email: sessionData?.user?.email ?? undefined,
      avatar: sessionData?.user?.image ?? undefined,
    };
  }, [sessionData]);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);

  // "Invite people" in the profile menu invites a teammate to the currently
  // selected brand. Gated on admin/owner access to that brand (same capability
  // the /brand/members panel gates on) — omit the menu entry otherwise.
  const { canManageMembers } = useBrandRole(currentBrand?.id);
  const inviteMember = useMutation(api.brandMembers.invite);
  const handleInviteMember = useCallback(
    async (email: string, role: InviteRoleValue) => {
      if (!currentBrand?.id) return;
      await inviteMember({ brandId: currentBrand.id as Id<'brands'>, email, role });
    },
    [inviteMember, currentBrand?.id],
  );
  const canInviteToBrand = Boolean(currentBrand?.id) && canManageMembers;

  const handleSettingsClick = useCallback(() => setIsSettingsModalOpen(true), []);
  const handleAccountClick = useCallback(() => setIsAccountModalOpen(true), []);
  const handleOpenInvitePeople = useCallback(() => setIsInviteDialogOpen(true), []);
  const handleManagePlatformUsers = useCallback(() => {
    setIsSettingsModalOpen(false);
    handleNavigate('/settings/users');
  }, [handleNavigate]);
  const handleSignOut = useCallback(async () => {
    await authClient.signOut();
    window.location.href = '/auth';
  }, []);
  const noop = useCallback(() => {}, []);

  // Avatar click opens the profile menu (Account / Settings / Platform access /
  // Sign out) instead of signing out directly.
  const renderProfileMenu = useCallback(
    (trigger: React.ReactElement) => (
      <ProfileMenu
        trigger={trigger}
        user={user}
        onOpenAccount={handleAccountClick}
        onOpenInvitePeople={canInviteToBrand ? handleOpenInvitePeople : undefined}
        onOpenPlatformAccess={isPlatformOwner ? handleManagePlatformUsers : undefined}
        onSignOut={handleSignOut}
      />
    ),
    [
      user,
      handleAccountClick,
      canInviteToBrand,
      handleOpenInvitePeople,
      isPlatformOwner,
      handleManagePlatformUsers,
      handleSignOut,
    ],
  );

  const content = (
    <ToastProvider>
      <AppReadyPreloader
        brands={brands}
        currentBrand={currentBrand}
        foundationData={foundationData}
      />
      <PlatformShell
        currentBrand={currentBrand}
        availableBrands={availableBrands}
        currentSubBrand={currentSubBrand}
        allSubBrandConfigs={allSubBrandConfigs}
        sidebarLogoColor={sidebarLogoColor}
        sidebarLogoMaterial={sidebarLogoMaterial}
        onBrandChange={handleBrandChange}
        onPickerChange={handlePickerChange}
        onCreateNewBrand={handleCreateNewBrand}
        theme={theme}
        platform={platform}
        availablePlatforms={foundationData?.availablePlatforms ?? undefined}
        density={density}
        onThemeChange={setTheme}
        onPlatformChange={setPlatform}
        onDensityChange={setDensity}
        activeMode={activeMode}
        onModeChange={handleModeChange}
        modeItems={modeItems}
        displayedPath={displayedPath}
        onNavigate={handleNavigate}
        isNavigating={isNavigating}
        isEditorRoute={isEditorRoute}
        showSecondaryNav={showSecondaryNav}
        secondaryNavTabs={secondaryNavTabs}
        activeSecondaryTab={activeSecondaryTab}
        onSecondaryTabChange={handleSecondaryTabChange}
        isCreateSection={isCreateSection}
        isComponentsSection={isComponentsSection}
        isVoicePlayground={isVoicePlayground}
        focusMode={focusMode}
        onToggleFocusMode={toggleFocusMode}
        user={user}
        onSettingsClick={handleSettingsClick}
        onHelpClick={noop}
        renderProfileMenu={renderProfileMenu}
      >
        {children}
      </PlatformShell>
      <PlatformBrandCreateDialog
        open={createBrandDialog.open}
        onClose={createBrandDialog.closeDialog}
        availableBrands={availableBrands}
        setBrand={setBrand}
      />
      <PlatformSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        theme={theme}
        density={density}
        onDensityChange={setDensity}
        currentBrand={currentBrand}
        currentSubBrand={currentSubBrand}
        onSubThemeChange={handleSubBrandChange}
        prefs={prefs}
        updatePref={updatePref}
        availableBrands={availableBrands}
        allSubBrandConfigs={allSubBrandConfigs}
        canManagePlatformUsers={isPlatformOwner}
        onManagePlatformUsers={handleManagePlatformUsers}
      />
      <AccountModal
        open={isAccountModalOpen}
        onOpenChange={setIsAccountModalOpen}
        currentName={user.name}
        email={user.email}
        avatar={user.avatar}
      />
      <InvitePeopleDialog
        open={isInviteDialogOpen}
        onOpenChange={setIsInviteDialogOpen}
        brandName={currentBrand?.name}
        onInvite={handleInviteMember}
      />
      <InviteToasts />
    </ToastProvider>
  );

  return (
    <ContentProviders
      componentName={isComponentsSection ? currentSubSection || null : null}
      isVoicePlayground={isVoicePlayground}
    >
      {content}
    </ContentProviders>
  );
}

/** Conditionally wraps children in ComponentControlsProvider + VoicePlaygroundProvider. */
function ContentProviders({
  componentName,
  isVoicePlayground,
  children,
}: {
  componentName: string | null;
  isVoicePlayground: boolean;
  children: React.ReactNode;
}) {
  const wrapped = (
    <ComponentControlsProvider componentName={componentName}>{children}</ComponentControlsProvider>
  );
  return isVoicePlayground ? <VoicePlaygroundProvider>{wrapped}</VoicePlaygroundProvider> : wrapped;
}

/** Uses the icon set from platform context — sits inside PlatformProvider. */
function IconProviderWrapper({ children }: { children: React.ReactNode }) {
  const { iconSet, iconVariant, materialStyle } = usePlatformContext();
  return (
    <IconProvider
      iconSet={iconSet}
      defaultSize="md"
      variant={iconVariant}
      materialStyle={materialStyle}
    >
      <JioIconsInit />
      {children}
    </IconProvider>
  );
}

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  return (
    <ConvexClientProvider>
      <UserPreferencesProvider>
        <PlatformProvider defaultBrand={null}>
          <IconProviderWrapper>
            <Suspense fallback={<LayoutSkeleton />}>
              <FoundationStyleBridge>
                <PlatformNavigationProvider>
                  <PlatformLayoutContent>{children}</PlatformLayoutContent>
                </PlatformNavigationProvider>
              </FoundationStyleBridge>
            </Suspense>
          </IconProviderWrapper>
        </PlatformProvider>
      </UserPreferencesProvider>
    </ConvexClientProvider>
  );
}
