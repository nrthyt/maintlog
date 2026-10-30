import { describe, expect, it } from 'vitest'
import { formatMeter, meterUnitFor, vehicleKindLabel } from './types'

describe('meterUnitFor', () => {
  it('measures cars in km', () => {
    expect(meterUnitFor('car')).toBe('km')
  })

  it('measures boats and outboards in engine hours', () => {
    expect(meterUnitFor('boat')).toBe('hours')
    expect(meterUnitFor('outboard')).toBe('hours')
  })
})

describe('vehicleKindLabel', () => {
  it('returns a human-readable label for every kind', () => {
    expect(vehicleKindLabel('car')).toBe('Car')
    expect(vehicleKindLabel('boat')).toBe('Boat')
    expect(vehicleKindLabel('outboard')).toBe('Outboard motor')
  })
})

describe('formatMeter', () => {
  it('formats distance as whole km with thousands separators', () => {
    expect(formatMeter(48200, 'km')).toBe('48,200 km')
  })

  it('formats hours with up to one decimal place', () => {
    expect(formatMeter(212.5, 'hours')).toBe('212.5 h')
    expect(formatMeter(178, 'hours')).toBe('178 h')
  })
})
