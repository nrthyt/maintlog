import { describe, expect, it } from 'vitest'
import { db } from './db'
import {
  addServiceRecord,
  deleteServiceRecord,
  listServiceRecords,
  sortNewestFirst,
  todayISODate,
  updateServiceRecord,
  validateServiceRecord,
} from './records'
import { addVehicle } from './vehicles'
import type { ServiceRecord } from './types'

function record(partial: Partial<ServiceRecord> & Pick<ServiceRecord, 'id' | 'date'>): ServiceRecord {
  return { vehicleId: 1, meter: 0, task: 'Task', createdAt: '2026-01-01T00:00:00.000Z', ...partial }
}

describe('todayISODate', () => {
  it('formats a local date as YYYY-MM-DD with zero padding', () => {
    expect(todayISODate(new Date(2026, 2, 7))).toBe('2026-03-07')
  })
})

describe('validateServiceRecord', () => {
  const base = { vehicleId: 1, date: '2026-05-01', meter: 100, task: 'Oil change' }

  it('accepts a valid record', () => {
    expect(validateServiceRecord(base)).toBeNull()
  })

  it('rejects a missing or malformed date', () => {
    expect(validateServiceRecord({ ...base, date: '' })).toBe('Date is required.')
    expect(validateServiceRecord({ ...base, date: '5/1/2026' })).toBe('Date is required.')
  })

  it('rejects a missing or negative meter reading', () => {
    expect(validateServiceRecord({ ...base, meter: Number.NaN })).toBe('Meter reading must be zero or more.')
    expect(validateServiceRecord({ ...base, meter: -1 })).toBe('Meter reading must be zero or more.')
  })

  it('rejects a blank task', () => {
    expect(validateServiceRecord({ ...base, task: ' ' })).toBe('Task is required.')
  })
})

describe('sortNewestFirst', () => {
  it('orders by date descending, then by id descending for the same date', () => {
    const sorted = sortNewestFirst([
      record({ id: 1, date: '2026-04-19' }),
      record({ id: 3, date: '2026-09-06' }),
      record({ id: 2, date: '2026-04-19' }),
      record({ id: 4, date: '2026-01-01' }),
    ])
    expect(sorted.map((r) => r.id)).toEqual([3, 2, 1, 4])
  })

  it('does not mutate the input', () => {
    const input = [record({ id: 1, date: '2026-01-01' }), record({ id: 2, date: '2026-02-01' })]
    sortNewestFirst(input)
    expect(input.map((r) => r.id)).toEqual([1, 2])
  })
})

describe('addServiceRecord', () => {
  it('stores the record with trimmed text and without empty optional fields', async () => {
    const vehicleId = await addVehicle({ kind: 'outboard', name: 'Outboard' })
    const id = await addServiceRecord({
      vehicleId,
      date: '2026-09-06',
      meter: 231,
      task: '  Engine oil change ',
      parts: '3 L 10W-30',
      notes: '   ',
    })

    const stored = await db.serviceRecords.get(id)
    expect(stored).toMatchObject({ id, vehicleId, date: '2026-09-06', meter: 231, task: 'Engine oil change', parts: '3 L 10W-30' })
    expect(stored).not.toHaveProperty('notes')
  })

  it('rejects records for an unknown vehicle', async () => {
    await expect(addServiceRecord({ vehicleId: 42, date: '2026-01-01', meter: 1, task: 'X' })).rejects.toThrow(
      'not found',
    )
  })

  it('rejects invalid input', async () => {
    const vehicleId = await addVehicle({ kind: 'car', name: 'Car' })
    await expect(addServiceRecord({ vehicleId, date: '2026-01-01', meter: 1, task: '' })).rejects.toThrow(
      'Task is required.',
    )
    expect(await db.serviceRecords.count()).toBe(0)
  })
})

describe('updateServiceRecord', () => {
  it('replaces fields while keeping id and createdAt', async () => {
    const vehicleId = await addVehicle({ kind: 'car', name: 'Car' })
    const id = await addServiceRecord({ vehicleId, date: '2026-01-01', meter: 100, task: 'Oil', notes: 'old' })
    const before = await db.serviceRecords.get(id)

    await updateServiceRecord(id, { vehicleId, date: '2026-02-02', meter: 200, task: 'Oil and filter', notes: '' })

    const after = await db.serviceRecords.get(id)
    expect(after).toMatchObject({ id, vehicleId, date: '2026-02-02', meter: 200, task: 'Oil and filter' })
    expect(after).not.toHaveProperty('notes')
    expect(after?.createdAt).toBe(before?.createdAt)
  })

  it('throws when the record does not exist', async () => {
    await expect(updateServiceRecord(999, { vehicleId: 1, date: '2026-01-01', meter: 1, task: 'X' })).rejects.toThrow(
      'not found',
    )
  })
})

describe('deleteServiceRecord', () => {
  it('removes only the given record', async () => {
    const vehicleId = await addVehicle({ kind: 'car', name: 'Car' })
    const a = await addServiceRecord({ vehicleId, date: '2026-01-01', meter: 1, task: 'A' })
    const b = await addServiceRecord({ vehicleId, date: '2026-01-02', meter: 2, task: 'B' })

    await deleteServiceRecord(a)

    expect(await db.serviceRecords.get(a)).toBeUndefined()
    expect(await db.serviceRecords.get(b)).toBeDefined()
  })
})

describe('listServiceRecords', () => {
  it('returns only the records of the given vehicle, newest first', async () => {
    const car = await addVehicle({ kind: 'car', name: 'Car' })
    const boat = await addVehicle({ kind: 'boat', name: 'Boat' })
    await addServiceRecord({ vehicleId: car, date: '2026-03-08', meter: 42300, task: 'Brakes' })
    await addServiceRecord({ vehicleId: boat, date: '2026-12-31', meter: 1, task: 'Not mine' })
    await addServiceRecord({ vehicleId: car, date: '2026-09-20', meter: 48200, task: 'Oil' })
    await addServiceRecord({ vehicleId: car, date: '2025-11-22', meter: 39000, task: 'Oil (older)' })

    const tasks = (await listServiceRecords(car)).map((r) => r.task)
    expect(tasks).toEqual(['Oil', 'Brakes', 'Oil (older)'])
  })
})
