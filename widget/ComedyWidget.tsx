import { useState, useEffect } from 'react'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { ComedyWidgetConfig, WidgetComedian } from './types'
import { WidgetCard } from './WidgetCard'
import './styles.css'

export function ComedyWidget({
  comedianId,
  comedianName,
  ticketUrl,
  theme = 'dark',
  supabaseUrl,
  supabaseAnonKey,
  showTicketButton = true,
}: Omit<ComedyWidgetConfig, 'container'>) {
  const [comedian, setComedian] = useState<WidgetComedian | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadComedian()
  }, [comedianId, comedianName])

  const loadComedian = async () => {
    try {
      if (!comedianId && !comedianName) {
        throw new Error('Either comedianId or comedianName is required')
      }

      const url = supabaseUrl || import.meta.env.VITE_SUPABASE_URL
      const key = supabaseAnonKey || import.meta.env.VITE_SUPABASE_ANON_KEY

      if (!url || !key) {
        throw new Error('Supabase credentials not configured')
      }

      const supabase: SupabaseClient = createClient(url, key)

      let query = supabase
        .from('comedians')
        .select('id, name, bio, photo_url, youtube_url, video_url')

      if (comedianId) {
        query = query.eq('id', comedianId)
      } else if (comedianName) {
        query = query.ilike('name', comedianName)
      }

      const { data, error: queryError } = await query.single()

      if (queryError || !data) {
        throw new Error('Comedian not found')
      }

      setComedian(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load comedian')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className={`cpw-container cpw-theme-${theme}`}>
        <div className="cpw-loading">Loading...</div>
      </div>
    )
  }

  if (error || !comedian) {
    return (
      <div className={`cpw-container cpw-theme-${theme}`}>
        <div className="cpw-error">{error || 'Comedian not found'}</div>
      </div>
    )
  }

  return (
    <div className={`cpw-container cpw-theme-${theme}`}>
      <WidgetCard
        comedian={{ ...comedian, ticket_url: ticketUrl }}
        theme={theme}
        showTicketButton={showTicketButton}
      />
    </div>
  )
}
