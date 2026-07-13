# Tabs — React Native

A set of tabbed content sections. Mirrors the web `Tabs` from `@oneui/ui`.
`Tabs` is the convenience all-in-one; `TabGroup` / `TabList` / `TabItem` /
`TabPanel` give finer control.

## Props (`Tabs`)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | — | Tab list + panels. |
| `value` | `string \| number \| null` | — | Controlled active tab. |
| `defaultValue` | `string \| number \| null` | — | Initial active tab (uncontrolled). |
| `onValueChange` | `(value) => void` | — | Fires when the active tab changes. |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | Layout orientation. |
| `size` | `'s' \| 'm' \| 'l'` | `'m'` | Size preset. |
| `appearance` | `ComponentAppearance` | `'auto'` | Multi-accent role for the active indicator. |
| `aria-label` | `string` | — | Accessible name for the tab list. |
| `testID` | `string` | — | React Native test identifier. |

### `TabItem` (key props)

| Prop | Type | Description |
|------|------|-------------|
| `value` | `string \| number` | Identifies the tab (required). |
| `children` | `ReactNode` | Label content. |
| `icon` / `start` / `end` | `ReactNode` | Optional slots. |
| `badge` | `ReactNode` | Optional badge. |
| `disabled` | `boolean` | Disable this tab. |

`TabPanel` takes `value` + `children`; it renders when its `value` matches.

## Code examples

### Simple (uncontrolled)

```tsx
import { Tabs, TabList, TabItem, TabPanel } from '@oneui/ui-native';

<Tabs defaultValue="overview" aria-label="Account sections">
  <TabList>
    <TabItem value="overview">Overview</TabItem>
    <TabItem value="activity">Activity</TabItem>
  </TabList>
  <TabPanel value="overview"><OverviewScreen /></TabPanel>
  <TabPanel value="activity"><ActivityScreen /></TabPanel>
</Tabs>
```

### Controlled

```tsx
const [tab, setTab] = useState('overview');

<Tabs value={tab} onValueChange={setTab} aria-label="Account sections">
  {/* …TabList + TabPanels… */}
</Tabs>
```

### With icons + appearance

```tsx
<Tabs defaultValue="home" appearance="primary" size="l">
  <TabList>
    <TabItem value="home" icon={<Icon icon={IcHome} />}>Home</TabItem>
    <TabItem value="alerts" badge={<CounterBadge count={3} />}>Alerts</TabItem>
  </TabList>
  {/* …panels… */}
</Tabs>
```

## Accessibility

The tab list is `role="tablist"`, tabs are `role="tab"` with selected state, and
panels are `role="tabpanel"`. Provide `aria-label` on `Tabs`/`TabList`. Keyboard
focus management (arrow keys, optional `loopFocus`/`activateOnFocus`) is handled
by `TabList`/`TabGroup`.
