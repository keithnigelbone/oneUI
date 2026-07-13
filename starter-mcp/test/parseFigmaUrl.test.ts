import { describe, it, expect } from 'vitest';
import { parseFigmaUrl } from '../src/tools/figma.js';

describe('parseFigmaUrl', () => {
  it('parses /design/ URLs with a node-id', () => {
    expect(parseFigmaUrl('https://www.figma.com/design/AbC123/My-File?node-id=273-23740')).toEqual({
      fileKey: 'AbC123',
      nodeId: '273:23740',
    });
  });

  it('parses /file/ and /proto/ URL forms', () => {
    expect(parseFigmaUrl('https://www.figma.com/file/Key9/x?node-id=1-2').fileKey).toBe('Key9');
    expect(parseFigmaUrl('https://www.figma.com/proto/Key9/x?node-id=1-2').fileKey).toBe('Key9');
    expect(parseFigmaUrl('https://www.figma.com/board/Key9/x?node-id=1-2').fileKey).toBe('Key9');
  });

  it('converts every dash in the node id back to a colon', () => {
    expect(parseFigmaUrl('https://www.figma.com/design/K/x?node-id=695-313').nodeId).toBe('695:313');
  });

  it('decodes URL-encoded node ids', () => {
    // Figma sometimes emits node-id=695%3A313 (already-colon form, encoded).
    expect(parseFigmaUrl('https://www.figma.com/design/K/x?node-id=695%3A313').nodeId).toBe('695:313');
  });

  it('reads node-id when it is not the first query param', () => {
    expect(parseFigmaUrl('https://www.figma.com/design/K/x?t=abc&node-id=12-34&mode=dev').nodeId).toBe('12:34');
  });

  it('returns nulls when the key or node id is missing', () => {
    expect(parseFigmaUrl('https://www.figma.com/design/OnlyKey/name')).toEqual({
      fileKey: 'OnlyKey',
      nodeId: null,
    });
    expect(parseFigmaUrl('https://example.com/nothing?node-id=1-2')).toEqual({
      fileKey: null,
      nodeId: '1:2',
    });
  });
});
