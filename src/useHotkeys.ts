import { useEffect, useRef } from 'react'
import { isModifierKey, isShiftedChar, normalizeKey } from './utils'

/**
 * Hotkey definition - maps key combinations to action names
 */
export type HotkeyMap = Record<string, string | string[]>

/**
 * Handler map - maps action names to handler functions
 */
export type HandlerMap = Record<string, (e: KeyboardEvent) => void>

export interface UseHotkeysOptions {
  /** Whether hotkeys are enabled (default: true) */
  enabled?: boolean
  /** Element to attach listeners to (default: window) */
  target?: HTMLElement | Window | null
  /** Prevent default on matched hotkeys (default: true) */
  preventDefault?: boolean
  /** Stop propagation on matched hotkeys (default: true) */
  stopPropagation?: boolean
  /** Enable hotkeys even when focused on input/textarea/select (default: false) */
  enableOnFormTags?: boolean
}

/**
 * Parse a hotkey string into its components
 * e.g., "ctrl+shift+k" -> { ctrl: true, shift: true, key: "k" }
 */
function parseHotkey(hotkey: string): {
  ctrl: boolean
  alt: boolean
  shift: boolean
  meta: boolean
  key: string
} {
  const parts = hotkey.toLowerCase().split('+')
  const key = parts[parts.length - 1]

  return {
    ctrl: parts.includes('ctrl') || parts.includes('control'),
    alt: parts.includes('alt') || parts.includes('option'),
    shift: parts.includes('shift'),
    meta: parts.includes('meta') || parts.includes('cmd') || parts.includes('command'),
    key,
  }
}

/**
 * Check if a keyboard event matches a hotkey definition
 */
function matchesHotkey(
  e: KeyboardEvent,
  hotkey: { ctrl: boolean; alt: boolean; shift: boolean; meta: boolean; key: string }
): boolean {
  const eventKey = normalizeKey(e.key)

  // For shifted characters (like ?, !, @), ignore shift key mismatch
  // since pressing these keys inherently requires shift
  const shiftMatches = isShiftedChar(e.key)
    ? (hotkey.shift ? e.shiftKey : true)  // If hotkey wants shift, event must have it; otherwise ignore
    : e.shiftKey === hotkey.shift

  return (
    e.ctrlKey === hotkey.ctrl &&
    e.altKey === hotkey.alt &&
    shiftMatches &&
    e.metaKey === hotkey.meta &&
    eventKey === hotkey.key
  )
}

/**
 * Hook to register keyboard shortcuts.
 *
 * @example
 * ```tsx
 * useHotkeys(
 *   {
 *     't': 'setTemp',
 *     'c': 'setCO2',
 *     'ctrl+s': 'save',
 *     'shift+?': 'showHelp',
 *   },
 *   {
 *     setTemp: () => setMetric('temp'),
 *     setCO2: () => setMetric('co2'),
 *     save: () => handleSave(),
 *     showHelp: () => setShowHelp(true),
 *   }
 * )
 * ```
 */
export function useHotkeys(
  keymap: HotkeyMap,
  handlers: HandlerMap,
  options: UseHotkeysOptions = {}
): void {
  const {
    enabled = true,
    target,
    preventDefault = true,
    stopPropagation = true,
    enableOnFormTags = false,
  } = options

  // Use refs for handlers to avoid re-attaching listeners when handlers change
  const handlersRef = useRef(handlers)
  handlersRef.current = handlers

  const keymapRef = useRef(keymap)
  keymapRef.current = keymap

  useEffect(() => {
    if (!enabled) return

    const targetElement = target ?? window

    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if focused on form element (unless enabled)
      if (!enableOnFormTags) {
        const target = e.target as HTMLElement
        if (
          target instanceof HTMLInputElement ||
          target instanceof HTMLTextAreaElement ||
          target instanceof HTMLSelectElement ||
          target.isContentEditable
        ) {
          return
        }
      }

      // Skip modifier-only keypresses
      if (isModifierKey(e.key)) {
        return
      }

      // Check each hotkey in the map
      for (const [hotkeyStr, actionName] of Object.entries(keymapRef.current)) {
        const hotkey = parseHotkey(hotkeyStr)

        if (matchesHotkey(e, hotkey)) {
          // Find the handler(s) for this action
          const actions = Array.isArray(actionName) ? actionName : [actionName]

          for (const action of actions) {
            const handler = handlersRef.current[action]
            if (handler) {
              if (preventDefault) {
                e.preventDefault()
              }
              if (stopPropagation) {
                e.stopPropagation()
              }
              handler(e)
              return // Only handle first match
            }
          }
        }
      }
    }

    targetElement.addEventListener('keydown', handleKeyDown as EventListener)

    return () => {
      targetElement.removeEventListener('keydown', handleKeyDown as EventListener)
    }
  }, [enabled, target, preventDefault, stopPropagation, enableOnFormTags])
}
