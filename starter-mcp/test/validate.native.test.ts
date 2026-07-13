import { describe, it, expect } from 'vitest';
import {
  type RuleContext,
  stripComments,
  parseTsx,
  checkUnknownProps,
  checkNonReleasedComponents,
} from '../src/tools/validate/shared.js';
import { collectNativeIssues } from '../src/tools/validate/rules.native.js';
import { RELEASED_EXPORTS_NATIVE } from '../src/lib/releasedExports.native.js';

const PKG = '@oneui/ui-native';

function nativeIssues(tsx: string) {
  const lines = stripComments(tsx);
  const ast = parseTsx(tsx);
  const ctx: RuleContext = { lines, ast, assetSubdir: 'native', released: RELEASED_EXPORTS_NATIVE, pkgName: PKG };
  return [
    ...checkUnknownProps(ast, 'native'),
    ...checkNonReleasedComponents(ast, RELEASED_EXPORTS_NATIVE, PKG),
    ...collectNativeIssues(ctx),
  ];
}

const rules = (issues: { rule: string }[]) => new Set(issues.map((i) => i.rule));

describe('validate — native rules', () => {
  it('flags literal colours in style props', () => {
    const issues = nativeIssues(
      `import { Container } from '@oneui/ui-native';
export const X = () => <Container style={{ backgroundColor: '#ff0000' }} />;`,
    );
    expect(rules(issues)).toContain('literal-color');
  });

  it('flags rgba/oklch literals too', () => {
    expect(rules(nativeIssues(`const s = { color: 'rgba(0,0,0,0.5)' };`))).toContain('literal-color');
    expect(rules(nativeIssues(`const s = { borderColor: 'oklch(0.7 0.1 250)' };`))).toContain('literal-color');
  });

  it('flags forbidden react-native UI primitives (View/ScrollView stay allowed)', () => {
    const issues = nativeIssues(
      `import { View, ScrollView, Text, TouchableOpacity } from 'react-native';
export const X = () => <View />;`,
    );
    const flagged = [...issues].filter((i) => i.rule === 'forbidden-rn-primitive');
    const names = flagged.map((i) => i.message.match(/^"(\w+)"/)?.[1]);
    expect(names).toContain('Text');
    expect(names).toContain('TouchableOpacity');
    expect(names).not.toContain('View');
    expect(names).not.toContain('ScrollView');
  });

  it('flags hardcoded fonts', () => {
    expect(rules(nativeIssues(`const s = { fontFamily: 'Inter' };`))).toContain('hardcoded-font');
  });

  it('flags external native icon libraries', () => {
    expect(
      rules(nativeIssues(`import Icon from 'react-native-vector-icons/FontAwesome';`)),
    ).toContain('external-icon-import');
  });

  it('flags the banned RN deep import for resolveAssetSource', () => {
    expect(
      rules(nativeIssues(`import resolveAssetSource from 'react-native/Libraries/Image/resolveAssetSource';`)),
    ).toContain('banned-native-import');
  });

  it('flags unresolvable spacing strings on Container', () => {
    const issues = nativeIssues(
      `import { Container } from '@oneui/ui-native';
export const X = () => <Container padding="17px" gap="6" />;`,
    );
    const spacing = [...issues].filter((i) => i.rule === 'literal-spacing');
    expect(spacing).toHaveLength(1); // "17px" flagged, "6" is a valid key
    expect(spacing[0].message).toContain('17px');
  });

  it('passes a clean native snippet', () => {
    // NB: native Button has \`variant\` but NO \`label\` prop — the label is children.
    const clean = `import { Container, Text, Button } from '@oneui/ui-native';
export default function Screen() {
  return (
    <Container direction="column" gap="6" padding="Margin">
      <Text variant="title" size="M">Welcome</Text>
      <Button variant="bold">Continue</Button>
    </Container>
  );
}`;
    expect(nativeIssues(clean)).toEqual([]);
  });
});
