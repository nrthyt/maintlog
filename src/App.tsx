import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from './db/db'
import { addVehicle, deleteVehicle, updateVehicle, type VehicleInput } from './db/vehicles'
import {
  addServiceRecord,
  deleteServiceRecord,
  listServiceRecords,
  updateServiceRecord,
  type ServiceRecordInput,
} from './db/records'
import { seedSampleData } from './db/seed'
import { meterUnitFor, vehicleKindLabel, type ServiceRecord } from './db/types'
import { EmptyState } from './components/EmptyState'
import { VehicleList } from './components/VehicleList'
import { VehicleForm } from './components/VehicleForm'
import { ServiceRecordForm } from './components/ServiceRecordForm'
import { ServiceRecordList } from './components/ServiceRecordList'
import { ConfirmButton } from './components/ConfirmButton'

type Panel =
  | { type: 'none' }
  | { type: 'add-vehicle' }
  | { type: 'edit-vehicle' }
  | { type: 'add-record' }
  | { type: 'edit-record'; record: ServiceRecord }

function App() {
  const vehicles = useLiveQuery(() => db.vehicles.orderBy('name').toArray(), [])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [panel, setPanel] = useState<Panel>({ type: 'none' })

  const selected = vehicles?.find((v) => v.id === selectedId) ?? null
  const records = useLiveQuery(
    () => (selectedId === null ? Promise.resolve([]) : listServiceRecords(selectedId)),
    [selectedId],
  )

  function selectVehicle(id: number | null) {
    setSelectedId(id)
    setPanel({ type: 'none' })
  }

  async function handleAddVehicle(input: VehicleInput) {
    const id = await addVehicle(input)
    selectVehicle(id)
  }

  async function handleLoadSample() {
    const ids = await seedSampleData()
    selectVehicle(ids[0] ?? null)
  }

  async function handleUpdateVehicle(input: VehicleInput) {
    if (!selected) return
    await updateVehicle(selected.id, input)
    setPanel({ type: 'none' })
  }

  async function handleDeleteVehicle() {
    if (!selected) return
    await deleteVehicle(selected.id)
    selectVehicle(null)
  }

  async function handleAddRecord(input: ServiceRecordInput) {
    await addServiceRecord(input)
    setPanel({ type: 'none' })
  }

  async function handleUpdateRecord(id: number, input: ServiceRecordInput) {
    await updateServiceRecord(id, input)
    setPanel({ type: 'none' })
  }

  async function handleDeleteRecord(id: number) {
    await deleteServiceRecord(id)
    if (panel.type === 'edit-record' && panel.record.id === id) setPanel({ type: 'none' })
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>MaintLog</h1>
        <p className="muted">Maintenance log for cars, boats and outboard motors. Data stays in this browser.</p>
      </header>

      <div className="layout">
        <aside className="sidebar">
          <div className="sidebar-head">
            <h2>Vehicles</h2>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setPanel({ type: 'add-vehicle' })}
              disabled={panel.type === 'add-vehicle'}
            >
              Add vehicle
            </button>
          </div>
          {vehicles === undefined ? (
            <p className="muted">Loading…</p>
          ) : (
            <VehicleList vehicles={vehicles} selectedId={selectedId} onSelect={selectVehicle} />
          )}
        </aside>

        <main className="content">
          {panel.type === 'add-vehicle' && (
            <VehicleForm onSubmit={handleAddVehicle} onCancel={() => setPanel({ type: 'none' })} />
          )}

          {panel.type === 'edit-vehicle' && selected && (
            <VehicleForm
              key={selected.id}
              initial={selected}
              onSubmit={handleUpdateVehicle}
              onCancel={() => setPanel({ type: 'none' })}
            />
          )}

          {panel.type === 'none' && !selected && vehicles !== undefined && vehicles.length === 0 && (
            <EmptyState onLoadSample={handleLoadSample} onAddVehicle={() => setPanel({ type: 'add-vehicle' })} />
          )}

          {panel.type === 'none' && !selected && vehicles !== undefined && vehicles.length > 0 && (
            <p className="muted">Select a vehicle on the left, or add a new one.</p>
          )}

          {selected && panel.type !== 'add-vehicle' && panel.type !== 'edit-vehicle' && (
            <>
              <section className="card" aria-label="Vehicle details">
                <div className="card-head">
                  <div>
                    <h2>{selected.name}</h2>
                    <p className="muted">
                      {vehicleKindLabel(selected.kind)}
                      {selected.make || selected.model
                        ? ` · ${[selected.make, selected.model].filter(Boolean).join(' ')}`
                        : ''}
                      {' · measured in '}
                      {meterUnitFor(selected.kind)}
                    </p>
                  </div>
                  <div className="actions">
                    <button type="button" className="btn" onClick={() => setPanel({ type: 'edit-vehicle' })}>
                      Edit
                    </button>
                    <ConfirmButton
                      label="Delete"
                      confirmLabel="Delete vehicle and its records"
                      onConfirm={handleDeleteVehicle}
                    />
                  </div>
                </div>
              </section>

              {panel.type === 'add-record' && (
                <ServiceRecordForm
                  vehicle={selected}
                  onSubmit={handleAddRecord}
                  onCancel={() => setPanel({ type: 'none' })}
                />
              )}

              {panel.type === 'edit-record' && (
                <ServiceRecordForm
                  key={panel.record.id}
                  vehicle={selected}
                  initial={panel.record}
                  onSubmit={(input) => handleUpdateRecord(panel.record.id, input)}
                  onCancel={() => setPanel({ type: 'none' })}
                />
              )}

              <section aria-label="Service history">
                <div className="sidebar-head">
                  <h2>Service history</h2>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => setPanel({ type: 'add-record' })}
                    disabled={panel.type === 'add-record'}
                  >
                    Add record
                  </button>
                </div>
                {records === undefined ? (
                  <p className="muted">Loading…</p>
                ) : (
                  <ServiceRecordList
                    records={records}
                    unit={meterUnitFor(selected.kind)}
                    onEdit={(record) => setPanel({ type: 'edit-record', record })}
                    onDelete={handleDeleteRecord}
                  />
                )}
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  )
}

export default App
