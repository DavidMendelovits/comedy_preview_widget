export interface Comedian {
  id: string
  user_id: string
  name: string
  bio: string | null
  photo_url: string | null
  youtube_url: string | null
  video_url: string | null
  video_path: string | null
  transcription: string | null
  subtitles_url: string | null
  transcription_status: 'none' | 'pending' | 'processing' | 'completed' | 'failed'
  created_at: string
  updated_at: string
}

export interface Club {
  id: string
  user_id: string
  name: string
  website_url: string | null
  widget_key: string
  created_at: string
}

export interface ClubComedian {
  id: string
  club_id: string
  comedian_id: string
  ticket_url: string
  show_date: string | null
  display_order: number
  is_active: boolean
  created_at: string
  comedian?: Comedian
}

export interface User {
  id: string
  email: string
  user_type: 'comedian' | 'club'
}

export type UserType = 'comedian' | 'club'
