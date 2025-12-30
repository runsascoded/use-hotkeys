import { useCallback, useMemo, useState } from 'react'
import { Kbd, ShortcutsModal, useAction, useHotkeysContext } from 'use-kbd'
import 'use-kbd/styles.css'

type ViewMode = 'month' | 'week' | 'day'

interface CalendarEvent {
  id: number
  title: string
  date: Date
  color: string
}

const EVENT_COLORS = ['#ef4444', '#f97316', '#22c55e', '#3b82f6', '#a855f7']

function Calendar() {
  const ctx = useHotkeysContext()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<ViewMode>('month')
  const [events, setEvents] = useState<CalendarEvent[]>([
    { id: 1, title: 'Team Meeting', date: new Date(), color: '#3b82f6' },
    { id: 2, title: 'Project Review', date: new Date(Date.now() + 86400000 * 2), color: '#22c55e' },
    { id: 3, title: 'Launch Day', date: new Date(Date.now() + 86400000 * 7), color: '#ef4444' },
  ])
  const [nextEventId, setNextEventId] = useState(4)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  // Get calendar grid data
  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startPadding = firstDay.getDay()
    const totalDays = lastDay.getDate()

    const days: (Date | null)[] = []

    // Previous month padding
    for (let i = 0; i < startPadding; i++) {
      days.push(null)
    }

    // Current month days
    for (let i = 1; i <= totalDays; i++) {
      days.push(new Date(year, month, i))
    }

    return days
  }, [year, month])

  // Get events for a specific date
  const getEventsForDate = useCallback((date: Date) => {
    return events.filter(e =>
      e.date.getFullYear() === date.getFullYear() &&
      e.date.getMonth() === date.getMonth() &&
      e.date.getDate() === date.getDate()
    )
  }, [events])

  // Navigation
  const goToToday = useCallback(() => {
    const today = new Date()
    setCurrentDate(today)
    setSelectedDate(today)
  }, [])

  const prevPeriod = useCallback(() => {
    if (viewMode === 'month') {
      setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))
    } else if (viewMode === 'week') {
      setCurrentDate(d => new Date(d.getTime() - 7 * 86400000))
    } else {
      setCurrentDate(d => new Date(d.getTime() - 86400000))
    }
  }, [viewMode])

  const nextPeriod = useCallback(() => {
    if (viewMode === 'month') {
      setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))
    } else if (viewMode === 'week') {
      setCurrentDate(d => new Date(d.getTime() + 7 * 86400000))
    } else {
      setCurrentDate(d => new Date(d.getTime() + 86400000))
    }
  }, [viewMode])

  // Day navigation within month view
  const moveDayLeft = useCallback(() => {
    setSelectedDate(d => new Date(d.getTime() - 86400000))
  }, [])

  const moveDayRight = useCallback(() => {
    setSelectedDate(d => new Date(d.getTime() + 86400000))
  }, [])

  const moveDayUp = useCallback(() => {
    setSelectedDate(d => new Date(d.getTime() - 7 * 86400000))
  }, [])

  const moveDayDown = useCallback(() => {
    setSelectedDate(d => new Date(d.getTime() + 7 * 86400000))
  }, [])

  // Event management
  const createEvent = useCallback(() => {
    const title = prompt('Event title:')
    if (title) {
      const color = EVENT_COLORS[Math.floor(Math.random() * EVENT_COLORS.length)]
      setEvents(e => [...e, { id: nextEventId, title, date: selectedDate, color }])
      setNextEventId(id => id + 1)
    }
  }, [selectedDate, nextEventId])

  const deleteSelectedEvents = useCallback(() => {
    setEvents(e => e.filter(ev =>
      ev.date.getFullYear() !== selectedDate.getFullYear() ||
      ev.date.getMonth() !== selectedDate.getMonth() ||
      ev.date.getDate() !== selectedDate.getDate()
    ))
  }, [selectedDate])

  // Navigation actions
  useAction('nav:today', {
    label: 'Go to today',
    group: 'Calendar Navigation',
    defaultBindings: ['t'],
    handler: goToToday,
  })

  useAction('nav:prev', {
    label: 'Previous',
    group: 'Calendar Navigation',
    defaultBindings: ['h', 'arrowleft'],
    handler: moveDayLeft,
  })

  useAction('nav:next', {
    label: 'Next',
    group: 'Calendar Navigation',
    defaultBindings: ['l', 'arrowright'],
    handler: moveDayRight,
  })

  useAction('nav:up', {
    label: 'Week up',
    group: 'Calendar Navigation',
    defaultBindings: ['k', 'arrowup'],
    handler: moveDayUp,
  })

  useAction('nav:down', {
    label: 'Week down',
    group: 'Calendar Navigation',
    defaultBindings: ['j', 'arrowdown'],
    handler: moveDayDown,
  })

  useAction('nav:prev-period', {
    label: 'Prev month',
    group: 'Calendar Navigation',
    defaultBindings: ['['],
    handler: prevPeriod,
  })

  useAction('nav:next-period', {
    label: 'Next month',
    group: 'Calendar Navigation',
    defaultBindings: [']'],
    handler: nextPeriod,
  })

  // View mode actions
  useAction('view:month', {
    label: 'Month view',
    group: 'View',
    defaultBindings: ['m'],
    handler: useCallback(() => setViewMode('month'), []),
  })

  useAction('view:week', {
    label: 'Week view',
    group: 'View',
    defaultBindings: ['w'],
    handler: useCallback(() => setViewMode('week'), []),
  })

  useAction('view:day', {
    label: 'Day view',
    group: 'View',
    defaultBindings: ['d'],
    handler: useCallback(() => setViewMode('day'), []),
  })

  // Event actions
  useAction('event:create', {
    label: 'New event',
    group: 'Events',
    defaultBindings: ['n'],
    handler: createEvent,
  })

  useAction('event:delete', {
    label: 'Delete events',
    group: 'Events',
    defaultBindings: ['backspace'],
    handler: deleteSelectedEvents,
  })


  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December']

  const isToday = (date: Date | null) => {
    if (!date) return false
    const today = new Date()
    return date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
  }

  const isSelected = (date: Date | null) => {
    if (!date) return false
    return date.getFullYear() === selectedDate.getFullYear() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getDate() === selectedDate.getDate()
  }

  const selectedDateEvents = getEventsForDate(selectedDate)

  return (
    <div className="calendar-app">
      <h1>Calendar Demo</h1>
      <p className="hint">
        Press <Kbd action="global:0-help" /> for shortcuts. Use arrow keys or hjkl to navigate days.
      </p>

      <div className="calendar-header">
        <div className="calendar-nav">
          <button onClick={prevPeriod} title="Previous ([)">&lt;</button>
          <button onClick={goToToday} title="Today (T)">Today</button>
          <button onClick={nextPeriod} title="Next (])">&gt;</button>
        </div>
        <h2 className="calendar-title">{monthNames[month]} {year}</h2>
        <div className="view-toggle">
          {(['month', 'week', 'day'] as ViewMode[]).map(v => (
            <button
              key={v}
              className={viewMode === v ? 'active' : ''}
              onClick={() => setViewMode(v)}
            >
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {viewMode === 'month' && (
        <div className="calendar-grid">
          <div className="calendar-weekdays">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="weekday">{d}</div>
            ))}
          </div>
          <div className="calendar-days">
            {calendarDays.map((date, i) => (
              <div
                key={i}
                className={`calendar-day ${date ? '' : 'empty'} ${isToday(date) ? 'today' : ''} ${isSelected(date) ? 'selected' : ''}`}
                onClick={() => date && setSelectedDate(date)}
              >
                {date && (
                  <>
                    <span className="day-number">{date.getDate()}</span>
                    <div className="day-events">
                      {getEventsForDate(date).slice(0, 3).map(ev => (
                        <div
                          key={ev.id}
                          className="event-dot"
                          style={{ backgroundColor: ev.color }}
                          title={ev.title}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {viewMode === 'week' && (
        <div className="week-view">
          <p className="view-placeholder">Week view: {selectedDate.toLocaleDateString()}</p>
          <p>Navigate with arrow keys, [ ] to change weeks</p>
        </div>
      )}

      {viewMode === 'day' && (
        <div className="day-view">
          <p className="view-placeholder">Day view: {selectedDate.toLocaleDateString()}</p>
          <p>Navigate with h/l or left/right arrows</p>
        </div>
      )}

      <div className="selected-date-panel">
        <h3>{selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</h3>
        {selectedDateEvents.length === 0 ? (
          <p className="no-events">No events. Press <kbd>N</kbd> to create one.</p>
        ) : (
          <ul className="event-list">
            {selectedDateEvents.map(ev => (
              <li key={ev.id} className="event-item">
                <span className="event-color" style={{ backgroundColor: ev.color }} />
                <span className="event-title">{ev.title}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <ShortcutsModal
        editable
        groupOrder={['Calendar Navigation', 'View', 'Events', 'Global', 'Navigation']}
      />
    </div>
  )
}

export function CalendarDemo() {
  return <Calendar />
}
