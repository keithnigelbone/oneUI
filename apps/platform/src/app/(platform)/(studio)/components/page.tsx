'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@oneui/convex';
import type { Id } from '@oneui/convex/_generated/dataModel';
import {
  ComponentTokenEditorProvider,
  ComponentThemePanel,
  useComponentTokenEditor,
  type SavedTokenOverride,
} from '@/design-tools/ComponentTokenEditor';
import { useFoundationData } from '@/components/FoundationStyleProvider';
import { usePlatformContext } from '@/contexts/PlatformContext';
import { Button } from '@oneui/ui/components/Button';
import { SelectableButton } from '@oneui/ui/components/SelectableButton';
import { IconButton } from '@oneui/ui/components/IconButton';
import { Chip } from '@oneui/ui/components/Chip';
import { InputField } from '@oneui/ui/components/Input';
import { Checkbox } from '@oneui/ui/components/Checkbox';
import { Radio, RadioGroup } from '@oneui/ui/components/Radio';
import { Switch } from '@oneui/ui/components/Switch';
import { Stepper } from '@oneui/ui/components/Stepper';
import { Badge } from '@oneui/ui/components/Badge';
import { CounterBadge } from '@oneui/ui/components/CounterBadge';
import { IndicatorBadge } from '@oneui/ui/components/IndicatorBadge';
import { Slider } from '@oneui/ui/components/Slider';
import { PaginationDots } from '@oneui/ui/components/PaginationDots';
import { Surface } from '@oneui/ui/components/Surface';
import { Select } from '@oneui/ui/components/Select';
import { ToggleGroup } from '@oneui/ui/components/ToggleGroup';
import { IconContained } from '@oneui/ui/components/IconContained';
import { SingleTextButton } from '@oneui/ui/components/SingleTextButton';
import { SelectableIconButton } from '@oneui/ui/components/SelectableIconButton';
import { SelectableSingleTextButton } from '@oneui/ui/components/SelectableSingleTextButton';
import { TabGroup, TabItem } from '@oneui/ui/components/Tabs';
import { SegmentedControl } from '@oneui/ui/components/SegmentedControl';
import { BottomNavigation, BottomNavItem } from '@oneui/ui/components/BottomNavigation';
import { Avatar } from '@oneui/ui/components/Avatar';
import { TouchSlider } from '@oneui/ui/components/TouchSlider';
import { Card } from '@oneui/ui/components/Card';
import { ListItem } from '@oneui/ui/components/ListItem';
import { Icon } from '@oneui/ui/icons/Icon';
import {
  buildAllComponentCSS,
  explainComponentTokenSources,
  type ComponentTokenSource,
} from '@oneui/ui/utils/buildComponentOverrideCSS';
import {
  COMPONENT_DECORATION_STROKE_STYLE_OPTIONS,
  COMPONENT_DECORATION_STROKE_WIDTH_OPTIONS,
  getCssDecorationComponents,
  getSvgDecorationComponents,
  type ComponentCssDecorationOption,
  type ComponentCssDecorationStrokeStyle,
  type ComponentCssDecorationStrokeWidth,
  type ComponentThemeFamilyId,
  type ComponentThemeSelections,
  type ComponentOverrideData,
  type SemanticIconName,
} from '@oneui/shared';
import styles from './global-theme.module.css';

const EMPTY_OVERRIDES: SavedTokenOverride[] = [];

/** Saved recipe/manual override shapes fed to the honest Preview Matrix merge. */
type PreviewRecipeSelection = ComponentOverrideData['recipeSelections'][number];
type PreviewTokenOverride = ComponentOverrideData['tokenOverrides'][number];

type Placement = 'edges' | 'left' | 'right';

type OrnamentRecord = {
  _id: string;
  name: string;
};

type DecorationRecord = {
  componentName: string;
  ornamentId: string;
  placement: string;
  mirror: boolean;
};

const PLACEMENT_OPTIONS: { value: Placement; label: string }[] = [
  { value: 'edges', label: 'Both Edges' },
  { value: 'left', label: 'Left Only' },
  { value: 'right', label: 'Right Only' },
];

const MIRROR_OPTIONS = [
  { value: 'same', label: 'Same' },
  { value: 'mirrored', label: 'Mirrored' },
];

const SVG_DECORATION_CAPABILITIES = getSvgDecorationComponents();
const CSS_DECORATION_CAPABILITIES = getCssDecorationComponents();
const CSS_DECORATION_OPTIONS: { value: ComponentCssDecorationOption; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'inset-stroke', label: 'Inset stroke' },
  { value: 'underline', label: 'Underline' },
  { value: 'cut-corner', label: 'Cut corner' },
];
const CSS_DECORATION_STROKE_WIDTH_SELECT_OPTIONS = COMPONENT_DECORATION_STROKE_WIDTH_OPTIONS.map(
  (option) => ({
    value: option.value,
    label: `${option.label} / ${option.value}`,
  }),
);
const CSS_DECORATION_STROKE_STYLE_SELECT_OPTIONS = COMPONENT_DECORATION_STROKE_STYLE_OPTIONS.map(
  (option) => ({
    value: option.value,
    label: option.label,
  }),
);
const CSS_DECORATION_CORNER_OPTIONS = [
  { value: 'tight', label: 'Small' },
  { value: 'regular', label: 'Medium' },
  { value: 'deep', label: 'Large' },
];
const CSS_DECORATION_STROKE_WIDTH_VALUES = new Set<string>(
  COMPONENT_DECORATION_STROKE_WIDTH_OPTIONS.map((option) => option.value),
);
const CSS_DECORATION_STROKE_STYLE_VALUES = new Set<string>(
  COMPONENT_DECORATION_STROKE_STYLE_OPTIONS.map((option) => option.value),
);
const DEFAULT_SVG_DECORATION_TARGETS = ['Button'];
const DEFAULT_CSS_DECORATION_TARGETS = ['Button'];

const CARD_PREVIEW_ITEMS: Array<{
  icon: SemanticIconName;
  title: string;
  description: string;
  tags: string[];
}> = [
  {
    icon: 'chat',
    title: 'Tone of Voice',
    description:
      "Compiles your brand's voice rules into a system prompt and runs a deterministic tone guard on every generation.",
    tags: ['voice rules', 'tone guard', 'channels'],
  },
  {
    icon: 'palette',
    title: 'Design Composition',
    description:
      'Generates UI compositions from modular rules, validates against brand foundations, and continuously improves via designer feedback.',
    tags: ['composition', 'rules', 'validation'],
  },
];

function resolveCssDecorationStrokeWidth(
  selectedStrokeWidth?: string,
  legacyWeight?: string,
): ComponentCssDecorationStrokeWidth {
  if (selectedStrokeWidth && CSS_DECORATION_STROKE_WIDTH_VALUES.has(selectedStrokeWidth)) {
    return selectedStrokeWidth as ComponentCssDecorationStrokeWidth;
  }

  if (legacyWeight === 'subtle') return 'Stroke-M';
  if (legacyWeight === 'strong') return 'Stroke-XL';
  return 'Stroke-L';
}

function resolveCssDecorationStrokeStyle(
  selectedStrokeStyle?: string,
): ComponentCssDecorationStrokeStyle {
  return selectedStrokeStyle && CSS_DECORATION_STROKE_STYLE_VALUES.has(selectedStrokeStyle)
    ? (selectedStrokeStyle as ComponentCssDecorationStrokeStyle)
    : 'solid';
}

function supportsCssDecorationOption(
  capability: (typeof CSS_DECORATION_CAPABILITIES)[number],
  option: ComponentCssDecorationOption,
): boolean {
  return option === 'none' || (capability.cssOptions?.includes(option) ?? false);
}

function parseCssDecorationTargets(
  raw: string | undefined,
  option: ComponentCssDecorationOption,
): string[] {
  const supportedComponents = new Set(
    CSS_DECORATION_CAPABILITIES
      .filter((capability) => supportsCssDecorationOption(capability, option))
      .map((capability) => capability.componentName),
  );
  const selected = (raw ?? DEFAULT_CSS_DECORATION_TARGETS.join(','))
    .split(',')
    .map((value) => value.trim())
    .filter((value) => supportedComponents.has(value));

  return selected.length > 0 ? selected : DEFAULT_CSS_DECORATION_TARGETS;
}

/**
 * Wraps a single Preview Matrix element and reveals a floating label naming the
 * exact component on hover, or when the wrapped control itself is focused
 * (`:focus-within`). Without this it is impossible to tell which themed
 * component a preview element maps to, so this is the "integrator" that ties
 * each preview back to its scope entry.
 *
 * The wrapper is intentionally NOT focusable (no `tabIndex`) so it doesn't add a
 * redundant tab stop in front of every control, and the label is `aria-hidden`
 * so screen readers announce only the real component, not a duplicate name.
 */
function PreviewProbe({
  name,
  children,
  block = false,
}: {
  name: string;
  children: React.ReactNode;
  /** Stretch to the container width for full-width / layout components. */
  block?: boolean;
}) {
  return (
    <span
      className={block ? `${styles.probe} ${styles.probeBlock}` : styles.probe}
      data-component={name}
    >
      <span className={styles.probeLabel} aria-hidden="true">
        {name}
      </span>
      {children}
    </span>
  );
}

function GlobalThemePreview({
  savedRecipeSelections,
  savedTokenOverrides,
  brandSlug,
  brandName,
}: {
  savedRecipeSelections: PreviewRecipeSelection[];
  savedTokenOverrides: PreviewTokenOverride[];
  brandSlug: string | null;
  brandName: string | null;
}) {
  const { componentThemeSelections } = useComponentTokenEditor();

  // The merged input — live draft theme selections layered onto the SAVED
  // recipe + manual overrides — is exactly what FoundationStyleProvider feeds
  // the platform chrome (theme < recipe < manual). Previewing this, rather
  // than a theme-only slice, keeps the Preview Matrix honest.
  const mergedData = useMemo<ComponentOverrideData>(() => {
    const selections = Object.entries(componentThemeSelections).map(
      ([familyId, familySelections]) => ({
        familyId: familyId as ComponentThemeFamilyId,
        selections: familySelections,
      }),
    );
    return {
      componentThemeSelections: selections,
      recipeSelections: savedRecipeSelections,
      tokenOverrides: savedTokenOverrides,
    };
  }, [componentThemeSelections, savedRecipeSelections, savedTokenOverrides]);

  // Build the preview CSS and capture the merged token provenance in the SAME
  // pass (sourceCollector) — avoids a second full-registry merge just to know
  // which source won each token.
  const { previewCSS, mergedSources } = useMemo(() => {
    const mergedSources = new Map<string, Map<string, ComponentTokenSource>>();
    const previewCSS = buildAllComponentCSS(mergedData, {
      selector: `.${styles.previewScope}`,
      brandSlug,
      brandName,
      sourceCollector: mergedSources,
    });
    return { previewCSS, mergedSources };
  }, [mergedData, brandSlug, brandName]);

  // Count theme decisions that a recipe/manual override outranks in the
  // cascade — those tokens will NOT reflect the family theme on the platform.
  // Reuses `mergedSources` from the preview pass; only the theme-only pass is
  // genuinely separate (different input).
  const overriddenThemeTokens = useMemo(() => {
    const themeOnly = explainComponentTokenSources(
      {
        componentThemeSelections: mergedData.componentThemeSelections,
        recipeSelections: [],
        tokenOverrides: [],
      },
      { brandSlug, brandName },
    );
    let count = 0;
    for (const [cssComponentName, tokenSources] of mergedSources) {
      const themeTokens = themeOnly.get(cssComponentName);
      if (!themeTokens) continue;
      for (const [tokenName, source] of tokenSources) {
        if ((source === 'recipe' || source === 'manual') && themeTokens.get(tokenName) === 'theme') {
          count += 1;
        }
      }
    }
    return count;
  }, [mergedSources, mergedData.componentThemeSelections, brandSlug, brandName]);

  return (
    <section className={styles.previewPanel} aria-label="Global theme preview">
      {previewCSS && <style dangerouslySetInnerHTML={{ __html: previewCSS }} />}
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Preview Matrix</h2>
        <p className={styles.sectionDescription}>
          Every component in the theme scope — actions, selection, navigation, inputs,
          display, and containers. Hover any element to see which component it is.
        </p>
        {overriddenThemeTokens > 0 && (
          <p className={styles.overrideNotice} role="status">
            {overriddenThemeTokens} theme{' '}
            {overriddenThemeTokens === 1 ? 'decision is' : 'decisions are'} overridden by
            component-level customisations and will keep their pinned values on the platform.
            Reset those overrides from each component&rsquo;s editor to apply the family theme.
          </p>
        )}
      </div>
      <div className={styles.previewScope}>
        <div className={styles.matrix}>
          <div className={styles.previewGroup}>
            <h3 className={styles.groupTitle}>Actions</h3>
            <div className={styles.previewRow}>
              <PreviewProbe name="Button">
                <Button attention="high" onPress={() => {}}>
                  Continue
                </Button>
              </PreviewProbe>
              <PreviewProbe name="Button">
                <Button attention="medium" onPress={() => {}}>
                  Save
                </Button>
              </PreviewProbe>
              <PreviewProbe name="Button">
                <Button attention="low" onPress={() => {}}>
                  Learn
                </Button>
              </PreviewProbe>
              <PreviewProbe name="IconButton">
                <IconButton
                  icon={<Icon name="add" aria-hidden={true} />}
                  aria-label="Add"
                  attention="high"
                />
              </PreviewProbe>
              <PreviewProbe name="SingleTextButton">
                <SingleTextButton>Ag</SingleTextButton>
              </PreviewProbe>
            </div>
          </div>

          <div className={styles.previewGroup}>
            <h3 className={styles.groupTitle}>Selection</h3>
            <div className={styles.previewRow}>
              <PreviewProbe name="SelectableButton">
                <SelectableButton defaultSelected onSelectedChange={() => {}}>
                  Selected
                </SelectableButton>
              </PreviewProbe>
              <PreviewProbe name="SelectableIconButton">
                <SelectableIconButton
                  icon={<Icon name="heart" aria-hidden={true} />}
                  aria-label="Favorite"
                  defaultSelected
                />
              </PreviewProbe>
              <PreviewProbe name="SelectableSingleTextButton">
                <SelectableSingleTextButton defaultSelected>Ag</SelectableSingleTextButton>
              </PreviewProbe>
              <PreviewProbe name="Chip">
                <Chip selected>Selected</Chip>
              </PreviewProbe>
              <PreviewProbe name="Checkbox">
                <Checkbox checked onCheckedChange={() => {}} label="Active" />
              </PreviewProbe>
              <PreviewProbe name="Radio">
                <RadioGroup value="one" aria-label="Choice" orientation="horizontal">
                  <Radio value="one">One</Radio>
                  <Radio value="two">Two</Radio>
                </RadioGroup>
              </PreviewProbe>
              <PreviewProbe name="Switch">
                <Switch checked onCheckedChange={() => {}} aria-label="Enabled" />
              </PreviewProbe>
            </div>
          </div>

          <div className={styles.previewGroup}>
            <h3 className={styles.groupTitle}>Navigation</h3>
            <div className={styles.previewColumnStack}>
              <PreviewProbe name="Tabs" block>
                <TabGroup defaultValue="overview">
                  <TabItem value="overview">Overview</TabItem>
                  <TabItem value="projects">Projects</TabItem>
                  <TabItem value="activity">Activity</TabItem>
                </TabGroup>
              </PreviewProbe>
              <PreviewProbe name="SegmentedControl" block>
                <SegmentedControl defaultValue="grid" aria-label="View mode">
                  <SegmentedControl.Item value="grid">Grid</SegmentedControl.Item>
                  <SegmentedControl.Item value="list">List</SegmentedControl.Item>
                </SegmentedControl>
              </PreviewProbe>
              <PreviewProbe name="BottomNavigation" block>
                <BottomNavigation aria-label="Primary" defaultValue="home">
                  <BottomNavItem value="home" icon="home" label="Home" />
                  <BottomNavItem value="search" icon="search" label="Search" />
                  <BottomNavItem value="profile" icon="user" label="Profile" />
                </BottomNavigation>
              </PreviewProbe>
            </div>
          </div>

          <div className={styles.previewGroup}>
            <h3 className={styles.groupTitle}>Inputs</h3>
            <div className={styles.previewColumnStack}>
              <PreviewProbe name="InputField" block>
                <InputField label="Name" defaultValue="Swadesh" fullWidth />
              </PreviewProbe>
              <div className={styles.previewRow}>
                <PreviewProbe name="Select">
                  <Select
                    aria-label="Preview select"
                    value="one"
                    onChange={() => {}}
                    options={[
                      { value: 'one', label: 'One' },
                      { value: 'two', label: 'Two' },
                    ]}
                  />
                </PreviewProbe>
                <PreviewProbe name="Stepper">
                  <Stepper defaultValue={4} min={0} max={10} />
                </PreviewProbe>
              </div>
            </div>
          </div>

          <div className={styles.previewGroup}>
            <h3 className={styles.groupTitle}>Display</h3>
            <div className={styles.previewColumnStack}>
              <div className={styles.previewRow}>
                <PreviewProbe name="Badge">
                  <Badge attention="high" aria-label="Live">
                    Live
                  </Badge>
                </PreviewProbe>
                <PreviewProbe name="Badge">
                  <Badge attention="medium" appearance="secondary" aria-label="Draft">
                    Draft
                  </Badge>
                </PreviewProbe>
                <PreviewProbe name="CounterBadge">
                  <CounterBadge value={7} appearance="negative" aria-label="7 alerts" />
                </PreviewProbe>
                <PreviewProbe name="IndicatorBadge">
                  <IndicatorBadge appearance="positive" aria-label="Online" />
                </PreviewProbe>
                <PreviewProbe name="Avatar">
                  <Avatar content="text" alt="Jane Smith" />
                </PreviewProbe>
                <PreviewProbe name="IconContained">
                  <IconContained
                    icon={<Icon name="star" aria-hidden={true} />}
                    attention="high"
                    aria-label="Featured"
                  />
                </PreviewProbe>
              </div>
              <PreviewProbe name="Slider" block>
                <Slider defaultValue={42} ariaLabels={['Theme value']} />
              </PreviewProbe>
              <PreviewProbe name="TouchSlider" block>
                <div style={{ maxWidth: 'calc(var(--Spacing-40) * 1.4)', width: '100%' }}>
                  <TouchSlider defaultValue={60} aria-label="Brightness" />
                </div>
              </PreviewProbe>
              <PreviewProbe name="PaginationDots">
                <PaginationDots
                  pageCount={5}
                  activeIndex={2}
                  readOnly
                  aria-label="Display pagination preview"
                />
              </PreviewProbe>
            </div>
          </div>

          <div className={styles.previewGroup}>
            <h3 className={styles.groupTitle}>Containers</h3>
            <div className={styles.previewColumnStack}>
              <PreviewProbe name="Card" block>
                <Card>Card content</Card>
              </PreviewProbe>
              <PreviewProbe name="ListItem" block>
                <ListItem
                  title="Settings"
                  supportText="Manage your account"
                  start={<Icon name="settings" aria-hidden={true} />}
                  end={<Icon name="chevronRight" aria-hidden={true} />}
                />
              </PreviewProbe>
            </div>
          </div>

          <div className={`${styles.previewGroup} ${styles.previewGroupWide}`}>
            <h3 className={styles.groupTitle}>Cards</h3>
            <div className={styles.cardPreviewGrid}>
              {CARD_PREVIEW_ITEMS.map((item) => (
                // Real Card so the Containers family theme (radius/padding/stroke/
                // elevation) actually drives these preview cards. The className is
                // layout-only; Card owns the themed container geometry.
                <Card key={item.title} className={styles.agentPreviewCard}>
                  <div className={styles.agentPreviewHeader}>
                    <IconContained icon={item.icon} attention="high" size="l" aria-hidden="true" />
                    <Badge attention="medium" appearance="positive" aria-label="Active">
                      Active
                    </Badge>
                  </div>
                  <div className={styles.agentPreviewBody}>
                    <h4 className={styles.agentPreviewTitle}>{item.title}</h4>
                    <p className={styles.agentPreviewDescription}>{item.description}</p>
                  </div>
                  <div className={styles.agentPreviewTags} aria-label={`${item.title} tags`}>
                    {item.tags.map((tag) => (
                      <span key={tag} className={styles.agentPreviewTag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <div className={`${styles.previewGroup} ${styles.previewGroupWide}`}>
            <h3 className={styles.groupTitle}>Surface Context</h3>
            <Surface mode="subtle" className={styles.surfaceExample}>
              <div className={styles.previewRow}>
                <Button attention="high" onPress={() => {}}>
                  Primary
                </Button>
                <Button attention="medium" onPress={() => {}}>
                  Secondary
                </Button>
                <Button attention="low" onPress={() => {}}>
                  Ghost
                </Button>
                <Checkbox checked onCheckedChange={() => {}} label="Contrast" />
                <Badge attention="medium" aria-label="Nested">
                  Nested
                </Badge>
              </div>
            </Surface>
          </div>
        </div>
      </div>
    </section>
  );
}

function DecorationAssignment({
  ornaments,
  decorations,
  onUpsert,
  onRemove,
}: {
  ornaments: OrnamentRecord[];
  decorations: DecorationRecord[];
  onUpsert: (
    componentName: string,
    ornamentId: string,
    placement: Placement,
    mirror: boolean,
  ) => void;
  onRemove: (componentName: string) => void;
}) {
  const [decorationMode, setDecorationMode] =
    useState<'css-decoration' | 'svg-ornament'>('css-decoration');
  const [svgOrnamentId, setSvgOrnamentId] = useState('');
  const [svgPlacement, setSvgPlacement] = useState<Placement>('edges');
  const [svgMirror, setSvgMirror] = useState(true);
  const { componentThemeSelections, setComponentThemeDecision } = useComponentTokenEditor();
  const actionSelections = componentThemeSelections.actions ?? {};
  const cssDecoration =
    (actionSelections.cssDecoration as ComponentCssDecorationOption | undefined) ?? 'none';
  const cssDecorationStrokeWidth = resolveCssDecorationStrokeWidth(
    actionSelections.cssDecorationStrokeWidth,
    actionSelections.cssDecorationWeight,
  );
  const cssDecorationStrokeStyle = resolveCssDecorationStrokeStyle(
    actionSelections.cssDecorationStrokeStyle,
  );
  const cssDecorationCornerSize = actionSelections.cssDecorationCornerSize ?? 'regular';
  const cssDecorationTargets = parseCssDecorationTargets(
    actionSelections.cssDecorationTargets,
    cssDecoration,
  );
  const svgDecorationTargets = useMemo(() => {
    const supportedComponents = new Set(
      SVG_DECORATION_CAPABILITIES.map((capability) => capability.componentName),
    );
    return SVG_DECORATION_CAPABILITIES
      .map((capability) => capability.componentName)
      .filter((componentName) =>
        supportedComponents.has(componentName) &&
        decorations.some((item) => item.componentName === componentName),
      );
  }, [decorations]);
  const firstSvgAssignment = useMemo(
    () =>
      decorations.find((item) =>
        SVG_DECORATION_CAPABILITIES.some(
          (capability) => capability.componentName === item.componentName,
        ),
      ) ?? null,
    [decorations],
  );

  useEffect(() => {
    if (!firstSvgAssignment) return;
    setSvgOrnamentId(firstSvgAssignment.ornamentId);
    setSvgPlacement((firstSvgAssignment.placement as Placement | undefined) ?? 'edges');
    setSvgMirror(firstSvgAssignment.mirror);
  }, [
    firstSvgAssignment?.ornamentId,
    firstSvgAssignment?.placement,
    firstSvgAssignment?.mirror,
  ]);

  useEffect(() => {
    if (cssDecoration === 'none') return;

    const currentTargets = (actionSelections.cssDecorationTargets ?? DEFAULT_CSS_DECORATION_TARGETS.join(','))
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);
    const nextTargets = parseCssDecorationTargets(
      actionSelections.cssDecorationTargets,
      cssDecoration,
    );

    if (currentTargets.join(',') !== nextTargets.join(',')) {
      setComponentThemeDecision('actions', 'cssDecorationTargets', nextTargets.join(','));
    }
  }, [
    actionSelections.cssDecorationTargets,
    cssDecoration,
    setComponentThemeDecision,
  ]);

  const handleCssTargetChange = useCallback(
    (componentName: string, checked: boolean) => {
      const selected = new Set(cssDecorationTargets);
      if (checked) {
        selected.add(componentName);
      } else {
        selected.delete(componentName);
      }

      const orderedTargets = CSS_DECORATION_CAPABILITIES
        .filter((capability) => supportsCssDecorationOption(capability, cssDecoration))
        .map((capability) => capability.componentName)
        .filter((name) => selected.has(name));
      const nextTargets =
        orderedTargets.length > 0 ? orderedTargets : DEFAULT_CSS_DECORATION_TARGETS;

      setComponentThemeDecision('actions', 'cssDecorationTargets', nextTargets.join(','));
    },
    [cssDecoration, cssDecorationTargets, setComponentThemeDecision],
  );

  const applySvgToTargets = useCallback(
    (targets: string[], ornamentId: string, placement: Placement, mirror: boolean) => {
      if (!ornamentId) return;
      for (const componentName of targets) {
        onUpsert(componentName, ornamentId, placement, mirror);
      }
    },
    [onUpsert],
  );

  const handleSvgOrnamentChange = useCallback(
    (ornamentId: string) => {
      setSvgOrnamentId(ornamentId);

      const targets =
        svgDecorationTargets.length > 0
          ? svgDecorationTargets
          : DEFAULT_SVG_DECORATION_TARGETS;

      if (!ornamentId) {
        for (const componentName of svgDecorationTargets) {
          onRemove(componentName);
        }
        return;
      }

      applySvgToTargets(targets, ornamentId, svgPlacement, svgMirror);
    },
    [
      applySvgToTargets,
      onRemove,
      svgDecorationTargets,
      svgMirror,
      svgPlacement,
    ],
  );

  const handleSvgTargetChange = useCallback(
    (componentName: string, checked: boolean) => {
      if (!checked) {
        onRemove(componentName);
        return;
      }

      if (!svgOrnamentId) return;
      onUpsert(componentName, svgOrnamentId, svgPlacement, svgMirror);
    },
    [onRemove, onUpsert, svgMirror, svgOrnamentId, svgPlacement],
  );

  const handleSvgPlacementChange = useCallback(
    (placement: Placement) => {
      setSvgPlacement(placement);
      const targets =
        svgDecorationTargets.length > 0
          ? svgDecorationTargets
          : DEFAULT_SVG_DECORATION_TARGETS;
      applySvgToTargets(targets, svgOrnamentId, placement, svgMirror);
    },
    [applySvgToTargets, svgDecorationTargets, svgMirror, svgOrnamentId],
  );

  const handleSvgMirrorChange = useCallback(
    (mirror: boolean) => {
      setSvgMirror(mirror);
      const targets =
        svgDecorationTargets.length > 0
          ? svgDecorationTargets
          : DEFAULT_SVG_DECORATION_TARGETS;
      applySvgToTargets(targets, svgOrnamentId, svgPlacement, mirror);
    },
    [applySvgToTargets, svgDecorationTargets, svgOrnamentId, svgPlacement],
  );

  return (
    <section className={styles.decorationPanel}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Decoration</h2>
        <p className={styles.sectionDescription}>
          SVG ornaments and CSS decoration are available only where the renderer supports them.
        </p>
      </div>

      <ToggleGroup
        value={[decorationMode]}
        onValueChange={(values) => {
          const next = Array.isArray(values) ? values[0] : values;
          if (next === 'css-decoration' || next === 'svg-ornament') {
            setDecorationMode(next);
          }
        }}
        size="compact"
        fullWidth
      >
        <ToggleGroup.Item value="css-decoration">CSS shape</ToggleGroup.Item>
        <ToggleGroup.Item value="svg-ornament">SVG ornament</ToggleGroup.Item>
      </ToggleGroup>

      <div className={styles.decorationList}>
        {decorationMode === 'css-decoration' && (
          <div className={styles.cssDecorationControls}>
            <div className={styles.fieldGroup}>
              <span className={styles.controlLabel}>CSS shape</span>
              <ToggleGroup
                value={[cssDecoration]}
                onValueChange={(values) => {
                  const next = Array.isArray(values) ? values[0] : values;
                  if (next) {
                    setComponentThemeDecision('actions', 'cssDecoration', next);
                  }
                }}
                variant="subtool"
                size="small"
              >
                {CSS_DECORATION_OPTIONS.map((option) => (
                  <ToggleGroup.Item key={option.value} value={option.value}>
                    {option.label}
                  </ToggleGroup.Item>
                ))}
              </ToggleGroup>
            </div>

            <div className={styles.controlGrid}>
              <div className={styles.fieldGroup}>
                <span className={styles.controlLabel}>Stroke width token</span>
                <Select
                  value={cssDecorationStrokeWidth}
                  onChange={(next) =>
                    setComponentThemeDecision('actions', 'cssDecorationStrokeWidth', next)
                  }
                  options={CSS_DECORATION_STROKE_WIDTH_SELECT_OPTIONS}
                  size="sm"
                  aria-label="CSS decoration stroke width token"
                />
              </div>

              <div className={styles.fieldGroup}>
                <span className={styles.controlLabel}>Stroke style</span>
                <ToggleGroup
                  value={[cssDecorationStrokeStyle]}
                  onValueChange={(values) => {
                    const next = Array.isArray(values) ? values[0] : values;
                    if (next) {
                      setComponentThemeDecision('actions', 'cssDecorationStrokeStyle', next);
                    }
                  }}
                  variant="subtool"
                  size="small"
                >
                  {CSS_DECORATION_STROKE_STYLE_SELECT_OPTIONS.map((option) => (
                    <ToggleGroup.Item key={option.value} value={option.value}>
                      {option.label}
                    </ToggleGroup.Item>
                  ))}
                </ToggleGroup>
              </div>

              {cssDecoration === 'cut-corner' && (
                <div className={styles.fieldGroup}>
                  <span className={styles.controlLabel}>Cut size</span>
                  <ToggleGroup
                    value={[cssDecorationCornerSize]}
                    onValueChange={(values) => {
                      const next = Array.isArray(values) ? values[0] : values;
                      if (next) {
                        setComponentThemeDecision('actions', 'cssDecorationCornerSize', next);
                      }
                    }}
                    variant="subtool"
                    size="small"
                  >
                    {CSS_DECORATION_CORNER_OPTIONS.map((option) => (
                      <ToggleGroup.Item key={option.value} value={option.value}>
                        {option.label}
                      </ToggleGroup.Item>
                    ))}
                  </ToggleGroup>
                </div>
              )}
            </div>

            <div className={styles.fieldGroup}>
              <span className={styles.controlLabel}>Apply to components</span>
              <div className={styles.componentChecklist}>
                {CSS_DECORATION_CAPABILITIES.map((capability) => (
                  <Checkbox
                    key={capability.componentName}
                    checked={cssDecorationTargets.includes(capability.componentName)}
                    onCheckedChange={(checked) =>
                      handleCssTargetChange(capability.componentName, checked)
                    }
                    disabled={!supportsCssDecorationOption(capability, cssDecoration)}
                    className={styles.checklistItem}
                    label={capability.label}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {decorationMode === 'svg-ornament' && (
          <div className={styles.cssDecorationControls}>
            <div className={styles.controlGrid}>
              <div className={styles.fieldGroup}>
                <span className={styles.controlLabel}>SVG ornament</span>
                <Select
                  value={svgOrnamentId}
                  onChange={handleSvgOrnamentChange}
                  options={[
                    { value: '', label: 'None' },
                    ...ornaments.map((ornament) => ({
                      value: ornament._id,
                      label: ornament.name,
                    })),
                  ]}
                  size="sm"
                  aria-label="SVG ornament"
                />
              </div>

              <div className={styles.fieldGroup}>
                <span className={styles.controlLabel}>Placement</span>
                <ToggleGroup
                  value={[svgPlacement]}
                  onValueChange={(values) => {
                    if (values[0]) {
                      handleSvgPlacementChange(values[0] as Placement);
                    }
                  }}
                  variant="subtool"
                  size="small"
                >
                  {PLACEMENT_OPTIONS.map((option) => (
                    <ToggleGroup.Item key={option.value} value={option.value}>
                      {option.label}
                    </ToggleGroup.Item>
                  ))}
                </ToggleGroup>
              </div>

              <div className={styles.fieldGroup}>
                <span className={styles.controlLabel}>Mirror</span>
                <ToggleGroup
                  value={[svgMirror ? 'mirrored' : 'same']}
                  onValueChange={(values) => {
                    if (values[0]) {
                      handleSvgMirrorChange(values[0] === 'mirrored');
                    }
                  }}
                  variant="subtool"
                  size="small"
                >
                  {MIRROR_OPTIONS.map((option) => (
                    <ToggleGroup.Item key={option.value} value={option.value}>
                      {option.label}
                    </ToggleGroup.Item>
                  ))}
                </ToggleGroup>
              </div>
            </div>

            <div className={styles.fieldGroup}>
              <span className={styles.controlLabel}>Apply to components</span>
              <div className={styles.componentChecklist}>
                {SVG_DECORATION_CAPABILITIES.map((capability) => (
                  <Checkbox
                    key={capability.componentName}
                    checked={svgDecorationTargets.includes(capability.componentName)}
                    onCheckedChange={(checked) =>
                      handleSvgTargetChange(capability.componentName, checked)
                    }
                    disabled={!svgOrnamentId}
                    className={styles.checklistItem}
                    label={capability.label}
                  />
                ))}
              </div>
            </div>

            {svgDecorationTargets.length > 0 && (
              <Button
                attention="low"
                size="small"
                onPress={() => {
                  for (const componentName of svgDecorationTargets) {
                    onRemove(componentName);
                  }
                }}
              >
                Remove SVG ornament
              </Button>
            )}
          </div>
        )}

        {decorationMode === 'svg-ornament' && ornaments.length === 0 && (
          <div className={styles.emptyState}>
            <span className={styles.groupTitle}>No SVG ornaments</span>
            <p className={styles.bodyText}>Create ornament assets in Foundations → Decorations.</p>
          </div>
        )}
      </div>
    </section>
  );
}

function GlobalThemeWorkbench({
  ornaments,
  decorations,
  onUpsertDecoration,
  onRemoveDecoration,
  savedRecipeSelections,
  savedTokenOverrides,
  brandSlug,
  brandName,
}: {
  ornaments: OrnamentRecord[];
  decorations: DecorationRecord[];
  onUpsertDecoration: (
    componentName: string,
    ornamentId: string,
    placement: Placement,
    mirror: boolean,
  ) => void;
  onRemoveDecoration: (componentName: string) => void;
  savedRecipeSelections: PreviewRecipeSelection[];
  savedTokenOverrides: PreviewTokenOverride[];
  brandSlug: string | null;
  brandName: string | null;
}) {
  return (
    <div className={styles.layout}>
      <div className={styles.previewColumn}>
        <GlobalThemePreview
          savedRecipeSelections={savedRecipeSelections}
          savedTokenOverrides={savedTokenOverrides}
          brandSlug={brandSlug}
          brandName={brandName}
        />
      </div>
      <div className={styles.controlsColumn}>
        <section className={styles.panel}>
          <ComponentThemePanel
            componentName="Button"
            hiddenDecisionIds={[
              'cssDecoration',
              'cssDecorationStrokeWidth',
              'cssDecorationStrokeStyle',
            ]}
          />
        </section>
        <DecorationAssignment
          ornaments={ornaments}
          decorations={decorations}
          onUpsert={onUpsertDecoration}
          onRemove={onRemoveDecoration}
        />
      </div>
    </div>
  );
}

export default function ComponentsGlobalThemePage() {
  const foundationData = useFoundationData();
  const { currentBrand, theme } = usePlatformContext();
  const brandId = currentBrand?.id as Id<'brands'> | undefined;

  const savedComponentThemeSelectionsData = useQuery(
    api.componentTokenOverrides.getComponentThemeSelections,
    brandId ? { brandId } : 'skip',
  );
  // Saved recipe selections + manual token overrides — the SAME data
  // FoundationStyleProvider injects globally. The Preview Matrix merges the
  // live draft theme selections on top of these so the preview matches exactly
  // what the platform chrome will render (theme < recipe < manual).
  const savedComponentData = useQuery(
    api.componentTokenOverrides.getAllBrandComponentData,
    brandId ? { brandId } : 'skip',
  );
  const ornamentsData = useQuery(
    api.brandOrnaments.listByBrand,
    brandId ? { brandId } : 'skip',
  );
  const decorationsData = useQuery(
    api.brandOrnaments.listDecorationsByBrand,
    brandId ? { brandId } : 'skip',
  );

  const upsertComponentThemeSelections = useMutation(
    api.componentTokenOverrides.upsertComponentThemeSelections,
  );
  const deleteComponentThemeSelections = useMutation(
    api.componentTokenOverrides.deleteComponentThemeSelections,
  );
  const upsertDecoration = useMutation(api.brandOrnaments.upsertDecoration);
  const removeDecoration = useMutation(api.brandOrnaments.removeDecoration);

  const savedComponentThemeSelections: ComponentThemeSelections[] | null = useMemo(() => {
    if (!savedComponentThemeSelectionsData) return null;
    return savedComponentThemeSelectionsData.map((selection) => ({
      familyId: selection.familyId as ComponentThemeFamilyId,
      selections: (selection.selections || {}) as Record<string, string>,
    }));
  }, [savedComponentThemeSelectionsData]);

  const ornaments = useMemo<OrnamentRecord[]>(
    () => (ornamentsData ?? []).map((ornament) => ({
      _id: ornament._id,
      name: ornament.name,
    })),
    [ornamentsData],
  );

  const decorations = useMemo<DecorationRecord[]>(
    () => (decorationsData ?? []).map((decoration) => ({
      componentName: decoration.componentName,
      ornamentId: decoration.ornamentId,
      placement: decoration.placement,
      mirror: decoration.mirror,
    })),
    [decorationsData],
  );

  const handleSaveComponentThemeSelections = useCallback(
    async (familyId: ComponentThemeFamilyId, selections: ComponentThemeSelections) => {
      if (!brandId) return;
      await upsertComponentThemeSelections({
        brandId,
        familyId,
        selections: selections.selections,
      });
    },
    [brandId, upsertComponentThemeSelections],
  );

  const handleDeleteComponentThemeSelections = useCallback(
    async (familyId: ComponentThemeFamilyId) => {
      if (!brandId) return;
      await deleteComponentThemeSelections({ brandId, familyId });
    },
    [brandId, deleteComponentThemeSelections],
  );

  const handleUpsertDecoration = useCallback(
    async (
      componentName: string,
      ornamentId: string,
      placement: Placement,
      mirror: boolean,
    ) => {
      if (!brandId) return;
      await upsertDecoration({
        brandId,
        componentName,
        ornamentId: ornamentId as Id<'brandOrnaments'>,
        placement,
        mirror,
      });
    },
    [brandId, upsertDecoration],
  );

  const handleRemoveDecoration = useCallback(
    async (componentName: string) => {
      if (!brandId) return;
      await removeDecoration({ brandId, componentName });
    },
    [brandId, removeDecoration],
  );

  return (
    <div className={styles.page} data-full-bleed>
      <header className={styles.header}>
        <span className={styles.eyebrow}>Components</span>
        <h1 className={styles.title}>Global Component Theme</h1>
        <p className={styles.description}>
          Shape, scale, emphasis, appearance, and decoration decisions for component families.
        </p>
      </header>

      {!brandId && (
        <section className={styles.emptyState}>
          <span className={styles.groupTitle}>No brand selected</span>
          <p className={styles.bodyText}>Select a brand to save component theming.</p>
        </section>
      )}
      <ComponentTokenEditorProvider
        mode={theme === 'dark' ? 'dark' : 'light'}
        brandId={brandId ?? null}
        foundationData={foundationData ?? null}
        componentName="Button"
        savedOverrides={EMPTY_OVERRIDES}
        savedComponentThemeSelections={savedComponentThemeSelections ?? []}
        onSaveComponentThemeSelections={handleSaveComponentThemeSelections}
        onDeleteComponentThemeSelections={handleDeleteComponentThemeSelections}
      >
        <GlobalThemeWorkbench
          ornaments={ornaments}
          decorations={decorations}
          onUpsertDecoration={handleUpsertDecoration}
          onRemoveDecoration={handleRemoveDecoration}
          savedRecipeSelections={savedComponentData?.recipeSelections ?? []}
          savedTokenOverrides={savedComponentData?.tokenOverrides ?? []}
          brandSlug={currentBrand?.slug ?? null}
          brandName={currentBrand?.name ?? null}
        />
      </ComponentTokenEditorProvider>
    </div>
  );
}
