import { useState } from 'react'
import { extractYouTubeId, getYouTubeEmbedUrl, getYouTubeThumbnail } from '@/lib/youtube'
import styles from './VideoPlayer.module.css'

interface VideoPlayerProps {
  youtubeUrl: string
  autoplay?: boolean
  showControls?: boolean
}

export default function VideoPlayer({ youtubeUrl, autoplay = false, showControls = true }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(autoplay)
  const videoId = extractYouTubeId(youtubeUrl)

  if (!videoId) {
    return (
      <div className={styles.placeholder}>
        <span>Invalid video URL</span>
      </div>
    )
  }

  const thumbnailUrl = getYouTubeThumbnail(videoId, 'high')
  const embedUrl = getYouTubeEmbedUrl(videoId, {
    autoplay: true,
    muted: true,
  })

  if (!isPlaying) {
    return (
      <div
        className={styles.thumbnail}
        onClick={() => setIsPlaying(true)}
        style={{ backgroundImage: `url(${thumbnailUrl})` }}
      >
        <div className={styles.playButton}>
          <svg viewBox="0 0 24 24" fill="currentColor" width="48" height="48">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <iframe
        src={embedUrl}
        className={styles.iframe}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen={showControls}
      />
    </div>
  )
}

// Lightweight version for hover previews
export function VideoPreview({ youtubeUrl, isHovering }: { youtubeUrl: string; isHovering: boolean }) {
  const videoId = extractYouTubeId(youtubeUrl)

  if (!videoId) {
    return <div className={styles.placeholder} />
  }

  const thumbnailUrl = getYouTubeThumbnail(videoId, 'high')

  if (!isHovering) {
    return (
      <div
        className={styles.thumbnail}
        style={{ backgroundImage: `url(${thumbnailUrl})` }}
      />
    )
  }

  const embedUrl = getYouTubeEmbedUrl(videoId, {
    autoplay: true,
    muted: true,
  })

  return (
    <div className={styles.container}>
      <iframe
        src={embedUrl}
        className={styles.iframe}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      />
    </div>
  )
}
