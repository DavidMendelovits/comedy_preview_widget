import { useEffect, useRef, useState } from 'react'

// YouTube helpers
function extractYouTubeId(url: string): string | null {
  if (!url) return null
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([^&\n?#]+)/,
    /(?:youtu\.be\/)([^&\n?#]+)/,
    /(?:youtube\.com\/embed\/)([^&\n?#]+)/,
    /(?:youtube\.com\/shorts\/)([^&\n?#]+)/,
  ]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}

function getYouTubeEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&enablejsapi=1&rel=0&controls=1`
}

export interface WidgetCardComedian {
  id: string
  name: string
  bio?: string | null
  photo_url?: string | null
  youtube_url?: string | null
  video_url?: string | null
  ticket_url?: string
}

interface WidgetCardProps {
  comedian: WidgetCardComedian
  showTicketButton?: boolean
  theme?: 'dark' | 'light'
}

export function WidgetCard({ comedian, showTicketButton = true, theme = 'dark' }: WidgetCardProps) {
  const [isHovering, setIsHovering] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const videoId = comedian.youtube_url ? extractYouTubeId(comedian.youtube_url) : null
  const hasUploadedVideo = Boolean(comedian.video_url)
  const hasYouTube = Boolean(videoId)
  const hasVideo = hasUploadedVideo || hasYouTube

  // Get background image (photo or YouTube thumbnail)
  const backgroundImage = comedian.photo_url
    ? comedian.photo_url
    : videoId
    ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    : null

  useEffect(() => {
    if (!hasUploadedVideo || !videoRef.current) return

    if (isHovering) {
      videoRef.current.play().catch(() => {})
    } else {
      videoRef.current.pause()
      videoRef.current.currentTime = 0
    }
  }, [isHovering, hasUploadedVideo])

  return (
    <div
      className={`cpw-card cpw-theme-${theme}`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Background layer: photo or video */}
      <div className="cpw-media-bg">
        {isHovering && hasUploadedVideo ? (
          <video
            ref={videoRef}
            src={comedian.video_url!}
            muted
            loop
            playsInline
            controls
            className="cpw-video-player"
          />
        ) : isHovering && hasYouTube ? (
          <iframe
            src={getYouTubeEmbedUrl(videoId!)}
            className="cpw-youtube-player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        ) : backgroundImage ? (
          <div
            className="cpw-photo"
            style={{ backgroundImage: `url(${backgroundImage})` }}
          />
        ) : (
          <div className="cpw-photo-placeholder">
            <span>{comedian.name.charAt(0)}</span>
          </div>
        )}
      </div>

      {/* Gradient overlay - hidden when video playing */}
      {!isHovering && <div className="cpw-gradient" />}

      {/* Badge - hidden when video playing */}
      {!isHovering && (
        <div className="cpw-badge">Sample</div>
      )}

      {/* Content overlay - hidden when video playing */}
      {!isHovering && (
        <div className="cpw-info">
          <h3 className="cpw-name">{comedian.name}</h3>
          {comedian.bio && <p className="cpw-bio">{comedian.bio}</p>}
          {showTicketButton && comedian.ticket_url && (
            <a
              href={comedian.ticket_url}
              target="_blank"
              rel="noopener noreferrer"
              className="cpw-ticket-btn"
              onClick={(e) => e.stopPropagation()}
            >
              Buy Tickets
            </a>
          )}
        </div>
      )}

      {/* Play indicator when has video but not hovering */}
      {!isHovering && hasVideo && (
        <div className="cpw-play-indicator">
          <svg viewBox="0 0 24 24" fill="white">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      )}
    </div>
  )
}
