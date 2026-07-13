import { describe, expect, test } from 'vitest';
import { buildKbGraph, type GraphInputMeta } from '../buildGraph';

const metas: GraphInputMeta[] = [
  {
    name: 'Card',
    status: 'stable',
    importPath: '@oneui/ui-native/components/Card',
    tags: ['container'],
    composition: {
      childKind: 'fixed-slots',
      slots: {
        header: { accepts: ['Text', 'View', '*'], cardinality: 'optional' },
        media: { accepts: ['Image'], cardinality: 'optional' },
      },
    },
    tokens: { surface: ['subtle', 'bold'], color: ['primary'] },
    figma: { componentKey: 'jds-card-v4', variantProperties: { Component: 'Card' } },
  },
  {
    name: 'Image',
    status: 'stable',
    importPath: '@oneui/ui-native/components/Image',
    tokens: { surface: ['minimal'] },
    figma: { componentKey: 'jds-image-v4' },
  },
  {
    name: 'BottomNav',
    status: 'stable',
    composition: { childKind: 'variadic', variadic: { accepts: ['TabBarItem'], min: 2, max: 5 } },
  },
  { name: 'TabBarItem', status: 'stable' },
  { name: 'Text', status: 'stable' },
];

const graph = buildKbGraph(metas, { sdk: 'rn', schemaVersion: '5.0.0', kbVersion: '12.0.0-wip.0' });

const edge = (from: string, to: string, kind: string) =>
  graph.edges.find((e) => e.from === from && e.to === to && e.kind === kind);

describe('buildKbGraph', () => {
  test('emits a component node per meta', () => {
    const componentNodes = graph.nodes.filter((n) => n.kind === 'component').map((n) => n.name);
    expect(componentNodes.sort()).toEqual(['BottomNav', 'Card', 'Image', 'TabBarItem', 'Text']);
  });

  test('COMPOSES edges from fixed-slots accepts (component refs only)', () => {
    expect(edge('rn:component:Card', 'rn:component:Text', 'COMPOSES')).toMatchObject({ slot: 'header', via: 'slot' });
    expect(edge('rn:component:Card', 'rn:component:Image', 'COMPOSES')).toMatchObject({ slot: 'media' });
  });

  test('wildcard (*) is recorded as composesAny, not an edge to "*"', () => {
    const card = graph.nodes.find((n) => n.id === 'rn:component:Card');
    expect(card?.composesAny).toBe(true);
    expect(graph.edges.some((e) => e.to.endsWith(':*'))).toBe(false);
  });

  test('variadic accepts → COMPOSES with min/max', () => {
    expect(edge('rn:component:BottomNav', 'rn:component:TabBarItem', 'COMPOSES')).toMatchObject({
      via: 'variadic',
      min: 2,
      max: 5,
    });
  });

  test('USES_TOKEN edges + token nodes', () => {
    expect(edge('rn:component:Card', 'token:surface:bold', 'USES_TOKEN')).toBeDefined();
    expect(graph.nodes.find((n) => n.id === 'token:surface:bold')).toMatchObject({ kind: 'token', family: 'surface' });
  });

  test('FIGMA_KEY edge points design → component', () => {
    expect(edge('figma:jds-card-v4', 'rn:component:Card', 'FIGMA_KEY')).toMatchObject({
      variantProperties: { Component: 'Card' },
    });
  });

  test('MIRRORS_SOURCE edge → import path', () => {
    expect(edge('rn:component:Card', 'source:@oneui/ui-native/components/Card', 'MIRRORS_SOURCE')).toBeDefined();
  });

  test('stats + deterministic timestamp', () => {
    expect(graph.stats.nodes).toBe(graph.nodes.length);
    expect(graph.stats.edges).toBe(graph.edges.length);
    expect(graph.stats.byEdgeKind.COMPOSES).toBeGreaterThanOrEqual(3);
    expect(graph.generatedAt).toBe('1970-01-01T00:00:00.000Z');
  });
});
