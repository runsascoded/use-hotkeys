import type { KeyCombination, KeyCombinationDisplay, HotkeySequence } from './types'

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
 * Format a single KeyCombination (internal helper)
 */
function formatSingleCombination(combo: KeyCombination): { display: string; id: string } {
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
 * Convert a KeyCombination or HotkeySequence to display format
 */
export function formatCombination(combo: KeyCombination): KeyCombinationDisplay
export function formatCombination(sequence: HotkeySequence): KeyCombinationDisplay
export function formatCombination(input: KeyCombination | HotkeySequence): KeyCombinationDisplay {
  // Handle array (sequence)
  if (Array.isArray(input)) {
    if (input.length === 0) {
      return { display: '', id: '', isSequence: false }
    }
    if (input.length === 1) {
      const single = formatSingleCombination(input[0])
      return { ...single, isSequence: false }
    }
    // Multiple keys = sequence
    const formatted = input.map(formatSingleCombination)
    return {
      display: formatted.map(f => f.display).join(' '),
      id: formatted.map(f => f.id).join(' '),
      isSequence: true,
    }
  }

  // Handle single KeyCombination
  const single = formatSingleCombination(input)
  return { ...single, isSequence: false }
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
 * Check if a hotkey string represents a sequence (space-separated keys)
 */
export function isSequence(hotkeyStr: string): boolean {
  // A sequence has spaces that aren't inside a modifier combo
  // "2 w" is a sequence, "ctrl+k" is not, "ctrl+k ctrl+c" is a sequence
  return hotkeyStr.includes(' ')
}

/**
 * Parse a single combination string (e.g., "ctrl+k") to KeyCombination
 */
function parseSingleCombination(str: string): KeyCombination {
  const parts = str.toLowerCase().split('+')
  const key = parts[parts.length - 1]

  return {
    key,
    modifiers: {
      ctrl: parts.includes('ctrl') || parts.includes('control'),
      alt: parts.includes('alt') || parts.includes('option'),
      shift: parts.includes('shift'),
      meta: parts.includes('meta') || parts.includes('cmd') || parts.includes('command'),
    },
  }
}

/**
 * Parse a hotkey string to a HotkeySequence.
 * Handles both single keys ("ctrl+k") and sequences ("2 w", "ctrl+k ctrl+c")
 */
export function parseHotkeyString(hotkeyStr: string): HotkeySequence {
  if (!hotkeyStr.trim()) return []

  // Split by space to get sequence parts
  const parts = hotkeyStr.trim().split(/\s+/)
  return parts.map(parseSingleCombination)
}

/**
 * Parse a combination ID back to a KeyCombination (single key only)
 * @deprecated Use parseHotkeyString for sequence support
 */
export function parseCombinationId(id: string): KeyCombination {
  // For backwards compatibility, if it's a sequence, return first key
  const sequence = parseHotkeyString(id)
  if (sequence.length === 0) {
    return { key: '', modifiers: { ctrl: false, alt: false, shift: false, meta: false } }
  }
  return sequence[0]
}

/**
 * Conflict detection result
 */
export interface KeyConflict {
  /** The key combination that has a conflict */
  key: string
  /** Actions bound to this key */
  actions: string[]
  /** Type of conflict */
  type: 'duplicate' | 'prefix'
}

/**
 * Check if sequence A is a prefix of sequence B
 */
function isPrefix(a: HotkeySequence, b: HotkeySequence): boolean {
  if (a.length >= b.length) return false
  for (let i = 0; i < a.length; i++) {
    if (!combinationsEqual(a[i], b[i])) return false
  }
  return true
}

/**
 * Check if two KeyCombinations are equal
 */
function combinationsEqual(a: KeyCombination, b: KeyCombination): boolean {
  return (
    a.key === b.key &&
    a.modifiers.ctrl === b.modifiers.ctrl &&
    a.modifiers.alt === b.modifiers.alt &&
    a.modifiers.shift === b.modifiers.shift &&
    a.modifiers.meta === b.modifiers.meta
  )
}

/**
 * Check if two HotkeySequences are equal
 */
function sequencesEqual(a: HotkeySequence, b: HotkeySequence): boolean {
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i++) {
    if (!combinationsEqual(a[i], b[i])) return false
  }
  return true
}

/**
 * Find conflicts in a keymap.
 * Detects:
 * - Duplicate: multiple actions bound to the exact same key/sequence
 * - Prefix: one hotkey is a prefix of another (e.g., "2" and "2 w")
 *
 * @param keymap - HotkeyMap to check for conflicts
 * @returns Map of key -> actions[] for keys with conflicts
 */
export function findConflicts(keymap: Record<string, string | string[]>): Map<string, string[]> {
  const conflicts = new Map<string, string[]>()

  // Parse all hotkeys into sequences for comparison
  const entries = Object.entries(keymap).map(([key, actionOrActions]) => ({
    key,
    sequence: parseHotkeyString(key),
    actions: Array.isArray(actionOrActions) ? actionOrActions : [actionOrActions],
  }))

  // Check for duplicate keys (multiple actions on same key)
  const keyToActions = new Map<string, string[]>()
  for (const { key, actions } of entries) {
    const existing = keyToActions.get(key) ?? []
    keyToActions.set(key, [...existing, ...actions])
  }
  for (const [key, actions] of keyToActions) {
    if (actions.length > 1) {
      conflicts.set(key, actions)
    }
  }

  // Check for prefix conflicts
  for (let i = 0; i < entries.length; i++) {
    for (let j = i + 1; j < entries.length; j++) {
      const a = entries[i]
      const b = entries[j]

      // Check if a is prefix of b or b is prefix of a
      if (isPrefix(a.sequence, b.sequence)) {
        // a is a prefix of b - both are conflicted
        const existingA = conflicts.get(a.key) ?? []
        if (!existingA.includes(`prefix of: ${b.key}`)) {
          conflicts.set(a.key, [...existingA, ...a.actions, `prefix of: ${b.key}`])
        }
        const existingB = conflicts.get(b.key) ?? []
        if (!existingB.includes(`has prefix: ${a.key}`)) {
          conflicts.set(b.key, [...existingB, ...b.actions, `has prefix: ${a.key}`])
        }
      } else if (isPrefix(b.sequence, a.sequence)) {
        // b is a prefix of a
        const existingB = conflicts.get(b.key) ?? []
        if (!existingB.includes(`prefix of: ${a.key}`)) {
          conflicts.set(b.key, [...existingB, ...b.actions, `prefix of: ${a.key}`])
        }
        const existingA = conflicts.get(a.key) ?? []
        if (!existingA.includes(`has prefix: ${b.key}`)) {
          conflicts.set(a.key, [...existingA, ...a.actions, `has prefix: ${b.key}`])
        }
      }
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
  return Array.from(conflicts.entries()).map(([key, actions]) => ({
    key,
    actions: actions.filter(a => !a.startsWith('prefix of:') && !a.startsWith('has prefix:')),
    type: actions.some(a => a.startsWith('prefix of:') || a.startsWith('has prefix:')) ? 'prefix' : 'duplicate',
  }))
}
