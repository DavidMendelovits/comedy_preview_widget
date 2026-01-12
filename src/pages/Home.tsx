import { Link } from 'react-router-dom'
import Button from '@/components/ui/Button'
import styles from './Home.module.css'

export default function Home() {
  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <h1 className={styles.title}>Comedy Preview</h1>
        <p className={styles.subtitle}>
          The simplest way to showcase comedians on your club's website.
          Hover to preview, click to buy tickets.
        </p>
        <div className={styles.actions}>
          <Link to="/login?type=comedian">
            <Button size="lg">I'm a Comedian</Button>
          </Link>
          <Link to="/login?type=club">
            <Button size="lg" variant="secondary">I'm a Club</Button>
          </Link>
        </div>
      </div>

      <div className={styles.features}>
        <div className={styles.feature}>
          <h3>For Comedians</h3>
          <p>Create your baseball card. Upload a video sample. Let clubs find you.</p>
        </div>
        <div className={styles.feature}>
          <h3>For Clubs</h3>
          <p>Add comedians to your widget. Embed on your site. Sell more tickets.</p>
        </div>
        <div className={styles.feature}>
          <h3>Simple</h3>
          <p>No bloat. No complexity. Just hover, preview, buy.</p>
        </div>
      </div>
    </div>
  )
}
