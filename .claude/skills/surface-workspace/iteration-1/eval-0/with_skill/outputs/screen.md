# Banking Account Overview Screen

```tsx
import {
  Surface,
  Text,
  Button,
  Divider,
  Avatar,
  Icon,
} from '@oneui/ui';

type Transaction = {
  id: string;
  merchant: string;
  category: string;
  amount: number; // negative = spend, positive = credit
  date: string;
};

const transactions: Transaction[] = [
  { id: 't1', merchant: 'Whole Foods Market', category: 'Groceries', amount: -84.32, date: 'Today' },
  { id: 't2', merchant: 'Salary — Acme Corp', category: 'Income', amount: 4200.0, date: 'Yesterday' },
  { id: 't3', merchant: 'Shell', category: 'Fuel', amount: -52.1, date: 'Yesterday' },
  { id: 't4', merchant: 'Netflix', category: 'Subscriptions', amount: -15.99, date: 'Mon' },
  { id: 't5', merchant: 'Transfer to Savings', category: 'Transfer', amount: -300.0, date: 'Sun' },
];

const money = (n: number) =>
  `${n < 0 ? '−' : '+'}$${Math.abs(n).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export function AccountOverviewScreen() {
  return (
    // Page stays DEFAULT neutral. Finance/account UI is never tinted at page level.
    <main
      style={{
        maxWidth: 480,
        margin: '0 auto',
        padding: 'var(--Spacing-5)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--Spacing-8)',
      }}
    >
      {/* ── Balance ──────────────────────────────────────────────
          No surface. Hierarchy comes from type scale + spacing, not color. */}
      <section
        style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-2)' }}
      >
        <Text variant="label" size="S" style={{ color: 'var(--Text-Medium)' }}>
          Available balance
        </Text>
        <Text variant="display" size="M" as="p" weight="high">
          $12,480.55
        </Text>
        <Text variant="body" size="S" style={{ color: 'var(--Text-Medium)' }}>
          Everyday Checking •••• 4821
        </Text>

        <div style={{ display: 'flex', gap: 'var(--Spacing-3)', marginTop: 'var(--Spacing-3)' }}>
          {/* The screen's primary action — the one bold attention point in the
              functional UI. */}
          <Button variant="bold">Send money</Button>
          <Button variant="subtle">Request</Button>
        </div>
      </section>

      {/* ── Cashback offer ───────────────────────────────────────
          THE one non-default surface on the screen. A reward/promo is exactly
          what `sparkle` is for — it draws the eye without pretending to be
          product chrome. Wrapped in <Surface> so text, button, and icon all
          auto-resolve to readable on-surface colors; no hardcoded background,
          no decorative border (the fill is the boundary). */}
      <Surface
        mode="bold"
        appearance="sparkle"
        style={{
          borderRadius: 'var(--Shape-4)',
          padding: 'var(--Spacing-5)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--Spacing-4)',
        }}
      >
        <Icon name="gift" size="L" />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-1)' }}>
          <Text variant="title" size="S" weight="high">
            Earn 5% cashback this week
          </Text>
          <Text variant="body" size="S">
            Spend on dining and groceries to unlock up to $50 back.
          </Text>
        </div>
        {/* `ghost` on a colored surface = readable text, no second fill —
            keeps the card from having two competing solid blocks. */}
        <Button variant="ghost">Activate</Button>
      </Surface>

      {/* ── Recent transactions ──────────────────────────────────
          Default neutral list. No tinted rows. Amount color is the only color,
          and it's semantic (positive credit vs neutral spend), not decorative. */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-3)' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <Text variant="title" size="M" weight="high">
            Recent transactions
          </Text>
          <Button variant="ghost" size="small">See all</Button>
        </div>

        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {transactions.map((tx, i) => (
            <li key={tx.id}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--Spacing-3)',
                  paddingBlock: 'var(--Spacing-3)',
                }}
              >
                <Avatar size="M" name={tx.merchant} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Text variant="body" size="M" weight="medium">
                    {tx.merchant}
                  </Text>
                  <Text variant="label" size="XS" style={{ color: 'var(--Text-Medium)' }}>
                    {tx.category} · {tx.date}
                  </Text>
                </div>
                <Text
                  variant="body"
                  size="M"
                  weight="high"
                  style={{
                    color: tx.amount > 0 ? 'var(--Positive-TintedA11y)' : 'var(--Text-High)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {money(tx.amount)}
                </Text>
              </div>
              {i < transactions.length - 1 && <Divider />}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
```

## Surface choices (and why)

This is a **utility / finance screen**, so the governing rule is: *default neutral everywhere, earn every exception.* The screen has exactly **one** non-default surface.

- **Page → default neutral.** Account screens are never tinted at the page or section level — that hurts legibility and trust, and a tinted page gives the whole screen unfocused attention. Hierarchy for the balance, sections, and list comes from **type scale, weight, and spacing**, not from colored boxes.

- **Balance block → no surface.** A display-size number plus a medium label is more than enough hierarchy. The only "attention" here is the primary **Send money** action (`variant="bold"`), which is the screen's functional focal point.

- **Cashback offer → the one `<Surface mode="bold" appearance="sparkle">`.** You explicitly want to *draw attention* to a reward, and `sparkle` is the role reserved for promotion / cashback / celebration moments. Wrapping it in `<Surface>` (not a styled `<div>`) is what makes the heading, body, gift icon, and **Activate** button auto-resolve to readable on-surface colors with WCAG-safe contrast — zero manual color, no inverting text for dark mode. No decorative border: the tinted fill already is the card boundary. The **Activate** button is `ghost` so the card doesn't carry two competing solid fills.

- **Transactions → default neutral list.** No tinted rows, no per-row cards. Separation is a plain `Divider` plus spacing. The only color in the list is **semantic**: incoming credits use `--Positive-TintedA11y`; spends stay neutral `--Text-High`. That keeps color meaningful instead of decorative.

**One focal point survives:** the cashback offer is the single attention surface, and it sits apart from the primary **Send money** action so the two don't shout over each other. Everything else is calm default — which is exactly how a banking overview should read.
