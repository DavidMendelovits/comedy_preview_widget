import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { Club, ClubComedian, Comedian } from '@/lib/types'
import Button from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import ComedianCard from '@/components/ComedianCard'
import styles from './Dashboard.module.css'

export default function ClubDashboard() {
  const { user } = useAuth()
  const [club, setClub] = useState<Club | null>(null)
  const [clubComedians, setClubComedians] = useState<(ClubComedian & { comedian: Comedian })[]>([])
  const [allComedians, setAllComedians] = useState<Comedian[]>([])
  const [loading, setLoading] = useState(true)
  const [clubName, setClubName] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedComedian, setSelectedComedian] = useState('')
  const [ticketUrl, setTicketUrl] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user])

  const loadData = async () => {
    try {
      // Load club
      const { data: clubData } = await supabase
        .from('clubs')
        .select('*')
        .eq('user_id', user!.id)
        .single()

      if (clubData) {
        setClub(clubData)
        setClubName(clubData.name)

        // Load club's comedians
        const { data: ccData } = await supabase
          .from('club_comedians')
          .select('*, comedian:comedians(*)')
          .eq('club_id', clubData.id)
          .eq('is_active', true)
          .order('display_order')

        if (ccData) {
          setClubComedians(ccData as (ClubComedian & { comedian: Comedian })[])
        }
      }

      // Load all available comedians
      const { data: comedians } = await supabase
        .from('comedians')
        .select('*')
        .order('name')

      if (comedians) {
        setAllComedians(comedians)
      }
    } catch (err) {
      console.error('Error loading data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateClub = async () => {
    if (!clubName.trim()) return

    try {
      const { data, error } = await supabase
        .from('clubs')
        .insert({
          user_id: user!.id,
          name: clubName,
        })
        .select()
        .single()

      if (error) throw error
      setClub(data)
    } catch (err) {
      console.error('Error creating club:', err)
    }
  }

  const handleAddComedian = async () => {
    if (!selectedComedian || !ticketUrl.trim() || !club) return

    try {
      const { error } = await supabase
        .from('club_comedians')
        .insert({
          club_id: club.id,
          comedian_id: selectedComedian,
          ticket_url: ticketUrl,
          display_order: clubComedians.length,
        })

      if (error) throw error

      // Reload
      await loadData()
      setShowAddForm(false)
      setSelectedComedian('')
      setTicketUrl('')
    } catch (err) {
      console.error('Error adding comedian:', err)
    }
  }

  const handleRemoveComedian = async (clubComedianId: string) => {
    try {
      await supabase
        .from('club_comedians')
        .delete()
        .eq('id', clubComedianId)

      await loadData()
    } catch (err) {
      console.error('Error removing comedian:', err)
    }
  }

  const copyEmbedCode = () => {
    if (!club) return

    const embedCode = `<div id="comedy-widget"></div>
<script src="${window.location.origin}/widget/comedy-widget.iife.js"></script>
<script>
  ComedyWidget.init({
    widgetKey: '${club.widget_key}',
    container: '#comedy-widget'
  });
</script>`

    navigator.clipboard.writeText(embedCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return <div className={styles.loading}>Loading...</div>
  }

  // Club setup form
  if (!club) {
    return (
      <div className={styles.container}>
        <div className={styles.setupCard}>
          <h1>Set Up Your Club</h1>
          <p>Enter your club's name to get started.</p>
          <div className={styles.setupForm}>
            <Input
              placeholder="e.g., The Comedy Store"
              value={clubName}
              onChange={(e) => setClubName(e.target.value)}
            />
            <Button onClick={handleCreateClub} disabled={!clubName.trim()}>
              Create Club
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const availableComedians = allComedians.filter(
    c => !clubComedians.find(cc => cc.comedian_id === c.id)
  )

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>{club.name}</h1>
          <p className={styles.subtitle}>Manage your widget and featured comedians</p>
        </div>
        <div className={styles.headerActions}>
          <Link to="/comedians">
            <Button variant="secondary">Browse Comedians</Button>
          </Link>
          <Button onClick={copyEmbedCode} variant="secondary">
            {copied ? 'Copied!' : 'Copy Embed Code'}
          </Button>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Featured Comedians</h2>
          {!showAddForm && availableComedians.length > 0 && (
            <Button onClick={() => setShowAddForm(true)} size="sm">
              + Add Comedian
            </Button>
          )}
        </div>

        {showAddForm && (
          <div className={styles.addForm}>
            <select
              value={selectedComedian}
              onChange={(e) => setSelectedComedian(e.target.value)}
              className={styles.select}
            >
              <option value="">Select a comedian...</option>
              {availableComedians.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <Input
              placeholder="Ticket URL (e.g., https://tickets.example.com/show/123)"
              value={ticketUrl}
              onChange={(e) => setTicketUrl(e.target.value)}
            />
            <div className={styles.addFormActions}>
              <Button
                onClick={handleAddComedian}
                disabled={!selectedComedian || !ticketUrl.trim()}
                size="sm"
              >
                Add
              </Button>
              <Button
                onClick={() => setShowAddForm(false)}
                variant="ghost"
                size="sm"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {clubComedians.length === 0 ? (
          <div className={styles.empty}>
            <p>No comedians added yet.</p>
            {availableComedians.length === 0 && (
              <p className={styles.emptyNote}>
                Comedians need to sign up and create profiles first.
              </p>
            )}
          </div>
        ) : (
          <div className={styles.comedianGrid}>
            {clubComedians.map((cc) => (
              <div key={cc.id} className={styles.comedianItem}>
                <ComedianCard
                  comedian={cc.comedian}
                  ticketUrl={cc.ticket_url}
                />
                <button
                  onClick={() => handleRemoveComedian(cc.id)}
                  className={styles.removeButton}
                  title="Remove comedian"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={styles.section}>
        <h2>Embed Code</h2>
        <p className={styles.sectionDescription}>
          Add this code to your website to display your widget.
        </p>
        <pre className={styles.code}>
{`<div id="comedy-widget"></div>
<script src="${window.location.origin}/widget/comedy-widget.iife.js"></script>
<script>
  ComedyWidget.init({
    widgetKey: '${club.widget_key}',
    container: '#comedy-widget'
  });
</script>`}
        </pre>
      </div>
    </div>
  )
}
