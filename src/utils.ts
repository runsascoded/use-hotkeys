import type { KeyCombination, KeyCombinationDisplay } from './types'

/**
 * Detect if running on macOS
 */
export function isMac(): boolean {
  if (typeof navigator === 'undefined') return false
  return /Mac|iPod|iPhone|iPad/.test(navigator.platform)
}

/**
 * Normalize a key name to a canonical form
 */
export function normalizeKey(key: string): string {
  // Handle special keys
  const keyMap: Record<string, string> = {
    ' ': 'space',
    'Escape': 'escape',
    'Enter': 'enter',
    'Tab': 'tab',
    'Backspace': 'backspace',
    'Delete': 'delete',
    'ArrowUp': 'arrowup',
    'ArrowDown': 'arrowdown',
    'ArrowLeft': 'arrowleft',
    'ArrowRight': 'arrowright',
    'Home': 'home',
    'End': 'end',
    'PageUp': 'pageup',
    'PageDown': 'pagedown',
  }

  if (key in keyMap) {
    return keyMap[key]
  }

  // Single characters to lowercase
  if (key.length === 1) {
    return key.toLowerCase()
  }

  // Function keys (F1-F12)
  if (/^F\d{1,2}$/.test(key)) {
    return key.toLowerCase()
  }

  return key.toLowerCase()
}

/**
 * Format a key for display (platform-aware)
 */
export function formatKeyForDisplay(key: string): string {
  const displayMap: Record<string, string> = {
    'space': 'Space',
    'escape': 'Esc',
    'enter': '↵',
    'tab': 'Tab',
    'backspace': '⌫',
    'delete': 'Del',
    'arrowup': '↑',
    'arrowdown': '↓',
    'arrowleft': '←',
    'arrowright': '→',
    'home': 'Home',
    'end': 'End',
    'pageup': 'PgUp',
    'pagedown': 'PgDn',
  }

  if (key in displayMap) {
    return displayMap[key]
  }

  // Function keys
  if (/^f\d{1,2}$/.test(key)) {
    return key.toUpperCase()
  }

  // Single letter - uppercase for display
  if (key.length === 1) {
    return key.toUpperCase()
  }

  return key
}

/**
 * Convert a KeyCombination to display format
 */
export function formatCombination(combo: KeyCombination): KeyCombinationDisplay {
  const mac = isMac()
  const parts: string[] = []
  const idParts: string[] = []

  // Order: Ctrl/Cmd, Alt/Option, Shift, Key
  if (combo.modifiers.ctrl) {
    parts.push(mac ? '⌃' : 'Ctrl')
    idParts.push('ctrl')
  }
  if (combo.modifiers.meta) {
    parts.push(mac ? '⌘' : 'Win')
    idParts.push('meta')
  }
  if (combo.modifiers.alt) {
    parts.push(mac ? '⌥' : 'Alt')
    idParts.push('alt')
  }
  if (combo.modifiers.shift) {
    parts.push(mac ? '⇧' : 'Shift')
    idParts.push('shift')
  }

  parts.push(formatKeyForDisplay(combo.key))
  idParts.push(combo.key)

  return {
    display: mac ? parts.join('') : parts.join('+'),
    id: idParts.join('+'),
  }
}

/**
 * Check if a key is a modifier key
 */
export function isModifierKey(key: string): boolean {
  return ['Control', 'Alt', 'Shift', 'Meta'].includes(key)
}

/**
 * Characters that require shift to type (US keyboard layout)
 * When matching these keys, we should ignore shiftKey mismatch
 */
const SHIFTED_CHARS = new Set([
  '~', '!', '@', '#', '$', '%', '^', '&', '*', '(', ')',
  '_', '+', '{', '}', '|', ':', '"', '<', '>', '?',
])

/**
 * Check if a key is a shifted character (requires shift to type)
 */
export function isShiftedChar(key: string): boolean {
  return SHIFTED_CHARS.has(key)
}

/**
 * Parse a combination ID back to a KeyCombination
 */
export function parseCombinationId(id: string): KeyCombination {
  const parts = id.toLowerCase().split('+')
  const key = parts[parts.length - 1]

  return {
    key,
    modifiers: {
      ctrl: parts.includes('ctrl'),
      alt: parts.includes('alt'),
      shift: parts.includes('shift'),
      meta: parts.includes('meta'),
    },
  }
}

/**
 * Conflict detection result
 */
export interface KeyConflict {
  /** The key combination that has a conflict */
  key: string
  /** Actions bound to this key */
  actions: string[]
}

/**
 * Find conflicts (multiple actions bound to same key) in a keymap
 * @param keymap - HotkeyMap to check for conflicts
 * @returns Map of key -> actions[] for keys with multiple actions
 */
export function findConflicts(keymap: Record<string, string | string[]>): Map<string, string[]> {
  const keyToActions = new Map<string, string[]>()

  for (const [key, actionOrActions] of Object.entries(keymap)) {
    const actions = Array.isArray(actionOrActions) ? actionOrActions : [actionOrActions]
    const existing = keyToActions.get(key) ?? []
    keyToActions.set(key, [...existing, ...actions])
  }

  // Only keep entries with conflicts (multiple actions)
  const conflicts = new Map<string, string[]>()
  for (const [key, actions] of keyToActions) {
    if (actions.length > 1) {
      conflicts.set(key, actions)
    }
  }

  return conflicts
}

/**
 * Check if a keymap has any conflicts
 */
export function hasConflicts(keymap: Record<string, string | string[]>): boolean {
  return findConflicts(keymap).size > 0
}

/**
 * Get conflicts as an array of KeyConflict objects
 */
export function getConflictsArray(keymap: Record<string, string | string[]>): KeyConflict[] {
  const conflicts = findConflicts(keymap)
  return Array.from(conflicts.entries()).map(([key, actions]) => ({ key, actions }))
}
