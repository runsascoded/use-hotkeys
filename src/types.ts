/**
 * Represents a single key press (possibly with modifiers)
 */
export interface KeyCombination {
  /** The main key (lowercase, e.g., 'k', 'enter', 'arrowup') */
  key: string
  /** Modifier keys pressed */
  modifiers: {
    ctrl: boolean
    alt: boolean
    shift: boolean
    meta: boolean
  }
}

/**
 * Represents a hotkey - either a single key or a sequence of keys.
 * Single key: [{ key: 'k', modifiers: {...} }]
 * Sequence: [{ key: '2', ... }, { key: 'w', ... }]
 */
export type HotkeySequence = KeyCombination[]

/**
 * Platform-aware display format for a key combination or sequence
 */
export interface KeyCombinationDisplay {
  /** Human-readable string (e.g., "⌘⇧K" on Mac, "Ctrl+Shift+K" elsewhere, "2 W" for sequence) */
  display: string
  /** Canonical ID for storage/comparison (e.g., "ctrl+shift+k", "2 w" for sequence) */
  id: string
  /** Whether this is a sequence (multiple keys pressed in order) */
  isSequence: boolean
}

/**
 * Result from the useRecordHotkey hook
 */
export interface RecordHotkeyResult {
  /** Whether currently recording */
  isRecording: boolean
  /** Start recording - returns cancel function */
  startRecording: () => () => void
  /** Cancel recording */
  cancel: () => void
  /** The captured sequence (null until complete) */
  sequence: HotkeySequence | null
  /** Display strings for the sequence */
  display: KeyCombinationDisplay | null
  /** Keys captured so far during recording (for live UI feedback) */
  pendingKeys: HotkeySequence
  /** The key currently being held (for live UI feedback during recording) */
  activeKeys: KeyCombination | null
  /**
   * @deprecated Use `sequence` instead
   */
  combination: KeyCombination | null
}

/**
 * Options for useRecordHotkey
 */
export interface RecordHotkeyOptions {
  /** Called when a sequence is captured (timeout or Enter) */
  onCapture?: (sequence: HotkeySequence, display: KeyCombinationDisplay) => void
  /** Called when recording is cancelled */
  onCancel?: () => void
  /** Prevent default on captured keys (default: true) */
  preventDefault?: boolean
  /** Timeout in ms before sequence is submitted (default: 1000) */
  sequenceTimeout?: number
}
