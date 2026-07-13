'use client';

import { useState } from 'react';
import { Avatar } from '@oneui/ui/components/Avatar';
import { Badge } from '@oneui/ui/components/Badge';
import { Button } from '@oneui/ui/components/Button';
import { Chip } from '@oneui/ui/components/Chip';
import { Container } from '@oneui/ui/components/Container';
import { IconButton } from '@oneui/ui/components/IconButton';
import { Image } from '@oneui/ui/components/Image';
import { Logo } from '@oneui/ui/components/Logo';
import { Surface } from '@oneui/ui/components/Surface';
import { WebHeader } from '@oneui/ui/components/WebHeader';
import { usePlatformContext } from '@/contexts/PlatformContext';
import styles from './MarketingTemplate.module.css';

const NAV_ITEMS = [
  { value: 'mobile', label: 'Mobile' },
  { value: 'fiber', label: 'Fiber' },
  { value: 'business', label: 'Business' },
  { value: 'apps', label: 'Apps' },
  { value: 'support', label: 'Support' },
] as const;

const PRODUCT_CARDS = [
  {
    id: 'mobile',
    eyebrow: 'For every day',
    title: 'True 5G that keeps up with life',
    body: 'Fast connectivity, simple plans, and entertainment ready from the first recharge.',
    badge: 'Most popular',
    appearance: 'primary',
  },
  {
    id: 'fiber',
    eyebrow: 'For home',
    title: 'Fiber for streaming, work, and play',
    body: 'A dependable home internet experience with Wi-Fi, security, and content bundles.',
    badge: 'Home ready',
    appearance: 'secondary',
  },
  {
    id: 'business',
    eyebrow: 'For business',
    title: 'Digital tools for growing teams',
    body: 'Connectivity, devices, and cloud services composed for shops, offices, and creators.',
    badge: 'Teams',
    appearance: 'informative',
  },
] as const;

const PLAN_CARDS = [
  {
    title: 'Starter',
    price: 'Simple recharge',
    description: 'A compact mobile plan for browsing, messaging, and entertainment.',
    action: 'View starter',
    emphasis: 'low',
  },
  {
    title: 'Unlimited',
    price: 'Best value',
    description: 'Daily data, calling, and bundled apps for a connected household.',
    action: 'Explore unlimited',
    emphasis: 'high',
  },
  {
    title: 'Home Plus',
    price: 'Fiber bundle',
    description: 'Home broadband with premium entertainment and smart-home support.',
    action: 'Check availability',
    emphasis: 'medium',
  },
] as const;

const APP_FEATURES = [
  'Recharge in seconds',
  'Track every service',
  'Discover offers',
  'Get support fast',
] as const;

function BrandMark() {
  const { currentBrand } = usePlatformContext();

  return (
    <Logo
      alt={currentBrand?.name ?? 'Jio'}
      size="xl"
      variant="mark"
      svgContent={currentBrand?.logoSvg}
      src={currentBrand?.logoSvg ? undefined : '/JioLogo.svg'}
    />
  );
}

function HeaderActions() {
  return (
    <>
      <IconButton
        icon="search"
        aria-label="Search Jio Digital"
        attention="low"
        size={8}
        condensed
        appearance="neutral"
      />
      <IconButton
        icon="notification"
        aria-label="Notifications"
        attention="low"
        size={8}
        condensed
        appearance="neutral"
      />
    </>
  );
}

export function MarketingTemplate() {
  const [activeNav, setActiveNav] = useState<(typeof NAV_ITEMS)[number]['value']>('mobile');

  return (
    <main className={styles.page}>
      <WebHeader variant="default" aria-label="Jio Prima marketing header">
        <WebHeader.PrimaryNav
          className={styles.headerRow}
          type="homeBar"
          middle="fluid"
          searchInput="none"
          showMenuButton
          divider
          logo={<BrandMark />}
          end={<HeaderActions />}
          avatar={<Avatar alt="Account" size="xl" content="icon" appearance="secondary" />}
          activeValue={activeNav}
          aria-label="Primary site navigation"
        >
          {NAV_ITEMS.map((item) => (
            <WebHeader.Item
              key={item.value}
              value={item.value}
              href={`#${item.value}`}
              attention="medium"
              active={activeNav === item.value}
              onClick={() => setActiveNav(item.value)}
            >
              {item.label}
            </WebHeader.Item>
          ))}
        </WebHeader.PrimaryNav>
        <WebHeader.SecondaryNav
          className={styles.headerRow}
          type="marketing"
          subheader="Jio Prima phone with entertainment, payments, and everyday apps built in"
          end={
            <Button size={8} attention="high">
              Get started
            </Button>
          }
          aria-label="Marketing quick links"
        >
          <WebHeader.Item value="offers" href="#offers" attention="low">
            Offers
          </WebHeader.Item>
          <WebHeader.Item value="recharge" href="#plans" attention="low">
            Recharge
          </WebHeader.Item>
          <WebHeader.Item value="support" href="#support" attention="low">
            Help
          </WebHeader.Item>
        </WebHeader.SecondaryNav>
      </WebHeader>

      <Surface mode="bold" as="section" className={styles.hero}>
        <Container variant="fixed" className={styles.heroGrid}>
          <div className={styles.heroCopy}>
            <Badge appearance="sparkle" attention="medium" size="l">
              Jio Prima 5G
            </Badge>
            <h1>A smart phone experience made simple for every day.</h1>
            <p>
              Meet Jio Prima, a phone-first marketing template for testing how OneUI composes
              product stories, actions, and brand surfaces.
            </p>
            <div className={styles.heroActions}>
              <Button size={12} attention="high">
                Buy Jio Prima
              </Button>
              <Button size={12} attention="low" appearance="primary">
                Compare features
              </Button>
            </div>
          </div>
          <Image
            src="/oneui4.svg"
            alt="Jio Prima phone product backdrop"
            objectFit="cover"
            className={styles.heroImage}
            loading="eager"
          />
        </Container>
      </Surface>

      <section id="mobile">
        <Container variant="fixed" className={styles.section}>
          <div className={styles.sectionHeader}>
            <Badge appearance="primary" attention="low">
              Connected living
            </Badge>
            <h2>Choose the service that fits your day.</h2>
            <p>
              Cards stay quiet, content leads, and components carry the brand through surface-aware
              tokens.
            </p>
          </div>
          <div className={styles.productGrid}>
            {PRODUCT_CARDS.map((card) => (
              <Surface key={card.title} id={card.id} mode="default" className={styles.productCard}>
                <div className={styles.cardTopline}>
                  <span>{card.eyebrow}</span>
                  <Badge appearance={card.appearance} attention="medium">
                    {card.badge}
                  </Badge>
                </div>
                <h3>{card.title}</h3>
                <p>{card.body}</p>
                <Button size={8} attention="low" appearance={card.appearance}>
                  Learn more
                </Button>
              </Surface>
            ))}
          </div>
        </Container>
      </section>

      <Surface mode="subtle" as="section" id="plans" className={styles.plansBand}>
        <Container variant="fixed" className={styles.section}>
          <div className={styles.sectionHeader}>
            <Badge appearance="secondary" attention="medium">
              Plans
            </Badge>
            <h2>Recharge, bundle, or upgrade without complexity.</h2>
            <p>
              The template uses only OneUI controls for actions and only foundation tokens for
              layout and typography.
            </p>
          </div>
          <div className={styles.planGrid}>
            {PLAN_CARDS.map((plan) => (
              <Surface
                key={plan.title}
                mode={plan.emphasis === 'high' ? 'bold' : 'default'}
                className={styles.planCard}
              >
                <div className={styles.planCardHeader}>
                  <h3>{plan.title}</h3>
                  <Badge
                    appearance={plan.emphasis === 'high' ? 'sparkle' : 'neutral'}
                    attention={plan.emphasis === 'low' ? 'low' : 'medium'}
                  >
                    {plan.price}
                  </Badge>
                </div>
                <p>{plan.description}</p>
                <Button
                  size={10}
                  attention={plan.emphasis === 'high' ? 'high' : 'medium'}
                  appearance={plan.emphasis === 'high' ? 'primary' : 'neutral'}
                  fullWidth
                >
                  {plan.action}
                </Button>
              </Surface>
            ))}
          </div>
        </Container>
      </Surface>

      <section id="apps">
        <Container variant="fixed" className={styles.appSection}>
          <Surface mode="default" className={styles.appPanel}>
            <div className={styles.appCopy}>
              <Badge appearance="informative" attention="medium">
                MyJio-style app
              </Badge>
              <h2>One place to manage every connection.</h2>
              <p>
                A simple app-promo section for checking typography hierarchy, chip density, button
                emphasis, and surface context in one viewport.
              </p>
              <div className={styles.chipRow} aria-label="App capabilities">
                {APP_FEATURES.map((feature, index) => (
                  <Chip
                    key={feature}
                    selected={index === 0}
                    appearance={index === 0 ? 'secondary' : 'neutral'}
                  >
                    {feature}
                  </Chip>
                ))}
              </div>
            </div>
            <Surface mode="subtle" className={styles.phoneMock}>
              <div className={styles.phoneHeader}>
                <Badge appearance="positive" attention="medium">
                  Active
                </Badge>
                <span>My services</span>
              </div>
              <div className={styles.serviceList}>
                <Surface mode="default" className={styles.serviceItem}>
                  <span>Mobile data</span>
                  <Badge appearance="positive" attention="low">
                    Unlimited
                  </Badge>
                </Surface>
                <Surface mode="default" className={styles.serviceItem}>
                  <span>Fiber</span>
                  <Badge appearance="informative" attention="low">
                    Online
                  </Badge>
                </Surface>
                <Surface mode="default" className={styles.serviceItem}>
                  <span>Entertainment</span>
                  <Badge appearance="sparkle" attention="low">
                    Included
                  </Badge>
                </Surface>
              </div>
            </Surface>
          </Surface>
        </Container>
      </section>

      <Surface mode="bold" as="section" id="support" className={styles.finalCta}>
        <Container variant="fixed" className={styles.finalCtaInner}>
          <div>
            <Badge appearance="sparkle" attention="medium">
              Template test
            </Badge>
            <h2>Ready to try the component system against another vertical?</h2>
            <p>
              This page is intentionally disposable and can become the first entry in a library of
              generated vertical templates.
            </p>
          </div>
          <div className={styles.finalActions}>
            <Button size={12} attention="high">
              Generate next vertical
            </Button>
            <Button size={12} attention="low" appearance="primary">
              Review components
            </Button>
          </div>
        </Container>
      </Surface>
    </main>
  );
}
