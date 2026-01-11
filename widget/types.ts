export interface ComedyWidgetConfig {
  // Comedian lookup - one of these is required
  comedianId?: string
  comedianName?: string

  // Required
  container: string | HTMLElement
  ticketUrl: string

  // Optional
  theme?: 'dark' | 'light'
  supabaseUrl?: string
  supabaseAnonKey?: string
  showTicketButton?: boolean
}

export interface WidgetComedian {
  id: string
  name: string
  bio: string | null
  photo_url: string | null
  youtube_url: string | null
  video_url: string | null
  ticket_url?: string
}
