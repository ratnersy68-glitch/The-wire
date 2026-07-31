import { useEffect, useRef, useState } from 'react'

/** Reports true once no mouse/keyboard/touch activity has been seen for `timeoutMs`. */
export function useIdleTimer(timeoutMs: number, resetKey?: unknown): boolean {
  const [idle, setIdle] = useState(false)
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    function reset() {
      setIdle(false)
      if (timerRef.current !== null) window.clearTimeout(timerRef.current)
      timerRef.current = window.setTimeout(() => setIdle(true), timeoutMs)
    }

    const events: (keyof WindowEventMap)[] = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'pointerdown']
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }))
    reset()

    return () => {
      events.forEach((e) => window.removeEventListener(e, reset))
      if (timerRef.current !== null) window.clearTimeout(timerRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeoutMs, resetKey])

  return idle
}
