import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import styles from './Layout.module.css'

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, userType, signOut } = useAuth()

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <Link to="/" className={styles.logo}>
          Comedy Preview
        </Link>
        <nav className={styles.nav}>
          {user ? (
            <>
              <Link to={userType === 'comedian' ? '/comedian' : '/club'} className={styles.navLink}>
                Dashboard
              </Link>
              <button onClick={signOut} className={styles.navButton}>
                Sign Out
              </button>
            </>
          ) : (
            <Link to="/login" className={styles.navLink}>
              Sign In
            </Link>
          )}
        </nav>
      </header>
      <main className={styles.main}>{children}</main>
    </div>
  )
}
