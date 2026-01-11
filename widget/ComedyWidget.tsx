import { useState, useEffect, useRef } from 'react'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { ComedyWidgetConfig, WidgetComedian } from './types'
import { TriggerButton } from './TriggerButton'
import { WidgetModal } from './WidgetModal'
import './styles.css'

// Main widget component
export function ComedyWidget({
  widgetKey,
  theme = 'dark',
  columns = 3,
  supabaseUrl,
  supabaseAnonKey,
  triggerText = 'See Tonight\'s Lineup',
  triggerPosition = 'bottom-right',
  expandOn = 'click',
}: ComedyWidgetConfig) {
  const [comedians, setComedians] = useState<WidgetComedian[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const hoverTimeoutRef = useRef<number | null>(null)

  useEffect(() => {
    loadComedians()
  }, [widgetKey])

  const loadComedians = async () => {
    try {
      // Use provided Supabase credentials or fall back to env vars
      const url = supabaseUrl || import.meta.env.VITE_SUPABASE_URL
      const key = supabaseAnonKey || import.meta.env.VITE_SUPABASE_ANON_KEY

      if (!url || !key) {
        throw new Error('Supabase credentials not configured')
      }

      const supabase: SupabaseClient = createClient(url, key)

      // First get the club by widget_key
      const { data: club, error: clubError } = await supabase
        .from('clubs')
        .select('id')
        .eq('widget_key', widgetKey)
        .single()

      if (clubError || !club) {
        throw new Error('Widget not found')
      }

      // Then get comedians for that club
      const { data, error: comedianError } = await supabase
        .from('club_comedians')
        .select(`
          ticket_url,
          display_order,
          comedian:comedians (
            id,
            name,
            bio,
            photo_url,
            youtube_url,
            video_url
          )
        `)
        .eq('club_id', club.id)
        .eq('is_active', true)
        .order('display_order')

      if (comedianError) {
        throw comedianError
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const formatted: WidgetComedian[] = (data || []).map((item: any) => ({
        id: item.comedian.id,
        name: item.comedian.name,
        bio: item.comedian.bio,
        photo_url: item.comedian.photo_url,
        youtube_url: item.comedian.youtube_url,
        video_url: item.comedian.video_url,
        ticket_url: item.ticket_url,
      }))

      setComedians(formatted)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  const handleTriggerClick = () => {
    if (expandOn === 'click') {
      setIsOpen(true)
    }
  }

  const handleTriggerMouseEnter = () => {
    if (expandOn === 'hover') {
      // Small delay to prevent accidental opens
      hoverTimeoutRef.current = window.setTimeout(() => {
        setIsOpen(true)
      }, 200)
    }
  }

  const handleTriggerMouseLeave = () => {
    if (expandOn === 'hover' && hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
      hoverTimeoutRef.current = null
    }
  }

  const handleClose = () => {
    setIsOpen(false)
  }

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current)
      }
    }
  }, [])

  return (
    <div className={`cpw-container cpw-theme-${theme}`}>
      <TriggerButton
        text={triggerText}
        position={triggerPosition}
        theme={theme}
        onClick={handleTriggerClick}
        onMouseEnter={handleTriggerMouseEnter}
        onMouseLeave={handleTriggerMouseLeave}
      />

      <WidgetModal
        isOpen={isOpen}
        onClose={handleClose}
        comedians={comedians}
        theme={theme}
        columns={columns}
        loading={loading}
        error={error}
      />
    </div>
  )
}
