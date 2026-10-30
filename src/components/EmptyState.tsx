import { useState } from 'react'

interface Props {
  onLoadSample: () => Promise<void>
  onAddVehicle: () => void
}

/** Shown on first launch, when there are no vehicles yet. */
export function EmptyState({ onLoadSample, onAddVehicle }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleLoad() {
    setLoading(true)
    setError(null)
    try {
      await onLoadSample()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load sample data.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="card" aria-label="Welcome">
      <h2>Welcome to MaintLog</h2>
      <p>
        Keep service history for your car, boat and outboard motor. Everything is stored in this browser only;
        nothing is sent to a server.
      </p>
      <p className="muted">
        Not sure where to start? Load a fictional car, boat and outboard with a few records to explore the app.
      </p>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      <div className="actions">
        <button type="button" className="btn btn-primary" onClick={handleLoad} disabled={loading}>
          {loading ? 'Loading…' : 'Load sample data'}
        </button>
        <button type="button" className="btn" onClick={onAddVehicle} disabled={loading}>
          Add my first vehicle
        </button>
      </div>
    </section>
  )
}
