import { GraylogError } from '@/utils/GraylogError'

const graylogFieldRegex = /^[A-Za-z_][A-Za-z0-9_.-]*$/

function containsControlCharacter(value: string): boolean {
  return [...value].some((character) => {
    const codePoint = character.charCodeAt(0)
    return codePoint <= 31 || codePoint === 127
  })
}

function escapeGraylogValue(value: string): string {
  if (containsControlCharacter(value)) {
    throw new GraylogError(400, 'Invalid query filter')
  }

  return `"${value.replaceAll('\\', '\\\\').replaceAll('"', '\\"')}"`
}

export function buildGraylogQuery(
  query: string,
  fields?: Record<string, string>
): string {
  if (!fields) {
    return query
  }

  return Object.entries(fields).reduce((finalQuery, [field, value]) => {
    if (!graylogFieldRegex.test(field)) {
      throw new GraylogError(400, 'Invalid query filter')
    }
    return `${finalQuery} AND ${field}:${escapeGraylogValue(value)}`
  }, query)
}
