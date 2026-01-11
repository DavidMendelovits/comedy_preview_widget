export interface ComedyWidgetConfig {
  widgetKey: string
  container: string | HTMLElement
  theme?: 'dark' | 'light'
  columns?: 1 | 2 | 3 | 4
  supabaseUrl?: string
  supabaseAnonKey?: string
  // Modal/trigger options
  triggerText?: string
  triggerPosition?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  expandOn?: 'hover' | 'click'
}

export interface WidgetComedian {
  id: string
  name: string
  bio: string | null
  photo_url: string | null
  youtube_url: string | null
  video_url: string | null
  ticket_url: string
}
