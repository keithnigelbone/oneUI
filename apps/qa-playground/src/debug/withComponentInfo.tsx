import type { ComponentType } from 'react'
import { ComponentInspector } from './ComponentInspector'
import { isBlockComponent, pickDisplayProps } from './componentInfo'
import { shouldInspectComponent } from './inspectorRegistry'

export function withComponentInfo<P>(
  Component: ComponentType<P>,
  name: string,
  options?: { skip?: boolean },
): ComponentType<P> {
  if (options?.skip || !shouldInspectComponent(name)) return Component

  function Wrapped(props: P) {
    const raw = props as Record<string, unknown>
    const displayProps = pickDisplayProps(raw, name)
    const block = isBlockComponent(name, raw)

    return (
      <ComponentInspector name={name} props={displayProps} block={block}>
        <Component {...(props as P & Record<string, unknown>)} />
      </ComponentInspector>
    )
  }

  Wrapped.displayName = `Inspect(${name})`
  return Wrapped as ComponentType<P>
}
