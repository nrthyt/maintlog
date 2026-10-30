import { db } from './db'
import type { Vehicle } from './types'

export type VehicleInput = Omit<Vehicle, 'id' | 'createdAt'>

/** Trim free-text fields and drop empty optional values. */
function normalize(input: VehicleInput): VehicleInput {
  const make = input.make?.trim()
  const model = input.model?.trim()
  return {
    kind: input.kind,
    name: input.name.trim(),
    ...(make ? { make } : {}),
    ...(model ? { model } : {}),
  }
}

export function validateVehicle(input: VehicleInput): string | null {
  if (!input.name.trim()) return 'Name is required.'
  return null
}

export async function addVehicle(input: VehicleInput): Promise<number> {
  const error = validateVehicle(input)
  if (error) throw new Error(error)
  return db.vehicles.add({ ...normalize(input), createdAt: new Date().toISOString() })
}

export async function updateVehicle(id: number, input: VehicleInput): Promise<void> {
  const error = validateVehicle(input)
  if (error) throw new Error(error)
  const existing = await db.vehicles.get(id)
  if (!existing) throw new Error(`Vehicle ${id} not found.`)
  // put() replaces the whole object so cleared optional fields are removed.
  await db.vehicles.put({ ...normalize(input), id, createdAt: existing.createdAt })
}

/** Deletes the vehicle together with all of its service records. */
export async function deleteVehicle(id: number): Promise<void> {
  await db.transaction('rw', db.vehicles, db.serviceRecords, async () => {
    await db.serviceRecords.where('vehicleId').equals(id).delete()
    await db.vehicles.delete(id)
  })
}

export function listVehicles(): Promise<Vehicle[]> {
  return db.vehicles.orderBy('name').toArray()
}
