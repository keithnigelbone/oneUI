import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '../..');
const KB_RN_DIST = join(REPO_ROOT, 'kb-rn/dist');

function buildCodeConnect() {
  const catalogPath = join(KB_RN_DIST, 'design-catalog.json');
  
  if (!existsSync(catalogPath)) {
    console.error(`Catalog not found at ${catalogPath}`);
    process.exit(1);
  }

  const catalog = JSON.parse(readFileSync(catalogPath, 'utf8'));
  const mappings: any[] = [];

  catalog.catalog.forEach((item: any) => {
    if (!item.figma || !item.figma.componentKey) return;
    
    // Create the Code Connect mapping structure
    mappings.push({
      figmaNode: `https://figma.com/design/node?node-id=${item.figma.componentKey}`,
      componentKey: item.figma.componentKey,
      importPath: item.importPath,
      name: item.jdsName,
      props: item.designProps || {},
      status: item.status
    });
  });

  const outPath = join(KB_RN_DIST, 'code-connect-rn.json');
  writeFileSync(outPath, JSON.stringify({ codeConnect: mappings }, null, 2));
  console.log(`Wrote Code Connect mappings to ${outPath} (${mappings.length} components)`);
}

buildCodeConnect();
