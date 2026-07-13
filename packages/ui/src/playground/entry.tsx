/**
 * playground/entry.tsx
 *
 * Curated public surface for the AI-driven playground. This is the ONLY
 * import path Claude is allowed to reference (`@oneui/playground`); the
 * file lists exactly which components, hooks, and utilities the model
 * can compose with. Locking this surface down is what replaces the
 * 41-name icon whitelist + AST schema constraints — the bundler enforces
 * it for us.
 *
 * Keep additions deliberate: every export here adds bundle weight to the
 * Sandpack iframe. Aim for primitives and high-level composition pieces;
 * skip metadata exports (token manifests, recipe definitions, etc.) —
 * those are author-time only.
 */

// Token CSS, in canonical cascade order. layers.css MUST come first so
// the @layer declaration takes effect before any tokens are assigned to
// layers. The brand layer is intentionally absent — it's injected at
// runtime via the brand CSS bridge (parent → Sandpack `/foundation.css`).
import '@oneui/tokens/css/layers';
import '@oneui/tokens/css';
import '@oneui/tokens/css/semantic';
import '@oneui/tokens/css/materials';
import '@oneui/tokens/css/dimensions/scale';
import '@oneui/tokens/css/dimensions/grid';
import '@oneui/tokens/css/typography';
import '@oneui/tokens/css/light';
import '@oneui/tokens/css/dark';
import '@oneui/tokens/css/dim';
import '@oneui/tokens/css/density';
import '@oneui/tokens/css/density/compact';
import '@oneui/tokens/css/density/open';
import { Image as OneUIImage } from '../components/Image';
import type { ImageProps } from '../components/Image';
import type { Ref } from 'react';

// Layout & surfaces
export { Surface, type SurfaceMode } from '../components/Surface';
export { Container } from '../components/Container';
export { Grid } from '../components/Grid';
export { ScrollArea } from '../components/ScrollArea';
export { Separator } from '../components/Separator';
export { Divider } from '../components/Divider';

// Actions
export { Button, type ButtonAppearance, type ButtonVariant, type ButtonSize } from '../components/Button';
export { IconButton } from '../components/IconButton';
export { FAB } from '../components/FAB';
export { Link } from '../components/Link';
export { Toggle } from '../components/Toggle';
export { ToggleGroup } from '../components/ToggleGroup';
export { SegmentedControl } from '../components/SegmentedControl';

// Inputs
export { Input, InputField, InputFeedback, InputDynamicText } from '../components/Input';
export { Checkbox } from '../components/Checkbox';
export { CheckboxGroup } from '../components/CheckboxGroup';
export { Radio } from '../components/Radio';
export { Switch } from '../components/Switch';
export { Select } from '../components/Select';
export { Slider } from '../components/Slider';
export { NumberField } from '../components/NumberField';
export { Stepper } from '../components/Stepper';
export { Fieldset } from '../components/Fieldset';

// Display
export { Avatar } from '../components/Avatar';
export { Badge } from '../components/Badge';
export { Chip } from '../components/Chip';
export { ChipGroup } from '../components/ChipGroup';
export { CounterBadge } from '../components/CounterBadge';
export { IndicatorBadge } from '../components/IndicatorBadge';
export { IconContained } from '../components/IconContained';
export function Image(props: ImageProps & { ref?: Ref<HTMLElement> }) {
  return <OneUIImage {...props} src={resolvePlaygroundImageSrc(props.src)} />;
}
// Logo intentionally NOT exposed — the platform's <Logo> reads brand
// metadata (logo URLs, alignment, theme variants) from a context that
// doesn't exist inside the iframe. AI-generated <Logo> references
// always render empty. The system prompt directs Claude to
// `<Avatar fallback="J">` for brand marks instead.
export { Spinner } from '../components/Spinner';
export { CircularProgressIndicator } from '../components/CircularProgressIndicator';
export { Progress } from '../components/Progress';
export { Meter } from '../components/Meter';
export { PaginationDots } from '../components/PaginationDots';

// Lists & cards
export { ListItem } from '../components/ListItem';
export { ListItemGroup } from '../components/ListItemGroup';
export { PreviewCard } from '../components/PreviewCard';

// Navigation — flat compound API: subcomponents export from the same
// barrel as the parent. Claude generates them as standalone JSX tags
// (`<TabItem>`, `<BottomNavItem>` etc.), so they must all live in the
// allowlist for the validator + bundle to recognise them.
export { Tabs, TabGroup, TabItem, TabPanel } from '../components/Tabs';
export { BottomNavigation, BottomNavItem } from '../components/BottomNavigation';
export {
  WebHeader,
  PrimaryNav,
  SecondaryNav,
  HeaderItem,
  MobileDrawer,
  SearchInput,
} from '../components/WebHeader';
export { NavigationMenu } from '../components/NavigationMenu';
export { Toolbar } from '../components/Toolbar';

// Overlays
export {
  Dialog,
  DialogTrigger,
  DialogPortal,
  DialogClose,
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogPortal,
  AlertDialogClose,
} from '../components/Dialog';
export { Popover, PopoverTrigger, PopoverPortal, PopoverClose } from '../components/Popover';
export { Menu } from '../components/Menu';
export { Tooltip } from '../components/Tooltip';
export { Toast } from '../components/Toast';

// Disclosure
export { Accordion } from '../components/Accordion';
export { Collapsible } from '../components/Collapsible';

// Media
export { Carousel } from '../components/Carousel';

// Icons — the platform-side OneUI Icon system uses *async* lazy-loading
// (IconProvider → dynamic import per icon set). That doesn't survive the
// trip into a Sandpack iframe: the dynamic-import paths get rewritten by
// the bundler in ways the iframe's runtime can't resolve, and the cache
// that backs sync rendering ends up empty.
//
// Below: a synchronous Icon + IconProvider that pre-imports the Lucide
// module eagerly (single named-namespace import) and resolves semantic
// names via the existing `SemanticMappings/lucide.ts` table. Same public
// API as OneUI's <Icon name="..." size="md" />, just with the async
// machinery stripped out so it works inside the iframe.
export { Icon, IconProvider } from './icon';

function resolvePlaygroundImageSrc(src: string): string {
  if (!src.startsWith('/playground-assets/')) return src;
  if (typeof document === 'undefined') return src;

  try {
    const referrerOrigin = document.referrer ? new URL(document.referrer).origin : '';
    if (referrerOrigin && referrerOrigin !== window.location.origin) {
      return `${referrerOrigin}${src}`;
    }
  } catch {
    return src;
  }

  return src;
}
