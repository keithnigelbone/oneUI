import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App';
import { initQaJioIcons } from './shell/initQaJioIcons';
import { QaErrorBoundary } from './shell/QaErrorBoundary';
import { QaPlaygroundBrandShell } from './shell/QaPlaygroundBrandShell';
import { RootShell } from './shell/RootShell';
import './index.css';

initQaJioIcons();

const el = document.getElementById('root');
if (!el) {
  throw new Error('Missing #root');
}

createRoot(el).render(
  <StrictMode>
    <QaErrorBoundary>
      <BrowserRouter>
        <QaPlaygroundBrandShell>
          <RootShell>
            <App />
          </RootShell>
        </QaPlaygroundBrandShell>
      </BrowserRouter>
    </QaErrorBoundary>
  </StrictMode>,
);
