import { useAnnouncer } from './announcer'
import { TESTIDS } from '@/sample-app/testids'

/** Polite, visually-hidden live region rendered once at the app root. */
export function LiveRegion() {
  const message = useAnnouncer((s) => s.message)
  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      data-testid={TESTIDS.accessibility.liveRegion}
      style={{
        position: 'absolute',
        width: 1,
        height: 1,
        padding: 0,
        margin: -1,
        overflow: 'hidden',
        clip: 'rect(0 0 0 0)',
        whiteSpace: 'nowrap',
        border: 0,
      }}
    >
      {message}
    </div>
  )
}
