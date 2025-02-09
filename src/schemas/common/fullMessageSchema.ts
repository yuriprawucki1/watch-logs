import { z } from 'zod'

export const fullMessageSchema = z
  .string({
    message: 'Message must be a string.',
    required_error: 'Message is required.',
    invalid_type_error: 'Message must be a string.',
    description: 'Detailed message.',
  })
  .max(10000, {
    message: 'Message must have a maximum of 10000 characters.',
  })
