import { db } from './db'
import type { ServiceRecord } from './types'

export type ServiceRecordInput = Omit<ServiceRecord, 'id' | 'createdAt'>

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

/** Today's date in local time as YYYY-MM-DD, for form defaults. */
export function todayISODate(now = new Date()): string {
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** Trim free-text fields and drop empty optional values. */
function normalize(input: ServiceRecordInput): ServiceRecordInput {
  const parts = input.parts?.trim()
  const notes = input.notes?.trim()
  return {
    vehicleId: input.vehicleId,
    date: input.date,
    meter: input.meter,
    task: input.task.trim(),
    ...(parts ? { parts } : {}),
    ...(notes ? { notes } : {}),
  }
}

export function validateServiceRecord(input: ServiceRecordInput): string | null {
  if (!ISO_DATE.test(input.date)) return 'Date is required.'
  if (!Number.isFinite(input.meter) || input.meter < 0) return 'Meter reading must be zero or more.'
  if (!input.task.trim()) return 'Task is required.'
  return null
}

/** Newest first: by service date, then by most recently created for ties. */
export function sortNewestFirst(records: ServiceRecord[]): ServiceRecord[] {
  return [...records].sort((a, b) => {
    if (a.date !== b.date) return a.date < b.date ? 1 : -1
    return b.id - a.id
  })
}

export async function addServiceRecord(input: ServiceRecordInput): Promise<number> {
  const error = validateServiceRecord(input)
  if (error) throw new Error(error)
  const vehicle = await db.vehicles.get(input.vehicleId)
  if (!vehicle) throw new Error(`Vehicle ${input.vehicleId} not found.`)
  return db.serviceRecords.add({ ...normalize(input), createdAt: new Date().toISOString() })
}

export async function updateServiceRecord(id: number, input: ServiceRecordInput): Promise<void> {
  const error = validateServiceRecord(input)
  if (error) throw new Error(error)
  const existing = await db.serviceRecords.get(id)
  if (!existing) throw new Error(`Service record ${id} not found.`)
  // put() replaces the whole object so cleared optional fields are removed.
  await db.serviceRecords.put({ ...normalize(input), id, createdAt: existing.createdAt })
}

export async function deleteServiceRecord(id: number): Promise<void> {
  await db.serviceRecords.delete(id)
}

export async function listServiceRecords(vehicleId: number): Promise<ServiceRecord[]> {
  const records = await db.serviceRecords.where('vehicleId').equals(vehicleId).toArray()
  return sortNewestFirst(records)
}
