# oneui.brands.json

This file tells `@oneui/native-cdn` which brand tokens to prefetch.

## Fields

| Field      | Type   | Description |
|------------|--------|-------------|
| `id`       | string | Brand identifier. Must match a brand registered in OneUI Studio. |
| `version`  | string | `"latest"` always fetches the most recent publish. Pin to a semver (e.g. `"1.2.3"`) for reproducible builds. |
| `cdnUrl`   | string | CDN endpoint for the brand bundle. **Placeholder** — replace with the real URL once `@oneui/native-cdn` ships your brand endpoint. |

## Sub-brand syntax

Use a slash to address a sub-brand:

```json
{ "id": "jio/premium", "version": "latest", "cdnUrl": "..." }
```

## Multiple brands

```json
{
  "brands": [
    { "id": "jio",     "version": "latest", "cdnUrl": "..." },
    { "id": "tira",    "version": "2.0.0",  "cdnUrl": "..." }
  ]
}
```

Switch at runtime by changing the `brand` prop on `<OneUIBrandProvider>`.
