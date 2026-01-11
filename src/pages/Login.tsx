import { useState, FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import Button from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { UserType } from '@/lib/types'
import styles from './Login.module.css'

export default function Login() {
  const [searchParams] = useSearchParams()
  const defaultType = searchParams.get('type') as UserType | null

  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [userType, setUserType] = useState<UserType>(defaultType || 'comedian')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)

  const { signIn, signUp } = useAuth()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (mode === 'signup') {
        const { error, needsEmailConfirmation } = await signUp(email, password, userType)
        if (error) throw error
        if (needsEmailConfirmation) {
          setShowConfirmation(true)
        }
      } else {
        const { error } = await signIn(email, password)
        if (error) throw error
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  // Email confirmation screen
  if (showConfirmation) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.confirmationIcon}>✉️</div>
          <h1 className={styles.title}>Check Your Email</h1>
          <p className={styles.confirmationText}>
            We've sent a confirmation link to <strong>{email}</strong>
          </p>
          <p className={styles.confirmationSubtext}>
            Click the link in the email to verify your account, then come back here to sign in.
          </p>
          <Button
            onClick={() => {
              setShowConfirmation(false)
              setMode('signin')
            }}
            variant="secondary"
            style={{ width: '100%', marginTop: '1rem' }}
          >
            Back to Sign In
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>
          {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
        </h1>

        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${mode === 'signin' ? styles.active : ''}`}
            onClick={() => setMode('signin')}
          >
            Sign In
          </button>
          <button
            className={`${styles.tab} ${mode === 'signup' ? styles.active : ''}`}
            onClick={() => setMode('signup')}
          >
            Sign Up
          </button>
        </div>

        {mode === 'signup' && (
          <div className={styles.typeSelector}>
            <button
              className={`${styles.typeButton} ${userType === 'comedian' ? styles.selected : ''}`}
              onClick={() => setUserType('comedian')}
            >
              I'm a Comedian
            </button>
            <button
              className={`${styles.typeButton} ${userType === 'club' ? styles.selected : ''}`}
              onClick={() => setUserType('club')}
            >
              I'm a Club
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <Input
            type="email"
            label="Email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            label="Password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />

          {error && <p className={styles.error}>{error}</p>}

          <Button type="submit" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Loading...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
          </Button>
        </form>
      </div>
    </div>
  )
}
