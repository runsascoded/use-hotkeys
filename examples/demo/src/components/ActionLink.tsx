import { useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { LinkProps } from 'react-router-dom'
import { useMaybeHotkeysContext } from 'use-kbd'

export interface ActionLinkProps extends Omit<LinkProps, 'to'> {
  /** The route to navigate to */
  to: string
  /** Action ID (defaults to `link:${to}`) */
  actionId?: string
  /** Label shown in omnibar/modal (defaults to children text) */
  label?: string
  /** Group for organizing in modal (defaults to 'Links') */
  group?: string
  /** Additional search keywords for omnibar */
  keywords?: string[]
  /** Default keybinding (optional) */
  defaultBinding?: string
}

/**
 * A Link component that auto-registers as an action in the hotkeys system.
 *
 * This makes the link discoverable via omnibar search and optionally
 * assignable to a keyboard shortcut.
 *
 * @example
 * ```tsx
 * <ActionLink to="/docs" label="Documentation" keywords={['help', 'guide']}>
 *   Docs
 * </ActionLink>
 *
 * <ActionLink to="/settings" defaultBinding="g s">
 *   Settings
 * </ActionLink>
 * ```
 */
export function ActionLink({
  to,
  actionId,
  label,
  group = 'Links',
  keywords,
  defaultBinding,
  children,
  ...linkProps
}: ActionLinkProps) {
  const ctx = useMaybeHotkeysContext()
  const navigate = useNavigate()

  // Derive label from children if not provided
  const effectiveLabel = label ?? (typeof children === 'string' ? children : to)
  const effectiveActionId = actionId ?? `link:${to}`

  // Use a ref for the handler to avoid re-registration when navigate changes
  const handlerRef = useRef(() => navigate(to))
  handlerRef.current = () => navigate(to)

  // Memoize keywords to avoid infinite loops (array reference changes each render)
  const keywordsKey = keywords?.join(',') ?? ''

  // Store registry ref to avoid re-running effect when context object changes
  const registryRef = useRef(ctx?.registry)
  registryRef.current = ctx?.registry

  // Register as action when mounted - use empty deps to run only once
  // Use refs to access current values without triggering re-runs
  useEffect(() => {
    const registry = registryRef.current
    if (!registry) return

    registry.register(effectiveActionId, {
      label: effectiveLabel,
      group,
      keywords,
      defaultBindings: defaultBinding ? [defaultBinding] : [],
      handler: () => handlerRef.current(),
    })

    return () => {
      registry.unregister(effectiveActionId)
    }
    // Only re-register if the action identity changes, not on every context update
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveActionId, effectiveLabel, group, keywordsKey, defaultBinding])

  return (
    <Link to={to} {...linkProps}>
      {children}
    </Link>
  )
}
