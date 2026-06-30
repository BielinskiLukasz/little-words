import { useState, useEffect } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/db/db'
import type { Meaning } from '@/db/types'

/**
 * Reactive hook that returns Meaning[] matching the given prefix (case-insensitive).
 * Debounces the input 500ms. Returns undefined while loading, [] when prefix is empty.
 *
 * Security (T-02-04-D1): Applies .limit(10) cap on Dexie query to prevent large
 * result sets from blocking the render thread.
 */
export function useMeaningSearch(prefix: string): Meaning[] | undefined {
  const [debouncedPrefix, setDebouncedPrefix] = useState('')

  useEffect(() => {
    // Clear immediately when input becomes empty (Pitfall 2: no stale results)
    if (prefix.length === 0) {
      setDebouncedPrefix('')
      return
    }
    const timer = setTimeout(() => {
      setDebouncedPrefix(prefix.toLowerCase())
    }, 500)
    return () => clearTimeout(timer)
  }, [prefix])

  const results = useLiveQuery(() => {
    if (debouncedPrefix.length < 1) return []
    return db.meanings
      .where('text')
      .startsWithIgnoreCase(debouncedPrefix)
      .limit(10)
      .toArray()
  }, [debouncedPrefix])

  return results
}
