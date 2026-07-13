import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import { formatInspectorRows } from './componentInfo'
import { findInspectableElement, getInspectorEntry } from './inspectorRegistry'
import { QA_COMPONENT_INSPECTOR } from './qaConfig'
import styles from './ComponentInspector.module.css'
import { useAppStore } from '@/sample-app/store/appStore'

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

/** Single global popover — resolves the topmost component under the pointer. */
export function QaInspectorLayer() {
  const storeEnabled = useAppStore((s) => s.qaComponentInspector)
  const enabled = QA_COMPONENT_INSPECTOR && storeEnabled
  const highlightedRef = useRef<HTMLElement | null>(null)
  const [target, setTarget] = useState<{
    name: string
    props: Record<string, unknown>
    rect: DOMRect
  } | null>(null)
  const [style, setStyle] = useState<CSSProperties>({ visibility: 'hidden' })

  useEffect(() => {
    if (!enabled) {
      setTarget(null)
      if (highlightedRef.current) {
        highlightedRef.current.classList.remove(styles.inspectActive)
        highlightedRef.current = null
      }
      return
    }

    let frame = 0

    const resolve = (x: number, y: number) => {
      const el = findInspectableElement(x, y)
      if (!el) {
        setTarget(null)
        if (highlightedRef.current) {
          highlightedRef.current.classList.remove(styles.inspectActive)
          highlightedRef.current = null
        }
        return
      }

      const entry = getInspectorEntry(el.dataset.qaInspectId)
      if (!entry) {
        setTarget(null)
        return
      }

      if (highlightedRef.current !== el) {
        highlightedRef.current?.classList.remove(styles.inspectActive)
        el.classList.add(styles.inspectActive)
        highlightedRef.current = el
      }

      setTarget({
        name: entry.name,
        props: entry.props,
        rect: el.getBoundingClientRect(),
      })
    }

    const onMove = (event: MouseEvent) => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => resolve(event.clientX, event.clientY))
    }

    const onLeave = () => {
      setTarget(null)
      highlightedRef.current?.classList.remove(styles.inspectActive)
      highlightedRef.current = null
    }

    document.addEventListener('mousemove', onMove, { passive: true })
    document.addEventListener('mouseleave', onLeave)
    return () => {
      cancelAnimationFrame(frame)
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseleave', onLeave)
      highlightedRef.current?.classList.remove(styles.inspectActive)
      highlightedRef.current = null
    }
  }, [enabled])

  useLayoutEffect(() => {
    if (!target) return
    const { rect } = target
    const showBelow = rect.top < 72
    setStyle({
      position: 'fixed',
      top: showBelow ? rect.bottom + 8 : Math.max(8, rect.top - 8),
      left: Math.min(window.innerWidth - 360, Math.max(8, rect.left)),
      transform: showBelow ? 'none' : 'translateY(-100%)',
      visibility: 'visible',
    })
  }, [target])

  if (!enabled || !target) return null

  return createPortal(
    <div className={styles.popover} style={style} role="tooltip" aria-hidden="true">
      <InspectorTooltipContent name={target.name} props={target.props} />
    </div>,
    document.body,
  )
}
