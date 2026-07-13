/**
 * CarouselScreen — focused visual-test surface for `<Carousel>` from
 * `@oneui/ui-native`.
 *
 * Each `section-*` testID becomes one Applitools checkpoint (see
 * `CombinationsRules/CarouselRules.txt`). The high-level `DemoCarousel`
 * composition is reused from the component showcase so slide copy/images stay
 * in sync; sections that the demo does not cover (selection rail, surface
 * context) are assembled inline from the compound parts.
 *
 * Styling is token-only (`tokens.spacing.*`, `typography.*`, `useSurfaceTokens`).
 */

import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Carousel, Surface, useSurfaceTokens } from '@oneui/ui-native';
import { DemoCarousel, DEMO_SLIDES } from '@oneui/ui-native/showcase/Carousel';
import { tokens, typography } from '@oneui/tokens';

const RAIL_ITEMS = DEMO_SLIDES.slice(0, 5).map((slide) => ({ src: slide.src, alt: slide.alt }));

/* ─── Section chrome ─────────────────────────────────────────────────────── */

function Section({
  testID,
  title,
  children,
}: {
  testID: string;
  title: string;
  children: React.ReactNode;
}): React.ReactElement {
  const role = useSurfaceTokens('neutral');
  return (
    <View testID={testID} style={[styles.section, { borderColor: role.content.strokeLow }]}>
      <Text style={[styles.sectionTitle, { color: role.content.high }]}>{title}</Text>
      <View style={styles.stack}>{children}</View>
    </View>
  );
}

function Label({ children }: { children: string }): React.ReactElement {
  const role = useSurfaceTokens('neutral');
  return <Text style={[styles.itemLabel, { color: role.content.medium }]}>{children}</Text>;
}

function Item({
  testID,
  label,
  children,
}: {
  testID: string;
  label: string;
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <View testID={testID} style={styles.item}>
      <Label>{label}</Label>
      {children}
    </View>
  );
}

/* ─── Screen ─────────────────────────────────────────────────────────────── */

export function CarouselScreen(): React.ReactElement {
  const role = useSurfaceTokens('neutral');
  return (
    <ScrollView
      testID="screen-Carousel"
      style={{ backgroundColor: role.surfaces.default }}
      contentContainerStyle={styles.content}
    >
      {/* 1 · Image aspect ratios */}
      <Section testID={'section-aspect-ratios'} title="1 · Image aspect ratios">
        <Item testID="carousel-aspect-1-1" label="1:1">
          <DemoCarousel ariaLabel="Aspect 1:1" imageAspectRatio="1:1" width="fill" count={3} />
        </Item>
        <Item testID="carousel-aspect-16-9" label="16:9">
          <DemoCarousel ariaLabel="Aspect 16:9" imageAspectRatio="16:9" width="fill" count={3} />
        </Item>
        <Item testID="carousel-aspect-3-4" label="3:4 (default)">
          <DemoCarousel ariaLabel="Aspect 3:4" imageAspectRatio="3:4" width="fill" count={3} />
        </Item>
      </Section>

      {/* 2 · Content alignments */}
      <Section testID={'section-alignments'} title="2 · Content alignments">
        <Item testID="carousel-align-startBottom" label="startBottom">
          <DemoCarousel ariaLabel="Align startBottom" alignment="startBottom" count={1} controls="none" />
        </Item>
        <Item testID="carousel-align-startMiddle" label="startMiddle">
          <DemoCarousel ariaLabel="Align startMiddle" alignment="startMiddle" count={1} controls="none" />
        </Item>
        <Item testID="carousel-align-middleBottom" label="middleBottom">
          <DemoCarousel ariaLabel="Align middleBottom" alignment="middleBottom" count={1} controls="none" />
        </Item>
        <Item testID="carousel-align-middleMiddle" label="middleMiddle">
          <DemoCarousel ariaLabel="Align middleMiddle" alignment="middleMiddle" count={1} controls="none" />
        </Item>
        <Item testID="carousel-align-middleTop" label="middleTop">
          <DemoCarousel
            ariaLabel="Align middleTop"
            alignment="middleTop"
            count={1}
            controls="none"
            scrim={{ position: 'top', size: 'XL', attention: 'high', variant: 'gradient' }}
          />
        </Item>
      </Section>

      {/* 3 · Content widths */}
      <Section testID={'section-content-widths'} title="3 · Content widths (startBottom)">
        {(['fill', 'l', 'm', 's'] as const).map((width) => (
          <Item key={width} testID={`carousel-width-${width}`} label={`width ${width}`}>
            <DemoCarousel
              ariaLabel={`Width ${width}`}
              alignment="startBottom"
              width={width}
              buttonWidth={width === 'fill' ? 'wide' : 'hug'}
              count={1}
              controls="none"
            />
          </Item>
        ))}
      </Section>

      {/* 4 · Controls placement */}
      <Section testID={'section-controls'} title="4 · Controls placement">
        <Item testID="carousel-controls-below" label="below · pagination + nav">
          <DemoCarousel ariaLabel="Controls below" controls="below" showNavButtons count={3} />
        </Item>
        <Item testID="carousel-controls-onMedia" label="on media · pagination + nav">
          <DemoCarousel ariaLabel="Controls on media" controls="onMedia" showNavButtons count={3} />
        </Item>
      </Section>

      {/* 5 · Peek vs full width */}
      <Section testID={'section-peek'} title="5 · Peek vs full width">
        <Item testID="carousel-peek-inset" label="inset (fullWidth=false)">
          <DemoCarousel ariaLabel="Inset carousel" fullWidth={false} count={3} startAt={4} />
        </Item>
        <Item testID="carousel-peek-fullwidth" label="full width (fullWidth=true)">
          <DemoCarousel ariaLabel="Full width carousel" fullWidth count={3} startAt={4} />
        </Item>
      </Section>

      {/* 6 · Selection rail */}
      <Section testID={'section-selection-rail'} title="6 · Selection rail">
        <Item testID="carousel-rail-below" label="below media (opaque)">
          <Carousel aria-label="Selection rail below" aspectRatio="1:1">
            <Carousel.Rail>
              {DEMO_SLIDES.slice(0, 5).map((slide) => (
                <Carousel.Item key={slide.title} surface="bold">
                  <Carousel.Item.Image src={slide.src} alt={slide.alt} />
                  <Carousel.Item.Content alignment="startBottom" width="m">
                    <Carousel.Item.Headline>{slide.title}</Carousel.Item.Headline>
                  </Carousel.Item.Content>
                </Carousel.Item>
              ))}
            </Carousel.Rail>
            <Carousel.Controls placement="below" layout="center">
              <Carousel.SelectionRail size="2xl" items={RAIL_ITEMS} />
            </Carousel.Controls>
          </Carousel>
        </Item>
        <Item testID="carousel-rail-onMedia" label="on media (transparent)">
          <Carousel aria-label="Selection rail on media" aspectRatio="1:1">
            <Carousel.Rail>
              {DEMO_SLIDES.slice(0, 5).map((slide) => (
                <Carousel.Item key={slide.title} surface="bold">
                  <Carousel.Item.Image src={slide.src} alt={slide.alt} scrim />
                  <Carousel.Item.Content alignment="startBottom" width="m">
                    <Carousel.Item.Headline>{slide.title}</Carousel.Item.Headline>
                  </Carousel.Item.Content>
                </Carousel.Item>
              ))}
            </Carousel.Rail>
            <Carousel.Controls placement="onMedia" layout="center">
              <Carousel.SelectionRail size="m" items={RAIL_ITEMS} />
            </Carousel.Controls>
          </Carousel>
        </Item>
      </Section>

      {/* 7 · Autoplay */}
      <Section testID={'section-autoplay'} title="7 · Autoplay">
        <Item testID="carousel-autoplay" label="autoPlay + loop + play button">
          <Carousel aria-label="Autoplaying carousel" autoPlay={4000} loop aspectRatio="16:9">
            <Carousel.Rail>
              {DEMO_SLIDES.slice(0, 5).map((slide) => (
                <Carousel.Item key={slide.title} surface="bold">
                  <Carousel.Item.Image src={slide.src} alt={slide.alt} scrim />
                  <Carousel.Item.Content alignment="startBottom" width="m">
                    <Carousel.Item.Headline>{slide.title}</Carousel.Item.Headline>
                  </Carousel.Item.Content>
                </Carousel.Item>
              ))}
            </Carousel.Rail>
            <Carousel.Controls placement="onMedia" layout="center" paginationAlign="middle">
              <Carousel.IndicatorList />
              <Carousel.PlayButton />
            </Carousel.Controls>
          </Carousel>
        </Item>
      </Section>

      {/* 8 · Badges */}
      <Section testID={'section-badges'} title="8 · Badges">
        <Item testID="carousel-badge-content" label="badge in Slide.Content">
          <DemoCarousel ariaLabel="Badge in content" badgePosition="content" count={1} controls="none" />
        </Item>
        <Item testID="carousel-badge-corner" label="badge in Item.BadgeRow (start)">
          <DemoCarousel ariaLabel="Badge in corner" badgePosition="corner" count={1} controls="none" />
        </Item>
      </Section>

      {/* 9 · Surface context */}
      <Section testID={'section-surface-context'} title="9 · Surface context">
        {(['default', 'subtle', 'bold'] as const).map((mode, i) => (
          <Surface key={mode} mode={mode} style={styles.surfaceCard}>
            <Item testID={`carousel-surface-${mode}`} label={`on ${mode} surface`}>
              <DemoCarousel ariaLabel={`On ${mode}`} count={3} startAt={i} />
            </Item>
          </Surface>
        ))}
      </Section>
    </ScrollView>
  );
}

/* ─── Styles ─────────────────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  content: {
    padding: tokens.spacing['4'],
    gap: tokens.spacing['5'],
  },
  section: {
    gap: tokens.spacing['4'],
    paddingBottom: tokens.spacing['4'],
    borderBottomWidth: 1,
  },
  sectionTitle: {
    fontSize: typography.size.l,
    fontWeight: typography.weight.high,
  },
  stack: {
    gap: tokens.spacing['5'],
  },
  item: {
    gap: tokens.spacing['2'],
  },
  itemLabel: {
    fontSize: typography.size.s,
    fontWeight: typography.weight.medium,
  },
  surfaceCard: {
    padding: tokens.spacing['4-5'],
    borderRadius: tokens.shape['3'],
  },
});
