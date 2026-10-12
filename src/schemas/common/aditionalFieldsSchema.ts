import { z } from 'zod'

export const aditionalFieldsSchema = z
  .record(z.string(), z.any(), {
    error: 'additional_fields must be an object',
  })
  .describe('additional_fields to be recorded')
  .optional()
