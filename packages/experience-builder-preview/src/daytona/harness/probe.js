/**
 * probe.js — zero-egress proof harness (PREV-01).
 *
 * Runs INSIDE a `networkBlockAll: true` Daytona sandbox at the Plan 05
 * human-verify checkpoint. It attempts a single outbound `fetch(url)` and proves
 * the block holds:
 *   - fetch REJECTED  -> EGRESS-BLOCKED on stdout, exit 0  (zero-egress enforced)
 *   - fetch SUCCEEDS  -> EGRESS-LEAK    on stderr, exit 2  (block NOT enforced)
 *   - missing url arg -> usage on stderr,           exit 1
 *
 * The checkpoint passes ONLY when exit code === 0 (RESEARCH § Zero-egress Proof,
 * threat T-031-05: a successful fetch can never be mistaken for a pass). It MUST
 * NOT import the Daytona SDK and never reads DAYTONA_API_KEY (threat T-031-04).
 *
 * Usage: node probe.js <url>   (e.g. the Convex deployment URL)
 */

'use strict';

const url = process.argv[2];

if (!url) {
  console.error('probe.js: usage: node probe.js <url>');
  process.exit(1);
}

fetch(url).then(
  () => {
    // The block did NOT hold — fail loudly so the checkpoint cannot be fooled.
    console.error('EGRESS-LEAK: fetch succeeded — zero-egress NOT enforced for ' + url);
    process.exit(2);
  },
  (err) => {
    // Expected under networkBlockAll: the request is refused/times out.
    console.log('EGRESS-BLOCKED: ' + (err && err.message ? err.message : String(err)));
    process.exit(0);
  },
);
