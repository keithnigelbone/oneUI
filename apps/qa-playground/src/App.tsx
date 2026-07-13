import { Navigate, Route, Routes } from 'react-router-dom';
import { IconProvider } from '@oneui/ui/icons/IconContext';

import { CatalogPage } from '@/pages/CatalogPage';
import { ComponentDetailPage } from '@/pages/ComponentDetailPage';
import { FigmaPipelineButtonPage } from '@/pages/FigmaPipelineButtonPage';
import { FigmaPipelineContainer245924856Page } from '@/pages/FigmaPipelineContainer245924856Page';
import { PerformanceToolPage } from '@/pages/PerformanceToolPage';
import { QADashboardPage } from '@/pages/QADashboard/QADashboardPage';
import { SampleAppDemoShell } from '@/sample-app/SampleAppDemoShell';
import { QaStorybookLayout } from '@/storybook/QaStorybookLayout';
import { QaStorybookDashboardPage } from '@/storybook/pages/QaStorybookDashboardPage';
import { QaStorybookIntroductionPage } from '@/storybook/pages/QaStorybookIntroductionPage';
import { QaStorybookComponentPage } from '@/storybook/pages/QaStorybookComponentPage';
import { storybookPlaygroundPath } from '@/storybook/qaStorybookNav';

export function App() {
  return (
    <IconProvider iconSet="jio" defaultSize="md">
      <Routes>
        <Route path="/" element={<CatalogPage />} />
        <Route path="/tools/performance" element={<PerformanceToolPage />} />
        <Route path="/qa/dashboard" element={<QADashboardPage />} />
        <Route path="/demo/jio/*" element={<SampleAppDemoShell />} />
        <Route path="/figma-pipeline/button" element={<FigmaPipelineButtonPage />} />
        <Route path="/figma-pipeline/2459-24856" element={<FigmaPipelineContainer245924856Page />} />
        <Route path="/c/:slug" element={<ComponentDetailPage />} />
        <Route path="/storybook" element={<QaStorybookLayout />}>
          <Route index element={<Navigate to={storybookPlaygroundPath()} replace />} />
          <Route path="dashboard" element={<QaStorybookDashboardPage />} />
          <Route path="introduction" element={<QaStorybookIntroductionPage />} />
          <Route path=":slug" element={<QaStorybookComponentPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </IconProvider>
  );
}
