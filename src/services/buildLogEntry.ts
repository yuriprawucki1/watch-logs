import type { BaseLog } from '@/types/BaseLog'

const protectedGelfFields = new Set([
  'version',
  'host',
  'short_message',
  'full_message',
  'timestamp',
  'level',
  'facility',
  'line',
  'file',
])

export function buildLogEntry(data: BaseLog): Record<string, unknown> {
  const {
    host,
    short_message,
    full_message,
    level,
    additional_fields,
    ...rest
  } = data
  const safeAdditionalFields = Object.fromEntries(
    Object.entries(additional_fields ?? {}).filter(
      ([field]) => !protectedGelfFields.has(field)
    )
  )

  return {
    ...safeAdditionalFields,
    ...rest,
    version: '1.1',
    host,
    short_message,
    full_message,
    level,
  }
}
