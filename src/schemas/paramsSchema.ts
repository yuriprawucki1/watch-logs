import { z } from 'zod'
import { logTypes } from '@/constants/logType'

export const paramsSchema = z.object({
  logType: z
    .enum(logTypes, {
      error: (issue: { input?: unknown }) => {
        if (issue.input === undefined) {
          return 'Endpoint is required'
        }
        if (typeof issue.input !== 'string') {
          return 'The endpoint must be a string'
        }
        return `The endpoint must be one of the following: ${logTypes.join(', ')}`
      },
    })
    .describe('Type of log to be recorded'),
})
