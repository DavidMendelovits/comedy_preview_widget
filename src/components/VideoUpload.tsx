import { useState, useRef, ChangeEvent } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import Button from './ui/Button'
import styles from './VideoUpload.module.css'

interface VideoUploadProps {
  currentVideoUrl?: string | null
  currentYoutubeUrl?: string | null
  onUploadComplete: (videoUrl: string, videoPath: string) => void
  onYoutubeUrlChange: (url: string) => void
}

export default function VideoUpload({
  currentVideoUrl,
  currentYoutubeUrl,
  onUploadComplete,
  onYoutubeUrlChange,
}: VideoUploadProps) {
  const { user } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const [mode, setMode] = useState<'upload' | 'youtube'>(
    currentYoutubeUrl ? 'youtube' : 'upload'
  )
  const [youtubeUrl, setYoutubeUrl] = useState(currentYoutubeUrl || '')

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    // Validate file
    const maxSize = 100 * 1024 * 1024 // 100MB
    if (file.size > maxSize) {
      setError('File too large. Maximum size is 100MB.')
      return
    }

    const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime']
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type. Please upload MP4, WebM, or MOV.')
      return
    }

    setError('')
    setUploading(true)
    setProgress(0)

    try {
      // Create unique filename
      const ext = file.name.split('.').pop()
      const filename = `${user.id}/${Date.now()}.${ext}`

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('videos')
        .upload(filename, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('videos')
        .getPublicUrl(filename)

      onUploadComplete(publicUrl, filename)
      setProgress(100)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleYoutubeSubmit = () => {
    if (youtubeUrl.trim()) {
      onYoutubeUrlChange(youtubeUrl.trim())
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${mode === 'upload' ? styles.active : ''}`}
          onClick={() => setMode('upload')}
        >
          Upload Video
        </button>
        <button
          className={`${styles.tab} ${mode === 'youtube' ? styles.active : ''}`}
          onClick={() => setMode('youtube')}
        >
          YouTube Link
        </button>
      </div>

      {mode === 'upload' ? (
        <div className={styles.uploadArea}>
          {currentVideoUrl ? (
            <div className={styles.preview}>
              <video src={currentVideoUrl} controls className={styles.video} />
              <Button
                variant="secondary"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                Replace Video
              </Button>
            </div>
          ) : (
            <div
              className={styles.dropzone}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className={styles.dropzoneIcon}>🎬</div>
              <p className={styles.dropzoneText}>
                Click to upload a video clip
              </p>
              <p className={styles.dropzoneSubtext}>
                MP4, WebM, or MOV • Max 100MB • 1-2 min recommended
              </p>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="video/mp4,video/webm,video/quicktime"
            onChange={handleFileSelect}
            className={styles.fileInput}
          />

          {uploading && (
            <div className={styles.progressContainer}>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className={styles.progressText}>Uploading...</span>
            </div>
          )}
        </div>
      ) : (
        <div className={styles.youtubeArea}>
          <input
            type="url"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            placeholder="https://youtube.com/watch?v=..."
            className={styles.youtubeInput}
          />
          <Button onClick={handleYoutubeSubmit} size="sm">
            Save
          </Button>
        </div>
      )}

      {error && <p className={styles.error}>{error}</p>}

      <p className={styles.hint}>
        {mode === 'upload'
          ? 'Upload your own video for automatic transcription and subtitles'
          : 'Or paste a YouTube link to your existing content'}
      </p>
    </div>
  )
}
