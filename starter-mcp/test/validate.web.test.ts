import { describe, it, expect } from 'vitest';
import {
  type RuleContext,
  stripComments,
  parseTsx,
  checkUnknownProps,
  checkNonReleasedComponents,
} from '../src/tools/validate/shared.js';
import { collectWebIssues } from '../src/tools/validate/rules.web.js';
import { RELEASED_EXPORTS } from '../src/lib/releasedExports.js';

const PKG = '@jds4/oneui-react';

function webIssues(tsx: string) {
  const lines = stripComments(tsx);
  const ast = parseTsx(tsx);
  const ctx: RuleContext = { lines, ast, assetSubdir: '', released: RELEASED_EXPORTS, pkgName: PKG };
  return [
    ...checkUnknownProps(ast, ''),
    ...checkNonReleasedComponents(ast, RELEASED_EXPORTS, PKG),
    ...collectWebIssues(ctx),
  ];
}

const rules = (issues: { rule: string }[]) => issues.map((i) => i.rule).sort();

// The canonical broken snippet from TESTING.md — must keep tripping all 4 rules.
const BROKEN = `import { Button } from '@jds4/oneui-react';
export default function Page() {
  return (
    <div style={{ background: 'var(--Primary-Bold)' }}>
      <span style={{ fontFamily: 'Inter', fontSize: 'var(--Typography-Size-M)' }}>Hello</span>
      <Button badProp="x" variant="bold">Submit</Button>
    </div>
  );
}`;

describe('validate — web rules', () => {
  it('flags the canonical broken snippet with all 4 documented rules', () => {
    const issues = webIssues(BROKEN);
    const found = new Set(issues.map((i) => i.rule));
    expect(found).toContain('inline-surface-paint');
    expect(found).toContain('hardcoded-font');
    expect(found).toContain('legacy-token');
    expect(found).toContain('unknown-prop');
  });

  it('passes a clean snippet', () => {
    // NB: web Button has NO \`variant\` prop (it is \`attention\`/\`appearance\`) —
    // the TESTING.md "clean" snippet that used variant="bold" trips unknown-prop.
    const clean = `import { Surface, Button, Text } from '@jds4/oneui-react';
export default function Page() {
  return (
    <Surface mode="bold">
      <Text variant="title" size="M" attention="high">Welcome</Text>
      <Button attention="high">Continue</Button>
    </Surface>
  );
}`;
    expect(webIssues(clean)).toEqual([]);
  });

  it('flags direct Base UI imports', () => {
    const issues = webIssues(`import { Dialog } from '@base-ui/react/dialog';\nexport const X = () => <Dialog />;`);
    expect(rules(issues)).toContain('forbidden-base-ui');
  });

  it('flags external icon libraries', () => {
    const issues = webIssues(`import { Home } from 'lucide-react';\nexport const X = () => <Home />;`);
    expect(rules(issues)).toContain('external-icon-import');
  });

  it('flags OneUI-looking imports from the wrong package', () => {
    const issues = webIssues(`import { Button } from '@oneui/ui';\nexport const X = () => <Button />;`);
    expect(rules(issues)).toContain('unknown-import-path');
  });

  it('flags undefined (hallucinated) components', () => {
    const issues = webIssues(`export const X = () => <PrimaryButton>Go</PrimaryButton>;`);
    expect(rules(issues)).toContain('undefined-component');
  });

  it('flags non-released component imports from the barrel', () => {
    const issues = webIssues(`import { DefinitelyNotReleasedWidget } from '@jds4/oneui-react';\nexport const X = () => <DefinitelyNotReleasedWidget />;`);
    expect(rules(issues)).toContain('non-released-component');
  });

  it('does not crash on unparseable input (line rules still run)', () => {
    const issues = webIssues(`const broken = <<<%%%; background: 'var(--Primary-Bold)'`);
    expect(Array.isArray(issues)).toBe(true);
  });
});
