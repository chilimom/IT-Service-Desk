import { useEffect, useRef } from 'react'

const DEFAULT_POLLING_INTERVAL_MS = 15000

export function useTicketPolling(callback, options = {}) {
  const { enabled = true, intervalMs = DEFAULT_POLLING_INTERVAL_MS } = options
  const callbackRef = useRef(callback)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {
    if (!enabled || typeof callbackRef.current !== 'function') return undefined

    let intervalId = null

    function runCallback() {
      return callbackRef.current?.()
    }

    function handleVisibilityChange() {
      if (document.hidden) {
        if (intervalId) {
          window.clearInterval(intervalId)
          intervalId = null
        }
        return
      }

      runCallback()

      if (!intervalId) {
        intervalId = window.setInterval(runCallback, intervalMs)
      }
    }

    intervalId = window.setInterval(runCallback, intervalMs)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      if (intervalId) {
        window.clearInterval(intervalId)
      }

      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [enabled, intervalMs])
}
