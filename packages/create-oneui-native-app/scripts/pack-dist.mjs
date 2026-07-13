/**
 * Pack the built CLI + templates into a distributable tgz.
 * Output lands in <repo-root>/dist/packages/create-oneui-native-app/.
 */
import { execSync } from 'node:child_process';
import { mkdirSync, copyFileSync, readdirSync } from 'node:fs';
import { resolve, join } from 'node:path';

const pkgRoot = resolve(import.meta.dirname, '..');
const repoRoot = resolve(pkgRoot, '../..');
const outDir = join(repoRoot, 'dist', 'packages', 'create-oneui-native-app');

mkdirSync(outDir, { recursive: true });

execSync('npm pack --pack-destination .', { cwd: pkgRoot, stdio: 'inherit' });

const tgz = readdirSync(pkgRoot).find((f) => f.endsWith('.tgz'));
if (!tgz) throw new Error('npm pack did not produce a .tgz');

copyFileSync(join(pkgRoot, tgz), join(outDir, tgz));
execSync(`rm ${tgz}`, { cwd: pkgRoot });

console.log(`\n✓  Packed → dist/packages/create-oneui-native-app/${tgz}`);
