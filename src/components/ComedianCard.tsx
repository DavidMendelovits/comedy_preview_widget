import { useState, useRef, useEffect } from 'react'
import { VideoPreview } from './VideoPlayer'
import Button from './ui/Button'
import styles from './ComedianCard.module.css'

interface ComedianCardProps {
  comedian: {
    id: string
    name: string
    bio: string | null
    photo_url: string | null
    youtube_url: string | null
    video_url?: string | null
  }
  ticketUrl?: string
  showTicketButton?: boolean
  showControls?: boolean
}

// Component for uploaded video preview
function UploadedVideoPreview({
  videoUrl,
  isHovering,
  showControls = false
}: {
  videoUrl: string
  isHovering: boolean
  showControls?: boolean
}) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    // Skip auto-play/pause behavior when showing controls (let user control)
    if (showControls || !videoRef.current) return

    if (isHovering) {
      videoRef.current.play().catch(() => {})
    } else {
      videoRef.current.pause()
      videoRef.current.currentTime = 0
    }
  }, [isHovering, showControls])

  return (
    <video
      ref={videoRef}
      src={videoUrl}
      muted={!showControls}
      loop={!showControls}
      playsInline
      controls={showControls}
      className={styles.uploadedVideo}
    />
  )
}

export default function ComedianCard({
  comedian,
  ticketUrl,
  showTicketButton = true,
  showControls = false
}: ComedianCardProps) {
  const [isHovering, setIsHovering] = useState(false)

  const hasUploadedVideo = Boolean(comedian.video_url)
  const hasYouTubeVideo = Boolean(comedian.youtube_url)

  return (
    <div
      className={styles.card}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className={styles.media}>
        {hasUploadedVideo ? (
          <UploadedVideoPreview
            videoUrl={comedian.video_url!}
            isHovering={isHovering}
            showControls={showControls}
          />
        ) : hasYouTubeVideo ? (
          <VideoPreview youtubeUrl={comedian.youtube_url!} isHovering={isHovering} />
        ) : comedian.photo_url ? (
          <div
            className={styles.photo}
            style={{ backgroundImage: `url(${comedian.photo_url})` }}
          />
        ) : (
          <div className={styles.placeholder}>
            <span>{comedian.name.charAt(0)}</span>
          </div>
        )}
      </div>

      <div className={styles.content}>
        <h3 className={styles.name}>{comedian.name}</h3>
        {comedian.bio && (
          <p className={styles.bio}>{comedian.bio}</p>
        )}
      </div>

      {showTicketButton && ticketUrl && (
        <div className={styles.actions}>
          <a href={ticketUrl} target="_blank" rel="noopener noreferrer" className={styles.ticketLink}>
            <Button size="sm" style={{ width: '100%' }}>
              Buy Tickets
            </Button>
          </a>
        </div>
      )}
    </div>
  )
}
