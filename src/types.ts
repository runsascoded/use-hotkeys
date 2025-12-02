/**
 * Represents a captured key combination
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
 * Platform-aware display format for a key combination
 */
export interface KeyCombinationDisplay {
  /** Human-readable string (e.g., "⌘+Shift+K" on Mac, "Ctrl+Shift+K" elsewhere) */
  display: string
  /** Canonical ID for storage/comparison (e.g., "ctrl+shift+k") */
  id: string
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
  /** The captured combination (null until complete) */
  combination: KeyCombination | null
  /** Display strings for the combination */
  display: KeyCombinationDisplay | null
  /** Keys currently held down (for UI feedback during recording) */
  activeKeys: KeyCombination | null
}

/**
 * Options for useRecordHotkey
 */
export interface RecordHotkeyOptions {
  /** Called when a combination is captured */
  onCapture?: (combo: KeyCombination, display: KeyCombinationDisplay) => void
  /** Called when recording is cancelled */
  onCancel?: () => void
  /** Prevent default on captured keys (default: true) */
  preventDefault?: boolean
}
