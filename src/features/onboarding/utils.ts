/** Set a nested value on an object using dot paths (supports numeric array indices). */
export function setNestedValue(target: Record<string, unknown>, path: string, value: unknown): void {
  const parts = path.split('.')
  let current: Record<string, unknown> = target

  for (let i = 0; i < parts.length - 1; i += 1) {
    const part = parts[i]!
    const nextPart = parts[i + 1]!
    const isIndex = /^\d+$/.test(nextPart)

    if (current[part] == null) {
      current[part] = isIndex ? [] : {}
    }

    if (Array.isArray(current[part])) {
      const arr = current[part] as unknown[]
      const index = Number(nextPart)
      if (arr[index] == null || typeof arr[index] !== 'object') {
        arr[index] = {}
      }
      if (i === parts.length - 2) {
        arr[index] = value
        return
      }
      current = arr[index] as Record<string, unknown>
      i += 1
      continue
    }

    current = current[part] as Record<string, unknown>
  }

  const last = parts[parts.length - 1]!
  const parentKey = parts[parts.length - 2]
  if (parentKey != null && Array.isArray(current)) {
    current[Number(last)] = value
    return
  }

  current[last] = value
}

export function getNestedValue(target: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, part) => {
    if (acc == null) return undefined
    if (Array.isArray(acc)) return acc[Number(part)]
    if (typeof acc === 'object') return (acc as Record<string, unknown>)[part]
    return undefined
  }, target)
}

export function parseStepValue(
  raw: string,
  step: {
    optional?: boolean
    type: string
    map?: Record<string, string>
    defaultValue?: string
    field?: string
  },
): unknown | null {
  const trimmed = raw.trim()
  if (!trimmed && step.defaultValue) return step.defaultValue
  if (step.optional && (!trimmed || trimmed.toLowerCase() === 'skip')) return null
  if (!trimmed) return null

  if (step.type === 'choice' && step.map) {
    return step.map[trimmed] ?? trimmed
  }

  if (step.field?.includes('score') || step.field?.includes('squadNumber')) {
    const num = Number(trimmed)
    if (!Number.isNaN(num)) return num
  }

  return trimmed
}

export function answersToObject(steps: Array<{ field: string }>, values: Record<string, string>): Record<string, unknown> {
  const result: Record<string, unknown> = {}

  for (const step of steps) {
    const raw = values[step.field]
    if (raw == null) continue
    setNestedValue(result, step.field, raw)
  }

  return result
}
