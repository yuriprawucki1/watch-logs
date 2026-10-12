import type { LogType } from '@/types/LogType'

export const logTypes: readonly [LogType, ...LogType[]] = [
  'erp_homologation',
  'erp_production',
  'system_homologation',
  'system_production',
]
