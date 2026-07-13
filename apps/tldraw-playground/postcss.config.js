// INTERIM: Tailwind is NOT a Vite PostCSS plugin here — it would choke on the
// One UI token CSS's native `@layer base`. Instead the (frozen) chrome's Tailwind
// is precompiled to src/chrome-tailwind.generated.css via `pnpm tw:build`.
// All of this is removed in Phase 4 (de-Tailwind the chrome).
export default {
  plugins: {
    autoprefixer: {},
  },
}
