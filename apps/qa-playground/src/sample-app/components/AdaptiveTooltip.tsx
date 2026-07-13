import { useCallback, useRef, useState, type ReactNode } from 'react'
import { Tooltip as RawTooltip } from '@oneui/ui/components/Tooltip'
import type { TooltipProps, TooltipSide } from '@oneui/ui/components/Tooltip'
import styles from './AdaptiveTooltip.module.css'

const VIEWPORT_MARGIN = 56

function resolveSide(preferred: TooltipSide, rect: DOMRect): TooltipSide {
  switch (preferred) {
    case 'top':
      return rect.top < VIEWPORT_MARGIN ? 'bottom' : 'top'
    case 'bottom':
      return window.innerHeight - rect.bottom < VIEWPORT_MARGIN ? 'top' : 'bottom'
    default:
      return preferred
  }
}

interface AdaptiveTooltipProps extends TooltipProps {
  children: ReactNode
}

/** OneUI Tooltip with viewport-aware top/bottom flip when the preferred side would clip. */
export function AdaptiveTooltip({
  side: preferredSide = 'top',
  children,
  onOpenChange,
  ...props
}: AdaptiveTooltipProps) {
  const anchorRef = useRef<HTMLSpanElement>(null)
  const [side, setSide] = useState<TooltipSide>(preferredSide)

  const updateSide = useCallback(() => {
    const el = anchorRef.current
    if (!el) return
    setSide(resolveSide(preferredSide, el.getBoundingClientRect()))
  }, [preferredSide])

  const handleOpenChange = (open: boolean) => {
    if (open) updateSide()
    onOpenChange?.(open)
  }

  return (
    <RawTooltip {...props} side={side} onOpenChange={handleOpenChange}>
      <span
        ref={anchorRef}
        className={styles.anchor}
        onMouseEnter={updateSide}
        onFocus={updateSide}
      >
        {children}
      </span>
    </RawTooltip>
  )
}
