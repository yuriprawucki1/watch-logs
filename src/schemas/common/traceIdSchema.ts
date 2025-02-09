import { z } from 'zod'

export const traceIdSchema = z
  .number({
    message: 'The traceId must be a number.',
    required_error: 'traceId is required.',
    invalid_type_error: 'The traceId must be a number.',
    description: 'Unique request identifier.',
  })
  .positive('The traceId must be a positive number.')
  .int('The traceId must be an integer.')
