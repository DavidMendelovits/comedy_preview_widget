import { useState, useRef, ChangeEvent } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import Button from './ui/Button'
import styles from './PhotoUpload.module.css'

interface PhotoUploadProps {
  currentPhotoUrl?: string | null
  onUploadComplete: (photoUrl: string) => void
}

export default function PhotoUpload({
  currentPhotoUrl,
  onUploadComplete,
}: PhotoUploadProps) {
  const { user } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    // Validate file
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      setError('File too large. Maximum size is 10MB.')
      return
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type. Please upload JPEG, PNG, or WebP.')
      return
    }

    // Show preview immediately
    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)

    setError('')
    setUploading(true)
    setProgress(0)

    try {
      // Create unique filename
      const ext = file.name.split('.').pop()
      const filename = `${user.id}/photo_${Date.now()}.${ext}`

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(filename, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('photos')
        .getPublicUrl(filename)

      onUploadComplete(publicUrl)
      setProgress(100)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
      setPreviewUrl(null)
    } finally {
      setUploading(false)
    }
  }

  const displayUrl = previewUrl || currentPhotoUrl

  return (
    <div className={styles.container}>
      {displayUrl ? (
        <div className={styles.preview}>
          <img src={displayUrl} alt="Profile photo" className={styles.photo} />
          <Button
            variant="secondary"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : 'Change Photo'}
          </Button>
        </div>
      ) : (
        <div
          className={styles.dropzone}
          onClick={() => !uploading && fileInputRef.current?.click()}
        >
          <div className={styles.dropzoneIcon}>📷</div>
          <p className={styles.dropzoneText}>
            Click to upload your photo
          </p>
          <p className={styles.dropzoneSubtext}>
            JPEG, PNG, or WebP • Max 10MB
          </p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
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

      {error && <p className={styles.error}>{error}</p>}
    </div>
  )
}
