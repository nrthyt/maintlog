import { useState, type FormEvent } from 'react'
import { meterUnitFor, meterUnitLabel, type ServiceRecord, type Vehicle } from '../db/types'
import { todayISODate, validateServiceRecord, type ServiceRecordInput } from '../db/records'

interface Props {
  vehicle: Vehicle
  /** When provided, the form edits this record instead of creating a new one. */
  initial?: ServiceRecord
  onSubmit: (input: ServiceRecordInput) => Promise<void>
  onCancel: () => void
}

export function ServiceRecordForm({ vehicle, initial, onSubmit, onCancel }: Props) {
  const unit = meterUnitFor(vehicle.kind)
  const [date, setDate] = useState(initial?.date ?? todayISODate())
  const [meter, setMeter] = useState(initial ? String(initial.meter) : '')
  const [task, setTask] = useState(initial?.task ?? '')
  const [parts, setParts] = useState(initial?.parts ?? '')
  const [notes, setNotes] = useState(initial?.notes ?? '')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const input: ServiceRecordInput = {
      vehicleId: vehicle.id,
      date,
      meter: meter.trim() === '' ? Number.NaN : Number(meter),
      task,
      parts,
      notes,
    }
    const validation = validateServiceRecord(input)
    if (validation) {
      setError(validation)
      return
    }
    setSaving(true)
    try {
      await onSubmit(input)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save service record.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form
      className="card form"
      onSubmit={handleSubmit}
      aria-label={initial ? 'Edit service record' : 'New service record'}
    >
      <h3>{initial ? 'Edit service record' : `New service record for ${vehicle.name}`}</h3>

      <label>
        Date
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
      </label>

      <label>
        {unit === 'km' ? 'Odometer' : 'Engine hours'} ({meterUnitLabel(unit)})
        <input
          type="number"
          inputMode="decimal"
          min="0"
          step={unit === 'km' ? '1' : '0.1'}
          value={meter}
          onChange={(e) => setMeter(e.target.value)}
          required
        />
      </label>

      <label>
        Task
        <input value={task} onChange={(e) => setTask(e.target.value)} placeholder="e.g. Engine oil change" required />
      </label>

      <label>
        Parts and fluids <span className="muted">(optional)</span>
        <textarea value={parts} onChange={(e) => setParts(e.target.value)} placeholder="e.g. 4 L 5W-30, oil filter" />
      </label>

      <label>
        Notes <span className="muted">(optional)</span>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
      </label>

      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}

      <div className="actions">
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {initial ? 'Save changes' : 'Add record'}
        </button>
        <button type="button" className="btn" onClick={onCancel} disabled={saving}>
          Cancel
        </button>
      </div>
    </form>
  )
}
