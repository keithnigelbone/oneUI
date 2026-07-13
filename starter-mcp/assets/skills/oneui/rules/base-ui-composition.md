# Base-UI Composition

OneUI components are built on **Base UI** (`@base-ui/react`) primitives, then styled with token-only CSS. You consume the *OneUI* components and inherit Base UI's composition model — you never touch Base UI directly. (This is OneUI's analog of shadcn's radix-vs-base distinction.)

## Import from `@jds4/oneui-react`, never `@base-ui/react`

Importing a primitive straight from Base UI bypasses OneUI's tokens, surface context, and a11y wiring. The validator flags this as `forbidden-base-ui` and maps it to the OneUI equivalent.

**Incorrect:**
```tsx
import { Dialog } from "@base-ui/react"        {/* raw primitive — no OneUI styling/tokens */}
import { Checkbox } from "@base-ui/react"
```

**Correct:**
```tsx
import { Dialog, Checkbox } from "@jds4/oneui-react"
```

Also wrong: the internal workspace name `@oneui/ui`, or `oneui-react`. The published web package is **`@jds4/oneui-react`** (native: `@oneui/ui-native`). See `rules/imports-and-setup.md`.

## Custom triggers/elements use the `render` prop (Base UI), not `asChild` (Radix)

To make a OneUI trigger render *as* your element (a link, a custom button), pass `render`. Don't wrap the child in an extra element, and don't reach for Radix's `asChild` (it doesn't exist here).

**Incorrect:**
```tsx
<DialogTrigger asChild>           {/* Radix API — not Base UI */}
  <Button>Open</Button>
</DialogTrigger>

<DialogTrigger>                   {/* extra wrapper element */}
  <span><Button>Open</Button></span>
</DialogTrigger>
```

**Correct:**
```tsx
<DialogTrigger render={<Button>Open</Button>} />
```

## Render a button-like control as a non-button with `nativeButton={false}`

When a control must be a different element (e.g. an anchor for navigation) use `nativeButton={false}` rather than nesting an `<a>` inside a `<button>`.

**Correct:**
```tsx
<Button nativeButton={false} render={<a href="/pricing" />}>Pricing</Button>
```

## Don't fork or re-implement primitive behavior

Base UI owns behavior (focus, keyboard, ARIA). Never copy a primitive's internals or hand-roll its interactions — compose the OneUI component and, if you need different behavior, check `get_component_info` for the supported prop. Hand-rolled controls fail `validate_oneui_code` (`undefined-component`) and lose accessibility.

> Exact composition props vary per component and platform — confirm `render` / `nativeButton` / controlled-vs-uncontrolled support with `get_component_info <name>` before relying on them.
