import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { FigmaButtonParityRoot } from './FigmaButtonParityPage';

const el = document.getElementById('root');
if (el) {
  createRoot(el).render(
    <StrictMode>
      <FigmaButtonParityRoot />
    </StrictMode>,
  );
}
