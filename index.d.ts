/**
 * Represents a captured key combination
 */
interface KeyCombination {
    /** The main key (lowercase, e.g., 'k', 'enter', 'arrowup') */
    key: string;
    /** Modifier keys pressed */
    modifiers: {
        ctrl: boolean;
        alt: boolean;
        shift: boolean;
        meta: boolean;
    };
}
/**
 * Platform-aware display format for a key combination
 */
interface KeyCombinationDisplay {
    /** Human-readable string (e.g., "⌘+Shift+K" on Mac, "Ctrl+Shift+K" elsewhere) */
    display: string;
    /** Canonical ID for storage/comparison (e.g., "ctrl+shift+k") */
    id: string;
}
/**
 * Result from the useRecordHotkey hook
 */
interface RecordHotkeyResult {
    /** Whether currently recording */
    isRecording: boolean;
    /** Start recording - returns cancel function */
    startRecording: () => () => void;
    /** Cancel recording */
    cancel: () => void;
    /** The captured combination (null until complete) */
    combination: KeyCombination | null;
    /** Display strings for the combination */
    display: KeyCombinationDisplay | null;
    /** Keys currently held down (for UI feedback during recording) */
    activeKeys: KeyCombination | null;
}
/**
 * Options for useRecordHotkey
 */
interface RecordHotkeyOptions {
    /** Called when a combination is captured */
    onCapture?: (combo: KeyCombination, display: KeyCombinationDisplay) => void;
    /** Called when recording is cancelled */
    onCancel?: () => void;
    /** Prevent default on captured keys (default: true) */
    preventDefault?: boolean;
}

/**
 * Hotkey definition - maps key combinations to action names
 */
type HotkeyMap = Record<string, string | string[]>;
/**
 * Handler map - maps action names to handler functions
 */
type HandlerMap = Record<string, (e: KeyboardEvent) => void>;
interface UseHotkeysOptions {
    /** Whether hotkeys are enabled (default: true) */
    enabled?: boolean;
    /** Element to attach listeners to (default: window) */
    target?: HTMLElement | Window | null;
    /** Prevent default on matched hotkeys (default: true) */
    preventDefault?: boolean;
    /** Stop propagation on matched hotkeys (default: true) */
    stopPropagation?: boolean;
    /** Enable hotkeys even when focused on input/textarea/select (default: false) */
    enableOnFormTags?: boolean;
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
declare function useHotkeys(keymap: HotkeyMap, handlers: HandlerMap, options?: UseHotkeysOptions): void;

/**
 * Hook to record a keyboard shortcut from user input.
 *
 * When recording starts, captures the next key combination the user presses.
 * Recording completes when all keys are released after pressing a non-modifier key.
 *
 * @example
 * ```tsx
 * function KeybindingEditor() {
 *   const { isRecording, startRecording, combination, display, activeKeys } = useRecordHotkey({
 *     onCapture: (combo, display) => {
 *       console.log('Captured:', display.display)
 *       saveKeybinding(display.id)
 *     }
 *   })
 *
 *   return (
 *     <button onClick={() => startRecording()}>
 *       {isRecording
 *         ? (activeKeys ? formatCombination(activeKeys).display : 'Press keys...')
 *         : (display?.display ?? 'Click to set')}
 *     </button>
 *   )
 * }
 * ```
 */
declare function useRecordHotkey(options?: RecordHotkeyOptions): RecordHotkeyResult;

/**
 * Detect if running on macOS
 */
declare function isMac(): boolean;
/**
 * Normalize a key name to a canonical form
 */
declare function normalizeKey(key: string): string;
/**
 * Format a key for display (platform-aware)
 */
declare function formatKeyForDisplay(key: string): string;
/**
 * Convert a KeyCombination to display format
 */
declare function formatCombination(combo: KeyCombination): KeyCombinationDisplay;
/**
 * Check if a key is a modifier key
 */
declare function isModifierKey(key: string): boolean;
/**
 * Parse a combination ID back to a KeyCombination
 */
declare function parseCombinationId(id: string): KeyCombination;

export { type HandlerMap, type HotkeyMap, type KeyCombination, type KeyCombinationDisplay, type RecordHotkeyOptions, type RecordHotkeyResult, type UseHotkeysOptions, formatCombination, formatKeyForDisplay, isMac, isModifierKey, normalizeKey, parseCombinationId, useHotkeys, useRecordHotkey };
