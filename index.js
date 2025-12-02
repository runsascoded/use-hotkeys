import { useRef, useEffect, useState, useCallback } from 'react';

// src/useHotkeys.ts

// src/utils.ts
function isMac() {
  if (typeof navigator === "undefined") return false;
  return /Mac|iPod|iPhone|iPad/.test(navigator.platform);
}
function normalizeKey(key) {
  const keyMap = {
    " ": "space",
    "Escape": "escape",
    "Enter": "enter",
    "Tab": "tab",
    "Backspace": "backspace",
    "Delete": "delete",
    "ArrowUp": "arrowup",
    "ArrowDown": "arrowdown",
    "ArrowLeft": "arrowleft",
    "ArrowRight": "arrowright",
    "Home": "home",
    "End": "end",
    "PageUp": "pageup",
    "PageDown": "pagedown"
  };
  if (key in keyMap) {
    return keyMap[key];
  }
  if (key.length === 1) {
    return key.toLowerCase();
  }
  if (/^F\d{1,2}$/.test(key)) {
    return key.toLowerCase();
  }
  return key.toLowerCase();
}
function formatKeyForDisplay(key) {
  const displayMap = {
    "space": "Space",
    "escape": "Esc",
    "enter": "\u21B5",
    "tab": "Tab",
    "backspace": "\u232B",
    "delete": "Del",
    "arrowup": "\u2191",
    "arrowdown": "\u2193",
    "arrowleft": "\u2190",
    "arrowright": "\u2192",
    "home": "Home",
    "end": "End",
    "pageup": "PgUp",
    "pagedown": "PgDn"
  };
  if (key in displayMap) {
    return displayMap[key];
  }
  if (/^f\d{1,2}$/.test(key)) {
    return key.toUpperCase();
  }
  if (key.length === 1) {
    return key.toUpperCase();
  }
  return key;
}
function formatCombination(combo) {
  const mac = isMac();
  const parts = [];
  const idParts = [];
  if (combo.modifiers.ctrl) {
    parts.push(mac ? "\u2303" : "Ctrl");
    idParts.push("ctrl");
  }
  if (combo.modifiers.meta) {
    parts.push(mac ? "\u2318" : "Win");
    idParts.push("meta");
  }
  if (combo.modifiers.alt) {
    parts.push(mac ? "\u2325" : "Alt");
    idParts.push("alt");
  }
  if (combo.modifiers.shift) {
    parts.push(mac ? "\u21E7" : "Shift");
    idParts.push("shift");
  }
  parts.push(formatKeyForDisplay(combo.key));
  idParts.push(combo.key);
  return {
    display: mac ? parts.join("") : parts.join("+"),
    id: idParts.join("+")
  };
}
function isModifierKey(key) {
  return ["Control", "Alt", "Shift", "Meta"].includes(key);
}
function parseCombinationId(id) {
  const parts = id.toLowerCase().split("+");
  const key = parts[parts.length - 1];
  return {
    key,
    modifiers: {
      ctrl: parts.includes("ctrl"),
      alt: parts.includes("alt"),
      shift: parts.includes("shift"),
      meta: parts.includes("meta")
    }
  };
}

// src/useHotkeys.ts
function parseHotkey(hotkey) {
  const parts = hotkey.toLowerCase().split("+");
  const key = parts[parts.length - 1];
  return {
    ctrl: parts.includes("ctrl") || parts.includes("control"),
    alt: parts.includes("alt") || parts.includes("option"),
    shift: parts.includes("shift"),
    meta: parts.includes("meta") || parts.includes("cmd") || parts.includes("command"),
    key
  };
}
function matchesHotkey(e, hotkey) {
  const eventKey = normalizeKey(e.key);
  return e.ctrlKey === hotkey.ctrl && e.altKey === hotkey.alt && e.shiftKey === hotkey.shift && e.metaKey === hotkey.meta && eventKey === hotkey.key;
}
function useHotkeys(keymap, handlers, options = {}) {
  const {
    enabled = true,
    target,
    preventDefault = true,
    stopPropagation = true,
    enableOnFormTags = false
  } = options;
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;
  const keymapRef = useRef(keymap);
  keymapRef.current = keymap;
  useEffect(() => {
    if (!enabled) return;
    const targetElement = target ?? window;
    const handleKeyDown = (e) => {
      if (!enableOnFormTags) {
        const target2 = e.target;
        if (target2 instanceof HTMLInputElement || target2 instanceof HTMLTextAreaElement || target2 instanceof HTMLSelectElement || target2.isContentEditable) {
          return;
        }
      }
      if (isModifierKey(e.key)) {
        return;
      }
      for (const [hotkeyStr, actionName] of Object.entries(keymapRef.current)) {
        const hotkey = parseHotkey(hotkeyStr);
        if (matchesHotkey(e, hotkey)) {
          const actions = Array.isArray(actionName) ? actionName : [actionName];
          for (const action of actions) {
            const handler = handlersRef.current[action];
            if (handler) {
              if (preventDefault) {
                e.preventDefault();
              }
              if (stopPropagation) {
                e.stopPropagation();
              }
              handler(e);
              return;
            }
          }
        }
      }
    };
    targetElement.addEventListener("keydown", handleKeyDown);
    return () => {
      targetElement.removeEventListener("keydown", handleKeyDown);
    };
  }, [enabled, target, preventDefault, stopPropagation, enableOnFormTags]);
}
function useEventCallback(fn) {
  const ref = useRef(fn);
  ref.current = fn;
  return useCallback(((...args) => ref.current?.(...args)), []);
}
function useRecordHotkey(options = {}) {
  const { onCapture: onCaptureProp, onCancel: onCancelProp, preventDefault = true } = options;
  const onCapture = useEventCallback(onCaptureProp);
  const onCancel = useEventCallback(onCancelProp);
  const [isRecording, setIsRecording] = useState(false);
  const [combination, setCombination] = useState(null);
  const [activeKeys, setActiveKeys] = useState(null);
  const pressedKeysRef = useRef(/* @__PURE__ */ new Set());
  const hasNonModifierRef = useRef(false);
  const currentComboRef = useRef(null);
  const cancel = useCallback(() => {
    setIsRecording(false);
    setActiveKeys(null);
    pressedKeysRef.current.clear();
    hasNonModifierRef.current = false;
    currentComboRef.current = null;
    onCancel?.();
  }, [onCancel]);
  const startRecording = useCallback(() => {
    setIsRecording(true);
    setCombination(null);
    setActiveKeys(null);
    pressedKeysRef.current.clear();
    hasNonModifierRef.current = false;
    currentComboRef.current = null;
    return cancel;
  }, [cancel]);
  useEffect(() => {
    if (!isRecording) return;
    const handleKeyDown = (e) => {
      if (preventDefault) {
        e.preventDefault();
        e.stopPropagation();
      }
      const key = e.key;
      pressedKeysRef.current.add(key);
      const combo = {
        key: "",
        modifiers: {
          ctrl: e.ctrlKey,
          alt: e.altKey,
          shift: e.shiftKey,
          meta: e.metaKey
        }
      };
      for (const k of pressedKeysRef.current) {
        if (!isModifierKey(k)) {
          combo.key = normalizeKey(k);
          hasNonModifierRef.current = true;
          break;
        }
      }
      if (combo.key) {
        currentComboRef.current = combo;
        setActiveKeys(combo);
      } else {
        setActiveKeys({
          key: "",
          modifiers: combo.modifiers
        });
      }
    };
    const handleKeyUp = (e) => {
      if (preventDefault) {
        e.preventDefault();
        e.stopPropagation();
      }
      pressedKeysRef.current.delete(e.key);
      const shouldComplete = pressedKeysRef.current.size === 0 || e.key === "Meta" && hasNonModifierRef.current;
      if (shouldComplete && hasNonModifierRef.current && currentComboRef.current) {
        const combo = currentComboRef.current;
        const display2 = formatCombination(combo);
        pressedKeysRef.current.clear();
        hasNonModifierRef.current = false;
        currentComboRef.current = null;
        setCombination(combo);
        setIsRecording(false);
        setActiveKeys(null);
        onCapture?.(combo, display2);
      }
    };
    window.addEventListener("keydown", handleKeyDown, true);
    window.addEventListener("keyup", handleKeyUp, true);
    return () => {
      window.removeEventListener("keydown", handleKeyDown, true);
      window.removeEventListener("keyup", handleKeyUp, true);
    };
  }, [isRecording, preventDefault]);
  const display = combination ? formatCombination(combination) : null;
  return {
    isRecording,
    startRecording,
    cancel,
    combination,
    display,
    activeKeys
  };
}

export { formatCombination, formatKeyForDisplay, isMac, isModifierKey, normalizeKey, parseCombinationId, useHotkeys, useRecordHotkey };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map