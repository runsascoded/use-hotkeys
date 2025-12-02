import { useCallback, useEffect, useRef, useState } from 'react'
import type { KeyCombination, RecordHotkeyOptions, RecordHotkeyResult } from './types'
import { formatCombination, isModifierKey, normalizeKey } from './utils'

/** Store callback in ref to avoid effect re-runs when callback changes */
function useEventCallback<T extends (...args: never[]) => unknown>(fn: T | undefined): T | undefined {
  const ref = useRef(fn)
  ref.current = fn
  return useCallback(((...args) => ref.current?.(...args)) as T, [])
}

/**
 * Hook to record a keyboard shortcut from user input.
 *
 * When recording starts, captures the next key combination the user presses.
 * Recording completes when all keys are released after pressing a non-modifier key.
 *
 * @example
 * ```tsx
 * function KeybindingEditor() {
 *   const { isRecording, startRecording, combination, display, activeKeys } = useRecordHotkey({
 *     onCapture: (combo, display) => {
 *       console.log('Captured:', display.display)
 *       saveKeybinding(display.id)
 *     }
 *   })
 *
 *   return (
 *     <button onClick={() => startRecording()}>
 *       {isRecording
 *         ? (activeKeys ? formatCombination(activeKeys).display : 'Press keys...')
 *         : (display?.display ?? 'Click to set')}
 *     </button>
 *   )
 * }
 * ```
 */
export function useRecordHotkey(options: RecordHotkeyOptions = {}): RecordHotkeyResult {
  const { onCapture: onCaptureProp, onCancel: onCancelProp, preventDefault = true } = options

  // Stabilize callbacks to avoid effect re-runs
  const onCapture = useEventCallback(onCaptureProp)
  const onCancel = useEventCallback(onCancelProp)

  const [isRecording, setIsRecording] = useState(false)
  const [combination, setCombination] = useState<KeyCombination | null>(null)
  const [activeKeys, setActiveKeys] = useState<KeyCombination | null>(null)

  // Track pressed keys during recording
  const pressedKeysRef = useRef<Set<string>>(new Set())
  const hasNonModifierRef = useRef(false)
  const currentComboRef = useRef<KeyCombination | null>(null)

  const cancel = useCallback(() => {
    setIsRecording(false)
    setActiveKeys(null)
    pressedKeysRef.current.clear()
    hasNonModifierRef.current = false
    currentComboRef.current = null
    onCancel?.()
  }, [onCancel])

  const startRecording = useCallback(() => {
    setIsRecording(true)
    setCombination(null)
    setActiveKeys(null)
    pressedKeysRef.current.clear()
    hasNonModifierRef.current = false
    currentComboRef.current = null

    // Return cancel function
    return cancel
  }, [cancel])

  useEffect(() => {
    if (!isRecording) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (preventDefault) {
        e.preventDefault()
        e.stopPropagation()
      }

      const key = e.key
      pressedKeysRef.current.add(key)

      // Build current combination from pressed keys
      const combo: KeyCombination = {
        key: '',
        modifiers: {
          ctrl: e.ctrlKey,
          alt: e.altKey,
          shift: e.shiftKey,
          meta: e.metaKey,
        },
      }

      // Find the non-modifier key
      for (const k of pressedKeysRef.current) {
        if (!isModifierKey(k)) {
          combo.key = normalizeKey(k)
          hasNonModifierRef.current = true
          break
        }
      }

      // Only update if we have a non-modifier key
      if (combo.key) {
        currentComboRef.current = combo
        setActiveKeys(combo)
      } else {
        // Show modifiers being held
        setActiveKeys({
          key: '',
          modifiers: combo.modifiers,
        })
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (preventDefault) {
        e.preventDefault()
        e.stopPropagation()
      }

      pressedKeysRef.current.delete(e.key)

      // On Mac, releasing Meta swallows other keyup events, so check if we have a valid
      // combination when Meta is released (or when all keys are released)
      const shouldComplete =
        (pressedKeysRef.current.size === 0) ||
        (e.key === 'Meta' && hasNonModifierRef.current)

      if (shouldComplete && hasNonModifierRef.current && currentComboRef.current) {
        const combo = currentComboRef.current
        const display = formatCombination(combo)

        // Clear state before callbacks to avoid re-entrancy issues
        pressedKeysRef.current.clear()
        hasNonModifierRef.current = false
        currentComboRef.current = null

        setCombination(combo)
        setIsRecording(false)
        setActiveKeys(null)

        onCapture?.(combo, display)
      }
    }

    // Capture phase to intercept before other handlers
    window.addEventListener('keydown', handleKeyDown, true)
    window.addEventListener('keyup', handleKeyUp, true)

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true)
      window.removeEventListener('keyup', handleKeyUp, true)
    }
  }, [isRecording, preventDefault])

  const display = combination ? formatCombination(combination) : null

  return {
    isRecording,
    startRecording,
    cancel,
    combination,
    display,
    activeKeys,
  }
}
