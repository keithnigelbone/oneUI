import type { MDXComponents } from 'mdx/types';
import { BrandAwareExample, InstallSnippet, SurfaceRuleCallout } from '@/components/BrandAwareExample';
import { CodeBlock } from '@/components/CodeBlock';
import { Callout, ComponentDoc, ComponentIndex } from '@/components/ComponentDoc';

export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    BrandAwareExample,
    Callout,
    ComponentDoc,
    ComponentIndex,
    pre: CodeBlock,
    InstallSnippet,
    SurfaceRuleCallout,
    ...components,
  };
}
