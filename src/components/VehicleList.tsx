import { meterUnitFor, vehicleKindLabel, type Vehicle } from '../db/types'

interface Props {
  vehicles: Vehicle[]
  selectedId: number | null
  onSelect: (id: number) => void
}

export function VehicleList({ vehicles, selectedId, onSelect }: Props) {
  if (vehicles.length === 0) {
    return <p className="muted">No vehicles yet.</p>
  }

  return (
    <ul className="vehicle-list" aria-label="Vehicles">
      {vehicles.map((v) => (
        <li key={v.id}>
          <button
            type="button"
            className={v.id === selectedId ? 'vehicle-item selected' : 'vehicle-item'}
            onClick={() => onSelect(v.id)}
            aria-current={v.id === selectedId ? 'true' : undefined}
          >
            <span className="vehicle-name">{v.name}</span>
            <span className="muted">
              {vehicleKindLabel(v.kind)} · {meterUnitFor(v.kind)}
            </span>
          </button>
        </li>
      ))}
    </ul>
  )
}
