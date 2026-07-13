import { describe, expect, it } from 'vitest';
import { annotateTsxWithLocations } from '../compositionCodeAnnotator';

describe('annotateTsxWithLocations', () => {
  it('injects data-oneui-loc and data-oneui-component on JSX opening elements', () => {
    const input = `
import { Button } from '@oneui/playground';

export default function App() {
  return <Button appearance="primary">Go</Button>;
}
`;
    const output = annotateTsxWithLocations(input);
    expect(output).toContain('data-oneui-loc');
    expect(output).toContain('data-oneui-component="Button"');
  });

  it('emits L<line>:C<col> values matching the original source position', () => {
    const input = `import { Button } from '@oneui/playground';
export default function App() {
  return <Button>Go</Button>;
}
`;
    const output = annotateTsxWithLocations(input);
    // `<Button>` opens at line 3 (1-indexed by Babel), column 11
    // (after `  return `). Babel reports column 0-indexed, our annotator
    // adds 1.
    expect(output).toMatch(/data-oneui-loc="L3:C\d+"/);
  });

  it('skips lowercase tags for the data-oneui-component attribute', () => {
    const input = `
export default function App() {
  return <div><span>hi</span></div>;
}
`;
    const output = annotateTsxWithLocations(input);
    // Both <div> and <span> still get data-oneui-loc (selection bridge
    // needs them) but no data-oneui-component (they're DOM tags, not
    // @oneui components).
    expect(output).toContain('data-oneui-loc');
    expect(output).not.toContain('data-oneui-component');
  });

  it('handles JSXMemberExpression names (Foo.Bar)', () => {
    const input = `
import * as Carousel from '@oneui/playground';
export default function App() {
  return <Carousel.Root />;
}
`;
    const output = annotateTsxWithLocations(input);
    expect(output).toContain('data-oneui-component="Carousel.Root"');
  });

  it('does not double-annotate when an existing data-oneui-loc is present', () => {
    const input = `
import { Button } from '@oneui/playground';
export default function App() {
  return <Button data-oneui-loc="L99:C1">Go</Button>;
}
`;
    const output = annotateTsxWithLocations(input);
    const matches = output.match(/data-oneui-loc/g);
    // Each JSX opening element gets at most one data-oneui-loc — the
    // pre-existing one is preserved, not duplicated.
    expect(matches?.length ?? 0).toBe(1);
    expect(output).toContain('"L99:C1"');
  });

  it('returns input unchanged on parse failure', () => {
    const broken = 'export default function App() { return <Button';
    expect(annotateTsxWithLocations(broken)).toBe(broken);
  });

  it('annotates nested JSX (every opening element gets a loc)', () => {
    const input = `
import { Surface, Button } from '@oneui/playground';
export default function App() {
  return (
    <Surface mode="default">
      <Button>One</Button>
      <Button>Two</Button>
    </Surface>
  );
}
`;
    const output = annotateTsxWithLocations(input);
    const locMatches = output.match(/data-oneui-loc="/g);
    // Surface + 2 Buttons = 3 annotations.
    expect(locMatches).toHaveLength(3);
  });
});
