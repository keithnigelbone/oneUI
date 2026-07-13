# Structure components — accessibility audit

See [_template.md](./_template.md) and [README.md](./README.md).

| Component | APG pattern / ARIA role | Current state | Missing | RN support? | Priority | Owner PR |
| --------- | ----------------------- | ------------- | ------- | ----------- | -------- | -------- |
| Divider | [Separator](https://www.w3.org/WAI/ARIA/apg/patterns/) / `separator` | Named separator + orientation; line hidden via `DIVIDER_LINE_A11Y` | — | yes | — | audit/a11y-structure |
| Separator | Decorative separator | `getSeparatorAccessibilityProps` → hidden from tree | — | yes | — | audit/a11y-structure |
| Container | Layout | `accessible: false` — not in a11y tree | Landmark roles if product needs — optional label later | partial | P2 | audit/a11y-structure |
