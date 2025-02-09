import { z } from 'zod'

export const hostSchema = z
  .string({
    message: 'The host must be a string.',
    required_error: 'The host is required.',
    invalid_type_error: 'The host must be a string.',
    description: 'The host where the application is located.',
  })
  .max(50, {
    message: 'The host must be at most 50 characters long.',
  })
