import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Badge,
  Container,
  Divider,
  InputField,
  TabGroup,
  TabItem,
  TabPanel,
  Text,
} from '@/debug/oneui'
import { PageHeading } from '@/sample-app/components/PageHeading'
import rawData from '@/sample-app/coverage/componentCoverageData.json'
import type { ComponentCoverageEntry, CoverageReport } from '@/sample-app/coverage/types'
import { TESTIDS } from '@/sample-app/testids'
import cards from '@/sample-app/components/cards.module.css'
import styles from './ComponentCoveragePage.module.css'

const data = rawData as CoverageReport

const PROP_LABELS: Record<string, string> = {
  size: 'Size',
  variant: 'Variant',
  appearance: 'Appearance',
  attention: 'Attention',
  disabled: 'Disabled',
  readOnly: 'ReadOnly',
  loading: 'Loading',
  selected: 'Selected',
  checked: 'Checked',
  required: 'Required',
  error: 'Error',
  mode: 'Mode',
  surface: 'Surface',
  shape: 'Shape',
  fullWidth: 'Full width',
  showSteps: 'Show steps',
  dismissible: 'Dismissible',
  icon: 'Icon',
  weight: 'Weight',
  label: 'Label',
  description: 'Description',
  feedback: 'Feedback',
}

function StatusBadge({ status }: { status: 'Covered' | 'Missing' }) {
  return (
    <Badge
      variant="subtle"
      size="s"
      appearance={status === 'Covered' ? 'positive' : 'negative'}
      attention="high"
    >
      {status}
    </Badge>
  )
}

function SummaryCards() {
  const { summary } = data
  const stats = [
    { label: 'Library components', value: summary.totalLibraryComponents },
    { label: 'Used in sample app', value: summary.totalUsed },
    { label: 'Coverage', value: `${summary.coveragePercent}%` },
    { label: 'Missing', value: summary.missingCount },
  ]

  return (
    <div className={cards.grid4}>
      {stats.map((s) => (
        <Container key={s.label} surface="elevated" padding="4" width="full" className={cards.card}>
          <Text variant="label" size="S" attention="medium">{s.label}</Text>
          <Text variant="display" size="S" weight="high">{s.value}</Text>
        </Container>
      ))}
    </div>
  )
}

function ComponentTable({ rows, filter }: { rows: ComponentCoverageEntry[]; filter: string }) {
  const q = filter.trim().toLowerCase()
  const filtered = useMemo(
    () => rows.filter((r) => !q || r.component.toLowerCase().includes(q) || r.pages.some((p) => p.name.toLowerCase().includes(q))),
    [rows, q],
  )

  return (
    <div className={styles.tableWrap}>
      <table className={styles.table} data-testid={TESTIDS.coverage.componentTable}>
        <thead>
          <tr>
            <th>Component</th>
            <th>Used</th>
            <th>Pages / Screens</th>
            <th>Count</th>
            <th>Status</th>
            <th>Link</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((row) => (
            <tr key={row.component} data-testid={TESTIDS.coverage.componentRow(row.component)}>
              <td><Text variant="body" size="S" weight="medium">{row.component}</Text></td>
              <td>{row.usedInApp ? 'Yes' : 'No'}</td>
              <td>
                {row.pages.length === 0 ? '—' : row.pages.map((p) => p.name).join(', ')}
              </td>
              <td>{row.usageCount}</td>
              <td><StatusBadge status={row.status} /></td>
              <td>
                {row.pages[0] ? (
                  <Link to={row.pages[0].route} className={styles.link}>
                    Open {row.pages[0].name}
                  </Link>
                ) : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function PageMappingTable() {
  const pages = Object.entries(data.pageMapping)
    .map(([name, entry]) => ({ name, route: entry.route, components: entry.components }))
    .sort((a, b) => b.components.length - a.components.length)

  return (
    <div className={styles.tableWrap}>
      <table className={styles.table} data-testid={TESTIDS.coverage.pageTable}>
        <thead>
          <tr>
            <th>Page</th>
            <th>Components used</th>
            <th>Count</th>
            <th>Link</th>
          </tr>
        </thead>
        <tbody>
          {pages.map((page) => (
            <tr key={page.name}>
              <td><Text variant="body" size="S" weight="medium">{page.name}</Text></td>
              <td>{page.components.map((c) => c.name).join(', ')}</td>
              <td>{page.components.length}</td>
              <td>
                <Link to={page.route} className={styles.link}>Open page</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function MissingList() {
  return (
    <Container surface="elevated" padding="5" width="full" className={cards.card}>
      <Text variant="title" size="S" weight="high">Missing component coverage ({data.missingComponents.length})</Text>
      <Text variant="body" size="S" attention="medium" className={styles.muted}>
        OneUI components available in @jds4/oneui-react but not used in this sample app.
      </Text>
      <div className={styles.chipGrid} data-testid={TESTIDS.coverage.missingList}>
        {data.missingComponents.map((name) => (
          <Badge key={name} variant="subtle" size="s" appearance="negative" attention="medium">
            {name}
          </Badge>
        ))}
      </div>
    </Container>
  )
}

function PropertyCoveragePanel() {
  const used = data.components.filter((c) => c.usedInApp && c.propertyCoverage)
  const [selected, setSelected] = useState(used[0]?.component ?? '')

  const entry = used.find((c) => c.component === selected)
  const pc = entry?.propertyCoverage

  return (
    <Container surface="elevated" padding="5" width="full" className={cards.card}>
      <Text variant="title" size="S" weight="high">Property coverage by component</Text>
      <Text variant="body" size="S" attention="medium" className={styles.muted}>
        Variants, sizes, states, appearances, and slots detected in JSX usage.
      </Text>

      <Container surface="ghost" layout="flex" direction="row" gap="2" wrap className={styles.propPicker}>
        {used.map((c) => (
          <button
            key={c.component}
            type="button"
            className={`${styles.propChip} ${selected === c.component ? styles.propChipActive : ''}`}
            onClick={() => setSelected(c.component)}
          >
            {c.component}
          </button>
        ))}
      </Container>

      {entry && pc ? (
        <div className={styles.propDetail} data-testid={TESTIDS.coverage.propertyPanel}>
          <Text variant="headline" size="S" weight="high">{entry.component}</Text>
          <ul className={styles.propList}>
            {Object.entries(pc.props)
              .filter(([, v]) => v.covered)
              .map(([key, v]) => (
                <li key={key}>
                  <span className={styles.propOk}>✓</span>
                  {PROP_LABELS[key] ?? key}: {v.values.join(', ') || 'used'}
                </li>
              ))}
            {Object.entries(pc.props)
              .filter(([, v]) => !v.covered)
              .slice(0, 12)
              .map(([key]) => (
                <li key={key} className={styles.propMissing}>
                  <span className={styles.propNo}>✗</span>
                  {PROP_LABELS[key] ?? key} not covered
                </li>
              ))}
          </ul>
          <Divider />
          <Text variant="label" size="S" weight="high">Slots</Text>
          <ul className={styles.propList}>
            {Object.entries(pc.slots).map(([slot, covered]) => (
              <li key={slot} className={covered ? undefined : styles.propMissing}>
                <span className={covered ? styles.propOk : styles.propNo}>{covered ? '✓' : '✗'}</span>
                {slot}{covered ? '' : ' not covered'}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </Container>
  )
}

export function ComponentCoveragePage() {
  const [filter, setFilter] = useState('')
  const [tab, setTab] = useState('overview')

  return (
    <Container surface="ghost" layout="flex" direction="column" gap="6" width="full" data-testid={TESTIDS.coverage.page}>
      <PageHeading
        title="Component Coverage Dashboard"
        subtitle={`OneUI / JDS component usage across the sample app · Generated ${new Date(data.generatedAt).toLocaleString()}`}
      />

      <TabGroup value={tab} onValueChange={(v) => v && setTab(String(v))} aria-label="Coverage report sections">
        <TabItem value="overview">Overview</TabItem>
        <TabItem value="components">All components</TabItem>
        <TabItem value="pages">Page mapping</TabItem>
        <TabItem value="missing">Missing</TabItem>
        <TabItem value="properties">Property coverage</TabItem>

        <TabPanel value="overview">
          <Container surface="ghost" layout="flex" direction="column" gap="5" width="full">
            <SummaryCards />
            <Container surface="elevated" padding="5" width="full" className={cards.card}>
              <Text variant="title" size="S" weight="high">Executive summary</Text>
              <Text variant="body" size="M">
                {data.summary.totalUsed} of {data.summary.totalLibraryComponents} OneUI components are represented
                in the sample app ({data.summary.coveragePercent}% coverage).
                {' '}{data.summary.missingCount} components need dedicated test screens.
              </Text>
              <Divider />
              <Text variant="label" size="S" weight="high">Pages with highest coverage</Text>
              <ul className={styles.summaryList}>
                {data.summary.topPagesByCoverage.map((p) => (
                  <li key={p.name}>
                    <Link to={p.route} className={styles.link}>{p.name}</Link>
                    {' — '}{p.componentCount} components ({p.components.slice(0, 6).join(', ')}
                    {p.components.length > 6 ? '…' : ''})
                  </li>
                ))}
              </ul>
              <Divider />
              <Text variant="label" size="S" weight="high">Components needing test screens (priority)</Text>
              <Text variant="body" size="S" attention="medium">
                {data.summary.componentsNeedingScreens.slice(0, 15).join(', ')}
                {data.summary.missingCount > 15 ? '…' : ''}
              </Text>
            </Container>
          </Container>
        </TabPanel>

        <TabPanel value="components">
          <Container surface="ghost" layout="flex" direction="column" gap="4" width="full">
            <InputField
              label="Filter components or pages"
              value={filter}
              onChange={setFilter}
              placeholder="Button, Account, InputField…"
              fullWidth
              data-testid={TESTIDS.coverage.filterInput}
            />
            <ComponentTable rows={data.components} filter={filter} />
          </Container>
        </TabPanel>

        <TabPanel value="pages">
          <PageMappingTable />
        </TabPanel>

        <TabPanel value="missing">
          <MissingList />
        </TabPanel>

        <TabPanel value="properties">
          <PropertyCoveragePanel />
        </TabPanel>
      </TabGroup>
    </Container>
  )
}
