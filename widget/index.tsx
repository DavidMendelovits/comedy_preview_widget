import { createRoot, Root } from 'react-dom/client'
import { ComedyWidget } from './ComedyWidget'
import { ComedyWidgetConfig } from './types'

// Store roots for cleanup
const roots: Map<string | HTMLElement, Root> = new Map()

/**
 * Initialize the Comedy Preview Widget
 */
function init(config: ComedyWidgetConfig): void {
  const { container, ...props } = config

  // Validate required fields
  if (!props.comedianId && !props.comedianName) {
    console.error('[ComedyWidget] Either comedianId or comedianName is required')
    return
  }

  if (!props.ticketUrl) {
    console.error('[ComedyWidget] ticketUrl is required')
    return
  }

  // Find container element
  const containerElement =
    typeof container === 'string'
      ? document.querySelector(container)
      : container

  if (!containerElement) {
    console.error(`[ComedyWidget] Container not found: ${container}`)
    return
  }

  // Cleanup existing root if any
  const existingRoot = roots.get(container)
  if (existingRoot) {
    existingRoot.unmount()
  }

  // Create new root and render
  const root = createRoot(containerElement)
  roots.set(container, root)

  root.render(<ComedyWidget {...props} />)
}

/**
 * Destroy a widget instance
 */
function destroy(container: string | HTMLElement): void {
  const root = roots.get(container)
  if (root) {
    root.unmount()
    roots.delete(container)
  }
}

// Export for script tag usage
const ComedyWidgetAPI = { init, destroy }

// Attach to window for script tag usage
if (typeof window !== 'undefined') {
  (window as unknown as { ComedyWidget: typeof ComedyWidgetAPI }).ComedyWidget = ComedyWidgetAPI
}

// Export for npm usage
export { ComedyWidget, init, destroy }
export type { ComedyWidgetConfig, WidgetComedian } from './types'
