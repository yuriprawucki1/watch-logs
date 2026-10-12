import { z } from 'zod'

export const traceIdSchema = z
  .number({
    error: (issue: { input?: unknown }) =>
      issue.input === undefined
        ? 'traceId is required.'
        : 'The traceId must be a number.',
  })
  .describe('Unique request identifier.')
  .positive('The traceId must be a positive number.')
  .refine(Number.isInteger, { error: 'The traceId must be an integer.' })
