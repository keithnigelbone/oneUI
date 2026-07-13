# Interactive components — accessibility audit

See [_template.md](./_template.md) and [README.md](./README.md).

| Component | APG pattern / ARIA role | Current state | Missing | RN support? | Priority | Owner PR |
| --------- | ----------------------- | ------------- | ------- | ----------- | -------- | -------- |
| Button | [Button](https://www.w3.org/WAI/ARIA/apg/patterns/button/) / `button` | `getButtonAccessibilityProps`; label, busy, expanded, haspopup, hint; `touchTarget.min` on width | Token focus halo (web `:focus-visible`) | partial | P2 | audit/a11y-button-family |
| IconButton | Button / `button` | Required `aria-label`; `hitSlop` below 44px; haspopup, focusable | Smallest size visual &lt; 44px without hitSlop on XL only if metrics ≥ min | yes | P1 fixed | audit/a11y-button-family |
| LinkButton | [Link](https://www.w3.org/WAI/ARIA/apg/patterns/link/) / `link` | Label from `aria-label` or children; busy/disabled; focusable | Focus halo | partial | P2 | audit/a11y-button-family |
| Checkbox | [Checkbox](https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/) / `checkbox` | `checked` / `mixed`; disabled; label chain; focusable | `aria-invalid` not mapped to RN state | partial | P2 | audit/a11y-checkbox-radio |
| CheckboxField | Group + checkbox children | Group label via field; children use Checkbox a11y | Fieldset role N/A on RN — document pattern | note | P2 | audit/a11y-checkbox-radio |
| Radio | [Radio](https://www.w3.org/WAI/ARIA/apg/patterns/radio/) / `radio` | `selected`; group context; focusable | Arrow-key roving tabindex — OS default | partial | P2 | audit/a11y-checkbox-radio |
| RadioField | Radio group | Same as RadioField web parity | — | yes | — | audit/a11y-checkbox-radio |
| Input | [Textbox](https://www.w3.org/WAI/ARIA/apg/patterns/) / implicit field | Label, disabled, `aria-describedby`, `aria-invalid` on TextInput | No RN `textbox` role (platform default) | note | P2 | audit/a11y-input |
| InputDynamicText | Text + button | Live region mapping; trailing button a11y | — | yes | — | audit/a11y-input |
| InputFeedback | [Alert](https://www.w3.org/WAI/ARIA/apg/patterns/alert/) / assertive live | `accessibilityRole` alert (negative); polite status; hidden when `aria-hidden` | — | yes | — | audit/a11y-input |
| Chip | Toggle button / `button` + `selected` | `accessibilityState.selected`; focusable; `hitSlop` | `aria-pressed` web alias → use `selected` | yes | — | audit/a11y-chip |
| ChipGroup | Group | `aria-label` on group; disabled on group | — | yes | — | audit/a11y-chip |
| Icon | Image / decorative | Label from `aria-label` or catalog id; `aria-hidden` | — | yes | — | audit/a11y-icon-avatar |
| IconContained | Button-like icon | Contained pressable a11y helpers | Touch target audit per size | partial | P1 | audit/a11y-icon-avatar |
| Avatar | Image | `alt` → label; disabled state; decorative slots hidden | — | yes | — | audit/a11y-icon-avatar |
| BottomNavigation | [Tabs](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/) / `tablist` | `accessibilityRole` tablist + label + hint | Manual tab activation / arrow keys — future | partial | P2 | audit/a11y-navigation |
| BottomNavigationItem | `tab` | `selected`; disabled; hint | — | yes | — | audit/a11y-navigation |
| PaginationDots | [Carousel](https://www.w3.org/WAI/ARIA/apg/patterns/carousel/) | Root label; per-dot selected; overflow hidden | Carousel slide context — hint only | partial | P2 | audit/a11y-navigation |
