import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from './db/db'
import { addVehicle, deleteVehicle, updateVehicle, type VehicleInput } from './db/vehicles'
import { meterUnitFor, vehicleKindLabel } from './db/types'
import { VehicleList } from './components/VehicleList'
import { VehicleForm } from './components/VehicleForm'
import { ConfirmButton } from './components/ConfirmButton'

type Panel = { type: 'none' } | { type: 'add-vehicle' } | { type: 'edit-vehicle' }

function App() {
  const vehicles = useLiveQuery(() => db.vehicles.orderBy('name').toArray(), [])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [panel, setPanel] = useState<Panel>({ type: 'none' })

  const selected = vehicles?.find((v) => v.id === selectedId) ?? null

  async function handleAddVehicle(input: VehicleInput) {
    const id = await addVehicle(input)
    setSelectedId(id)
    setPanel({ type: 'none' })
  }

  async function handleUpdateVehicle(input: VehicleInput) {
    if (!selected) return
    await updateVehicle(selected.id, input)
    setPanel({ type: 'none' })
  }

  async function handleDeleteVehicle() {
    if (!selected) return
    await deleteVehicle(selected.id)
    setSelectedId(null)
    setPanel({ type: 'none' })
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
            <VehicleList
              vehicles={vehicles}
              selectedId={selectedId}
              onSelect={(id) => {
                setSelectedId(id)
                setPanel({ type: 'none' })
              }}
            />
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

          {panel.type === 'none' && !selected && (
            <p className="muted">Select a vehicle on the left, or add a new one.</p>
          )}

          {panel.type === 'none' && selected && (
            <section className="card" aria-label="Vehicle details">
              <div className="card-head">
                <div>
                  <h2>{selected.name}</h2>
                  <p className="muted">
                    {vehicleKindLabel(selected.kind)}
                    {selected.make || selected.model ? ` · ${[selected.make, selected.model].filter(Boolean).join(' ')}` : ''}
                    {' · measured in '}
                    {meterUnitFor(selected.kind)}
                  </p>
                </div>
                <div className="actions">
                  <button type="button" className="btn" onClick={() => setPanel({ type: 'edit-vehicle' })}>
                    Edit
                  </button>
                  <ConfirmButton label="Delete" confirmLabel="Delete vehicle and its records" onConfirm={handleDeleteVehicle} />
                </div>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  )
}

export default App
