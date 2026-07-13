#!/usr/bin/env node
/**
 * Quality Gate: Token Resolution Validation
 *
 * Verifies that all tokens in CSS files resolve to valid values
 * and are not broken references
 *
 * Usage: pnpm validate:tokens
 */

import { readFileSync } from 'fs';
import { globSync } from 'glob';

function validateTokenResolution(): number {
  const cssFiles = globSync('src/css/**/*.css');
  const tokenRefs = new Set<string>();
  const definedTokens = new Set<string>();
  let errors = 0;

  // Collect all defined tokens
  for (const file of cssFiles) {
    const content = readFileSync(file, 'utf-8');
    const defines = content.match(/--[\w-]+:/g) || [];
    defines.forEach((def) => {
      const name = def.replace(':', '').trim();
      definedTokens.add(name);
    });
  }

  // Collect all token references
  for (const file of cssFiles) {
    const content = readFileSync(file, 'utf-8');
    const refs = content.match(/var\(--[\w-]+\)/g) || [];
    refs.forEach((ref) => {
      const name = ref.match(/--[\w-]+/)?.[0];
      if (name) tokenRefs.add(name);
    });
  }

  // Check all references resolve
  for (const ref of tokenRefs) {
    if (!definedTokens.has(ref)) {
      console.error(`❌ Unresolved token reference: ${ref}`);
      errors++;
    }
  }

  if (errors === 0) {
    console.log('✅ All tokens resolve successfully');
    console.log(`   Defined: ${definedTokens.size} tokens`);
    console.log(`   Referenced: ${tokenRefs.size} tokens`);
  } else {
    console.error(`\n❌ Found ${errors} unresolved token references`);
    process.exit(1);
  }

  return errors;
}

validateTokenResolution();
