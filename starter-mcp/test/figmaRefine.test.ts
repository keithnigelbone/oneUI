import { describe, it, expect } from 'vitest';
import {
  spaceToKey,
  refineExtraction,
  applyImageSources,
  registeredComponentMap,
  type RawNode,
  type RefinedNode,
} from '../src/lib/figmaRefine.js';

describe('spaceToKey', () => {
  it('maps px to the nearest canonical key on the 4px grid', () => {
    expect(spaceToKey({ px: 24 })).toBe('6');
    expect(spaceToKey({ px: 10 })).toBe('2-5');
    expect(spaceToKey({ px: 4 })).toBe('1');
    expect(spaceToKey({ px: 17 })).toBe('4'); // nearest of 16 (4) vs 18 (4-5)
  });

  it('drops zero/negative and empty values', () => {
    expect(spaceToKey({ px: 0 })).toBeUndefined();
    expect(spaceToKey(undefined)).toBeUndefined();
    expect(spaceToKey({})).toBeUndefined();
  });

  it('prefers the bound variable path when its leaf is a valid key', () => {
    expect(spaceToKey({ token: 'dimensions/spacings/6', px: 24 })).toBe('dimensions/spacings/6');
    expect(spaceToKey({ token: 'dimensions/grid/margin', px: 16 })).toBe('dimensions/grid/margin');
  });

  it('falls back to px when the bound variable is not a spacing token', () => {
    expect(spaceToKey({ token: 'something/else/entirely', px: 24 })).toBe('6');
  });
});

// The committed native snapshot registers these — the refine tests depend on them.
describe('registeredComponentMap (native snapshot)', () => {
  it('contains the core components the refine tests rely on', () => {
    const reg = registeredComponentMap('reactnative');
    for (const slug of ['button', 'text', 'image']) {
      expect(reg.has(slug), `native catalog is missing "${slug}"`).toBe(true);
    }
  });
});

function refine(tree: RawNode) {
  return refineExtraction({ base: { name: 'Test' }, tree }, 'reactnative');
}

describe('refineExtraction', () => {
  it('maps a raw TEXT node to a Text component with its copy and typography', () => {
    const { tree } = refine({
      name: 'root',
      type: 'FRAME',
      children: [
        { name: 'Heading', type: 'TEXT', chars: 'Hello world', typography: { fontSize: 24, styleName: 'title/M' } },
      ],
    });
    expect(tree?.kind).toBe('node');
    const text = tree?.children?.[0];
    expect(text).toMatchObject({ kind: 'component', component: 'Text', text: 'Hello world' });
    expect((text as Extract<RefinedNode, { kind: 'component' }>).typography?.styleName).toBe('title/M');
  });

  it('matches registered components and harvests leaf icon glyphs', () => {
    const { tree } = refine({
      name: 'root',
      type: 'FRAME',
      children: [
        {
          name: 'Button',
          type: 'INSTANCE',
          component: 'Button',
          props: { label: 'Search' },
          children: [{ name: 'ic_search', type: 'INSTANCE' }],
        },
      ],
    });
    const btn = tree?.children?.[0];
    expect(btn).toMatchObject({
      kind: 'component',
      component: 'Button',
      props: { label: 'Search', icon: 'ic_search' },
    });
    // Leaf component: internal children are dropped.
    expect((btn as Extract<RefinedNode, { kind: 'component' }>).children).toBeUndefined();
  });

  it('drops device-chrome frames (status bar)', () => {
    const { tree } = refine({
      name: 'root',
      type: 'FRAME',
      children: [
        { name: 'Status Bar', type: 'INSTANCE', children: [{ name: 'Levels', type: 'FRAME' }] },
        { name: 'Body', type: 'TEXT', chars: 'kept' },
      ],
    });
    expect(tree?.children).toHaveLength(1);
    expect(tree?.children?.[0]).toMatchObject({ component: 'Text', text: 'kept' });
  });

  it('collects Image nodes as downloadable assets (icons never)', () => {
    const { tree, images } = refine({
      name: 'root',
      type: 'FRAME',
      children: [
        { id: '1:1', name: 'Image', type: 'INSTANCE', component: 'Image', props: { altText: 'Hero' } },
        { id: '1:2', name: 'Icon', type: 'INSTANCE', component: 'Icon', children: [{ name: 'ic_home', type: 'FRAME' }] },
      ],
    });
    expect(images).toEqual([{ id: '1:1', component: 'Image', alt: 'Hero' }]);
    const img = tree?.children?.[0] as Extract<RefinedNode, { kind: 'component' }>;
    expect(img.assetId).toBe('1:1');
  });

  it('turns a surface-override FRAME into a surface node, dropping empty ones', () => {
    const withContent = refine({
      name: 'root',
      type: 'FRAME',
      children: [
        {
          name: 'Card area',
          type: 'FRAME',
          modeOverrides: { surface: 'subtle' },
          children: [{ name: 't', type: 'TEXT', chars: 'inside' }],
        },
        { name: 'Empty area', type: 'FRAME', modeOverrides: { surface: 'bold' }, children: [] },
      ],
    });
    expect(withContent.tree?.children).toHaveLength(1);
    expect(withContent.tree?.children?.[0]).toMatchObject({ kind: 'surface', mode: 'subtle' });
  });

  it('converts auto-layout to token-based LayoutSpec', () => {
    const { tree } = refine({
      name: 'root',
      type: 'FRAME',
      layout: {
        mode: 'HORIZONTAL',
        itemSpacing: { px: 24 },
        paddingLeft: { token: 'dimensions/grid/margin', px: 16 },
        primaryAxisAlignItems: 'SPACE_BETWEEN',
        counterAxisAlignItems: 'CENTER',
      },
      children: [{ name: 't', type: 'TEXT', chars: 'x' }],
    });
    expect(tree?.layout).toMatchObject({
      direction: 'row',
      gap: '6',
      paddingLeft: 'dimensions/grid/margin',
      justify: 'between',
      align: 'center',
    });
  });

  it('carries absolute positioning + constraints through refine', () => {
    const { tree } = refine({
      name: 'root',
      type: 'FRAME',
      children: [
        {
          name: 'Pinned',
          type: 'FRAME',
          layout: {
            mode: 'NONE',
            absolute: true,
            constraints: { horizontal: 'MIN', vertical: 'MAX' },
            absoluteBox: { x: 0, y: 100, w: 50, h: 20 },
          },
          children: [{ name: 't', type: 'TEXT', chars: 'overlay' }],
        },
      ],
    });
    const pinned = tree?.children?.[0];
    expect(pinned?.layout).toMatchObject({
      absolute: true,
      constraints: { horizontal: 'MIN', vertical: 'MAX' },
    });
  });
});

describe('applyImageSources', () => {
  it('backfills props.src from the id map and clears assetId', () => {
    const { tree } = refine({
      name: 'root',
      type: 'FRAME',
      children: [{ id: '9:9', name: 'Image', type: 'INSTANCE', component: 'Image' }],
    });
    applyImageSources(tree, new Map([['9:9', 'assets/images/test/hero.png']]));
    const img = tree?.children?.[0] as Extract<RefinedNode, { kind: 'component' }>;
    expect(img.props?.src).toBe('assets/images/test/hero.png');
    expect(img.assetId).toBeUndefined();
  });

  it('leaves nodes without a match untouched', () => {
    const { tree } = refine({
      name: 'root',
      type: 'FRAME',
      children: [{ id: '9:9', name: 'Image', type: 'INSTANCE', component: 'Image' }],
    });
    applyImageSources(tree, new Map());
    const img = tree?.children?.[0] as Extract<RefinedNode, { kind: 'component' }>;
    expect(img.props?.src).toBeUndefined();
    expect(img.assetId).toBe('9:9');
  });
});
