import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '../..');

// Default path if dist/brands is missing
const FALLBACK_BRAND_DATA = join(REPO_ROOT, 'ui-native/src/brand-data/defaultJioBrandData.json');
const DIST_DIR = join(REPO_ROOT, 'kb-core/dist');

function buildFigmaVariables() {
  let brandData: any;
  const targetSlug = 'jio-default';

  const brandSnapshotFile = join(DIST_DIR, `brands/${targetSlug}.json`);
  
  if (existsSync(brandSnapshotFile)) {
    console.log(`Reading from snapshot: ${brandSnapshotFile}`);
    brandData = JSON.parse(readFileSync(brandSnapshotFile, 'utf8'));
  } else if (existsSync(FALLBACK_BRAND_DATA)) {
    console.log(`Reading from fallback: ${FALLBACK_BRAND_DATA}`);
    brandData = JSON.parse(readFileSync(FALLBACK_BRAND_DATA, 'utf8'));
  } else {
    console.error('No brand data found!');
    process.exit(1);
  }

  // A basic projection into Figma's Variables format
  const figmaPayload = {
    version: "1.0",
    collections: [
      {
        name: "Brand Colors",
        modes: [
          { name: "Light", modeId: "mode_light" },
          { name: "Dark", modeId: "mode_dark" }
        ],
        variables: [] as any[]
      }
    ]
  };

  const foundation = brandData.foundation || brandData;
  let colorScales: any[] = [];

  function findScales(obj: any) {
    if (!obj) return;
    if (Array.isArray(obj)) {
      if (obj.length > 0 && obj[0].steps && obj[0].name && obj[0].baseStep) {
        colorScales = colorScales.concat(obj);
      } else {
        obj.forEach(findScales);
      }
    } else if (typeof obj === 'object') {
      Object.values(obj).forEach(findScales);
    }
  }

  findScales(foundation);

  colorScales.forEach((scale: any) => {
    const scaleName = scale.name;
    scale.steps.forEach((step: any) => {
      figmaPayload.collections[0].variables.push({
        name: `${scaleName}/${step.step}`,
        type: "COLOR",
        valuesByMode: {
          mode_light: step.oklch, // In a real implementation we would convert OKLCH to RGBA here
          mode_dark: step.oklch
        }
      });
    });
  });

  const outPath = join(DIST_DIR, `figma-variables-${targetSlug}.json`);
  writeFileSync(outPath, JSON.stringify(figmaPayload, null, 2));
  console.log(`Wrote Figma Variables to ${outPath}`);
}

buildFigmaVariables();
