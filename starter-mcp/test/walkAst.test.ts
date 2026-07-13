import { describe, it, expect } from 'vitest';
import { walkAST } from '../src/tools/validate/shared.js';

describe('walkAST stack safety (L-4)', () => {
  it('does not overflow the stack on a pathologically deep AST', () => {
    // A ~50k-deep nested node chain — far deeper than any real AST and deep
    // enough to blow a recursive walker's call stack. The iterative walker
    // visits all of it without throwing.
    let node: Record<string, unknown> = { type: 'Leaf' };
    for (let i = 0; i < 50000; i++) node = { type: 'Wrap', inner: node };

    let visits = 0;
    expect(() => walkAST(node, () => { visits++; })).not.toThrow();
    expect(visits).toBe(50001);
  });

  it('still visits every node in a normal-depth tree, in pre-order', () => {
    const ast = {
      type: 'Program',
      body: [
        { type: 'A', child: { type: 'B' } },
        { type: 'C' },
      ],
    };
    const seen: string[] = [];
    walkAST(ast, (n) => seen.push(n.type as string));
    expect(seen).toEqual(['Program', 'A', 'B', 'C']);
  });
});
