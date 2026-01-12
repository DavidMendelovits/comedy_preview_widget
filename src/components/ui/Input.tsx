import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef } from 'react'
import styles from './Input.module.css'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className={styles.wrapper}>
        {label && <label className={styles.label}>{label}</label>}
        <input
          ref={ref}
          className={`${styles.input} ${error ? styles.error : ''} ${className}`}
          {...props}
        />
        {error && <span className={styles.errorText}>{error}</span>}
      </div>
    )
  }
)

Input.displayName = 'Input'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className={styles.wrapper}>
        {label && <label className={styles.label}>{label}</label>}
        <textarea
          ref={ref}
          className={`${styles.input} ${styles.textarea} ${error ? styles.error : ''} ${className}`}
          {...props}
        />
        {error && <span className={styles.errorText}>{error}</span>}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'
