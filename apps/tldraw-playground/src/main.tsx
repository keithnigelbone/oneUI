import React from 'react'
import ReactDOM from 'react-dom/client'
import { IconProvider } from '@oneui/ui/icons/IconContext'
import App from './App'
// Precompiled (frozen) Tailwind for the chrome — see chrome-tailwind.css / `pnpm tw:build`.
import './chrome-tailwind.generated.css'
// One UI token bootstrap + @oneui/ui reset + chrome custom CSS + legacy --ui-* tokens.
import './styles.css'
import 'tldraw/tldraw.css'
// Side-effect: load saved --ui-* theme tokens for legacy shapes (removed in Phase 3).
import '@/lib/theme/themeStore'
import { initOneUiJioIcons } from '@/theme/oneuiIcons'
import { BrandShell } from '@/theme/BrandShell'

initOneUiJioIcons()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrandShell>
      <IconProvider iconSet="jio" defaultSize="md">
        <App />
      </IconProvider>
    </BrandShell>
  </React.StrictMode>,
)
