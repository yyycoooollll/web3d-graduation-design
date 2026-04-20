'use client'

import { useEffect } from 'react'

export default function ResetSwCache() {
  useEffect(() => {
    const reset = async () => {
      try {
        if ('serviceWorker' in navigator) {
          const regs = await navigator.serviceWorker.getRegistrations()
          await Promise.all(regs.map((reg) => reg.unregister()))
        }

        if ('caches' in window) {
          const keys = await caches.keys()
          await Promise.all(
            keys
              .filter((key) => key.includes('workbox') || key.includes('next-pwa') || key.includes('precache'))
              .map((key) => caches.delete(key)),
          )
        }
      } catch {
        // ignore cleanup failures to avoid blocking page render
      }
    }

    reset()
  }, [])

  return null
}
