import Dexie, { type EntityTable } from 'dexie'
import type { ServiceRecord, Vehicle } from './types'

/**
 * Local-first storage: everything lives in the browser's IndexedDB.
 * There is no server; data stays on the owner's device.
 */
export class MaintLogDB extends Dexie {
  vehicles!: EntityTable<Vehicle, 'id'>
  serviceRecords!: EntityTable<ServiceRecord, 'id'>

  constructor(name = 'maintlog') {
    super(name)
    this.version(1).stores({
      // Only indexed fields are listed; other properties are stored as-is.
      vehicles: '++id, kind, name',
      serviceRecords: '++id, vehicleId, date',
    })
  }
}

export const db = new MaintLogDB()
