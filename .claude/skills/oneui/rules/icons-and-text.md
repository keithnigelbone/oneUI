# Icons & Text

Confirm icon names and the exact `appearance`/`emphasis`/`size` enums with `get_component_info Icon`.

## The `Icon` prop is `icon` (not `name`), from the OneUI icon package only

Import icons exclusively from `@jds4/oneui-icons-jio` (web) / `@oneui/icons-jio-native` (native). External icon libraries are banned (the validator flags `external-icon-import`).

**Incorrect:**
```tsx
import { Search } from "lucide-react"
<Icon name="search" />                    {/* wrong prop + external lib */}
<Search className="w-5 h-5" />
```

**Correct:**
```tsx
<Icon icon="search" />                     {/* semantic name via the `icon` prop */}
```

## Don't size icons with utility classes — use `size` / `emphasis`

Icons resolve their dimensions from tokens. Manual `w-/h-`/`size-*` classes break the scale.

**Incorrect:**
```tsx
<Icon icon="info" className="w-4 h-4" />
```

**Correct:**
```tsx
<Icon icon="info" size="5" emphasis="medium" />   {/* size = spacing-index preset; default '5' = 20px */}
```

## `sparkle` is rare; `neutral` is the default workhorse

`appearance="sparkle"` marks celebration / promotion moments — keep it to ~1–2 per viewport. General and decorative icons are `neutral`. Status icons use semantic roles (`positive`/`negative`/`warning`/`informative`).

**Incorrect:**
```tsx
<Icon icon="chevron-right" appearance="sparkle" />   {/* chrome is not a celebration */}
```

**Correct:**
```tsx
<Icon icon="gift" appearance="sparkle" />            {/* a real moment */}
<Icon icon="chevron-right" appearance="neutral" />   {/* chrome */}
<Icon icon="check-circle" appearance="positive" />   {/* status */}
```

## Body text stays neutral — only links are tinted

Text color comes from the neutral content tokens (`--Text-High` / `--Text-Medium` / `--Text-Low`). The *only* routine exception is a link, which uses a tinted / secondary appearance. Don't tint paragraphs, headings, or labels for emphasis — use weight/size or a `<Surface>` instead.

**Incorrect:**
```tsx
<Text style={{ color: 'var(--Primary-High)' }}>Important note</Text>   {/* tinted body text */}
```

**Correct:**
```tsx
<Text>Important note</Text>                              {/* neutral */}
<a className="link">Learn more</a>                        {/* link → tinted/secondary */}
```

Icons may use `emphasis="tinted"` / `tintedA11y` for theme-aware accenting (e.g. a tinted icon button); that's an *icon* affordance, not a license to tint text.

## Icons in/near text are dividers, not decoration

Use icons to separate or label content (leading/trailing slots), not to ornament every line. Pass them through component slots (`start`/`end`) rather than positioning them manually.

```tsx
<Button start="search">Search</Button>     {/* slot, not a manually placed icon */}
<ListItem leading={<Icon icon="folder" appearance="neutral" />}>Documents</ListItem>
```
