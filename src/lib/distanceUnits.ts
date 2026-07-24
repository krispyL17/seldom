import { DISTANCE_PRESETS, MILE_M, type DistancePreset } from '@features/soccer/running/types'

export type DistanceUnit = 'km' | 'mi'

const KM_M = 1000

export function parseDistanceUnit(value: string | null | undefined): DistanceUnit {
  return value === 'km' ? 'km' : 'mi'
}

export function unitShortLabel(unit: DistanceUnit): string {
  return unit === 'km' ? 'km' : 'mi'
}

export function unitLongLabel(unit: DistanceUnit): string {
  return unit === 'km' ? 'kilometers' : 'miles'
}

export function presetDisplayLabel(preset: DistancePreset, unit: DistanceUnit): string {
  if (unit === 'km') {
    if (preset.id === '1mi') return '1.6 km'
    if (preset.id === '2mi') return '3.2 km'
  }
  return preset.label
}

export function distancePresetsForUnit(unit: DistanceUnit): DistancePreset[] {
  return DISTANCE_PRESETS.map((preset) => ({
    ...preset,
    label: presetDisplayLabel(preset, unit),
  }))
}

/** Format stored meters for display using user unit preference. */
export function formatDistance(meters: number, unit: DistanceUnit): string {
  if (Math.abs(meters - MILE_M) < 1) return unit === 'km' ? '1.61 km' : '1 mile'
  if (Math.abs(meters - 5000) < 1) return unit === 'km' ? '5 km' : '3.1 mi'

  if (unit === 'km') {
    const km = meters / KM_M
    if (km >= 10) return `${Math.round(km)} km`
    return `${Math.round(km * 10) / 10} km`
  }

  if (meters >= MILE_M) {
    const miles = meters / MILE_M
    if (miles >= 10) return `${Math.round(miles)} mi`
    return `${Math.round(miles * 10) / 10} mi`
  }

  return `${Math.round(meters)} m`
}

/** Pace string for a run (mm:ss per unit). */
export function formatPace(durationSec: number, distanceM: number, unit: DistanceUnit): string {
  if (distanceM <= 0) return '—'
  const unitM = unit === 'km' ? KM_M : MILE_M
  const secPerUnit = (durationSec / distanceM) * unitM
  const m = Math.floor(secPerUnit / 60)
  const s = Math.round(secPerUnit % 60)
  return `${m}:${String(s).padStart(2, '0')}/${unitShortLabel(unit)}`
}

export function metersFromUnitValue(value: number, unit: DistanceUnit): number {
  return unit === 'km' ? Math.round(value * KM_M * 100) / 100 : Math.round(value * MILE_M * 100) / 100
}

export function unitValueFromMeters(meters: number, unit: DistanceUnit): number {
  return unit === 'km'
    ? Math.round((meters / KM_M) * 100) / 100
    : Math.round((meters / MILE_M) * 100) / 100
}

/** @deprecated Use formatDistance with unit preference */
export function metersToDisplay(m: number, unit: DistanceUnit = 'mi'): string {
  return formatDistance(m, unit)
}

/** @deprecated Use formatPace with unit preference */
export function pacePerUnit(durationSec: number, distanceM: number, unit: DistanceUnit = 'mi'): string {
  return formatPace(durationSec, distanceM, unit)
}
