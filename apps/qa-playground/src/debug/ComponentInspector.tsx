import { isValidElement, useEffect, useId, type ReactNode } from 'react'
import { AdaptiveTooltip } from '@/sample-app/components/AdaptiveTooltip'
import { useAppStore } from '@/sample-app/store/appStore'
import { formatInspectorRows } from './componentInfo'
import { registerInspector, updateInspectorProps } from './inspectorRegistry'
import { QA_COMPONENT_INSPECTOR } from './qaConfig'
import styles from './ComponentInspector.module.css'

export interface ComponentInspectorProps {
  name: string
  props?: Record<string, unknown>
  /** Use block wrapper for full-width / layout components */
  block?: boolean
  /** Show a small info icon on hover for click-to-pin */
  showInfoIcon?: boolean
  children: ReactNode
}

function InspectorTooltipContent({ name, props }: { name: string; props: Record<string, unknown> }) {
  const rows = formatInspectorRows(props)

  return (
    <div className={styles.inspectorContent}>
      <div className={styles.inspectorTitle}>Component: {name}</div>
      {rows.length === 0 ? (
        <div className={styles.inspectorRow}>
          <span className={styles.inspectorKey}>props</span>
          <span className={styles.inspectorValue}>(none)</span>
        </div>
      ) : (
        rows.map(({ key, value }) => (
          <div key={key} className={styles.inspectorRow}>
            <span className={styles.inspectorKey}>{key}</span>
            <span className={styles.inspectorValue}>{value}</span>
          </div>
        ))
      )}
    </div>
  )
}

/**
 * Tags a OneUI component for global QA inspection.
 * Uses a DOM wrapper because OneUI components (e.g. Button) do not forward custom data-* props.
 * Hover resolution is handled by QaInspectorLayer.
 */
export function ComponentInspector({
  name,
  props = {},
  block = false,
  showInfoIcon = false,
  children,
}: ComponentInspectorProps) {
  const inspectorId = useId()
  const storeEnabled = useAppStore((s) => s.qaComponentInspector)
  const enabled = QA_COMPONENT_INSPECTOR && storeEnabled

  useEffect(() => {
    if (!enabled) return
    return registerInspector(inspectorId, name, props)
  }, [enabled, inspectorId, name])

  useEffect(() => {
    if (!enabled) return
    updateInspectorProps(inspectorId, props)
  }, [enabled, inspectorId, props])

  if (!enabled) return <>{children}</>

  const shellClass = block ? styles.inspectShellBlock : styles.inspectShellInline
  const Wrapper = block ? 'div' : 'span'

  return (
    <Wrapper
      className={shellClass}
      data-qa-inspect={name}
      data-qa-inspect-id={inspectorId}
    >
      {children}
      {showInfoIcon ? (
        <button type="button" className={styles.infoBtn} aria-label={`Inspect ${name} props`}>
          i
        </button>
      ) : null}
    </Wrapper>
  )
}

/** Label-only helper for custom layouts (no wrapper). */
export function ComponentInfoTag({ name, props = {} }: Pick<ComponentInspectorProps, 'name' | 'props'>) {
  const storeEnabled = useAppStore((s) => s.qaComponentInspector)
  const enabled = QA_COMPONENT_INSPECTOR && storeEnabled
  if (!enabled) return null

  return (
    <AdaptiveTooltip
      content={<InspectorTooltipContent name={name} props={props} />}
      trigger="click"
      side="top"
      maxWidth={340}
      hoverable={false}
      arrow
    >
      <button type="button" className={styles.infoBtn} style={{ opacity: 1, pointerEvents: 'auto', position: 'static' }}>
        i
      </button>
    </AdaptiveTooltip>
  )
}

/** @deprecated Use ComponentInspector */
export const ComponentDebugLabel = ComponentInspector

/** @deprecated Use ComponentInspector */
export const PlaygroundCaption = ComponentInspector

export function useQaComponentInspector(): [boolean, (value: boolean) => void] {
  const enabled = useAppStore((s) => s.qaComponentInspector)
  const set = useAppStore((s) => s.setQaComponentInspector)
  return [enabled, set]
}

/** @deprecated Use useQaComponentInspector */
export const useShowComponentInfo = useQaComponentInspector

export function isInspectableElement(node: ReactNode): node is React.ReactElement {
  return isValidElement(node)
}
