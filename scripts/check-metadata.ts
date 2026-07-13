#!/usr/bin/env node
/**
 * check-metadata.ts
 *
 * Quality gate: detect drift between a component's hand-authored `ComponentMeta`
 * (*.meta.ts) and the TypeScript props interface that defines its public API.
 *
 * Drift classes caught:
 *   1. meta.props[] lists a prop name that does not exist in the Props interface
 *   2. meta.slots[] lists a slot name that does not exist in the Props interface
 *   3. the Props interface exposes a ReactNode-shaped prop whose name matches
 *      a slot-like pattern (`start`, `end`, `leading`, `trailing`, `*Slot`)
 *      but is missing from meta.slots[]
 *   4. a prop or slot name uses the deprecated `*Slot` suffix (RFC 0001 requires
 *      the bare canonical names `start` / `end` / `leading` / `trailing`).
 *
 * Exits 1 if any drift is found — wire into CI to prevent future regressions.
 *
 * Usage: pnpm check:metadata
 */

import { dirname, resolve, basename, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Project, SyntaxKind, type InterfaceDeclaration, type Type, type ObjectLiteralExpression } from 'ts-morph';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = resolve(__dirname, '..');
const COMPONENTS_GLOB = 'packages/ui/src/components/**/*.meta.ts';

const SLOT_NAME_PATTERNS = [
  /^start$/,
  /^end$/,
  /^leading$/,
  /^trailing$/,
  /Slot$/i,
];

interface Drift {
  component: string;
  metaPath: string;
  kind:
    | 'prop-not-in-type'
    | 'slot-not-in-type'
    | 'reactnode-prop-not-in-slots'
    | 'deprecated-slot-suffix';
  detail: string;
}

const DEPRECATED_SLOT_SUFFIX = /Slot$/;

function isSlotLikeName(name: string): boolean {
  return SLOT_NAME_PATTERNS.some((re) => re.test(name));
}

function isDeprecatedSlotName(name: string): boolean {
  return DEPRECATED_SLOT_SUFFIX.test(name);
}

function isReactNodeLike(type: Type): boolean {
  const text = type.getText();
  // ts-morph prints ReactNode as the literal "ReactNode" when imported under that name,
  // or as the expanded union when resolved. Match common shapes.
  return /ReactNode/.test(text) || /ReactElement/.test(text);
}

/** Pull { name, slots } from the exported ComponentMeta literal in a *.meta.ts file. */
function readMetaLiteral(metaPath: string, project: Project): {
  componentName: string;
  propNames: string[];
  slotNames: string[];
} | null {
  const sf = project.addSourceFileAtPathIfExists(metaPath);
  if (!sf) return null;

  let metaExpr: ObjectLiteralExpression | undefined;
  let componentName = basename(metaPath).replace(/\.meta\.ts$/, '');

  for (const decl of sf.getVariableDeclarations()) {
    const init = decl.getInitializer();
    if (!init) continue;
    if (init.getKind() !== SyntaxKind.ObjectLiteralExpression) continue;
    const obj = init as ObjectLiteralExpression;
    const nameProp = obj.getProperty('name');
    if (!nameProp) continue;
    metaExpr = obj;
    // Try to read the name literal
    if (nameProp.getKind() === SyntaxKind.PropertyAssignment) {
      const assign = nameProp.asKind(SyntaxKind.PropertyAssignment);
      const initializer = assign?.getInitializer();
      if (initializer?.getKind() === SyntaxKind.StringLiteral) {
        componentName = initializer.asKind(SyntaxKind.StringLiteral)!.getLiteralText();
      }
    }
    break;
  }

  if (!metaExpr) return null;

  const readArrayOfNames = (key: 'props' | 'slots'): string[] => {
    const prop = metaExpr!.getProperty(key);
    if (!prop || prop.getKind() !== SyntaxKind.PropertyAssignment) return [];
    const init = prop.asKind(SyntaxKind.PropertyAssignment)!.getInitializer();
    if (!init || init.getKind() !== SyntaxKind.ArrayLiteralExpression) return [];
    const arr = init.asKind(SyntaxKind.ArrayLiteralExpression)!;
    const names: string[] = [];
    for (const el of arr.getElements()) {
      if (el.getKind() !== SyntaxKind.ObjectLiteralExpression) continue;
      const entry = el.asKind(SyntaxKind.ObjectLiteralExpression)!;
      const nameField = entry.getProperty('name');
      if (!nameField || nameField.getKind() !== SyntaxKind.PropertyAssignment) continue;
      const n = nameField.asKind(SyntaxKind.PropertyAssignment)!.getInitializer();
      if (n?.getKind() === SyntaxKind.StringLiteral) {
        names.push(n.asKind(SyntaxKind.StringLiteral)!.getLiteralText());
      }
    }
    return names;
  };

  return {
    componentName,
    propNames: readArrayOfNames('props'),
    slotNames: readArrayOfNames('slots'),
  };
}

/**
 * Locate all `*Props` interfaces belonging to a component family.
 * Compound components (e.g. Tabs / TabGroup / TabItem / TabPanel / TabList)
 * expose props across several interfaces — the meta describes the whole
 * family, so the drift check must union them.
 */
function findPropsInterfaces(
  project: Project,
  metaPath: string,
  componentName: string,
): InterfaceDeclaration[] {
  const dir = dirname(metaPath);
  const candidates = [
    resolve(dir, `${componentName}.shared.ts`),
    resolve(dir, `${componentName}.shared.tsx`),
    resolve(dir, `${componentName}.tsx`),
  ];
  const interfaces: InterfaceDeclaration[] = [];
  for (const candidate of candidates) {
    const sf = project.addSourceFileAtPathIfExists(candidate);
    if (!sf) continue;
    for (const iface of sf.getInterfaces()) {
      if (iface.getName().endsWith('Props')) {
        interfaces.push(iface);
      }
    }
    if (interfaces.length > 0) break;
  }
  return interfaces;
}

/** Union properties from every *Props interface in the family. Later wins. */
function collectFamilyProps(interfaces: InterfaceDeclaration[]): Map<string, Type> {
  const map = new Map<string, Type>();
  for (const iface of interfaces) {
    const type = iface.getType();
    for (const sym of type.getProperties()) {
      const decl = sym.getDeclarations()[0];
      const t = decl ? sym.getTypeAtLocation(decl) : type;
      if (!map.has(sym.getName())) {
        map.set(sym.getName(), t);
      }
    }
  }
  return map;
}

function main(): number {
  const project = new Project({
    tsConfigFilePath: resolve(REPO_ROOT, 'tsconfig.json'),
    skipAddingFilesFromTsConfig: true,
  });

  // Glob meta files directly — tsconfig include is broad, we want a focused sweep.
  const glob = resolve(REPO_ROOT, COMPONENTS_GLOB);
  const metaFiles = project.addSourceFilesAtPaths(glob).map((sf) => sf.getFilePath());

  if (metaFiles.length === 0) {
    console.error(`check-metadata: no *.meta.ts files found under ${COMPONENTS_GLOB}`);
    return 1;
  }

  const drifts: Drift[] = [];

  for (const metaPath of metaFiles) {
    const meta = readMetaLiteral(metaPath, project);
    if (!meta) continue;

    const interfaces = findPropsInterfaces(project, metaPath, meta.componentName);
    if (interfaces.length === 0) {
      // No Props interface located — skip quietly. Some meta files belong to
      // components whose Props live in an unusual shape (e.g., platform-specific wrappers).
      continue;
    }

    const tsProps = collectFamilyProps(interfaces);
    const tsPropNames = new Set(tsProps.keys());

    // 1. meta.props entries must exist in the TS interface
    for (const name of meta.propNames) {
      if (!tsPropNames.has(name)) {
        drifts.push({
          component: meta.componentName,
          metaPath,
          kind: 'prop-not-in-type',
          detail: `meta.props lists "${name}" but ${meta.componentName}Props does not`,
        });
      }
    }

    // 2. meta.slots entries must exist in the TS interface
    for (const name of meta.slotNames) {
      if (!tsPropNames.has(name)) {
        drifts.push({
          component: meta.componentName,
          metaPath,
          kind: 'slot-not-in-type',
          detail: `meta.slots lists "${name}" but ${meta.componentName}Props does not`,
        });
      }
    }

    // 3. ReactNode props that look like slots must appear in meta.slots
    const metaSlotSet = new Set(meta.slotNames);
    for (const [name, type] of tsProps) {
      if (!isSlotLikeName(name)) continue;
      if (!isReactNodeLike(type)) continue;
      if (metaSlotSet.has(name)) continue;
      drifts.push({
        component: meta.componentName,
        metaPath,
        kind: 'reactnode-prop-not-in-slots',
        detail: `${meta.componentName}Props exposes ReactNode slot "${name}" but meta.slots does not list it`,
      });
    }

    // 4. RFC 0001 — reject the legacy `*Slot` suffix in props and meta entries.
    //    The canonical names are bare: `start`, `end`, `leading`, `trailing`.
    for (const [name] of tsProps) {
      if (!isDeprecatedSlotName(name)) continue;
      drifts.push({
        component: meta.componentName,
        metaPath,
        kind: 'deprecated-slot-suffix',
        detail: `${meta.componentName}Props uses legacy "${name}" — rename to the bare canonical form (RFC 0001). Remove the "Slot" suffix.`,
      });
    }
    for (const name of meta.slotNames) {
      if (!isDeprecatedSlotName(name)) continue;
      drifts.push({
        component: meta.componentName,
        metaPath,
        kind: 'deprecated-slot-suffix',
        detail: `meta.slots lists legacy "${name}" — rename to the bare canonical form (RFC 0001). Remove the "Slot" suffix.`,
      });
    }
    for (const name of meta.propNames) {
      if (!isDeprecatedSlotName(name)) continue;
      drifts.push({
        component: meta.componentName,
        metaPath,
        kind: 'deprecated-slot-suffix',
        detail: `meta.props lists legacy "${name}" — rename to the bare canonical form (RFC 0001). Remove the "Slot" suffix.`,
      });
    }
  }

  if (drifts.length === 0) {
    console.log(`check-metadata: OK — scanned ${metaFiles.length} meta file(s), no drift found.`);
    return 0;
  }

  console.error(`check-metadata: FAIL — ${drifts.length} drift(s) found across ${metaFiles.length} meta file(s).\n`);
  const byComponent = new Map<string, Drift[]>();
  for (const d of drifts) {
    const list = byComponent.get(d.component) ?? [];
    list.push(d);
    byComponent.set(d.component, list);
  }
  for (const [component, list] of byComponent) {
    const rel = list[0].metaPath.split(`${sep}packages${sep}`).pop();
    console.error(`  ✗ ${component}  (packages/${rel})`);
    for (const d of list) {
      console.error(`      [${d.kind}]  ${d.detail}`);
    }
  }
  console.error('');
  console.error('Fix by updating *.meta.ts to match the public Props interface, or by changing the interface.');
  return 1;
}

process.exit(main());
