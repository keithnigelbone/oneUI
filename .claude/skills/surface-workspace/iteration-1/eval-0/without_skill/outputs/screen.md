# Banking Account Overview — OneUI

```tsx
import {
  Surface,
  Heading,
  Text,
  Button,
  Avatar,
  Divider,
} from '@oneui/ui';

type Txn = {
  id: string;
  merchant: string;
  category: string;
  date: string;
  amount: number; // negative = debit, positive = credit
};

const transactions: Txn[] = [
  { id: '1', merchant: 'Whole Foods Market', category: 'Groceries', date: 'Today', amount: -82.40 },
  { id: '2', merchant: 'Salary — Acme Inc.', category: 'Income', date: 'Yesterday', amount: 4200.00 },
  { id: '3', merchant: 'Spotify', category: 'Subscriptions', date: 'Jun 5', amount: -10.99 },
  { id: '4', merchant: 'Shell', category: 'Fuel', date: 'Jun 4', amount: -54.10 },
  { id: '5', merchant: 'Uber', category: 'Transport', date: 'Jun 3', amount: -18.75 },
];

const formatAmount = (n: number) =>
  `${n < 0 ? '−' : '+'}$${Math.abs(n).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

function BalanceHeader() {
  return (
    <header
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--Spacing-2)',
        paddingBlockEnd: 'var(--Spacing-4)',
      }}
    >
      <Text
        style={{
          fontFamily: 'var(--Typography-Font-Primary)',
          fontSize: 'var(--Label-S-FontSize)',
          lineHeight: 'var(--Label-S-LineHeight)',
          fontWeight: 'var(--Label-FontWeight-Medium)',
          color: 'var(--Text-Medium)',
        }}
      >
        Available balance
      </Text>

      <Heading
        as="h1"
        style={{
          fontFamily: 'var(--Typography-Font-Primary)',
          fontSize: 'var(--Display-S-FontSize)',
          lineHeight: 'var(--Display-S-LineHeight)',
          fontWeight: 'var(--Display-S-FontWeight)',
          color: 'var(--Text-High)',
        }}
      >
        $12,480.65
      </Heading>

      <Text
        style={{
          fontFamily: 'var(--Typography-Font-Primary)',
          fontSize: 'var(--Body-S-FontSize)',
          lineHeight: 'var(--Body-S-LineHeight)',
          fontWeight: 'var(--Body-FontWeight-Low)',
          color: 'var(--Text-Medium)',
        }}
      >
        Everyday Checking · ····4821
      </Text>

      <div
        style={{
          display: 'flex',
          gap: 'var(--Spacing-2)',
          paddingBlockStart: 'var(--Spacing-3)',
        }}
      >
        <Button variant="bold" appearance="primary">Send</Button>
        <Button variant="subtle" appearance="primary">Request</Button>
        <Button variant="ghost" appearance="primary">Add money</Button>
      </div>
    </header>
  );
}

function CashbackOffer() {
  // The ONE attention surface on this screen. Cashback is a reward/delight
  // moment, so it rides on the `sparkle` appearance. The surface engine
  // resolves fill, text and button colors automatically — no hardcoded colors.
  return (
    <Surface
      mode="bold"
      appearance="sparkle"
      style={{
        borderRadius: 'var(--Shape-4)',
        padding: 'var(--Spacing-4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 'var(--Spacing-3)',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-1)' }}>
        <Text
          style={{
            fontFamily: 'var(--Typography-Font-Primary)',
            fontSize: 'var(--Title-S-FontSize)',
            lineHeight: 'var(--Title-S-LineHeight)',
            fontWeight: 'var(--Title-S-FontWeight)',
          }}
        >
          Earn 5% cashback this month
        </Text>
        <Text
          style={{
            fontFamily: 'var(--Typography-Font-Primary)',
            fontSize: 'var(--Body-S-FontSize)',
            lineHeight: 'var(--Body-S-LineHeight)',
            fontWeight: 'var(--Body-FontWeight-Low)',
          }}
        >
          On all grocery and fuel spends, up to $40 back.
        </Text>
      </div>

      {/* variant="bold" sits inside the bold sparkle surface and stays
          distinguishable; its label auto-flips to the readable on-color. */}
      <Button variant="bold" appearance="sparkle">Activate</Button>
    </Surface>
  );
}

function TransactionRow({ txn }: { txn: Txn }) {
  const isCredit = txn.amount > 0;
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--Spacing-3)',
        paddingBlock: 'var(--Spacing-3)',
      }}
    >
      <Avatar size="md" name={txn.merchant} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-0-5)', flex: 1, minWidth: 0 }}>
        <Text
          style={{
            fontFamily: 'var(--Typography-Font-Primary)',
            fontSize: 'var(--Body-M-FontSize)',
            lineHeight: 'var(--Body-M-LineHeight)',
            fontWeight: 'var(--Body-FontWeight-Medium)',
            color: 'var(--Text-High)',
          }}
        >
          {txn.merchant}
        </Text>
        <Text
          style={{
            fontFamily: 'var(--Typography-Font-Primary)',
            fontSize: 'var(--Label-XS-FontSize)',
            lineHeight: 'var(--Label-XS-LineHeight)',
            fontWeight: 'var(--Label-FontWeight-Low)',
            color: 'var(--Text-Medium)',
          }}
        >
          {txn.category} · {txn.date}
        </Text>
      </div>

      <Text
        style={{
          fontFamily: 'var(--Typography-Font-Primary)',
          fontSize: 'var(--Body-M-FontSize)',
          lineHeight: 'var(--Body-M-LineHeight)',
          fontWeight: 'var(--Body-FontWeight-Medium)',
          // Credits get a semantic positive color; debits stay neutral.
          color: isCredit ? 'var(--Positive-High)' : 'var(--Text-High)',
          whiteSpace: 'nowrap',
        }}
      >
        {formatAmount(txn.amount)}
      </Text>
    </div>
  );
}

export function AccountOverviewScreen() {
  return (
    // Page stays on the DEFAULT neutral surface. This is a finance screen —
    // hierarchy comes from spacing, type scale, and one primary action.
    <main
      style={{
        maxWidth: 640,
        marginInline: 'auto',
        paddingInline: 'var(--Spacing-Margin)',
        paddingBlock: 'var(--Spacing-6)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--Spacing-5)',
      }}
    >
      <BalanceHeader />

      <CashbackOffer />

      <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-1)' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            paddingBlockEnd: 'var(--Spacing-1)',
          }}
        >
          <Heading
            as="h2"
            style={{
              fontFamily: 'var(--Typography-Font-Primary)',
              fontSize: 'var(--Title-M-FontSize)',
              lineHeight: 'var(--Title-M-LineHeight)',
              fontWeight: 'var(--Title-M-FontWeight)',
              color: 'var(--Text-High)',
            }}
          >
            Recent transactions
          </Heading>
          <Button variant="ghost" appearance="primary" size="sm">See all</Button>
        </div>

        {transactions.map((txn, i) => (
          <div key={txn.id}>
            <TransactionRow txn={txn} />
            {i < transactions.length - 1 && <Divider />}
          </div>
        ))}
      </section>
    </main>
  );
}
```

## Design choices

**The page is a default neutral surface.** This is a finance screen — the kind of product UI that should be calm and trustworthy. Hierarchy comes from spacing, the type scale, and weight, not from tinted boxes. The temptation to "brand" the whole page or wrap the balance in a colored card is exactly the anti-pattern to avoid: when everything is highlighted, nothing is.

**The balance leads through typography, not a surface.** It sits at the top on the plain page, rendered with a large Display size and the high-emphasis text color so it's unmistakably the screen's anchor. The three actions (Send / Request / Add money) use the button component's own variant hierarchy — bold for the primary action, subtle then ghost for the rest — so the focal action reads clearly without a competing background.

**The cashback offer is the one attention surface.** Per the surface budget, a screen gets at most one non-default surface that carries a real moment. Cashback is a reward/delight moment, so the offer card uses `<Surface mode="bold" appearance="sparkle">`. Because it's a real `<Surface>` (not a styled `<div>`), the engine auto-resolves the fill, the headline/body text color, and the "Activate" button's on-color with WCAG-safe contrast — no hardcoded colors, no manual dark-on-dark fixes. It's placed away from the primary "Send" action so the two don't fight for the eye.

**The transaction list stays default.** Neutral rows, separated by `<Divider />` and spacing rather than tinted backgrounds (the brand-bg-on-product-UI mistake). Credits get a semantic `--Positive-High` color — that's meaningful color, not decoration — while debits stay neutral `--Text-High`.

**Token discipline throughout.** Every text element pairs a role-specific font-size with its line-height token and carries `--Typography-Font-Primary`. Spacing, shape, and color all reference tokens — no literals — so the screen responds correctly to brand, platform, density, and theme changes.
```
