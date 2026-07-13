/**
 * Stable hash of any AST (or any JSON-serialisable value) used by the
 * composition pipeline to key Convex `renderedScreenshots` rows and
 * client-side subscriptions.
 *
 * The encoding (djb2 → unsigned-32 → hex) is the contract the verify route
 * established when it first wrote rows. Changing the algorithm or encoding
 * silently breaks lookup of historical rows, so this implementation is
 * deliberately frozen.
 */
export function computeASTHash(ast: unknown): string {
  return djb2Hex(JSON.stringify(ast));
}

/**
 * Hash of TSX source for code-mode versions. Same djb2 → hex encoding
 * as `computeASTHash`, but takes the string directly so callers don't
 * `JSON.stringify` a string and double-encode it. The `code:` prefix is
 * applied at the point of use (verify route, CanvasPanel) so the same
 * Convex column can hold both AST and code hashes without collision.
 */
export function computeCodeHash(code: string): string {
  return djb2Hex(code);
}

function djb2Hex(input: string): string {
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = ((hash << 5) + hash + input.charCodeAt(i)) >>> 0;
  }
  return hash.toString(16);
}
