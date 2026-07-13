import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { ALL_COMPONENTS } from '../src/index';

describe('design-catalog.json', () => {
  it('should exist and parse correctly', () => {
    const catalogPath = join(__dirname, '..', 'dist', 'design-catalog.json');
    expect(existsSync(catalogPath)).toBe(true);

    const content = JSON.parse(readFileSync(catalogPath, 'utf8'));
    expect(content).toBeDefined();
    expect(content.kbVersion).toBeDefined();
    expect(content.sdk).toBe('@jds/kb-rn');
    expect(content.rules).toBeDefined();
    expect(content.rules.attentionToSurface).toBeDefined();
    expect(content.rules.surfaceModes).toBeDefined();
    expect(Array.isArray(content.catalog)).toBe(true);

    const catalog = content.catalog;
    
    // Should have same number of components as exported by src/index.ts
    expect(catalog.length).toBe(ALL_COMPONENTS.length);

    // Validate structure of a catalog entry
    for (const item of catalog) {
      expect(item.jdsName).toBeDefined();
      expect(item.importPath).toBeDefined();
      expect(typeof item.importPath).toBe('string');
      expect(item.importPath.length).toBeGreaterThan(0);
      
      // If it's a figma-backed component, componentKey should not be empty
      if (item.figma) {
        expect(typeof item.figma.componentKey).toBe('string');
        expect(item.figma.componentKey.length).toBeGreaterThan(0);
      }
    }
  });
});
