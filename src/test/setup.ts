// Provides an in-memory IndexedDB so Dexie works under Node/jsdom.
import 'fake-indexeddb/auto'
import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'
import { db } from '../db/db'

afterEach(async () => {
  cleanup()
  // Start every test from an empty database.
  await db.transaction('rw', db.vehicles, db.serviceRecords, async () => {
    await db.serviceRecords.clear()
    await db.vehicles.clear()
  })
})
