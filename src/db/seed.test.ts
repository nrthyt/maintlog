import { describe, expect, it } from 'vitest'
import { db } from './db'
import { SAMPLE_DATA, seedSampleData } from './seed'
import { addVehicle } from './vehicles'
import { validateServiceRecord } from './records'
import { validateVehicle } from './vehicles'

describe('SAMPLE_DATA', () => {
  it('contains one car, one boat and one outboard', () => {
    expect(SAMPLE_DATA.map((s) => s.vehicle.kind).sort()).toEqual(['boat', 'car', 'outboard'])
  })

  it('only contains valid vehicles and records', () => {
    for (const sample of SAMPLE_DATA) {
      expect(validateVehicle(sample.vehicle)).toBeNull()
      expect(sample.records.length).toBeGreaterThan(0)
      for (const record of sample.records) {
        expect(validateServiceRecord({ ...record, vehicleId: 1 })).toBeNull()
      }
    }
  })
})

describe('seedSampleData', () => {
  it('inserts all sample vehicles and their records into an empty database', async () => {
    const ids = await seedSampleData()

    expect(ids).toHaveLength(SAMPLE_DATA.length)
    expect(await db.vehicles.count()).toBe(SAMPLE_DATA.length)
    const expectedRecords = SAMPLE_DATA.reduce((n, s) => n + s.records.length, 0)
    expect(await db.serviceRecords.count()).toBe(expectedRecords)

    for (const [i, sample] of SAMPLE_DATA.entries()) {
      const vehicle = await db.vehicles.get(ids[i]!)
      expect(vehicle).toMatchObject(sample.vehicle)
      expect(await db.serviceRecords.where('vehicleId').equals(ids[i]!).count()).toBe(sample.records.length)
    }
  })

  it('does nothing when vehicles already exist', async () => {
    await addVehicle({ kind: 'car', name: 'Existing' })

    const ids = await seedSampleData()

    expect(ids).toEqual([])
    expect(await db.vehicles.count()).toBe(1)
    expect(await db.serviceRecords.count()).toBe(0)
  })

  it('is idempotent when called twice', async () => {
    await seedSampleData()
    await seedSampleData()
    expect(await db.vehicles.count()).toBe(SAMPLE_DATA.length)
  })
})
