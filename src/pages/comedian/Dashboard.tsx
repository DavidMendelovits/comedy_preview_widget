import { useState, useEffect, FormEvent } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { Comedian } from '@/lib/types'
import Button from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { WidgetCard } from '../../../widget/WidgetCard'
import '../../../widget/styles.css'
import VideoUpload from '@/components/VideoUpload'
import PhotoUpload from '@/components/PhotoUpload'
import styles from './Dashboard.module.css'

export default function ComedianDashboard() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<Comedian | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Form state
  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [photoUrl, setPhotoUrl] = useState('')
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [videoPath, setVideoPath] = useState('')
  const [transcriptionStatus, setTranscriptionStatus] = useState('none')

  useEffect(() => {
    if (user) {
      loadProfile()
    }
  }, [user])

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('comedians')
        .select('*')
        .eq('user_id', user!.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      if (data) {
        setProfile(data)
        setName(data.name)
        setBio(data.bio || '')
        setPhotoUrl(data.photo_url || '')
        setYoutubeUrl(data.youtube_url || '')
        setVideoUrl(data.video_url || '')
        setVideoPath(data.video_path || '')
        setTranscriptionStatus(data.transcription_status || 'none')
      }
    } catch (err) {
      console.error('Error loading profile:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSaving(true)

    try {
      const profileData = {
        user_id: user!.id,
        name,
        bio: bio || null,
        photo_url: photoUrl || null,
        youtube_url: youtubeUrl || null,
        video_url: videoUrl || null,
        video_path: videoPath || null,
        updated_at: new Date().toISOString(),
      }

      if (profile) {
        // Update existing profile
        const { data, error } = await supabase
          .from('comedians')
          .update(profileData)
          .eq('id', profile.id)
          .select()
          .single()

        if (error) throw error
        // Update local state with returned data (includes transcription_status from trigger)
        if (data) {
          setTranscriptionStatus(data.transcription_status || 'none')
        }
      } else {
        // Create new profile
        const { data, error } = await supabase
          .from('comedians')
          .insert(profileData)
          .select()
          .single()

        if (error) throw error
        setProfile(data)
        setTranscriptionStatus(data.transcription_status || 'none')
      }

      setSuccess('Profile saved!')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className={styles.loading}>Loading...</div>
  }

  const previewComedian = {
    id: profile?.id || 'preview',
    name: name || 'Your Name',
    bio,
    photo_url: photoUrl,
    youtube_url: youtubeUrl || null,
    video_url: videoUrl || null,
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Your Profile</h1>
        <p className={styles.subtitle}>
          This is your comedy "baseball card" - make it count!
        </p>
      </div>

      <div className={styles.grid}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <Input
            label="Stage Name"
            placeholder="e.g., Dave Chappelle"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Textarea
            label="Bio"
            placeholder="Tell clubs and audiences about yourself..."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
          />

          <div className={styles.formSection}>
            <label className={styles.sectionLabel}>Profile Photo</label>
            <PhotoUpload
              currentPhotoUrl={photoUrl}
              onUploadComplete={(url) => setPhotoUrl(url)}
            />
          </div>

          <div className={styles.formSection}>
            <label className={styles.sectionLabel}>Video Clip</label>
            <VideoUpload
              currentVideoUrl={videoUrl}
              currentYoutubeUrl={youtubeUrl}
              onUploadComplete={(url, path) => {
                setVideoUrl(url)
                setVideoPath(path)
                setYoutubeUrl('') // Clear YouTube if uploading
              }}
              onYoutubeUrlChange={(url) => {
                setYoutubeUrl(url)
                setVideoUrl('') // Clear uploaded video if using YouTube
                setVideoPath('')
              }}
            />
            {transcriptionStatus === 'pending' && (
              <p className={styles.transcriptionStatus}>
                Transcription queued...
              </p>
            )}
            {transcriptionStatus === 'processing' && (
              <p className={styles.transcriptionStatus}>
                Generating subtitles...
              </p>
            )}
            {transcriptionStatus === 'completed' && (
              <p className={styles.transcriptionSuccess}>
                Subtitles generated!
              </p>
            )}
          </div>

          {error && <p className={styles.error}>{error}</p>}
          {success && <p className={styles.success}>{success}</p>}

          <Button type="submit" disabled={saving || !name}>
            {saving ? 'Saving...' : profile ? 'Update Profile' : 'Create Profile'}
          </Button>
        </form>

        <div className={styles.preview}>
          <h3 className={styles.previewTitle}>Preview</h3>
          <WidgetCard
            comedian={previewComedian}
            showTicketButton={false}
            theme="dark"
          />
        </div>
      </div>
    </div>
  )
}
