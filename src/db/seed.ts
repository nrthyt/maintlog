import { db } from './db'
import type { ServiceRecordInput } from './records'
import type { VehicleInput } from './vehicles'

interface SampleVehicle {
  vehicle: VehicleInput
  records: Omit<ServiceRecordInput, 'vehicleId'>[]
}

/**
 * Entirely fictional sample data so a first-time user can see how the app works.
 * Makes and models are invented and do not refer to real products.
 */
export const SAMPLE_DATA: readonly SampleVehicle[] = [
  {
    vehicle: { kind: 'car', name: 'Daily hatchback', make: 'Example Motors', model: 'Hatch 1.5' },
    records: [
      {
        date: '2025-11-22',
        meter: 39000,
        task: 'Engine oil and filter change',
        parts: '4.2 L 0W-20, oil filter',
      },
      {
        date: '2026-03-08',
        meter: 42300,
        task: 'Brake pads replaced (front)',
        parts: 'Front brake pad set',
        notes: 'Rotors measured and kept.',
      },
      {
        date: '2026-06-14',
        meter: 45100,
        task: 'Tire rotation',
        notes: 'Tread depth: front 5 mm, rear 6 mm.',
      },
      {
        date: '2026-09-20',
        meter: 48200,
        task: 'Engine oil and filter change',
        parts: '4.2 L 0W-20, oil filter',
        notes: 'Next oil change around 53,000 km.',
      },
    ],
  },
  {
    vehicle: { kind: 'boat', name: 'Weekend runabout', make: 'Sample Marine', model: 'SR-19' },
    records: [
      {
        date: '2026-04-19',
        meter: 178,
        task: 'Battery replacement',
        parts: 'Deep-cycle battery 80 Ah',
      },
      {
        date: '2026-05-03',
        meter: 180,
        task: 'Antifouling paint',
        parts: 'Antifouling paint 2.5 L, masking tape',
        notes: 'Haul-out at start of season.',
      },
      {
        date: '2026-08-30',
        meter: 212.5,
        task: 'Hull wash and bilge check',
        notes: 'Bilge pump tested OK.',
      },
    ],
  },
  {
    vehicle: { kind: 'outboard', name: 'Stern outboard 60', make: 'Fictional Outboards', model: 'FO-60' },
    records: [
      {
        date: '2026-04-19',
        meter: 178,
        task: 'Water pump impeller replacement',
        parts: 'Impeller kit',
        notes: 'Replaced as part of spring service.',
      },
      {
        date: '2026-04-19',
        meter: 178,
        task: 'Spark plugs replaced',
        parts: 'Spark plugs x4',
      },
      {
        date: '2026-09-06',
        meter: 231,
        task: 'Engine oil change',
        parts: '3 L 10W-30 marine four-stroke oil, oil filter',
      },
      {
        date: '2026-09-06',
        meter: 231,
        task: 'Gear oil change',
        parts: 'Gear oil 0.5 L, drain plug gaskets x2',
      },
    ],
  },
]

/**
 * Inserts the sample data if the database has no vehicles yet.
 * Returns the ids of the inserted vehicles, or an empty array if nothing was inserted.
 */
export async function seedSampleData(): Promise<number[]> {
  return db.transaction('rw', db.vehicles, db.serviceRecords, async () => {
    if ((await db.vehicles.count()) > 0) return []

    const createdAt = new Date().toISOString()
    const ids: number[] = []
    for (const sample of SAMPLE_DATA) {
      const vehicleId = await db.vehicles.add({ ...sample.vehicle, createdAt })
      ids.push(vehicleId)
      await db.serviceRecords.bulkAdd(sample.records.map((r) => ({ ...r, vehicleId, createdAt })))
    }
    return ids
  })
}
