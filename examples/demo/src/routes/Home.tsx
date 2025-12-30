import { Link } from 'react-router-dom'
import { ShortcutsModal } from 'use-kbd'

export function Home() {
  return (
    <div className="home">
      <h1>use-kbd demos</h1>
      <p>Keyboard-first UX for React apps: action registration, editable key bindings (including sequences), shortcuts modal, and omnibar.</p>
      <p className="hint">
        Press <kbd>?</kbd> for shortcuts or <kbd>Cmd+K</kbd> for command palette.
      </p>

      <div className="demos">
        <section>
          <h2><Link to="/table">Data Table</Link></h2>
          <p>
            Sortable, paginated data table with multi-select and keyboard navigation.
          </p>
          <ul>
            <li>Multi-select with Shift+arrows (Superhuman-style)</li>
            <li>Two-column shortcut layout (asc/desc pairs)</li>
            <li>Modifier key icons (<kbd>Cmd</kbd>, <kbd>Ctrl</kbd>, <kbd>Shift</kbd>)</li>
            <li>Custom group renderers for shortcuts modal</li>
          </ul>
          <p className="source-link">
            <a href="https://github.com/runsascoded/use-kbd/tree/main/examples/demo/src/routes/TableDemo.tsx" target="_blank" rel="noopener noreferrer">
              View source
            </a>
          </p>
        </section>

        <section>
          <h2><Link to="/canvas">Canvas</Link></h2>
          <p>
            Simple drawing app with tool and color shortcuts.
          </p>
          <ul>
            <li>Tool hotkeys: <kbd>P</kbd>en, <kbd>E</kbd>raser, <kbd>L</kbd>ine, <kbd>R</kbd>ect, <kbd>O</kbd> circle</li>
            <li>Number keys for colors</li>
            <li>Undo/redo with <kbd>Cmd+Z</kbd> / <kbd>Cmd+Shift+Z</kbd></li>
            <li>Discoverable via omnibar</li>
          </ul>
          <p className="source-link">
            <a href="https://github.com/runsascoded/use-kbd/tree/main/examples/demo/src/routes/CanvasDemo.tsx" target="_blank" rel="noopener noreferrer">
              View source
            </a>
          </p>
        </section>

        <section>
          <h2><Link to="/calendar">Calendar</Link></h2>
          <p>
            Calendar with vim-style navigation and view switching.
          </p>
          <ul>
            <li>Vim navigation: <kbd>H</kbd><kbd>J</kbd><kbd>K</kbd><kbd>L</kbd> or arrows</li>
            <li>View modes: <kbd>M</kbd>onth, <kbd>W</kbd>eek, <kbd>D</kbd>ay</li>
            <li>Quick jump: <kbd>T</kbd>oday, <kbd>[</kbd>/<kbd>]</kbd> months</li>
            <li>Event management: <kbd>N</kbd>ew, <kbd>Backspace</kbd> delete</li>
          </ul>
          <p className="source-link">
            <a href="https://github.com/runsascoded/use-kbd/tree/main/examples/demo/src/routes/CalendarDemo.tsx" target="_blank" rel="noopener noreferrer">
              View source
            </a>
          </p>
        </section>
      </div>

      <section className="features">
        <h2>Features</h2>
        <ul>
          <li><strong>ActionLink</strong> - Navigation links auto-register as omnibar actions</li>
          <li><strong>Global Omnibar</strong> - Search all actions across pages</li>
          <li><strong>Editable Shortcuts</strong> - Click any shortcut in modal to rebind</li>
          <li><strong>Persisted Bindings</strong> - Custom shortcuts saved to localStorage</li>
          <li><strong>Sequences</strong> - Multi-key shortcuts like <kbd>G T</kbd></li>
        </ul>
      </section>

      <ShortcutsModal editable groupOrder={['Global', 'Navigation']} />
    </div>
  )
}
