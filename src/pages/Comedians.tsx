import { useState, useEffect, useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { supabase } from '@/lib/supabase'
import { Comedian } from '@/lib/types'
import { Input } from '@/components/ui/Input'
import { WidgetCard } from '../../widget/WidgetCard'
import '../../widget/styles.css'
import styles from './Comedians.module.css'

// Modal that shows the widget card in a floating overlay
function WidgetPreviewModal({
  comedian,
  onClose
}: {
  comedian: Comedian
  onClose: () => void
}) {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  // Handle click outside
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return createPortal(
    <div className={styles.modalOverlay} onClick={handleOverlayClick}>
      <div className={styles.modalContent}>
        <div className={styles.modalCard}>
          <button
            className={styles.modalClose}
            onClick={onClose}
            aria-label="Close preview"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
          <WidgetCard
            comedian={comedian}
            showTicketButton={false}
            theme="dark"
          />
        </div>
      </div>
    </div>,
    document.body
  )
}

// Preview button that opens the modal
function WidgetPreviewButton({ comedian }: { comedian: Comedian }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        className={styles.previewButton}
        onClick={() => setIsOpen(true)}
      >
        <span className={styles.previewButtonIcon}>▶</span>
        <span>Take a look</span>
      </button>
      {isOpen && (
        <WidgetPreviewModal
          comedian={comedian}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  )
}

export default function ComediansPage() {
  const [comedians, setComedians] = useState<Comedian[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadComedians()
  }, [])

  const loadComedians = async () => {
    try {
      const { data, error } = await supabase
        .from('comedians')
        .select('*')
        .order('name')

      if (error) throw error
      if (data) {
        setComedians(data)
      }
    } catch (err) {
      console.error('Error loading comedians:', err)
    } finally {
      setLoading(false)
    }
  }

  // Memoized filtered comedians for performance
  const filteredComedians = useMemo(() => {
    if (!searchQuery.trim()) return comedians

    const query = searchQuery.toLowerCase()
    return comedians.filter(
      c =>
        c.name.toLowerCase().includes(query) ||
        (c.bio && c.bio.toLowerCase().includes(query))
    )
  }, [comedians, searchQuery])

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }, [])

  if (loading) {
    return <div className={styles.loading}>Loading...</div>
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>Comedians</h1>
          <p className={styles.subtitle}>
            Browse all comedians in the database
          </p>
        </div>
        <div className={styles.stats}>
          <span className={styles.statBadge}>
            {comedians.length} total
          </span>
        </div>
      </div>

      <div className={styles.searchBar}>
        <Input
          placeholder="Search by name or bio..."
          value={searchQuery}
          onChange={handleSearchChange}
          className={styles.searchInput}
        />
        {searchQuery && (
          <button
            className={styles.clearSearch}
            onClick={() => setSearchQuery('')}
          >
            Clear
          </button>
        )}
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.thPreview}>Widget Preview</th>
              <th className={styles.thName}>Name</th>
              <th className={styles.thBio}>Bio</th>
              <th className={styles.thMedia}>Media</th>
            </tr>
          </thead>
          <tbody>
            {filteredComedians.length === 0 ? (
              <tr>
                <td colSpan={4} className={styles.emptyRow}>
                  {searchQuery ? 'No comedians match your search' : 'No comedians available'}
                </td>
              </tr>
            ) : (
              filteredComedians.map((comedian) => (
                <tr key={comedian.id} className={styles.row}>
                  <td className={styles.cellPreview}>
                    <WidgetPreviewButton comedian={comedian} />
                  </td>
                  <td className={styles.cellName}>
                    <span className={styles.comedianName}>{comedian.name}</span>
                  </td>
                  <td className={styles.cellBio}>
                    <p className={styles.bioText}>
                      {comedian.bio || <span className={styles.noBio}>No bio</span>}
                    </p>
                  </td>
                  <td className={styles.cellMedia}>
                    <div className={styles.mediaBadges}>
                      {comedian.video_url && (
                        <span className={styles.badge}>Video</span>
                      )}
                      {comedian.youtube_url && (
                        <span className={styles.badge}>YouTube</span>
                      )}
                      {!comedian.video_url && !comedian.youtube_url && (
                        <span className={styles.noMedia}>No media</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className={styles.footer}>
        <p className={styles.footerText}>
          Showing {filteredComedians.length} of {comedians.length} comedians
        </p>
      </div>
    </div>
  )
}
