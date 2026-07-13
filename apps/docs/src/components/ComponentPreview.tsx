'use client';

import { Avatar } from '@oneui/ui/components/Avatar';
import { Badge } from '@oneui/ui/components/Badge';
import { BottomNavigation, BottomNavItem } from '@oneui/ui/components/BottomNavigation';
import { Button } from '@oneui/ui/components/Button';
import { Carousel } from '@oneui/ui/components/Carousel';
import { Checkbox } from '@oneui/ui/components/Checkbox';
import { Chip } from '@oneui/ui/components/Chip';
import { ChipGroup } from '@oneui/ui/components/ChipGroup';
import { Container } from '@oneui/ui/components/Container';
import { CounterBadge } from '@oneui/ui/components/CounterBadge';
import { Divider } from '@oneui/ui/components/Divider';
import { FAB } from '@oneui/ui/components/FAB';
import { Grid } from '@oneui/ui/components/Grid';
import { Icon } from '@oneui/ui/components/Icon';
import { IconButton } from '@oneui/ui/components/IconButton';
import { Image } from '@oneui/ui/components/Image';
import { IndicatorBadge } from '@oneui/ui/components/IndicatorBadge';
import { InputField } from '@oneui/ui/components/Input';
import { Button } from '@oneui/ui/components/Button';
import { ListItem } from '@oneui/ui/components/ListItem';
import { ListItemGroup } from '@oneui/ui/components/ListItemGroup';
import { Logo } from '@oneui/ui/components/Logo';
import { PaginationDots } from '@oneui/ui/components/PaginationDots';
import { Radio, RadioGroup } from '@oneui/ui/components/Radio';
import { Slider } from '@oneui/ui/components/Slider';
import { Spinner } from '@oneui/ui/components/Spinner';
import { Stepper } from '@oneui/ui/components/Stepper';
import { Surface } from '@oneui/ui/components/Surface';
import { Switch } from '@oneui/ui/components/Switch';
import { TabGroup, TabItem, TabPanel } from '@oneui/ui/components/Tabs';
import { Tooltip, TooltipProvider } from '@oneui/ui/components/Tooltip';
import { HeaderItem, PrimaryNav, WebHeader } from '@oneui/ui/components/WebHeader';
import { useBrandLogo } from '@oneui/ui/contexts/BrandLogoContext';
import styles from './DocComponents.module.css';

const imageSrc =
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80';

export function ComponentPreview({ name }: { name: string }) {
  return (
    <Surface mode="default" appearance="neutral" className={styles.previewShell}>
      <div className={styles.previewStage}>{renderPreview(name)}</div>
    </Surface>
  );
}

function renderPreview(name: string) {
  switch (name) {
    case 'Surface':
      return (
        <Surface mode="bold" className={styles.previewSurface}>
          <p>Surface context</p>
          <Button variant="subtle">Readable action</Button>
        </Surface>
      );
    case 'Button':
      return (
        <div className={styles.previewRow}>
          <Button variant="bold">Get started</Button>
          <Button variant="subtle" appearance="secondary">
            Learn more
          </Button>
          <Button variant="ghost" appearance="neutral">
            Details
          </Button>
        </div>
      );
    case 'IconButton':
      return <IconButton icon={<PreviewGlyph>+</PreviewGlyph>} aria-label="Create" />;
    case 'LinkButton':
      return <Button contained={false}>Read documentation</Button>;
    case 'FAB':
      return <FAB icon={<PreviewGlyph>+</PreviewGlyph>} label="Create" />;
    case 'Badge':
      return (
        <div className={styles.previewRow}>
          <Badge variant="bold">Alpha</Badge>
          <Badge variant="subtle" appearance="positive">
            Stable path
          </Badge>
          <Badge variant="ghost" appearance="neutral">
            Optional
          </Badge>
        </div>
      );
    case 'Avatar':
      return (
        <div className={styles.previewRow}>
          <Avatar content="text" alt="OneUI Studio" />
          <Avatar content="text" alt="Jio Design" appearance="secondary" />
          <Avatar content="icon" icon={<PreviewGlyph>O</PreviewGlyph>} appearance="sparkle" />
        </div>
      );
    case 'Chip':
      return (
        <div className={styles.previewRow}>
          <Chip selected>Selected</Chip>
          <Chip>Filter</Chip>
          <Chip appearance="neutral">Neutral</Chip>
        </div>
      );
    case 'ChipGroup':
      return (
        <ChipGroup aria-label="Example filters">
          <Chip selected value="all">
            All
          </Chip>
          <Chip value="brand">Brand</Chip>
          <Chip value="tokens">Tokens</Chip>
        </ChipGroup>
      );
    case 'InputField':
      return <InputField label="Project name" placeholder="OneUI docs" dynamicText="Use tokens, not literals." fullWidth />;
    case 'Checkbox':
      return <Checkbox defaultChecked label="Use Surface on branded backgrounds" />;
    case 'Radio':
      return (
        <RadioGroup defaultValue="docs" orientation="horizontal" aria-label="Documentation mode">
          <Radio value="docs">Docs</Radio>
          <Radio value="api">API</Radio>
        </RadioGroup>
      );
    case 'Switch':
      return (
        <div className={styles.previewRow}>
          <Switch appearance="secondary">Secondary (default)</Switch>
          <Switch appearance="primary" defaultChecked>
            Primary checked
          </Switch>
        </div>
      );
    case 'Slider':
      return <Slider defaultValue={64} aria-label="Preview value" showTooltip="always" />;
    case 'Tabs':
      return (
        <TabGroup defaultValue="preview">
          <TabItem value="preview">Preview</TabItem>
          <TabItem value="code">Code</TabItem>
          <TabPanel value="preview">Brand-aware component preview</TabPanel>
          <TabPanel value="code">Path imports and token CSS</TabPanel>
        </TabGroup>
      );
    case 'ListItem':
      return <ListItem title="Component documentation" supportText="Preview, usage, props, and surface rules" end={<PreviewGlyph>›</PreviewGlyph>} />;
    case 'ListItemGroup':
      return (
        <ListItemGroup aria-label="Documentation sections">
          <ListItem title="Preview" supportText="Live branded rendering" />
          <ListItem title="Usage" supportText="Consumer import and composition" />
        </ListItemGroup>
      );
    case 'Divider':
      return (
        <Divider content="text">Section</Divider>
      );
    case 'Image':
      return <Image src={imageSrc} alt="Abstract product preview" aspectRatio="16:9" interactive />;
    case 'Icon':
      return <Icon icon={<PreviewGlyph>★</PreviewGlyph>} appearance="primary" emphasis="tintedA11y" aria-label="Featured" />;
    case 'Logo':
      return <LogoPreview />;
    case 'Spinner':
      return <Spinner aria-label="Loading" />;
    case 'Tooltip':
      return (
        <TooltipProvider>
          <Tooltip content="Surface-aware tooltip">
            <Button variant="subtle">Hover for tooltip</Button>
          </Tooltip>
        </TooltipProvider>
      );
    case 'PaginationDots':
      return <PaginationDots pageCount={5} defaultActiveIndex={2} aria-label="Carousel pagination" />;
    case 'Container':
      return (
        <Container variant="fixed" className={styles.previewContainer}>
          Fixed container
        </Container>
      );
    case 'Grid':
      return (
        <Grid columns={3} className={styles.previewGrid}>
          <span />
          <span />
          <span />
        </Grid>
      );
    case 'Stepper':
      return <Stepper defaultValue={2} min={0} max={8} />;
    case 'CounterBadge':
      return <CounterBadge value={12} aria-label="12 notifications" />;
    case 'IndicatorBadge':
      return <IndicatorBadge aria-label="Online" appearance="positive" />;
    case 'BottomNavigation':
      return (
        <BottomNavigation defaultValue="home" aria-label="Preview bottom navigation">
          <BottomNavItem value="home" label="Home" icon={<PreviewGlyph>H</PreviewGlyph>} />
          <BottomNavItem value="search" label="Search" icon={<PreviewGlyph>S</PreviewGlyph>} />
          <BottomNavItem value="profile" label="Profile" icon={<PreviewGlyph>P</PreviewGlyph>} />
        </BottomNavigation>
      );
    case 'WebHeader':
      return (
        <div className={styles.previewWide}>
          <WebHeader>
            <PrimaryNav logo={<LogoPreview />} activeValue="docs" showAvatar={false}>
              <HeaderItem value="docs">Docs</HeaderItem>
              <HeaderItem value="components">Components</HeaderItem>
            </PrimaryNav>
          </WebHeader>
        </div>
      );
    case 'Carousel':
      return (
        <Carousel.Root aria-label="Preview carousel">
          <Carousel.Viewport>
            <Carousel.Track>
              <Carousel.Slide>
                <div className={styles.previewSlide}>Brand story</div>
              </Carousel.Slide>
              <Carousel.Slide>
                <div className={styles.previewSlide}>Component system</div>
              </Carousel.Slide>
            </Carousel.Track>
          </Carousel.Viewport>
          <Carousel.Controls>
            <Carousel.PrevButton aria-label="Previous slide" />
            <Carousel.IndicatorList />
            <Carousel.NextButton aria-label="Next slide" />
          </Carousel.Controls>
        </Carousel.Root>
      );
    default:
      return <p>Preview coming soon.</p>;
  }
}

function LogoPreview() {
  const { brandName, logoSvg } = useBrandLogo();

  return <Logo alt={brandName ?? 'Brand'} fallback={<PreviewGlyph>O</PreviewGlyph>} size="xl" svgContent={logoSvg} />;
}

function PreviewGlyph({ children }: { children: string }) {
  return (
    <span className={styles.previewGlyph} aria-hidden="true">
      {children}
    </span>
  );
}
