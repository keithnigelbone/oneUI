import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Button,
  Chip,
  Container,
  Icon,
  IconContained,
  InputField,
  Surface,
  Text,
} from '@/debug/oneui'
import { HOME_OFFERS, PLANS } from '@/sample-app/services/catalog'
import { useAppStore } from '@/sample-app/store/appStore'
import { ROUTES } from '@/sample-app/routes/paths'
import { formatINR } from '@/sample-app/utils/format'
import { ThemeSettings } from '@/sample-app/components/ThemeSettings'
import { TESTIDS } from '@/sample-app/testids'
import type { SemanticIconName } from '@/sample-app/types/oneui'
import styles from './HomePage.module.css'

const QUICK_ACTIONS: { id: string; label: string; icon: SemanticIconName; to: string }[] = [
  { id: 'recharge', label: 'Recharge', icon: 'smartphone', to: ROUTES.plans },
  { id: 'devices', label: 'Buy a device', icon: 'tv', to: ROUTES.devices },
  { id: 'rewards', label: 'Rewards', icon: 'star', to: ROUTES.rewards },
  { id: 'support', label: 'Get help', icon: 'help', to: ROUTES.support },
]

const SERVICES: { id: string; title: string; description: string; icon: SemanticIconName }[] = [
  { id: 'mobile', title: 'Jio Mobile', description: 'Unlimited 5G plans from ₹179', icon: 'smartphone' },
  { id: 'fiber', title: 'JioFiber', description: 'Broadband up to 1 Gbps', icon: 'globe' },
  { id: 'fa', title: 'Jio TV+', description: '500+ channels and OTT in one app', icon: 'tv' },
  { id: 'cloud', title: 'JioCloud', description: 'Back up photos, contacts and files', icon: 'folder' },
]

export function HomePage() {
  const navigate = useNavigate()
  const [serviceQuery, setServiceQuery] = useState('')
  const setGlobalSearch = useAppStore((s) => s.setGlobalSearch)
  const popularPlans = PLANS.filter((p) => p.category === 'popular').slice(0, 2)

  const runSearch = () => {
    setGlobalSearch(serviceQuery)
    navigate(ROUTES.devices)
  }

  return (
    <Container surface="ghost" layout="flex" direction="column" gap="8" width="full" data-testid={TESTIDS.home.page}>
      <Surface mode="bold" appearance='primary' className={styles.hero} data-testid={TESTIDS.home.hero} aria-labelledby="hero-title">
        <Container surface="ghost" layout="flex" direction="column" gap="4" width="full">
          <Text variant="label" size="S" weight="medium" attention="tintedA11y">
            Jio digital life
          </Text>
          <div id="hero-title">
            <Text variant="display" size="M" weight="high" as="h1">
              Everything Jio, in one place
            </Text>
          </div>
          <Text variant="body" size="L" attention="medium">
            Recharge in seconds, shop the latest devices, and unlock rewards — all built with OneUI.
          </Text>

          <Container surface="ghost" layout="flex" direction="row" gap="3" wrap>
            <Button attention="high" size="l" onPress={() => navigate(ROUTES.plans)} data-testid={TESTIDS.home.heroCta}>
              Explore plans
            </Button>
            <Button attention="low"  size="l" onPress={() => navigate(ROUTES.devices)}>
              Shop devices
            </Button>
          </Container>

          <form
            role="search"
            onSubmit={(e: FormEvent) => {
              e.preventDefault()
              runSearch()
            }}
          >
            <Container surface="ghost" layout="flex" width="full">
              <InputField
                label="Search Jio services"
                value={serviceQuery}
                onChange={setServiceQuery}
                placeholder="Search plans, devices, offers…"
                shape="pill"
                attention="medium"
                appearance="neutral"
                start={<Icon icon="search" size="4" aria-hidden />}
                fullWidth
                data-testid={TESTIDS.home.serviceSearch}
              />
            </Container>
          </form>
        </Container>
      </Surface>

      <Container surface="ghost" layout="grid" columns={4} gap="5" width="full" aria-label="Quick actions">
        {QUICK_ACTIONS.map((action) => (
          <Surface
            key={action.id}
            mode="elevated"
            as="button"
            className={styles.quickAction}
            onClick={() => navigate(action.to)}
            data-testid={TESTIDS.home.quickAction(action.id)}
          >
            <IconContained icon={action.icon} appearance="primary" attention="high" size="m" aria-hidden />
            <Text variant="title" size="S" weight="high">{action.label}</Text>
          </Surface>
        ))}
      </Container>

      <Surface mode="elevated" className={styles.themeCard} data-testid={TESTIDS.home.themeSettings}>
        <Container surface="ghost" layout="flex" direction="column" gap="3" width="full">
          <Container surface="ghost" layout="flex" direction="column" gap="1">
            <Text variant="label" size="S" weight="medium" attention="tintedA11y">Sample app</Text>
            <Text variant="headline" size="S" weight="high" as="h2">Appearance</Text>
          </Container>
          <Text variant="body" size="S" attention="medium">
            Switch between light and dark OneUI brand modes. Changes apply across the entire app and are saved for your next visit.
          </Text>
          <ThemeSettings showAuto testIdPrefix="home-theme" />
        </Container>
      </Surface>

      <Container surface="ghost" layout="flex" direction="column" gap="5" width="full" aria-label="Our services">
        <Container surface="ghost" layout="flex" direction="column" gap="1">
          <Text variant="label" size="S" weight="medium" attention="tintedA11y">Explore</Text>
          <Text variant="headline" size="S" weight="high" as="h2">Our services</Text>
        </Container>

        <Container surface="ghost" layout="grid" columns={4} gap="5" width="full">
          {SERVICES.map((service) => (
            <Surface
              key={service.id}
              mode="elevated"
              className={styles.card}
              data-testid={TESTIDS.home.serviceCard(service.id)}
            >
              <IconContained icon={service.icon} appearance="informative" attention="medium" size="m" aria-hidden />
              <Text variant="title" size="S" weight="high">{service.title}</Text>
              <Text variant="body" size="S" attention="medium">{service.description}</Text>
            </Surface>
          ))}
        </Container>
      </Container>

      <Container surface="ghost" layout="flex" direction="column" gap="5" width="full" aria-label="Offers for you">
        <Container surface="ghost" layout="flex" direction="row" justify="space-between" align="center" wrap gap="2" width="full">
          <Container surface="ghost" layout="flex" direction="column" gap="1">
            <Text variant="label" size="S" weight="medium" attention="tintedA11y">For you</Text>
            <Text variant="headline" size="S" weight="high" as="h2">Offers for you</Text>
          </Container>
          <Button attention="low" appearance="neutral" size="s" onPress={() => navigate(ROUTES.rewards)}>
            View all
          </Button>
        </Container>

        <Container surface="ghost" layout="grid" columns={3} gap="5" width="full">
          {HOME_OFFERS.map((offer) => (
            <Surface
              key={offer.id}
              mode="moderate"
              appearance={offer.appearance}
              className={styles.card}
              data-testid={TESTIDS.home.offerCard(offer.id)}
            >
              <Chip appearance="secondary" attention="medium" size="s">
                {offer.tag}
              </Chip>
              <Text variant="title" size="S" weight="high">{offer.title}</Text>
            </Surface>
          ))}
        </Container>
      </Container>

      <Container surface="ghost" layout="flex" direction="column" gap="5" width="full" aria-label="Popular plans">
        <Container surface="ghost" layout="flex" direction="row" justify="space-between" align="center" wrap gap="2" width="full">
          <Container surface="ghost" layout="flex" direction="column" gap="1">
            <Text variant="label" size="S" weight="medium" attention="tintedA11y">Top picks</Text>
            <Text variant="headline" size="S" weight="high" as="h2">Popular plans</Text>
          </Container>
          <Button attention="low" appearance="neutral" size="s" onPress={() => navigate(ROUTES.plans)}>
            View all plans
          </Button>
        </Container>

        <Container surface="ghost" layout="grid" columns={2} gap="5" width="full">
          {popularPlans.map((plan) => (
            <Container
              key={plan.id}
              surface="elevated"
              layout="flex"
              direction="row"
              justify="space-between"
              align="center"
              gap="3"
              padding="4"
              width="full"
            >
              <Container surface="ghost" layout="flex" direction="column" gap="1">
                <Text variant="title" size="M" weight="high">{formatINR(plan.price)}</Text>
                <Text variant="body" size="S" attention="medium">
                  {plan.name} · {plan.dataPerDay} GB/day · {plan.validityDays} days
                </Text>
              </Container>
              <Button attention="high" onPress={() => navigate(ROUTES.plans)}>
                Recharge
              </Button>
            </Container>
          ))}
        </Container>
      </Container>
    </Container>
  )
}
