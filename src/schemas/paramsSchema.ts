import { logTypes } from '@/constants/logType'
import { z } from 'zod'

const logTypesValues = logTypes as [string, ...string[]]

export const paramsSchema = z.object({
  logType: z.enum(logTypesValues, {
    message: `The endpoint must be one of the following: ${logTypes.join(', ')}`,
    required_error: 'Endpoint is required',
    invalid_type_error: 'The endpoint must be a string',
    description: 'Type of log to be recorded',
  }),
})
