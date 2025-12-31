const demos = ['table', 'canvas', 'calendar'] as const
const themes = ['light', 'dark'] as const

type ScreenshotConfig = {
  query: string
  width: number
  height: number
  selector?: string
  scrollTo?: string
  scrollOffset?: number
  preScreenshotSleep?: number
}

const screens: Record<string, ScreenshotConfig> = {}

// Generate light + dark screenshots for each demo
// scrollTo: '#demo' scrolls to the h1 title, scrollOffset: 16 adds padding above
for (const demo of demos) {
  for (const theme of themes) {
    screens[`${demo}-${theme}`] = {
      query: `${demo}?theme=${theme}`,
      width: 800,
      height: 500,
      selector: '#demo',
      scrollTo: '#demo',
      scrollOffset: 16,
      preScreenshotSleep: 500,
    }
  }
}

export default screens
