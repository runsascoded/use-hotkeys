import { useCallback, useEffect, useRef, useState } from 'react'
import type { KeyCombination, HotkeySequence, RecordHotkeyOptions, RecordHotkeyResult } from './types'
import { formatCombination, isModifierKey, normalizeKey } from './utils'

/** Store callback in ref to avoid effect re-runs when callback changes */
function useEventCallback<T extends (...args: never[]) => unknown>(fn: T | undefined): T | undefined {
  const ref = useRef(fn)
  ref.current = fn
  return useCallback(((...args) => ref.current?.(...args)) as T, [])
}

/**
 * Hook to record a keyboard shortcut (single key or sequence) from user input.
 *
 * Recording behavior:
 * - Each key press (after modifiers released) adds to the sequence
 * - Enter key submits the current sequence
 * - Timeout submits the current sequence (configurable)
 * - Escape cancels recording
 *
 * @example
 * ```tsx
 * function KeybindingEditor() {
 *   const { isRecording, startRecording, sequence, display, pendingKeys, activeKeys } = useRecordHotkey({
 *     onCapture: (sequence, display) => {
 *       console.log('Captured:', display.display) // "2 W" or "⌘K"
 *       saveKeybinding(display.id) // "2 w" or "meta+k"
 *     },
 *     sequenceTimeout: 1000,
 *   })
 *
 *   return (
 *     <button onClick={() => startRecording()}>
 *       {isRecording
 *         ? (pendingKeys.length > 0
 *             ? formatCombination(pendingKeys).display + '...'
 *             : 'Press keys...')
 *         : (display?.display ?? 'Click to set')}
 *     </button>
 *   )
 * }
 * ```
 */
export function useRecordHotkey(options: RecordHotkeyOptions = {}): RecordHotkeyResult {
  const {
    onCapture: onCaptureProp,
    onCancel: onCancelProp,
    preventDefault = true,
    sequenceTimeout = 1000,
  } = options

  // Stabilize callbacks to avoid effect re-runs
  const onCapture = useEventCallback(onCaptureProp)
  const onCancel = useEventCallback(onCancelProp)

  const [isRecording, setIsRecording] = useState(false)
  const [sequence, setSequence] = useState<HotkeySequence | null>(null)
  const [pendingKeys, setPendingKeys] = useState<HotkeySequence>([])
  const [activeKeys, setActiveKeys] = useState<KeyCombination | null>(null)

  // Track pressed keys during recording
  const pressedKeysRef = useRef<Set<string>>(new Set())
  const hasNonModifierRef = useRef(false)
  const currentComboRef = useRef<KeyCombination | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearTimeout_ = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  const submit = useCallback((seq: HotkeySequence) => {
    if (seq.length === 0) return

    const display = formatCombination(seq)

    // Clear state
    clearTimeout_()
    pressedKeysRef.current.clear()
    hasNonModifierRef.current = false
    currentComboRef.current = null

    setSequence(seq)
    setPendingKeys([])
    setIsRecording(false)
    setActiveKeys(null)

    onCapture?.(seq, display)
  }, [clearTimeout_, onCapture])

  const cancel = useCallback(() => {
    clearTimeout_()
    setIsRecording(false)
    setPendingKeys([])
    setActiveKeys(null)
    pressedKeysRef.current.clear()
    hasNonModifierRef.current = false
    currentComboRef.current = null
    onCancel?.()
  }, [clearTimeout_, onCancel])

  const startRecording = useCallback(() => {
    clearTimeout_()
    setIsRecording(true)
    setSequence(null)
    setPendingKeys([])
    setActiveKeys(null)
    pressedKeysRef.current.clear()
    hasNonModifierRef.current = false
    currentComboRef.current = null

    // Return cancel function
    return cancel
  }, [cancel, clearTimeout_])

  useEffect(() => {
    if (!isRecording) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (preventDefault) {
        e.preventDefault()
        e.stopPropagation()
      }

      // Clear timeout on any keypress
      clearTimeout_()

      // Enter submits current sequence
      if (e.key === 'Enter') {
        setPendingKeys(current => {
          if (current.length > 0) {
            submit(current)
          }
          return current
        })
        return
      }

      // Escape cancels
      if (e.key === 'Escape') {
        cancel()
        return
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

        // Clear for next key in sequence
        pressedKeysRef.current.clear()
        hasNonModifierRef.current = false
        currentComboRef.current = null
        setActiveKeys(null)

        // Add to pending sequence
        setPendingKeys(current => {
          const newSequence = [...current, combo]

          // Set timeout to submit
          clearTimeout_()
          timeoutRef.current = setTimeout(() => {
            submit(newSequence)
          }, sequenceTimeout)

          return newSequence
        })
      }
    }

    // Capture phase to intercept before other handlers
    window.addEventListener('keydown', handleKeyDown, true)
    window.addEventListener('keyup', handleKeyUp, true)

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true)
      window.removeEventListener('keyup', handleKeyUp, true)
      clearTimeout_()
    }
  }, [isRecording, preventDefault, sequenceTimeout, clearTimeout_, submit, cancel])

  const display = sequence ? formatCombination(sequence) : null

  // Backwards compatibility: return first key as combination
  const combination = sequence && sequence.length > 0 ? sequence[0] : null

  return {
    isRecording,
    startRecording,
    cancel,
    sequence,
    display,
    pendingKeys,
    activeKeys,
    combination, // deprecated
  }
}
