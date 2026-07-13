import { copyFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const src = join(__dirname, '../templates/shared/DemoScreen.tsx');

for (const dest of [
  '../templates/bare/src/components/DemoScreen.tsx',
  '../templates/default/src/components/DemoScreen.tsx',
]) {
  const target = join(__dirname, dest);
  mkdirSync(dirname(target), { recursive: true });
  copyFileSync(src, target);
  console.log('copied →', dest);
}
