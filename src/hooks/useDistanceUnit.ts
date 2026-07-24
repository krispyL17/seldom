import { useUserPreferences } from '@features/preferences'
import {
  formatDistance,
  formatPace,
  parseDistanceUnit,
  distancePresetsForUnit,
  type DistanceUnit,
  unitLongLabel,
  unitShortLabel,
  unitValueFromMeters,
  metersFromUnitValue,
} from '@lib/distanceUnits'

export function useDistanceUnit() {
  const { distanceUnit, updatePreferences } = useUserPreferences()
  const unit = parseDistanceUnit(distanceUnit)

  return {
    unit,
    shortLabel: unitShortLabel(unit),
    longLabel: unitLongLabel(unit),
    presets: distancePresetsForUnit(unit),
    formatDistance: (meters: number) => formatDistance(meters, unit),
    formatPace: (durationSec: number, distanceM: number) => formatPace(durationSec, distanceM, unit),
    metersFromInput: (value: number) => metersFromUnitValue(value, unit),
    inputFromMeters: (meters: number) => unitValueFromMeters(meters, unit),
    setUnit: (next: DistanceUnit) => updatePreferences({ distance_unit: next }),
  }
}
