# Future components — accessibility stubs

Not shipped in `@oneui/ui-native` (`hasNativeImpl: false` in native sample registry). When implementing, apply [playbook §3.3](../native-component-build-playbook.md) and the APG pattern below.

| Component | APG pattern | Required RN mapping | Notes |
| --------- | ----------- | ------------------- | ----- |
| Switch | [Switch](https://www.w3.org/WAI/ARIA/apg/patterns/switch/) | `accessibilityRole: 'switch'`, `accessibilityState.checked` | Space toggles on web; activate on RN |
| Slider | [Slider](https://www.w3.org/WAI/ARIA/apg/patterns/slider/) | `adjustable` + `accessibilityValue` | Arrow adjustments via `accessibilityActions` |
| Select / Combobox | [Select](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/), [Listbox](https://www.w3.org/WAI/ARIA/apg/patterns/listbox/) | `combobox` / `menu` roles; expanded, controls | Pair with Modal or ActionSheet for list |
| Tabs | [Tabs](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/) | `tablist` / `tab` / `selected` | See BottomNavigation audit for partial pattern |
| Modal / Dialog | [Dialog](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) | Focus trap, `accessibilityViewIsModal`, restore focus | RN `Modal` + initial focus |
| Tooltip | [Tooltip](https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/) | Often `accessibilityHint` on trigger; no hover on touch | Prefer visible label or hint |
| Alert / Toast | [Alert](https://www.w3.org/WAI/ARIA/apg/patterns/alert/), live region | `accessibilityLiveRegion: 'assertive'` | InputFeedback covers inline alert |
| List | [Listbox](https://www.w3.org/WAI/ARIA/apg/patterns/listbox/) | `accessibilityRole: 'list'` / items | Use `FlatList` a11y props |
| Card | — | Container + heading; not a single ARIA role | Ensure interactive children retain roles |
| TextArea | Textbox | Same as Input | Multiline `TextInput` |
| Fieldset | Group | `accessibilityRole: 'none'` on group + label on children | CheckboxField / RadioField precedent |
