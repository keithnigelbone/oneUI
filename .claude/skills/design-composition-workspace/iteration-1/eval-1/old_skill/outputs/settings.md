# Settings Page — OneUI

A token-only settings page with three grouped sections (Account, Notifications, Privacy). Each group is a card on a `subtle` surface, the only non-default surface on the page. The page background stays `default` (white canvas), section headings use `Title-M`, row labels use `Body-M`, descriptions use `Body-S`, and toggles/radios use `secondary` appearance. A single `bold primary` save button anchors the bottom.

## TSX

```tsx
import { Surface, Switch, Radio, Divider, Button } from '@oneui/ui';

export function SettingsPage() {
  return (
    <main
      style={{
        padding: 'var(--Spacing-Margin)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--Spacing-4XL)',
        maxWidth: '640px',
        marginInline: 'auto',
      }}
    >
      <h1
        style={{
          font: 'var(--Headline-L-FontSize)/var(--Headline-L-LineHeight) var(--Typography-Font-Primary)',
          fontWeight: 'var(--Headline-L-FontWeight)',
          color: 'var(--Text-High)',
          margin: 0,
        }}
      >
        Settings
      </h1>

      {/* ── Account ─────────────────────────────────────────── */}
      <Surface mode="subtle">
        <section
          style={{
            padding: 'var(--Spacing-M)',
            borderRadius: 'var(--Shape-M)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--Spacing-2XS)',
          }}
        >
          <h2
            style={{
              font: 'var(--Title-M-FontSize)/var(--Title-M-LineHeight) var(--Typography-Font-Primary)',
              fontWeight: 'var(--Title-M-FontWeight)',
              color: 'var(--Text-High)',
              margin: 0,
            }}
          >
            Account
          </h2>

          <SettingRow
            label="Profile name"
            description="Visible across all Jio services"
            control={<Button variant="ghost" appearance="neutral" size="s">Edit</Button>}
          />
          <Divider />
          <SettingRow
            label="Email address"
            description="marcelinodzn@gmail.com"
            control={<Button variant="ghost" appearance="neutral" size="s">Change</Button>}
          />
          <Divider />
          <SettingRow
            label="Two-factor authentication"
            description="Add an extra layer of security"
            control={<Switch appearance="secondary" />}
          />
        </section>
      </Surface>

      {/* ── Notifications ───────────────────────────────────── */}
      <Surface mode="subtle">
        <section
          style={{
            padding: 'var(--Spacing-M)',
            borderRadius: 'var(--Shape-M)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--Spacing-2XS)',
          }}
        >
          <h2
            style={{
              font: 'var(--Title-M-FontSize)/var(--Title-M-LineHeight) var(--Typography-Font-Primary)',
              fontWeight: 'var(--Title-M-FontWeight)',
              color: 'var(--Text-High)',
              margin: 0,
            }}
          >
            Notifications
          </h2>

          <SettingRow
            label="Push notifications"
            description="Alerts for orders and offers"
            control={<Switch appearance="secondary" defaultChecked />}
          />
          <Divider />
          <SettingRow
            label="Email updates"
            description="Weekly summaries and product news"
            control={<Switch appearance="secondary" />}
          />
          <Divider />
          <SettingRow
            label="SMS alerts"
            description="Critical account activity only"
            control={<Switch appearance="secondary" defaultChecked />}
          />
        </section>
      </Surface>

      {/* ── Privacy ─────────────────────────────────────────── */}
      <Surface mode="subtle">
        <section
          style={{
            padding: 'var(--Spacing-M)',
            borderRadius: 'var(--Shape-M)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--Spacing-2XS)',
          }}
        >
          <h2
            style={{
              font: 'var(--Title-M-FontSize)/var(--Title-M-LineHeight) var(--Typography-Font-Primary)',
              fontWeight: 'var(--Title-M-FontWeight)',
              color: 'var(--Text-High)',
              margin: 0,
            }}
          >
            Privacy
          </h2>

          <SettingRow
            label="Profile visibility"
            description="Choose who can see your activity"
            control={
              <Radio.Group defaultValue="friends" orientation="horizontal">
                <Radio appearance="secondary" value="public">Public</Radio>
                <Radio appearance="secondary" value="friends">Friends</Radio>
                <Radio appearance="secondary" value="private">Private</Radio>
              </Radio.Group>
            }
            stacked
          />
          <Divider />
          <SettingRow
            label="Personalized ads"
            description="Use activity to tailor recommendations"
            control={<Switch appearance="secondary" />}
          />
          <Divider />
          <SettingRow
            label="Data sharing"
            description="Share usage data to improve services"
            control={<Switch appearance="secondary" defaultChecked />}
          />
        </section>
      </Surface>

      {/* Single primary action anchors the page */}
      <Button variant="bold" appearance="primary" size="l" fullWidth>
        Save Changes
      </Button>
    </main>
  );
}

/* Reusable row — label + optional description on the left, control on the right */
function SettingRow({
  label,
  description,
  control,
  stacked = false,
}: {
  label: string;
  description?: string;
  control: React.ReactNode;
  stacked?: boolean;
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: stacked ? 'column' : 'row',
        justifyContent: 'space-between',
        alignItems: stacked ? 'stretch' : 'center',
        gap: 'var(--Spacing-S)',
        paddingBlock: 'var(--Spacing-2XS)',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-6XS)' }}>
        <span
          style={{
            font: 'var(--Body-M-FontSize)/var(--Body-M-LineHeight) var(--Typography-Font-Primary)',
            fontWeight: 'var(--Body-FontWeight-Medium)',
            color: 'var(--Text-High)',
          }}
        >
          {label}
        </span>
        {description && (
          <span
            style={{
              font: 'var(--Body-S-FontSize)/var(--Body-S-LineHeight) var(--Typography-Font-Primary)',
              fontWeight: 'var(--Body-FontWeight-Low)',
              color: 'var(--Text-Medium)',
            }}
          >
            {description}
          </span>
        )}
      </div>
      {control}
    </div>
  );
}
```

## Design decisions (per OneUI composition rules)

- **Surface**: page is `default` (white canvas); each of the three groups uses `<Surface mode="subtle">` — the only non-default surface, providing card grouping without competing for attention. No manual `background-color` and **no decorative border** — the subtle tint already supplies the card boundary, so adding `--Border-*` would double the cue.
- **Attention pyramid**: everything is None/Low except the single `bold primary` "Save Changes" CTA (High). One focal point, anchored at the bottom.
- **Color roles**: `Switch` and `Radio` use `appearance="secondary"` (accent/selection role, not primary). Row-level "Edit"/"Change" actions are `ghost neutral` — quiet chrome.
- **Typography**: `Headline-L` page title, `Title-M` section headings, `Body-M` (medium weight) row labels, `Body-S` (low weight, `--Text-Medium`) descriptions. Every text element carries `--Typography-Font-Primary` and a paired line-height token.
- **Spacing & shape**: `--Spacing-Margin` page padding (auto-adapts per platform), `--Spacing-4XL` between groups, `--Spacing-M` card padding, `--Spacing-2XS` between rows, `--Spacing-6XS` between label and description. Cards use `--Shape-M` (16px).
- **Zero literals**: all spacing, shape, color, and type values come from `var(--Token-Name)` (only `0` and `'640px'` max-width container are raw layout values).
- **Divider** separates rows within a group instead of drawing extra strokes.
```
