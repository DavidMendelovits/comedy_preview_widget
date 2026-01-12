/**
 * Extract YouTube video ID from various URL formats
 */
export function extractYouTubeId(url: string): string | null {
  if (!url) return null

  const patterns = [
    // Standard watch URL: https://www.youtube.com/watch?v=VIDEO_ID
    /(?:youtube\.com\/watch\?v=)([^&\n?#]+)/,
    // Short URL: https://youtu.be/VIDEO_ID
    /(?:youtu\.be\/)([^&\n?#]+)/,
    // Embed URL: https://www.youtube.com/embed/VIDEO_ID
    /(?:youtube\.com\/embed\/)([^&\n?#]+)/,
    // Shorts URL: https://www.youtube.com/shorts/VIDEO_ID
    /(?:youtube\.com\/shorts\/)([^&\n?#]+)/,
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }

  return null
}

/**
 * Get YouTube embed URL from video ID
 */
export function getYouTubeEmbedUrl(videoId: string, options?: {
  autoplay?: boolean
  muted?: boolean
  start?: number
}): string {
  const params = new URLSearchParams()

  if (options?.autoplay) params.set('autoplay', '1')
  if (options?.muted) params.set('mute', '1')
  if (options?.start) params.set('start', String(options.start))

  // Enable JS API for better control
  params.set('enablejsapi', '1')
  // Hide related videos at end
  params.set('rel', '0')

  const queryString = params.toString()
  return `https://www.youtube.com/embed/${videoId}${queryString ? '?' + queryString : ''}`
}

/**
 * Get YouTube thumbnail URL
 */
export function getYouTubeThumbnail(videoId: string, quality: 'default' | 'medium' | 'high' | 'max' = 'high'): string {
  const qualityMap = {
    default: 'default',
    medium: 'mqdefault',
    high: 'hqdefault',
    max: 'maxresdefault',
  }
  return `https://img.youtube.com/vi/${videoId}/${qualityMap[quality]}.jpg`
}
