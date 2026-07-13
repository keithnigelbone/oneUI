import { useEffect, useMemo, useState } from 'react'
import {
  Badge,
  Button,
  Chip,
  ChipGroup,
  Container,
  Divider,
  Icon,
  IconButton,
  Image,
  InputField,
  Modal,
  Pagination,
  Stepper,
  Text,
  Tooltip,
} from '@/debug/oneui'
import { DEVICES } from '@/sample-app/services/catalog'
import type { Device, DeviceCategory } from '@/sample-app/services/types'
import { PageHeading } from '@/sample-app/components/PageHeading'
import { useAppStore } from '@/sample-app/store/appStore'
import { useAnnouncer } from '@/sample-app/accessibility/announcer'
import { formatINR } from '@/sample-app/utils/format'
import { TESTIDS } from '@/sample-app/testids'
import cards from '@/sample-app/components/cards.module.css'
import styles from './DevicesPage.module.css'

const CATEGORIES: { id: DeviceCategory; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'smartphone', label: 'Smartphones' },
  { id: 'tablet', label: 'Tablets' },
  { id: 'router', label: 'Routers' },
  { id: 'tv', label: 'TV & STB' },
]

const PAGE_SIZE = 4

export function DevicesPage() {
  const globalSearch = useAppStore((s) => s.globalSearch)
  const wishlist = useAppStore((s) => s.wishlist)
  const toggleWishlist = useAppStore((s) => s.toggleWishlist)
  const addToCart = useAppStore((s) => s.addToCart)
  const announce = useAnnouncer((s) => s.announce)

  const [search, setSearch] = useState(globalSearch)
  const [category, setCategory] = useState<string[]>(['all'])
  const [page, setPage] = useState(1)
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [detailsDevice, setDetailsDevice] = useState<Device | null>(null)

  useEffect(() => {
    if (globalSearch) setSearch(globalSearch)
  }, [globalSearch])

  const activeCategory = (category[0] ?? 'all') as DeviceCategory

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return DEVICES.filter((d) => {
      const matchesCategory = activeCategory === 'all' || d.category === activeCategory
      const matchesQuery = !q || `${d.name} ${d.brand}`.toLowerCase().includes(q)
      return matchesCategory && matchesQuery
    })
  }, [search, activeCategory])

  useEffect(() => {
    setPage(1)
  }, [search, activeCategory])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const getQty = (id: string) => quantities[id] ?? 1

  return (
    <Container surface="ghost" layout="flex" direction="column" gap="2" width="full" data-testid={TESTIDS.devices.page}>
      <PageHeading title="Devices Store" subtitle="Smartphones, tablets, routers and TV" />

      <form
        role="search"
        onSubmit={(e) => e.preventDefault()}
        className={styles.searchRow}
      >
        <InputField
          label="Search devices"
          value={search}
          onChange={setSearch}
          placeholder="Search by name or brand…"
          shape="pill"
          start={<Icon icon="search" size="4" aria-hidden />}
          fullWidth
          data-testid={TESTIDS.devices.search}
        />
      </form>

      <ChipGroup
        value={category}
        onValueChange={(v) => setCategory(v.length ? [v[v.length - 1]] : ['all'])}
        aria-label="Filter devices by category"
        data-testid={TESTIDS.devices.categoryChips}
      >
        {CATEGORIES.map((c) => (
          <Chip key={c.id} value={c.id} data-testid={TESTIDS.devices.categoryChip(c.id)}>
            {c.label}
          </Chip>
        ))}
      </ChipGroup>

      {paged.length === 0 ? (
        <Container surface="subtle" padding="6" width="full" data-testid={TESTIDS.devices.empty}>
          <Text variant="body" size="M" attention="medium">No devices match your search.</Text>
        </Container>
      ) : (
        <div className={`${cards.grid4} ${styles.grid}`}>
          {paged.map((device) => {
            const saved = wishlist.includes(device.id)
            return (
              <Container
                key={device.id}
                surface="elevated"
                layout="flex"
                direction="column"
                gap="2"
                padding="3"
                width="full"
                className={cards.card}
                data-testid={TESTIDS.devices.card(device.id)}
              >
                <div className={styles.imageWrap}>
                  <Image src={device.image} alt={device.name} aspectRatio="1:1" width="full" />
                  <span className={styles.wishlistAnchor}>
                    <Tooltip content={saved ? 'Remove from wishlist' : 'Add to wishlist'} side="left">
                      <IconButton
                        icon={saved ? 'bookmarkFilled' : 'bookmark'}
                        appearance={saved ? 'primary' : 'neutral'}
                        attention="low"
                        aria-label={saved ? `Remove ${device.name} from wishlist` : `Add ${device.name} to wishlist`}
                        aria-pressed={saved}
                        onClick={() => {
                          toggleWishlist(device.id)
                          announce(saved ? 'Removed from wishlist' : 'Added to wishlist')
                        }}
                        data-testid={TESTIDS.devices.wishlistBtn(device.id)}
                      />
                    </Tooltip>
                  </span>
                </div>

                <Text variant="label" size="XS" attention="medium">{device.brand}</Text>
                <Text variant="title" size="S" weight="high">{device.name}</Text>

                <Container surface="ghost" layout="flex" direction="row" align="center" gap="2">
                  <Text variant="title" size="S" weight="high">{formatINR(device.price)}</Text>
                  {device.mrp > device.price && (
                    <Text variant="body" size="XS" attention="low" strikethrough>{formatINR(device.mrp)}</Text>
                  )}
                </Container>

                <Container surface="ghost" layout="flex" direction="row" align="center" gap="1">
                  <Icon icon="star" size="3" appearance="warning" aria-hidden />
                  <Text variant="label" size="XS">{device.rating}</Text>
                  <Text variant="body" size="XS" attention="low">({device.ratingCount})</Text>
                  {!device.inStock && <Badge appearance="negative" size="s">Out of stock</Badge>}
                </Container>

                <Container surface="ghost" layout="flex" direction="row" align="center" justify="space-between" gap="2">
                  <Stepper
                    value={getQty(device.id)}
                    min={1}
                    max={5}
                    onChange={(_e, v) => v != null && setQuantities((q) => ({ ...q, [device.id]: v }))}
                    aria-label={`Quantity for ${device.name}`}
                    data-testid={TESTIDS.devices.stepper(device.id)}
                  />
                </Container>

                <Divider />

                <Container surface="ghost" layout="flex" direction="column" gap="2" width="full">
                  <Button
                    appearance="primary"
                    attention="high"
                    fullWidth
                    disabled={!device.inStock}
                    onPress={() => {
                      addToCart(getQty(device.id))
                      announce(`${getQty(device.id)} × ${device.name} added to cart`)
                    }}
                    data-testid={TESTIDS.devices.addBtn(device.id)}
                  >
                    Add to cart
                  </Button>
                  <Button
                    appearance="primary"
                    attention="low"
                    fullWidth
                    onPress={() => setDetailsDevice(device)}
                    aria-label={`View details for ${device.name}`}
                    data-testid={TESTIDS.devices.detailsBtn(device.id)}
                  >
                    View details
                  </Button>
                </Container>
              </Container>
            )
          })}
        </div>
      )}

      {totalPages > 1 && (
        <Container surface="ghost" layout="flex" direction="row" justify="center" width="full" className={styles.pagination}>
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            showPrevNext
            aria-label="Devices pagination"
            data-testid={TESTIDS.devices.pagination}
          />
        </Container>
      )}

      <Modal
        open={detailsDevice !== null}
        onOpenChange={(open) => { if (!open) setDetailsDevice(null) }}
        title={detailsDevice?.name ?? 'Device details'}
        description={detailsDevice ? `${detailsDevice.brand} · ${formatINR(detailsDevice.price)}` : undefined}
        size="M"
        dismissible
        data-testid={TESTIDS.devices.detailsModal}
      >
        {detailsDevice && (
          <Container surface="ghost" layout="flex" direction="column" gap="3">
            <Image src={detailsDevice.image} alt={detailsDevice.name} aspectRatio="16:9" width="full" />
            <Text variant="title" size="S" weight="high">Highlights</Text>
            <Container surface="ghost" layout="flex" direction="column" gap="1">
              {detailsDevice.highlights.map((h) => (
                <Container key={h} surface="ghost" layout="flex" direction="row" align="center" gap="2">
                  <Icon icon="checkCircle" size="4" appearance="positive" aria-hidden />
                  <Text variant="body" size="S">{h}</Text>
                </Container>
              ))}
            </Container>
          </Container>
        )}
      </Modal>
    </Container>
  )
}
