import { z } from 'zod'

export const shortMessageSchema = z
  .string({
    message: 'The short message must be a string.',
    required_error: 'The short message is required.',
    invalid_type_error: 'The short message must be a string.',
    description: 'Short and objective message.',
  })
  .max(94, {
    message: 'The short message must have a maximum of 94 characters.',
  })
