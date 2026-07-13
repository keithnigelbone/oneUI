# Component Docs Overrides

Use this folder to provide machine-readable documentation overrides without editing source code contracts.

## Button

Create `button.override.json` with a partial `ComponentDocumentationSpec`.

Example:

```json
{
  "intentAndPurpose": {
    "intent": {
      "value": "Trigger a single user action for conversion-focused flows.",
      "attribution": {
        "source": "overridden"
      }
    }
  },
  "observabilityHooks": {
    "track": {
      "value": ["click", "impression", "abandonment", "retry"],
      "attribution": {
        "source": "overridden"
      }
    }
  }
}
```

Then run:

```bash
pnpm docs:machine
```
