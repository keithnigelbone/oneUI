import { existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

async function main() {
  const cwd = process.cwd();
  const distDir = join(cwd, 'dist');
  
  if (!existsSync(distDir)) {
    console.error('[@jds/kb-core/build-design-catalog] dist/ not found. Run `tsup` first.');
    process.exit(1);
  }

  // Dynamically load the host package's compiled output
  // We use tsx / esm, so we can import the js file
  const { ALL_COMPONENTS } = await import(join(distDir, 'index.js'));
  
  // Load core rules from @jds/kb-core (this resolves through node_modules or workspace)
  const { 
    ATTENTION_TO_SURFACE, 
    KB_VERSION, 
    SURFACE_MODES, 
    SHAPE_SCALE,
    SPACING_SCALE,
    COLOR_ROLES
  } = await import('@jds/kb-core/dist/index.js');
  
  const catalog = ALL_COMPONENTS.map((c: any) => ({
    jdsName: c.name,
    status: c.status,
    importPath: c.importPath,
    figma: c.figma ? { componentKey: c.figma.componentKey } : undefined,
    variantOptions: c.propsSchema?.properties ? Object.keys(c.propsSchema.properties) : [],
    designProps: c.renderHints?.designProps,
    tokensConsumed: c.tokens,
    composition: c.composition ? { childKind: c.composition.childKind, slots: c.composition.slots } : undefined,
    a11y: c.a11y
  }));

  const payload = {
    kbVersion: KB_VERSION,
    sdk: process.env.npm_package_name || 'unknown',
    generatedAt: new Date().toISOString(),
    rules: {
      attentionToSurface: ATTENTION_TO_SURFACE,
      attentionPyramid: { None: 60, Low: 25, Medium: 10, High: 5 },
      surfaceModes: SURFACE_MODES,
      shapeScale: SHAPE_SCALE,
      spacingScale: SPACING_SCALE,
      colorRoles: COLOR_ROLES
    },
    catalog
  };

  const outPath = join(distDir, 'design-catalog.json');
  writeFileSync(outPath, JSON.stringify(payload, null, 2) + '\n', 'utf8');
  
  console.log(`[build-design-catalog] Wrote ${catalog.length} components to ${outPath}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
