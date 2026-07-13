# Composition Patterns

Detailed layout examples for common page types. Each example shows the surface structure, component selection, typography, and spacing decisions.

---

## 1. Product Listing Page (E-commerce Grid)

**Philosophy**: Content is hero. White canvas with product imagery as the focal point. Filter chips provide subtle interaction without competing with products.

```tsx
// Page structure -- default surface throughout
<main style={{ padding: 'var(--Spacing-Margin)' }}>
  {/* Page header -- default background, always */}
  <header>
    <h1 style={{ font: 'var(--Headline-L-FontSize)/var(--Headline-L-LineHeight) var(--Typography-Font-Primary)', fontWeight: 'var(--Headline-L-FontWeight)' }}>
      Daily Essentials
    </h1>
  </header>

  {/* Filter bar -- horizontal scroll on mobile */}
  <div style={{ display: 'flex', gap: 'var(--Spacing-2)', padding: 'var(--Spacing-4) 0' }}>
    <Chip appearance="secondary" variant="bold">Groceries</Chip>  {/* Selected */}
    <Chip appearance="secondary" variant="ghost">Fruits</Chip>
    <Chip appearance="secondary" variant="ghost">Vegetables</Chip>
    <Chip appearance="secondary" variant="ghost">Dairy</Chip>
  </div>

  {/* Product grid -- default background, no card fills */}
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 'var(--Spacing-4)' }}>
    <article>
      <Image src={productImg} />
      <h3 style={{ font: 'var(--Title-S-FontSize)/var(--Title-S-LineHeight) var(--Typography-Font-Primary)' }}>
        Product Name
      </h3>
      <p style={{ font: 'var(--Body-S-FontSize)/var(--Body-S-LineHeight) var(--Typography-Font-Primary)', color: 'var(--Text-Medium)' }}>
        ₹299
      </p>
      <Button variant="bold" appearance="primary" size="s">Add to Cart</Button>
    </article>
  </div>
</main>
```

**Key decisions**:
- Surface: `default` everywhere -- products are the visual content
- Chips: `secondary` appearance (accent color, not primary action color)
- One CTA per card: `Button bold primary` for "Add to Cart"
- Typography: `Headline-L` for page title, `Title-S` for product names, `Body-S` for prices
- Spacing: `Spacing-M` grid gap, `Spacing-3XS` between chips

---

## 2. Product Detail Page

**Philosophy**: Hero image dominates. Single clear CTA. Supporting info in quiet typography.

```tsx
<main>
  {/* Hero image -- full width, default background */}
  <section>
    <Image src={heroImg} style={{ width: '100%' }} />
  </section>

  {/* Product info -- default background */}
  <section style={{ padding: 'var(--Spacing-Margin)', display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4)' }}>
    <h1 style={{ font: 'var(--Headline-M-FontSize)/var(--Headline-M-LineHeight) var(--Typography-Font-Primary)', fontWeight: 'var(--Headline-M-FontWeight)' }}>
      Product Title
    </h1>
    <p style={{ font: 'var(--Body-M-FontSize)/var(--Body-M-LineHeight) var(--Typography-Font-Primary)', color: 'var(--Text-Medium)' }}>
      Product description and details.
    </p>

    {/* Price and CTA -- single focal point */}
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--Spacing-4-5)' }}>
      <span style={{ font: 'var(--Headline-L-FontSize)/var(--Headline-L-LineHeight) var(--Typography-Font-Primary)', fontWeight: 'var(--Headline-L-FontWeight)' }}>
        ₹1,999
      </span>
      <Button variant="bold" appearance="primary" size="l" fullWidth>Buy Now</Button>
    </div>

    {/* Secondary actions -- ghost, de-emphasized */}
    <div style={{ display: 'flex', gap: 'var(--Spacing-2)' }}>
      <Button variant="ghost" appearance="neutral" start={<Icon name="heart" />}>Wishlist</Button>
      <Button variant="ghost" appearance="neutral" start={<Icon name="share" />}>Share</Button>
    </div>
  </section>

  {/* Related products -- same pattern as listing grid */}
  <section style={{ padding: 'var(--Spacing-Margin)' }}>
    <h2 style={{ font: 'var(--Title-L-FontSize)/var(--Title-L-LineHeight) var(--Typography-Font-Primary)', fontWeight: 'var(--Title-L-FontWeight)' }}>
      You might also like
    </h2>
    {/* Horizontal scroll of product cards */}
  </section>
</main>
```

**Key decisions**:
- Surface: `default` everywhere
- One primary CTA: "Buy Now" as `Button bold primary large fullWidth`
- Secondary actions: `ghost neutral` buttons (Wishlist, Share) -- minimal attention
- Typography: `Headline-M` for product title, `Headline-L` for price (the most important number), `Title-L` for section heading
- Attention hierarchy: Hero image (High) > Price + Buy button (High) > Description (None) > Secondary actions (Low)

---

## 3. Settings Page

**Philosophy**: Grouped sections create structure without overwhelming. Toggles and radios use secondary color.

```tsx
<main style={{ padding: 'var(--Spacing-Margin)', display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-8)' }}>
  <h1 style={{ font: 'var(--Headline-L-FontSize)/var(--Headline-L-LineHeight) var(--Typography-Font-Primary)', fontWeight: 'var(--Headline-L-FontWeight)' }}>
    Settings
  </h1>

  {/* Settings group -- subtle surface for visual grouping */}
  <Surface mode="subtle">
    <section style={{ padding: 'var(--Spacing-4)', borderRadius: 'var(--Shape-4)', display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-2-5)' }}>
      <h2 style={{ font: 'var(--Title-M-FontSize)/var(--Title-M-LineHeight) var(--Typography-Font-Primary)', fontWeight: 'var(--Title-M-FontWeight)' }}>
        Notifications
      </h2>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ font: 'var(--Body-M-FontSize)/var(--Body-M-LineHeight) var(--Typography-Font-Primary)' }}>Push notifications</span>
          <span style={{ font: 'var(--Body-S-FontSize)/var(--Body-S-LineHeight) var(--Typography-Font-Primary)', color: 'var(--Text-Medium)' }}>
            Receive alerts for orders and offers
          </span>
        </div>
        <Switch appearance="secondary" />
      </div>

      <Divider />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>Email updates</span>
        <Switch appearance="secondary" />
      </div>
    </section>
  </Surface>

  {/* Another group */}
  <Surface mode="subtle">
    <section style={{ padding: 'var(--Spacing-4)', borderRadius: 'var(--Shape-4)' }}>
      <h2>Language</h2>
      <Radio.Group>
        <Radio appearance="secondary" value="en">English</Radio>
        <Radio appearance="secondary" value="hi">Hindi</Radio>
        <Radio appearance="secondary" value="mr">Marathi</Radio>
      </Radio.Group>
    </section>
  </Surface>

  {/* Save button at bottom */}
  <Button variant="bold" appearance="primary" size="l" fullWidth>Save Changes</Button>
</main>
```

**Key decisions**:
- Groups use `<Surface mode="subtle">` for visual separation -- the only non-default surface on the page
- Switch and Radio use `secondary` appearance (accent color, not primary)
- Single save button: `bold primary large fullWidth` at bottom
- Typography: `Headline-L` page title, `Title-M` section headings, `Body-M` setting labels, `Body-S` descriptions
- Spacing: `Spacing-4XL` between groups, `Spacing-2XS` between items within a group

---

## 4. Hero / Landing Section

**Philosophy**: Brand moment. Bold surface for maximum impact. Single CTA. Display typography.

```tsx
{/* Hero -- the ONE bold moment on the page */}
<Surface mode="bold">
  <section style={{ padding: 'var(--Spacing-12) var(--Spacing-Margin)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--Spacing-6)' }}>
    <h1 style={{ font: 'var(--Display-L-FontSize)/var(--Display-L-LineHeight) var(--Typography-Font-Primary)', fontWeight: 900, letterSpacing: 'var(--Typography-LetterSpacing-Tight)' }}>
      Bringing joy into your home.
    </h1>
    <p style={{ font: 'var(--Body-L-FontSize)/var(--Body-L-LineHeight) var(--Typography-Font-Primary)', maxWidth: '600px' }}>
      Home internet, TV channels, and the world's best streaming services.
    </p>

    {/* CTA -- bold variant resolves at the bold surface's step so it stays distinguishable */}
    <div style={{ display: 'flex', gap: 'var(--Spacing-4)' }}>
      <Button variant="bold" appearance="primary" size="l">Explore now</Button>
      <Button variant="ghost" appearance="primary" size="l">Learn more</Button>
    </div>
  </section>
</Surface>

{/* Rest of page returns to default -- white canvas */}
<section style={{ padding: 'var(--Spacing-12) var(--Spacing-Margin)' }}>
  <h2 style={{ font: 'var(--Headline-L-FontSize)/var(--Headline-L-LineHeight) var(--Typography-Font-Primary)', fontWeight: 'var(--Headline-L-FontWeight)' }}>
    Why choose Jio
  </h2>
  {/* Feature cards on default surface */}
</section>
```

**Key decisions**:
- `<Surface mode="bold">` creates the bold brand moment -- text and buttons adapt via the `[data-surface="bold"]` cascade
- `Display-L` with negative letter-spacing for cinematic headline
- Inner `variant="bold"` button stays distinguishable because `--Primary-Bold` resolves at the bold container's step (no separate inversion logic at the API)
- `variant="ghost"` button gets contrasting text and a `--Primary-StrokeLow` border in the bold context
- After the hero, page returns to default -- the contrast makes the hero impactful
- Only ONE bold section per page. Multiple hero sections dilute impact.

---

## 5. Dashboard Page

**Philosophy**: Data-first. Minimal chrome. Status communicated through semantic colors, not brand colors.

```tsx
<main style={{ padding: 'var(--Spacing-Margin)', display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-7)' }}>
  <header>
    <h1 style={{ font: 'var(--Headline-L-FontSize)/var(--Headline-L-LineHeight) var(--Typography-Font-Primary)', fontWeight: 'var(--Headline-L-FontWeight)' }}>
      Dashboard
    </h1>
  </header>

  {/* Metric cards -- default background, data is the content */}
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--Spacing-4)' }}>
    <article style={{ padding: 'var(--Spacing-4)', borderRadius: 'var(--Shape-4)', border: '1px solid var(--Border-Subtle)' }}>
      <span style={{ font: 'var(--Label-S-FontSize)/var(--Label-S-LineHeight) var(--Typography-Font-Primary)', color: 'var(--Text-Medium)', fontWeight: 'var(--Label-FontWeight-Medium)' }}>
        Active Users
      </span>
      <span style={{ font: 'var(--Headline-M-FontSize)/var(--Headline-M-LineHeight) var(--Typography-Font-Primary)', fontWeight: 'var(--Headline-M-FontWeight)' }}>
        24,521
      </span>
      <Badge appearance="positive" variant="subtle" size="s">+12.3%</Badge>
    </article>

    <article style={{ padding: 'var(--Spacing-4)', borderRadius: 'var(--Shape-4)', border: '1px solid var(--Border-Subtle)' }}>
      <span style={{ font: 'var(--Label-S-FontSize)/var(--Label-S-LineHeight) var(--Typography-Font-Primary)', color: 'var(--Text-Medium)' }}>Errors</span>
      <span style={{ font: 'var(--Headline-M-FontSize)/var(--Headline-M-LineHeight) var(--Typography-Font-Primary)', fontWeight: 'var(--Headline-M-FontWeight)' }}>
        3
      </span>
      <Badge appearance="negative" variant="subtle" size="s">Critical</Badge>
    </article>
  </div>

  {/* Status list -- minimal attention, data focus */}
  <section>
    <h2 style={{ font: 'var(--Title-L-FontSize)/var(--Title-L-LineHeight) var(--Typography-Font-Primary)', fontWeight: 'var(--Title-L-FontWeight)' }}>
      Recent Activity
    </h2>
    {/* List items with default background, semantic badges for status */}
  </section>
</main>
```

**Key decisions**:
- All `default` surface -- dashboards are about data clarity, not brand expression
- Metric cards use subtle border (`var(--Border-Subtle)`) instead of shadow or `<Surface mode="subtle">`
- Status badges use semantic roles: `positive` for growth, `negative` for errors, `warning` for caution
- Typography: `Label-S` for metric labels (compact), `Headline-M` for metric values (prominent numbers)
- No primary CTAs competing with data. If action needed, single ghost button.

---

## 6. Form Page

**Philosophy**: Clean, functional, accessible. Inputs are content containers with subtle rounding.

```tsx
<main style={{ padding: 'var(--Spacing-Margin)', maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-7)' }}>
  <h1 style={{ font: 'var(--Headline-L-FontSize)/var(--Headline-L-LineHeight) var(--Typography-Font-Primary)', fontWeight: 'var(--Headline-L-FontWeight)' }}>
    Create Account
  </h1>

  <form style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-5)' }}>
    {/* Input group */}
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-1)' }}>
      <label style={{ font: 'var(--Label-S-FontSize)/var(--Label-S-LineHeight) var(--Typography-Font-Primary)', fontWeight: 'var(--Label-FontWeight-Medium)' }}>
        Full Name
      </label>
      <input style={{ borderRadius: 'var(--Shape-2)', padding: 'var(--Spacing-2-5) var(--Spacing-4)', border: 'var(--Stroke-M) solid var(--Border-Default)', font: 'var(--Body-M-FontSize)/var(--Body-M-LineHeight) var(--Typography-Font-Primary)' }} />
    </div>

    {/* Validation error */}
    <div>
      <label style={{ font: 'var(--Label-S-FontSize)/var(--Label-S-LineHeight) var(--Typography-Font-Primary)', fontWeight: 'var(--Label-FontWeight-Medium)' }}>
        Email
      </label>
      <input style={{ borderRadius: 'var(--Shape-2)', border: 'var(--Stroke-XL) solid var(--Negative-Default-Accent)' }} />
      <span style={{ font: 'var(--Body-XS-FontSize)/var(--Body-XS-LineHeight) var(--Typography-Font-Primary)', color: 'var(--Negative-Default-Accent-A11y)' }}>
        Please enter a valid email address
      </span>
    </div>

    {/* Terms checkbox */}
    <Checkbox appearance="secondary">
      I agree to the Terms of Service
    </Checkbox>

    {/* Submit -- single primary CTA */}
    <Button variant="bold" appearance="primary" size="l" fullWidth type="submit">
      Create Account
    </Button>

    {/* Alternative action -- de-emphasized */}
    <LinkButton appearance="primary">Already have an account? Sign in</LinkButton>
  </form>
</main>
```

**Key decisions**:
- Default surface throughout
- Inputs: `Shape-2` (8px) border-radius -- subtle, container feel
- Validation: `negative` role for errors (`--Negative-Default-Accent-A11y` for error text)
- Checkbox: `secondary` appearance
- Single submit CTA: `bold primary large fullWidth`
- Alternative action: `LinkButton` (text link, minimal attention)
- Typography: `Label-S medium` for labels, `Body-M` for input text, `Body-XS` for helper/error text
- Spacing: `Spacing-XL` between field groups, `Spacing-5XS` between label and input
