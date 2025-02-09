import { erpSchema } from '@/schemas/erpSchema'
import { systemSchema } from '@/schemas/systemSchema'
import type { BaseLog } from '@/types/BaseLog'
import type { LogType } from '@/types/LogType'
import type { ZodSchema } from 'zod'

const validate: Record<
  LogType,
  { validateData: ZodSchema; endpoint: string; input: string }
> = {
  erp_homologation: {
    validateData: erpSchema,
    endpoint: '12201',
    // biome-ignore lint/nursery/noSecrets: Hashes are not secrets
    input: 'gl2_source_input:67655ddc1c819a6488105bbb',
  },
  erp_production: {
    validateData: erpSchema,
    endpoint: '12202',
    // biome-ignore lint/nursery/noSecrets: Hashes are not secrets
    input: 'gl2_source_input:67655e2b1c819a6488105be7',
  },
  system_homologation: {
    validateData: systemSchema,
    endpoint: '12203',
    // biome-ignore lint/nursery/noSecrets: Hashes are not secrets
    input: 'gl2_source_input:67655e851c819a6488105c25',
  },
  system_production: {
    validateData: systemSchema,
    endpoint: '12204',
    // biome-ignore lint/nursery/noSecrets: Hashes are not secrets
    input: 'gl2_source_input:67655eaf1c819a6488105c3e',
  },
}

export function getLogTypeConfig(
  logType: LogType,
  body: object,
  returnInputOnly = false
): { validateData?: BaseLog; endpoint?: string; input?: string } {
  const logConfig = validate[logType]
  if (returnInputOnly) {
    return { input: logConfig.input }
  }
  const validateData: BaseLog = logConfig.validateData.parse(body)
  const endpoint: string = logConfig.endpoint
  return { validateData, endpoint }
}
