import { Route, Routes, useLocation } from 'react-router-dom'
import {
  HotkeysProvider,
  Omnibar,
  useAction,
  useHotkeysContext,
} from 'use-kbd'
import 'use-kbd/styles.css'
import { ActionLink } from './components/ActionLink'
import { FloatingControls } from './components/FloatingControls'
import { Home } from './routes/Home'
import { TableDemo } from './routes/TableDemo'
import { CanvasDemo } from './routes/CanvasDemo'
import { CalendarDemo } from './routes/CalendarDemo'

function AppNav() {
  const location = useLocation()

  return (
    <nav className="nav">
      <ActionLink
        to="/"
        className={location.pathname === '/' ? 'active' : ''}
        label="Home"
        group="Navigation"
        defaultBinding="g h"
      >
        Home
      </ActionLink>
      <ActionLink
        to="/table"
        className={location.pathname === '/table' ? 'active' : ''}
        label="Data Table"
        group="Navigation"
        keywords={['grid', 'rows', 'sort']}
        defaultBinding="g t"
      >
        Table
      </ActionLink>
      <ActionLink
        to="/canvas"
        className={location.pathname === '/canvas' ? 'active' : ''}
        label="Canvas"
        group="Navigation"
        keywords={['draw', 'paint', 'sketch']}
        defaultBinding="g c"
      >
        Canvas
      </ActionLink>
      <ActionLink
        to="/calendar"
        className={location.pathname === '/calendar' ? 'active' : ''}
        label="Calendar"
        group="Navigation"
        keywords={['events', 'schedule', 'dates']}
        defaultBinding="g a"
      >
        Calendar
      </ActionLink>
    </nav>
  )
}

function GlobalActions() {
  const ctx = useHotkeysContext()

  useAction('global:0-help', {
    label: 'Show shortcuts',
    group: 'Global',
    defaultBindings: ['?'],
    handler: () => ctx.toggleModal(),
  })

  useAction('global:1-omnibar', {
    label: 'Command palette',
    group: 'Global',
    defaultBindings: ['meta+k'],
    handler: () => ctx.openOmnibar(),
  })

  return null
}

function AppContent() {
  return (
    <div className="app">
      <AppNav />
      <GlobalActions />
      <main className="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/table" element={<TableDemo />} />
          <Route path="/canvas" element={<CanvasDemo />} />
          <Route path="/calendar" element={<CalendarDemo />} />
        </Routes>
      </main>
      <Omnibar />
      <FloatingControls />
    </div>
  )
}

export default function App() {
  return (
    <HotkeysProvider
      config={{
        storageKey: 'use-kbd-demo',
        sequenceTimeout: 1000,
      }}
    >
      <AppContent />
    </HotkeysProvider>
  )
}
