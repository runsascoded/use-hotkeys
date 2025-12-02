import { useCallback, useEffect, useState } from 'react'
import type { HotkeyMap } from './useHotkeys'
import { useHotkeys } from './useHotkeys'
import { formatCombination, parseCombinationId } from './utils'

export interface ShortcutGroup {
  name: string
  shortcuts: Array<{ key: string; action: string; description?: string }>
}

export interface ShortcutsModalProps {
  /** The hotkey map to display */
  keymap: HotkeyMap
  /** Descriptions for actions (action name -> description) */
  descriptions?: Record<string, string>
  /** Group definitions (if omitted, actions are grouped by prefix before ':') */
  groups?: Record<string, string>
  /** Control visibility externally */
  isOpen?: boolean
  /** Called when modal should close */
  onClose?: () => void
  /** Hotkey to open modal (default: '?') */
  openKey?: string
  /** Whether to auto-register the open hotkey (default: true) */
  autoRegisterOpen?: boolean
  /** Custom render function for the modal content */
  children?: (props: { groups: ShortcutGroup[]; close: () => void }) => React.ReactNode
  /** CSS class for the backdrop */
  backdropClassName?: string
  /** CSS class for the modal container */
  modalClassName?: string
}

/**
 * Parse action name to extract group.
 * e.g., "metric:temp" -> { group: "metric", action: "temp" }
 */
function parseAction(action: string): { group: string; name: string } {
  const colonIndex = action.indexOf(':')
  if (colonIndex > 0) {
    return { group: action.slice(0, colonIndex), name: action.slice(colonIndex + 1) }
  }
  return { group: 'General', name: action }
}

/**
 * Organize keymap into groups for display.
 */
function organizeShortcuts(
  keymap: HotkeyMap,
  descriptions?: Record<string, string>,
  groupNames?: Record<string, string>,
): ShortcutGroup[] {
  const groupMap = new Map<string, ShortcutGroup>()

  for (const [key, actionOrActions] of Object.entries(keymap)) {
    const actions = Array.isArray(actionOrActions) ? actionOrActions : [actionOrActions]

    for (const action of actions) {
      const { group: groupKey, name } = parseAction(action)
      const groupName = groupNames?.[groupKey] ?? groupKey

      if (!groupMap.has(groupName)) {
        groupMap.set(groupName, { name: groupName, shortcuts: [] })
      }

      groupMap.get(groupName)!.shortcuts.push({
        key,
        action,
        description: descriptions?.[action] ?? name,
      })
    }
  }

  // Sort groups: "General" last, others alphabetically
  return Array.from(groupMap.values()).sort((a, b) => {
    if (a.name === 'General') return 1
    if (b.name === 'General') return -1
    return a.name.localeCompare(b.name)
  })
}

/**
 * Modal component for displaying keyboard shortcuts.
 *
 * @example
 * ```tsx
 * <ShortcutsModal
 *   keymap={HOTKEYS}
 *   descriptions={{ 'metric:temp': 'Switch to temperature view' }}
 * />
 * ```
 */
export function ShortcutsModal({
  keymap,
  descriptions,
  groups: groupNames,
  isOpen: controlledIsOpen,
  onClose,
  openKey = '?',
  autoRegisterOpen = true,
  children,
  backdropClassName,
  modalClassName,
}: ShortcutsModalProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false)
  const isOpen = controlledIsOpen ?? internalIsOpen

  const close = useCallback(() => {
    setInternalIsOpen(false)
    onClose?.()
  }, [onClose])

  const open = useCallback(() => {
    setInternalIsOpen(true)
  }, [])

  // Register open/close hotkeys
  const modalKeymap = autoRegisterOpen ? { [openKey]: 'openShortcuts' } : {}
  useHotkeys(
    { ...modalKeymap, escape: 'closeShortcuts' },
    {
      openShortcuts: open,
      closeShortcuts: close,
    },
    { enabled: autoRegisterOpen || isOpen },
  )

  // Close on backdrop click
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        close()
      }
    },
    [close],
  )

  // Organize shortcuts into groups
  const shortcutGroups = organizeShortcuts(keymap, descriptions, groupNames)

  if (!isOpen) return null

  // Custom render
  if (children) {
    return <>{children({ groups: shortcutGroups, close })}</>
  }

  // Default render
  return (
    <div
      className={backdropClassName}
      onClick={handleBackdropClick}
      style={
        backdropClassName
          ? undefined
          : {
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
            }
      }
    >
      <div
        className={modalClassName}
        role="dialog"
        aria-modal="true"
        aria-label="Keyboard shortcuts"
        style={
          modalClassName
            ? undefined
            : {
                backgroundColor: 'white',
                borderRadius: '8px',
                padding: '24px',
                maxWidth: '600px',
                maxHeight: '80vh',
                overflow: 'auto',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
              }
        }
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>Keyboard Shortcuts</h2>
          <button
            onClick={close}
            aria-label="Close"
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              padding: '4px',
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        {shortcutGroups.map((group) => (
          <div key={group.name} style={{ marginBottom: '16px' }}>
            <h3 style={{ margin: '0 0 8px', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', color: '#666' }}>
              {group.name}
            </h3>
            <dl style={{ margin: 0 }}>
              {group.shortcuts.map(({ key, action, description }) => {
                const combo = parseCombinationId(key)
                const display = formatCombination(combo)
                return (
                  <div
                    key={action}
                    style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #eee' }}
                  >
                    <dt style={{ color: '#333' }}>{description}</dt>
                    <dd style={{ margin: 0, fontFamily: 'monospace', color: '#666' }}>
                      <kbd style={{ backgroundColor: '#f5f5f5', padding: '2px 6px', borderRadius: '4px', border: '1px solid #ddd' }}>
                        {display.display}
                      </kbd>
                    </dd>
                  </div>
                )
              })}
            </dl>
          </div>
        ))}
      </div>
    </div>
  )
}
