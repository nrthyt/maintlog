/** Kind of equipment being tracked. */
export type VehicleKind = 'car' | 'boat' | 'outboard'

/** How usage is measured: distance for cars, engine hours for marine equipment. */
export type MeterUnit = 'km' | 'hours'

export interface Vehicle {
  /** Auto-incremented primary key, assigned by the database on insert. */
  id: number
  kind: VehicleKind
  name: string
  /** Manufacturer, free text. Optional. */
  make?: string
  /** Model designation, free text. Optional. */
  model?: string
  /** ISO 8601 timestamp of when the vehicle was created. */
  createdAt: string
}

export interface ServiceRecord {
  /** Auto-incremented primary key, assigned by the database on insert. */
  id: number
  vehicleId: number
  /** Calendar date of the service, formatted as YYYY-MM-DD. */
  date: string
  /** Odometer (km) or engine hours at the time of service, depending on the vehicle kind. */
  meter: number
  /** What was done, e.g. "Engine oil change". */
  task: string
  /** Parts and fluids used, free text. Optional. */
  parts?: string
  /** Free-form notes. Optional. */
  notes?: string
  /** ISO 8601 timestamp of when the record was created. */
  createdAt: string
}

export const VEHICLE_KINDS: readonly VehicleKind[] = ['car', 'boat', 'outboard']

/** Cars are measured by distance; boats and outboards by engine hours. */
export function meterUnitFor(kind: VehicleKind): MeterUnit {
  return kind === 'car' ? 'km' : 'hours'
}

export function vehicleKindLabel(kind: VehicleKind): string {
  switch (kind) {
    case 'car':
      return 'Car'
    case 'boat':
      return 'Boat'
    case 'outboard':
      return 'Outboard motor'
  }
}

export function meterUnitLabel(unit: MeterUnit): string {
  return unit === 'km' ? 'km' : 'h'
}

/** Format a meter reading with its unit, e.g. "42,300 km" or "120.5 h". */
export function formatMeter(value: number, unit: MeterUnit): string {
  const digits = unit === 'km' ? 0 : 1
  const formatted = value.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits,
  })
  return `${formatted} ${meterUnitLabel(unit)}`
}
