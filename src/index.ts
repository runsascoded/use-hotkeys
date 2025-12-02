// Types
export type {
  KeyCombination,
  KeyCombinationDisplay,
  RecordHotkeyOptions,
  RecordHotkeyResult,
} from './types'

// Hooks
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
