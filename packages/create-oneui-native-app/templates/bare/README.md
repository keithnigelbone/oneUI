# __PROJECT_NAME__

A OneUI Native app scaffolded with `create-oneui-native-app`.

## Getting started

```sh
cd __PROJECT_NAME__
npx oneui-native-cdn prefetch   # fetch brand token data
npm run link-assets             # register fonts (bare template)
npm run ios                     # launch on iOS (requires Xcode)
npm run android                 # launch on Android
```

## Brand switching

Edit `oneui.brands.json` to add or change brands, then run `npm run prefetch` to
refresh the cached data. Restart Metro after prefetching. The `cdnUrl` field in
`oneui.brands.json` is a placeholder — update it once `@oneui/native-cdn` ships
your brand's CDN endpoint.

Sub-brand syntax: `"id": "jio/premium"`.

## Dark mode

Tap the **Mode** button in the top-right corner of the demo screen to toggle
between light and dark themes at runtime.

## Troubleshooting

- **Metro bundler not starting** — run `npm start --reset-cache` to clear the
  bundler cache.
- **iOS build fails** — run `cd ios && pod install` then rebuild.
- **Android build fails** — ensure `JAVA_HOME` is set and a JDK ≥ 17 is installed.
