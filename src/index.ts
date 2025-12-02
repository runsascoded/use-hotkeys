// Types
export type {
  KeyCombination,
  KeyCombinationDisplay,
  RecordHotkeyOptions,
  RecordHotkeyResult,
} from './types'

export type { HandlerMap, HotkeyMap, UseHotkeysOptions } from './useHotkeys'

// Hooks
export { useHotkeys } from './useHotkeys'
export { useRecordHotkey } from './useRecordHotkey'

// Utilities
export {
  formatCombination,
  formatKeyForDisplay,
  isMac,
  isModifierKey,
  normalizeKey,
  parseCombinationId,
} from './utils'
