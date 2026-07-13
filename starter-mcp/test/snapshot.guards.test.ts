import { describe, it, expect } from 'vitest';
import {
  getSkillReference,
  getComponent,
  getBrandTokens,
  getBrandSpec,
  getSkillIndex,
  getComponentIndex,
  getBrandIndex,
  snapshotAvailable,
} from '../src/lib/snapshot.js';

// These tests run against the committed assets/ snapshot (offline, deterministic).

describe('snapshot availability', () => {
  it('finds the baked snapshot', () => {
    expect(snapshotAvailable()).toBe(true);
    expect(getSkillIndex().length).toBeGreaterThan(0);
    expect(getComponentIndex().length).toBeGreaterThan(0);
    expect(getBrandIndex().length).toBeGreaterThan(0);
  });
});

describe('path-traversal guards', () => {
  it('getSkillReference rejects .. and backslash paths', () => {
    const skill = getSkillIndex()[0]?.name ?? 'oneui';
    expect(getSkillReference(skill, '../../package.json')).toBeNull();
    expect(getSkillReference(skill, '..\\..\\package.json')).toBeNull();
    expect(getSkillReference(skill, '/etc/hosts')).toBeNull();
  });

  it('getSkillReference rejects traversal via the skill name', () => {
    expect(getSkillReference('..', 'package.json')).toBeNull();
    expect(getSkillReference('../..', 'README.md')).toBeNull();
  });

  it('getComponent rejects traversal and separators in slugs', () => {
    expect(getComponent('../manifest')).toBeNull();
    expect(getComponent('foo/bar')).toBeNull();
    expect(getComponent('..', 'native')).toBeNull();
    expect(getComponent('button', '../native')).toBeNull();
  });

  it('getBrandTokens / getBrandSpec reject traversal in slugs', () => {
    expect(getBrandTokens('../manifest')).toBeNull();
    expect(getBrandTokens('a/b')).toBeNull();
    expect(getBrandSpec('../manifest')).toBeNull();
    expect(getBrandSpec('a/b')).toBeNull();
  });
});

describe('happy paths', () => {
  it('returns component JSON for a real slug', () => {
    const first = getComponentIndex()[0];
    expect(first).toBeDefined();
    const comp = getComponent(first.slug);
    expect(comp).not.toBeNull();
    expect(typeof comp).toBe('object');
  });

  it('returns brand tokens and spec for a real brand', () => {
    const brand = getBrandIndex().find((b) => !b.synthetic) ?? getBrandIndex()[0];
    expect(brand).toBeDefined();
    expect(getBrandTokens(brand.slug)).not.toBeNull();
    if (brand.hasSpec) expect(getBrandSpec(brand.slug)).not.toBeNull();
  });
});
