interface TriggerButtonProps {
  text: string
  position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  theme: 'dark' | 'light'
  onClick: () => void
  onMouseEnter?: () => void
  onMouseLeave?: () => void
}

export function TriggerButton({
  text,
  position,
  theme,
  onClick,
  onMouseEnter,
  onMouseLeave,
}: TriggerButtonProps) {
  return (
    <button
      className={`cpw-trigger cpw-trigger-${position} cpw-theme-${theme}`}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <span className="cpw-trigger-icon">
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path
            fill="currentColor"
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
          />
        </svg>
      </span>
      <span className="cpw-trigger-text">{text}</span>
    </button>
  )
}
