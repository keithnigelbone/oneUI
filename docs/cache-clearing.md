# Cache Clearing Guide

This guide covers all the ways to clear caches in OneUI Studio to ensure you see the latest changes in your preview.

## Quick Commands

### Clear All Caches (Recommended)
```bash
pnpm clear-cache
```

Or run the script directly:
```bash
bash scripts/clear-cache.sh
```

### Individual Cache Clearing

#### 1. Next.js Build Cache
```bash
# Clear Next.js cache
rm -rf apps/platform/.next
rm -rf .next
```

#### 2. Turbo Cache
```bash
# Clear Turbo build cache
rm -rf .turbo
find . -type d -name ".turbo" -exec rm -rf {} +
```

#### 3. Convex Local Dev Cache
```bash
# Clear Convex local cache
rm -rf .convex
find . -type d -name ".convex" -exec rm -rf {} +
```

**Note:** Convex also has a server-side brand CSS cache (`brandCSSCache` table). This cache:
- Automatically invalidates when foundations change
- Can be cleared by restarting the Convex dev server (`npx convex dev`)
- Or manually via Convex dashboard → Tables → `brandCSSCache` → Delete entries

#### 4. Storybook Cache
```bash
# Clear Storybook build cache
rm -rf storybook-static
find . -type d -name "storybook-static" -exec rm -rf {} +
```

#### 5. TypeScript Build Info
```bash
# Clear TypeScript incremental build cache
find . -name "*.tsbuildinfo" -delete
```

#### 6. Node Modules (Nuclear Option)
```bash
# Remove all node_modules and reinstall
pnpm clean
pnpm install
```

#### 7. pnpm Store Cache (Global)
```bash
# Clear pnpm's global store cache
pnpm store prune
```

## Complete Reset Workflow

If you're experiencing persistent preview issues, follow this complete reset:

```bash
# 1. Stop all running dev servers (Ctrl+C)

# 2. Clear all caches
pnpm clear-cache

# 3. Clear pnpm cache (optional)
pnpm store prune

# 4. Reinstall dependencies (if needed)
pnpm install

# 5. Restart Convex dev server
npx convex dev

# 6. Restart Next.js dev server (in another terminal)
pnpm dev

# 7. Hard refresh browser
# Chrome/Edge: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows/Linux)
# Firefox: Cmd+Shift+R (Mac) or Ctrl+F5 (Windows/Linux)
# Safari: Cmd+Option+R
```

## Browser Cache Clearing

### Hard Refresh
- **Chrome/Edge (Mac):** `Cmd + Shift + R`
- **Chrome/Edge (Windows/Linux):** `Ctrl + Shift + R` or `Ctrl + F5`
- **Firefox (Mac):** `Cmd + Shift + R`
- **Firefox (Windows/Linux):** `Ctrl + F5`
- **Safari:** `Cmd + Option + R`

### DevTools Method
1. Open DevTools (F12 or Cmd+Option+I)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

### Clear Application Storage
1. Open DevTools → Application tab
2. Clear Storage → Clear site data
3. Or manually clear:
   - Local Storage
   - Session Storage
   - IndexedDB
   - Cache Storage

## Common Cache Issues & Solutions

### Issue: Brand CSS changes not appearing
**Solution:**
1. Clear Convex cache: `rm -rf .convex`
2. Restart Convex dev server: `npx convex dev`
3. Hard refresh browser

### Issue: Component changes not reflecting
**Solution:**
1. Clear Next.js cache: `rm -rf apps/platform/.next`
2. Restart dev server: `pnpm dev`
3. Hard refresh browser

### Issue: Storybook not updating
**Solution:**
1. Clear Storybook cache: `rm -rf storybook-static`
2. Restart Storybook: `pnpm storybook`
3. Hard refresh browser

### Issue: TypeScript errors persist after fixes
**Solution:**
1. Clear TypeScript cache: `find . -name "*.tsbuildinfo" -delete`
2. Restart TypeScript server in your IDE
3. Run typecheck: `pnpm typecheck`

### Issue: Turbo build cache stale
**Solution:**
1. Clear Turbo cache: `rm -rf .turbo`
2. Rebuild: `pnpm build`

## Cache Locations Reference

| Cache Type | Location | Cleared By |
|------------|----------|------------|
| Next.js | `.next/` | `pnpm clear-cache` |
| Turbo | `.turbo/` | `pnpm clear-cache` |
| Convex (local) | `.convex/` | `pnpm clear-cache` |
| Convex (server) | Database table `brandCSSCache` | Restart Convex dev server |
| Storybook | `storybook-static/` | `pnpm clear-cache` |
| TypeScript | `*.tsbuildinfo` | `pnpm clear-cache` |
| pnpm (global) | `~/.pnpm-store/` | `pnpm store prune` |
| Node modules | `node_modules/` | `pnpm clean` |

## Prevention Tips

1. **Use Hard Refresh** during development instead of regular refresh
2. **Restart dev servers** after major dependency changes
3. **Clear caches proactively** when switching branches
4. **Monitor Convex logs** for cache invalidation messages
5. **Use browser DevTools** Network tab to verify fresh asset loading

## Troubleshooting

If cache clearing doesn't resolve your preview issues:

1. **Check Convex connection:** Ensure `npx convex dev` is running
2. **Verify environment variables:** Check `.env.local` files
3. **Check browser console:** Look for JavaScript errors
4. **Verify file watching:** Ensure your IDE isn't locking files
5. **Check disk space:** Low disk space can cause cache issues

For persistent issues, try the complete reset workflow above.
