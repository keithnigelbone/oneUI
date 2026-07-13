import { describe, it, expect } from 'vitest';
import { isAllowedConnection } from '../src/lib/figmaBridgeServer.js';

function req(remoteAddress: string, origin?: string) {
  return {
    socket: { remoteAddress } as never,
    headers: origin === undefined ? {} : { origin },
  };
}

describe('isAllowedConnection (own-bridge WS)', () => {
  it('accepts loopback with no Origin (the Figma plugin iframe)', () => {
    expect(isAllowedConnection(req('127.0.0.1')).ok).toBe(true);
    expect(isAllowedConnection(req('::1')).ok).toBe(true);
    expect(isAllowedConnection(req('::ffff:127.0.0.1')).ok).toBe(true);
  });

  it('accepts a "null" (non-http) Origin', () => {
    expect(isAllowedConnection(req('127.0.0.1', 'null')).ok).toBe(true);
  });

  it('accepts figma.com origins', () => {
    expect(isAllowedConnection(req('127.0.0.1', 'https://www.figma.com')).ok).toBe(true);
    expect(isAllowedConnection(req('127.0.0.1', 'https://figma.com')).ok).toBe(true);
  });

  it('rejects non-loopback remote addresses', () => {
    expect(isAllowedConnection(req('192.168.1.50')).ok).toBe(false);
    expect(isAllowedConnection(req('10.0.0.7', 'https://www.figma.com')).ok).toBe(false);
  });

  it('rejects browser-page origins (drive-by localhost WebSocket)', () => {
    expect(isAllowedConnection(req('127.0.0.1', 'https://evil.example')).ok).toBe(false);
    expect(isAllowedConnection(req('127.0.0.1', 'http://localhost:3000')).ok).toBe(false);
    // Suffix spoof: notfigma.com must not pass the .figma.com check.
    expect(isAllowedConnection(req('127.0.0.1', 'https://notfigma.com')).ok).toBe(false);
  });
});
