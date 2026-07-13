#!/bin/bash

# OneUI Studio - Cache Clearing Script
# Clears all caches to ensure fresh previews

set -e

echo "🧹 Clearing OneUI Studio caches..."

# 1. Next.js build cache
echo "📦 Clearing Next.js cache (.next/)..."
find . -type d -name ".next" -prune -exec rm -rf {} + 2>/dev/null || true

# 2. Turbo cache
echo "⚡ Clearing Turbo cache (.turbo/)..."
find . -type d -name ".turbo" -prune -exec rm -rf {} + 2>/dev/null || true

# 3. Convex local dev cache
echo "🗄️  Clearing Convex local cache (.convex/)..."
find . -type d -name ".convex" -prune -exec rm -rf {} + 2>/dev/null || true

# 4. Storybook build cache
echo "📚 Clearing Storybook cache (storybook-static/)..."
find . -type d -name "storybook-static" -prune -exec rm -rf {} + 2>/dev/null || true

# 5. TypeScript build info cache
echo "📝 Clearing TypeScript build info..."
find . -name "*.tsbuildinfo" -delete 2>/dev/null || true

# 6. Vite cache (if any)
echo "⚡ Clearing Vite cache..."
find . -type d -name ".vite" -prune -exec rm -rf {} + 2>/dev/null || true

# 7. Node modules (optional - uncomment if needed)
# echo "📦 Clearing node_modules..."
# rm -rf node_modules
# rm -rf */node_modules
# rm -rf */*/node_modules

echo ""
echo "✅ Cache clearing complete!"
echo ""
echo "⚠️  Note: Convex brand CSS cache is server-side."
echo "   To clear it, restart your Convex dev server or invalidate via Convex dashboard."
echo ""
echo "💡 Next steps:"
echo "   1. Restart your dev servers (pnpm dev)"
echo "   2. Restart Convex dev server (npx convex dev)"
echo "   3. Hard refresh browser (Cmd+Shift+R / Ctrl+Shift+R)"
