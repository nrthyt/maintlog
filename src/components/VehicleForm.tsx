import { useState, type FormEvent } from 'react'
import { VEHICLE_KINDS, meterUnitFor, vehicleKindLabel, type Vehicle, type VehicleKind } from '../db/types'
import { validateVehicle, type VehicleInput } from '../db/vehicles'

interface Props {
  /** When provided, the form edits this vehicle instead of creating a new one. */
  initial?: Vehicle
  onSubmit: (input: VehicleInput) => Promise<void>
  onCancel: () => void
}

export function VehicleForm({ initial, onSubmit, onCancel }: Props) {
  const [kind, setKind] = useState<VehicleKind>(initial?.kind ?? 'car')
  const [name, setName] = useState(initial?.name ?? '')
  const [make, setMake] = useState(initial?.make ?? '')
  const [model, setModel] = useState(initial?.model ?? '')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const input: VehicleInput = { kind, name, make, model }
    const validation = validateVehicle(input)
    if (validation) {
      setError(validation)
      return
    }
    setSaving(true)
    try {
      await onSubmit(input)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save vehicle.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className="card form" onSubmit={handleSubmit} aria-label={initial ? 'Edit vehicle' : 'New vehicle'}>
      <h3>{initial ? 'Edit vehicle' : 'New vehicle'}</h3>

      <label>
        Type
        <select value={kind} onChange={(e) => setKind(e.target.value as VehicleKind)}>
          {VEHICLE_KINDS.map((k) => (
            <option key={k} value={k}>
              {vehicleKindLabel(k)} (measured in {meterUnitFor(k)})
            </option>
          ))}
        </select>
      </label>

      <label>
        Name
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Weekend boat" required />
      </label>

      <label>
        Make <span className="muted">(optional)</span>
        <input value={make} onChange={(e) => setMake(e.target.value)} />
      </label>

      <label>
        Model <span className="muted">(optional)</span>
        <input value={model} onChange={(e) => setModel(e.target.value)} />
      </label>

      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}

      <div className="actions">
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {initial ? 'Save changes' : 'Add vehicle'}
        </button>
        <button type="button" className="btn" onClick={onCancel} disabled={saving}>
          Cancel
        </button>
      </div>
    </form>
  )
}
