// Types
export type {
  HotkeySequence,
  KeyCombination,
  KeyCombinationDisplay,
  RecordHotkeyOptions,
  RecordHotkeyResult,
} from './types'

export type { HandlerMap, HotkeyMap, UseHotkeysOptions, UseHotkeysResult } from './useHotkeys'
export type { UseEditableHotkeysOptions, UseEditableHotkeysResult } from './useEditableHotkeys'
export type {
  BindingInfo,
  KeybindingEditorProps,
  KeybindingEditorRenderProps,
} from './KeybindingEditor'
export type { ShortcutGroup, ShortcutsModalProps } from './ShortcutsModal'
export type {
  KeyboardShortcutsContextValue,
  KeyboardShortcutsProviderProps,
} from './KeyboardShortcutsContext'

// Context & Provider
export {
  KeyboardShortcutsProvider,
  useKeyboardShortcutsContext,
  useRegisteredHotkeys,
} from './KeyboardShortcutsContext'

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
  isSequence,
  normalizeKey,
  parseCombinationId,
  parseHotkeyString,
} from './utils'

export type { KeyConflict } from './utils'
