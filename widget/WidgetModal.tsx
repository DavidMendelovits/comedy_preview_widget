import { useEffect, useRef } from 'react'
import { WidgetComedian } from './types'
import { WidgetCard } from './WidgetCard'

interface WidgetModalProps {
  isOpen: boolean
  onClose: () => void
  comedians: WidgetComedian[]
  theme: 'dark' | 'light'
  columns: 1 | 2 | 3 | 4
  loading: boolean
  error: string | null
}

export function WidgetModal({
  isOpen,
  onClose,
  comedians,
  theme,
  columns,
  loading,
  error,
}: WidgetModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  // Handle click outside
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      className={`cpw-modal-overlay cpw-theme-${theme}`}
      onClick={handleOverlayClick}
    >
      <div
        ref={modalRef}
        className="cpw-modal"
        role="dialog"
        aria-modal="true"
      >
        <button className="cpw-modal-close" onClick={onClose} aria-label="Close">
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path
              fill="currentColor"
              d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
            />
          </svg>
        </button>

        <div className="cpw-modal-header">
          <h2 className="cpw-modal-title">Tonight's Comedians</h2>
        </div>

        <div className="cpw-modal-content">
          {loading ? (
            <div className="cpw-loading">Loading...</div>
          ) : error ? (
            <div className="cpw-error">{error}</div>
          ) : comedians.length === 0 ? (
            <div className="cpw-loading">No comedians to display</div>
          ) : (
            <div className={`cpw-grid cpw-grid-${columns}`}>
              {comedians.map((comedian) => (
                <WidgetCard
                  key={comedian.id}
                  comedian={comedian}
                  theme={theme}
                  showTicketButton={true}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
