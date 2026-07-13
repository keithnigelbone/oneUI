# Informational components — accessibility audit

See [_template.md](./_template.md) and [README.md](./README.md).

| Component | APG pattern / ARIA role | Current state | Missing | RN support? | Priority | Owner PR |
| --------- | ----------------------- | ------------- | ------- | ----------- | -------- | -------- |
| Badge | Live text / `text` or `none` | `accessibilityLiveRegion: polite`; label from `aria-label` or children | — | yes | — | audit/a11y-badges |
| CounterBadge | Live text | Polite live region; label defaults to value | — | yes | — | audit/a11y-badges |
| IndicatorBadge | Image or hidden | Labeled `image` role; unlabeled decorative hidden | — | yes | — | audit/a11y-badges |
| Spinner | [Progressbar](https://www.w3.org/WAI/ARIA/apg/patterns/progressbar/) (indeterminate) | `progressbar` + `busy` + `accessibilityLiveRegion: polite` | APG `status` alternative documented in `interface.ts` | yes | — | audit/a11y-progress |
| Progress | Progressbar | `accessibilityValue` when determinate; busy when indeterminate | — | yes | — | audit/a11y-progress |
| CircularProgressIndicator | Progressbar | min/max/now via `accessibilityValue`; live region | — | yes | — | audit/a11y-progress |
| Text | Text / `header` / `link` | Role by variant; `aria-hidden`; hint | — | yes | — | audit/a11y-media-text |
| Image | Image | `alt` / `aria-label`; interactive vs static | — | yes | — | audit/a11y-media-text |
| Logo | Image | `alt` on root; `LOGO_DECORATIVE_A11Y` on mark | — | yes | — | audit/a11y-media-text |
