/**
 * register.mjs — entrypoint for `tsx --import ./cdn-release-full-pipeline/build/loaders/register.mjs`.
 *
 * Registers `css-stub.mjs` as a Node loader hook so any subsequent
 * `import './*.module.css'` resolves to an empty module instead of failing
 * with `Unknown file extension ".css"`.
 */

import { register } from 'node:module';

register('./css-stub.mjs', import.meta.url);
