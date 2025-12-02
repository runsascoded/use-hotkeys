import { useCallback, useEffect, useMemo, useState } from 'react'
import { useHotkeys, HotkeyMap, HandlerMap, UseHotkeysOptions } from './useHotkeys'

export interface UseEditableHotkeysOptions extends UseHotkeysOptions {
  /** localStorage key for persistence (omit to disable persistence) */
  storageKey?: string
}

export interface UseEditableHotkeysResult {
  /** Current keymap (defaults merged with user overrides) */
  keymap: HotkeyMap
  /** Update a single keybinding */
  setBinding: (action: string, key: string) => void
  /** Update multiple keybindings at once */
  setKeymap: (overrides: Partial<HotkeyMap>) => void
  /** Reset all overrides to defaults */
  reset: () => void
  /** User overrides only (for inspection/export) */
  overrides: Partial<HotkeyMap>
}

/**
 * Wraps useHotkeys with editable keybindings and optional persistence.
 *
 * @example
 * ```tsx
 * const { keymap, setBinding, reset } = useEditableHotkeys(
 *   { 't': 'setTemp', 'c': 'setCO2' },
 *   { setTemp: () => setMetric('temp'), setCO2: () => setMetric('co2') },
 *   { storageKey: 'app-hotkeys' }
 * )
 * ```
 */
export function useEditableHotkeys(
  defaults: HotkeyMap,
  handlers: HandlerMap,
  options: UseEditableHotkeysOptions = {},
): UseEditableHotkeysResult {
  const { storageKey, ...hotkeyOptions } = options

  // Load overrides from storage on mount
  const [overrides, setOverrides] = useState<Partial<HotkeyMap>>(() => {
    if (!storageKey || typeof window === 'undefined') return {}
    try {
      const stored = localStorage.getItem(storageKey)
      return stored ? JSON.parse(stored) : {}
    } catch {
      return {}
    }
  })

  // Persist overrides to storage
  useEffect(() => {
    if (!storageKey || typeof window === 'undefined') return
    try {
      if (Object.keys(overrides).length === 0) {
        localStorage.removeItem(storageKey)
      } else {
        localStorage.setItem(storageKey, JSON.stringify(overrides))
      }
    } catch {
      // Ignore storage errors
    }
  }, [storageKey, overrides])

  // Merge defaults with overrides (invert the map: action -> key becomes key -> action)
  const keymap = useMemo(() => {
    // Build action -> key map from defaults
    const actionToKey: Record<string, string> = {}
    for (const [key, action] of Object.entries(defaults)) {
      const actions = Array.isArray(action) ? action : [action]
      for (const a of actions) {
        actionToKey[a] = key
      }
    }

    // Apply overrides (key -> action)
    for (const [key, action] of Object.entries(overrides)) {
      if (action === undefined) continue
      const actions = Array.isArray(action) ? action : [action]
      for (const a of actions) {
        actionToKey[a] = key
      }
    }

    // Rebuild key -> action map
    const result: HotkeyMap = {}
    for (const [action, key] of Object.entries(actionToKey)) {
      if (result[key]) {
        const existing = result[key]
        result[key] = Array.isArray(existing) ? [...existing, action] : [existing, action]
      } else {
        result[key] = action
      }
    }

    return result
  }, [defaults, overrides])

  // Register hotkeys
  useHotkeys(keymap, handlers, hotkeyOptions)

  const setBinding = useCallback((action: string, key: string) => {
    setOverrides((prev) => ({ ...prev, [key]: action }))
  }, [])

  const setKeymap = useCallback((newOverrides: Partial<HotkeyMap>) => {
    setOverrides((prev) => ({ ...prev, ...newOverrides }))
  }, [])

  const reset = useCallback(() => {
    setOverrides({})
  }, [])

  return { keymap, setBinding, setKeymap, reset, overrides }
}
