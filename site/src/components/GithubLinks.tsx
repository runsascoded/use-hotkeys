import { A } from './A'
import { Tooltip } from './Tooltip'

const GH_BASE = 'https://github.com/runsascoded/use-kbd/blob/main'

interface GHLinkProps {
  href: string
  name: string
  description: string
}

function GHLink({ href, name, description }: GHLinkProps) {
  return (
    <Tooltip title={description}>
      <A href={href}><code>{name}</code></A>
    </Tooltip>
  )
}

export function ShortcutsModal() {
  return <GHLink href={`${GH_BASE}/src/ShortcutsModal.tsx`} name="ShortcutsModal" description="Shows all shortcuts, allows rebinding" />
}

export function Omnibar() {
  return <GHLink href={`${GH_BASE}/src/Omnibar.tsx`} name="Omnibar" description="Searches available actions" />
}

export function LookupModal() {
  return <GHLink href={`${GH_BASE}/src/LookupModal.tsx`} name="LookupModal" description="Find actions by key-binding" />
}

export function SequenceModal() {
  return <GHLink href={`${GH_BASE}/src/SequenceModal.tsx`} name="SequenceModal" description="Shows pending keys and completions during sequence input" />
}

export function ActionLink() {
  return <GHLink href={`${GH_BASE}/site/src/components/ActionLink.tsx`} name="ActionLink" description="Navigation link that auto-registers as omnibar action" />
}

export function UseAction() {
  return <GHLink href={`${GH_BASE}/src/useAction.ts`} name="useAction" description="Hook to register functions as keyboard-accessible actions" />
}
