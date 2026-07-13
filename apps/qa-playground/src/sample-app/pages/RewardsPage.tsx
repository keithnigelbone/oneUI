import { useState } from 'react'
import {
  Badge,
  Button,
  CircularProgressIndicator,
  Container,
  Divider,
  Icon,
  IconContained,
  Slider,
  Text,
} from '@/debug/oneui'
import { COUPONS, REWARDS } from '@/sample-app/services/catalog'
import { PageHeading } from '@/sample-app/components/PageHeading'
import { useAppStore } from '@/sample-app/store/appStore'
import { useAnnouncer } from '@/sample-app/accessibility/announcer'
import { TESTIDS } from '@/sample-app/testids'
import type { SemanticIconName } from '@/sample-app/types/oneui'
import cards from '@/sample-app/components/cards.module.css'
import styles from './RewardsPage.module.css'

const NEXT_TIER = 2000

const BENEFITS: { id: string; title: string; desc: string; icon: SemanticIconName }[] = [
  { id: 'priority', title: 'Priority support', desc: 'Skip the queue when you call', icon: 'phone' },
  { id: 'data', title: 'Bonus data', desc: '5 GB extra every month', icon: 'smartphone' },
  { id: 'ott', title: 'OTT bundle', desc: 'JioCinema Premium included', icon: 'tv' },
]

export function RewardsPage() {
  const points = useAppStore((s) => s.rewardPoints)
  const redeemReward = useAppStore((s) => s.redeemReward)
  const announce = useAnnouncer((s) => s.announce)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const copyCode = async (id: string, code: string) => {
    try {
      await navigator.clipboard.writeText(code)
    } catch {
      // Clipboard may be unavailable in some test environments; still reflect UI state.
    }
    setCopiedId(id)
    announce(`Coupon code ${code} copied to clipboard`)
    setTimeout(() => setCopiedId((cur) => (cur === id ? null : cur)), 2500)
  }

  const redeem = (cost: number, title: string) => {
    const ok = redeemReward(cost)
    announce(ok ? `Redeemed ${title} for ${cost} points` : `Not enough points to redeem ${title}`)
  }

  const progress = Math.min(100, Math.round((points / NEXT_TIER) * 100))

  return (
    <Container surface="ghost" layout="flex" direction="column" gap="2" width="full" data-testid={TESTIDS.rewards.page}>
      <PageHeading title="Offers & Rewards" subtitle="Coupons, rewards and member benefits" />

      <Container surface="elevated" layout="flex" direction="row" align="center" gap="5" padding="5" width="full" wrap className={cards.card}>
        <div data-testid={TESTIDS.rewards.pointsMeter}>
          <CircularProgressIndicator
            variant="determinate"
            value={progress}
            size="3XL"
            appearance="sparkle"
            content="text"
            aria-label={`${points} reward points, ${progress}% to next tier`}
          />
        </div>
        <Container surface="ghost" layout="flex" direction="column" gap="2" className={styles.pointsInfo}>
          <Text variant="display" size="S" weight="high">{points.toLocaleString('en-IN')} points</Text>
          <Text variant="body" size="M" attention="medium">
            {Math.max(0, NEXT_TIER - points).toLocaleString('en-IN')} points to Platinum tier
          </Text>
          <Slider
            value={points}
            min={0}
            max={NEXT_TIER}
            readOnly
            aria-label="Progress to Platinum tier"
          />
        </Container>
      </Container>

      <section className={cards.section} aria-label="Coupons">
        <Text variant="headline" size="S" weight="high" as="h2">Your coupons</Text>
        <div className={`${cards.grid3} ${styles.spaced}`}>
          {COUPONS.map((coupon) => {
            const copied = copiedId === coupon.id
            return (
              <Container
                key={coupon.id}
                surface="elevated"
                layout="flex"
                direction="column"
                gap="2"
                padding="4"
                width="full"
                className={cards.card}
                data-testid={TESTIDS.rewards.couponCard(coupon.id)}
              >
                <Container surface="ghost" layout="flex" direction="row" justify="space-between" align="center">
                  <Text variant="title" size="S" weight="high">{coupon.title}</Text>
                  <Badge appearance="informative" size="s">{coupon.category}</Badge>
                </Container>
                <Text variant="body" size="S" attention="medium">{coupon.description}</Text>
                <div className={styles.codeRow}>
                  <code className={styles.code}>{coupon.code}</code>
                  <Button
                    appearance="primary"
                    attention={copied ? 'low' : 'high'}
                    onPress={() => copyCode(coupon.id, coupon.code)}
                    start={<Icon icon={copied ? 'check' : 'copy'} size="4" aria-hidden />}
                    aria-label={`Copy coupon code ${coupon.code}`}
                    data-testid={TESTIDS.rewards.copyBtn(coupon.id)}
                  >
                    {copied ? 'Copied' : 'Copy'}
                  </Button>
                </div>
                <Text variant="label" size="XS" attention="low">Valid till {coupon.expiry}</Text>
              </Container>
            )
          })}
        </div>
      </section>

      <section className={cards.section} aria-label="Redeem rewards">
        <Text variant="headline" size="S" weight="high" as="h2">Redeem points</Text>
        <div className={`${cards.grid4} ${styles.spaced}`}>
          {REWARDS.map((reward) => {
            const affordable = points >= reward.points
            return (
              <Container
                key={reward.id}
                surface="elevated"
                layout="flex"
                direction="column"
                gap="2"
                padding="4"
                width="full"
                className={cards.card}
                data-testid={TESTIDS.rewards.rewardCard(reward.id)}
              >
                <IconContained icon={reward.icon} appearance="sparkle" attention="medium" size="m" aria-hidden />
                <Text variant="title" size="S" weight="high">{reward.title}</Text>
                <Text variant="body" size="S" attention="medium">{reward.description}</Text>
                <Button
                  appearance="primary"
                  attention="high"
                  fullWidth
                  disabled={!affordable}
                  onPress={() => redeem(reward.points, reward.title)}
                  data-testid={TESTIDS.rewards.redeemBtn(reward.id)}
                >
                  {affordable ? `Redeem · ${reward.points} pts` : `Need ${reward.points} pts`}
                </Button>
              </Container>
            )
          })}
        </div>
      </section>

      <Divider />

      <section aria-label="Member benefits" className={styles.spaced}>
        <Text variant="headline" size="S" weight="high" as="h2">Prime member benefits</Text>
        <div className={`${cards.grid3} ${styles.spaced}`}>
          {BENEFITS.map((b) => (
            <Container key={b.id} surface="moderate" appearance="primary" layout="flex" direction="row" align="center" gap="3" padding="4" width="full" className={cards.card}>
              <IconContained icon={b.icon} appearance="primary" attention="high" size="m" aria-hidden />
              <Container surface="ghost" layout="flex" direction="column" gap="0">
                <Text variant="title" size="S" weight="high">{b.title}</Text>
                <Text variant="body" size="S" attention="medium">{b.desc}</Text>
              </Container>
            </Container>
          ))}
        </div>
      </section>
    </Container>
  )
}
