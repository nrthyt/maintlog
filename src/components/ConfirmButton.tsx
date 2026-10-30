import { useState } from 'react'

interface Props {
  label: string
  confirmLabel?: string
  onConfirm: () => void
  disabled?: boolean
}

/**
 * Two-step destructive action: the first click reveals a confirm/cancel pair
 * inline, avoiding blocking browser dialogs.
 */
export function ConfirmButton({ label, confirmLabel = 'Confirm', onConfirm, disabled }: Props) {
  const [armed, setArmed] = useState(false)

  if (!armed) {
    return (
      <button type="button" className="btn btn-danger-outline" disabled={disabled} onClick={() => setArmed(true)}>
        {label}
      </button>
    )
  }

  return (
    <span className="confirm-group">
      <button
        type="button"
        className="btn btn-danger"
        onClick={() => {
          setArmed(false)
          onConfirm()
        }}
      >
        {confirmLabel}
      </button>
      <button type="button" className="btn" onClick={() => setArmed(false)}>
        Cancel
      </button>
    </span>
  )
}
