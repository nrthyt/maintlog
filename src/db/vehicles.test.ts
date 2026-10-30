import { describe, expect, it } from 'vitest'
import { db } from './db'
import { addVehicle, deleteVehicle, listVehicles, updateVehicle, validateVehicle } from './vehicles'
import { addServiceRecord } from './records'

describe('validateVehicle', () => {
  it('rejects a blank name', () => {
    expect(validateVehicle({ kind: 'car', name: '   ' })).toBe('Name is required.')
  })

  it('accepts a valid vehicle', () => {
    expect(validateVehicle({ kind: 'boat', name: 'Runabout' })).toBeNull()
  })
})

describe('addVehicle', () => {
  it('stores the vehicle and returns its id', async () => {
    const id = await addVehicle({ kind: 'car', name: '  Hatchback  ', make: 'Example Motors', model: '' })
    const stored = await db.vehicles.get(id)
    expect(stored).toMatchObject({ id, kind: 'car', name: 'Hatchback', make: 'Example Motors' })
    expect(stored).not.toHaveProperty('model')
    expect(stored?.createdAt).toBeTruthy()
  })

  it('throws on invalid input', async () => {
    await expect(addVehicle({ kind: 'car', name: '' })).rejects.toThrow('Name is required.')
    expect(await db.vehicles.count()).toBe(0)
  })
})

describe('updateVehicle', () => {
  it('replaces fields and clears emptied optional ones', async () => {
    const id = await addVehicle({ kind: 'car', name: 'Hatchback', make: 'Example Motors', model: 'Hatch 1.5' })
    const before = await db.vehicles.get(id)

    await updateVehicle(id, { kind: 'boat', name: 'Runabout', make: '', model: 'SR-19' })

    const after = await db.vehicles.get(id)
    expect(after).toMatchObject({ id, kind: 'boat', name: 'Runabout', model: 'SR-19' })
    expect(after).not.toHaveProperty('make')
    expect(after?.createdAt).toBe(before?.createdAt)
  })

  it('throws when the vehicle does not exist', async () => {
    await expect(updateVehicle(999, { kind: 'car', name: 'Ghost' })).rejects.toThrow('not found')
  })
})

describe('deleteVehicle', () => {
  it('removes the vehicle and all of its service records', async () => {
    const keep = await addVehicle({ kind: 'car', name: 'Keep' })
    const remove = await addVehicle({ kind: 'outboard', name: 'Remove' })
    await addServiceRecord({ vehicleId: keep, date: '2026-01-10', meter: 1000, task: 'Oil change' })
    await addServiceRecord({ vehicleId: remove, date: '2026-01-11', meter: 10, task: 'Gear oil' })
    await addServiceRecord({ vehicleId: remove, date: '2026-02-11', meter: 20, task: 'Impeller' })

    await deleteVehicle(remove)

    expect(await db.vehicles.get(remove)).toBeUndefined()
    expect(await db.serviceRecords.where('vehicleId').equals(remove).count()).toBe(0)
    expect(await db.vehicles.get(keep)).toBeDefined()
    expect(await db.serviceRecords.where('vehicleId').equals(keep).count()).toBe(1)
  })
})

describe('listVehicles', () => {
  it('returns vehicles sorted by name', async () => {
    await addVehicle({ kind: 'car', name: 'Zulu' })
    await addVehicle({ kind: 'boat', name: 'Alpha' })
    await addVehicle({ kind: 'outboard', name: 'Mike' })

    const names = (await listVehicles()).map((v) => v.name)
    expect(names).toEqual(['Alpha', 'Mike', 'Zulu'])
  })
})
