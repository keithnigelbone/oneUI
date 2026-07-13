import { useMemo, useState } from 'react'
import {
  Badge,
  Button,
  Chip,
  ChipGroup,
  Container,
  Divider,
  Icon,
  Modal,
  SelectableButton,
  Text,
} from '@/debug/oneui'
import { PLANS } from '@/sample-app/services/catalog'
import type { Plan, PlanCategory } from '@/sample-app/services/types'
import { PageHeading } from '@/sample-app/components/PageHeading'
import { RechargeModal } from '@/sample-app/features/recharge/RechargeModal'
import { useAppStore } from '@/sample-app/store/appStore'
import { useAnnouncer } from '@/sample-app/accessibility/announcer'
import { formatINR } from '@/sample-app/utils/format'
import { TESTIDS } from '@/sample-app/testids'
import cards from '@/sample-app/components/cards.module.css'
import styles from './PlansPage.module.css'

const FILTERS: { id: PlanCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'All plans' },
  { id: 'popular', label: 'Popular' },
  { id: 'data', label: 'Data' },
  { id: 'unlimited', label: 'Unlimited' },
  { id: 'value', label: 'Value' },
  { id: 'annual', label: 'Annual' },
]

export function PlansPage() {
  const [filter, setFilter] = useState<string[]>(['all'])
  const [sortByPrice, setSortByPrice] = useState(false)
  const [compareIds, setCompareIds] = useState<string[]>([])
  const [compareOpen, setCompareOpen] = useState(false)
  const [rechargePlan, setRechargePlan] = useState<Plan | null>(null)
  const savedPlans = useAppStore((s) => s.savedPlans)
  const toggleSavedPlan = useAppStore((s) => s.toggleSavedPlan)
  const announce = useAnnouncer((s) => s.announce)

  const active = filter[0] ?? 'all'

  const visiblePlans = useMemo(() => {
    const list = active === 'all' ? PLANS : PLANS.filter((p) => p.category === active)
    return sortByPrice ? [...list].sort((a, b) => a.price - b.price) : list
  }, [active, sortByPrice])

  const comparePlans = PLANS.filter((p) => compareIds.includes(p.id))

  const toggleCompare = (id: string) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((p) => p !== id)
      if (prev.length >= 3) {
        announce('You can compare up to 3 plans.')
        return prev
      }
      return [...prev, id]
    })
  }

  return (
    <Container surface="ghost" layout="flex" direction="column" gap="2" width="full" data-testid={TESTIDS.plans.page}>
      <PageHeading
        title="Mobile Plans"
        subtitle="Recharge with unlimited 5G plans and add-ons"
        actions={
          <Button
            appearance="primary"
            attention="medium"
            disabled={compareIds.length < 2}
            onPress={() => setCompareOpen(true)}
            data-testid={TESTIDS.plans.compareBtn}
          >
            Compare ({compareIds.length})
          </Button>
        }
      />

      <Container surface="ghost" layout="flex" direction="row" justify="space-between" align="center" wrap gap="3">
        <ChipGroup
          value={filter}
          onValueChange={(v) => setFilter(v.length ? [v[v.length - 1]] : ['all'])}
          aria-label="Filter plans by category"
          data-testid={TESTIDS.plans.filterChips}
        >
          {FILTERS.map((f) => (
            <Chip key={f.id} value={f.id} data-testid={TESTIDS.plans.filterChip(f.id)}>
              {f.label}
            </Chip>
          ))}
        </ChipGroup>

        <SelectableButton
          selected={sortByPrice}
          onSelectedChange={setSortByPrice}
          start={<Icon icon="sort" size="4" aria-hidden />}
          aria-label="Sort by price, low to high"
          data-testid={TESTIDS.plans.sortToggle}
        >
          Price: Low to High
        </SelectableButton>
      </Container>

      <div className={`${cards.grid3} ${styles.grid}`}>
        {visiblePlans.map((plan) => {
          const saved = savedPlans.includes(plan.id)
          const comparing = compareIds.includes(plan.id)
          return (
            <Container
              key={plan.id}
              surface="elevated"
              layout="flex"
              direction="column"
              gap="3"
              padding="4"
              width="full"
              className={cards.card}
              data-testid={TESTIDS.plans.card(plan.id)}
            >
              <Container surface="ghost" layout="flex" direction="row" justify="space-between" align="center">
                <Text variant="display" size="S" weight="high">{formatINR(plan.price)}</Text>
                {plan.tag && <Badge appearance="informative" size="s">{plan.tag}</Badge>}
              </Container>

              <Text variant="title" size="S" weight="high">{plan.name}</Text>

              <Container surface="ghost" layout="flex" direction="column" gap="1">
                <PlanRow label="Data" value={`${plan.dataPerDay} GB/day`} />
                <PlanRow label="Validity" value={`${plan.validityDays} days`} />
                <PlanRow label="Calls" value={plan.calls} />
                <PlanRow label="SMS" value={plan.sms} />
              </Container>

              <Container surface="ghost" layout="flex" direction="row" gap="1" wrap>
                {plan.benefits.map((b) => (
                  <Badge key={b} appearance="positive" size="s">{b}</Badge>
                ))}
              </Container>

              <Divider />

              <Container surface="ghost" layout="flex" direction="row" gap="2" align="center">
                <Button
                  appearance="primary"
                  attention="high"
                  fullWidth
                  onPress={() => setRechargePlan(plan)}
                  data-testid={TESTIDS.plans.rechargeBtn(plan.id)}
                >
                  Recharge
                </Button>
                <Button
                  appearance="primary"
                  attention="low"
                  onPress={() => {
                    toggleSavedPlan(plan.id)
                    announce(saved ? 'Removed from saved plans' : 'Saved plan')
                  }}
                  aria-pressed={saved}
                  aria-label={saved ? `Remove ${plan.name} from saved` : `Save ${plan.name}`}
                >
                  <Icon icon={saved ? 'bookmarkFilled' : 'bookmark'} size="4" aria-hidden />
                </Button>
              </Container>

              <SelectableButton
                selected={comparing}
                onSelectedChange={() => toggleCompare(plan.id)}
                fullWidth
                data-testid={TESTIDS.plans.compareToggle(plan.id)}
              >
                {comparing ? 'Added to compare' : 'Add to compare'}
              </SelectableButton>
            </Container>
          )
        })}
      </div>

      <Modal
        open={compareOpen}
        onOpenChange={setCompareOpen}
        title="Compare plans"
        description="Side-by-side view of your selected plans."
        size="L"
        dismissible
        data-testid={TESTIDS.plans.compareDialog}
      >
        <div className={styles.compareGrid} aria-label="Plan comparison">
          {comparePlans.map((plan) => (
            <Container
              key={plan.id}
              surface="subtle"
              layout="flex"
              direction="column"
              gap="2"
              padding="3"
              width="full"
            >
              <Text variant="title" size="S" weight="high">{plan.name}</Text>
              <Text variant="display" size="S" weight="high">{formatINR(plan.price)}</Text>
              <PlanRow label="Data" value={`${plan.dataPerDay} GB/day`} />
              <PlanRow label="Validity" value={`${plan.validityDays} days`} />
              <PlanRow label="Calls" value={plan.calls} />
              <PlanRow label="SMS" value={plan.sms} />
              <Button appearance="primary" attention="high" fullWidth onPress={() => { setCompareOpen(false); setRechargePlan(plan) }}>
                Recharge
              </Button>
            </Container>
          ))}
        </div>
      </Modal>

      <RechargeModal
        plan={rechargePlan}
        open={rechargePlan !== null}
        onOpenChange={(open) => { if (!open) setRechargePlan(null) }}
      />
    </Container>
  )
}

function PlanRow({ label, value }: { label: string; value: string }) {
  return (
    <Container surface="ghost" layout="flex" direction="row" justify="space-between" align="center">
      <Text variant="body" size="S" attention="medium">{label}</Text>
      <Text variant="label" size="S" weight="high">{value}</Text>
    </Container>
  )
}
