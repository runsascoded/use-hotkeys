# use-hotkeys Roadmap

React hooks library for keyboard shortcuts with runtime editing and key capture.

## Current Features (v0.0.1)

### `useHotkeys(keymap, handlers, options?)`
Declarative keyboard shortcut registration:
```tsx
useHotkeys(
  { 't': 'setTemp', 'ctrl+s': 'save', 'shift+?': 'showHelp' },
  { setTemp: () => setMetric('temp'), save: handleSave, showHelp: () => setShowHelp(true) }
)
```

### `useRecordHotkey(options?)`
Capture key combinations from user input:
```tsx
const { isRecording, startRecording, combination, display, activeKeys } = useRecordHotkey({
  onCapture: (combo, display) => console.log(`Captured: ${display.display}`)
})
```

### Utilities
- `formatCombination(combo)` - platform-aware display (⌘⇧K on Mac, Ctrl+Shift+K elsewhere)
- `normalizeKey(key)` - canonical key names
- `parseCombinationId(id)` - parse "ctrl+shift+k" back to KeyCombination

## Next Up

### `<ShortcutsModal>` component
Show all registered shortcuts in a modal, triggered by `?` key:
```tsx
<ShortcutsModal
  keymap={HOTKEY_MAP}
  descriptions={{
    'metric:temp': 'Switch to temperature',
    'save': 'Save changes',
  }}
/>
```

Features:
- Auto-registers `?` or `shift+/` to open
- Groups shortcuts by category (parsed from action names or explicit grouping)
- Shows platform-appropriate key symbols
- Keyboard-navigable, closes on Escape

### `<KeybindingEditor>` component
UI for viewing and editing keybindings:
```tsx
<KeybindingEditor
  keymap={keymap}
  descriptions={descriptions}
  onChange={(newKeymap) => setKeymap(newKeymap)}
/>
```

Features:
- Lists all shortcuts with current bindings
- Click to edit, uses `useRecordHotkey` for capture
- Reset to defaults button
- Conflict detection (warns if key already bound)

### `useEditableHotkeys` hook
Wraps `useHotkeys` with persistence and editing:
```tsx
const { keymap, setKeymap, reset } = useEditableHotkeys(
  DEFAULT_KEYMAP,
  handlers,
  { storageKey: 'app-hotkeys' }
)
```

Features:
- Merges user overrides with defaults
- Persists to localStorage (or custom storage)
- `reset()` clears overrides

## Future Ideas

- **Chord support**: `ctrl+k ctrl+c` (VS Code style sequences)
- **Scope/context**: Different keymaps for different app states
- **Conflict detection API**: `findConflicts(keymap1, keymap2)`
- **Import/export**: JSON format for sharing keybindings
- **Vim-style modes**: Normal/insert mode awareness
