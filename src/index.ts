// Types
export type {
  KeyCombination,
  KeyCombinationDisplay,
  RecordHotkeyOptions,
  RecordHotkeyResult,
} from './types'

export type { HandlerMap, HotkeyMap, UseHotkeysOptions } from './useHotkeys'
export type { UseEditableHotkeysOptions, UseEditableHotkeysResult } from './useEditableHotkeys'
export type {
  BindingInfo,
  KeybindingEditorProps,
  KeybindingEditorRenderProps,
} from './KeybindingEditor'
export type { ShortcutGroup, ShortcutsModalProps } from './ShortcutsModal'

// Hooks
export { useHotkeys } from './useHotkeys'
export { useRecordHotkey } from './useRecordHotkey'
export { useEditableHotkeys } from './useEditableHotkeys'

// Components
export { KeybindingEditor } from './KeybindingEditor'
export { ShortcutsModal } from './ShortcutsModal'

// Utilities
export {
  findConflicts,
  formatCombination,
  formatKeyForDisplay,
  getConflictsArray,
  hasConflicts,
  isMac,
  isModifierKey,
  normalizeKey,
  parseCombinationId,
} from './utils'

export type { KeyConflict } from './utils'
