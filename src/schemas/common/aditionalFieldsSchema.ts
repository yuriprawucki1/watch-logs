import { z } from 'zod'

export const aditionalFieldsSchema = z
  .record(z.any(), {
    message: 'additional_fields must be an object',
    invalid_type_error: 'additional_fields must be an object',
    description: 'additional_fields to be recorded',
  })
  .optional()
