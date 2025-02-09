import { env } from '@/constants/env'
import type { AvailableLogLevels } from '@/types/AvailableLogLevels'

const DARK_GRAY = '\x1b[90m' // Dark gray text

const ConsoleLogColors: Record<AvailableLogLevels, string> = {
  EMERGENCY: '\x1b[31m', // Red text
  ALERT: '\x1b[33m', // Yellow text
  CRITICAL: '\x1b[31m', // Red text
  ERROR: '\x1b[31m', // Red text
  WARNING: '\x1b[33m', // Yellow text
  NOTICE: '\x1b[34m', // Blue text
  INFO: '\x1b[32m', // Green text
  DEBUG: '\x1b[36m', // Cyan text
} as const

function colorize(color: string, message: string): string {
  return `${color}${message}\x1b[0m`
}

function formatMessage(
  logLevel: AvailableLogLevels,
  timestamp: string,
  data: unknown[]
): string {
  const color = ConsoleLogColors[logLevel]
  const colorizedTimestamp = colorize(DARK_GRAY, `[${timestamp}]`)
  const colorizedLogLevel = colorize(color, logLevel)
  const message = data.join(' ')
  return `${colorizedTimestamp} ${colorizedLogLevel} - ${message}`
}

export function log(logLevel: AvailableLogLevels, ...data: unknown[]): void {
  if (env.NODE_ENV === 'production' && logLevel === 'DEBUG') {
    return
  }
  const timestamp = new Date().toLocaleDateString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    day: '2-digit',
    hour12: false,
    month: '2-digit',
    year: 'numeric',
  })
  const message = formatMessage(logLevel, timestamp, data)
  // biome-ignore lint/suspicious/noConsole: This is a logger utility
  console.log(message)
}
