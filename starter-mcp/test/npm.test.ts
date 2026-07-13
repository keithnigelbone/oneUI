import { describe, it, expect } from 'vitest';
import { buildUpdateCommands, isValidPackageName, compareSemver } from '../src/lib/npm.js';

describe('isValidPackageName', () => {
  it('accepts scoped and bare npm names', () => {
    expect(isValidPackageName('@jds4/oneui-react')).toBe(true);
    expect(isValidPackageName('react')).toBe(true);
    expect(isValidPackageName('lodash.merge')).toBe(true);
  });

  it('rejects spawn-unsafe or malformed input', () => {
    expect(isValidPackageName('pkg; rm -rf /')).toBe(false);
    expect(isValidPackageName('pkg --registry=https://evil.example')).toBe(false);
    expect(isValidPackageName('pkg name with spaces')).toBe(false);
    expect(isValidPackageName('UPPERCASE')).toBe(false);
    expect(isValidPackageName('')).toBe(false);
  });
});

describe('buildUpdateCommands', () => {
  // A directory with no lockfile → detectPackageManager defaults to npm.
  const root = '/nonexistent-project-root';

  it('returns argv arrays, not strings to re-split', () => {
    const [cmd] = buildUpdateCommands(root, ['@jds4/oneui-react@0.1.0-alpha.9', '@jds4/oneui-icons-jio@0.1.0-alpha.9']);
    expect(cmd.bin).toBe('npm');
    expect(cmd.args).toEqual(['install', '--save', '@jds4/oneui-react@0.1.0-alpha.9', '@jds4/oneui-icons-jio@0.1.0-alpha.9']);
    expect(cmd.display).toContain('npm install --save');
  });

  it('returns [] for an empty spec list', () => {
    expect(buildUpdateCommands(root, [])).toEqual([]);
  });
});

describe('compareSemver', () => {
  it('orders releases above prereleases of the same core', () => {
    expect(compareSemver('0.1.0', '0.1.0-alpha.9')).toBe(1);
    expect(compareSemver('0.1.0-alpha.2', '0.1.0-alpha.9')).toBe(-1);
    expect(compareSemver('1.2.3', '1.2.3')).toBe(0);
  });

  it('compares numeric prerelease identifiers numerically (alpha.10 > alpha.9)', () => {
    // Regression: a lexicographic compare ranks "alpha.10" below "alpha.9",
    // which would pin every install/update to alpha.9 once alpha.10 ships.
    expect(compareSemver('0.1.0-alpha.10', '0.1.0-alpha.9')).toBe(1);
    expect(compareSemver('0.1.0-alpha.9', '0.1.0-alpha.10')).toBe(-1);
    expect(compareSemver('0.1.0-beta.1', '0.1.0-alpha.10')).toBe(1);
  });

  it('orders core versions numerically', () => {
    expect(compareSemver('0.10.0', '0.9.0')).toBe(1);
    expect(compareSemver('1.0.0', '0.99.99')).toBe(1);
  });
});
