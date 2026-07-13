import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PKG_ROOT = path.resolve(__dirname, '..');
const REPO_ROOT = path.resolve(PKG_ROOT, '../..');
const OUT_DIR   = path.resolve(REPO_ROOT, 'dist', 'packages', 'ui-native');
const KB_RN_DIST = path.resolve(REPO_ROOT, 'packages', 'kb-rn', 'dist');

const componentsJsonPath = path.join(KB_RN_DIST, 'components.json');

if (!fs.existsSync(componentsJsonPath)) {
  console.error('components.json not found, skipping KB markdown generation.');
  process.exit(0);
}

const allComponents = JSON.parse(fs.readFileSync(componentsJsonPath, 'utf8'));

// `planned` components are described in the KB but NOT exported from the public
// package — emitting an importable entry for them would tell AI agents to write
// imports that fail at runtime. Partition them out of the importable surface and
// list them separately as "not yet available".
const components = allComponents.filter((c) => c.status !== 'planned');
const planned = allComponents.filter((c) => c.status === 'planned');

let md = `# OneUI React Native - AI Knowledge Base\n\n`;
md += `> **For AI Assistants**: This document provides the unified truth of all React Native components in the OneUI design system. Use it to understand component boundaries, supported variants, appearances, surfaces, and typography tokens.\n`;
md += `> Only the components documented below are importable from \`@oneui/ui-native\`. Do not emit imports for anything not listed here.\n\n`;

for (const comp of components) {
  md += `## ${comp.name}\n`;
  md += `**Import**: \`import { ${comp.name} } from '@oneui/ui-native'\`\n\n`;
  md += `${comp.description || ''}\n\n`;
  
  if (comp.propsSchema && comp.propsSchema.properties) {
    md += `### Props\n`;
    for (const [propName, propDef] of Object.entries(comp.propsSchema.properties)) {
      if (propName === 'style' || propName === 'children') continue;
      let typeDesc = propDef.type || '';
      if (propDef.enum) typeDesc = propDef.enum.map(e => `"${e}"`).join(' | ');
      let desc = propDef.description || '';
      if (propDef.default !== undefined) desc += ` (Default: ${propDef.default})`;
      md += `- \`${propName}\`${typeDesc ? `: ${typeDesc}` : ''} - ${desc}\n`;
    }
    md += `\n`;
  }

  if (comp.tokens) {
    if (comp.tokens.surface && comp.tokens.surface.length > 0) {
      md += `- **Surfaces**: ${comp.tokens.surface.join(', ')}\n`;
    }
    if (comp.tokens.color && comp.tokens.color.length > 0) {
      md += `- **Colors/Roles**: ${comp.tokens.color.join(', ')}\n`;
    }
  }
  md += `\n---\n\n`;
}

if (planned.length > 0) {
  md += `## Planned components (NOT yet available)\n\n`;
  md += `> These are documented for roadmap visibility only. They are **not** exported from \`@oneui/ui-native\`. Do not import them — doing so will fail at runtime.\n\n`;
  for (const comp of planned) {
    md += `- **${comp.name}** — ${comp.description || ''}\n`;
  }
  md += `\n---\n\n`;
}

const docsDir = path.join(OUT_DIR, 'docs');
if (!fs.existsSync(docsDir)) {
  fs.mkdirSync(docsDir, { recursive: true });
}

fs.writeFileSync(path.join(docsDir, 'AI_KNOWLEDGE_BASE.md'), md);
console.log('  ✓  docs/AI_KNOWLEDGE_BASE.md generated from KB metadata');
