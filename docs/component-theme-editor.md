# Component Theme Editor

The Component Theme Editor adds a brand-level layer above per-component recipes.
It lets a brand tune broad families such as Actions and Inputs once, while still
allowing individual components to opt out through their local recipe or advanced
token overrides.

## Cascade

Component customisation resolves in this order:

1. Manifest defaults
2. Component theme family selections
3. Per-component recipe selections
4. Manual token overrides

This keeps the common brand intent central, but preserves the existing escape
hatches. Manual overrides remain the highest priority and should stay rare.

## Families

Initial families:

- **Actions**: buttons, icon buttons, chips, FABs, and selectable buttons. The
  family currently exposes shape, scale, and high-attention style.
- **Inputs**: input fields, checkbox, radio, switch, and stepper controls. The
  family currently exposes shape and field scale. Shape includes inner control
  parts where the component supports them, such as radio dots and switch thumbs.

Each family declares explicit component targets. A family decision only affects a
component when that target maps the decision to supported component tokens.
Controls only expose decisions that map to supported component tokens. Decisions
that only affected one component, or looked global but did not produce a visible
family-wide result, should stay out of this layer until the component contracts
support them consistently.

## Surface Safety

Family decisions must resolve through semantic tokens or component-local
intermediate variables. For example, the Actions outline style uses Button’s
`--_btn-default-low-stroke` variable rather than pinning `Primary` directly, so
multi-accent appearances and `[data-surface]` remapping continue to work.

Raw token overrides are still available in Advanced Overrides, but the primary
editing surface should remain family decisions and per-component recipes.
