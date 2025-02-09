import { z } from 'zod'

export const levelSchema = z
  .number({
    message: 'Level must be a number.',
    required_error: 'Level is required.',
    invalid_type_error: 'Level must be a number.',
    description: 'Message level.',
  })
  .int('Level must be an integer.')
  .min(0, {
    message: 'Level must be at least 0.',
  })
  .max(7, {
    message: 'Level must be at most 7.',
  })
