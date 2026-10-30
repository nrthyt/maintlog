import { formatMeter, type MeterUnit, type ServiceRecord } from '../db/types'
import { ConfirmButton } from './ConfirmButton'

interface Props {
  records: ServiceRecord[]
  unit: MeterUnit
  onEdit: (record: ServiceRecord) => void
  onDelete: (id: number) => void
}

/** Shows service records for one vehicle. Expects records already sorted newest first. */
export function ServiceRecordList({ records, unit, onEdit, onDelete }: Props) {
  if (records.length === 0) {
    return <p className="muted">No service records yet.</p>
  }

  return (
    <ul className="record-list" aria-label="Service records">
      {records.map((r) => (
        <li key={r.id} className="record">
          <div className="record-head">
            <div>
              <div className="record-meta">
                <span>{r.date}</span>
                <span>{formatMeter(r.meter, unit)}</span>
              </div>
              <div className="record-task">{r.task}</div>
            </div>
            <div className="actions">
              <button type="button" className="btn btn-small" onClick={() => onEdit(r)}>
                Edit
              </button>
              <ConfirmButton label="Delete" confirmLabel="Delete record" onConfirm={() => onDelete(r.id)} />
            </div>
          </div>
          {(r.parts || r.notes) && (
            <dl className="record-detail">
              {r.parts && (
                <>
                  <dt>Parts and fluids</dt>
                  <dd>{r.parts}</dd>
                </>
              )}
              {r.notes && (
                <>
                  <dt>Notes</dt>
                  <dd>{r.notes}</dd>
                </>
              )}
            </dl>
          )}
        </li>
      ))}
    </ul>
  )
}
