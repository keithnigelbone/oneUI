/**
 * External Sample App — mounted only at `/demo/jio/*` (Sample App Demo button).
 */
import { Navigate, Route, Routes } from 'react-router-dom';

import { BrandProvider } from '@/debug/oneui';
import { QaInspectorLayer } from '@/debug/QaInspectorLayer';
import { useBrandTheme } from '@/sample-app/hooks/useBrandTheme';
import { useBrandThemeOnDocument } from '@/sample-app/hooks/useBrandThemeOnDocument';
import { SiteLayout } from '@/sample-app/layouts/SiteLayout';
import { AccessibilityPage } from '@/sample-app/pages/AccessibilityPage';
import { AccountPage } from '@/sample-app/pages/AccountPage';
import { ComponentCoveragePage } from '@/sample-app/pages/ComponentCoveragePage';
import { ComponentShowcasePage } from '@/sample-app/pages/ComponentShowcasePage';
import { DevicesPage } from '@/sample-app/pages/DevicesPage';
import { HomePage } from '@/sample-app/pages/HomePage';
import { NotificationsPage } from '@/sample-app/pages/NotificationsPage';
import { PlansPage } from '@/sample-app/pages/PlansPage';
import { RewardsPage } from '@/sample-app/pages/RewardsPage';
import { SupportPage } from '@/sample-app/pages/SupportPage';
import { ROUTES, SAMPLE_APP_BASE } from '@/sample-app/routes/paths';
import { useAppStore } from '@/sample-app/store/appStore';

import '@/sample-app/styles/oneui-layout.css';

function SampleAppDemoContent() {
  const themePreference = useAppStore((s) => s.themePreference);
  const mode = useBrandTheme(themePreference);

  useBrandThemeOnDocument('jio', themePreference);

  return (
    <BrandProvider brand="jio" mode={mode}>
      <Routes>
        <Route element={<SiteLayout />}>
          <Route index element={<HomePage />} />
          <Route path="plans" element={<PlansPage />} />
          <Route path="devices" element={<DevicesPage />} />
          <Route path="support" element={<SupportPage />} />
          <Route path="account" element={<AccountPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="rewards" element={<RewardsPage />} />
          <Route path="accessibility" element={<AccessibilityPage />} />
          <Route path="coverage" element={<ComponentCoveragePage />} />
          <Route path="showcase" element={<ComponentShowcasePage />} />
          <Route path="*" element={<Navigate to={ROUTES.home} replace />} />
        </Route>
      </Routes>
      <QaInspectorLayer />
    </BrandProvider>
  );
}

export function SampleAppDemoShell() {
  return <SampleAppDemoContent />;
}

/** For links that need the base path without trailing slash issues. */
export { SAMPLE_APP_BASE };
