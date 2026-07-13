import { describe, it, expect } from 'vitest';
import {
  buildNewProjectNpmrc,
  REDACTED_PASSWORD,
  STAGED_NPMRC_NAME,
  encodePat,
  isValidProjectName,
} from '../src/lib/nativeCli.js';

describe('PAT handling (H-1: never echo the token)', () => {
  it('the redacted preview contains the sentinel, not a real token', () => {
    const preview = buildNewProjectNpmrc(REDACTED_PASSWORD);
    expect(preview).toContain(REDACTED_PASSWORD);
    // Sanity: a real token would appear verbatim in the same builder — proving
    // the preview path (which the tool uses for its visible output) differs.
    const withSecret = buildNewProjectNpmrc('c2VjcmV0LXRva2Vu');
    expect(withSecret).toContain('c2VjcmV0LXRva2Vu');
    expect(preview).not.toContain('c2VjcmV0LXRva2Vu');
  });

  it('the staged auth file is NOT named .npmrc (so npm ignores it until moved)', () => {
    expect(STAGED_NPMRC_NAME).not.toBe('.npmrc');
    expect(STAGED_NPMRC_NAME.endsWith('npmrc')).toBe(true);
  });

  it('encodePat base64-encodes raw tokens and passes base64 through', () => {
    expect(encodePat('hello', 'raw')).toBe(Buffer.from('hello', 'utf8').toString('base64'));
    expect(encodePat('YWxyZWFkeQ==', 'base64')).toBe('YWxyZWFkeQ==');
  });
});

describe('isValidProjectName', () => {
  it('accepts normal names, rejects path/space injection', () => {
    expect(isValidProjectName('my-app')).toBe(true);
    expect(isValidProjectName('../evil')).toBe(false);
    expect(isValidProjectName('has space')).toBe(false);
  });
});
