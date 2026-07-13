# Settings Page — OneUI

A settings screen with three grouped sections (Account, Notifications, Privacy). Each
group is a `<Surface mode="subtle">` card — the only non-default surface on the page —
and holds a few rows. Everything is token-driven: spacing, shape, color roles, and
typography. Toggles/switches use the `secondary` color role per OneUI convention, and a
single `bold primary` CTA anchors the bottom.

## Composition decisions

- **White-canvas page** on `default` surface; the three cards are the only tint. This
  keeps the attention pyramid quiet (rows = None/Low, save button = High).
- **`<Surface mode="subtle">` per group** triggers the `[data-surface]` token remapping,
  so every child row adapts automatically. No `background-color` is set manually, and no
  decorative stroke is added — the subtle fill already provides the card boundary.
- **Typography tokens only**: `Headline-L` page title, `Title-M` section headings,
  `Body-M` row labels, `Body-S` descriptions, all on `--Typography-Font-Primary`. Every
  `font-size` is paired with its matching `line-height` token.
- **Secondary role** on `Switch`/`Radio`/`Checkbox` (selection accent, not the primary
  action color). The destructive "Delete account" row uses the `negative` role.
- **Spacing**: `--Spacing-8` between groups, `--Spacing-2-5` between rows inside a group,
  `--Spacing-4` card padding. `--Shape-4` (16px) card rounding from the f-step scale.
- **One primary CTA**: `Save changes` as `bold primary fullWidth` at the bottom.

## TSX

```tsx
import { Surface } from '@oneui/ui';
import { Switch } from '@oneui/ui';
import { Radio } from '@oneui/ui';
import { Checkbox } from '@oneui/ui';
import { Divider } from '@oneui/ui';
import { Button } from '@oneui/ui';

/** Shared inline token style helpers (zero literals — all from design tokens). */
const styles = {
  page: {
    padding: 'var(--Spacing-Margin)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--Spacing-8)',
    maxWidth: '640px',
    marginInline: 'auto',
  },
  pageTitle: {
    font: 'var(--Headline-L-FontSize)/var(--Headline-L-LineHeight) var(--Typography-Font-Primary)',
    fontWeight: 'var(--Headline-L-FontWeight)',
    color: 'var(--Text-High)',
    margin: 0,
  },
  card: {
    padding: 'var(--Spacing-4)',
    borderRadius: 'var(--Shape-4)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--Spacing-2-5)',
  },
  sectionTitle: {
    font: 'var(--Title-M-FontSize)/var(--Title-M-LineHeight) var(--Typography-Font-Primary)',
    fontWeight: 'var(--Title-M-FontWeight)',
    color: 'var(--Text-High)',
    margin: 0,
    marginBottom: 'var(--Spacing-1)',
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 'var(--Spacing-4)',
    minHeight: '44px', // touch target — token-equivalent, kept explicit for a11y
  },
  rowText: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--Spacing-0-5)',
  },
  label: {
    font: 'var(--Body-M-FontSize)/var(--Body-M-LineHeight) var(--Typography-Font-Primary)',
    fontWeight: 'var(--Body-FontWeight-Medium)',
    color: 'var(--Text-High)',
  },
  description: {
    font: 'var(--Body-S-FontSize)/var(--Body-S-LineHeight) var(--Typography-Font-Primary)',
    fontWeight: 'var(--Body-FontWeight-Low)',
    color: 'var(--Text-Medium)',
  },
  destructiveLabel: {
    font: 'var(--Body-M-FontSize)/var(--Body-M-LineHeight) var(--Typography-Font-Primary)',
    fontWeight: 'var(--Body-FontWeight-Medium)',
    color: 'var(--Negative-High)',
  },
} as const;

/** One labelled row with an optional description and a trailing control. */
function SettingRow({
  label,
  description,
  control,
  destructive = false,
}: {
  label: string;
  description?: string;
  control: React.ReactNode;
  destructive?: boolean;
}) {
  return (
    <div style={styles.row}>
      <div style={styles.rowText}>
        <span style={destructive ? styles.destructiveLabel : styles.label}>{label}</span>
        {description ? <span style={styles.description}>{description}</span> : null}
      </div>
      {control}
    </div>
  );
}

export default function SettingsPage() {
  return (
    <main style={styles.page}>
      <h1 style={styles.pageTitle}>Settings</h1>

      {/* ── Account ─────────────────────────────────────────── */}
      <Surface mode="subtle">
        <section style={styles.card} aria-labelledby="settings-account">
          <h2 id="settings-account" style={styles.sectionTitle}>
            Account
          </h2>

          <SettingRow
            label="Name"
            description="Aarav Sharma"
            control={
              <Button variant="ghost" appearance="neutral" size="s">
                Edit
              </Button>
            }
          />
          <Divider />
          <SettingRow
            label="Email"
            description="aarav.sharma@jio.com"
            control={
              <Button variant="ghost" appearance="neutral" size="s">
                Change
              </Button>
            }
          />
          <Divider />
          <SettingRow
            label="Two-factor authentication"
            description="Add an extra layer of security to your account"
            control={<Switch appearance="secondary" defaultChecked />}
          />
        </section>
      </Surface>

      {/* ── Notifications ───────────────────────────────────── */}
      <Surface mode="subtle">
        <section style={styles.card} aria-labelledby="settings-notifications">
          <h2 id="settings-notifications" style={styles.sectionTitle}>
            Notifications
          </h2>

          <SettingRow
            label="Push notifications"
            description="Receive alerts for orders and offers"
            control={<Switch appearance="secondary" defaultChecked />}
          />
          <Divider />
          <SettingRow
            label="Email updates"
            description="Weekly summary and product news"
            control={<Switch appearance="secondary" />}
          />
          <Divider />
          <SettingRow
            label="SMS alerts"
            description="Critical account and security messages only"
            control={<Switch appearance="secondary" defaultChecked />}
          />
        </section>
      </Surface>

      {/* ── Privacy ─────────────────────────────────────────── */}
      <Surface mode="subtle">
        <section style={styles.card} aria-labelledby="settings-privacy">
          <h2 id="settings-privacy" style={styles.sectionTitle}>
            Privacy
          </h2>

          <SettingRow
            label="Profile visibility"
            description="Choose who can see your profile"
            control={
              <Checkbox appearance="secondary" defaultChecked>
                Public
              </Checkbox>
            }
          />
          <Divider />
          <SettingRow
            label="Personalised ads"
            description="Use activity to tailor recommendations"
            control={<Switch appearance="secondary" />}
          />
          <Divider />
          <SettingRow
            label="Delete account"
            description="Permanently remove your data"
            destructive
            control={
              <Button variant="subtle" appearance="negative" size="s">
                Delete
              </Button>
            }
          />
        </section>
      </Surface>

      {/* Single primary CTA — the one High-attention element on the page */}
      <Button variant="bold" appearance="primary" size="l" fullWidth>
        Save changes
      </Button>
    </main>
  );
}
```

## Token notes

- **Surface**: `subtle` is the only non-default surface, used three times for grouping —
  within the "≤3 modes per page" rule. No manual `background-color`, no card stroke
  (the subtle fill is the boundary).
- **Color roles**: rows are neutral/`Text-*`; switches + checkbox are `secondary`; the
  destructive row pairs a `negative` label (`--Negative-High`) with a `subtle negative`
  button; the save CTA is `bold primary`.
- **Shape**: `--Shape-4` (16px, derived from the f-step scale) on cards. Buttons inherit
  their own `--Shape-Pill` default from the component.
- **Spacing**: `--Spacing-Margin` page padding, `--Spacing-8` between groups,
  `--Spacing-2-5` between rows, `--Spacing-4` card padding, `--Spacing-0-5` label↔description.
- **Typography**: `Headline-L` → `Title-M` → `Body-M` / `Body-S`, all on
  `--Typography-Font-Primary`, every size paired with its line-height token.
- **A11y**: each `<section>` is `aria-labelledby` its heading; rows keep a 44px touch
  target; `Divider` separates rows instead of borders.
```
