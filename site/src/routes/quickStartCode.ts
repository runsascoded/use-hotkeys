export const quickStartCode = `import { HotkeysProvider, ShortcutsModal, Omnibar, SequenceModal, useAction } from 'use-kbd'
import 'use-kbd/styles.css'

function App() {
  return (
    <HotkeysProvider>
      <Dashboard />
      <ShortcutsModal />
      <Omnibar />
      <SequenceModal />
    </HotkeysProvider>
  )
}

function Dashboard() {
  const { save } = useDocument()

  useAction('doc:save', {
    label: 'Save document',
    group: 'Document',
    defaultBindings: ['meta+s'],
    handler: save,
  })

  return <Editor />
}`
