# Performance Debugging Guide

## Quick Tests

### Test 1: Disable React DevTools
The error you're seeing (`installHook.js`) is from React DevTools. It can significantly slow down development.

1. **Disable React DevTools** in Chrome:
   - Go to `chrome://extensions`
   - Find "React Developer Tools"
   - Toggle it OFF
   - Refresh the page

2. Try navigating - is it faster now?

If yes, the DevTools are the bottleneck, not your app.

### Test 2: Check Console Timings
With the current code, when you click a menu item, you should see:
- `[NAV] Starting navigation: /from -> /to`
- `[NAV] router.push call: X.XXms`
- (wait time)
- `[NAV] Total navigation time: X.XXms`
- `[NAV] Navigation to /to completed in X.XXms`

If `router.push call` is fast (<10ms) but `Total navigation time` is slow, the issue is in page rendering.

### Test 3: Long Task Observer
The long task observer will log any operation >50ms.
Look for `[PERF] LONG TASK:` messages in the console.
This tells you what's blocking the main thread.

### Test 4: Chrome Performance Tab
1. Open DevTools > Performance tab
2. Click the record button
3. Click a menu item
4. Stop recording
5. Look for long yellow/red bars (JS blocking time)

## Common Bottlenecks

1. **React DevTools** - Creates ~50 recursive calls per update
2. **Heavy useQuery calls** - Convex queries that return large data
3. **Component mount effects** - useEffect with heavy computations
4. **Large lists rendering** - IconBrowser loading thousands of icons

## Console Commands

```javascript
// Get performance summary
window.__perfSummary()

// View all recorded timings
window.__perfTimings

// Start/stop long task observer
window.__startLongTaskObserver()
window.__stopLongTaskObserver()
```
